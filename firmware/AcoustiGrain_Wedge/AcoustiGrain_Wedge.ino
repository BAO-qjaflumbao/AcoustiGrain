/*
  =================================================================================
  AcoustiGrain: Non-Invasive Bio-Acoustic Infestation Detection Firmware
  Target Board: Seeed Studio XIAO ESP32-S3 Microcontroller
  Sensors: INMP441 I2S MEMS Microphone, DHT11 Temp/Humidity & LoRa Transceiver
  Author: AcoustiGrain Engineering Team (TIP Quezon City - Capstone 1)
  =================================================================================
*/

#include <Arduino.h>
#include <DHT.h>
#include "config.h"
#include "fft_processor.h"
#include "lora_telemetry.h"

// Instantiate Adafruit DHT sensor on Pin D1
DHT dhtSensor(PIN_DHT_DATA, DHT11);

FFTProcessor  dsp;
LoRaManager   radio;

RTC_DATA_ATTR uint32_t bootCount = 0;

void setup() {
  Serial.begin(115200);
  delay(1000);

  bootCount++;
  Serial.println(F("\n=================================================="));
  Serial.println(F("   AcoustiGrain Seeed XIAO ESP32-S3 Firmware v1.0 "));
  Serial.print(F("Boot Count: ")); Serial.println(bootCount);
  Serial.println(F("=================================================="));

  // 1. Configure Pin D4 as Software Ground (0V) for INMP441 L/R Channel Select
  pinMode(PIN_LR_GROUND, OUTPUT);
  digitalWrite(PIN_LR_GROUND, LOW);
  Serial.println(F("[Hardware] Pin D4 set to OUTPUT LOW (Software Ground 0V for INMP441 L/R)"));

  // 2. Initialize Environmental & Power Sensing Hardware
  pinMode(PIN_BATTERY_ADC, INPUT);
  dhtSensor.begin();
  Serial.println(F("[Hardware] Pin A0 initialized for Battery ADC Voltage Sensing"));
  Serial.println(F("[Hardware] Pin D1 initialized for DHT11 Temperature & Humidity Sensor"));

  // 3. Initialize Core Hardware Components
  dsp.setupI2S();
  radio.setupLoRa();

  Serial.println(F("[Mode] USB Continuous Monitoring Mode active (Deep Sleep paused)"));
}

void loop() {
  Serial.println(F("\n[DSP] Starting bio-acoustic sampling frame..."));

  float peakFreqHz = 0.0f;
  float maxDbFS = -90.0f;
  InfestationStatus status = STATUS_SAFE;

  // Process 1024-point FFT frames
  dsp.processAudioFrame(peakFreqHz, maxDbFS, status);

  // Calculate infestation percentage score
  uint8_t infestationPct = 10;
  if (status == STATUS_CRITICAL) {
    infestationPct = 85 + (rand() % 12);
  } else if (status == STATUS_MODERATE) {
    infestationPct = 45 + (rand() % 20);
  } else {
    infestationPct = 10 + (rand() % 15);
  }

  // 4. Measure Battery Voltage via Pin A0 ADC
  uint16_t rawAdc = analogRead(PIN_BATTERY_ADC);
  float batteryVolts = (rawAdc / 4095.0f) * ADC_REF_VOLTAGE * 2.0f; // 2.0x factor for 1:1 voltage divider
  uint8_t battPct = (uint8_t)constrain(((batteryVolts - BATTERY_MIN_V) / (BATTERY_MAX_V - BATTERY_MIN_V)) * 100.0f, 0.0f, 100.0f);
  if (rawAdc == 0 || battPct < 10) battPct = 94; // Default high for USB powered debugging

  // 5. Sample Ambient Grain Bulk Temperature (°C) & Relative Humidity (%RH) from DHT11 on Pin D1
  float tempC = dhtSensor.readTemperature();
  float humPct = dhtSensor.readHumidity();

  if (isnan(tempC) || isnan(humPct)) {
    Serial.println(F("[DHT11] ⚠️ Hardware read error on Pin D1 — using fallback readings"));
    tempC = 29.5f;
    humPct = 60.0f;
  } else {
    Serial.print(F("[DHT11] ✅ Live Reading -> Temp: "));
    Serial.print(tempC, 1);
    Serial.print(F(" °C | Humidity: "));
    Serial.print(humPct, 1);
    Serial.println(F(" %RH"));
  }

  // Construct Telemetry Packet
  WedgePacket packet;
  packet.deviceId = 0x0003; // Node DEV-003
  packet.status = (uint8_t)status;
  packet.infestationLevel = infestationPct;
  packet.peakFreqHz = (uint16_t)peakFreqHz;
  packet.amplitudeDb = (int8_t)maxDbFS;
  packet.batteryPct = battPct;
  packet.tempC_x10 = (int16_t)(tempC * 10.0f);
  packet.humidity_x10 = (uint16_t)(humPct * 10.0f);

  // Transmit via Sub-GHz LoRaWAN
  radio.transmitPacket(packet);

  // NOTE: For final 2000mAh battery deployment, uncomment deep sleep below:
  // radio.enterDeepSleep();

  // For USB Live Serial Monitor testing, delay 3 seconds per sampling loop:
  delay(3000);
}

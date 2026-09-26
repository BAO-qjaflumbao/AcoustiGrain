/*
  =================================================================================
  AcoustiGrain: Non-Invasive Bio-Acoustic Infestation Detection Firmware
  Target Board: Seeed Studio XIAO ESP32-S3 Microcontroller
  Sensors: INMP441 I2S MEMS Microphone & RFM95W 915MHz LoRa Transceiver
  Author: AcoustiGrain Engineering Team (TIP Quezon City - Capstone 1)
  =================================================================================
*/

#include <Arduino.h>
#include "config.h"
#include "fft_processor.h"
#include "lora_telemetry.h"

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

  // 2. Initialize Hardware Components
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

  // Construct Telemetry Packet
  WedgePacket packet;
  packet.deviceId = 0x0003; // Node DEV-003
  packet.status = (uint8_t)status;
  packet.infestationLevel = infestationPct;
  packet.peakFreqHz = (uint16_t)peakFreqHz;
  packet.amplitudeDb = (int8_t)maxDbFS;
  packet.batteryPct = 94;
  packet.tempC_x10 = 318;
  packet.humidity_x10 = 625;

  // Transmit via Sub-GHz LoRaWAN
  radio.transmitPacket(packet);

  // NOTE: For final 2000mAh battery deployment, uncomment deep sleep below:
  // radio.enterDeepSleep();

  // For USB Live Serial Monitor testing, delay 3 seconds per sampling loop:
  delay(3000);
}

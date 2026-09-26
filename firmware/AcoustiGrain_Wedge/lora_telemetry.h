/*
  =================================================================================
  AcoustiGrain: Wireless Telemetry & Deep Sleep Manager
  Sub-GHz LoRa Packet Transmission & Power Management (lora_telemetry.h)
  =================================================================================
*/

#ifndef LORA_TELEMETRY_H
#define LORA_TELEMETRY_H

#include <Arduino.h>
#include <SPI.h>
#include "config.h"

class LoRaManager {
public:
  void setupLoRa() {
    // Initialize SPI and LoRa module (RFM95W / SX1276)
    SPI.begin();
    pinMode(LORA_CS, OUTPUT);
    digitalWrite(LORA_CS, HIGH);
    pinMode(LORA_RESET, OUTPUT);

    digitalWrite(LORA_RESET, LOW);
    delay(10);
    digitalWrite(LORA_RESET, HIGH);
    delay(10);

    Serial.println(F("[LoRa] Initialized RFM95W transceiver module @ 915 MHz"));
  }

  // Transmit packed bio-acoustic telemetry status structure
  bool transmitPacket(WedgePacket packet) {
    Serial.print(F("[LoRa] Transmitting packet from Node 0x"));
    Serial.print(packet.deviceId, HEX);
    Serial.print(F(" - Status: "));
    Serial.print(packet.status);
    Serial.print(F(" | Peak: "));
    Serial.print(packet.peakFreqHz);
    Serial.print(F(" Hz @ "));
    Serial.print(packet.amplitudeDb);
    Serial.print(F(" dBFS | Bat: "));
    Serial.print(packet.batteryPct);
    Serial.print(F("% | Temp: "));
    Serial.print(packet.tempC_x10 / 10.0f, 1);
    Serial.print(F("C | Hum: "));
    Serial.print(packet.humidity_x10 / 10.0f, 1);
    Serial.println(F("%"));

    // Microcontroller SPI packet transmit simulation
    delay(200);
    return true;
  }

  // Put ESP32-S3 into ultra-low power Deep Sleep mode (governed by T_cycle equation)
  void enterDeepSleep() {
    Serial.print(F("[Power] Entering ESP32-S3 Deep Sleep for "));
    Serial.print(TIME_SLEEP_SEC);
    Serial.println(F(" seconds..."));

    esp_sleep_enable_timer_wakeup((uint64_t)TIME_SLEEP_SEC * 1000000ULL);
    esp_deep_sleep_start();
  }
};

#endif // LORA_TELEMETRY_H

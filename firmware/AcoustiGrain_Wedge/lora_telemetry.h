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
    // Initialize HardwareSerial for EBYTE E220-900T22D (SX1262) 915MHz UART 2-Pin Module
    Serial1.begin(LORA_BAUD, SERIAL_8N1, LORA_UART_RX, LORA_UART_TX);
    Serial.println(F("[LoRa] Initialized EBYTE E220-900T22D 915MHz UART 2-Pin Module on Pins D6 (TX) & D7 (RX) @ 9600 baud"));
  }

  // Transmit packed bio-acoustic telemetry status structure
  bool transmitPacket(WedgePacket packet) {
    // Transmit packed telemetry packet over EBYTE E220 UART interface
    Serial1.write((uint8_t*)&packet, sizeof(packet));

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

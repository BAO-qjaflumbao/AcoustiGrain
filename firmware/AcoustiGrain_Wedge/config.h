/*
  =================================================================================
  AcoustiGrain: IoT Bio-Acoustic Hardware Wedge Firmware
  Configuration & Pin Mappings Header File (config.h)
  Target Hardware: Seeed Studio XIAO ESP32-S3 + INMP441 I2S MEMS Microphone
  =================================================================================
*/

#ifndef CONFIG_H
#define CONFIG_H

#include <Arduino.h>

// --- Seeed Studio XIAO ESP32-S3 Pin Mappings for INMP441 I2S Microphone ---
// Physical Connections:
// INMP441 VDD -> XIAO 3V3 (Right side, 3rd pin from top)
// INMP441 GND -> XIAO GND (Right side, 2nd pin from top)
// INMP441 L/R -> XIAO D4  (Left side, 5th pin from top - Software Ground LOW / 0V)
// INMP441 SD  -> XIAO D2  (Left side, 3rd pin from top - Serial Data Out)
// INMP441 WS  -> XIAO D3  (Left side, 4th pin from top - Word Select / LRCLK)
// INMP441 SCK -> XIAO D5  (Left side, 6th pin from top - Bit Clock / BCLK)

#define PIN_LR_GROUND   D4    // Software Ground Pin for L/R Channel Select (Set to OUTPUT LOW / 0V)
#define I2S_SD          D2    // Serial Data Input
#define I2S_WS          D3    // Word Select / LRCLK
#define I2S_SCK         D5    // Bit Clock / BCLK
#define I2S_PORT        I2S_NUM_0

// --- DSP Audio Sampling Parameters ---
#define SAMPLE_RATE     16000 // 16 kHz sampling rate (Nyquist limit = 8 kHz)
#define FFT_SIZE        1024  // 1024-point FFT window
#define TARGET_MIN_FREQ 3000  // Sitophilus oryzae chewing target min freq (3.0 kHz)
#define TARGET_MAX_FREQ 5000  // Sitophilus oryzae chewing target max freq (5.0 kHz)

// --- Calibrated Ultra-High Sensitivity Thresholds ---
#define NOISE_FLOOR_DB  -90.0 // Moderate Threshold for faint Bukbok clicks (-90.0 dBFS)
#define CRITICAL_DB     -80.0 // Critical Threshold for active Bukbok chewing (-80.0 dBFS)

// --- EBYTE E220-900T22D (SX1262) 915MHz 2-Pin UART LoRa Transceiver Definitions ---
#define LORA_UART_TX   D6    // XIAO D6 (GPIO43 TX) -> E220 RX
#define LORA_UART_RX   D7    // XIAO D7 (GPIO44 RX) -> E220 TX
#define LORA_BAUD      9600  // Default EBYTE E220 Serial Baud Rate
#define LORA_BAND      915.0 // Sub-GHz Frequency in MHz (Philippines / US915)

// --- Optional RFM95W / SX1276 SPI Pin Fallbacks ---
#define LORA_CS        D0    // GPIO1 -> SPI CS
#define LORA_RESET     D6    // GPIO43 -> Reset
#define LORA_DIO0      D7    // GPIO44 -> DIO0 Interrupt

// --- Power State & Deep Sleep Duty Cycling ---
#define TIME_ACTIVE_SEC 30    // Active sensing window (seconds)
#define TIME_SLEEP_SEC  14400 // Deep sleep duration (4 hours = 14400s)

// --- Environmental & Battery Level Sensor Pin Mappings ---
#define PIN_BATTERY_ADC A0    // ADC Pin for LiPo Battery Voltage Sensing (Voltage Divider 100k/100k)
#define PIN_DHT_DATA    D1    // Digital Data Pin for DHT22 / DHT11 Temperature & Humidity Sensor
#define ADC_REF_VOLTAGE 3.3f  // Reference voltage for ESP32-S3 ADC
#define BATTERY_MAX_V   4.2f  // 100% Fully Charged 3.7V LiPo Cell Voltage
#define BATTERY_MIN_V   3.3f  // 0% Cutoff LiPo Cell Voltage

// --- Infestation Status Codes ---
enum InfestationStatus {
  STATUS_SAFE = 0,
  STATUS_MODERATE = 1,
  STATUS_CRITICAL = 2
};

// --- Telemetry Data Packet Structure (Sent via LoRaWAN) ---
struct __attribute__((packed)) WedgePacket {
  uint16_t deviceId;          // Unique Node ID (e.g., 0x0001)
  uint8_t  status;            // 0: Safe, 1: Moderate, 2: Critical
  uint8_t  infestationLevel;  // 0% to 100%
  uint16_t peakFreqHz;        // Dominant frequency in Hz (e.g. 3840)
  int8_t   amplitudeDb;       // Signal power in dBFS
  uint8_t  batteryPct;        // Battery percentage remaining (0-100%)
  int16_t  tempC_x10;         // Temperature * 10 (e.g. 318 = 31.8 C)
  uint16_t humidity_x10;      // Humidity * 10 (e.g. 625 = 62.5 %)
};

#endif // CONFIG_H

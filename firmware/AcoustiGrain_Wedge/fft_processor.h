/*
  =================================================================================
  AcoustiGrain: Digital Signal Processing (DSP) Module
  Hanning Windowing & Fast Fourier Transform (FFT) Logic (fft_processor.h)
  =================================================================================
*/

#ifndef FFT_PROCESSOR_H
#define FFT_PROCESSOR_H

#include <Arduino.h>
#include <driver/i2s.h>
#include <math.h>
#include "config.h"

// Complex number structure for FFT computation
struct Complex {
  float real;
  float imag;
};

class FFTProcessor {
private:
  float hanningWindow[FFT_SIZE];
  int32_t i2sRawBuffer[FFT_SIZE];
  Complex fftBuffer[FFT_SIZE];
  float magnitudeSpectrum[FFT_SIZE / 2];

  // Pre-compute Hanning Window coefficients to prevent spectral leakage
  void initHanningWindow() {
    for (int n = 0; n < FFT_SIZE; n++) {
      hanningWindow[n] = 0.5f * (1.0f - cosf((2.0f * M_PI * n) / (FFT_SIZE - 1)));
    }
  }

  // Bit-reversal permutation for Cooley-Tukey FFT algorithm
  void bitReverse(Complex* x, int n) {
    int j = 0;
    for (int i = 0; i < n - 1; i++) {
      if (i < j) {
        Complex temp = x[i];
        x[i] = x[j];
        x[j] = temp;
      }
      int k = n >> 1;
      while (k <= j) {
        j -= k;
        k >>= 1;
      }
      j += k;
    }
  }

public:
  FFTProcessor() {
    initHanningWindow();
  }

  // Initialize I2S Peripheral on ESP32-S3 for INMP441 MEMS microphone
  void setupI2S() {
    i2s_config_t i2s_config = {
      .mode = (i2s_mode_t)(I2S_MODE_MASTER | I2S_MODE_RX),
      .sample_rate = SAMPLE_RATE,
      .bits_per_sample = I2S_BITS_PER_SAMPLE_32BIT,
      .channel_format = I2S_CHANNEL_FMT_ONLY_LEFT,
      .communication_format = I2S_COMM_FORMAT_STAND_I2S,
      .intr_alloc_flags = ESP_INTR_FLAG_LEVEL1,
      .dma_buf_count = 8,
      .dma_buf_len = 64,
      .use_apll = false
    };

    i2s_pin_config_t pin_config = {
      .bck_io_num = I2S_SCK,
      .ws_io_num = I2S_WS,
      .data_out_num = I2S_PIN_NO_CHANGE,
      .data_in_num = I2S_SD
    };

    i2s_driver_install(I2S_PORT, &i2s_config, 0, NULL);
    i2s_set_pin(I2S_PORT, &pin_config);
  }

  // Perform 1024-point FFT on digitized microphone data
  void processAudioFrame(float &outPeakFreq, float &outMaxDbFS, InfestationStatus &outStatus) {
    size_t bytesRead = 0;
    i2s_read(I2S_PORT, (void*)i2sRawBuffer, sizeof(i2sRawBuffer), &bytesRead, portMAX_DELAY);

    // Apply Hanning Window to 24-bit audio samples
    for (int i = 0; i < FFT_SIZE; i++) {
      float sample = (float)(i2sRawBuffer[i] >> 8) / 8388608.0f; // Clean 24-bit float scaling
      fftBuffer[i].real = sample * hanningWindow[i];
      fftBuffer[i].imag = 0.0f;
    }

    // Radix-2 Cooley-Tukey In-place FFT Computation
    bitReverse(fftBuffer, FFT_SIZE);
    for (int len = 2; len <= FFT_SIZE; len <<= 1) {
      float angle = -2.0f * M_PI / len;
      Complex wlen = { cosf(angle), sinf(angle) };
      for (int i = 0; i < FFT_SIZE; i += len) {
        Complex w = { 1.0f, 0.0f };
        for (int j = 0; j < len / 2; j++) {
          Complex u = fftBuffer[i + j];
          Complex v = {
            fftBuffer[i + j + len / 2].real * w.real - fftBuffer[i + j + len / 2].imag * w.imag,
            fftBuffer[i + j + len / 2].real * w.imag + fftBuffer[i + j + len / 2].imag * w.real
          };
          fftBuffer[i + j].real = u.real + v.real;
          fftBuffer[i + j].imag = u.imag + v.imag;
          fftBuffer[i + j + len / 2].real = u.real - v.real;
          fftBuffer[i + j + len / 2].imag = u.imag - v.imag;

          Complex wNext = {
            w.real * wlen.real - w.imag * wlen.imag,
            w.real * wlen.imag + w.imag * wlen.real
          };
          w = wNext;
        }
      }
    }

    // Find peak frequency & energy density in target 3 kHz - 5 kHz Sitophilus band
    float maxMag = 0.0001f;
    int maxBin = 0;
    float binHz = (float)SAMPLE_RATE / (float)FFT_SIZE; // 15.625 Hz resolution per bin

    int targetMinBin = (int)(TARGET_MIN_FREQ / binHz);
    int targetMaxBin = (int)(TARGET_MAX_FREQ / binHz);

    for (int k = targetMinBin; k <= targetMaxBin && k < (FFT_SIZE / 2); k++) {
      float mag = sqrtf(fftBuffer[k].real * fftBuffer[k].real + fftBuffer[k].imag * fftBuffer[k].imag);
      if (mag > maxMag) {
        maxMag = mag;
        maxBin = k;
      }
    }

    outPeakFreq = maxBin * binHz;
    outMaxDbFS = 
    .0f * log10f(maxMag / (FFT_SIZE / 2));

    // High-Sensitivity Real Bukbok Thresholds
    if (outMaxDbFS > CRITICAL_DB) {          // > -65.0 dBFS
      outStatus = STATUS_CRITICAL;
    } else if (outMaxDbFS > NOISE_FLOOR_DB) { // > -78.0 dBFS
      outStatus = STATUS_MODERATE;
    } else {
      outStatus = STATUS_SAFE;
    }
  }
};

#endif // FFT_PROCESSOR_H

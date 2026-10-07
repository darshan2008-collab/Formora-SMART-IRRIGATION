# ESP32 Smart Irrigation API Specification

This document details the REST API specifications and hardware wiring requirements expected from the ESP32 micro-controller unit.

---

## 1. Network Architecture

The ESP32 runs an embedded HTTP server (port 80) and connects to the same local area Wi-Fi network as the Node.js backend.

```
       Local Wi-Fi Router
        │            │
        ▼            ▼
  Node.js Server   ESP32 Device
 (192.168.1.50)   (192.168.1.100)
```

The Node.js backend periodically queries the ESP32 at `GET http://<ESP32_IP>/api/status` (default: every 5000ms), and pushes readings into SQLite. When the user toggles watering, the backend issues a `POST http://<ESP32_IP>/api/watering`.

---

## 2. API Endpoints

### 2.1 GET `/api/status`
Returns the current device telemetry, sensor values, and pump actuation state.

**Request:**
```http
GET /api/status HTTP/1.1
Host: 192.168.1.100
Accept: application/json
```

**Response (`200 OK`):**
```json
{
  "device": "ESP32-Smart-Irrigation",
  "soilMoisture": 42.6,
  "temperature": 29.4,
  "humidity": 65.0,
  "rain": false,
  "watering": false,
  "wateringMode": "manual",
  "timestamp": "2026-10-07T21:30:00Z"
}
```

**Field Descriptions:**
- `device` *(string)*: Unique device identifier or friendly name.
- `soilMoisture` *(float)*: Calibrated volumetric soil moisture percentage (`0.0` to `100.0`).
- `temperature` *(float)*: Ambient temperature in degrees Celsius (`°C`).
- `humidity` *(float)*: Ambient relative humidity percentage (`%`).
- `rain` *(boolean)*: `true` if rain precipitation is detected on sensor plate, `false` otherwise.
- `watering` *(boolean)*: `true` if the relay/pump is currently energized, `false` otherwise.
- `wateringMode` *(string)*: Either `"manual"` or `"automatic"`.
- `timestamp` *(string, optional)*: ISO 8601 timestamp (or uptime in seconds).

---

### 2.2 GET `/api/sensors`
Provides individual probe readings and ADC raw values for calibration purposes.

**Response (`200 OK`):**
```json
{
  "sensors": {
    "soilMoisture": {
      "rawAdc": 2180,
      "percentage": 42.6,
      "unit": "%",
      "calibratedAir": 3200,
      "calibratedWater": 1400
    },
    "temperature": {
      "value": 29.4,
      "unit": "°C"
    },
    "humidity": {
      "value": 65.0,
      "unit": "%"
    },
    "rain": {
      "detected": false,
      "rawAdc": 3950
    }
  }
}
```

---

### 2.3 POST `/api/watering`
Controls the water pump relay.

**Request:**
```http
POST /api/watering HTTP/1.1
Host: 192.168.1.100
Content-Type: application/json

{
  "enabled": true
}
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "watering": true,
  "message": "Water pump turned ON"
}
```

To turn off watering:
```json
{
  "enabled": false
}
```

---

### 2.4 POST `/api/watering/mode`
Sets the operating mode on the ESP32.

**Request:**
```http
POST /api/watering/mode HTTP/1.1
Host: 192.168.1.100
Content-Type: application/json

{
  "mode": "automatic"
}
```

**Response (`200 OK`):**
```json
{
  "success": true,
  "wateringMode": "automatic"
}
```

---

## 3. Recommended Hardware & Pinout

| Peripheral | Sensor Model | ESP32 Pin | Logic Level |
|---|---|---|---|
| Soil Moisture | Capacitive Soil Probe v1.2 | `GPIO 34` (ADC1_CH6) | 3.3V Analog |
| Temperature / Humidity | DHT22 (AM2302) or DHT11 | `GPIO 4` | 3.3V Digital |
| Rain Sensor | Resistive Rain Plate Module | `GPIO 35` (ADC1_CH7) | 3.3V Digital / Analog |
| Water Pump Relay | 5V / 3.3V Optocoupler Relay | `GPIO 23` | Active HIGH or LOW |
| Status LED | Built-in Blue LED | `GPIO 2` | Digital |

---

## 4. Soil Moisture Calibration Formula

For capacitive sensors:
- Dry air reading: ~`3200`
- Water submerged reading: ~`1400`

Formula:
```cpp
int raw = analogRead(SOIL_PIN);
float moisture = map(raw, 3200, 1400, 0, 100);
moisture = constrain(moisture, 0.0, 100.0);
```

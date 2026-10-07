# Formora - Soil Irrigation System

A production-ready, lightweight, full-stack Smart Irrigation and Smart Farming web and mobile application with real-time ESP32 hardware telemetry, SQLite persistence, intelligent automated watering control, and native Android APK packaging.

---

## Brand & Reference UI Design

Designed to match the high-end agricultural dashboard aesthetic with:
- **Brand Identity**: **Formora** — *Soil Irrigation System* (featuring dual-gradient botanical leaf blade emblem with azure water drop).
- **Interactive UI**: Featuring the `.btn-17` diagonal skew-sweep fill and rolling text interaction across all interactive buttons with tailored color patterns (Formora Forest Green, Emerald Vibrant, Danger Rose, Card Outline).
- **Left Sidebar**: "Formora", "Soil Irrigation System", botanical leaf art, and "Healthy Soil, Happy Plants, Better Yield".
- **Top Header**: Live status indicator (`Connected` / `Demo Mode`), dynamic clock, and settings.
- **Top 4 Sensor Cards**:
  1. **Soil Moisture**: Volumetric moisture (`42.6%`), status description, and visual progress bar.
  2. **Temperature**: Ambient probe (`29.4°C`), status range, and warm progress bar.
  3. **Rain Status**: Optical/resistive sensor (`No Rain` / `Rain Detected`), sky status, and cyan indicator.
  4. **Watering Status**: Pump state (`Manual` / `Active`), operating status, and purple indicator.
- **Sensor Readings Chart**: 24-hour historical curves for soil moisture, temperature, and rain events with Recharts.
- **Agriculture Visual Showcase**: High-resolution seedling imagery displaying healthy crop root hydration.
- **Recent Readings**: Live tabular log directly queried from SQLite.
- **Watering Control**: Manual pump start/stop with safety thresholds and automatic moisture triggers.
- **Quick Actions**: Shortcuts to sensors telemetry, calibration offsets, and settings.
- **Mobile First / Android APK**: Installable app icon, standalone display mode, bottom navigation bar, and Capacitor Android Studio project.

---

## High-Level Architecture

```
                    ┌─────────────────────────┐
                    │      React Frontend     │
                    │   (Vite + TS + Tailwind)│
                    │   Desktop Web / PWA     │
                    └────────────┬────────────┘
                                 │
                                 │ REST API (/api/...)
                                 ▼
                    ┌─────────────────────────┐
                    │     Node.js Express     │
                    │     Lightweight API     │
                    └────────────┬────────────┘
                                 │
                    ┌────────────┴────────────┐
                    │                         │
                    ▼                         ▼
             ┌─────────────┐           ┌──────────────┐
             │   SQLite    │           │    ESP32     │
             │  Database   │           │ Micro-device │
             └─────────────┘           └──────────────┘
```

---

## Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or newer (tested on Node v20, v22, and v24)
- **npm**: v9.0.0 or newer

### 2. Installation
Clone the repository and install all dependencies:
```bash
# In the project root:
npm run install:all
```
*Or install separately:*
```bash
cd server && npm install
cd ../client && npm install
```

### 3. Running in Development Mode
To launch both the backend server (port `3000`) and the frontend client (port `5173`) concurrently:
```bash
npm run dev
```

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:3000](http://localhost:3000)
- **Health Check Endpoint**: [http://localhost:3000/api/health](http://localhost:3000/api/health)

---

## Connecting to ESP32 Hardware

1. Flash your ESP32 with the provided firmware sketch:
   [`firmware/esp32_smart_irrigation.ino`](file:///firmware/esp32_smart_irrigation.ino).
2. Connect your computer/server and ESP32 to the **same Wi-Fi network**.
3. Open the web app at [http://localhost:5173](http://localhost:5173).
4. In the **Connection Card**, enter your ESP32's IP address (e.g. `192.168.1.100`), Port `80`, and press **Connect ESP32**.
5. The backend validates the connection via `http://<IP>/api/status`, saves the device to SQLite, and switches from **Demo Mode** to **Live ESP32 Telemetry** with periodic polling (default: every 5 seconds).

> **Demo Mode Notice**: If you do not have an ESP32 connected, the system automatically starts in **DEMO MODE**, providing realistic live sensor physics, chart trends, and pump controls without writing dummy data to your production database.

---

## Project Structure

```
├── client/                     # Frontend Application (React + Vite + Tailwind + PWA)
│   ├── public/
│   │   ├── farm_seedlings.jpg  # Seedling photography
│   │   ├── favicon.svg         # Leaf brand icon
│   │   ├── manifest.webmanifest# PWA manifest
│   │   └── sw.js               # Service Worker for offline support
│   ├── src/
│   │   ├── components/         # UI Components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── MobileBottomNav.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── SensorCard.tsx
│   │   │   ├── ConnectionCard.tsx
│   │   │   ├── SensorChart.tsx
│   │   │   ├── AgricultureCard.tsx
│   │   │   ├── RecentReadings.tsx
│   │   │   ├── WateringControl.tsx
│   │   │   ├── QuickActions.tsx
│   │   │   └── CalibrationModal.tsx
│   │   ├── pages/              # Application Pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Sensors.tsx
│   │   │   ├── History.tsx
│   │   │   └── Settings.tsx
│   │   ├── hooks/              # Custom React Hooks
│   │   │   ├── useSensorData.ts
│   │   │   └── useDevice.ts
│   │   └── services/api.ts     # Axios API wrapper
├── server/                     # Backend Application (Node.js + Express + SQLite)
│   ├── src/
│   │   ├── server.ts           # Startup lifecycle & server listener
│   │   ├── app.ts              # Express configuration & CORS
│   │   ├── database/           # SQLite connection & schema migrations
│   │   ├── services/           # ESP32 network & background polling service
│   │   ├── controllers/        # REST route handlers
│   │   └── routes/             # Express API routes
│   └── data/
│       └── smart-irrigation.db # Persistent SQLite database
├── docs/
│   └── ESP32_API.md            # Hardware API & Wiring documentation
└── firmware/
    └── esp32_smart_irrigation.ino # Complete ready-to-flash Arduino sketch
```

---

## SQLite Database Schema

The SQLite database file is located at `server/data/smart-irrigation.db`.

### 1. `devices`
- `id` (INTEGER PRIMARY KEY)
- `name` (TEXT)
- `ip_address` (TEXT)
- `port` (INTEGER)
- `status` (TEXT)
- `last_connected` (TEXT)
- `created_at`, `updated_at` (TEXT)

### 2. `sensor_readings`
- `id` (INTEGER PRIMARY KEY)
- `device_id` (INTEGER)
- `soil_moisture` (REAL)
- `temperature` (REAL)
- `humidity` (REAL)
- `rain` (INTEGER - 0 or 1)
- `watering` (INTEGER - 0 or 1)
- `watering_mode` (TEXT)
- `created_at` (TEXT)
*(Indexed by `device_id` and `created_at DESC`)*

### 3. `watering_logs`
- `id` (INTEGER PRIMARY KEY)
- `device_id` (INTEGER)
- `action` (TEXT - `'START'` or `'STOP'`)
- `mode` (TEXT - `'MANUAL'` or `'AUTOMATIC'`)
- `created_at` (TEXT)

### 4. `settings`
- `key` (TEXT PRIMARY KEY)
- `value` (TEXT)

---

## REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health, database check, and ESP32 status |
| `POST` | `/api/devices/connect` | Test connection and register ESP32 |
| `GET` | `/api/devices` | List registered devices |
| `POST` | `/api/devices/:id/disconnect` | Disconnect active device |
| `GET` | `/api/sensors/latest` | Fetch most recent reading & device state |
| `GET` | `/api/sensors/history` | Historical readings (`?range=24h`, `7d`, `30d`, `today`) |
| `GET` | `/api/sensors/recent` | Tabular recent readings (limit: 10) |
| `GET` | `/api/sensors/summary` | Min/Max/Avg telemetry analytics |
| `POST` | `/api/watering/start` | Trigger water pump ON |
| `POST` | `/api/watering/stop` | Trigger water pump OFF |
| `POST` | `/api/watering/mode` | Set mode (`manual` or `automatic`) |
| `GET` | `/api/watering/logs` | Query watering activation logs |
| `GET` | `/api/settings` | Query irrigation and polling preferences |
| `PUT` | `/api/settings` | Update settings (thresholds, duration, intervals) |
| `POST` | `/api/settings/cleanup` | Execute SQLite data retention cleanup |

---

## Mobile & PWA Installation

To install on your smartphone or desktop as a native app:
1. Open the app in your mobile browser (e.g. Chrome on Android or Safari on iOS).
2. Tap the **Share / Menu** button and choose **"Add to Home Screen"** or **"Install Application"**.
3. The app installs with standalone launch capabilities, full offline service worker caching, and optimized touch targets.

---

## Android APK & Android Studio Support

The project includes a complete native Android Studio project pre-configured with Capacitor:
- **Project Directory**: [`client/android`](file:///d:/darshan%20anna/client/android)
- **Open in Android Studio**: Run `npm run android:open` or open `client/android` directly in Android Studio.
- **Build APK**: In Android Studio, click **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)** to generate `app-debug.apk`.
- **Pre-configured Permissions**: Internet, Wi-Fi State, and `usesCleartextTraffic` for local ESP32 communication.
- **Step-by-Step Guide**: See [`docs/ANDROID_STUDIO_GUIDE.md`](file:///docs/ANDROID_STUDIO_GUIDE.md).

---

## Production Build

To compile both frontend and backend for production:
```bash
npm run build
```

To start the production server:
```bash
npm run start
```
#   F o r m o r a - S M A R T - I R R I G A T I O N  
 
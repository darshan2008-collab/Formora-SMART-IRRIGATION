-- Smart Irrigation SQLite Schema

CREATE TABLE IF NOT EXISTS devices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  port INTEGER NOT NULL DEFAULT 80,
  status TEXT NOT NULL DEFAULT 'disconnected',
  last_connected TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sensor_readings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id INTEGER,
  soil_moisture REAL NOT NULL,
  temperature REAL NOT NULL,
  humidity REAL NOT NULL,
  rain INTEGER NOT NULL DEFAULT 0,
  watering INTEGER NOT NULL DEFAULT 0,
  watering_mode TEXT NOT NULL DEFAULT 'manual',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS watering_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  device_id INTEGER,
  action TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'MANUAL',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (device_id) REFERENCES devices(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- Optimization Indexes
CREATE INDEX IF NOT EXISTS idx_sensor_readings_device ON sensor_readings(device_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_created ON sensor_readings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_watering_logs_created ON watering_logs(created_at DESC);

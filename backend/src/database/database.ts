import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { Device, SensorReading, SystemSettings, WateringLog } from '../types/sensor.js';

let db: DatabaseSync;

export function initDatabase(dbFilePath?: string): DatabaseSync {
  const resolvedPath = dbFilePath || process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'smart-irrigation.db');
  const dir = path.dirname(resolvedPath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new DatabaseSync(resolvedPath);

  // Read and apply schema
  const schemaPath = path.join(__dirname, 'schema.sql');
  let schemaSql = '';
  if (fs.existsSync(schemaPath)) {
    schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  } else {
    // Fallback schema if schema.sql is not copied in dist
    schemaSql = `
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
      CREATE INDEX IF NOT EXISTS idx_sensor_readings_device ON sensor_readings(device_id);
      CREATE INDEX IF NOT EXISTS idx_sensor_readings_created ON sensor_readings(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_watering_logs_created ON watering_logs(created_at DESC);
    `;
  }

  db.exec(schemaSql);

  // Initialize default settings if not exists
  const defaults: SystemSettings = {
    autoWatering: false,
    startThreshold: 30,
    stopThreshold: 60,
    wateringDuration: 30,
    pollInterval: 5000,
    dataRetentionDays: 30,
    demoMode: true
  };

  const getSettingStmt = db.prepare('SELECT value FROM settings WHERE key = ?');
  const setSettingStmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');

  for (const [key, val] of Object.entries(defaults)) {
    const existing = getSettingStmt.get(key) as { value: string } | undefined;
    if (!existing) {
      setSettingStmt.run(key, JSON.stringify(val));
    }
  }

  console.log(`[Database] SQLite connected at ${resolvedPath}`);
  return db;
}

export function getDatabase(): DatabaseSync {
  if (!db) {
    return initDatabase();
  }
  return db;
}

// ----------------- DEVICES -----------------

export function getActiveDevice(): Device | null {
  const row = getDatabase().prepare('SELECT * FROM devices ORDER BY id DESC LIMIT 1').get() as any;
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    ip_address: row.ip_address,
    port: row.port,
    status: row.status,
    last_connected: row.last_connected,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

export function getDeviceById(id: number): Device | null {
  const row = getDatabase().prepare('SELECT * FROM devices WHERE id = ?').get(id) as any;
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    ip_address: row.ip_address,
    port: row.port,
    status: row.status,
    last_connected: row.last_connected,
    created_at: row.created_at,
    updated_at: row.updated_at
  };
}

export function getAllDevices(): Device[] {
  const rows = getDatabase().prepare('SELECT * FROM devices ORDER BY id DESC').all() as any[];
  return rows.map(r => ({
    id: r.id,
    name: r.name,
    ip_address: r.ip_address,
    port: r.port,
    status: r.status,
    last_connected: r.last_connected,
    created_at: r.created_at,
    updated_at: r.updated_at
  }));
}

export function saveOrUpdateDevice(name: string, ip: string, port: number = 80, status: string = 'connected'): Device {
  const existing = getDatabase().prepare('SELECT * FROM devices WHERE ip_address = ?').get(ip) as any;
  const now = new Date().toISOString();

  if (existing) {
    getDatabase().prepare(`
      UPDATE devices 
      SET name = ?, port = ?, status = ?, last_connected = ?, updated_at = ?
      WHERE id = ?
    `).run(name, port, status, now, now, existing.id);
    return getDeviceById(existing.id)!;
  } else {
    getDatabase().prepare(`
      INSERT INTO devices (name, ip_address, port, status, last_connected, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(name, ip, port, status, now, now, now);
    return getActiveDevice()!;
  }
}

export function updateDeviceStatus(id: number, status: string, connected: boolean = false): void {
  const now = new Date().toISOString();
  if (connected) {
    getDatabase().prepare('UPDATE devices SET status = ?, last_connected = ?, updated_at = ? WHERE id = ?')
      .run(status, now, now, id);
  } else {
    getDatabase().prepare('UPDATE devices SET status = ?, updated_at = ? WHERE id = ?')
      .run(status, now, id);
  }
}

// ----------------- SENSORS -----------------

export function saveSensorReading(reading: {
  device_id: number | null;
  soil_moisture: number;
  temperature: number;
  humidity: number;
  rain: boolean | number;
  watering: boolean | number;
  watering_mode: string;
  created_at?: string;
}): void {
  const now = reading.created_at || new Date().toISOString();
  const rainVal = reading.rain ? 1 : 0;
  const waterVal = reading.watering ? 1 : 0;

  getDatabase().prepare(`
    INSERT INTO sensor_readings (device_id, soil_moisture, temperature, humidity, rain, watering, watering_mode, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    reading.device_id,
    reading.soil_moisture,
    reading.temperature,
    reading.humidity,
    rainVal,
    waterVal,
    reading.watering_mode,
    now
  );
}

export function getLatestReading(): SensorReading | null {
  const row = getDatabase().prepare(`
    SELECT * FROM sensor_readings ORDER BY created_at DESC, id DESC LIMIT 1
  `).get() as any;

  if (!row) return null;
  return {
    id: row.id,
    device_id: row.device_id,
    soil_moisture: Number(row.soil_moisture),
    temperature: Number(row.temperature),
    humidity: Number(row.humidity),
    rain: Boolean(row.rain),
    watering: Boolean(row.watering),
    watering_mode: row.watering_mode,
    created_at: row.created_at
  };
}

export function getSensorHistory(range: string = '24h', limit: number = 100): SensorReading[] {
  let timeFilter = "datetime('now', '-24 hours')";
  if (range === 'today') {
    timeFilter = "datetime('now', 'start of day')";
  } else if (range === '24h') {
    timeFilter = "datetime('now', '-24 hours')";
  } else if (range === '7d') {
    timeFilter = "datetime('now', '-7 days')";
  } else if (range === '30d') {
    timeFilter = "datetime('now', '-30 days')";
  }

  const query = `
    SELECT * FROM sensor_readings
    WHERE created_at >= ${timeFilter}
    ORDER BY created_at ASC
    LIMIT ?
  `;

  const rows = getDatabase().prepare(query).all(limit) as any[];
  return rows.map(r => ({
    id: r.id,
    device_id: r.device_id,
    soil_moisture: Number(r.soil_moisture),
    temperature: Number(r.temperature),
    humidity: Number(r.humidity),
    rain: Boolean(r.rain),
    watering: Boolean(r.watering),
    watering_mode: r.watering_mode,
    created_at: r.created_at
  }));
}

export function getRecentReadings(limit: number = 10): SensorReading[] {
  const rows = getDatabase().prepare(`
    SELECT * FROM sensor_readings ORDER BY created_at DESC, id DESC LIMIT ?
  `).all(limit) as any[];

  return rows.map(r => ({
    id: r.id,
    device_id: r.device_id,
    soil_moisture: Number(r.soil_moisture),
    temperature: Number(r.temperature),
    humidity: Number(r.humidity),
    rain: Boolean(r.rain),
    watering: Boolean(r.watering),
    watering_mode: r.watering_mode,
    created_at: r.created_at
  }));
}

export function getSensorSummary(range: string = '24h') {
  let timeFilter = "datetime('now', '-24 hours')";
  if (range === 'today') timeFilter = "datetime('now', 'start of day')";
  else if (range === '7d') timeFilter = "datetime('now', '-7 days')";
  else if (range === '30d') timeFilter = "datetime('now', '-30 days')";

  const stats = getDatabase().prepare(`
    SELECT 
      AVG(soil_moisture) as avg_moisture,
      MIN(soil_moisture) as min_moisture,
      MAX(soil_moisture) as max_moisture,
      AVG(temperature) as avg_temp,
      MIN(temperature) as min_temp,
      MAX(temperature) as max_temp,
      AVG(humidity) as avg_humidity,
      SUM(CASE WHEN rain = 1 THEN 1 ELSE 0 END) as rain_events,
      COUNT(id) as total_readings
    FROM sensor_readings
    WHERE created_at >= ${timeFilter}
  `).get() as any;

  const wateringStats = getDatabase().prepare(`
    SELECT COUNT(id) as total_watering_events
    FROM watering_logs
    WHERE action = 'START' AND created_at >= ${timeFilter}
  `).get() as any;

  return {
    avgSoilMoisture: stats?.avg_moisture ? Number(stats.avg_moisture.toFixed(1)) : 0,
    minSoilMoisture: stats?.min_moisture ? Number(stats.min_moisture.toFixed(1)) : 0,
    maxSoilMoisture: stats?.max_moisture ? Number(stats.max_moisture.toFixed(1)) : 0,
    avgTemperature: stats?.avg_temp ? Number(stats.avg_temp.toFixed(1)) : 0,
    minTemperature: stats?.min_temp ? Number(stats.min_temp.toFixed(1)) : 0,
    maxTemperature: stats?.max_temp ? Number(stats.max_temp.toFixed(1)) : 0,
    avgHumidity: stats?.avg_humidity ? Number(stats.avg_humidity.toFixed(1)) : 0,
    rainEvents: stats?.rain_events || 0,
    totalReadings: stats?.total_readings || 0,
    totalWateringEvents: wateringStats?.total_watering_events || 0
  };
}

// ----------------- WATERING LOGS -----------------

export function logWatering(deviceId: number | null, action: 'START' | 'STOP', mode: 'MANUAL' | 'AUTOMATIC'): WateringLog {
  const now = new Date().toISOString();
  getDatabase().prepare(`
    INSERT INTO watering_logs (device_id, action, mode, created_at)
    VALUES (?, ?, ?, ?)
  `).run(deviceId, action, mode, now);

  const lastIdRow = getDatabase().prepare('SELECT last_insert_rowid() as id').get() as any;
  return {
    id: lastIdRow?.id,
    device_id: deviceId,
    action,
    mode,
    created_at: now
  };
}

export function getWateringLogs(limit: number = 50): WateringLog[] {
  const rows = getDatabase().prepare(`
    SELECT * FROM watering_logs ORDER BY created_at DESC, id DESC LIMIT ?
  `).all(limit) as any[];

  return rows.map(r => ({
    id: r.id,
    device_id: r.device_id,
    action: r.action,
    mode: r.mode,
    created_at: r.created_at
  }));
}

// ----------------- SETTINGS -----------------

export function getSettings(): SystemSettings {
  const rows = getDatabase().prepare('SELECT key, value FROM settings').all() as any[];
  const defaults: SystemSettings = {
    autoWatering: false,
    startThreshold: 30,
    stopThreshold: 60,
    wateringDuration: 30,
    pollInterval: 5000,
    dataRetentionDays: 30,
    demoMode: true
  };

  const result: any = { ...defaults };
  for (const row of rows) {
    try {
      result[row.key] = JSON.parse(row.value);
    } catch {
      result[row.key] = row.value;
    }
  }

  return result as SystemSettings;
}

export function updateSettings(updates: Partial<SystemSettings>): SystemSettings {
  const current = getSettings();
  const merged: SystemSettings = { ...current, ...updates };

  const stmt = getDatabase().prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  for (const [key, val] of Object.entries(merged)) {
    stmt.run(key, JSON.stringify(val));
  }

  return merged;
}

// ----------------- RETENTION & CLEANUP -----------------

export function cleanupOldReadings(days: number = 30): { deletedReadings: number; deletedLogs: number } {
  const stmtReadings = getDatabase().prepare(`
    DELETE FROM sensor_readings WHERE created_at < datetime('now', '-' || ? || ' days')
  `);
  stmtReadings.run(days);

  const stmtLogs = getDatabase().prepare(`
    DELETE FROM watering_logs WHERE created_at < datetime('now', '-' || ? || ' days')
  `);
  stmtLogs.run(days);

  return {
    deletedReadings: 0,
    deletedLogs: 0
  };
}

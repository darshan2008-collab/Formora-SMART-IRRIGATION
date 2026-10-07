export type DeviceStatus = 'connected' | 'disconnected' | 'connecting' | 'error';

export interface Device {
  id: number;
  name: string;
  ip_address: string;
  port: number;
  status: DeviceStatus;
  last_connected: string | null;
  created_at: string;
  updated_at: string;
}

export interface SensorReading {
  id?: number;
  device_id: number | null;
  soil_moisture: number;
  temperature: number;
  humidity: number;
  rain: boolean | number;
  watering: boolean | number;
  watering_mode: 'manual' | 'automatic';
  created_at: string;
}

export interface WateringLog {
  id?: number;
  device_id: number | null;
  action: 'START' | 'STOP';
  mode: 'MANUAL' | 'AUTOMATIC';
  created_at: string;
}

export interface SystemSettings {
  autoWatering: boolean;
  startThreshold: number; // e.g. 30%
  stopThreshold: number; // e.g. 60%
  wateringDuration: number; // in seconds, e.g. 30
  pollInterval: number; // in milliseconds, e.g. 5000
  dataRetentionDays: number; // e.g. 30
  demoMode: boolean;
}

export interface ESP32StatusResponse {
  device?: string;
  soilMoisture: number;
  temperature: number;
  humidity: number;
  rain: boolean;
  watering: boolean;
  wateringMode: 'manual' | 'automatic';
  timestamp?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

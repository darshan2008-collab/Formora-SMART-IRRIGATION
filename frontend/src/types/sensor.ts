export interface SensorReading {
  id?: number;
  device_id?: number | null;
  soil_moisture: number;
  temperature: number;
  humidity: number;
  rain: boolean | number;
  watering: boolean | number;
  watering_mode: 'manual' | 'automatic';
  created_at: string;
}

export interface HistoryResponse {
  range: string;
  readings: SensorReading[];
}

export interface SensorSummary {
  avgSoilMoisture: number;
  minSoilMoisture: number;
  maxSoilMoisture: number;
  avgTemperature: number;
  minTemperature: number;
  maxTemperature: number;
  avgHumidity: number;
  rainEvents: number;
  totalReadings: number;
  totalWateringEvents: number;
}

export interface WateringLog {
  id?: number;
  device_id?: number | null;
  action: 'START' | 'STOP';
  mode: 'MANUAL' | 'AUTOMATIC';
  created_at: string;
}

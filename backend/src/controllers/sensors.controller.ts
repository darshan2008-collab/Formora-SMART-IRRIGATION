import { Request, Response } from 'express';
import { 
  getLatestReading, 
  getSensorHistory, 
  getRecentReadings, 
  getSensorSummary, 
  getActiveDevice, 
  getSettings 
} from '../database/database.js';
import { pollingService } from '../services/polling.service.js';
import { SensorReading } from '../types/sensor.js';

export class SensorsController {
  public static async getLatest(req: Request, res: Response): Promise<void> {
    try {
      const device = getActiveDevice();
      const settings = getSettings();
      const isConnected = !!device && device.status === 'connected';
      const isDemo = settings.demoMode || !isConnected;

      let reading: SensorReading | null = null;

      if (!isDemo && isConnected) {
        reading = getLatestReading();
      }

      // If no reading in DB yet or in demo mode, use realistic demo state
      if (!reading) {
        reading = pollingService.getDemoReading();
      }

      res.json({
        success: true,
        data: {
          reading,
          device: device ? {
            id: device.id,
            name: device.name,
            ip: device.ip_address,
            port: device.port,
            status: device.status,
            lastConnected: device.last_connected
          } : null,
          connectionStatus: isConnected ? 'connected' : (isDemo ? 'demo' : 'disconnected'),
          isDemo
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getHistory(req: Request, res: Response): Promise<void> {
    try {
      const range = (req.query.range as string) || '24h';
      const limit = parseInt(req.query.limit as string, 10) || 100;

      let history = getSensorHistory(range, limit);

      // If no historical points in SQLite (fresh run or demo mode), generate realistic baseline series
      // matching the visual reference curve
      if (history.length < 5) {
        history = SensorsController.generateSampleHistory(range);
      }

      res.json({
        success: true,
        data: {
          range,
          readings: history
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getRecent(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 10;
      let readings = getRecentReadings(limit);

      if (readings.length === 0) {
        // Fallback demo recent readings matching the visual reference table
        readings = [
          {
            id: 1,
            device_id: null,
            soil_moisture: 42.6,
            temperature: 29.4,
            humidity: 65,
            rain: false,
            watering: false,
            watering_mode: 'manual',
            created_at: new Date(Date.now() - 0 * 5 * 60000).toISOString()
          },
          {
            id: 2,
            device_id: null,
            soil_moisture: 43.2,
            temperature: 29.1,
            humidity: 64,
            rain: false,
            watering: false,
            watering_mode: 'manual',
            created_at: new Date(Date.now() - 1 * 5 * 60000).toISOString()
          },
          {
            id: 3,
            device_id: null,
            soil_moisture: 44.8,
            temperature: 28.7,
            humidity: 66,
            rain: false,
            watering: false,
            watering_mode: 'manual',
            created_at: new Date(Date.now() - 2 * 5 * 60000).toISOString()
          },
          {
            id: 4,
            device_id: null,
            soil_moisture: 45.1,
            temperature: 28.6,
            humidity: 67,
            rain: false,
            watering: false,
            watering_mode: 'manual',
            created_at: new Date(Date.now() - 3 * 5 * 60000).toISOString()
          },
          {
            id: 5,
            device_id: null,
            soil_moisture: 46.3,
            temperature: 28.4,
            humidity: 68,
            rain: false,
            watering: false,
            watering_mode: 'manual',
            created_at: new Date(Date.now() - 4 * 5 * 60000).toISOString()
          }
        ];
      }

      res.json({
        success: true,
        data: readings
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const range = (req.query.range as string) || '24h';
      const summary = getSensorSummary(range);
      res.json({
        success: true,
        data: summary
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  /**
   * Helper to generate realistic historical curve when database is brand new
   */
  private static generateSampleHistory(range: string): SensorReading[] {
    const points: SensorReading[] = [];
    const count = 24;
    const now = Date.now();
    const stepMs = range === '7d' ? (7 * 86400000) / count : (range === '30d' ? (30 * 86400000) / count : 3600000);

    for (let i = count; i >= 0; i--) {
      const timestamp = new Date(now - i * stepMs).toISOString();
      const progress = (count - i) / count;
      // Gentle curve around 42-60% soil moisture, ~28-32°C temp
      const soil = Math.round((55 - progress * 10 + Math.sin(progress * Math.PI * 3) * 5) * 10) / 10;
      const temp = Math.round((28 + Math.sin(progress * Math.PI * 2) * 3) * 10) / 10;
      const humidity = Math.round(62 + Math.cos(progress * Math.PI * 2) * 8);

      points.push({
        id: count - i + 1,
        device_id: null,
        soil_moisture: soil,
        temperature: temp,
        humidity,
        rain: false,
        watering: false,
        watering_mode: 'manual',
        created_at: timestamp
      });
    }
    return points;
  }
}

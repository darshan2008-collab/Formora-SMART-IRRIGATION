import { Request, Response } from 'express';
import { 
  getActiveDevice, 
  logWatering, 
  getWateringLogs, 
  getSettings, 
  updateSettings,
  getLatestReading 
} from '../database/database.js';
import { ESP32Service } from '../services/esp32.service.js';
import { pollingService } from '../services/polling.service.js';

export class WateringController {
  public static async start(req: Request, res: Response): Promise<void> {
    try {
      const device = getActiveDevice();
      const settings = getSettings();
      const isConnected = !!device && device.status === 'connected';

      // Safety check: verify if already watering
      const latest = getLatestReading();
      if (latest && latest.watering && isConnected) {
        res.status(400).json({
          success: false,
          message: 'Watering is already active. Duplicate start command ignored.'
        });
        return;
      }

      if (isConnected) {
        // Send command to real ESP32
        await ESP32Service.setWatering(device.ip_address, device.port, true);
        logWatering(device.id, 'START', 'MANUAL');
      } else {
        // Run in demo mode
        pollingService.setDemoWatering(true, 'manual');
      }

      res.json({
        success: true,
        data: {
          watering: true,
          mode: 'manual'
        },
        message: 'Watering started successfully'
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: `Unable to control watering: ${err.message}`
      });
    }
  }

  public static async stop(req: Request, res: Response): Promise<void> {
    try {
      const device = getActiveDevice();
      const isConnected = !!device && device.status === 'connected';

      if (isConnected) {
        await ESP32Service.setWatering(device.ip_address, device.port, false);
        logWatering(device.id, 'STOP', 'MANUAL');
      } else {
        pollingService.setDemoWatering(false, 'manual');
      }

      res.json({
        success: true,
        data: {
          watering: false,
          mode: 'manual'
        },
        message: 'Watering stopped successfully'
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: `Unable to stop watering: ${err.message}`
      });
    }
  }

  public static async setMode(req: Request, res: Response): Promise<void> {
    try {
      const { mode } = req.body;
      if (mode !== 'manual' && mode !== 'automatic') {
        res.status(400).json({
          success: false,
          message: "Mode must be either 'manual' or 'automatic'."
        });
        return;
      }

      const device = getActiveDevice();
      const isConnected = !!device && device.status === 'connected';

      if (isConnected) {
        await ESP32Service.setWateringMode(device.ip_address, device.port, mode);
      } else {
        pollingService.setDemoWateringMode(mode);
      }

      // Also update system settings autoWatering flag accordingly
      updateSettings({ autoWatering: mode === 'automatic' });

      res.json({
        success: true,
        data: { mode },
        message: `Watering mode updated to ${mode}`
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        message: `Failed to set watering mode: ${err.message}`
      });
    }
  }

  public static async getLogs(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 50;
      const logs = getWateringLogs(limit);
      res.json({
        success: true,
        data: logs
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

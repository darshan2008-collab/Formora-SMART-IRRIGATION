import { Request, Response } from 'express';
import { getSettings, updateSettings, cleanupOldReadings } from '../database/database.js';
import { pollingService } from '../services/polling.service.js';
import { validateNumericRange } from '../utils/validation.js';

export class SettingsController {
  public static async get(req: Request, res: Response): Promise<void> {
    try {
      const settings = getSettings();
      res.json({
        success: true,
        data: settings
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async update(req: Request, res: Response): Promise<void> {
    try {
      const updates = req.body;
      const sanitized: any = {};

      if (typeof updates.autoWatering === 'boolean') {
        sanitized.autoWatering = updates.autoWatering;
      }
      if (updates.startThreshold !== undefined) {
        sanitized.startThreshold = validateNumericRange(updates.startThreshold, 5, 80, 30);
      }
      if (updates.stopThreshold !== undefined) {
        sanitized.stopThreshold = validateNumericRange(updates.stopThreshold, 20, 95, 60);
      }
      if (updates.wateringDuration !== undefined) {
        sanitized.wateringDuration = validateNumericRange(updates.wateringDuration, 5, 300, 30);
      }
      if (updates.pollInterval !== undefined) {
        sanitized.pollInterval = validateNumericRange(updates.pollInterval, 2000, 60000, 5000);
      }
      if (updates.dataRetentionDays !== undefined) {
        sanitized.dataRetentionDays = validateNumericRange(updates.dataRetentionDays, 1, 365, 30);
      }
      if (typeof updates.demoMode === 'boolean') {
        sanitized.demoMode = updates.demoMode;
      }

      const updated = updateSettings(sanitized);

      // If poll interval changed, restart polling timer with new frequency
      if (sanitized.pollInterval) {
        pollingService.start();
      }

      res.json({
        success: true,
        data: updated,
        message: 'Settings updated successfully'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async cleanup(req: Request, res: Response): Promise<void> {
    try {
      const settings = getSettings();
      const days = settings.dataRetentionDays || 30;
      const result = cleanupOldReadings(days);
      res.json({
        success: true,
        data: result,
        message: `Successfully cleaned up sensor records older than ${days} days.`
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
}

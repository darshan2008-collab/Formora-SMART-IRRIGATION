import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app.js';
import { initDatabase, getActiveDevice, cleanupOldReadings, getSettings } from './database/database.js';
import { pollingService } from './services/polling.service.js';

const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  console.log('--------------------------------------------------');
  console.log('[SYSTEM] Starting Smart Irrigation / Smart Farming Server');
  console.log('--------------------------------------------------');

  // 1. Initialize SQLite Database
  initDatabase();

  // 2. Load saved device
  const savedDevice = getActiveDevice();
  if (savedDevice) {
    console.log(`[Device] Loaded saved ESP32 device: ${savedDevice.name} (${savedDevice.ip_address}:${savedDevice.port})`);
  } else {
    console.log('[Device] No saved ESP32 device found. Initializing in Demo Mode.');
  }

  // 3. Start Polling Service (handles real ESP32 or realistic demo simulation)
  pollingService.start();

  // 4. Start lightweight data retention cleanup task (runs every 24 hours)
  const cleanupHours = 24;
  setInterval(() => {
    try {
      const settings = getSettings();
      console.log(`[Cleanup] Running scheduled data retention cleanup (${settings.dataRetentionDays} days)...`);
      cleanupOldReadings(settings.dataRetentionDays);
    } catch (e: any) {
      console.error('[Cleanup] Scheduled cleanup failed:', e.message);
    }
  }, cleanupHours * 60 * 60 * 1000);

  // 5. Start Express Server
  const app = createApp();
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[READY] Smart Irrigation API listening on http://0.0.0.0:${PORT}`);
    console.log(`[CHECK] Health Check: http://localhost:${PORT}/api/health`);
    console.log(`[SENSORS] Sensors API: http://localhost:${PORT}/api/sensors/latest`);
    console.log('--------------------------------------------------');
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('\n[Server] Gracefully shutting down...');
    pollingService.stop();
    server.close(() => {
      console.log('[Server] HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer().catch((err) => {
  console.error('[Fatal Startup Error]', err);
  process.exit(1);
});

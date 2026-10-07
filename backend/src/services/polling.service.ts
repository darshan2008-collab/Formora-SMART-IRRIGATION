import { 
  getActiveDevice, 
  saveSensorReading, 
  updateDeviceStatus, 
  getSettings, 
  logWatering,
  getLatestReading
} from '../database/database.js';
import { ESP32Service } from './esp32.service.js';
import { Device, SensorReading } from '../types/sensor.js';

class PollingService {
  private timer: NodeJS.Timeout | null = null;
  private isPolling: boolean = false;
  private autoWateringTimer: NodeJS.Timeout | null = null;
  private consecutiveFailures: number = 0;

  // Realistic Demo simulation state
  private demoState: {
    soilMoisture: number;
    temperature: number;
    humidity: number;
    rain: boolean;
    watering: boolean;
    wateringMode: 'manual' | 'automatic';
    lastUpdate: string;
  } = {
    soilMoisture: 42.6,
    temperature: 29.4,
    humidity: 65,
    rain: false,
    watering: false,
    wateringMode: 'manual',
    lastUpdate: new Date().toISOString()
  };

  /**
   * Start or restart polling loop
   */
  public start(): void {
    this.stop();
    const settings = getSettings();
    const interval = Math.max(settings.pollInterval || 5000, 2000);

    console.log(`[PollingService] Started with interval: ${interval}ms`);
    this.timer = setInterval(() => {
      this.pollCycle();
    }, interval);

    // Initial cycle
    this.pollCycle();
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Perform one polling iteration
   */
  private async pollCycle(): Promise<void> {
    if (this.isPolling) return;
    this.isPolling = true;

    try {
      const device = getActiveDevice();
      const settings = getSettings();

      if (!device || device.status === 'disconnected' || settings.demoMode) {
        // Run demo cycle
        this.updateDemoState(settings);
        return;
      }

      // We have an active device: poll real ESP32
      try {
        const espData = await ESP32Service.getStatus(device.ip_address, device.port);
        this.consecutiveFailures = 0;

        // Save real sensor reading into SQLite
        saveSensorReading({
          device_id: device.id,
          soil_moisture: espData.soilMoisture,
          temperature: espData.temperature,
          humidity: espData.humidity,
          rain: espData.rain,
          watering: espData.watering,
          watering_mode: espData.wateringMode || 'manual'
        });

        // Update device status to connected
        updateDeviceStatus(device.id, 'connected', true);

        // Check Automatic Irrigation rules
        if (settings.autoWatering) {
          await this.evaluateAutoIrrigation(device, espData, settings);
        }

      } catch (pollErr: any) {
        this.consecutiveFailures++;
        console.warn(`[PollingService] Failed to reach ESP32 (${this.consecutiveFailures}x):`, pollErr.message);

        // After 2 consecutive failures, mark device as disconnected without wiping previous data
        if (this.consecutiveFailures >= 2) {
          updateDeviceStatus(device.id, 'disconnected', false);
        }
      }

    } catch (err: any) {
      console.error('[PollingService] Error in poll loop:', err.message);
    } finally {
      this.isPolling = false;
    }
  }

  /**
   * Evaluate simple automatic irrigation logic
   */
  private async evaluateAutoIrrigation(device: Device, espData: any, settings: any): Promise<void> {
    const soil = espData.soilMoisture;
    const isWatering = espData.watering;

    // Trigger START if moisture drops below startThreshold
    if (soil < settings.startThreshold && !isWatering) {
      console.log(`[AutoIrrigation] Soil moisture ${soil}% < ${settings.startThreshold}%. Starting irrigation.`);
      try {
        await ESP32Service.setWatering(device.ip_address, device.port, true);
        logWatering(device.id, 'START', 'AUTOMATIC');

        // Optional duration safety auto-stop
        if (settings.wateringDuration > 0) {
          if (this.autoWateringTimer) clearTimeout(this.autoWateringTimer);
          this.autoWateringTimer = setTimeout(async () => {
            console.log(`[AutoIrrigation] Duration of ${settings.wateringDuration}s reached. Stopping.`);
            try {
              await ESP32Service.setWatering(device.ip_address, device.port, false);
              logWatering(device.id, 'STOP', 'AUTOMATIC');
            } catch (e: any) {
              console.error('[AutoIrrigation] Error stopping watering on timer:', e.message);
            }
          }, settings.wateringDuration * 1000);
        }
      } catch (err: any) {
        console.error('[AutoIrrigation] Failed to start watering:', err.message);
      }
    } 
    // Trigger STOP if moisture climbs above stopThreshold
    else if (soil >= settings.stopThreshold && isWatering) {
      console.log(`[AutoIrrigation] Soil moisture ${soil}% >= ${settings.stopThreshold}%. Stopping irrigation.`);
      try {
        await ESP32Service.setWatering(device.ip_address, device.port, false);
        logWatering(device.id, 'STOP', 'AUTOMATIC');
        if (this.autoWateringTimer) {
          clearTimeout(this.autoWateringTimer);
          this.autoWateringTimer = null;
        }
      } catch (err: any) {
        console.error('[AutoIrrigation] Failed to stop watering:', err.message);
      }
    }
  }

  /**
   * Update internal demo simulation with realistic physics
   */
  private updateDemoState(settings: any): void {
    this.demoState.lastUpdate = new Date().toISOString();

    if (this.demoState.watering) {
      // Moisture rises when watering is active
      this.demoState.soilMoisture = Math.min(85, +(this.demoState.soilMoisture + 1.2).toFixed(1));
      if (this.demoState.soilMoisture >= settings.stopThreshold && this.demoState.wateringMode === 'automatic') {
        this.demoState.watering = false;
        logWatering(null, 'STOP', 'AUTOMATIC');
      }
    } else {
      // Natural subtle evaporation / fluctuation
      const fluctuation = (Math.random() - 0.52) * 0.2;
      this.demoState.soilMoisture = Math.max(15, Math.min(80, +(this.demoState.soilMoisture + fluctuation).toFixed(1)));

      if (settings.autoWatering && this.demoState.soilMoisture < settings.startThreshold) {
        this.demoState.watering = true;
        this.demoState.wateringMode = 'automatic';
        logWatering(null, 'START', 'AUTOMATIC');
      }
    }

    // Subtle natural temperature & humidity drift
    const tempChange = (Math.random() - 0.5) * 0.15;
    this.demoState.temperature = +(Math.max(22, Math.min(36, this.demoState.temperature + tempChange))).toFixed(1);

    const humChange = (Math.random() - 0.5) * 0.4;
    this.demoState.humidity = Math.round(Math.max(45, Math.min(85, this.demoState.humidity + humChange)));
  }

  /**
   * Get current demo state
   */
  public getDemoReading(): SensorReading {
    return {
      device_id: null,
      soil_moisture: this.demoState.soilMoisture,
      temperature: this.demoState.temperature,
      humidity: this.demoState.humidity,
      rain: this.demoState.rain,
      watering: this.demoState.watering,
      watering_mode: this.demoState.wateringMode,
      created_at: this.demoState.lastUpdate
    };
  }

  /**
   * Control demo watering
   */
  public setDemoWatering(enabled: boolean, mode: 'manual' | 'automatic' = 'manual'): void {
    this.demoState.watering = enabled;
    this.demoState.wateringMode = mode;
    this.demoState.lastUpdate = new Date().toISOString();
    logWatering(null, enabled ? 'START' : 'STOP', mode === 'automatic' ? 'AUTOMATIC' : 'MANUAL');
  }

  public setDemoWateringMode(mode: 'manual' | 'automatic'): void {
    this.demoState.wateringMode = mode;
  }
}

export const pollingService = new PollingService();

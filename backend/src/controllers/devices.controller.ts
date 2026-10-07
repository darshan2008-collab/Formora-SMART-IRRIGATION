import { Request, Response } from 'express';
import { 
  getActiveDevice, 
  getAllDevices, 
  getDeviceById, 
  saveOrUpdateDevice, 
  updateDeviceStatus, 
  updateSettings,
  saveSensorReading
} from '../database/database.js';
import { ESP32Service } from '../services/esp32.service.js';
import { isValidIPv4, isValidPort, sanitizeDeviceName } from '../utils/validation.js';

export class DevicesController {
  public static async connect(req: Request, res: Response): Promise<void> {
    const { ip, port = 80, name = 'My Smart Farm' } = req.body;

    if (!ip || !isValidIPv4(ip)) {
      res.status(400).json({
        success: false,
        message: 'Invalid IP address format. Please enter a valid IPv4 address (e.g. 192.168.1.100).'
      });
      return;
    }

    const portNum = Number(port);
    if (!isValidPort(portNum)) {
      res.status(400).json({
        success: false,
        message: 'Invalid port number. Must be between 1 and 65535.'
      });
      return;
    }

    const cleanName = sanitizeDeviceName(name);

    try {
      // Test real connection to ESP32
      const statusData = await ESP32Service.getStatus(ip, portNum);

      // Successfully connected! Save to SQLite
      const device = saveOrUpdateDevice(cleanName, ip, portNum, 'connected');

      // Save initial reading into SQLite
      if (statusData) {
        saveSensorReading({
          device_id: device.id,
          soil_moisture: statusData.soilMoisture,
          temperature: statusData.temperature,
          humidity: statusData.humidity,
          rain: statusData.rain,
          watering: statusData.watering,
          watering_mode: statusData.wateringMode || 'manual'
        });
      }

      // Turn off demo mode now that real device is connected
      updateSettings({ demoMode: false });

      res.json({
        success: true,
        data: {
          connected: true,
          device: statusData.device || device.name,
          ip: device.ip_address,
          port: device.port,
          id: device.id
        },
        message: `Successfully connected to ESP32 at ${ip}:${portNum}`
      });

    } catch (err: any) {
      res.status(503).json({
        success: false,
        message: `Unable to connect to ESP32: ${err.message}. Make sure your ESP32 and backend server are connected to the same Wi-Fi network.`
      });
    }
  }

  public static async getDevices(req: Request, res: Response): Promise<void> {
    try {
      const devices = getAllDevices();
      const active = getActiveDevice();
      res.json({
        success: true,
        data: {
          devices,
          active
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }

  public static async getDevice(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid device ID' });
      return;
    }

    const device = getDeviceById(id);
    if (!device) {
      res.status(404).json({ success: false, message: 'Device not found' });
      return;
    }

    res.json({ success: true, data: device });
  }

  public static async disconnect(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ success: false, message: 'Invalid device ID' });
      return;
    }

    updateDeviceStatus(id, 'disconnected', false);
    res.json({ success: true, message: 'Device disconnected successfully' });
  }

  public static async checkStatus(req: Request, res: Response): Promise<void> {
    const id = Number(req.params.id);
    const device = getDeviceById(id);

    if (!device) {
      res.status(404).json({ success: false, message: 'Device not found' });
      return;
    }

    try {
      const status = await ESP32Service.getStatus(device.ip_address, device.port);
      updateDeviceStatus(device.id, 'connected', true);
      res.json({ success: true, data: { connected: true, ...status } });
    } catch (err: any) {
      updateDeviceStatus(device.id, 'disconnected', false);
      res.json({
        success: false,
        data: { connected: false },
        message: err.message
      });
    }
  }
}

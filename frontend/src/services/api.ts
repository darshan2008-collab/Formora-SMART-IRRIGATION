import axios from 'axios';
import { SensorReading, HistoryResponse, SensorSummary, WateringLog } from '../types/sensor.js';
import { DeviceInfo, SystemSettings } from '../types/device.js';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000,
});

export const api = {
  // Health
  async getHealth() {
    const res = await client.get('/health');
    return res.data;
  },

  // Devices
  async connectDevice(ip: string, port: number = 80, name: string = 'My Smart Farm') {
    const res = await client.post('/devices/connect', { ip, port, name });
    return res.data;
  },

  async getDevices() {
    const res = await client.get('/devices');
    return res.data;
  },

  async getDevice(id: number) {
    const res = await client.get(`/devices/${id}`);
    return res.data;
  },

  async disconnectDevice(id: number) {
    const res = await client.post(`/devices/${id}/disconnect`);
    return res.data;
  },

  async checkDeviceStatus(id: number) {
    const res = await client.get(`/devices/${id}/status`);
    return res.data;
  },

  // Sensors
  async getLatestSensor(): Promise<{
    reading: SensorReading;
    device: DeviceInfo | null;
    connectionStatus: 'connected' | 'disconnected' | 'demo';
    isDemo: boolean;
  }> {
    const res = await client.get('/sensors/latest');
    return res.data.data;
  },

  async getSensorHistory(range: string = '24h', limit: number = 100): Promise<HistoryResponse> {
    const res = await client.get('/sensors/history', { params: { range, limit } });
    return res.data.data;
  },

  async getRecentReadings(limit: number = 10): Promise<SensorReading[]> {
    const res = await client.get('/sensors/recent', { params: { limit } });
    return res.data.data;
  },

  async getSensorSummary(range: string = '24h'): Promise<SensorSummary> {
    const res = await client.get('/sensors/summary', { params: { range } });
    return res.data.data;
  },

  // Watering
  async startWatering(durationMinutes?: number) {
    const res = await client.post('/watering/start', { duration: durationMinutes });
    return res.data;
  },

  async stopWatering() {
    const res = await client.post('/watering/stop');
    return res.data;
  },

  async setWateringMode(mode: 'manual' | 'automatic') {
    const res = await client.post('/watering/mode', { mode });
    return res.data;
  },

  async setMode(mode: 'manual' | 'automatic') {
    return this.setWateringMode(mode);
  },

  async getWateringLogs(limit: number = 50): Promise<WateringLog[]> {
    const res = await client.get('/watering/logs', { params: { limit } });
    return res.data.data;
  },

  // Settings
  async getSettings(): Promise<SystemSettings> {
    const res = await client.get('/settings');
    return res.data.data;
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    const res = await client.put('/settings', settings);
    return res.data.data;
  },

  async cleanupData() {
    const res = await client.post('/settings/cleanup');
    return res.data;
  }
};

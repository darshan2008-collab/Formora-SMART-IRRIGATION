import axios from 'axios';
import { ESP32StatusResponse } from '../types/sensor.js';

const TIMEOUT_MS = 3500;

export class ESP32Service {
  /**
   * Helper to format base URL
   */
  private static getBaseUrl(ip: string, port: number = 80): string {
    const cleanIp = ip.trim();
    return `http://${cleanIp}:${port}`;
  }

  /**
   * Test connection and retrieve status
   */
  public static async getStatus(ip: string, port: number = 80): Promise<ESP32StatusResponse> {
    const url = `${this.getBaseUrl(ip, port)}/api/status`;
    try {
      const response = await axios.get<ESP32StatusResponse>(url, {
        timeout: TIMEOUT_MS,
        headers: {
          'Accept': 'application/json'
        }
      });
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error(`Connection timeout: ESP32 at ${ip}:${port} took too long to respond.`);
      }
      if (error.code === 'ECONNREFUSED') {
        throw new Error(`Connection refused: ESP32 port ${port} is not accepting connections.`);
      }
      if (error.code === 'EHOSTUNREACH' || error.code === 'ENETUNREACH') {
        throw new Error(`ESP32 at ${ip} is unreachable. Check that your ESP32 and server are on the same Wi-Fi.`);
      }
      throw new Error(`Failed to communicate with ESP32: ${error.message || 'Unknown network error'}`);
    }
  }

  /**
   * Fetch sensor readings
   */
  public static async getSensors(ip: string, port: number = 80): Promise<any> {
    const url = `${this.getBaseUrl(ip, port)}/api/sensors`;
    try {
      const response = await axios.get(url, { timeout: TIMEOUT_MS });
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to read ESP32 sensors: ${error.message}`);
    }
  }

  /**
   * Send start/stop watering command
   */
  public static async setWatering(ip: string, port: number = 80, enabled: boolean): Promise<any> {
    const url = `${this.getBaseUrl(ip, port)}/api/watering`;
    try {
      const response = await axios.post(
        url,
        { enabled },
        {
          timeout: TIMEOUT_MS,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to send watering command to ESP32: ${error.message}`);
    }
  }

  /**
   * Set watering mode (manual or automatic)
   */
  public static async setWateringMode(ip: string, port: number = 80, mode: 'manual' | 'automatic'): Promise<any> {
    const url = `${this.getBaseUrl(ip, port)}/api/watering/mode`;
    try {
      const response = await axios.post(
        url,
        { mode },
        {
          timeout: TIMEOUT_MS,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to set watering mode on ESP32: ${error.message}`);
    }
  }
}

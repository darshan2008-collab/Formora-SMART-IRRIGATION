export type ConnectionStatusType = 'connected' | 'disconnected' | 'connecting' | 'error' | 'demo';

export interface DeviceInfo {
  id?: number;
  name: string;
  ip: string;
  port: number;
  status: string;
  lastConnected?: string | null;
}

export interface SystemSettings {
  autoWatering: boolean;
  startThreshold: number;
  stopThreshold: number;
  wateringDuration: number;
  pollInterval: number;
  dataRetentionDays: number;
  demoMode: boolean;
}

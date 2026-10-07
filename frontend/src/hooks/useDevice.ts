import { useState, useCallback } from 'react';
import { api } from '../services/api.js';

export function useDevice() {
  const [ip, setIp] = useState<string>(() => localStorage.getItem('esp32_ip') || '192.168.1.100');
  const [port, setPort] = useState<number>(() => {
    const saved = localStorage.getItem('esp32_port');
    return saved ? parseInt(saved, 10) : 80;
  });
  const [name, setName] = useState<string>(() => localStorage.getItem('esp32_name') || 'My Smart Farm');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const connect = useCallback(async (targetIp?: string, targetPort?: number, targetName?: string) => {
    const finalIp = (targetIp || ip).trim();
    const finalPort = targetPort || port;
    const finalName = (targetName || name).trim();

    setIsConnecting(true);
    setConnectionError(null);
    setSuccessMessage(null);

    try {
      const response = await api.connectDevice(finalIp, finalPort, finalName);
      if (response.success) {
        localStorage.setItem('esp32_ip', finalIp);
        localStorage.setItem('esp32_port', finalPort.toString());
        localStorage.setItem('esp32_name', finalName);
        setSuccessMessage(`Connected successfully to ${finalName} (${finalIp})`);
        return response.data;
      } else {
        setConnectionError(response.message || 'Connection failed.');
        return null;
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Unable to connect to ESP32.';
      setConnectionError(msg);
      return null;
    } finally {
      setIsConnecting(false);
    }
  }, [ip, port, name]);

  const disconnect = useCallback(async (id: number) => {
    try {
      await api.disconnectDevice(id);
      setSuccessMessage('ESP32 disconnected.');
    } catch (err: any) {
      setConnectionError('Failed to disconnect device.');
    }
  }, []);

  return {
    ip,
    setIp,
    port,
    setPort,
    name,
    setName,
    isConnecting,
    connectionError,
    successMessage,
    connect,
    disconnect,
    clearMessages: () => {
      setConnectionError(null);
      setSuccessMessage(null);
    }
  };
}

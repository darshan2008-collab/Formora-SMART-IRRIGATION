import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../services/api.js';
import { SensorReading, HistoryResponse, SensorSummary } from '../types/sensor.js';
import { DeviceInfo } from '../types/device.js';

export function useSensorData(pollingIntervalMs: number = 4000) {
  const [reading, setReading] = useState<SensorReading | null>(null);
  const [device, setDevice] = useState<DeviceInfo | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'demo' | 'connecting'>('connecting');
  const [isDemo, setIsDemo] = useState<boolean>(true);
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [summary, setSummary] = useState<SensorSummary | null>(null);
  const [recentReadings, setRecentReadings] = useState<SensorReading[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  const isMounted = useRef(true);

  const fetchLatest = useCallback(async () => {
    try {
      const data = await api.getLatestSensor();
      if (!isMounted.current) return;

      if (data.reading) {
        setReading(data.reading);
      }
      setDevice(data.device);
      setConnectionStatus(data.connectionStatus);
      setIsDemo(data.isDemo);
      setError(null);
      setLastSyncTime(new Date());
    } catch (err: any) {
      if (!isMounted.current) return;
      console.warn('Sensor fetch warning:', err.message);
      // Keep previous sensor values on temporary network loss as required by Section 30!
      setConnectionStatus((prev) => (prev === 'connected' ? 'disconnected' : prev));
      setError('Connection interrupted. Retrying...');
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const fetchHistory = useCallback(async (range: string = '24h') => {
    try {
      const [histData, recData, sumData] = await Promise.all([
        api.getSensorHistory(range, 100),
        api.getRecentReadings(8),
        api.getSensorSummary(range)
      ]);
      if (!isMounted.current) return;

      if (histData && histData.readings) {
        setHistory(histData.readings);
      }
      if (recData) {
        setRecentReadings(recData);
      }
      if (sumData) {
        setSummary(sumData);
      }
    } catch (err: any) {
      console.warn('History fetch warning:', err.message);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchLatest();
    fetchHistory('24h');

    const interval = setInterval(() => {
      fetchLatest();
    }, pollingIntervalMs);

    // Refresh history periodically every 20 seconds
    const historyInterval = setInterval(() => {
      fetchHistory('24h');
    }, 20000);

    return () => {
      isMounted.current = false;
      clearInterval(interval);
      clearInterval(historyInterval);
    };
  }, [fetchLatest, fetchHistory, pollingIntervalMs]);

  return {
    reading,
    device,
    connectionStatus,
    isDemo,
    history,
    summary,
    recentReadings,
    isLoading,
    error,
    lastSyncTime,
    refetch: fetchLatest,
    refetchHistory: fetchHistory,
  };
}

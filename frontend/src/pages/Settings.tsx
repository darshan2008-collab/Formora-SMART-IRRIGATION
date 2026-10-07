import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Droplet, 
  Database, 
  Sun, 
  Moon, 
  CheckCircle2, 
  AlertCircle, 
  Trash2,
  RefreshCw,
  Save
} from 'lucide-react';
import { Header } from '../components/Header.js';
import { FormoraButton } from '../components/FormoraButton.js';
import { useSensorData } from '../hooks/useSensorData.js';
import { useDevice } from '../hooks/useDevice.js';
import { api } from '../services/api.js';
import { SystemSettings } from '../types/device.js';

export const Settings: React.FC = () => {
  const { connectionStatus, isDemo, lastSyncTime, refetch } = useSensorData(10000);
  const { 
    ip, 
    setIp, 
    port, 
    setPort, 
    name, 
    setName, 
    isConnecting, 
    connect, 
    connectionError, 
    successMessage 
  } = useDevice();

  const [settings, setSettings] = useState<SystemSettings>({
    autoWatering: false,
    startThreshold: 30,
    stopThreshold: 60,
    wateringDuration: 30,
    pollInterval: 5000,
    dataRetentionDays: 30,
    demoMode: true,
  });

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [cleanupStatus, setCleanupStatus] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    api.getSettings().then((s) => {
      if (s) setSettings(s);
    }).catch(console.warn);
  }, []);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      setSaveStatus('Settings successfully saved to SQLite.');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (e: any) {
      setSaveStatus('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCleanupData = async () => {
    setCleanupStatus('Cleaning up...');
    try {
      const res = await api.cleanupData();
      setCleanupStatus(res.message || 'Data retention cleanup complete.');
      setTimeout(() => setCleanupStatus(null), 4000);
    } catch (e: any) {
      setCleanupStatus('Cleanup failed.');
    }
  };

  const toggleTheme = (dark: boolean) => {
    setIsDark(dark);
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="pb-28 sm:pb-32 lg:pb-8">
      <Header
        title="System Settings"
        subtitle="Configure ESP32 device, irrigation triggers, database policies and appearance"
        connectionStatus={connectionStatus}
        isDemo={isDemo}
        onRefresh={refetch}
        lastSyncTime={lastSyncTime}
      />

      <div className="max-w-4xl space-y-6">
        {/* SECTION 1: DEVICE */}
        <div className="glass-panel rounded-2xl sm:rounded-3xl p-6 border border-white/80 shadow-card">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-[#EBF3EA] text-farm-800 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">ESP32 Hardware Connection</h3>
              <p className="text-xs text-slate-500">Configure Wi-Fi endpoint and port for micro-controller communication</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ESP32 IP Address
              </label>
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="192.168.1.100"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-farm-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Port
              </label>
              <input
                type="number"
                value={port}
                onChange={(e) => setPort(parseInt(e.target.value, 10) || 80)}
                placeholder="80"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-farm-600 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Device Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Smart Farm"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-farm-600"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <FormoraButton
              type="button"
              variant="farm"
              size="sm"
              loading={isConnecting}
              onClick={() => connect(ip, port, name)}
            >
              Test Connection & Save Device
            </FormoraButton>

            {connectionError && (
              <span className="text-xs font-medium text-rose-600 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                {connectionError}
              </span>
            )}
            {successMessage && (
              <span className="text-xs font-medium text-emerald-600 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {successMessage}
              </span>
            )}
          </div>
        </div>

        {/* SECTION 2: IRRIGATION AUTOMATION */}
        <div className="glass-panel rounded-2xl sm:rounded-3xl p-6 border border-white/80 shadow-card">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Droplet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Automatic Irrigation Rules</h3>
              <p className="text-xs text-slate-500">Autonomous watering activation based on real-time soil moisture thresholds</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Auto Watering Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#F4F8F4] border border-[#E2EBE2]">
              <div>
                <p className="text-sm font-bold text-slate-900">Enable Automatic Watering</p>
                <p className="text-xs text-slate-500">System triggers relay when moisture drops below threshold</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoWatering}
                  onChange={(e) => setSettings({ ...settings, autoWatering: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-farm-700"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Start Watering Below (%)
                </label>
                <input
                  type="number"
                  min="10"
                  max="50"
                  value={settings.startThreshold}
                  onChange={(e) => setSettings({ ...settings, startThreshold: parseInt(e.target.value, 10) || 30 })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-farm-600 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">Default: 30%</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Stop Watering Above (%)
                </label>
                <input
                  type="number"
                  min="40"
                  max="90"
                  value={settings.stopThreshold}
                  onChange={(e) => setSettings({ ...settings, stopThreshold: parseInt(e.target.value, 10) || 60 })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-farm-600 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">Default: 60%</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Watering Duration (Seconds)
                </label>
                <input
                  type="number"
                  min="5"
                  max="300"
                  value={settings.wateringDuration}
                  onChange={(e) => setSettings({ ...settings, wateringDuration: parseInt(e.target.value, 10) || 30 })}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-farm-600 font-mono"
                />
                <p className="text-[11px] text-slate-400 mt-1">Default: 30s</p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: DATA RETENTION & POLLING */}
        <div className="glass-panel rounded-2xl sm:rounded-3xl p-6 border border-white/80 shadow-card">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Database & Polling Rate</h3>
              <p className="text-xs text-slate-500">Configure SQLite telemetry retention and background polling frequency</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Polling Interval (Milliseconds)
              </label>
              <input
                type="number"
                min="2000"
                max="60000"
                step="1000"
                value={settings.pollInterval}
                onChange={(e) => setSettings({ ...settings, pollInterval: parseInt(e.target.value, 10) || 5000 })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-farm-600 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Default: 5000ms (5 seconds)</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Data Retention (Days)
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={settings.dataRetentionDays}
                onChange={(e) => setSettings({ ...settings, dataRetentionDays: parseInt(e.target.value, 10) || 30 })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-farm-600 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Default: 30 days (older readings auto-purged)</p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Manual database purge removes readings beyond retention window.
            </span>
            <FormoraButton
              type="button"
              variant="danger"
              size="xs"
              onClick={handleCleanupData}
              icon={<Trash2 className="w-3.5 h-3.5" />}
            >
              Purge Old Records
            </FormoraButton>
          </div>
          {cleanupStatus && (
            <p className="text-xs text-slate-600 mt-2 font-medium">{cleanupStatus}</p>
          )}
        </div>

        {/* SECTION 4: APPEARANCE */}
        <div className="glass-panel rounded-2xl sm:rounded-3xl p-6 border border-white/80 shadow-card">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Appearance & Theme</h3>
              <p className="text-xs text-slate-500">Toggle interface display preference</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <FormoraButton
              type="button"
              variant={!isDark ? 'farm' : 'outline'}
              size="sm"
              onClick={() => toggleTheme(false)}
              icon={<Sun className="w-3.5 h-3.5" />}
            >
              Light Mode
            </FormoraButton>

            <FormoraButton
              type="button"
              variant={isDark ? 'dark' : 'outline'}
              size="sm"
              onClick={() => toggleTheme(true)}
              icon={<Moon className="w-3.5 h-3.5" />}
            >
              Dark Mode
            </FormoraButton>
          </div>
        </div>

        {/* Save All Settings Button */}
        <div className="flex items-center justify-between p-4 glass-panel rounded-2xl sm:rounded-3xl border border-white/80 shadow-card">
          <div>
            {saveStatus && (
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {saveStatus}
              </span>
            )}
          </div>

          <FormoraButton
            type="button"
            variant="farm"
            size="md"
            loading={isSaving}
            onClick={handleSaveSettings}
            icon={<Save className="w-4 h-4" />}
          >
            Save All Settings
          </FormoraButton>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Wifi, Cpu, CheckCircle2, XCircle, AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { DeviceInfo } from '../types/device.js';
import { FormoraButton } from './FormoraButton.js';

interface ConnectionCardProps {
  device: DeviceInfo | null;
  connectionStatus: 'connected' | 'disconnected' | 'demo' | 'connecting';
  isConnecting: boolean;
  connectionError: string | null;
  successMessage: string | null;
  lastSyncTime: Date;
  onConnect: (ip: string, port: number, name: string) => Promise<any>;
  onDisconnect?: (id: number) => Promise<any>;
}

export const ConnectionCard: React.FC<ConnectionCardProps> = ({
  device,
  connectionStatus,
  isConnecting,
  connectionError,
  successMessage,
  lastSyncTime,
  onConnect,
  onDisconnect,
}) => {
  const [ip, setIp] = useState<string>(() => localStorage.getItem('esp32_ip') || '192.168.1.100');
  const [port, setPort] = useState<number>(() => {
    const p = localStorage.getItem('esp32_port');
    return p ? parseInt(p, 10) : 80;
  });
  const [name, setName] = useState<string>(() => localStorage.getItem('esp32_name') || 'My Smart Farm');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect(ip, port, name);
  };

  const isConnected = connectionStatus === 'connected';

  return (
    <div className="glass-panel rounded-2xl sm:rounded-3xl border border-white/80 shadow-card p-4 sm:p-5 mb-6">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
            isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-[#EBF3EA] text-farm-800'
          }`}>
            <Cpu className="w-6 h-6" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                {device?.name || name || 'ESP32 Device'}
              </h3>
              {isConnected ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  Connected
                </span>
              ) : connectionStatus === 'demo' ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse-dot" />
                  DEMO MODE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                  Disconnected
                </span>
              )}
            </div>

            <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span>IP: <strong className="text-slate-700 font-mono">{device?.ip || ip}</strong></span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span>Port: <strong className="text-slate-700 font-mono">{device?.port || port}</strong></span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span>Sync: <span className="font-medium text-slate-600">{lastSyncTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span></span>
            </p>
          </div>
        </div>

        {/* Quick Expand Toggle / Actions */}
        <div className="flex items-center gap-2">
          {isConnected && device?.id && onDisconnect && (
            <FormoraButton
              type="button"
              variant="danger"
              size="xs"
              onClick={() => onDisconnect(device.id!)}
            >
              Disconnect
            </FormoraButton>
          )}

          <FormoraButton
            type="button"
            variant="secondary"
            size="xs"
            onClick={() => setIsExpanded(!isExpanded)}
            icon={isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            iconPosition="right"
          >
            {isExpanded ? 'Hide Setup' : 'Connect / Configure'}
          </FormoraButton>
        </div>
      </div>

      {/* Expandable Form */}
      {isExpanded && (
        <form onSubmit={handleSubmit} className="mt-4 pt-4 border-t border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ESP32 IP Address
              </label>
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="192.168.1.100"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-farm-600 focus:border-transparent font-mono bg-slate-50/50"
                required
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
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-farm-600 focus:border-transparent font-mono bg-slate-50/50"
                required
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
                placeholder="My Farm ESP32"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-farm-600 focus:border-transparent bg-slate-50/50"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <p className="text-xs text-slate-500">
              Ensure your computer and the ESP32 are connected to the same Wi-Fi network.
            </p>

            <FormoraButton
              type="submit"
              variant="farm"
              size="sm"
              loading={isConnecting}
              icon={<Wifi className="w-3.5 h-3.5" />}
            >
              Connect ESP32
            </FormoraButton>
          </div>

          {/* Feedback Messages */}
          {connectionError && (
            <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>{connectionError}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}
        </form>
      )}
    </div>
  );
};

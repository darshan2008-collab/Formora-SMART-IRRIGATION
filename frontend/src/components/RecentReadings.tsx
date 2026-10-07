import React from 'react';
import { Clock, Droplets, Thermometer, CloudRain, Database } from 'lucide-react';
import { SensorReading } from '../types/sensor.js';

interface RecentReadingsProps {
  readings: SensorReading[];
}

export const RecentReadings: React.FC<RecentReadingsProps> = ({ readings }) => {
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const getMoistureBadge = (moisture: number) => {
    if (moisture < 30) {
      return <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">Dry</span>;
    }
    if (moisture <= 65) {
      return <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Optimal</span>;
    }
    return <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">Saturated</span>;
  };

  return (
    <div className="glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-white/80 shadow-card h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Recent Telemetry Log
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Persistent SQLite time-series snapshots</p>
          </div>

          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-farm-800 bg-[#EAF5ED] px-3 py-1 rounded-full border border-[#D1EAD7]">
            <Database className="w-3.5 h-3.5 text-farm-600" />
            <span>SQLite Active</span>
          </span>
        </div>

        <div className="overflow-x-auto -mx-1 sm:mx-0 scrollbar-none">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold text-[10px] sm:text-[11px] uppercase tracking-wider">
                <th className="pb-3 pl-2 font-bold">Time</th>
                <th className="pb-3 font-bold whitespace-nowrap">Soil Moisture</th>
                <th className="pb-3 font-bold whitespace-nowrap">Temperature</th>
                <th className="pb-3 pr-2 font-bold whitespace-nowrap text-right">Rain</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/70">
              {readings && readings.length > 0 ? (
                readings.slice(0, 5).map((row, idx) => {
                  const isRaining = Boolean(row.rain);
                  return (
                    <tr
                      key={row.id || idx}
                      className="hover:bg-emerald-50/40 transition-colors group"
                    >
                      <td className="py-3 pl-2 font-mono text-xs font-semibold text-slate-600 whitespace-nowrap flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full flex-shrink-0 ${
                            idx === 0 ? 'bg-emerald-500 animate-pulse-dot' : 'bg-slate-300'
                          }`}
                        />
                        <span>{formatTime(row.created_at)}</span>
                      </td>

                      <td className="py-3 font-bold text-slate-900 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-mono">{row.soil_moisture}%</span>
                          {getMoistureBadge(row.soil_moisture)}
                        </div>
                      </td>

                      <td className="py-3 font-bold text-slate-900 whitespace-nowrap">
                        <span className="font-mono text-amber-700 bg-amber-50/80 px-2 py-0.5 rounded-lg border border-amber-200/60 text-xs">
                          {row.temperature} °C
                        </span>
                      </td>

                      <td className="py-3 pr-2 font-medium whitespace-nowrap text-right">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            isRaining
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}
                        >
                          <CloudRain className={`w-3 h-3 ${isRaining ? 'text-blue-500' : 'text-slate-400'}`} />
                          <span>{isRaining ? 'Precipitation' : 'Dry'}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-slate-400 text-xs">
                    No readings recorded yet. ESP32 polling will populate rows automatically.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

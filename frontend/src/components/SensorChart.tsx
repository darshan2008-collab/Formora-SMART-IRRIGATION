import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { Droplet, Thermometer, CloudRain, Activity } from 'lucide-react';
import { SensorReading } from '../types/sensor.js';

interface SensorChartProps {
  data: SensorReading[];
  title?: string;
  rangeLabel?: string;
}

export const SensorChart: React.FC<SensorChartProps> = ({
  data,
  title = 'Sensor Readings',
  rangeLabel = 'Last 24 Hours',
}) => {
  const [activeMetric, setActiveMetric] = useState<'all' | 'moisture' | 'temp'>('all');

  // Format chart data for smooth visualization
  const formattedData = data.map((item) => {
    const d = new Date(item.created_at);
    let hours = d.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeLabel = `${hours} ${ampm}`;

    return {
      rawTime: item.created_at,
      time: timeLabel,
      fullTime: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      soilMoisture: item.soil_moisture,
      temperature: item.temperature,
      rain: item.rain ? 20 : 0,
      isRaining: Boolean(item.rain),
    };
  });

  // Calculate quick summary metrics
  const avgMoisture = formattedData.length
    ? Math.round(formattedData.reduce((acc, curr) => acc + curr.soilMoisture, 0) / formattedData.length)
    : 42;
  const maxTemp = formattedData.length
    ? Math.max(...formattedData.map((d) => d.temperature))
    : 30;

  return (
    <div className="glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-white/80 shadow-card flex flex-col justify-between h-full">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {title}
            </h3>
            <span className="text-[11px] font-bold text-farm-800 bg-[#EAF5ED] px-2.5 py-0.5 rounded-full border border-[#D1EAD7]">
              {rangeLabel}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Continuous real-time root hydration & micro-climate curves
          </p>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex items-center gap-1 bg-[#F4F8F4] p-1 rounded-xl border border-slate-200/60 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveMetric('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeMetric === 'all'
                ? 'bg-white text-farm-900 shadow-sm border border-slate-200/60'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Metrics
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('moisture')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeMetric === 'moisture'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Moisture
          </button>
          <button
            type="button"
            onClick={() => setActiveMetric('temp')}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeMetric === 'temp'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Temperature
          </button>
        </div>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-4">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
          <Droplet className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
              Avg Moisture
            </span>
            <span className="text-xs sm:text-sm font-black text-emerald-950 font-mono">
              {avgMoisture}%
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-amber-50/70 border border-amber-100">
          <Thermometer className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
              Peak Ambient
            </span>
            <span className="text-xs sm:text-sm font-black text-amber-950 font-mono">
              {maxTemp}°C
            </span>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2.5 px-3 py-2 rounded-xl bg-sky-50/70 border border-sky-100">
          <CloudRain className="w-4 h-4 text-sky-600 flex-shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
              Precipitation
            </span>
            <span className="text-xs sm:text-sm font-black text-sky-950">
              Clear Weather
            </span>
          </div>
        </div>
      </div>

      {/* Chart Area */}
      <div className="w-full h-[230px] sm:h-[260px] min-h-[220px]">
        {formattedData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={formattedData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="moistureGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F1" vertical={false} />
              <XAxis
                dataKey="time"
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                stroke="#94A3B8"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const p = payload[0].payload;
                    return (
                      <div className="bg-slate-900/90 backdrop-blur-md text-white p-3 rounded-2xl shadow-xl border border-white/10 text-xs min-w-[140px]">
                        <p className="font-semibold text-slate-300 pb-1.5 border-b border-white/10 mb-2">
                          {p.fullTime}
                        </p>
                        <div className="space-y-1.5">
                          {(activeMetric === 'all' || activeMetric === 'moisture') && (
                            <div className="flex items-center justify-between gap-3 text-emerald-400">
                              <span className="font-medium">Moisture:</span>
                              <span className="font-mono font-bold">{p.soilMoisture}%</span>
                            </div>
                          )}
                          {(activeMetric === 'all' || activeMetric === 'temp') && (
                            <div className="flex items-center justify-between gap-3 text-amber-400">
                              <span className="font-medium">Temperature:</span>
                              <span className="font-mono font-bold">{p.temperature}°C</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between gap-3 text-sky-400">
                            <span className="font-medium">Rain:</span>
                            <span className="font-bold">{p.isRaining ? 'Detected' : 'Dry'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {(activeMetric === 'all' || activeMetric === 'moisture') && (
                <Area
                  type="monotone"
                  dataKey="soilMoisture"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#moistureGradient)"
                  name="Soil Moisture"
                />
              )}

              {(activeMetric === 'all' || activeMetric === 'temp') && (
                <Area
                  type="monotone"
                  dataKey="temperature"
                  stroke="#F97316"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#tempGradient)"
                  name="Temperature"
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <Activity className="w-8 h-8 stroke-1 text-slate-300 mb-2 animate-pulse" />
            <p className="text-xs">Gathering sensor telemetry...</p>
          </div>
        )}
      </div>
    </div>
  );
};

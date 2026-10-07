import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Download, 
  Droplet, 
  Thermometer, 
  CloudRain, 
  Activity,
  Layers
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { Header } from '../components/Header.js';
import { FormoraButton } from '../components/FormoraButton.js';
import { useSensorData } from '../hooks/useSensorData.js';
import { api } from '../services/api.js';
import { SensorReading, SensorSummary } from '../types/sensor.js';

export const History: React.FC = () => {
  const { connectionStatus, isDemo, lastSyncTime, refetch } = useSensorData(10000);
  const [range, setRange] = useState<'today' | '24h' | '7d' | '30d'>('24h');
  const [historyData, setHistoryData] = useState<SensorReading[]>([]);
  const [summaryData, setSummaryData] = useState<SensorSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const loadData = async (selectedRange: string) => {
    setIsLoading(true);
    try {
      const [hist, sum] = await Promise.all([
        api.getSensorHistory(selectedRange, 150),
        api.getSensorSummary(selectedRange)
      ]);
      if (hist && hist.readings) {
        setHistoryData(hist.readings);
      }
      if (sum) {
        setSummaryData(sum);
      }
    } catch (e) {
      console.warn('History load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(range);
  }, [range]);

  const handleExportCSV = () => {
    if (!historyData || historyData.length === 0) return;
    const headers = ['Timestamp', 'Soil Moisture (%)', 'Temperature (°C)', 'Humidity (%)', 'Rain', 'Watering Active', 'Mode'];
    const rows = historyData.map((d) => [
      d.created_at,
      d.soil_moisture,
      d.temperature,
      d.humidity,
      d.rain ? 'Yes' : 'No',
      d.watering ? 'Active' : 'Idle',
      d.watering_mode
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart-irrigation-history-${range}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartData = historyData.map((d) => {
    const dateObj = new Date(d.created_at);
    let timeLabel = '';
    if (range === 'today' || range === '24h') {
      timeLabel = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      timeLabel = `${dateObj.getMonth() + 1}/${dateObj.getDate()} ${dateObj.getHours()}:00`;
    }

    return {
      time: timeLabel,
      soilMoisture: d.soil_moisture,
      temperature: d.temperature,
      rain: d.rain ? 20 : 0,
      watering: d.watering ? 40 : 0,
    };
  });

  return (
    <div className="pb-28 sm:pb-32 lg:pb-8">
      <Header
        title="Historical Telemetry & Trends"
        subtitle="Long-term agricultural intelligence and soil hydration cycles"
        connectionStatus={connectionStatus}
        isDemo={isDemo}
        onRefresh={() => loadData(range)}
        lastSyncTime={lastSyncTime}
      />

      {/* Filter and Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 glass-panel rounded-2xl sm:rounded-3xl p-4 border border-white/80 shadow-card">
        <div className="flex items-center gap-1 bg-[#F4F8F4] p-1 rounded-xl border border-slate-200/50">
          {(['today', '24h', '7d', '30d'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                range === r
                  ? 'bg-farm-700 text-white shadow-sm'
                  : 'text-slate-600 hover:text-farm-900'
              }`}
            >
              {r === 'today' ? 'Today' : r === '24h' ? '24 Hours' : r === '7d' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>

        <FormoraButton
          variant="secondary"
          size="sm"
          onClick={handleExportCSV}
          disabled={historyData.length === 0}
          icon={<Download className="w-3.5 h-3.5" />}
        >
          Export CSV
        </FormoraButton>
      </div>

      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="glass-panel glass-panel-hover rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-white/80 shadow-card relative overflow-hidden">
          <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold mb-1">
            <Droplet className="w-4 h-4" />
            <span>Avg Soil Moisture</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {summaryData ? `${summaryData.avgSoilMoisture}%` : '43.5%'}
          </p>
          <p className="text-[11px] font-medium text-slate-400 mt-1">Target range: 40% - 60%</p>
        </div>

        <div className="glass-panel glass-panel-hover rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-white/80 shadow-card relative overflow-hidden">
          <div className="flex items-center gap-2 text-amber-700 text-xs font-bold mb-1">
            <Thermometer className="w-4 h-4" />
            <span>Avg Temperature</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {summaryData ? `${summaryData.avgTemperature}°C` : '29.1°C'}
          </p>
          <p className="text-[11px] font-medium text-slate-400 mt-1">Optimal growing climate</p>
        </div>

        <div className="glass-panel glass-panel-hover rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-white/80 shadow-card relative overflow-hidden">
          <div className="flex items-center gap-2 text-blue-700 text-xs font-bold mb-1">
            <Activity className="w-4 h-4" />
            <span>Watering Events</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {summaryData ? summaryData.totalWateringEvents : '12'}
          </p>
          <p className="text-[11px] font-medium text-slate-400 mt-1">Automated pump cycles</p>
        </div>

        <div className="glass-panel glass-panel-hover rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-white/80 shadow-card relative overflow-hidden">
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold mb-1">
            <CloudRain className="w-4 h-4" />
            <span>Rain Events</span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {summaryData ? summaryData.rainEvents : '0'}
          </p>
          <p className="text-[11px] font-medium text-slate-400 mt-1">Natural precipitation</p>
        </div>
      </div>

      {/* Main Historical Chart */}
      <div className="glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-white/80 shadow-card mb-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Moisture & Temperature Trend Lines
        </h3>
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMoist" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorTemp" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="5%" stopColor="#F97316" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F1" vertical={false} />
              <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="soilMoisture"
                name="Soil Moisture (%)"
                stroke="#10B981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorMoist)"
              />
              <Area
                type="monotone"
                dataKey="temperature"
                name="Temperature (°C)"
                stroke="#F97316"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorTemp)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Historical Data Log Table */}
      <div className="glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-white/80 shadow-card">
        <h3 className="text-base font-bold text-slate-900 mb-3">Recorded SQLite Telemetry Log</h3>
        <div className="overflow-x-auto max-h-[360px]">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-500">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Timestamp</th>
                <th className="py-2.5 px-3 font-semibold">Moisture</th>
                <th className="py-2.5 px-3 font-semibold">Temperature</th>
                <th className="py-2.5 px-3 font-semibold">Humidity</th>
                <th className="py-2.5 px-3 font-semibold">Rain</th>
                <th className="py-2.5 px-3 font-semibold">Watering</th>
                <th className="py-2.5 px-3 font-semibold">Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {historyData.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-2 px-3 font-mono text-slate-600">
                    {new Date(row.created_at).toLocaleString()}
                  </td>
                  <td className="py-2 px-3 font-bold text-emerald-700">{row.soil_moisture}%</td>
                  <td className="py-2 px-3 font-bold text-amber-700">{row.temperature} °C</td>
                  <td className="py-2 px-3 text-slate-700">{row.humidity}%</td>
                  <td className="py-2 px-3">{row.rain ? 'Yes' : 'No'}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                      row.watering ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-600'
                    }`}>
                      {row.watering ? 'Active' : 'Idle'}
                    </span>
                  </td>
                  <td className="py-2 px-3 uppercase text-[11px] font-semibold text-slate-500">
                    {row.watering_mode}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

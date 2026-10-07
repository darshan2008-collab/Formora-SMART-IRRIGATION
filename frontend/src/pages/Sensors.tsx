import React from 'react';
import { 
  Sprout, 
  Thermometer, 
  Droplets, 
  CloudRain, 
  Power, 
  Gauge, 
  CheckCircle, 
  AlertTriangle 
} from 'lucide-react';
import { Header } from '../components/Header.js';
import { useSensorData } from '../hooks/useSensorData.js';
import { 
  getSoilStatus, 
  getTemperatureStatus, 
  getRainStatus, 
  getWateringStatus 
} from '../utils/sensorStatus.js';

export const Sensors: React.FC = () => {
  const { reading, connectionStatus, isDemo, refetch, lastSyncTime } = useSensorData(4000);

  const soilMoisture = reading?.soil_moisture ?? null;
  const temperature = reading?.temperature ?? null;
  const humidity = reading?.humidity ?? null;
  const rain = reading ? Boolean(reading.rain) : null;
  const isWatering = reading ? Boolean(reading.watering) : null;
  const wateringMode = reading?.watering_mode ?? 'manual';

  const soilStatus = soilMoisture !== null ? getSoilStatus(soilMoisture) : null;
  const tempStatus = temperature !== null ? getTemperatureStatus(temperature) : null;
  const rainStatus = rain !== null ? getRainStatus(rain) : null;
  const waterStatus = isWatering !== null ? getWateringStatus(isWatering, wateringMode) : null;

  const sensorCards = [
    {
      id: 'soil_moisture',
      name: 'Soil Moisture Probe',
      type: 'Capacitive v1.2 Corrosion-Resistant',
      value: soilMoisture !== null ? `${soilMoisture}%` : 'Sensor unavailable',
      status: soilStatus?.status || 'No reading',
      icon: Sprout,
      color: 'text-emerald-700',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30',
      glow: 'rgba(16, 185, 129, 0.14)',
      range: '0% - 100% Volumetric',
      optimal: '40% - 70% Root Zone',
      healthy: soilMoisture !== null && soilMoisture >= 30,
    },
    {
      id: 'temperature',
      name: 'Ambient Temperature',
      type: 'DHT22 Digital Temperature Core',
      value: temperature !== null ? `${temperature} °C` : 'Sensor unavailable',
      status: tempStatus?.status || 'No reading',
      icon: Thermometer,
      color: 'text-amber-700',
      iconBg: 'bg-amber-500/15 border-amber-500/30',
      glow: 'rgba(245, 158, 11, 0.14)',
      range: '-40°C to +80°C',
      optimal: '18°C - 32°C Farm Climate',
      healthy: temperature !== null && temperature < 40,
    },
    {
      id: 'humidity',
      name: 'Relative Humidity',
      type: 'DHT22 Capacitive Polymer Grid',
      value: humidity !== null ? `${humidity}%` : 'Sensor unavailable',
      status: humidity !== null ? (humidity > 70 ? 'High atmospheric vapor' : humidity < 40 ? 'Dry air' : 'Balanced humidity') : 'No reading',
      icon: Droplets,
      color: 'text-sky-700',
      iconBg: 'bg-sky-500/15 border-sky-500/30',
      glow: 'rgba(14, 165, 233, 0.14)',
      range: '0% - 100% RH',
      optimal: '50% - 75% Leaf Transpiration',
      healthy: humidity !== null,
    },
    {
      id: 'rain_sensor',
      name: 'Precipitation Plate',
      type: 'Conductive Array Rain Detector',
      value: rain !== null ? (rain ? 'Precipitation Active' : 'Clear Sky') : 'Sensor unavailable',
      status: rainStatus?.status || 'No reading',
      icon: CloudRain,
      color: 'text-teal-700',
      iconBg: 'bg-teal-500/15 border-teal-500/30',
      glow: 'rgba(20, 184, 166, 0.14)',
      range: 'Digital Trigger (0 / 1)',
      optimal: 'Dry (for automated irrigation)',
      healthy: rain !== null,
    },
    {
      id: 'water_pump',
      name: 'Submersible Pump Relay',
      type: '12V DC Optocoupled Driver',
      value: isWatering !== null ? (isWatering ? 'Pump Actively Flowing' : 'Pump Standby') : 'Unavailable',
      status: isWatering ? 'Hydrating soil beds under scheduled cycle' : 'Motor relay idle & safe',
      icon: Power,
      color: isWatering ? 'text-blue-600' : 'text-slate-600',
      iconBg: isWatering ? 'bg-blue-500/20 border-blue-400/40' : 'bg-slate-100 border-slate-200',
      glow: isWatering ? 'rgba(59, 130, 246, 0.2)' : 'rgba(148, 163, 184, 0.1)',
      range: '12V Relay Intermittent',
      optimal: 'Cycle Triggered (<30%)',
      healthy: isWatering !== null,
    },
    {
      id: 'irrigation_system',
      name: 'Automated Solenoid Loop',
      type: 'Intelligent ESP32 Logic Engine',
      value: wateringMode === 'automatic' ? 'Autonomous Mode' : 'Manual Override',
      status: waterStatus?.status || 'Ready for actuation',
      icon: Gauge,
      color: 'text-purple-700',
      iconBg: 'bg-purple-500/15 border-purple-500/30',
      glow: 'rgba(139, 92, 246, 0.14)',
      range: 'Autonomous / Manual Control',
      optimal: 'Autonomous Smart Mode',
      healthy: true,
    }
  ];

  return (
    <div className="pb-28 sm:pb-32 lg:pb-8">
      <Header
        title="Hardware Sensors & Telemetry"
        subtitle="Live telemetry and health monitoring across all farm probes"
        connectionStatus={connectionStatus}
        isDemo={isDemo}
        onRefresh={refetch}
        lastSyncTime={lastSyncTime}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {sensorCards.map((sensor) => {
          const Icon = sensor.icon;
          return (
            <div
              key={sensor.id}
              className="glass-panel glass-panel-hover rounded-2xl sm:rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between border border-white/80 group"
            >
              {/* Radial ambient glow */}
              <div
                className="absolute -top-12 -right-12 w-32 h-32 rounded-full pointer-events-none blur-2xl transition-opacity duration-500 opacity-60 group-hover:opacity-100"
                style={{ background: sensor.glow }}
              />

              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center flex-shrink-0 shadow-xs transition-transform duration-300 group-hover:scale-105 ${sensor.iconBg} ${sensor.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 leading-tight">
                        {sensor.name}
                      </h4>
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{sensor.type}</p>
                    </div>
                  </div>

                  {sensor.healthy ? (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-xs">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Online</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 shadow-xs">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Offline</span>
                    </span>
                  )}
                </div>

                {/* Main Readout */}
                <div className="mb-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Current Reading
                  </p>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {sensor.value}
                  </p>
                  <p className="text-xs font-semibold text-slate-600 mt-1">
                    {sensor.status}
                  </p>
                </div>
              </div>

              {/* Specs & Metadata */}
              <div className="pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs text-slate-500 font-medium relative z-10">
                <div>
                  <span className="text-slate-400 font-normal">Range:</span> <strong className="font-mono text-slate-700">{sensor.range}</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-normal">Target:</span> <strong className="text-farm-900">{sensor.optimal}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

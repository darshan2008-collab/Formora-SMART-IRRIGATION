import React, { useState, useEffect } from 'react';
import { Droplet, Play, Square, AlertTriangle, CheckCircle2, Waves, Gauge, Clock } from 'lucide-react';
import { api } from '../services/api.js';
import { FormoraButton } from './FormoraButton.js';

interface WateringControlProps {
  isWatering: boolean;
  wateringMode: 'manual' | 'automatic';
  soilMoisture: number;
  onRefresh: () => void;
}

export const WateringControl: React.FC<WateringControlProps> = ({
  isWatering,
  wateringMode,
  soilMoisture,
  onRefresh,
}) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [activeSeconds, setActiveSeconds] = useState<number>(0);
  const [selectedDuration, setSelectedDuration] = useState<number>(5); // default 5 mins

  // Active duration counter when watering is running
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;
    if (isWatering) {
      timer = setInterval(() => {
        setActiveSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setActiveSeconds(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isWatering]);

  const handleStart = async () => {
    try {
      setIsProcessing(true);
      setMessage(null);
      await api.startWatering(selectedDuration);
      setMessage({
        text: `Irrigation initiated for ${selectedDuration} min cycle.`,
        type: 'success',
      });
      onRefresh();
    } catch (err: any) {
      setMessage({
        text: err?.response?.data?.message || 'Failed to trigger irrigation valve.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStop = async () => {
    try {
      setIsProcessing(true);
      setMessage(null);
      await api.stopWatering();
      setMessage({
        text: 'Irrigation valve closed successfully.',
        type: 'success',
      });
      onRefresh();
    } catch (err: any) {
      setMessage({
        text: err?.response?.data?.message || 'Failed to stop irrigation pump.',
        type: 'error',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleModeChange = async (mode: 'manual' | 'automatic') => {
    try {
      setIsProcessing(true);
      await api.setMode(mode);
      onRefresh();
    } catch (err) {
      console.error('Mode change error', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Format active seconds into mm:ss
  const formatTimer = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-white/80 shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors duration-500 ${
              isWatering
                ? 'bg-blue-500/20 text-blue-600 border border-blue-400/40'
                : 'bg-emerald-500/15 text-emerald-700 border border-emerald-400/30'
            }`}
          >
            {isWatering ? (
              <Waves className="w-5 h-5 animate-water" />
            ) : (
              <Droplet className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                Irrigation Controller
              </h3>
              {isWatering && (
                <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                  {formatTimer(activeSeconds)}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">Pump & Solenoid Valve Automation</p>
          </div>
        </div>

        {/* Current State Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border shadow-xs ${
            isWatering
              ? 'bg-blue-50 text-blue-800 border-blue-200 animate-pulse'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isWatering ? 'bg-blue-600 animate-ping' : 'bg-slate-400'
            }`}
          />
          {isWatering ? 'Pump Active' : 'Standby'}
        </span>
      </div>

      {/* Safety Notice if soil is already saturated */}
      {soilMoisture >= 75 && !isWatering && (
        <div className="mb-3 px-3.5 py-2.5 rounded-xl bg-amber-50/90 border border-amber-200/80 flex items-center gap-2 text-xs text-amber-800 animate-fade-in">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600" />
          <span>Soil moisture is high ({soilMoisture}%). Additional irrigation may cause root saturation.</span>
        </div>
      )}

      {/* Mode Selector Tabs */}
      <div className="bg-[#F4F8F4] p-1 rounded-xl flex items-center mb-4 border border-slate-200/60">
        <button
          type="button"
          onClick={() => handleModeChange('manual')}
          disabled={isProcessing}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            wateringMode === 'manual'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Manual Override
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('automatic')}
          disabled={isProcessing}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            wateringMode === 'automatic'
              ? 'bg-farm-700 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Automated Smart Triggers
        </button>
      </div>

      {/* Duration Selector (Only shown in manual mode or when configuring cycles) */}
      {!isWatering && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Target Duration
            </span>
            <span className="font-mono text-farm-900">{selectedDuration} Minutes</span>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[1, 5, 10, 15].map((mins) => (
              <button
                key={mins}
                type="button"
                onClick={() => setSelectedDuration(mins)}
                className={`py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  selectedDuration === mins
                    ? 'bg-farm-700 text-white border-farm-700 shadow-xs'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-farm-300'
                }`}
              >
                {mins}m
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Threshold Zone Visualizer */}
      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 mb-4">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1.5">
          <span>Auto Threshold Range</span>
          <span className="font-mono font-bold text-slate-700">Current: {soilMoisture}%</span>
        </div>
        <div className="w-full h-2 rounded-full overflow-hidden flex bg-slate-200/80 mb-1">
          <div className="w-[30%] bg-rose-400" title="<30% Auto Starts" />
          <div className="w-[30%] bg-emerald-400" title="30%-60% Target Growth" />
          <div className="w-[40%] bg-blue-400" title=">=60% Auto Stops" />
        </div>
        <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase">
          <span className="text-rose-600">Auto Start (&lt;30%)</span>
          <span className="text-emerald-700">Target (30-60%)</span>
          <span className="text-blue-600">Auto Stop (&ge;60%)</span>
        </div>
      </div>

      {/* Action Buttons with .btn-17 Skew-Swipe & Rolling Text */}
      <div className="grid grid-cols-2 gap-3">
        <FormoraButton
          type="button"
          variant="farm"
          size="md"
          fullWidth
          onClick={handleStart}
          disabled={isWatering || isProcessing}
          icon={<Play className="w-3.5 h-3.5 fill-current" />}
        >
          Start Watering
        </FormoraButton>

        <FormoraButton
          type="button"
          variant="danger"
          size="md"
          fullWidth
          onClick={handleStop}
          disabled={!isWatering || isProcessing}
          icon={<Square className="w-3.5 h-3.5 fill-current" />}
        >
          Stop Watering
        </FormoraButton>
      </div>

      {/* Feedback Alert */}
      {message && (
        <div
          className={`mt-3.5 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
              : 'bg-rose-50 text-rose-800 border border-rose-200/80'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          )}
          <span className="truncate font-medium">{message.text}</span>
        </div>
      )}
    </div>
  );
};

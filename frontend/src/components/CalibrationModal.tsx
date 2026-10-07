import React, { useState } from 'react';
import { X, Sliders, CheckCircle2 } from 'lucide-react';
import { FormoraButton } from './FormoraButton.js';

interface CalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalibrationModal: React.FC<CalibrationModalProps> = ({ isOpen, onClose }) => {
  const [moistureOffset, setMoistureOffset] = useState<number>(() => {
    return parseFloat(localStorage.getItem('calib_moisture_offset') || '0');
  });
  const [tempOffset, setTempOffset] = useState<number>(() => {
    return parseFloat(localStorage.getItem('calib_temp_offset') || '0');
  });
  const [humOffset, setHumOffset] = useState<number>(() => {
    return parseFloat(localStorage.getItem('calib_hum_offset') || '0');
  });
  const [saved, setSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSave = () => {
    localStorage.setItem('calib_moisture_offset', moistureOffset.toString());
    localStorage.setItem('calib_temp_offset', tempOffset.toString());
    localStorage.setItem('calib_hum_offset', humOffset.toString());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 900);
  };

  const handleReset = () => {
    setMoistureOffset(0);
    setTempOffset(0);
    setHumOffset(0);
    localStorage.removeItem('calib_moisture_offset');
    localStorage.removeItem('calib_temp_offset');
    localStorage.removeItem('calib_hum_offset');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fade-in">
      <div className="glass-panel rounded-3xl max-w-md w-full p-6 shadow-2xl border border-white/90 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-farm-50 text-farm-700 flex items-center justify-center">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Sensor Calibration</h3>
              <p className="text-xs text-slate-500">Fine-tune hardware reading offsets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Offsets */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Soil Moisture Offset</span>
              <span className="font-mono text-farm-700 font-bold">{moistureOffset > 0 ? `+${moistureOffset}` : moistureOffset}%</span>
            </div>
            <input
              type="range"
              min="-20"
              max="20"
              step="0.5"
              value={moistureOffset}
              onChange={(e) => setMoistureOffset(parseFloat(e.target.value))}
              className="w-full accent-farm-700"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Temperature Offset</span>
              <span className="font-mono text-amber-700 font-bold">{tempOffset > 0 ? `+${tempOffset}` : tempOffset}°C</span>
            </div>
            <input
              type="range"
              min="-10"
              max="10"
              step="0.2"
              value={tempOffset}
              onChange={(e) => setTempOffset(parseFloat(e.target.value))}
              className="w-full accent-amber-600"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>Humidity Offset</span>
              <span className="font-mono text-blue-700 font-bold">{humOffset > 0 ? `+${humOffset}` : humOffset}%</span>
            </div>
            <input
              type="range"
              min="-20"
              max="20"
              step="0.5"
              value={humOffset}
              onChange={(e) => setHumOffset(parseFloat(e.target.value))}
              className="w-full accent-blue-600"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-between gap-3 mt-6 pt-4 border-t border-slate-100">
          <FormoraButton
            type="button"
            variant="outline"
            size="xs"
            onClick={handleReset}
          >
            Reset Defaults
          </FormoraButton>

          <FormoraButton
            type="button"
            variant="farm"
            size="sm"
            onClick={handleSave}
            icon={saved ? <CheckCircle2 className="w-4 h-4" /> : undefined}
          >
            {saved ? 'Saved!' : 'Save Calibration'}
          </FormoraButton>
        </div>
      </div>
    </div>
  );
};

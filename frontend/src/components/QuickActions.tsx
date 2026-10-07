import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Sliders, Settings2, ChevronRight, Activity } from 'lucide-react';

interface QuickActionsProps {
  onOpenCalibration: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ onOpenCalibration }) => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Sensor Diagnostics',
      subtitle: 'View live multichannel probes',
      icon: LineChart,
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      hoverBorder: 'hover:border-emerald-300',
      onClick: () => navigate('/sensors'),
    },
    {
      title: 'Probe Calibration',
      subtitle: 'Adjust analog & capacitive offsets',
      icon: Sliders,
      iconBg: 'bg-blue-50 text-blue-700 border-blue-200/80',
      hoverBorder: 'hover:border-blue-300',
      onClick: onOpenCalibration,
    },
    {
      title: 'System Settings',
      subtitle: 'ESP32 Wi-Fi & auto irrigation limits',
      icon: Settings2,
      iconBg: 'bg-purple-50 text-purple-700 border-purple-200/80',
      hoverBorder: 'hover:border-purple-300',
      onClick: () => navigate('/settings'),
    },
  ];

  return (
    <div className="glass-panel rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-white/80 shadow-card">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            Quick Actions
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Rapid controls & diagnostic shortcuts</p>
        </div>
        <span className="p-2 rounded-xl bg-slate-50 text-slate-400">
          <Activity className="w-4 h-4" />
        </span>
      </div>

      <div className="space-y-3">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.title}
              onClick={act.onClick}
              className={`w-full flex items-center justify-between p-3.5 rounded-2xl border border-slate-100/90 bg-white/70 hover:bg-white transition-all duration-200 text-left group shadow-xs hover:shadow-sm ${act.hoverBorder}`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-105 ${act.iconBg}`}
                >
                  <Icon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-farm-900 transition-colors">
                    {act.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{act.subtitle}</p>
                </div>
              </div>

              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-farm-700 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
            </button>
          );
        })}
      </div>
    </div>
  );
};

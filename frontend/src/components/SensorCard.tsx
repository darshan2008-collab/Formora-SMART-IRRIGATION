import React from 'react';

export interface SensorCardProps {
  title: string;
  value: string;
  statusText: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  cardBgColor?: string;
  borderColor?: string;
  progressPercent: number;
  progressBarColor?: string;
  progressTrackColor?: string;
  unit?: string;
  variant?: 'emerald' | 'amber' | 'sky' | 'purple';
  trendText?: string;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  title,
  value,
  statusText,
  icon,
  progressPercent,
  unit,
  variant = 'emerald',
  trendText,
}) => {
  // Theme palette matching exact reference mockup in Image 2
  const theme = {
    emerald: {
      cardBg: 'bg-[#EAF5ED]/95',
      border: 'border-[#D1EAD7]',
      iconBg: 'bg-[#D2EBD5] text-[#166534]',
      bar: 'bg-[#10B981]',
      track: 'bg-white',
      shadow: 'shadow-[0_4px_16px_rgba(34,197,94,0.06)]',
    },
    amber: {
      cardBg: 'bg-[#FFF7ED]/95',
      border: 'border-[#FED7AA]',
      iconBg: 'bg-[#FEE4C8] text-[#EA580C]',
      bar: 'bg-[#FB923C]',
      track: 'bg-white',
      shadow: 'shadow-[0_4px_16px_rgba(249,115,22,0.06)]',
    },
    sky: {
      cardBg: 'bg-[#EFF6FF]/95',
      border: 'border-[#DBEAFE]',
      iconBg: 'bg-[#CEE5FF] text-[#0284C7]',
      bar: 'bg-[#06B6D4]',
      track: 'bg-white',
      shadow: 'shadow-[0_4px_16px_rgba(14,165,233,0.06)]',
    },
    purple: {
      cardBg: 'bg-[#F5F3FF]/95',
      border: 'border-[#E9D5FF]',
      iconBg: 'bg-[#E3DCFE] text-[#7C3AED]',
      bar: 'bg-[#A78BFA]',
      track: 'bg-white',
      shadow: 'shadow-[0_4px_16px_rgba(139,92,246,0.06)]',
    },
  }[variant];

  // Derive badge main label from trendText or default to sensor key
  const badgeMain = trendText
    ? trendText.replace(/(Sensor|Probe|Status|Optical)/gi, '').trim().slice(0, 5) || 'OK'
    : 'LIVE';

  return (
    <div className="uiverse-card-parent">
      <div className={`uiverse-card theme-${variant}`}>
        {/* Uiverse Signature Floating Badge (.date-box adaptation) */}
        <div className="uiverse-date-box">
          <span className="badge-month">LIVE</span>
          <span className="badge-date">{badgeMain}</span>
        </div>

        {/* Content Box (Frosted Glass Overlay matching Screenshot Palette) */}
        <div className="uiverse-content-box">
          {/* Top Section: Circular Icon + Title & Value */}
          <div className="flex items-start gap-2.5 sm:gap-3.5 pr-10 sm:pr-12">
            {/* 3D Floating Circular Icon Container */}
            <div
              className={`uiverse-icon w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow-xs border border-white/80 ${theme.iconBg}`}
            >
              {icon}
            </div>

            {/* Title & Metric Readout with 3D Z-Depth */}
            <div className="flex-1 min-w-0">
              <p className="uiverse-title text-[11px] sm:text-xs font-semibold text-slate-600 mb-0.5 tracking-tight truncate block">
                {title}
              </p>
              <div className="uiverse-value flex items-baseline gap-1">
                <span className="text-lg sm:text-2xl lg:text-[26px] font-black text-slate-900 tracking-tight leading-none truncate">
                  {value}
                </span>
                {unit && (
                  <span className="text-xs sm:text-sm font-bold text-slate-500">
                    {unit}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Bottom Section: 3D Floating Progress Bar + Status Text */}
          <div className="mt-2 sm:mt-3">
            {/* Clean White Progress Track with 3D elevation */}
            <div className={`uiverse-progress w-full h-2 rounded-full overflow-hidden ${theme.track} mb-1 sm:mb-1.5 shadow-inner`}>
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${theme.bar}`}
                style={{ width: `${Math.min(Math.max(progressPercent, 6), 100)}%` }}
              />
            </div>

            {/* Status Text under progress bar */}
            <p className="uiverse-status text-[10.5px] sm:text-xs font-medium text-slate-600 truncate leading-tight">
              {statusText}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

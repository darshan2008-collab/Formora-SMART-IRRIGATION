import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Radio, History, Settings, ChevronRight } from 'lucide-react';
import { BrandLogo } from './BrandLogo.js';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/sensors', label: 'Sensors', icon: Radio },
    { to: '/history', label: 'History', icon: History },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-[#EEF6ED]/85 backdrop-blur-2xl border-r border-[#D2E7D2]/80 p-5 sm:p-6 justify-between select-none z-30 flex-shrink-0 overflow-hidden shadow-[4px_0_24px_rgba(26,56,38,0.04)] relative">
      {/* Mild Ambient Background Effects (Organic Glow & Topographic Contour Lines) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Top soft emerald radial glow */}
        <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-gradient-to-br from-emerald-200/40 via-farm-200/20 to-transparent blur-2xl" />
        
        {/* Center subtle warm organic warmth */}
        <div className="absolute top-1/2 -right-20 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-bl from-amber-100/30 via-emerald-100/20 to-transparent blur-2xl" />

        {/* Bottom lush hydration glow */}
        <div className="absolute -bottom-16 -left-12 w-60 h-60 rounded-full bg-gradient-to-tr from-emerald-300/25 via-farm-200/20 to-transparent blur-3xl" />

        {/* Subtle organic topographic contour watermark */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.04] mix-blend-multiply"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 256 900"
          fill="none"
          preserveAspectRatio="none"
        >
          <path d="M-50 120 C40 180, 160 80, 300 160" stroke="#1A3826" strokeWidth="2" />
          <path d="M-50 280 C60 220, 180 340, 300 290" stroke="#1A3826" strokeWidth="2" />
          <path d="M-50 440 C80 500, 150 400, 300 460" stroke="#1A3826" strokeWidth="2" />
          <path d="M-50 600 C30 550, 190 680, 300 620" stroke="#1A3826" strokeWidth="2" />
          <path d="M-50 760 C70 820, 160 720, 300 780" stroke="#1A3826" strokeWidth="2" />
        </svg>
      </div>

      {/* Brand Header & Navigation */}
      <div>
        <div className="flex items-center gap-3.5 mb-7">
          <BrandLogo size="md" />
          <div>
            <h1 className="text-xl font-black text-farm-900 leading-tight tracking-tight">Formora</h1>
            <p className="text-xs text-[#5D7A68] font-semibold">Soil Irrigation System</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-300 group ${
                    isActive
                      ? 'bg-gradient-to-r from-farm-800 to-farm-700 text-white shadow-lg shadow-farm-800/25 font-bold translate-x-1'
                      : 'text-[#4A6653] hover:bg-white/80 hover:text-farm-900 hover:translate-x-0.5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3.5">
                      <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? 'scale-110 text-emerald-300' : 'group-hover:scale-110'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && (
                      <ChevronRight className="w-4 h-4 text-emerald-300" />
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* System Telemetry Engine Live Pill */}
        <div className="mt-6 px-3.5 py-2.5 rounded-2xl bg-white/75 backdrop-blur-md border border-white/90 shadow-xs flex items-center justify-between text-xs">
          <span className="flex items-center gap-2 text-farm-900 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse-dot" />
            Active Monitor
          </span>
          <span className="font-mono text-[10px] font-black text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md border border-emerald-200/60">
            2.4GHz ESP
          </span>
        </div>
      </div>

      {/* Neat & Premium Plant Quotation Card */}
      <div className="relative mt-auto pt-4">
        <div className="relative p-3.5 rounded-2xl bg-white/80 backdrop-blur-md border border-white/95 shadow-[0_8px_20px_-6px_rgba(26,56,38,0.06)] overflow-hidden group hover:bg-white/90 hover:shadow-[0_12px_24px_-6px_rgba(26,56,38,0.1)] transition-all duration-300">
          {/* Subtle card internal ambient glow */}
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-200/30 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center gap-3 relative z-10">
            {/* Refined Botanical Plant Illustration with Gradients & Dewdrop */}
            <div className="w-14 h-20 flex-shrink-0 relative transition-transform duration-500 group-hover:scale-105">
              <svg
                className="w-full h-full overflow-visible"
                viewBox="0 0 60 90"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient id="stemGradient" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#2D5A3F" />
                    <stop offset="100%" stopColor="#34D399" />
                  </linearGradient>
                  <linearGradient id="leafGradPrimary" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="60%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#6EE7B7" />
                  </linearGradient>
                  <linearGradient id="leafGradSecondary" x1="100%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#047857" />
                    <stop offset="50%" stopColor="#34D399" />
                    <stop offset="100%" stopColor="#A7F3D0" />
                  </linearGradient>
                  <filter id="leafShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#1A3826" floodOpacity="0.12" />
                  </filter>
                </defs>

                {/* Plant Stem */}
                <path
                  d="M 22 90 C 22 72, 25 55, 30 38 C 32 28, 29 18, 22 10"
                  stroke="url(#stemGradient)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* 1. Apex Leaf */}
                <path
                  d="M 22 10 C 13 6, 6 13, 10 21 C 14 28, 21 20, 22 10 Z"
                  fill="url(#leafGradPrimary)"
                  stroke="#10B981"
                  strokeWidth="0.8"
                  filter="url(#leafShadow)"
                />
                {/* Leaf vein */}
                <path d="M 20 12 C 16 16, 12 18, 11 20" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.6" strokeLinecap="round" />

                {/* 2. Upper-Right Leaf */}
                <path
                  d="M 28 26 C 38 18, 45 25, 41 34 C 37 42, 29 35, 28 26 Z"
                  fill="url(#leafGradSecondary)"
                  stroke="#10B981"
                  strokeWidth="0.8"
                  filter="url(#leafShadow)"
                />
                <path d="M 29 28 C 34 30, 38 32, 40 33" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.6" strokeLinecap="round" />

                {/* 3. Lower-Left Leaf */}
                <path
                  d="M 26 48 C 13 41, 4 49, 8 59 C 12 67, 22 60, 26 48 Z"
                  fill="url(#leafGradPrimary)"
                  stroke="#10B981"
                  strokeWidth="0.8"
                  filter="url(#leafShadow)"
                />
                <path d="M 24 50 C 18 53, 13 56, 9 58" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.6" strokeLinecap="round" />

                {/* 4. Lower-Right Leaf */}
                <path
                  d="M 24 65 C 37 56, 45 64, 41 74 C 36 82, 27 75, 24 65 Z"
                  fill="url(#leafGradSecondary)"
                  stroke="#10B981"
                  strokeWidth="0.8"
                  filter="url(#leafShadow)"
                />
                <path d="M 26 67 C 32 70, 37 72, 40 73" stroke="#FFFFFF" strokeWidth="0.6" strokeOpacity="0.6" strokeLinecap="round" />

                {/* Glistening Morning Dewdrop on Apex Leaf */}
                <circle cx="12" cy="18" r="1.5" fill="#FFFFFF" fillOpacity="0.9" />
              </svg>
            </div>

            {/* Typographic Tagline with Hierarchy & Micro-Badge */}
            <div className="flex-1 min-w-0 select-none">
              <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-100/90 border border-emerald-200/70 mb-1">
                <span className="w-1 h-1 rounded-full bg-emerald-600" />
                <span className="text-[8.5px] font-black uppercase tracking-wider text-emerald-800">Agri Motto</span>
              </div>
              <p className="text-[11.5px] font-semibold text-slate-600 leading-tight">
                Healthy Soil
              </p>
              <p className="text-[11.5px] font-bold text-emerald-700 leading-tight">
                Happy Plants
              </p>
              <p className="text-[13px] font-black text-farm-900 leading-tight tracking-tight">
                Better Yield
              </p>
            </div>
          </div>

          {/* Bottom subtle indicator line */}
          <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[9.5px] font-bold text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
              Soil Vitality
            </span>
            <span className="text-emerald-700 font-extrabold font-mono">100% Opt</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

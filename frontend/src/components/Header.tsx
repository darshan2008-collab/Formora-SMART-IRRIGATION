import React, { useState, useEffect } from 'react';
import { Wifi, Settings, RefreshCw, Clock, Menu, X, LayoutDashboard, Radio, History as HistoryIcon, ChevronRight, Activity, Calendar } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import { formatDateHeader } from '../utils/sensorStatus.js';
import { BrandLogo } from './BrandLogo.js';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  connectionStatus: 'connected' | 'disconnected' | 'demo' | 'connecting';
  isDemo?: boolean;
  onRefresh?: () => void;
  lastSyncTime?: Date;
}

export const Header: React.FC<HeaderProps> = ({
  title = 'Soil Irrigation Dashboard',
  subtitle = 'Real-time monitoring of soil, temperature and rain conditions',
  connectionStatus,
  isDemo = false,
  onRefresh,
  lastSyncTime
}) => {
  const [currentTime, setCurrentTime] = useState<{ dateStr: string; timeStr: string }>(formatDateHeader());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(formatDateHeader());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRefreshClick = () => {
    if (onRefresh) {
      setIsRotating(true);
      onRefresh();
      setTimeout(() => setIsRotating(false), 800);
    }
  };

  const getStatusBadge = (isCompact: boolean = false) => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-emerald-500/10 text-emerald-900 border border-emerald-500/30 shadow-xs ${
            isCompact ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
          }`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-extrabold">{isCompact ? 'Connected' : 'ESP32 2.4GHz Online'}</span>
          </span>
        );
      case 'connecting':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-blue-500/10 text-blue-900 border border-blue-500/30 shadow-xs ${
            isCompact ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
          }`}>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-spin" />
            <span>Connecting...</span>
          </span>
        );
      case 'demo':
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full font-black bg-gradient-to-r from-amber-500/15 to-orange-500/15 text-amber-900 border border-amber-500/30 shadow-xs ${
            isCompact ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
          }`}>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse-dot" />
            <span>{isCompact ? 'DEMO' : 'DEMO MODE • Standby'}</span>
          </span>
        );
      default:
        return (
          <span className={`inline-flex items-center gap-1.5 rounded-full font-bold bg-rose-500/10 text-rose-900 border border-rose-500/30 shadow-xs ${
            isCompact ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'
          }`}>
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Offline</span>
          </span>
        );
    }
  };

  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/sensors', label: 'Sensors', icon: Radio },
    { to: '/history', label: 'History', icon: HistoryIcon },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* =========================================================================
          MOBILE HEADER (Fixed to Top Edge, Zero Gaps, Integrated Sandwich Bar)
          ========================================================================= */}
      <header className="fixed top-0 left-0 right-0 z-40 lg:hidden w-full bg-white/92 backdrop-blur-2xl border-b border-slate-200/80 shadow-[0_4px_20px_rgba(26,56,38,0.06)] px-4 py-2.5 select-none transition-all">
        {/* Top Brand & Actions Bar */}
        <div className="flex items-center justify-between">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-2.5">
            <BrandLogo size="sm" />
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-black text-farm-900 leading-tight tracking-tight">Formora</h1>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-dot" />
              </div>
              <p className="text-[9px] text-[#5D7A68] font-bold uppercase tracking-wider">Soil Irrigation System</p>
            </div>
          </div>

          {/* Right Actions: Compact Status + Refresh + Sandwich Menu */}
          <div className="flex items-center gap-1.5">
            {getStatusBadge(true)}

            {onRefresh && (
              <button
                onClick={handleRefreshClick}
                className="w-8 h-8 rounded-xl bg-white hover:bg-slate-50 text-slate-700 active:scale-90 transition-all border border-slate-200/80 flex items-center justify-center shadow-2xs"
                title="Sync Live Sensors"
                aria-label="Refresh Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-700 transition-transform duration-700 ${isRotating ? 'rotate-180 text-emerald-600' : ''}`} />
              </button>
            )}

            {/* Sandwich Bar Button (Hamburger ≡) */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="w-8 h-8 rounded-xl bg-emerald-900 text-white hover:bg-emerald-950 active:scale-90 transition-all flex items-center justify-center shadow-xs group"
              title="Open Navigation Menu"
              aria-label="Sandwich Menu"
            >
              <Menu className="w-4 h-4 text-emerald-100 transition-transform duration-200 group-hover:scale-110" />
            </button>
          </div>
        </div>

        {/* Secondary Title & Clock Strip */}
        <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-100/90 gap-2">
          <div className="min-w-0 flex-1">
            <h2 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight truncate leading-none">
              {title}
            </h2>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-slate-100/80 text-slate-700 font-mono text-[10px] font-bold flex-shrink-0">
            <Clock className="w-2.5 h-2.5 text-slate-400" />
            <span>{currentTime.timeStr}</span>
          </div>
        </div>
      </header>

      {/* Mobile Clearance Spacer (Prevents content from hiding behind fixed header) */}
      <div className="h-[88px] lg:hidden w-full flex-shrink-0" aria-hidden="true" />

      {/* =========================================================================
          DESKTOP & TABLET HEADER (Luxury Executive Glass Panel with Ambient Glow)
          ========================================================================= */}
      <header className="hidden lg:flex luxury-header-panel rounded-3xl p-5 mb-6 justify-between items-center select-none shadow-[0_10px_30px_-8px_rgba(26,56,38,0.07)]">
        {/* Left Side: Modern Brand Hierarchy & Page Title */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 text-[10.5px] font-black uppercase tracking-wider mb-2 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Formora Core • Soil Irrigation System</span>
          </div>

          <h1 className="text-2xl sm:text-[28px] font-black text-slate-900 tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-xs sm:text-[13px] text-slate-500 font-medium tracking-tight mt-1 leading-snug">
            {subtitle}
          </p>
        </div>

        {/* Right Side: High-End Telemetry Capsule */}
        <div className="relative z-10 flex items-center gap-3">
          {/* Integrated Capsule Container */}
          <div className="flex items-center gap-3.5 bg-white/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/95 shadow-[0_4px_20px_-4px_rgba(26,56,38,0.06)]">
            {/* Status Badge */}
            {getStatusBadge()}

            {/* Vertical Divider */}
            <div className="h-5 w-[1px] bg-slate-200/80" />

            {/* Date & Monospace Clock */}
            <div className="text-xs font-semibold text-slate-600 flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-slate-500">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{currentTime.dateStr}</span>
              </div>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5 font-bold font-mono text-slate-900 bg-slate-100/90 px-2 py-0.5 rounded-lg border border-slate-200/60 shadow-2xs">
                <Clock className="w-3 h-3 text-emerald-600" />
                <span>{currentTime.timeStr}</span>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="h-5 w-[1px] bg-slate-200/80" />

            {/* Actions Cluster */}
            <div className="flex items-center gap-1.5">
              {onRefresh && (
                <button
                  onClick={handleRefreshClick}
                  className="p-2 hover:text-emerald-700 hover:bg-emerald-50 text-slate-600 rounded-xl transition-all active:scale-90 border border-slate-200/60 bg-white shadow-2xs"
                  title="Sync Live Sensors"
                  aria-label="Refresh Data"
                >
                  <RefreshCw className={`w-4 h-4 transition-transform duration-700 ${isRotating ? 'rotate-180 text-emerald-600' : ''}`} />
                </button>
              )}

              <div
                className="p-2 text-slate-500 rounded-xl border border-slate-200/60 bg-white shadow-2xs"
                title={connectionStatus === 'connected' ? '2.4GHz Telemetry Linked' : 'Wi-Fi Standby'}
              >
                <Wifi className={`w-4 h-4 ${connectionStatus === 'connected' ? 'text-emerald-600' : 'text-slate-400'}`} />
              </div>

              <Link
                to="/settings"
                className="p-2 hover:text-slate-900 hover:bg-slate-100 text-slate-600 rounded-xl transition-all active:scale-90 border border-slate-200/60 bg-white shadow-2xs"
                title="System Settings"
                aria-label="Settings"
              >
                <Settings className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MOBILE SLIDE-OVER SANDWICH MENU DRAWER
          ========================================================================= */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Blur Overlay */}
          <div
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Slide-Over Drawer Panel */}
          <div className="fixed top-0 right-0 bottom-0 w-[290px] max-w-[85vw] bg-[#F7FAF7] border-l border-slate-200/80 shadow-2xl flex flex-col justify-between p-5 z-10 animate-in slide-in-from-right duration-300">
            <div>
              {/* Drawer Header: Brand + Close button */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/70 mb-4">
                <div className="flex items-center gap-2.5">
                  <BrandLogo size="sm" />
                  <div>
                    <h2 className="text-base font-black text-farm-900 leading-tight">Formora</h2>
                    <p className="text-[10px] text-slate-500 font-bold">Soil Irrigation System</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-white border border-slate-200/60 active:scale-90 transition-all shadow-2xs"
                  aria-label="Close Sandwich Menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Live Status Badge */}
              <div className="mb-4 p-3 rounded-2xl bg-white/90 border border-slate-200/70 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-700">Telemetry Status</span>
                </div>
                {getStatusBadge(true)}
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 px-1">Navigation Menu</p>
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsDrawerOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all ${
                          isActive
                            ? 'bg-farm-800 text-white shadow-sm'
                            : 'text-slate-700 hover:bg-white hover:text-farm-900'
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <div className="flex items-center gap-3">
                            <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : 'text-emerald-600'}`} />
                            <span>{item.label}</span>
                          </div>
                          <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-300' : 'text-slate-400'}`} />
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Drawer Footer Actions */}
            <div className="pt-4 border-t border-slate-200/70 space-y-3">
              {onRefresh && (
                <button
                  onClick={() => {
                    handleRefreshClick();
                    setIsDrawerOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-white hover:bg-emerald-50 text-farm-900 border border-slate-200/80 text-xs font-bold shadow-2xs transition-all active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Sync Sensor Telemetry</span>
                </button>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
                <span>Formora v1.0.0</span>
                <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                  2.4GHz ESP
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


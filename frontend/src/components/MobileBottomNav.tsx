import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Radio, History, Settings } from 'lucide-react';

export const MobileBottomNav: React.FC = () => {
  const items = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/sensors', label: 'Sensors', icon: Radio },
    { to: '/history', label: 'History', icon: History },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#DDEADD] px-2 py-1.5 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      aria-label="Mobile Navigation"
    >
      <div className="flex justify-around items-center max-w-md mx-auto">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[64px] py-1.5 px-3 rounded-xl transition-all duration-200 select-none ${
                  isActive
                    ? 'text-farm-900 font-extrabold bg-[#E4EFE3] shadow-sm border border-farm-200/60'
                    : 'text-slate-500 hover:text-slate-800 font-medium active:scale-95'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 mb-0.5 ${
                      isActive ? 'text-farm-800 stroke-[2.2]' : 'text-slate-500 stroke-[1.8]'
                    }`}
                  />
                  <span className="text-[10px] leading-tight tracking-tight">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

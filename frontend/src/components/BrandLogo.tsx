import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', size = 'md' }) => {
  const dimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  return (
    <div
      className={`${dimensions} rounded-2xl bg-gradient-to-br from-[#22C55E] via-[#16A34A] to-[#15803D] p-1.5 flex items-center justify-center shadow-md shadow-emerald-900/20 border border-emerald-400/40 relative overflow-hidden group select-none flex-shrink-0 ${className}`}
    >
      {/* Precision Vector Leaf with Water Droplet Emblem */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 transition-transform duration-300 group-hover:scale-105"
      >
        {/* Leaf Silhouette with gradient fill */}
        <path
          d="M 32 80 C 26 58, 38 32, 68 18 C 76 28, 80 48, 70 70 C 62 82, 46 86, 32 80 Z"
          fill="url(#leafBodyGrad)"
        />
        {/* Leaf Stem & Veins */}
        <path
          d="M 28 84 C 36 68, 48 48, 68 20"
          stroke="#15803D"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M 44 56 C 54 50, 64 48, 70 46"
          stroke="#15803D"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M 52 42 C 60 38, 68 34, 72 32"
          stroke="#15803D"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Irrigation Water Droplet */}
        <path
          d="M 54 58 C 54 58, 46 70, 46 76 C 46 81, 50 85, 55 85 C 60 85, 64 81, 64 76 C 64 70, 54 58, 54 58 Z"
          fill="url(#dropGrad)"
          stroke="#0284C7"
          strokeWidth="1.5"
        />
        {/* Droplet Light Reflection Highlight */}
        <path
          d="M 51 72 C 49 74, 49 78, 51 80"
          stroke="#FFFFFF"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeOpacity="0.8"
        />

        <defs>
          <linearGradient id="leafBodyGrad" x1="28" y1="20" x2="72" y2="82" gradientUnits="userSpaceOnUse">
            <stop stopColor="#86EFAC" />
            <stop offset="1" stopColor="#4ADE80" />
          </linearGradient>
          <linearGradient id="dropGrad" x1="55" y1="58" x2="55" y2="85" gradientUnits="userSpaceOnUse">
            <stop stopColor="#38BDF8" />
            <stop offset="1" stopColor="#0284C7" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

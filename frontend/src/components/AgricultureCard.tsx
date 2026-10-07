import React from 'react';

export const AgricultureCard: React.FC = () => {
  return (
    <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/90 shadow-card group h-full min-h-[260px] sm:min-h-[290px] select-none">
      {/* Background Seedling Image with Smooth Hover Zoom */}
      <img
        src="/farm_seedlings.jpg"
        alt="Healthy Crop Seedlings in Farm Soil"
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      {/* Subtle Luxury Glass Border Glow */}
      <div className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none ring-1 ring-inset ring-white/40" />
    </div>
  );
};

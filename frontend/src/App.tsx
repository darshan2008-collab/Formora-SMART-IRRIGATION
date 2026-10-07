import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar.js';
import { MobileBottomNav } from './components/MobileBottomNav.js';
import { Dashboard } from './pages/Dashboard.js';
import { Sensors } from './pages/Sensors.js';
import { History } from './pages/History.js';
import { Settings } from './pages/Settings.js';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen app-dynamic-bg relative selection:bg-farm-200 selection:text-farm-900">

        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 px-4 py-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/sensors" element={<Sensors />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Mobile Fixed Bottom Navigation */}
        <MobileBottomNav />
      </div>
    </BrowserRouter>
  );
};

export default App;

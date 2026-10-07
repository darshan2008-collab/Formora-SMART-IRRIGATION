import React, { useState } from 'react';
import { Sprout, Thermometer, CloudRain, Droplet } from 'lucide-react';
import { Header } from '../components/Header.js';
import { ConnectionCard } from '../components/ConnectionCard.js';
import { SensorCard } from '../components/SensorCard.js';
import { SensorChart } from '../components/SensorChart.js';
import { RecentReadings } from '../components/RecentReadings.js';
import { QuickActions } from '../components/QuickActions.js';
import { WateringControl } from '../components/WateringControl.js';
import { CalibrationModal } from '../components/CalibrationModal.js';
import { useSensorData } from '../hooks/useSensorData.js';
import { useDevice } from '../hooks/useDevice.js';
import { 
  getSoilStatus, 
  getTemperatureStatus, 
  getRainStatus, 
  getWateringStatus 
} from '../utils/sensorStatus.js';

export const Dashboard: React.FC = () => {
  const {
    reading,
    device,
    connectionStatus,
    isDemo,
    history,
    recentReadings,
    lastSyncTime,
    refetch,
    refetchHistory,
  } = useSensorData(4000);

  const {
    isConnecting,
    connectionError,
    successMessage,
    connect,
    disconnect
  } = useDevice();

  const [isCalibrationOpen, setIsCalibrationOpen] = useState<boolean>(false);

  // Fallback defaults matching screenshot if loading
  const soilMoisture = reading ? reading.soil_moisture : 42.6;
  const temperature = reading ? reading.temperature : 29.4;
  const rain = reading ? reading.rain : false;
  const isWatering = reading ? Boolean(reading.watering) : false;
  const wateringMode = (reading ? reading.watering_mode : 'manual') as 'manual' | 'automatic';

  // Evaluate status rules
  const soilStatus = getSoilStatus(soilMoisture);
  const tempStatus = getTemperatureStatus(temperature);
  const rainStatus = getRainStatus(rain);
  const waterStatus = getWateringStatus(isWatering, wateringMode);

  const handleConnectDevice = async (targetIp: string, targetPort: number, targetName: string) => {
    const res = await connect(targetIp, targetPort, targetName);
    if (res) {
      refetch();
      refetchHistory('24h');
    }
  };

  return (
    <div className="pb-28 sm:pb-32 lg:pb-8">
      {/* Header */}
      <Header
        title="Soil Irrigation Dashboard"
        subtitle="Real-time monitoring of soil, temperature and rain conditions"
        connectionStatus={connectionStatus}
        isDemo={isDemo}
        onRefresh={() => {
          refetch();
          refetchHistory('24h');
        }}
        lastSyncTime={lastSyncTime}
      />

      {/* Connection & Device Quick Bar */}
      <ConnectionCard
        device={device}
        connectionStatus={connectionStatus}
        isConnecting={isConnecting}
        connectionError={connectionError}
        successMessage={successMessage}
        lastSyncTime={lastSyncTime}
        onConnect={handleConnectDevice}
        onDisconnect={disconnect}
      />

      {/* Top 4 Sensor Cards (2x2 grid on mobile matching reference phone mockup, 4 columns on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 mb-5 sm:mb-6">
        {/* Card 1: Soil Moisture */}
        <SensorCard
          title="Soil Moisture"
          value={`${soilMoisture} %`}
          statusText={soilStatus.status}
          icon={<Sprout className="w-5 h-5 sm:w-6 sm:h-6" />}
          variant="emerald"
          trendText="Root Probe"
          progressPercent={soilStatus.progressPercent}
        />

        {/* Card 2: Temperature */}
        <SensorCard
          title="Temperature"
          value={`${temperature} °C`}
          statusText={tempStatus.status}
          icon={<Thermometer className="w-5 h-5 sm:w-6 sm:h-6" />}
          variant="amber"
          trendText="DHT22 Sensor"
          progressPercent={tempStatus.progressPercent}
        />

        {/* Card 3: Rain Status */}
        <SensorCard
          title="Rain Status"
          value={rainStatus.title}
          statusText={rainStatus.status}
          icon={<CloudRain className="w-5 h-5 sm:w-6 sm:h-6" />}
          variant="sky"
          trendText="Optical Rain"
          progressPercent={rainStatus.progressPercent}
        />

        {/* Card 4: Watering Status */}
        <SensorCard
          title="Watering Status"
          value={isWatering ? 'Active' : (wateringMode === 'automatic' ? 'Automatic' : 'Manual')}
          statusText={waterStatus.status}
          icon={<Droplet className="w-5 h-5 sm:w-6 sm:h-6" />}
          variant="purple"
          trendText={isWatering ? 'Valve Active' : 'Solenoid Idle'}
          progressPercent={waterStatus.progressPercent}
        />
      </div>

      {/* Middle Section: Chart (Full Width) */}
      <div className="mb-6">
        <SensorChart
          data={history}
          title="Sensor Readings"
          rangeLabel="Last 24 Hours"
        />
      </div>

      {/* Bottom Section: Recent Readings (Left) + Quick Actions & Watering Control (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <RecentReadings readings={recentReadings} />
        </div>

        <div className="space-y-6">
          <WateringControl
            isWatering={isWatering}
            wateringMode={wateringMode}
            soilMoisture={soilMoisture}
            onRefresh={refetch}
          />

          <QuickActions onOpenCalibration={() => setIsCalibrationOpen(true)} />
        </div>
      </div>

      {/* Calibration Modal */}
      <CalibrationModal
        isOpen={isCalibrationOpen}
        onClose={() => setIsCalibrationOpen(false)}
      />
    </div>
  );
};

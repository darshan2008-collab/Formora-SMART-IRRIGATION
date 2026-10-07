/**
 * Sensor status evaluation logic and display helpers
 */

export function getSoilStatus(moisture: number): {
  label: string;
  status: string;
  color: string;
  textColor: string;
  bgLight: string;
  progressPercent: number;
} {
  const percent = Math.min(Math.max(moisture, 0), 100);
  
  if (percent < 30) {
    return {
      label: 'Very Dry',
      status: 'Soil is very dry - needs water',
      color: '#EF4444',
      textColor: 'text-red-600',
      bgLight: 'bg-red-50',
      progressPercent: percent
    };
  }
  if (percent < 50) {
    return {
      label: 'Moderately Dry',
      status: 'Soil is moderately dry',
      color: '#10B981',
      textColor: 'text-emerald-700',
      bgLight: 'bg-emerald-50',
      progressPercent: percent
    };
  }
  if (percent < 70) {
    return {
      label: 'Good',
      status: 'Optimal moisture level',
      color: '#059669',
      textColor: 'text-emerald-800',
      bgLight: 'bg-emerald-50',
      progressPercent: percent
    };
  }
  return {
    label: 'Wet',
    status: 'Soil is fully saturated',
    color: '#0284C7',
    textColor: 'text-sky-700',
    bgLight: 'bg-sky-50',
    progressPercent: percent
  };
}

export function getTemperatureStatus(temp: number): {
  label: string;
  status: string;
  color: string;
  textColor: string;
  progressPercent: number;
} {
  const progress = Math.min(Math.max(((temp - 10) / 40) * 100, 5), 100);

  if (temp < 15) {
    return {
      label: 'Cold',
      status: 'Temperature is low',
      color: '#3B82F6',
      textColor: 'text-blue-600',
      progressPercent: progress
    };
  }
  if (temp <= 35) {
    return {
      label: 'Normal',
      status: 'Normal range',
      color: '#F97316',
      textColor: 'text-amber-700',
      progressPercent: progress
    };
  }
  if (temp <= 45) {
    return {
      label: 'Hot',
      status: 'High temperature alert',
      color: '#EF4444',
      textColor: 'text-orange-600',
      progressPercent: progress
    };
  }
  return {
    label: 'Critical',
    status: 'Extreme heat detected',
    color: '#DC2626',
    textColor: 'text-red-700',
    progressPercent: progress
  };
}

export function getRainStatus(hasRain: boolean | number): {
  title: string;
  status: string;
  color: string;
  textColor: string;
  progressPercent: number;
} {
  const isRaining = Boolean(hasRain);
  if (isRaining) {
    return {
      title: 'Rain Detected',
      status: 'Precipitation active',
      color: '#0284C7',
      textColor: 'text-sky-700',
      progressPercent: 90
    };
  }
  return {
    title: 'No Rain',
    status: 'Clear sky',
    color: '#14B8A6',
    textColor: 'text-teal-700',
    progressPercent: 40
  };
}

export function getWateringStatus(isWatering: boolean | number, mode: string = 'manual'): {
  title: string;
  status: string;
  color: string;
  textColor: string;
  progressPercent: number;
} {
  const active = Boolean(isWatering);
  if (active) {
    return {
      title: 'Active',
      status: mode === 'automatic' ? 'Auto irrigation running' : 'Manual watering in progress',
      color: '#3B82F6',
      textColor: 'text-blue-700',
      progressPercent: 85
    };
  }
  return {
    title: mode === 'automatic' ? 'Automatic' : 'Manual',
    status: mode === 'automatic' ? 'Monitoring threshold' : 'Manual watering only',
    color: '#8B5CF6',
    textColor: 'text-purple-700',
    progressPercent: 45
  };
}

export function formatTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return dateString;
  }
}

export function formatDateHeader(date: Date = new Date()): { dateStr: string; timeStr: string } {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const m = months[date.getMonth()];
  const d = date.getDate().toString().padStart(2, '0');
  const y = date.getFullYear();

  let hours = date.getHours();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const hStr = hours.toString().padStart(2, '0');
  const minStr = date.getMinutes().toString().padStart(2, '0');

  return {
    dateStr: `${m} ${d}, ${y}`,
    timeStr: `${hStr}:${minStr} ${ampm}`
  };
}

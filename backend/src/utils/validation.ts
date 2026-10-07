/**
 * IP and Network Validation utilities
 */

export function isValidIPv4(ip: string): boolean {
  if (!ip || typeof ip !== 'string') return false;
  const trimmed = ip.trim();
  if (trimmed === 'localhost') return true;

  const parts = trimmed.split('.');
  if (parts.length !== 4) return false;

  for (const part of parts) {
    if (!/^\d+$/.test(part)) return false;
    const num = parseInt(part, 10);
    if (num < 0 || num > 255) return false;
    if (part.length > 1 && part.startsWith('0')) return false; // Prevent octal confusion
  }
  return true;
}

export function isValidPort(port: any): boolean {
  const num = Number(port);
  return Number.isInteger(num) && num >= 1 && num <= 65535;
}

export function sanitizeDeviceName(name: any): string {
  if (typeof name !== 'string') return 'ESP32-Smart-Irrigation';
  const clean = name.trim().replace(/[<>"/\\&;]/g, '');
  return clean.slice(0, 50) || 'ESP32-Smart-Irrigation';
}

export function validateNumericRange(val: any, min: number, max: number, defaultValue: number): number {
  const num = Number(val);
  if (isNaN(num)) return defaultValue;
  return Math.min(Math.max(num, min), max);
}

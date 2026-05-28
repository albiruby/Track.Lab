export function formatSecondsToTimeString(seconds: number): string {
  if (isNaN(seconds) || seconds < 0 || !isFinite(seconds)) return '00:00';
  
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function parseDurationToSeconds(timeStr: string): number | null {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const str = timeStr.trim();
  if (str === '') return null;
  if (/^-\d/.test(str)) return null;

  const parts = str.split(':');
  
  // Allow '10' as 10 minutes maybe? No, instructions said: Valid examples ... must support MM:SS, M:SS, HH:MM:SS, H:MM:SS
  if (parts.length > 3 || parts.length < 2) {
    // maybe it is just a number? For duration fields, let's reject single numbers unless stated.
    // However, some fields might use parseTimeStringToSeconds for minutes?
    // User requested specifically for MM:SS
    return null;
  }

  for (let p of parts) {
    if (!/^\d+$/.test(p)) return null;
  }
  
  const nums = parts.map(Number);
  
  if (nums.length === 3) {
    const [h, m, s] = nums;
    if (m > 59 || s > 59) return null;
    return h * 3600 + m * 60 + s;
  }
  
  if (nums.length === 2) {
    const [m, s] = nums;
    if (s > 59) return null;
    return m * 60 + s;
  }

  return null;
}

export function parseTimeStringToSeconds(timeStr: string): number {
  return parseDurationToSeconds(timeStr) || 0;
}

export function formatPace(secondsPerKm: number): string {
  if (typeof secondsPerKm !== 'number' || isNaN(secondsPerKm) || !isFinite(secondsPerKm) || secondsPerKm <= 0) return '0:00 /km';
  const m = Math.floor(secondsPerKm / 60);
  const s = Math.floor(secondsPerKm % 60);
  return `${m}:${s.toString().padStart(2, '0')} /km`;
}

export function safeNumber(val: any): number | null {
  if (typeof val === 'number') return isFinite(val) ? val : null;
  if (typeof val !== 'string') return null;
  const s = val.trim();
  if (s === '') return null;
  const n = Number(s);
  return isFinite(n) ? n : null;
}

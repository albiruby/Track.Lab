export function parseDurationToSeconds(timeStr: string): number | null {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const str = timeStr.trim();
  if (str === '') return null;
  if (/^-\d/.test(str)) return null;

  const parts = str.split(':');
  
  if (parts.length > 3 || parts.length < 2) {
    // If it's a single number, maybe it's minutes? 
    // The prompt says "must support: 29:00, 24:00, 00:24:00, 1:25:30". So format must be MM:SS, etc.
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
    // MM:SS, but what if user means 60:00 (which is 60 minutes)? Yes, m can be > 59!
    return m * 60 + s;
  }

  return null;
}

export function formatSecondsToDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0 || !isFinite(seconds)) return '00:00';
  
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatPace(secondsPerKm: number): string {
  if (typeof secondsPerKm !== 'number' || isNaN(secondsPerKm) || !isFinite(secondsPerKm) || secondsPerKm <= 0) return '0:00 /km';
  const m = Math.floor(secondsPerKm / 60);
  const s = Math.floor(secondsPerKm % 60);
  return `${m}:${s.toString().padStart(2, '0')} /km`;
}

export function parsePaceToSeconds(input: string): number | null {
  return parseDurationToSeconds(input);
}

/**
 * Shared Time and Duration String Validation and Parsing Utilities.
 * Track.Lab Scientific Calculations Suite.
 */

/**
 * Parses time strings into seconds.
 * Supports:
 * - MM:SS (e.g., "29:00", "60:00")
 * - HH:MM:SS (e.g., "01:25:30", "1:25:30")
 * - Raw number of minutes if no colons are present.
 */
export function parseDurationToSeconds(timeStr: string): number | null {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const cleaned = timeStr.trim();
  if (!cleaned) return null;

  const parts = cleaned.split(':');
  if (parts.length === 1) {
    const num = Number(cleaned);
    if (!isNaN(num) && num > 0 && isFinite(num)) {
      return num * 60; // Treat as raw minutes
    }
    return null;
  }

  if (parts.length === 2) {
    // MM:SS
    const mm = Number(parts[0]);
    const ss = Number(parts[1]);
    if (isNaN(mm) || isNaN(ss) || mm < 0 || ss < 0 || ss >= 60) return null;
    return mm * 60 + ss;
  }

  if (parts.length === 3) {
    // HH:MM:SS
    const hh = Number(parts[0]);
    const mm = Number(parts[1]);
    const ss = Number(parts[2]);
    if (isNaN(hh) || isNaN(mm) || isNaN(ss) || hh < 0 || mm < 0 || mm >= 60 || ss < 0 || ss >= 60) return null;
    return hh * 3600 + mm * 60 + ss;
  }

  return null;
}

/**
 * Formats seconds into a human-readable duration string.
 * Result format: "HH:MM:SS" if HH > 0, otherwise "MM:SS".
 */
export function secondsToDurationString(totalSecs: number): string {
  if (totalSecs === null || totalSecs === undefined || isNaN(totalSecs) || totalSecs < 0 || !isFinite(totalSecs)) {
    return '00:00';
  }
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = Math.round(totalSecs % 60);

  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/**
 * Returns true if the string is in a valid duration format.
 */
export function isValidDurationString(timeStr: string): boolean {
  return parseDurationToSeconds(timeStr) !== null;
}

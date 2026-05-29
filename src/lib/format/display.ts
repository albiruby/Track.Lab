export function formatDistanceKm(km: number | null | undefined): string {
  if (km === null || km === undefined || isNaN(km) || !isFinite(km)) return '—';
  if (km < 0.5) {
    return `${Math.round(km * 1000)} m`;
  }
  // Standard precision: max 2 decimal places, strip trailing zeros
  const rounded = Math.round(km * 100) / 100;
  return `${rounded} km`;
}

export function formatDistanceMeters(meters: number | null | undefined): string {
  if (meters === null || meters === undefined || isNaN(meters) || !isFinite(meters)) return '—';
  if (meters >= 1000) {
    const km = Math.round((meters / 1000) * 100) / 100;
    return `${km} km`;
  }
  return `${Math.round(meters)} m`;
}

export function formatPace(secondsPerKm: number | null | undefined): string {
  if (secondsPerKm === null || secondsPerKm === undefined || isNaN(secondsPerKm) || !isFinite(secondsPerKm) || secondsPerKm <= 0) {
    return '—';
  }
  const m = Math.floor(secondsPerKm / 60);
  const s = Math.floor(secondsPerKm % 60);
  return `${m}:${s.toString().padStart(2, '0')} /km`;
}

export function formatSpeedKmh(speed: number | null | undefined): string {
  if (speed === null || speed === undefined || isNaN(speed) || !isFinite(speed)) return '—';
  const val = Math.round(speed * 10) / 10;
  return `${val} km/h`;
}

export function formatSpeedMph(speed: number | null | undefined): string {
  if (speed === null || speed === undefined || isNaN(speed) || !isFinite(speed)) return '—';
  const val = Math.round(speed * 10) / 10;
  return `${val} mph`;
}

export function formatPercent(percent: number | null | undefined): string {
  if (percent === null || percent === undefined || isNaN(percent) || !isFinite(percent)) return '—';
  const val = Math.round(percent * 10) / 10;
  return `${val}%`;
}

export function formatPower(power: number | null | undefined): string {
  if (power === null || power === undefined || isNaN(power) || !isFinite(power)) return '—';
  return `${Math.round(power)} W`;
}

export function formatPowerWkg(wkg: number | null | undefined): string {
  if (wkg === null || wkg === undefined || isNaN(wkg) || !isFinite(wkg)) return '—';
  const val = Math.round(wkg * 100) / 100;
  return `${val} W/kg`;
}

export function formatMassKg(weight: number | null | undefined): string {
  if (weight === null || weight === undefined || isNaN(weight) || !isFinite(weight)) return '—';
  const val = Math.round(weight * 10) / 10;
  return `${val} kg`;
}

export function formatCarbs(carbs: number | null | undefined): string {
  if (carbs === null || carbs === undefined || isNaN(carbs) || !isFinite(carbs)) return '—';
  return `${Math.round(carbs)} g`;
}

export function formatSodium(mg: number | null | undefined): string {
  if (mg === null || mg === undefined || isNaN(mg) || !isFinite(mg)) return '—';
  return `${Math.round(mg)} mg`;
}

export function formatFluidMl(ml: number | null | undefined): string {
  if (ml === null || ml === undefined || isNaN(ml) || !isFinite(ml)) return '—';
  return `${Math.round(ml)} ml`;
}

export function formatFluidLiters(liters: number | null | undefined): string {
  if (liters === null || liters === undefined || isNaN(liters) || !isFinite(liters)) return '—';
  const val = Math.round(liters * 100) / 100;
  return `${val} L`;
}

export function formatDuration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined || isNaN(seconds) || !isFinite(seconds) || seconds < 0) return '—';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function formatRaceDistance(dist: number | null | undefined): string {
  if (dist === null || dist === undefined || isNaN(dist) || !isFinite(dist)) return '—';
  if (Math.abs(dist - 5) < 0.05) return '5K';
  if (Math.abs(dist - 10) < 0.05) return '10K';
  if (Math.abs(dist - 21.0975) < 0.1) return 'Half Marathon';
  if (Math.abs(dist - 42.195) < 0.1) return 'Marathon';
  return formatDistanceKm(dist);
}

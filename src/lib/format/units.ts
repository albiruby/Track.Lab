export function formatDistanceKm(km: number): string {
  return `${km.toFixed(2)} km`;
}

export function formatSpeedKmh(speed: number): string {
  return `${speed.toFixed(1)} km/h`;
}

export function formatSpeedMph(speed: number): string {
  return `${speed.toFixed(1)} mph`;
}

export function formatHeartRate(hr: number): string {
  return `${Math.round(hr)} bpm`;
}

export function formatPower(power: number): string {
  return `${Math.round(power)} W`;
}

export function formatWeight(weight: number): string {
  return `${weight.toFixed(1)} kg`;
}

export function formatTemperature(temp: number, unit: 'C' | 'F' = 'C'): string {
  return `${temp.toFixed(1)}°${unit}`;
}

export function formatPercent(percent: number): string {
  return `${percent.toFixed(1)}%`;
}

export function formatCalories(kcal: number): string {
  return `${Math.round(kcal)} kcal`;
}

export function formatSodiumMg(mg: number): string {
  return `${Math.round(mg)} mg`;
}

export function formatFluidMl(ml: number): string {
  return `${Math.round(ml)} ml`;
}

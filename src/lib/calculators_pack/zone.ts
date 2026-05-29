import { assertPositive } from "./core";

export function calculateTimeInZoneDistribution(zoneTimesMins: number[]) {
  const total = zoneTimesMins.reduce((a, b) => a + b, 0);
  if (total <= 0) return zoneTimesMins.map(() => 0);
  return zoneTimesMins.map(t => (t / total) * 100);
}

export function classifyIntensityDistribution(lowPct: number, modPct: number, highPct: number) {
  // Rough classification
  if (lowPct >= 75 && highPct > modPct) {
    return 'Polarized';
  } else if (lowPct >= 75 && modPct > highPct) {
    return 'Pyramidal (80/20)';
  } else if (lowPct >= 75 && (modPct + highPct) <= 25) {
    return '80/20 Compliant';
  } else if (modPct >= 40) {
    return 'Threshold-Heavy (Caution)';
  } else if (highPct >= 30) {
    return 'High-Intensity Heavy';
  } else if (lowPct > 50) {
    return 'Base-Leaning';
  }
  return 'Unclassified';
}

export function compareZoneSystems(systemA: { name: string, min: number, max: number | null }[], systemB: { name: string, min: number, max: number | null }[]) {
  // Returns a comparison format if needed, but UI could just render them side by side
  return { systemA, systemB };
}

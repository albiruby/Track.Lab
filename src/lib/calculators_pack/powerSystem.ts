/**
 * Run power calculations and critical power modeling.
 */

/**
 * Calculate Watts per kg (W/kg)
 * Formula: W/kg = Power / Body Weight
 */
export function calculateWattsPerKg(powerWatts: number, bodyWeightKg: number): number {
  if (bodyWeightKg <= 0 || powerWatts < 0) return 0;
  return powerWatts / bodyWeightKg;
}

/**
 * Calculate power efficiency (m/s per W/kg or speed divided by power)
 * Speed in m/s = (speedKmh * 1000) / 3600
 * Power efficiency = speedMetersPerSecond / (powerWatts / bodyWeightKg)
 */
export function calculatePowerEfficiency(speedMetersPerSecond: number, wattsPerKg: number): number {
  if (wattsPerKg <= 0 || speedMetersPerSecond < 0) return 0;
  return speedMetersPerSecond / wattsPerKg;
}

/**
 * Calculate energy power demand description per km (estimate)
 */
export function calculatePowerPerKm(powerWatts: number, paceSecondsPerKm: number): string {
  if (powerWatts <= 0 || paceSecondsPerKm <= 0) return "N/A";
  const minutes = paceSecondsPerKm / 60;
  const joules = powerWatts * paceSecondsPerKm; // Watt-seconds
  const kcal = joules / 4184; // roughly
  return `${kcal.toFixed(1)} kcal/km (work equivalent)`;
}

/**
 * Calculate power drift %
 * Formula: Drift % = (Second - First) / First * 100
 */
export function calculatePowerDrift(firstHalfPower: number, secondHalfPower: number): number {
  if (firstHalfPower <= 0) return 0;
  return ((secondHalfPower - firstHalfPower) / firstHalfPower) * 100;
}

/**
 * Calculate power fade %
 */
export function calculatePowerFade(startPower: number, endPower: number): number {
  if (startPower <= 0) return 0;
  return ((startPower - endPower) / startPower) * 100;
}

/**
 * Calculate average power
 */
export function calculateAveragePower(powerValues: number[]): number {
  if (!powerValues || powerValues.length === 0) return 0;
  const sum = powerValues.reduce((acc, v) => acc + v, 0);
  return sum / powerValues.length;
}

/**
 * Estimate Normalized Power (NP)
 * Standard formula utilizes raising values to 4th power, averaging, then taking the 4th root.
 */
export function estimateNormalizedPower(powerValues: number[]): number {
  if (!powerValues || powerValues.length === 0) return 0;
  // If we have single point, or small arrays, return average
  const fourthPowerSum = powerValues.reduce((acc, v) => acc + Math.pow(v, 4), 0);
  const avgFourthPower = fourthPowerSum / powerValues.length;
  return Math.pow(avgFourthPower, 0.25);
}

/**
 * Calculate variability index (VI)
 * Formula: VI = Normalized Power / Average Power
 */
export function calculateVariabilityIndex(normalizedPower: number, averagePower: number): number {
  if (averagePower <= 0) return 0;
  return normalizedPower / averagePower;
}

/**
 * Calculate Intensity Factor (IF)
 * Formula: IF = Power / Critical Power
 */
export function calculateIntensityFactor(power: number, criticalPower: number): number {
  if (criticalPower <= 0) return 0;
  return power / criticalPower;
}

/**
 * Power-based training load / stress estimate (similar to TSS)
 * Formula: TSS = durationHours * IF^2 * 100
 */
export function calculatePowerBasedTrainingStress(durationHours: number, intensityFactor: number): number {
  if (durationHours <= 0 || intensityFactor <= 0) return 0;
  return durationHours * Math.pow(intensityFactor, 2) * 100;
}

/**
 * Calculate 2-Point Critical Power from manual trials.
 * Trial 1: power1 at time1S (seconds)
 * Trial 2: power2 at time2S (seconds)
 * Work = Power * Time (joules)
 * CP = (Work2 - Work1) / (Time2 - Time1)
 */
export function calculateCriticalPower2Point(
  power1: number,
  time1S: number,
  power2: number,
  time2S: number
): { criticalPower: number; wPrime: number } {
  if (time1S <= 0 || time2S <= 0 || time1S === time2S) {
    return { criticalPower: 0, wPrime: 0 };
  }
  const work1 = power1 * time1S;
  const work2 = power2 * time2S;
  const cp = (work2 - work1) / (time2S - time1S);
  const wPrime = (power1 - cp) * time1S;
  return {
    criticalPower: cp > 0 ? cp : 0,
    wPrime: wPrime > 0 ? wPrime : 0
  };
}

/**
 * Generate 7-zone active power zones table from Critical Power (CP)
 */
export interface PowerZone {
  zoneNumber: number;
  name: string;
  minPct: number;
  maxPct: number;
  minWatts: number;
  maxWatts: number;
  description: string;
}

export function calculateCriticalPowerZones(criticalPower: number): PowerZone[] {
  if (criticalPower <= 0) return [];
  const zones = [
    { zoneNumber: 1, name: "Active Recovery", minPct: 0, maxPct: 55, desc: "Slight aerobic conditioning, recovery stimulation" },
    { zoneNumber: 2, name: "Endurance", minPct: 56, maxPct: 75, desc: "Core aerobic base, fat metabolization focus" },
    { zoneNumber: 3, name: "Tempo", minPct: 76, maxPct: 90, desc: "Faster aerobic state, sustained intensity tolerance" },
    { zoneNumber: 4, name: "Lactate Threshold", minPct: 91, maxPct: 105, desc: "Critical power anchor, threshold adaptation" },
    { zoneNumber: 5, name: "VO2max", minPct: 106, maxPct: 120, desc: "Max aerobic capacity stimulation, interval power" },
    { zoneNumber: 6, name: "Anaerobic Capacity", minPct: 111, maxPct: 150, desc: "Anaerobic glycogen depletion focus" },
    { zoneNumber: 7, name: "Neuromuscular Power", minPct: 151, maxPct: 999, desc: "Sprint power, maximal muscle fiber recruitments" }
  ];

  return zones.map(z => ({
    zoneNumber: z.zoneNumber,
    name: z.name,
    minPct: z.minPct,
    maxPct: z.maxPct,
    minWatts: Math.round(criticalPower * (z.minPct / 100)),
    maxWatts: z.maxPct === 999 ? Math.round(criticalPower * 2.5) : Math.round(criticalPower * (z.maxPct / 100)),
    description: z.desc
  }));
}

/**
 * Calculate Time to Exhaustion (TTE) above Critical Power (CP) using W' capacity
 * Formula: TTE (seconds) = W' (joules) / (Target Power - CP)
 */
export function calculateTimeToExhaustionAboveCP(
  wPrimeJoules: number,
  targetPower: number,
  criticalPower: number
): number {
  if (targetPower <= criticalPower || wPrimeJoules <= 0) return 0;
  return wPrimeJoules / (targetPower - criticalPower);
}

/**
 * Power-to-HR Efficiency Index (EF)
 * Formula: EF = Power / HR
 */
export function comparePowerToHR(power: number, hr: number): number {
  if (hr <= 0 || power <= 0) return 0;
  return power / hr;
}

/**
 * Power-to-Pace speed ratio (m/s per Watt)
 */
export function comparePowerToPace(power: number, speedMs: number): number {
  if (power <= 0 || speedMs <= 0) return 0;
  return speedMs / power;
}

/**
 * Qualitative note regarding grade adjustments
 */
export function calculateGradeAdjustedPowerNote(power: number, grade: number): string {
  if (power <= 0) return "N/A";
  if (grade === 0) return "Flat terrain power profile.";
  if (grade > 0) {
    return `Climbing at +${grade}% incline. Running power matches a higher flat equivalent cost.`;
  } else {
    return `Descending at ${grade}% decline. Running power reflects gravity assistance.`;
  }
}

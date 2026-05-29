import { assertPositive } from "./core";

// Helper for parsing inputs and ensuring they are positive numbers
function safeVal(val: any): number {
  if (typeof val === 'number') return isFinite(val) && val > 0 ? val : 0;
  const num = Number(val);
  return isFinite(num) && num > 0 ? num : 0;
}

// 1. predictRaceRiegel
export function predictRaceRiegel(knownDistanceKm: number, knownTimeSeconds: number, targetDistanceKm: number, exponent: number = 1.06): number {
  const kDist = safeVal(knownDistanceKm);
  const kTime = safeVal(knownTimeSeconds);
  const tDist = safeVal(targetDistanceKm);
  const exp = safeVal(exponent) || 1.06;

  if (kDist <= 0 || kTime <= 0 || tDist <= 0) return 0;
  return kTime * Math.pow(tDist / kDist, exp);
}

// 2. predictRaceAdjustableExponent
export function predictRaceAdjustableExponent(knownDistanceKm: number, knownTimeSeconds: number, targetDistanceKm: number, exponent: number): number {
  return predictRaceRiegel(knownDistanceKm, knownTimeSeconds, targetDistanceKm, exponent);
}

// 3. calculateGoalPace (seconds per km)
export function calculateGoalPace(targetDistanceKm: number, targetTimeSeconds: number): number {
  const dist = safeVal(targetDistanceKm);
  const time = safeVal(targetTimeSeconds);
  if (dist <= 0 || time <= 0) return 0;
  return time / dist;
}

// 4. calculateRaceEquivalentTable
export interface EquivalentRacePerformance {
  distanceName: string;
  distanceKm: number;
  predictedTimeSeconds: number;
  predictedPaceSecondsPerKm: number;
}

export function calculateRaceEquivalentTable(knownDistanceKm: number, knownTimeSeconds: number, exponent: number = 1.06): EquivalentRacePerformance[] {
  const distances = [
    { name: '400m', km: 0.4 },
    { name: '800m', km: 0.8 },
    { name: '1500m', km: 1.5 },
    { name: '1 Mile', km: 1.60934 },
    { name: '3K', km: 3.0 },
    { name: '5K', km: 5.0 },
    { name: '10K', km: 10.0 },
    { name: '15K', km: 15.0 },
    { name: '10 Mile', km: 16.0934 },
    { name: 'Half Marathon', km: 21.0975 },
    { name: '30K', km: 30.0 },
    { name: 'Marathon', km: 42.195 },
    { name: '50K', km: 50.0 },
    { name: '50 Mile', km: 80.4672 },
    { name: '100K', km: 100.0 },
    { name: '100 Mile', km: 160.934 }
  ];

  return distances.map(d => {
    const predictedTime = predictRaceRiegel(knownDistanceKm, knownTimeSeconds, d.km, exponent);
    return {
      distanceName: d.name,
      distanceKm: d.km,
      predictedTimeSeconds: predictedTime,
      predictedPaceSecondsPerKm: predictedTime > 0 ? predictedTime / d.km : 0
    };
  });
}

// 5. calculateDistanceSimilarityConfidence
export function calculateDistanceSimilarityConfidence(knownDistanceKm: number, targetDistanceKm: number): {
  label: 'High Confidence' | 'Moderate Confidence' | 'Low Confidence' | 'Very Low Confidence';
  description: string;
} {
  const dist1 = safeVal(knownDistanceKm);
  const dist2 = safeVal(targetDistanceKm);
  if (dist1 <= 0 || dist2 <= 0) {
    return { label: 'Low Confidence', description: 'Invalid distances provided.' };
  }

  const ratio = Math.max(dist1 / dist2, dist2 / dist1);
  if (ratio <= 1.5) {
    return {
      label: 'High Confidence',
      description: 'The target distance is very close to your known race distance, making the prediction highly reliable.'
    };
  } else if (ratio <= 3.0) {
    return {
      label: 'Moderate Confidence',
      description: 'The projection is reasonable, though metabolic differences between short-endurance and long-endurance ranges apply.'
    };
  } else if (ratio <= 6.0) {
    return {
      label: 'Low Confidence',
      description: 'Caution: Large distance difference. Endurance levels vary significantly across these distances.'
    };
  } else {
    return {
      label: 'Very Low Confidence',
      description: 'Warning: Major leap in distance (e.g., 5K to Marathon). High physiological/aerobic translation uncertainty.'
    };
  }
}

// 6. calculateABCRaceGoals
export function calculateABCRaceGoals(basePredictionSeconds: number, conservativePercent: number = 1.02, aggressivePercent: number = 0.98) {
  const base = safeVal(basePredictionSeconds);
  const cons = safeVal(conservativePercent) || 1.02;
  const aggr = safeVal(aggressivePercent) || 0.98;

  return {
    aGoalSeconds: base * aggr,
    bGoalSeconds: base,
    cGoalSeconds: base * cons
  };
}

// 7. buildRaceScenario
export function buildRaceScenario(basePredictionSeconds: number, scenarioType: 'conservative' | 'realistic' | 'aggressive' | 'custom', customModifier: number = 1.0): number {
  const base = safeVal(basePredictionSeconds);
  if (base <= 0) return 0;

  let modifier = 1.0;
  if (scenarioType === 'conservative') modifier = 1.03;
  else if (scenarioType === 'aggressive') modifier = 0.975;
  else if (scenarioType === 'custom') modifier = safeVal(customModifier) || 1.0;

  return base * modifier;
}

// 8. generateRaceSplitPlan
export interface SplitSegment {
  segmentNumber: number;
  cumulativeDistanceKm: number;
  segmentDistanceKm: number;
  segmentTimeSeconds: number;
  segmentPaceSecondsPerKm: number;
  cumulativeTimeSeconds: number;
}

export function generateRaceSplitPlan(distanceKm: number, targetTimeSeconds: number, strategy: 'even' | 'negative split' | 'progressive' | 'conservative start'): SplitSegment[] {
  const dist = safeVal(distanceKm);
  const totalTime = safeVal(targetTimeSeconds);
  if (dist <= 0 || totalTime <= 0) return [];

  // Generate 1km segments (and a final partial segment if needed)
  const segments: { segmentNumber: number; segmentDistanceKm: number }[] = [];
  let remaining = dist;
  let counter = 1;
  while (remaining > 0) {
    const chunk = Math.min(1.0, remaining);
    segments.push({ segmentNumber: counter++, segmentDistanceKm: chunk });
    remaining -= chunk;
  }

  const avgPace = totalTime / dist;
  const numSegs = segments.length;

  let factorArray: number[] = [];

  if (strategy === 'even' || numSegs === 1) {
    factorArray = segments.map(() => 1.0);
  } else if (strategy === 'negative split') {
    // Slower first half, faster second half
    // Linear adjustment from +1.5% to -1.5%
    factorArray = segments.map((s, idx) => {
      const progress = idx / (numSegs - 1); // 0 to 1
      return 1.015 - (progress * 0.03);
    });
  } else if (strategy === 'progressive') {
    // Starts slower, speeds up throughout
    // Linear adjustment from +3% to -3%
    factorArray = segments.map((s, idx) => {
      const progress = idx / (numSegs - 1);
      return 1.03 - (progress * 0.06);
    });
  } else if (strategy === 'conservative start') {
    // First 1 or 2 segments are 5% slower, remaining are faster/even
    factorArray = segments.map((s, idx) => {
      if (idx === 0) return 1.05;
      if (idx === 1 && numSegs > 2) return 1.03;
      // Remainder must be faster to compensate
      const slowSegsWeight = (numSegs > 2) ? (1.05 + 1.03) : 1.05;
      const slowCount = (numSegs > 2) ? 2 : 1;
      const normalWeight = (numSegs - slowSegsWeight) / (numSegs - slowCount);
      // Let's model a target speedup factor
      return 0.985;
    });
  }

  // To ensure the actual times add up EXACTLY to targetTimeSeconds, we calibrate:
  let sumWeightedDist = 0;
  for (let i = 0; i < numSegs; i++) {
    const factor = factorArray[i] || 1.0;
    sumWeightedDist += segments[i].segmentDistanceKm * (avgPace * factor);
  }

  const calibration = totalTime / sumWeightedDist;

  let cumulativeDistanceKm = 0;
  let cumulativeTimeSeconds = 0;

  return segments.map((s, idx) => {
    const f = factorArray[idx] || 1.0;
    const finalPace = avgPace * f * calibration;
    const segmentTime = s.segmentDistanceKm * finalPace;
    cumulativeDistanceKm += s.segmentDistanceKm;
    cumulativeTimeSeconds += segmentTime;

    return {
      segmentNumber: s.segmentNumber,
      cumulativeDistanceKm,
      segmentDistanceKm: s.segmentDistanceKm,
      segmentTimeSeconds: segmentTime,
      segmentPaceSecondsPerKm: finalPace,
      cumulativeTimeSeconds
    };
  });
}

// 9. calculateCriticalSpeed2Point
export function calculateCriticalSpeed2Point(distance1Meters: number, time1Seconds: number, distance2Meters: number, time2Seconds: number): { cs: number; dp: number } {
  const d1 = safeVal(distance1Meters);
  const t1 = safeVal(time1Seconds);
  const d2 = safeVal(distance2Meters);
  const t2 = safeVal(time2Seconds);

  if (d1 <= 0 || t1 <= 0 || d2 <= 0 || t2 <= 0) return { cs: 0, dp: 0 };
  if (t1 === t2) return { cs: 0, dp: 0 }; // Avoid infinite speed/zero denominator
  
  // order so d2 is larger
  const sorting = d1 < d2 ? { d_low: d1, t_low: t1, d_high: d2, t_high: t2 } : { d_low: d2, t_low: t2, d_high: d1, t_high: t1 };
  if (sorting.t_high <= sorting.t_low) {
    return { cs: 0, dp: 0 }; // longer distance cannot be completed in same/less time
  }

  const cs = (sorting.d_high - sorting.d_low) / (sorting.t_high - sorting.t_low);
  const dp = sorting.d_low - (cs * sorting.t_low);

  return { 
    cs: isFinite(cs) && cs > 0 ? cs : 0, 
    dp: isFinite(dp) && dp >= 0 ? dp : 0 
  };
}

// 10. calculateCriticalSpeed3Point
export function calculateCriticalSpeed3Point(trials: { distanceMeters: number; timeSeconds: number }[]): { cs: number; dp: number; r2: number } {
  const validTrials = trials.filter(t => safeVal(t.distanceMeters) > 0 && safeVal(t.timeSeconds) > 0);
  if (validTrials.length < 3) return { cs: 0, dp: 0, r2: 0 };

  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  const n = validTrials.length;

  for (const t of validTrials) {
    const x = t.timeSeconds;
    const y = t.distanceMeters;
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
    sumY2 += y * y;
  }

  const denominator = (n * sumX2 - sumX * sumX);
  if (denominator === 0) return { cs: 0, dp: 0, r2: 0 };

  const cs = (n * sumXY - sumX * sumY) / denominator;
  const dp = (sumY - cs * sumX) / n;

  const numRSQ = (n * sumXY - sumX * sumY) * (n * sumXY - sumX * sumY);
  const denRSQ = denominator * (n * sumY2 - sumY * sumY);
  const r2 = denRSQ === 0 ? 0 : Math.min(1.0, Math.max(0, numRSQ / denRSQ));

  return {
    cs: isFinite(cs) && cs > 0 ? cs : 0,
    dp: isFinite(dp) && dp >= 0 ? dp : 0,
    r2: isFinite(r2) ? r2 : 0
  };
}

// 11. calculateCriticalPace (seconds per km)
export function calculateCriticalPace(csMetersPerSecond: number): number {
  const cs = safeVal(csMetersPerSecond);
  if (cs <= 0) return 0;
  return 1000 / cs;
}

// 12. calculateTimeToExhaustionAboveCS
export function calculateTimeToExhaustionAboveCS(speedMetersPerSecond: number, criticalSpeedMetersPerSecond: number, dPrimeMeters: number): number {
  const speed = safeVal(speedMetersPerSecond);
  const cs = safeVal(criticalSpeedMetersPerSecond);
  const dp = safeVal(dPrimeMeters);

  if (speed <= cs || dp <= 0 || cs <= 0) return 0;
  return dp / (speed - cs);
}

// 13. calculateDistanceCapacityAboveCS
export function calculateDistanceCapacityAboveCS(speedMetersPerSecond: number, criticalSpeedMetersPerSecond: number, durationSeconds: number): number {
  const speed = safeVal(speedMetersPerSecond);
  const cs = safeVal(criticalSpeedMetersPerSecond);
  const dur = safeVal(durationSeconds);

  if (speed <= cs || cs <= 0 || dur <= 0) return 0;
  return (speed - cs) * dur;
}

// 14. calculateCSZoneTable
export interface CSZoneRow {
  name: string;
  pctCS: string;
  minPaceSecsPerKm: number;
  maxPaceSecsPerKm: number;
  minSpeedMps: number;
  maxSpeedMps: number;
}

export function calculateCSZoneTable(criticalSpeedMps: number): CSZoneRow[] {
  const cs = safeVal(criticalSpeedMps);
  if (cs <= 0) return [];

  // Zone configurations relative to Critical Speed (CS is 100%)
  const zones = [
    { name: 'Zone 1 (Recovery)', minPct: 0.1, maxPct: 0.70 },
    { name: 'Zone 2 (Endurance/Easy)', minPct: 0.70, maxPct: 0.85 },
    { name: 'Zone 3 (Steady/Tempo)', minPct: 0.85, maxPct: 0.95 },
    { name: 'Zone 4 (Threshold/Critical Speed)', minPct: 0.95, maxPct: 1.05 },
    { name: 'Zone 5 (V02 Max/Anaerobic)', minPct: 1.05, maxPct: 1.30 }
  ];

  return zones.map(z => {
    const minSpeed = cs * z.minPct;
    const maxSpeed = cs * z.maxPct;
    return {
      name: z.name,
      pctCS: `${Math.round(z.minPct * 100)}-${Math.round(z.maxPct * 100)}%`,
      minPaceSecsPerKm: minSpeed > 0 ? 1000 / minSpeed : 0,
      maxPaceSecsPerKm: maxSpeed > 0 ? 1000 / maxSpeed : 0,
      minSpeedMps: minSpeed,
      maxSpeedMps: maxSpeed
    };
  });
}

// 15. compareCSToRacePaces
export interface CSComparisonResult {
  csPaceSecs: number;
  thresholdPaceSecs: number;
  fiveKPaceSecs: number;
  tenKPaceSecs: number;
  thresholdDelta: number;
  fiveKDelta: number;
  tenKDelta: number;
}

export function compareCSToRacePaces(csPaceSecondsPerKm: number, thresholdPaceSecondsPerKm: number, fiveKPaceSecondsPerKm: number, tenKPaceSecondsPerKm: number): CSComparisonResult {
  const cs = safeVal(csPaceSecondsPerKm);
  const thresh = safeVal(thresholdPaceSecondsPerKm);
  const f5k = safeVal(fiveKPaceSecondsPerKm);
  const f10k = safeVal(tenKPaceSecondsPerKm);

  return {
    csPaceSecs: cs,
    thresholdPaceSecs: thresh,
    fiveKPaceSecs: f5k,
    tenKPaceSecs: f10k,
    thresholdDelta: thresh > 0 && cs > 0 ? thresh - cs : 0,
    fiveKDelta: f5k > 0 && cs > 0 ? f5k - cs : 0,
    tenKDelta: f10k > 0 && cs > 0 ? f10k - cs : 0
  };
}

// 16. calculateTrainingPacesFromRaceResult
export interface TrainingPaceRow {
  category: string;
  minPaceSecsPerKm: number;
  maxPaceSecsPerKm: number;
  description: string;
}

export function calculateTrainingPacesFromRaceResult(raceDistanceKm: number, raceTimeSeconds: number): TrainingPaceRow[] {
  const dist = safeVal(raceDistanceKm);
  const time = safeVal(raceTimeSeconds);
  if (dist <= 0 || time <= 0) return [];

  const basePace = time / dist;
  // Let's estimate threshold pace as approximately 10K equivalent pace.
  // If the race is a 5K, threshold is about 5% slower. If marathon, 5% faster.
  let theoreticalThreshold = basePace;
  if (dist < 8) {
    theoreticalThreshold = basePace * 1.05; // 5K is faster than threshold
  } else if (dist > 15 && dist < 30) {
    theoreticalThreshold = basePace * 0.97; // HM is slightly slower
  } else if (dist >= 30) {
    theoreticalThreshold = basePace * 0.92; // Marathon is significantly slower
  }

  return calculateTrainingPacesFromThreshold(theoreticalThreshold);
}

// 17. calculateTrainingPacesFromThreshold
export function calculateTrainingPacesFromThreshold(thresholdPaceSecondsPerKm: number): TrainingPaceRow[] {
  const thresh = safeVal(thresholdPaceSecondsPerKm);
  if (thresh <= 0) return [];

  return [
    { category: 'Recovery', minPaceSecsPerKm: thresh * 1.32, maxPaceSecsPerKm: thresh * 1.45, description: 'Very easy recovery runs to stimulate blood flow.' },
    { category: 'Easy', minPaceSecsPerKm: thresh * 1.18, maxPaceSecsPerKm: thresh * 1.30, description: 'General aerobic building, warm-ups, and cool-downs.' },
    { category: 'Long Run', minPaceSecsPerKm: thresh * 1.15, maxPaceSecsPerKm: thresh * 1.25, description: 'Extended endurance sessions building mitochondrial density.' },
    { category: 'Steady', minPaceSecsPerKm: thresh * 1.05, maxPaceSecsPerKm: thresh * 1.12, description: 'Aerobic threshold workouts, moderate effort endurance effort.' },
    { category: 'Marathon', minPaceSecsPerKm: thresh * 1.02, maxPaceSecsPerKm: thresh * 1.06, description: 'Specific event pace for marathon training blocks.' },
    { category: 'Tempo', minPaceSecsPerKm: thresh * 0.98, maxPaceSecsPerKm: thresh * 1.01, description: 'Anaerobic-aerobic cusp, improves lactate clearance.' },
    { category: 'Threshold', minPaceSecsPerKm: thresh * 0.96, maxPaceSecsPerKm: thresh * 1.00, description: 'Lactate threshold intensity, sustainable for ~1 hour.' },
    { category: 'Cruise Interval', minPaceSecsPerKm: thresh * 0.94, maxPaceSecsPerKm: thresh * 0.97, description: 'High-quality intervals with brief active recovery blocks.' },
    { category: '10K', minPaceSecsPerKm: thresh * 0.92, maxPaceSecsPerKm: thresh * 0.95, description: 'Specific intensity mimicking 10km race pace.' },
    { category: '5K', minPaceSecsPerKm: thresh * 0.88, maxPaceSecsPerKm: thresh * 0.91, description: 'VO2 Max building blocks mimicking 5km race pace.' },
    { category: '3K', minPaceSecsPerKm: thresh * 0.84, maxPaceSecsPerKm: thresh * 0.87, description: 'Anaerobic capacity builder mimicking 3km pace.' },
    { category: 'Mile', minPaceSecsPerKm: thresh * 0.78, maxPaceSecsPerKm: thresh * 0.82, description: 'Speed and neuromusucluar development mimicry.' },
    { category: 'Interval', minPaceSecsPerKm: thresh * 0.83, maxPaceSecsPerKm: thresh * 0.89, description: 'High cardiac output development with structural rests.' },
    { category: 'Repetition', minPaceSecsPerKm: thresh * 0.72, maxPaceSecsPerKm: thresh * 0.80, description: 'Speed development, focusing on form and mechanics.' },
    { category: 'Strides', minPaceSecsPerKm: thresh * 0.65, maxPaceSecsPerKm: thresh * 0.72, description: 'Short speed accelerations to finish off easy runs.' }
  ];
}

// 18. calculateTrainingPacesFromCriticalSpeed
export function calculateTrainingPacesFromCriticalSpeed(criticalSpeedMetersPerSecond: number): TrainingPaceRow[] {
  const cs = safeVal(criticalSpeedMetersPerSecond);
  if (cs <= 0) return [];
  const csPace = 1000 / cs;
  // CS acts similarly to threshold pace (approx. 2-5% faster than standard threshold)
  return calculateTrainingPacesFromThreshold(csPace * 1.03);
}

// 19. calculateTrainingPacesFromManualBasePace
export function calculateTrainingPacesFromManualBasePace(basePaceSecondsPerKm: number): TrainingPaceRow[] {
  const base = safeVal(basePaceSecondsPerKm);
  if (base <= 0) return [];
  // Manual base is typically "Easy" pace (~122% of threshold)
  return calculateTrainingPacesFromThreshold(base / 1.22);
}

// 20. calculateTrainingPaceConversions
export interface PaceConversionResult {
  oneHundredMetersSeconds: number;
  twoHundredMetersSeconds: number;
  fourHundredMetersSeconds: number;
  eightHundredMetersSeconds: number;
  oneKilometerSeconds: number;
  oneMileSeconds: number;
  kmh: number;
  mph: number;
}

export function calculateTrainingPaceConversions(paceSecondsPerKm: number): PaceConversionResult {
  const pace = safeVal(paceSecondsPerKm);
  if (pace <= 0) {
    return {
      oneHundredMetersSeconds: 0,
      twoHundredMetersSeconds: 0,
      fourHundredMetersSeconds: 0,
      eightHundredMetersSeconds: 0,
      oneKilometerSeconds: 0,
      oneMileSeconds: 0,
      kmh: 0,
      mph: 0
    };
  }

  const speedMps = 1000 / pace;
  const kmh = speedMps * 3.6;
  const mph = speedMps * 2.23694;

  return {
    oneHundredMetersSeconds: pace * 0.1,
    twoHundredMetersSeconds: pace * 0.2,
    fourHundredMetersSeconds: pace * 0.4,
    eightHundredMetersSeconds: pace * 0.8,
    oneKilometerSeconds: pace,
    oneMileSeconds: pace * 1.60934,
    kmh,
    mph
  };
}

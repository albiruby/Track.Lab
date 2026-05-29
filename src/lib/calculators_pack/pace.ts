import { assertPositive, round } from "./core";

export function paceSecondsPerKm(distanceMeters: number, timeSeconds: number) {
  assertPositive(distanceMeters, "distanceMeters");
  assertPositive(timeSeconds, "timeSeconds");
  return timeSeconds / (distanceMeters / 1000);
}

// Training pace categories mapping
export type PaceCategory = 'Recovery' | 'Easy' | 'Long Run' | 'Steady' | 'Marathon' | 'Tempo' | 'Threshold' | 'Cruise Interval' | '10K' | '5K' | '3K' | 'Mile' | 'Interval' | 'Repetition' | 'Strides';

export function calculateTrainingPacesFromRaceResult(raceDistanceKm: number, raceTimeSeconds: number) {
  // Using an equivalent VDOT-like or Riegel-like mapping, we'll simplify and map directly from a 5K/10K equivalent or threshold.
  const paceSecsPerKm = raceTimeSeconds / raceDistanceKm;
  // let's derive a theoretical threshold pace from this race result using Riegel
  let exponent = 1.06;
  const eqTime10K = raceTimeSeconds * Math.pow(10 / raceDistanceKm, exponent);
  const vThresholdPace = eqTime10K / 10 * 0.96; // rough threshold estimate: faster than 10K
  return calculateTrainingPacesFromThreshold(vThresholdPace);
}

export function calculateTrainingPacesFromThreshold(thresholdPaceSecondsPerKm: number) {
  assertPositive(thresholdPaceSecondsPerKm, "thresholdPace");
  
  return [
    { category: 'Recovery', minPaceSecs: thresholdPaceSecondsPerKm * 1.30, maxPaceSecs: thresholdPaceSecondsPerKm * 1.45 },
    { category: 'Easy', minPaceSecs: thresholdPaceSecondsPerKm * 1.15, maxPaceSecs: thresholdPaceSecondsPerKm * 1.30 },
    { category: 'Long Run', minPaceSecs: thresholdPaceSecondsPerKm * 1.15, maxPaceSecs: thresholdPaceSecondsPerKm * 1.25 },
    { category: 'Steady', minPaceSecs: thresholdPaceSecondsPerKm * 1.05, maxPaceSecs: thresholdPaceSecondsPerKm * 1.10 },
    { category: 'Marathon', minPaceSecs: thresholdPaceSecondsPerKm * 1.02, maxPaceSecs: thresholdPaceSecondsPerKm * 1.08 },
    { category: 'Tempo', minPaceSecs: thresholdPaceSecondsPerKm * 0.98, maxPaceSecs: thresholdPaceSecondsPerKm * 1.02 },
    { category: 'Threshold', minPaceSecs: thresholdPaceSecondsPerKm * 0.96, maxPaceSecs: thresholdPaceSecondsPerKm * 1.00 },
    { category: 'Cruise Interval', minPaceSecs: thresholdPaceSecondsPerKm * 0.94, maxPaceSecs: thresholdPaceSecondsPerKm * 0.97 },
    { category: '10K', minPaceSecs: thresholdPaceSecondsPerKm * 0.92, maxPaceSecs: thresholdPaceSecondsPerKm * 0.95 },
    { category: '5K', minPaceSecs: thresholdPaceSecondsPerKm * 0.88, maxPaceSecs: thresholdPaceSecondsPerKm * 0.92 },
    { category: '3K', minPaceSecs: thresholdPaceSecondsPerKm * 0.84, maxPaceSecs: thresholdPaceSecondsPerKm * 0.88 },
    { category: 'Mile', minPaceSecs: thresholdPaceSecondsPerKm * 0.80, maxPaceSecs: thresholdPaceSecondsPerKm * 0.84 },
    { category: 'Interval', minPaceSecs: thresholdPaceSecondsPerKm * 0.82, maxPaceSecs: thresholdPaceSecondsPerKm * 0.90 },
    { category: 'Repetition', minPaceSecs: thresholdPaceSecondsPerKm * 0.70, maxPaceSecs: thresholdPaceSecondsPerKm * 0.82 },
    { category: 'Strides', minPaceSecs: thresholdPaceSecondsPerKm * 0.65, maxPaceSecs: thresholdPaceSecondsPerKm * 0.75 }
  ];
}

export function calculateTrainingPacesFromCriticalSpeed(criticalSpeedMetersPerSecond: number) {
  assertPositive(criticalSpeedMetersPerSecond, "csMetersPerSecond");
  const csPaceSecsPerKm = 1000 / criticalSpeedMetersPerSecond;
  // CS is approximately threshold pace, slightly faster
  return calculateTrainingPacesFromThreshold(csPaceSecsPerKm * 1.02);
}

export function calculateTrainingPacesFromManualBasePace(basePaceSecondsPerKm: number) {
  // Assume manual base pace is the "Easy" pace
  const pseudoThreshold = basePaceSecondsPerKm / 1.20;
  return calculateTrainingPacesFromThreshold(pseudoThreshold);
}

export function calculateTrainingPaceConversions(paceSecondsPerKm: number) {
  assertPositive(paceSecondsPerKm, "paceSecondsPerKm");
  const speedMetersPerSecond = 1000 / paceSecondsPerKm;
  
  return {
    "100m": paceSecondsPerKm * 0.1,
    "200m": paceSecondsPerKm * 0.2,
    "400m": paceSecondsPerKm * 0.4,
    "800m": paceSecondsPerKm * 0.8,
    "1K": paceSecondsPerKm,
    "1 mile": paceSecondsPerKm * 1.60934,
    "kmh": (speedMetersPerSecond * 3600) / 1000,
    "mph": (speedMetersPerSecond * 3600) / 1609.34
  };
}

export function timeFromDistanceAndPace(distanceMeters: number, paceSecondsPerKmValue: number) {
  assertPositive(distanceMeters, "distanceMeters");
  assertPositive(paceSecondsPerKmValue, "paceSecondsPerKm");
  return paceSecondsPerKmValue * (distanceMeters / 1000);
}

export function distanceFromTimeAndPace(timeSeconds: number, paceSecondsPerKmValue: number) {
  assertPositive(timeSeconds, "timeSeconds");
  assertPositive(paceSecondsPerKmValue, "paceSecondsPerKm");
  return (timeSeconds / paceSecondsPerKmValue) * 1000;
}

export function speedKmhFromPace(paceSecondsPerKmValue: number) {
  assertPositive(paceSecondsPerKmValue, "paceSecondsPerKm");
  return round(3600 / paceSecondsPerKmValue, 3);
}

export function paceFromSpeedKmh(speedKmh: number) {
  assertPositive(speedKmh, "speedKmh");
  return 3600 / speedKmh;
}

export function splitTable(distanceMeters: number, totalTimeSeconds: number, segmentMeters: number) {
  assertPositive(distanceMeters, "distanceMeters");
  assertPositive(totalTimeSeconds, "totalTimeSeconds");
  assertPositive(segmentMeters, "segmentMeters");
  const pace = paceSecondsPerKm(distanceMeters, totalTimeSeconds);
  const rows = [] as Array<{ segment: number; distanceMeters: number; splitSeconds: number; cumulativeSeconds: number }>;
  let cumulative = 0;
  for (let d = segmentMeters; d < distanceMeters; d += segmentMeters) {
    const split = timeFromDistanceAndPace(segmentMeters, pace);
    cumulative += split;
    rows.push({ segment: rows.length + 1, distanceMeters: d, splitSeconds: split, cumulativeSeconds: cumulative });
  }
  const remaining = distanceMeters - rows.length * segmentMeters;
  if (remaining > 0) {
    const split = timeFromDistanceAndPace(remaining, pace);
    cumulative += split;
    rows.push({ segment: rows.length + 1, distanceMeters, splitSeconds: split, cumulativeSeconds: cumulative });
  }
  return rows;
}

export function paceDriftPercent(earlyPaceSecondsPerKm: number, latePaceSecondsPerKm: number) {
  assertPositive(earlyPaceSecondsPerKm, "earlyPaceSecondsPerKm");
  assertPositive(latePaceSecondsPerKm, "latePaceSecondsPerKm");
  return round(((latePaceSecondsPerKm - earlyPaceSecondsPerKm) / earlyPaceSecondsPerKm) * 100, 2);
}

export function calculateStopAdjustedPace(distanceKm: number, movingTimeSeconds: number, stopTimeSeconds: number) {
  assertPositive(distanceKm, "distanceKm");
  assertPositive(movingTimeSeconds, "movingTimeSeconds");
  const totalElapased = movingTimeSeconds + stopTimeSeconds;
  return {
    movingPace: movingTimeSeconds / distanceKm,
    elapsedPace: totalElapased / distanceKm,
    totalElapsedSeconds: totalElapased
  };
}

export function calculateRunWalkBlendedPace(runPaceSecs: number, walkPaceSecs: number, runDurationSecs: number, walkDurationSecs: number) {
  assertPositive(runPaceSecs, "runPaceSecs");
  assertPositive(walkPaceSecs, "walkPaceSecs");
  assertPositive(runDurationSecs, "runDurationSecs");
  
  const cycleTime = runDurationSecs + walkDurationSecs;
  const runDist = runDurationSecs / runPaceSecs;
  const walkDist = walkDurationSecs > 0 ? (walkDurationSecs / walkPaceSecs) : 0;
  
  const totalDist = runDist + walkDist;
  const blendedPace = cycleTime / totalDist;
  
  return blendedPace;
}

import { assertPositive } from "./core";

export function twoPointCriticalSpeed(d1Meters: number, t1Seconds: number, d2Meters: number, t2Seconds: number) {
  assertPositive(d1Meters, "d1Meters");
  assertPositive(t1Seconds, "t1Seconds");
  assertPositive(d2Meters, "d2Meters");
  assertPositive(t2Seconds, "t2Seconds");
  if (t1Seconds === t2Seconds) throw new Error("Trial times must be different.");
  const csMetersPerSecond = (d2Meters - d1Meters) / (t2Seconds - t1Seconds);
  const dPrimeMeters = d1Meters - csMetersPerSecond * t1Seconds;
  return { csMetersPerSecond, dPrimeMeters };
}

export function paceSecondsPerKmFromSpeedMetersPerSecond(speed: number) {
  assertPositive(speed, "speed");
  return 1000 / speed;
}

export function timeToExhaustionAboveCs(dPrimeMeters: number, targetSpeedMetersPerSecond: number, csMetersPerSecond: number) {
  assertPositive(dPrimeMeters, "dPrimeMeters");
  assertPositive(targetSpeedMetersPerSecond, "targetSpeedMetersPerSecond");
  assertPositive(csMetersPerSecond, "csMetersPerSecond");
  if (targetSpeedMetersPerSecond <= csMetersPerSecond) throw new Error("Target speed must be above CS.");
  return dPrimeMeters / (targetSpeedMetersPerSecond - csMetersPerSecond);
}

export function calculateCriticalSpeed2Point(distance1Meters: number, time1Seconds: number, distance2Meters: number, time2Seconds: number) {
  assertPositive(distance1Meters, "distance1Meters");
  assertPositive(time1Seconds, "time1Seconds");
  assertPositive(distance2Meters, "distance2Meters");
  assertPositive(time2Seconds, "time2Seconds");
  if (time1Seconds === time2Seconds) throw new Error("Trial times must not be identical.");
  
  const d1 = Math.min(distance1Meters, distance2Meters);
  const t1 = distance1Meters < distance2Meters ? time1Seconds : time2Seconds;
  const d2 = Math.max(distance1Meters, distance2Meters);
  const t2 = distance1Meters < distance2Meters ? time2Seconds : time1Seconds;
  
  if (t2 <= t1) throw new Error("Longer distance must have longer time.");
  
  const cs = (d2 - d1) / (t2 - t1);
  const dp = d1 - cs * t1;
  return { cs, dp };
}

export function calculateCriticalSpeed3Point(trials: { distanceMeters: number, timeSeconds: number }[]) {
  if (trials.length < 3) throw new Error("At least 3 trials required.");
  
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  const n = trials.length;
  
  for (const t of trials) {
      assertPositive(t.distanceMeters, "distanceMeters");
      assertPositive(t.timeSeconds, "timeSeconds");
      sumX += t.timeSeconds;
      sumY += t.distanceMeters;
      sumXY += t.timeSeconds * t.distanceMeters;
      sumX2 += t.timeSeconds * t.timeSeconds;
      sumY2 += t.distanceMeters * t.distanceMeters;
  }
  
  const denominator = (n * sumX2 - sumX * sumX);
  if (denominator === 0) throw new Error("Invalid trials for regression.");
  
  const cs = (n * sumXY - sumX * sumY) / denominator;
  const dp = (sumY - cs * sumX) / n;
  
  // Calculate R^2
  const numeratorRSQ = (n * sumXY - sumX * sumY) * (n * sumXY - sumX * sumY);
  const denomRSQ = denominator * (n * sumY2 - sumY * sumY);
  
  const r2 = denomRSQ === 0 ? 0 : numeratorRSQ / denomRSQ;
  
  return { cs, dp, r2 };
}

export function calculateCriticalPace(csMetersPerSecond: number) {
  assertPositive(csMetersPerSecond, "csMetersPerSecond");
  return 1000 / csMetersPerSecond; // seconds per km
}

export function calculateTimeToExhaustionAboveCS(speedMetersPerSecond: number, criticalSpeedMetersPerSecond: number, dPrimeMeters: number) {
  assertPositive(speedMetersPerSecond, "speed");
  assertPositive(criticalSpeedMetersPerSecond, "cs");
  if (speedMetersPerSecond <= criticalSpeedMetersPerSecond) throw new Error("Target speed must be above CS for TTE.");
  return dPrimeMeters / (speedMetersPerSecond - criticalSpeedMetersPerSecond);
}

export function calculateDistanceCapacityAboveCS(speedMetersPerSecond: number, criticalSpeedMetersPerSecond: number, durationSeconds: number) {
  assertPositive(speedMetersPerSecond, "speed");
  assertPositive(criticalSpeedMetersPerSecond, "cs");
  assertPositive(durationSeconds, "duration");
  if (speedMetersPerSecond <= criticalSpeedMetersPerSecond) return 0;
  return (speedMetersPerSecond - criticalSpeedMetersPerSecond) * durationSeconds;
}

export function calculateCSZoneTable(criticalSpeedMps: number) {
  assertPositive(criticalSpeedMps, "criticalSpeedMps");
  return [
    { name: "Zone 1 (Recovery)", pctCS: "< 80%", speeds: [0, criticalSpeedMps * 0.8] },
    { name: "Zone 2 (Endurance)", pctCS: "80-90%", speeds: [criticalSpeedMps * 0.8, criticalSpeedMps * 0.9] },
    { name: "Zone 3 (Tempo)", pctCS: "90-98%", speeds: [criticalSpeedMps * 0.9, criticalSpeedMps * 0.98] },
    { name: "Zone 4 (Threshold/CS)", pctCS: "98-102%", speeds: [criticalSpeedMps * 0.98, criticalSpeedMps * 1.02] },
    { name: "Zone 5 (V02 Max/Anaerobic)", pctCS: "> 102%", speeds: [criticalSpeedMps * 1.02, Infinity] }
  ];
}

export function compareCSToRacePaces(csPaceSecsPerKm: number, thresholdPaceSecsPerKm?: number, fiveKPaceSecsPerKm?: number, tenKPaceSecsPerKm?: number) {
  return {
    thresholdDelta: thresholdPaceSecsPerKm ? thresholdPaceSecsPerKm - csPaceSecsPerKm : null,
    fiveKDelta: fiveKPaceSecsPerKm ? fiveKPaceSecsPerKm - csPaceSecsPerKm : null,
    tenKDelta: tenKPaceSecsPerKm ? tenKPaceSecsPerKm - csPaceSecsPerKm : null
  };
}

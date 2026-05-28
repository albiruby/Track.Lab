import { assertPositive, round } from "./core";

export function paceSecondsPerKm(distanceMeters: number, timeSeconds: number) {
  assertPositive(distanceMeters, "distanceMeters");
  assertPositive(timeSeconds, "timeSeconds");
  return timeSeconds / (distanceMeters / 1000);
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

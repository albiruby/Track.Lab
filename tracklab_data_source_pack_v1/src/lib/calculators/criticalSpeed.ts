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

import { assertPositive } from "./core";

export function riegelPredictTime(knownDistanceMeters: number, knownTimeSeconds: number, targetDistanceMeters: number, exponent = 1.06) {
  assertPositive(knownDistanceMeters, "knownDistanceMeters");
  assertPositive(knownTimeSeconds, "knownTimeSeconds");
  assertPositive(targetDistanceMeters, "targetDistanceMeters");
  assertPositive(exponent, "exponent");
  return knownTimeSeconds * Math.pow(targetDistanceMeters / knownDistanceMeters, exponent);
}

export function goalPaceSecondsPerKm(targetDistanceMeters: number, targetTimeSeconds: number) {
  assertPositive(targetDistanceMeters, "targetDistanceMeters");
  assertPositive(targetTimeSeconds, "targetTimeSeconds");
  return targetTimeSeconds / (targetDistanceMeters / 1000);
}

import { assertPositive } from "./core";

export function cooper12MinuteVo2(distanceMeters: number) {
  assertPositive(distanceMeters, "distanceMeters");
  return (distanceMeters - 504.9) / 44.73;
}

export function acsmRunningVo2(speedMetersPerMinute: number, gradeDecimal: number) {
  assertPositive(speedMetersPerMinute, "speedMetersPerMinute");
  return 0.2 * speedMetersPerMinute + 0.9 * speedMetersPerMinute * gradeDecimal + 3.5;
}

export function metFromVo2(vo2: number) {
  assertPositive(vo2, "vo2");
  return vo2 / 3.5;
}

export function caloriesFromMet(met: number, bodyMassKg: number, durationMinutes: number) {
  assertPositive(met, "met");
  assertPositive(bodyMassKg, "bodyMassKg");
  assertPositive(durationMinutes, "durationMinutes");
  return (met * 3.5 * bodyMassKg / 200) * durationMinutes;
}

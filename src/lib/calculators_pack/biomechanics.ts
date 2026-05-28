import { assertPositive } from "./core";

export function cadence(steps: number, durationMinutes: number) {
  assertPositive(steps, "steps");
  assertPositive(durationMinutes, "durationMinutes");
  return steps / durationMinutes;
}

export function strideLengthMeters(speedMetersPerMinute: number, cadenceStepsPerMinute: number) {
  assertPositive(speedMetersPerMinute, "speedMetersPerMinute");
  assertPositive(cadenceStepsPerMinute, "cadenceStepsPerMinute");
  return speedMetersPerMinute / cadenceStepsPerMinute;
}

export function stepCount(cadenceStepsPerMinute: number, durationMinutes: number) {
  assertPositive(cadenceStepsPerMinute, "cadenceStepsPerMinute");
  assertPositive(durationMinutes, "durationMinutes");
  return cadenceStepsPerMinute * durationMinutes;
}

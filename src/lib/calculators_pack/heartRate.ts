import { assertPositive } from "./core";

export const hrmax = {
  fox: (age: number) => 220 - age,
  tanaka: (age: number) => 208 - 0.7 * age,
  gellish: (age: number) => 206.9 - 0.67 * age,
  gulati: (age: number) => 206 - 0.88 * age,
  nes: (age: number) => 211 - 0.64 * age,
};

export function zoneFromHrmax(maxHeartRate: number, minPct: number, maxPct?: number | null) {
  assertPositive(maxHeartRate, "maxHeartRate");
  return {
    min: Math.round(maxHeartRate * minPct),
    max: maxPct ? Math.round(maxHeartRate * maxPct) : null,
  };
}

export function zoneFromKarvonen(maxHeartRate: number, restingHeartRate: number, minPct: number, maxPct?: number | null) {
  assertPositive(maxHeartRate, "maxHeartRate");
  assertPositive(restingHeartRate, "restingHeartRate");
  if (restingHeartRate >= maxHeartRate) throw new Error("Resting HR must be lower than max HR.");
  const hrr = maxHeartRate - restingHeartRate;
  return {
    min: Math.round(restingHeartRate + hrr * minPct),
    max: maxPct ? Math.round(restingHeartRate + hrr * maxPct) : null,
  };
}

export function zoneFromLthr(lthr: number, minPct: number, maxPct?: number | null) {
  assertPositive(lthr, "lactateThresholdHeartRate");
  return {
    min: Math.round(lthr * minPct),
    max: maxPct ? Math.round(lthr * maxPct) : null,
  };
}

export function maf180(age: number, modifier = 0) {
  assertPositive(age, "age");
  return 180 - age + modifier;
}

export function decouplingPercent(firstEfficiencyFactor: number, secondEfficiencyFactor: number) {
  assertPositive(firstEfficiencyFactor, "firstEfficiencyFactor");
  assertPositive(secondEfficiencyFactor, "secondEfficiencyFactor");
  return ((firstEfficiencyFactor - secondEfficiencyFactor) / firstEfficiencyFactor) * 100;
}

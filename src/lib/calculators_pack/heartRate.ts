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

export function calculateHeartRateReserve(maxHeartRate: number, restingHeartRate: number) {
  assertPositive(maxHeartRate, "maxHeartRate");
  assertPositive(restingHeartRate, "restingHeartRate");
  return maxHeartRate - restingHeartRate;
}

export function calculateKarvonenTarget(maxHeartRate: number, restingHeartRate: number, intensityPercent: number) {
  const hrr = calculateHeartRateReserve(maxHeartRate, restingHeartRate);
  return restingHeartRate + (hrr * (intensityPercent / 100));
}

export function calculateHRDrift(firstHalfHR: number, secondHalfHR: number) {
  assertPositive(firstHalfHR, "firstHalfHR");
  assertPositive(secondHalfHR, "secondHalfHR");
  return ((secondHalfHR - firstHalfHR) / firstHalfHR) * 100;
}

export function calculateAerobicDecoupling(firstHalfSpeed: number, firstHalfHR: number, secondHalfSpeed: number, secondHalfHR: number) {
  assertPositive(firstHalfSpeed, "firstHalfSpeed");
  assertPositive(firstHalfHR, "firstHalfHR");
  assertPositive(secondHalfSpeed, "secondHalfSpeed");
  assertPositive(secondHalfHR, "secondHalfHR");
  
  const ef1 = firstHalfSpeed / firstHalfHR;
  const ef2 = secondHalfSpeed / secondHalfHR;
  return ((ef1 - ef2) / ef1) * 100;
}

export function calculateHRRecovery(peakHR: number, recoveryHR: number) {
  assertPositive(peakHR, "peakHR");
  assertPositive(recoveryHR, "recoveryHR");
  return peakHR - recoveryHR;
}

export type ZoneModel = { name: string; minPct: number; maxPct: number; }[];

export function generateHRmaxZones(maxHeartRate: number, zoneModel: ZoneModel) {
  return zoneModel.map(z => ({
    name: z.name,
    min: Math.round(maxHeartRate * (z.minPct / 100)),
    max: Math.round(maxHeartRate * (z.maxPct / 100))
  }));
}

export function generateKarvonenZones(maxHeartRate: number, restingHeartRate: number, zoneModel: ZoneModel) {
  return zoneModel.map(z => ({
    name: z.name,
    min: Math.round(calculateKarvonenTarget(maxHeartRate, restingHeartRate, z.minPct)),
    max: Math.round(calculateKarvonenTarget(maxHeartRate, restingHeartRate, z.maxPct))
  }));
}

export function generateLTHRZones(lthr: number, zoneModel: ZoneModel) {
  return zoneModel.map(z => ({
    name: z.name,
    min: Math.round(lthr * (z.minPct / 100)),
    max: Math.round(lthr * (z.maxPct / 100))
  }));
}

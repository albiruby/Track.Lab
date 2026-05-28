import { assertPositive } from "./core";

export function totalCarbs(durationHours: number, carbsPerHour: number) {
  assertPositive(durationHours, "durationHours");
  assertPositive(carbsPerHour, "carbsPerHour");
  return durationHours * carbsPerHour;
}

export function gelCount(totalCarbsGrams: number, carbsPerGel: number) {
  assertPositive(totalCarbsGrams, "totalCarbsGrams");
  assertPositive(carbsPerGel, "carbsPerGel");
  return totalCarbsGrams / carbsPerGel;
}

export function totalFluid(durationHours: number, fluidMlPerHour: number) {
  assertPositive(durationHours, "durationHours");
  assertPositive(fluidMlPerHour, "fluidMlPerHour");
  return durationHours * fluidMlPerHour;
}

export function totalSodium(durationHours: number, sodiumMgPerHour: number) {
  assertPositive(durationHours, "durationHours");
  assertPositive(sodiumMgPerHour, "sodiumMgPerHour");
  return durationHours * sodiumMgPerHour;
}

export function sweatRate(preWeightKg: number, postWeightKg: number, fluidIntakeL: number, urineOutputL: number, durationHours: number) {
  assertPositive(preWeightKg, "preWeightKg");
  assertPositive(postWeightKg, "postWeightKg");
  assertPositive(durationHours, "durationHours");
  const bodyMassLossL = preWeightKg - postWeightKg;
  const sweatLossL = bodyMassLossL + fluidIntakeL - urineOutputL;
  return sweatLossL / durationHours;
}

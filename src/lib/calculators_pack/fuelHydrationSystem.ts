export function calculateTotalCarbs(durationHours: number, carbsPerHour: number): number {
  if (durationHours <= 0 || carbsPerHour <= 0 || isNaN(durationHours) || isNaN(carbsPerHour)) return 0;
  return durationHours * carbsPerHour;
}

export function calculateGelCount(totalCarbs: number, carbsPerGel: number): number {
  if (carbsPerGel <= 0 || totalCarbs <= 0 || isNaN(totalCarbs) || isNaN(carbsPerGel)) return 0;
  return totalCarbs / carbsPerGel;
}

export function calculateChewCount(totalCarbs: number, carbsPerServing: number): number {
  if (carbsPerServing <= 0 || totalCarbs <= 0 || isNaN(totalCarbs) || isNaN(carbsPerServing)) return 0;
  return totalCarbs / carbsPerServing;
}

export function calculateDrinkMixCarbs(servings: number, carbsPerServing: number): number {
  if (servings <= 0 || carbsPerServing <= 0 || isNaN(servings) || isNaN(carbsPerServing)) return 0;
  return servings * carbsPerServing;
}

export function calculateCarbsPerBottle(totalCarbs: number, bottleCount: number): number {
  if (bottleCount <= 0 || totalCarbs <= 0 || isNaN(totalCarbs) || isNaN(bottleCount)) return 0;
  return totalCarbs / bottleCount;
}

export function calculateCarbPerAidStation(totalCarbs: number, aidStationCount: number): number {
  if (aidStationCount <= 0 || totalCarbs <= 0 || isNaN(totalCarbs) || isNaN(aidStationCount)) return 0;
  return totalCarbs / aidStationCount;
}

export interface FuelCheckpoint {
  minute: number;
  action: string;
  amount: string;
}

export function calculateFuelingCheckpoints(durationMinutes: number, intervalMinutes: number): number[] {
  if (durationMinutes <= 0 || intervalMinutes <= 0 || isNaN(durationMinutes) || isNaN(intervalMinutes)) return [];
  const checkpoints: number[] = [];
  for (let m = intervalMinutes; m < durationMinutes; m += intervalMinutes) {
    checkpoints.push(m);
  }
  return checkpoints;
}

export function calculateTotalFluid(durationHours: number, fluidPerHour: number): number {
  if (durationHours <= 0 || fluidPerHour <= 0 || isNaN(durationHours) || isNaN(fluidPerHour)) return 0;
  return durationHours * fluidPerHour;
}

export function calculateBottleCount(totalFluidMl: number, bottleSizeMl: number): number {
  if (bottleSizeMl <= 0 || totalFluidMl <= 0 || isNaN(totalFluidMl) || isNaN(bottleSizeMl)) return 0;
  return totalFluidMl / bottleSizeMl;
}

export function calculateFluidPerBottle(totalFluidMl: number, bottleCount: number): number {
  if (bottleCount <= 0 || totalFluidMl <= 0 || isNaN(totalFluidMl) || isNaN(bottleCount)) return 0;
  return totalFluidMl / bottleCount;
}

export function calculateTotalSodium(durationHours: number, sodiumPerHour: number): number {
  if (durationHours <= 0 || sodiumPerHour <= 0 || isNaN(durationHours) || isNaN(sodiumPerHour)) return 0;
  return durationHours * sodiumPerHour;
}

export function calculateSodiumPerLiter(totalSodiumMg: number, totalFluidLiters: number): number {
  if (totalFluidLiters <= 0 || totalSodiumMg <= 0 || isNaN(totalSodiumMg) || isNaN(totalFluidLiters)) return 0;
  return totalSodiumMg / totalFluidLiters;
}

export function calculateSodiumPerBottle(totalSodiumMg: number, bottleCount: number): number {
  if (bottleCount <= 0 || totalSodiumMg <= 0 || isNaN(totalSodiumMg) || isNaN(bottleCount)) return 0;
  return totalSodiumMg / bottleCount;
}

export function calculateSaltCapsuleCount(totalSodiumMg: number, sodiumPerCapsuleMg: number): number {
  if (sodiumPerCapsuleMg <= 0 || totalSodiumMg <= 0 || isNaN(totalSodiumMg) || isNaN(sodiumPerCapsuleMg)) return 0;
  return totalSodiumMg / sodiumPerCapsuleMg;
}

export function calculateSweatLoss(preWeightKg: number, postWeightKg: number, fluidIntakeLiters: number, urineLiters: number): number {
  if (preWeightKg <= 0 || postWeightKg <= 0 || isNaN(preWeightKg) || isNaN(postWeightKg)) return 0;
  const netFluidIntake = isNaN(fluidIntakeLiters) || fluidIntakeLiters < 0 ? 0 : fluidIntakeLiters;
  const netUrine = isNaN(urineLiters) || urineLiters < 0 ? 0 : urineLiters;
  
  // Loss = (Pre - Post) + Intake - Urine
  const loss = (preWeightKg - postWeightKg) + netFluidIntake - netUrine;
  return Math.max(0, loss);
}

export function calculateSweatRate(sweatLossLiters: number, durationHours: number): number {
  if (durationHours <= 0 || sweatLossLiters <= 0 || isNaN(sweatLossLiters) || isNaN(durationHours)) return 0;
  return sweatLossLiters / durationHours;
}

export function calculateBodyMassLossPercent(preWeightKg: number, postWeightKg: number): number {
  if (preWeightKg <= 0 || isNaN(preWeightKg) || isNaN(postWeightKg)) return 0;
  return ((preWeightKg - postWeightKg) / preWeightKg) * 100;
}

export function calculateFluidReplacementPercent(fluidIntakeLiters: number, sweatLossLiters: number): number {
  if (sweatLossLiters <= 0 || isNaN(fluidIntakeLiters) || isNaN(sweatLossLiters)) return 0;
  return (fluidIntakeLiters / sweatLossLiters) * 100;
}

export function calculateBottleRecipe(carbsPerBottle: number, sodiumPerBottle: number, bottleSizeMl: number) {
  // Calculates concentration osmolarity estimates and visual measurements of recipe
  if (bottleSizeMl <= 0 || isNaN(bottleSizeMl)) {
    return { carbConcentration: 0, sodiumConcentration: 0, instructions: 'Invalid bottle dimensions.' };
  }
  const carbPct = (carbsPerBottle / bottleSizeMl) * 100;
  const sodiumPct = (sodiumPerBottle / bottleSizeMl) * 1000; // mg/ml
  
  return {
    carbConcentration: Math.max(0, carbPct),
    sodiumConcentration: Math.max(0, sodiumPct),
    instructions: `Per bottle recipe: Fill with water, dissolve ${carbsPerBottle.toFixed(0)}g carbs and scoop/mix in ${sodiumPerBottle.toFixed(0)}mg sodium.`
  };
}

export function calculateFuelCost(
  gelCount: number,
  gelPrice: number,
  drinkMixServings: number,
  drinkMixPrice: number,
  sodiumCapsuleCount: number,
  capsulePrice: number
): number {
  const gCost = (isNaN(gelCount) || gelCount <= 0 || isNaN(gelPrice) || gelPrice <= 0) ? 0 : gelCount * gelPrice;
  const dCost = (isNaN(drinkMixServings) || drinkMixServings <= 0 || isNaN(drinkMixPrice) || drinkMixPrice <= 0) ? 0 : drinkMixServings * drinkMixPrice;
  const sCost = (isNaN(sodiumCapsuleCount) || sodiumCapsuleCount <= 0 || isNaN(capsulePrice) || capsulePrice <= 0) ? 0 : sodiumCapsuleCount * capsulePrice;
  return gCost + dCost + sCost;
}

export function calculateCostPerGramCarb(totalCost: number, totalCarbs: number): number {
  if (totalCarbs <= 0 || totalCost <= 0 || isNaN(totalCost) || isNaN(totalCarbs)) return 0;
  return totalCost / totalCarbs;
}

export function calculateRaceFuelPlan(
  durationMinutes: number,
  carbIntervalMinutes: number,
  fluidIntervalMinutes: number,
  sodiumIntervalMinutes?: number
): FuelCheckpoint[] {
  if (durationMinutes <= 0 || isNaN(durationMinutes)) return [];

  const checkpoints: FuelCheckpoint[] = [];

  // Intervals: Carb
  if (carbIntervalMinutes > 0 && !isNaN(carbIntervalMinutes)) {
    for (let m = carbIntervalMinutes; m <= durationMinutes; m += carbIntervalMinutes) {
      checkpoints.push({
        minute: m,
        action: 'Carbohydrate fueling',
        amount: '1 planned serving (e.g. gel or chew)'
      });
    }
  }

  // Intervals: Fluid
  if (fluidIntervalMinutes > 0 && !isNaN(fluidIntervalMinutes)) {
    for (let m = fluidIntervalMinutes; m <= durationMinutes; m += fluidIntervalMinutes) {
      checkpoints.push({
        minute: m,
        action: 'Fluid hydration intake',
        amount: '1 standard sip/flask draw'
      });
    }
  }

  // Intervals: Sodium
  if (sodiumIntervalMinutes && sodiumIntervalMinutes > 0 && !isNaN(sodiumIntervalMinutes)) {
    for (let m = sodiumIntervalMinutes; m <= durationMinutes; m += sodiumIntervalMinutes) {
      checkpoints.push({
        minute: m,
        action: 'Sodium capsule or tablet intake',
        amount: '1 capsule/electrolyte focus'
      });
    }
  }

  // Sort by minute
  checkpoints.sort((a, b) => a.minute - b.minute);
  return checkpoints;
}

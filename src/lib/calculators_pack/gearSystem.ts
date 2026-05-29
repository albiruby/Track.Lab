/**
 * Gear and economics calculations.
 */

/**
 * Calculate shoe remaining distance
 * Formula: Remaining = Max - Current
 */
export function calculateShoeRemainingKm(maxKm: number, currentKm: number): number {
  return maxKm - currentKm;
}

/**
 * Calculate shoe usage percentage
 * Formula: Usage % = Current / Max * 100
 */
export function calculateShoeUsagePercent(currentKm: number, maxKm: number): number {
  if (maxKm <= 0) return 0;
  return (currentKm / maxKm) * 100;
}

/**
 * Calculate shoe cost per km
 * Formula: Price / Max (Projected) or Price / Current (Actual)
 */
export function calculateShoeCostPerKm(price: number, usageKm: number): number {
  if (usageKm <= 0) return 0;
  return price / usageKm;
}

/**
 * Calculate shoe cost per single use
 */
export function calculateShoeCostPerUse(price: number, useCount: number): number {
  if (useCount <= 0) return 0;
  return price / useCount;
}

export interface ShoeData {
  name: string;
  price: number;
  currentKm: number;
  maxKm: number;
}

/**
 * Compare two shoes
 */
export function compareShoes(shoeA: ShoeData, shoeB: ShoeData) {
  const remA = calculateShoeRemainingKm(shoeA.maxKm, shoeA.currentKm);
  const remB = calculateShoeRemainingKm(shoeB.maxKm, shoeB.currentKm);
  const usagePctA = calculateShoeUsagePercent(shoeA.currentKm, shoeA.maxKm);
  const usagePctB = calculateShoeUsagePercent(shoeB.currentKm, shoeB.maxKm);
  const costPerKmA = calculateShoeCostPerKm(shoeA.price, shoeA.maxKm);
  const costPerKmB = calculateShoeCostPerKm(shoeB.price, shoeB.maxKm);

  return {
    remainingKmDelta: remA - remB,
    usagePctDelta: usagePctA - usagePctB,
    costPerKmDelta: costPerKmA - costPerKmB,
    shoeA: { remaining: remA, usagePct: usagePctA, costPerKm: costPerKmA },
    shoeB: { remaining: remB, usagePct: usagePctB, costPerKm: costPerKmB }
  };
}

/**
 * Calculate shoe post-race estimated mileage
 */
export function calculateRaceShoeAfterEvent(currentKm: number, raceDistanceKm: number): number {
  return currentKm + raceDistanceKm;
}

/**
 * Calculate generic gear cost per use
 */
export function calculateGearCostPerUse(price: number, useCount: number): number {
  if (useCount <= 0) return 0;
  return price / useCount;
}

/**
 * Calculate gear replacement remaining uses
 */
export function calculateGearReplacementEstimate(currentUse: number, maxUse: number): number {
  return maxUse - currentUse;
}

/**
 * Calculate single gel expense sum
 */
export function calculateGelCost(gelCount: number, gelPrice: number): number {
  if (gelCount < 0 || gelPrice < 0) return 0;
  return gelCount * gelPrice;
}

/**
 * Calculate single serving cost from total pack
 */
export function calculateDrinkMixServingCost(productPrice: number, servings: number): number {
  if (servings <= 0 || productPrice < 0) return 0;
  return productPrice / servings;
}

/**
 * Calculate cost per carb gram
 */
export function calculateCostPerGramCarb(totalCost: number, totalCarbs: number): number {
  if (totalCarbs <= 0 || totalCost < 0) return 0;
  return totalCost / totalCarbs;
}

/**
 * Calculate cost per single bottle of fuel
 */
export function calculateCostPerBottle(totalDrinkMixCost: number, bottleCount: number): number {
  if (bottleCount <= 0 || totalDrinkMixCost < 0) return 0;
  return totalDrinkMixCost / bottleCount;
}

/**
 * Calculate race day fuel cost summation
 */
export function calculateRaceFuelCost(gelCost: number, drinkCost: number, sodiumCost: number): number {
  return gelCost + drinkCost + sodiumCost;
}

/**
 * Calculate weekly fueling cost
 */
export function calculateWeeklyFuelCost(sessionFuelCosts: number[]): number {
  if (!sessionFuelCosts || sessionFuelCosts.length === 0) return 0;
  return sessionFuelCosts.reduce((a, b) => a + b, 0);
}

/**
 * Calculate annual fueling cost
 */
export function calculateAnnualFuelCost(weeklyFuelCost: number): number {
  return weeklyFuelCost * 52;
}

/**
 * Generate a static checklist based on race type and weather tag
 */
export function generateRaceKitChecklist(selectedRaceType: string, weatherTag: string): string[] {
  const standardItems = [
    "Race bib & safety pins",
    "Running socks (synthetic, anti-blister)",
    "Comfortable shorts/tights with gel storage",
    "Pre-hydrated fuel flasks / bottles"
  ];

  const raceTypeItems: Record<string, string[]> = {
    "race_5k_10k": [
      "Racing flats or super-shoes",
      "Short warmup timeline details",
      "1 energy gel (pre-race option)"
    ],
    "race_half_marathon": [
      "Target race shoe of choice",
      "2-3 energy gels (carbohydrate plan)",
      "Electrolyte / sodium capsules"
    ],
    "race_marathon": [
      "Race super-shoes / carbon-plated shoes",
      "6-8 energy gels or equivalent carbohydrate chews",
      "Anti-chafe stick / body lubricant",
      "Race-pace wristband band / split metrics sheet"
    ],
    "race_track_segment": [
      "Spikes or lightweight racing flats",
      "Extra safety pins",
      "Post-race compression socks"
    ]
  };

  const weatherItems: Record<string, string[]> = {
    "weather_cold": [
      "Arm sleeves or warm long sleeve layer",
      "Lightweight running gloves",
      "Thermal singlet or base-layer",
      "Lip balm / moisturizer"
    ],
    "weather_warm": [
      "Lightweight mesh cap / visor",
      "High UV sunglasses",
      "Sweat-resistant sunblock lotion",
      "Extra sodium capsules / electrolyte powders"
    ],
    "weather_rainy": [
      "Waterproof / water-resistant running cap",
      "Light windbreaker / packable shell",
      "Vaseline for toes & anti-chafing priority",
      "Zipper baggies for keeping electronics dry"
    ]
  };

  const raceItems = raceTypeItems[selectedRaceType] || raceTypeItems["race_5k_10k"];
  const weathItems = weatherItems[weatherTag] || weatherItems["weather_cold"];

  return [...new Set([...standardItems, ...raceItems, ...weathItems])];
}

/**
 * Calculate watch battery margin in hours
 * Formula: Margin = batteryHours - expectedRaceHours
 */
export function calculateWatchBatteryMargin(batteryHours: number, expectedRaceHours: number): number {
  return batteryHours - expectedRaceHours;
}

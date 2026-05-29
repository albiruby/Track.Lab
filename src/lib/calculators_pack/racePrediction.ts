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

export function predictRaceAdjustableExponent(knownDistanceKm: number, knownTimeSeconds: number, targetDistanceKm: number, exponent: number) {
  assertPositive(knownDistanceKm, "knownDistanceKm");
  assertPositive(knownTimeSeconds, "knownTimeSeconds");
  assertPositive(targetDistanceKm, "targetDistanceKm");
  return knownTimeSeconds * Math.pow(targetDistanceKm / knownDistanceKm, exponent);
}

export function calculateGoalPace(targetDistanceKm: number, targetTimeSeconds: number) {
  assertPositive(targetDistanceKm, "targetDistanceKm");
  assertPositive(targetTimeSeconds, "targetTimeSeconds");
  return targetTimeSeconds / targetDistanceKm;
}

export function calculateRaceEquivalentTable(knownDistanceKm: number, knownTimeSeconds: number, targetDistancesKm: number[], exponent = 1.06) {
  return targetDistancesKm.map(dist => {
    return {
      distanceKm: dist,
      predictedSeconds: predictRaceAdjustableExponent(knownDistanceKm, knownTimeSeconds, dist, exponent)
    };
  });
}

export function calculateDistanceSimilarityConfidence(knownDistanceKm: number, targetDistanceKm: number) {
  const ratio = Math.max(knownDistanceKm / targetDistanceKm, targetDistanceKm / knownDistanceKm);
  if (ratio <= 1.25) return "Very High (Similar distance)";
  if (ratio <= 2.5) return "Moderate (Common projection)";
  return "Low (Large distance jump)";
}

export function calculateABCRaceGoals(basePredictionSeconds: number, conservativePercent = 1.02, aggressivePercent = 0.98) {
  return {
    aGoalSeconds: basePredictionSeconds * aggressivePercent,
    bGoalSeconds: basePredictionSeconds,
    cGoalSeconds: basePredictionSeconds * conservativePercent
  };
}

export function buildRaceScenario(basePredictionSeconds: number, scenarioType: 'conservative' | 'realistic' | 'aggressive' | 'custom', customModifier = 1.0) {
  let modifier = 1.0;
  if (scenarioType === 'conservative') modifier = 1.05;
  else if (scenarioType === 'aggressive') modifier = 0.97;
  else if (scenarioType === 'custom') modifier = customModifier;
  return basePredictionSeconds * modifier;
}

import { assertPositive } from "./core";

// 1. estimateVO2Cooper12(distanceMeters)
export function estimateVO2Cooper12(distanceMeters: number): number {
  if (distanceMeters <= 0) return 0;
  return (distanceMeters - 504.9) / 44.73;
}

// 2. estimateVO2From15Mile(timeSeconds)
export function estimateVO2From15Mile(timeSeconds: number): number {
  if (timeSeconds <= 0) return 0;
  // Standard equation: VO2max = 3.5 + 483 / (timeSeconds / 60)
  return 3.5 + 483 / (timeSeconds / 60);
}

// 3. estimateVO2Rockport(age, sex, weight, timeSeconds, heartRate)
export function estimateVO2Rockport(
  age: number,
  sex: "male" | "female",
  weightKg: number,
  timeSeconds: number,
  heartRate: number
): number {
  if (age <= 0 || weightKg <= 0 || timeSeconds <= 0 || heartRate <= 0) return 0;
  const weightLbs = weightKg * 2.20462;
  const timeMinutes = timeSeconds / 60;
  const genderValue = sex === "male" ? 1 : 0;
  // Rockport: 132.853 - (0.0769 * weightLbs) - (0.3877 * age) + (6.315 * genderValue) - (3.2649 * timeMinutes) - (0.1565 * heartRate)
  return (
    132.853 -
    0.0769 * weightLbs -
    0.3877 * age +
    6.315 * genderValue -
    3.2649 * timeMinutes -
    0.1565 * heartRate
  );
}

// 4. calculateACSMRunningVO2(speedMetersPerMinute, gradeDecimal)
export function calculateACSMRunningVO2(speedMetersPerMinute: number, gradeDecimal: number): number {
  if (speedMetersPerMinute <= 0) return 0;
  return 0.2 * speedMetersPerMinute + 0.9 * speedMetersPerMinute * gradeDecimal + 3.5;
}

// 5. calculateACSMWalkingVO2(speedMetersPerMinute, gradeDecimal)
export function calculateACSMWalkingVO2(speedMetersPerMinute: number, gradeDecimal: number): number {
  if (speedMetersPerMinute <= 0) return 0;
  return 0.1 * speedMetersPerMinute + 1.8 * speedMetersPerMinute * gradeDecimal + 3.5;
}

// 6. calculateMETFromVO2(vo2)
export function calculateMETFromVO2(vo2: number): number {
  if (vo2 <= 0) return 0;
  return vo2 / 3.5;
}

// 7. calculateCaloriesFromMET(met, bodyWeightKg, durationHours)
export function calculateCaloriesFromMET(met: number, bodyWeightKg: number, durationHours: number): number {
  if (met <= 0 || bodyWeightKg <= 0 || durationHours <= 0) return 0;
  return met * bodyWeightKg * durationHours;
}

// 8. calculateCaloriesPerKm(totalCalories, distanceKm)
export function calculateCaloriesPerKm(totalCalories: number, distanceKm: number): number {
  if (totalCalories <= 0 || distanceKm <= 0) return 0;
  return totalCalories / distanceKm;
}

// 9. calculateCaloriesPerHour(totalCalories, durationHours)
export function calculateCaloriesPerHour(totalCalories: number, durationHours: number): number {
  if (totalCalories <= 0 || durationHours <= 0) return 0;
  return totalCalories / durationHours;
}

// 10. calculateEnergyCostPerKm(bodyWeightKg, distanceKm, totalCalories)
// Cost in kcal / (kg * km)
export function calculateEnergyCostPerKm(bodyWeightKg: number, distanceKm: number, totalCalories: number): number {
  if (bodyWeightKg <= 0 || distanceKm <= 0 || totalCalories <= 0) return 0;
  return totalCalories / (bodyWeightKg * distanceKm);
}

// 11. calculateVO2Reserve(vo2max, restingVO2)
export function calculateVO2Reserve(vo2max: number, restingVO2: number = 3.5): number {
  if (vo2max <= restingVO2) return 0;
  return vo2max - restingVO2;
}

// 12. calculatePercentVO2max(vo2AtSpeed, vo2max)
export function calculatePercentVO2max(vo2AtSpeed: number, vo2max: number): number {
  if (vo2AtSpeed <= 0 || vo2max <= 0) return 0;
  return (vo2AtSpeed / vo2max) * 100;
}

// 13. calculateGradeImpactVO2(flatVO2, gradeVO2)
export function calculateGradeImpactVO2(flatVO2: number, gradeVO2: number): number {
  return Math.max(0, gradeVO2 - flatVO2);
}

// 14. calculateSpeedToVO2Table(speedRange: number[], grade: number, isWalking: boolean = false)
export interface SpeedToVO2Row {
  speedKmh: number;
  speedMps: number;
  paceSecondsPerKm: number;
  vo2: number;
  met: number;
}
export function calculateSpeedToVO2Table(speedRange: number[], grade: number, isWalking: boolean = false): SpeedToVO2Row[] {
  return speedRange.map(speedKmh => {
    const speedMps = speedKmh / 3.6;
    const speedMpm = speedKmh * (1000 / 60); // km/h to m/min
    const paceSecondsPerKm = speedKmh > 0 ? 3600 / speedKmh : 0;
    const vo2 = isWalking
      ? calculateACSMWalkingVO2(speedMpm, grade)
      : calculateACSMRunningVO2(speedMpm, grade);
    const met = calculateMETFromVO2(vo2);
    return {
      speedKmh,
      speedMps,
      paceSecondsPerKm,
      vo2,
      met
    };
  });
}

// 15. estimateThresholdPaceFromFieldTest(testDistance: number, testTimeSeconds: number)
export function estimateThresholdPaceFromFieldTest(testDistance: number, testTimeSeconds: number): number {
  if (testDistance <= 0 || testTimeSeconds <= 0) return 0;
  const speed = testDistance / testTimeSeconds;
  const basePaceSecs = 1000 / speed; // pace in seconds per km

  // Rule of thumb based on distance
  if (testDistance >= 8000) {
    // 10K or higher: threshold pace matches average pace
    return basePaceSecs;
  } else if (testDistance >= 4500) {
    // 5K: threshold pace is ~5% slower
    return basePaceSecs * 1.05;
  } else if (testDistance >= 2400) {
    // 1.5 Mile / 3K: threshold pace is ~8% slower
    return basePaceSecs * 1.08;
  } else {
    // 1 Mile or lower: threshold pace is ~15% slower
    return basePaceSecs * 1.15;
  }
}

// 16. LTHR 30-Minute Test
export function estimateLTHRFrom30MinuteTest(avgHr: number, protocol: "full" | "last20"): number {
  if (avgHr <= 0) return 0;
  // If protocol uses last 20min of 30min test, LTHR is 100% of that average.
  // If average HR is for the full 30-minute test, LTHR is ~95% of full.
  return protocol === "last20" ? avgHr : avgHr * 0.95;
}

// 17. calculateSweatRate(preWeightKg, postWeightKg, fluidIntakeLiters, urineLiters, durationHours)
export function calculateSweatRate(
  preWeightKg: number,
  postWeightKg: number,
  fluidIntakeLiters: number,
  urineLiters: number,
  durationHours: number
): { sweatLossLiters: number; sweatRateLitersPerHour: number; bodyMassLossPercent: number } {
  if (durationHours <= 0) {
    return { sweatLossLiters: 0, sweatRateLitersPerHour: 0, bodyMassLossPercent: 0 };
  }
  const bodyMassLossKg = Math.max(0, preWeightKg - postWeightKg);
  // Sweat Loss (L) = Body Mass Loss + Fluid Intake - Urine Output
  const sweatLossLiters = Math.max(0, bodyMassLossKg + fluidIntakeLiters - urineLiters);
  const sweatRateLitersPerHour = sweatLossLiters / durationHours;
  const bodyMassLossPercent = preWeightKg > 0 ? (bodyMassLossKg / preWeightKg) * 100 : 0;

  return {
    sweatLossLiters,
    sweatRateLitersPerHour,
    bodyMassLossPercent
  };
}

// 18. calculateHRRecoveryFieldTest(peakHR, recoveryHR)
export function calculateHRRecoveryFieldTest(peakHR: number, recoveryHR: number): number {
  if (peakHR <= 0) return 0;
  return Math.max(0, peakHR - recoveryHR);
}

// 19. calculateTreadmillCalibration(measuredDistance, treadmillDistance)
export function calculateTreadmillCalibration(measuredDistance: number, treadmillDistance: number): number {
  if (measuredDistance <= 0) return 0;
  return ((treadmillDistance - measuredDistance) / measuredDistance) * 100;
}

// 20. calculateCadenceTest(steps, durationSeconds)
export function calculateCadenceTest(steps: number, durationSeconds: number): number {
  if (durationSeconds <= 0) return 0;
  return steps / (durationSeconds / 60);
}

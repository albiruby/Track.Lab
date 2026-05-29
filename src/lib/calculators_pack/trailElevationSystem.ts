import { parsePositiveNumber, parseNonNegativeNumber } from "../validation/numbers";

/**
 * 1. Calculate Grade % = Elevation Gain / Horizontal Distance * 100
 */
export function calculateGradePercent(elevationGainMeters: number, horizontalDistanceMeters: number): number {
  if (horizontalDistanceMeters <= 0) return 0;
  return (elevationGainMeters / horizontalDistanceMeters) * 100;
}

/**
 * 2. Calculate Elevation Gain per Km
 */
export function calculateElevationPerKm(totalGainMeters: number, distanceKm: number): number {
  if (distanceKm <= 0) return 0;
  return totalGainMeters / distanceKm;
}

/**
 * 3. Calculate Elevation Gain per Mile (using standard convert or inline 1.609344)
 */
export function calculateElevationPerMile(totalGainMeters: number, distanceMiles: number): number {
  if (distanceMiles <= 0) return 0;
  return totalGainMeters / distanceMiles;
}

/**
 * 4. Calculate Vertical Speed (meters per hour and meters per minute)
 */
export function calculateVerticalSpeed(elevationGainMeters: number, durationSeconds: number): {
  metersPerMinute: number;
  metersPerHour: number;
} {
  if (durationSeconds <= 0) return { metersPerMinute: 0, metersPerHour: 0 };
  const minutes = durationSeconds / 60;
  const hours = durationSeconds / 3600;
  return {
    metersPerMinute: elevationGainMeters / minutes,
    metersPerHour: elevationGainMeters / hours
  };
}

/**
 * 5. Calculate VAM (Vertical Ascent Meters per Hour)
 */
export function calculateVAM(elevationGainMeters: number, durationHours: number): number {
  if (durationHours <= 0) return 0;
  return elevationGainMeters / durationHours;
}

/**
 * 6. Calculate Climb Density (m/km)
 */
export function calculateClimbDensity(totalGainMeters: number, distanceKm: number): number {
  if (distanceKm <= 0) return 0;
  return totalGainMeters / distanceKm;
}

/**
 * 7. Calculate Descent Density (m/km)
 */
export function calculateDescentDensity(totalLossMeters: number, distanceKm: number): number {
  if (distanceKm <= 0) return 0;
  return totalLossMeters / distanceKm;
}

/**
 * 8. Calculate Gain/Loss Ratio
 */
export function calculateGainLossRatio(totalGainMeters: number, totalLossMeters: number): number {
  if (totalLossMeters === 0) {
    return totalGainMeters > 0 ? Infinity : 1;
  }
  return totalGainMeters / totalLossMeters;
}

/**
 * 9. Calculate Net Elevation Change
 */
export function calculateNetElevation(gainMeters: number, lossMeters: number): number {
  return gainMeters - lossMeters;
}

/**
 * 10. Calculate Hill Repeat Volume
 */
export function calculateHillRepeatVolume(reps: number, gainPerRepMeters: number): number {
  return reps * gainPerRepMeters;
}

/**
 * 11. Calculate Hill Repeat Time
 */
export function calculateHillRepeatTime(
  reps: number, 
  workSeconds: number, 
  recoverySeconds: number,
  restPolicy: "between" | "after"
): {
  totalWorkSeconds: number;
  totalRecoverySeconds: number;
  totalDurationSeconds: number;
} {
  const totalWorkSeconds = reps * workSeconds;
  let totalRecoverySeconds = 0;
  
  if (restPolicy === "between") {
    totalRecoverySeconds = Math.max(0, reps - 1) * recoverySeconds;
  } else {
    totalRecoverySeconds = reps * recoverySeconds;
  }

  return {
    totalWorkSeconds,
    totalRecoverySeconds,
    totalDurationSeconds: totalWorkSeconds + totalRecoverySeconds
  };
}

/**
 * 12. Segment Grade
 */
export function calculateSegmentGrade(segmentDistanceMeters: number, segmentGainMeters: number): number {
  if (segmentDistanceMeters <= 0) return 0;
  return (segmentGainMeters / segmentDistanceMeters) * 100;
}

/**
 * 13. Rule-based segment difficulty calculation
 */
export function calculateSegmentDifficulty(
  distanceKm: number, 
  gainMeters: number, 
  surface: string, 
  technicality: "low" | "medium" | "high"
): {
  score: number;
  category: "Easy" | "Moderate" | "Difficult" | "Very Severe" | "Extreme / Pro";
  description: string;
} {
  // Base scoring: distance * 5 + elevation * 0.1
  let score = distanceKm * 5 + gainMeters * 0.1;

  // Surface multiplier
  let surfaceMod = 1.0;
  const s = surface.toLowerCase();
  if (s.includes("trail") || s.includes("gravel")) surfaceMod = 1.2;
  else if (s.includes("mud") || s.includes("sand")) surfaceMod = 1.5;
  else if (s.includes("grass")) surfaceMod = 1.1;

  // Technicality multiplier
  let techMod = 1.0;
  if (technicality === "medium") techMod = 1.15;
  else if (technicality === "high") techMod = 1.35;

  score = score * surfaceMod * techMod;

  let category: "Easy" | "Moderate" | "Difficult" | "Very Severe" | "Extreme / Pro" = "Easy";
  let description = "Flat or gentle rolls. Minimal muscular strain.";

  if (score < 20) {
    category = "Easy";
    description = "Gentle rolling trail or road with positive slopes under 4%. Good for recovery.";
  } else if (score < 50) {
    category = "Moderate";
    description = "Noticeable climbing segments with some technical footing. Moderate cardiovascular effort.";
  } else if (score < 100) {
    category = "Difficult";
    description = "Sustained steep sections or technical terrain. Requires power conservation.";
  } else if (score < 200) {
    category = "Very Severe";
    description = "Severe vertical ascent combined with high-surface resistance. Substantial muscular stress.";
  } else {
    category = "Extreme / Pro";
    description = "Extreme alpine-grade climbing, loose surface, and highly technical scrambling.";
  }

  return { score, category, description };
}

/**
 * 14. Equivalent Flat Distance (Scruff's Rule of Thumb)
 * Formula: Flat Equivalent = Distance Km + (Elevation Gain Meters / 100)
 */
export function calculateEquivalentFlatDistance(distanceKm: number, gainMeters: number): {
  flatDistanceKm: number;
  formulaNote: string;
} {
  const flatDistanceKm = distanceKm + (gainMeters / 100);
  return {
    flatDistanceKm,
    formulaNote: "Scruff's Flat Equivalence Rule: Every 100m of climbing adds the metabolic tax of roughly 1.0km of flat running."
  };
}

export interface ManualSegment {
  name: string;
  distanceKm: number;
  gainMeters: number;
  lossMeters: number;
  surface: string;
  technicality: "low" | "medium" | "high";
}

/**
 * 15. Manual Elevation Profile builder
 */
export function buildManualElevationProfile(segments: ManualSegment[]) {
  let cumulativeDistance = 0;
  let cumulativeGain = 0;
  let cumulativeLoss = 0;
  let currentElevation = 0;

  const segmentRows = segments.map((seg, index) => {
    cumulativeDistance += seg.distanceKm;
    cumulativeGain += seg.gainMeters;
    cumulativeLoss += seg.lossMeters;

    const startElev = currentElevation;
    currentElevation = currentElevation + seg.gainMeters - seg.lossMeters;
    const endElev = currentElevation;

    const segGrade = seg.distanceKm > 0 ? (seg.gainMeters / (seg.distanceKm * 1000)) * 100 : 0;
    const difficultyObj = calculateSegmentDifficulty(seg.distanceKm, seg.gainMeters, seg.surface, seg.technicality);

    return {
      id: index,
      name: seg.name || `Segment ${index + 1}`,
      distanceKm: seg.distanceKm,
      gainMeters: seg.gainMeters,
      lossMeters: seg.lossMeters,
      surface: seg.surface,
      technicality: seg.technicality,
      averageGrade: segGrade,
      startElevationMeters: startElev,
      endElevationMeters: endElev,
      cumulativeDistanceKm: cumulativeDistance,
      difficulty: difficultyObj.category,
      difficultyMessage: difficultyObj.description
    };
  });

  const totalDistMeters = cumulativeDistance * 1000;
  const overallAvgGrade = totalDistMeters > 0 ? (cumulativeGain / totalDistMeters) * 100 : 0;

  // Chart data for elevation trace
  const elevationChartPoints: { name: string; distance: number; elevation: number }[] = [
    { name: "Start", distance: 0, elevation: 0 }
  ];
  segmentRows.forEach((row, i) => {
    elevationChartPoints.push({
      name: row.name,
      distance: Number(row.cumulativeDistanceKm.toFixed(2)),
      elevation: row.endElevationMeters
    });
  });

  return {
    segments: segmentRows,
    totalDistanceKm: cumulativeDistance,
    totalGainMeters: cumulativeGain,
    totalLossMeters: cumulativeLoss,
    averageGradePercent: overallAvgGrade,
    elevationChartPoints
  };
}

/**
 * Treadmill Conversion and metabolic calculation system
 */

export function convertPaceToKmh(paceSecondsPerKm: number): number {
  if (paceSecondsPerKm <= 0) return 0;
  return 3600 / paceSecondsPerKm;
}

export function convertKmhToPace(speedKmh: number): number {
  if (speedKmh <= 0) return 0;
  return 3600 / speedKmh;
}

export function convertKmhToMph(kmh: number): number {
  return kmh * 0.62137119;
}

export function convertMphToKmh(mph: number): number {
  return mph * 1.609344;
}

export function convertInclinePercentToGradeDecimal(inclinePercent: number): number {
  return inclinePercent / 100;
}

/**
 * Speed conversion: km/h to meters per minute
 */
export function convertKmhToMetersPerMinute(kmh: number): number {
  return (kmh * 1000) / 60;
}

/**
 * ACSM Treadmill Running VO2 Formila:
 * VO2 (mL/kg/min) = (0.2 * speed in m/min) + (0.9 * speed in m/min * grade decimal) + 3.5
 */
export function calculateACSMTreadmillRunningVO2(speedMetersPerMinute: number, gradeDecimal: number): number {
  return (0.2 * speedMetersPerMinute) + (0.9 * speedMetersPerMinute * gradeDecimal) + 3.5;
}

/**
 * ACSM Treadmill Walking VO2 Formula:
 * VO2 (mL/kg/min) = (0.1 * speed in m/min) + (1.8 * speed in m/min * grade decimal) + 3.5
 */
export function calculateACSMTreadmillWalkingVO2(speedMetersPerMinute: number, gradeDecimal: number): number {
  return (0.1 * speedMetersPerMinute) + (1.8 * speedMetersPerMinute * gradeDecimal) + 3.5;
}

/**
 * MET from VO2 (1 MET = 3.5 mL/kg/min)
 */
export function calculateMETFromVO2(vo2: number): number {
  if (vo2 <= 0) return 1;
  return vo2 / 3.5;
}

/**
 * Calories from MET
 * Formula: Calories = MET * 1.05 * weightKg * durationHours (equivalent to MET * 3.5 * weightKg / 200 * durationMinutes)
 */
export function calculateCaloriesFromMET(met: number, weightKg: number, durationHours: number): number {
  return met * 1.05 * weightKg * durationHours;
}

/**
 * VO2 Estimate Helper for walking vs running speed thresholds or manual toggle.
 * Walk vs Run threshold is conventionally 8.0 km/h (5.0 mph).
 */
export function calculateInclineAdjustedVO2(speedKmh: number, inclinePercent: number, mode: "walking" | "running" | "auto"): number {
  const speedMetersPerMinute = convertKmhToMetersPerMinute(speedKmh);
  const gradeDecimal = convertInclinePercentToGradeDecimal(inclinePercent);
  
  let isRunning = true;
  if (mode === "walking") {
    isRunning = false;
  } else if (mode === "running") {
    isRunning = true;
  } else {
    // auto mode
    isRunning = speedKmh >= 8.0;
  }

  if (isRunning) {
    return calculateACSMTreadmillRunningVO2(speedMetersPerMinute, gradeDecimal);
  } else {
    return calculateACSMTreadmillWalkingVO2(speedMetersPerMinute, gradeDecimal);
  }
}

/**
 * Speed-Incline Matrix Builder
 */
export interface MatrixRow {
  speedKmh: number;
  speedMph: number;
  paceStr: string;
  inclineVals: { inclinePercent: number; vo2: number; met: number }[];
}

export function buildSpeedInclineMatrix(
  speedsKmh: number[], 
  inclinesPercent: number[], 
  mode: "walking" | "running" | "auto"
): MatrixRow[] {
  return speedsKmh.map(speedKmh => {
    const speedMph = convertKmhToMph(speedKmh);
    const paceSec = convertKmhToPace(speedKmh);
    
    // Format pace
    const mins = Math.floor(paceSec / 60);
    const secs = Math.round(paceSec % 60);
    const paceStr = isNaN(paceSec) || !isFinite(paceSec) ? "--:--" : `${mins}:${secs.toString().padStart(2, "0")}`;

    const inclineVals = inclinesPercent.map(inc => {
      const vo2 = calculateInclineAdjustedVO2(speedKmh, inc, mode);
      const met = calculateMETFromVO2(vo2);
      return {
        inclinePercent: inc,
        vo2,
        met
      };
    });

    return {
      speedKmh,
      speedMph,
      paceStr,
      inclineVals
    };
  });
}

/**
 * Treadmill Calibration Error %
 * Formula: Error % = (Treadmill Distance - Actual Measured Distance) / Actual Measured Distance * 100
 */
export function calculateTreadmillCalibrationError(treadmillDistance: number, measuredDistance: number): {
  errorPercent: number;
  correctionFactor: number;
  guidanceNote: string;
} {
  if (measuredDistance <= 0) {
    return { errorPercent: 0, correctionFactor: 1, guidanceNote: "No measured reference provided." };
  }
  
  const errorPercent = ((treadmillDistance - measuredDistance) / measuredDistance) * 100;
  const correctionFactor = measuredDistance / treadmillDistance;

  let guidanceNote = "";
  if (Math.abs(errorPercent) < 0.5) {
    guidanceNote = "Treadmill calibration error is minimal. High accuracy relative to your measuring device.";
  } else if (errorPercent > 0) {
    guidanceNote = `Treadmill is over-reporting distance by ${errorPercent.toFixed(1)}%. When your treadmill displays 10.0km, you have actually run ${ (10 * correctionFactor).toFixed(2) }km. Adjust targeted paces down slightly.`;
  } else {
    guidanceNote = `Treadmill is under-reporting distance by ${Math.abs(errorPercent).toFixed(1)}%. When your treadmill displays 10.0km, you have actually run ${ (10 * correctionFactor).toFixed(2) }km. You are running faster than shown!`;
  }

  return {
    errorPercent,
    correctionFactor,
    guidanceNote
  };
}

export interface TreadmillSegment {
  durationSeconds: number;
  speedKmh: number;
  inclinePercent: number;
}

/**
 * Treadmill Segment Profile Analyzer
 */
export function calculateTreadmillSegmentProfile(
  segments: TreadmillSegment[], 
  weightKg: number | null,
  mode: "walking" | "running" | "auto"
) {
  let totalDurationSeconds = 0;
  let totalDistanceKm = 0;
  let weightedSpeedSum = 0;
  let weightedInclineSum = 0;
  let cumulativeCalories = 0;

  const analyzedSegments = segments.map((seg, index) => {
    totalDurationSeconds += seg.durationSeconds;
    const hours = seg.durationSeconds / 3600;
    const segmentDistance = (seg.speedKmh * seg.durationSeconds) / 3600;
    totalDistanceKm += segmentDistance;

    weightedSpeedSum += seg.speedKmh * seg.durationSeconds;
    weightedInclineSum += seg.inclinePercent * seg.durationSeconds;

    const vo2 = calculateInclineAdjustedVO2(seg.speedKmh, seg.inclinePercent, mode);
    const met = calculateMETFromVO2(vo2);
    let segmentCals = 0;

    if (weightKg && weightKg > 0) {
      segmentCals = calculateCaloriesFromMET(met, weightKg, hours);
      cumulativeCalories += segmentCals;
    }

    return {
      id: index,
      durationSeconds: seg.durationSeconds,
      speedKmh: seg.speedKmh,
      inclinePercent: seg.inclinePercent,
      distanceKm: segmentDistance,
      vo2,
      met,
      calories: segmentCals
    };
  });

  const averageSpeed = totalDurationSeconds > 0 ? weightedSpeedSum / totalDurationSeconds : 0;
  const averageIncline = totalDurationSeconds > 0 ? weightedInclineSum / totalDurationSeconds : 0;

  // Chart timeline data
  let timelineTimeSec = 0;
  const timelineChartPoints = [{ timeMin: 0, speed: averageSpeed > 0 ? analyzedSegments[0]?.speedKmh || 0 : 0, incline: averageSpeed > 0 ? analyzedSegments[0]?.inclinePercent || 0 : 0 }];
  
  analyzedSegments.forEach((seg, i) => {
    timelineTimeSec += seg.durationSeconds;
    const minsBucket = Number((timelineTimeSec / 60).toFixed(2));
    timelineChartPoints.push({
      timeMin: minsBucket,
      speed: seg.speedKmh,
      incline: seg.inclinePercent
    });
  });

  return {
    segments: analyzedSegments,
    totalDurationSeconds,
    totalDistanceKm,
    averageSpeedKmh: averageSpeed,
    averageInclinePercent: averageIncline,
    totalCaloriesKcal: cumulativeCalories,
    timelineChartPoints
  };
}

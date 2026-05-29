/**
 * Shared Running Domain Validation Logic.
 * Track.Lab Scientific Calculations Suite.
 */

export function validateHeartRate(maxHr: number, restingHr: number): string | null {
  if (maxHr <= 0) {
    return "Maximum heart rate must be greater than 0.";
  }
  if (restingHr < 0) {
    return "Resting heart rate cannot be negative.";
  }
  if (restingHr >= maxHr) {
    return "Heart Rate Max must be strictly greater than Resting Heart Rate (HRmax > RHR).";
  }
  if (restingHr > 0 && restingHr < 25) {
    return "Resting heart rate appears excessively low (minimum 25 bpm recommended).";
  }
  if (maxHr > 250) {
    return "Max heart rate exceeds physiological limits (maximum allowed 250 bpm).";
  }
  return null;
}

export function validateHumidity(humidity: number): string | null {
  if (humidity < 0 || humidity > 100) {
    return "Relative humidity must be within the range [0 - 100]%.";
  }
  return null;
}

export function validateAQI(aqi: number): string | null {
  if (aqi < 0) {
    return "Air Quality Index (AQI) must be non-negative.";
  }
  return null;
}

export function validateGrade(grade: number): string | null {
  if (grade < -45 || grade > 45) {
    return "Incline slope grade must represent a realistic running course [-45% to +45%].";
  }
  return null;
}

export function validateRpe(rpe: number): string | null {
  if (rpe < 1 || rpe > 10) {
    return "Rate of Perceived Exertion (RPE) must correspond to the CR10 scale [1 - 10].";
  }
  return null;
}

export function validateBorg(rpeBorg: number): string | null {
  if (rpeBorg < 6 || rpeBorg > 20) {
    return "Borg perceived effort scale must correspond to standard limits [6 - 20].";
  }
  return null;
}

export function validateNutrientRates(carbs: number, fluid: number, sodium: number): string | null {
  if (carbs < 0) return "Carbohydrate hourly rates cannot be negative.";
  if (fluid < 0) return "Fluid hydration metrics cannot be negative.";
  if (sodium < 0) return "Sodium electrolyte metrics cannot be negative.";
  return null;
}

export function validatePhysicalVariables(weight: number, distance: number, power: number): string | null {
  if (weight <= 0) return "Body weight must be strictly greater than 0.";
  if (distance <= 0) return "Calculated distance must be strictly greater than 0.";
  if (power <= 0) return "Measured running power wattage must be strictly greater than 0.";
  return null;
}

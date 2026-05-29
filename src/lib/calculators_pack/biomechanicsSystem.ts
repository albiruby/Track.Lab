import { assertPositive } from "./core";

/**
 * Calculate cadence in steps per minute (spm)
 * Formula: Cadence = Steps / (durationSeconds / 60)
 */
export function calculateCadence(steps: number, durationSeconds: number): number {
  if (durationSeconds <= 0 || steps < 0) return 0;
  return steps / (durationSeconds / 60);
}

/**
 * Calculate step count from cadence and duration in minutes
 * Formula: Steps = Cadence * durationMinutes
 */
export function calculateStepCount(cadenceSpm: number, durationMinutes: number): number {
  if (cadenceSpm <= 0 || durationMinutes <= 0) return 0;
  return cadenceSpm * durationMinutes;
}

/**
 * Calculate step length (distance per single step)
 * Formula: Step Length = Distance / Steps
 */
export function calculateStepLength(distanceMeters: number, steps: number): number {
  if (steps <= 0 || distanceMeters < 0) return 0;
  return distanceMeters / steps;
}

/**
 * Calculate stride length (distance per full running gate cycle - usually 2 steps)
 * Formula: Stride Length = Distance / (Steps / 2)
 */
export function calculateStrideLength(distanceMeters: number, steps: number): number {
  if (steps <= 0 || distanceMeters < 0) return 0;
  return distanceMeters / (steps / 2);
}

/**
 * Speed (meters per minute) from Cadence (spm) and Stride Length (meters per stride)
 * Formula: Speed m/min = Cadence * (Stride Length / 2) [since stride = 2 steps]
 * E.g., if stride is defined as 1 step (1.2m), speed = Cadence * Stride
 */
export function calculateSpeedFromCadenceStride(cadenceSpm: number, strideLengthMeters: number): number {
  if (cadenceSpm <= 0 || strideLengthMeters <= 0) return 0;
  // If stride length is 1 step, speed (m/min) = cadence * stride
  return cadenceSpm * strideLengthMeters;
}

/**
 * Pace (seconds per km) from Cadence (spm) and Stride Length (meters)
 * Formula: Speed in m/min = cadence * stride; Pace sec/km = 60000 / (speed m/min)
 */
export function calculatePaceFromCadenceStride(cadenceSpm: number, strideLengthMeters: number): number {
  const speedMMin = calculateSpeedFromCadenceStride(cadenceSpm, strideLengthMeters);
  if (speedMMin <= 0) return 0;
  return 60000 / speedMMin;
}

/**
 * Calculate steps per kilometer
 * Formula: Steps per km = Cadence * (Pace in seconds per km / 60)
 */
export function calculateStepsPerKm(cadenceSpm: number, paceSecondsPerKm: number): number {
  if (cadenceSpm <= 0 || paceSecondsPerKm <= 0) return 0;
  return cadenceSpm * (paceSecondsPerKm / 60);
}

/**
 * Calculate steps per mile
 * Formula: Steps per mile = Cadence * (Pace in seconds per mile / 60)
 */
export function calculateStepsPerMile(cadenceSpm: number, paceSecondsPerMile: number): number {
  if (cadenceSpm <= 0 || paceSecondsPerMile <= 0) return 0;
  return cadenceSpm * (paceSecondsPerMile / 60);
}

/**
 * Estimate steps for a race distance in km
 * Formula: Race steps = distanceKm * stepsPerKm
 */
export function calculateRaceStepEstimate(distanceKm: number, stepsPerKm: number): number {
  if (distanceKm <= 0 || stepsPerKm <= 0) return 0;
  return distanceKm * stepsPerKm;
}

/**
 * Calculate stride length at a target pace
 * Formula: Stride length = (1000 / pace Minutes per Km) / cadenceSpm
 */
export function calculateStrideLengthAtPace(paceSecondsPerKm: number, cadenceSpm: number): number {
  if (paceSecondsPerKm <= 0 || cadenceSpm <= 0) return 0;
  const speedMMin = 60000 / paceSecondsPerKm;
  return speedMMin / cadenceSpm;
}

/**
 * Calculate cadence at a target pace
 * Formula: Cadence = (1000 / pace minutes) / strideLength
 */
export function calculateCadenceAtPace(paceSecondsPerKm: number, strideLengthMeters: number): number {
  if (paceSecondsPerKm <= 0 || strideLengthMeters <= 0) return 0;
  const speedMMin = 60000 / paceSecondsPerKm;
  return speedMMin / strideLengthMeters;
}

/**
 * Calculate cadence drift across halves
 * Formula: Cadence Drift % = (SecondHalf - FirstHalf) / FirstHalf * 100
 */
export function calculateCadenceDrift(firstHalfCadence: number, secondHalfCadence: number): number {
  if (firstHalfCadence <= 0) return 0;
  return ((secondHalfCadence - firstHalfCadence) / firstHalfCadence) * 100;
}

/**
 * Calculate cadence target difference (target - current)
 */
export function calculateCadenceTargetDifference(currentCadence: number, targetCadence: number): number {
  return targetCadence - currentCadence;
}

/**
 * Calculate vertical ratio (%)
 * Formula: Vertical Ratio = Vertical Oscillation Cm / Stride Length Cm * 100
 */
export function calculateVerticalRatio(verticalOscillationCm: number, strideLengthCm: number): number {
  if (strideLengthCm <= 0 || verticalOscillationCm < 0) return 0;
  return (verticalOscillationCm / strideLengthCm) * 100;
}

/**
 * Calculate ground contact balance imbalance
 * Formula: Imbalance = abs(left - right)
 */
export function calculateGroundContactBalance(leftPercent: number, rightPercent: number): number {
  return Math.abs(leftPercent - rightPercent);
}

/**
 * Calculate Metronome Target SPM
 */
export function calculateMetronomeTarget(cadenceSpm: number): number {
  return Math.round(cadenceSpm);
}

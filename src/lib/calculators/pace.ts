import { CalculatorResult } from '@/types';
import { METHOD_PACE_STD, METHOD_RIEGEL, METHOD_WORKOUT } from '@/data/calculators';
import { paceSecondsPerKm } from '@/lib/calculators_pack/pace';
import { formatSecondsToTimeString } from '@/lib/formatters/time';

export function calculatePace(distanceKm: number, timeSeconds: number): CalculatorResult<number> {
  const secondsPerKm = paceSecondsPerKm(distanceKm * 1000, timeSeconds);

  return {
    inputUsed: { 'Distance (km)': distanceKm, 'Time (s)': timeSeconds },
    methodSelected: METHOD_PACE_STD.name,
    formulaUsed: METHOD_PACE_STD.formulaDisplay,
    result: secondsPerKm,
    limitations: METHOD_PACE_STD.limitations,
    confidenceLabel: METHOD_PACE_STD.precisionLabel
  };
}

import { riegelPredictTime } from '@/lib/calculators_pack/racePrediction';

export function calculateRiegelPrediction(d1Km: number, t1Seconds: number, d2Km: number): CalculatorResult<number> {
  const t2Seconds = Math.round(riegelPredictTime(d1Km * 1000, t1Seconds, d2Km * 1000));

  return {
    inputUsed: { 'Base Dist (km)': d1Km, 'Base Time (s)': t1Seconds, 'Target Dist (km)': d2Km },
    methodSelected: METHOD_RIEGEL.name,
    formulaUsed: METHOD_RIEGEL.formulaDisplay,
    result: t2Seconds,
    limitations: METHOD_RIEGEL.limitations,
    confidenceLabel: METHOD_RIEGEL.precisionLabel
  };
}

import { distanceRepsSummary } from '@/lib/calculators_pack/workout';

export interface WorkoutResult {
  repTimeSeconds: number;
  totalWorkSeconds: number;
  totalRestSeconds: number;
  totalSessionSeconds: number;
  sessionDistanceKm: number;
}

export function calculateIntervalWorkout(
  reps: number, 
  distancePerRepKm: number, 
  paceSecondsPerKm: number, 
  restSeconds: number
): CalculatorResult<WorkoutResult> {
  const summary = distanceRepsSummary(reps, distancePerRepKm * 1000, paceSecondsPerKm, restSeconds);

  return {
    inputUsed: {
      'Reps': reps,
      'Rep Distance (km)': distancePerRepKm,
      'Pace (s/km)': paceSecondsPerKm,
      'Rest/Rep (s)': restSeconds
    },
    methodSelected: METHOD_WORKOUT.name,
    formulaUsed: METHOD_WORKOUT.formulaDisplay,
    result: {
      repTimeSeconds: summary.repTime,
      totalWorkSeconds: summary.totalWorkTime,
      totalRestSeconds: summary.totalRestTime,
      totalSessionSeconds: summary.totalSessionCoreSeconds,
      sessionDistanceKm: summary.totalWorkDistance / 1000
    },
    limitations: METHOD_WORKOUT.limitations,
    confidenceLabel: METHOD_WORKOUT.precisionLabel
  };
}

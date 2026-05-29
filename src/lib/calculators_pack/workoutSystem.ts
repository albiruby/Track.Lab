import { assertPositive } from "./core";

/**
 * 1. Calculate individual rep time in seconds
 * Rep Time = Rep Distance (km) * Pace (sec/km)
 */
export function calculateRepTime(repDistanceMeters: number, paceSecondsPerKm: number): number {
  if (repDistanceMeters <= 0 || paceSecondsPerKm <= 0) return 0;
  return (repDistanceMeters / 1000) * paceSecondsPerKm;
}

/**
 * 2. Calculate total work distance
 */
export function calculateTotalWorkDistance(reps: number, repDistanceMeters: number): number {
  if (reps <= 0 || repDistanceMeters <= 0) return 0;
  return reps * repDistanceMeters;
}

/**
 * 3. Calculate total work time
 */
export function calculateTotalWorkTime(reps: number, repTimeSeconds: number): number {
  if (reps <= 0 || repTimeSeconds <= 0) return 0;
  return reps * repTimeSeconds;
}

/**
 * 4. Calculate total rest time based on count and policy
 */
export function calculateTotalRestTime(reps: number, restSeconds: number, restPolicy: 'between reps' | 'after every rep'): number {
  if (reps <= 0 || restSeconds <= 0) return 0;
  if (restPolicy === 'between reps') {
    return Math.max(0, reps - 1) * restSeconds;
  }
  return reps * restSeconds;
}

/**
 * 5. Calculate session duration
 */
export function calculateSessionDuration(warmupSeconds: number, workSeconds: number, restSeconds: number, cooldownSeconds: number): number {
  return Math.max(0, warmupSeconds) + Math.max(0, workSeconds) + Math.max(0, restSeconds) + Math.max(0, cooldownSeconds);
}

/**
 * 6. Calculate work to rest ratio
 */
export function calculateWorkRestRatio(workSeconds: number, restSeconds: number): number {
  if (workSeconds <= 0) return 0;
  if (restSeconds <= 0) return workSeconds; // avoid division by zero or Infinity
  return workSeconds / restSeconds;
}

/**
 * 7. Calculate workout density
 */
export function calculateWorkoutDensity(workSeconds: number, sessionSeconds: number): number {
  if (workSeconds <= 0 || sessionSeconds <= 0) return 0;
  return Math.min(100, (workSeconds / sessionSeconds) * 100);
}

/**
 * 8. Calculate hard / easy / rest percentage distribution
 */
export function calculateHardEasyDistribution(hardSeconds: number, easySeconds: number, restSeconds: number) {
  const total = Math.max(0, hardSeconds) + Math.max(0, easySeconds) + Math.max(0, restSeconds);
  if (total <= 0) {
    return { hardPct: 0, easyPct: 0, restPct: 0 };
  }
  return {
    hardPct: (hardSeconds / total) * 100,
    easyPct: (easySeconds / total) * 100,
    restPct: (restSeconds / total) * 100,
  };
}

/**
 * 9. Calculate session RPE load
 * sRPE Load = Duration (min) * RPE
 */
export function calculateWorkoutSessionRPELoad(durationMinutes: number, rpe: number): number {
  if (durationMinutes <= 0 || rpe <= 0) return 0;
  return durationMinutes * rpe;
}

export interface WorkoutBlock {
  id: string;
  type: string; // warm-up, easy, steady, tempo, threshold, 10K, 5K, mile, hill, strides, recovery, walk, stand, cooldown, custom
  durationSeconds: number;
  distanceMeters?: number;
  paceSecondsPerKm?: number;
  repeats: number;
}

/**
 * 10. Calculate totals from block lists
 */
export function calculateWorkoutBlockTotals(blocks: WorkoutBlock[]) {
  let totalDuration = 0;
  let totalDistanceMeters = 0;
  let hardSeconds = 0;
  let easySeconds = 0;
  let restSeconds = 0;

  blocks.forEach((b) => {
    const mult = b.repeats || 1;
    const dur = b.durationSeconds * mult;
    totalDuration += dur;

    // Check if distance exists or estimate it from pace
    let dist = (b.distanceMeters || 0) * mult;
    if (dist <= 0 && b.paceSecondsPerKm && b.paceSecondsPerKm > 0) {
      dist = (b.durationSeconds / b.paceSecondsPerKm) * 1000 * mult;
    }
    totalDistanceMeters += dist;

    // Categorize intensities (Hard, Easy, Rest)
    const typeUpper = b.type.toUpperCase();
    if (
      typeUpper.includes("THRESHOLD") ||
      typeUpper.includes("10K") ||
      typeUpper.includes("5K") ||
      typeUpper.includes("MILE") ||
      typeUpper.includes("BEST EFFORT") ||
      typeUpper.includes("HILL") ||
      typeUpper.includes("STRIDES") ||
      typeUpper.includes("HARD")
    ) {
      hardSeconds += dur;
    } else if (
      typeUpper.includes("STAND") ||
      typeUpper.includes("WALK") ||
      typeUpper.includes("RECOVERY") ||
      typeUpper.includes("REST")
    ) {
      restSeconds += dur;
    } else {
      // Warmup, easy, steady, tempo, cooldown, custom
      easySeconds += dur;
    }
  });

  return {
    totalDuration,
    totalDistanceKm: totalDistanceMeters / 1000,
    hardSeconds,
    easySeconds,
    restSeconds,
  };
}

/**
 * 11. Run-Walk Workout Calculator
 */
export function calculateRunWalkWorkout(
  runDurationSeconds: number,
  walkDurationSeconds: number,
  cycles: number,
  runPaceSecondsPerKm: number,
  walkPaceSecondsPerKm: number
) {
  const totalRunTime = runDurationSeconds * cycles;
  const totalWalkTime = walkDurationSeconds * cycles;
  const totalDuration = totalRunTime + totalWalkTime;

  // Run distance in km = run time (seconds) / pace (sec/km)
  const runDistKm = runPaceSecondsPerKm > 0 ? totalRunTime / runPaceSecondsPerKm : 0;
  const walkDistKm = walkPaceSecondsPerKm > 0 ? totalWalkTime / walkPaceSecondsPerKm : 0;
  const totalDistance = runDistKm + walkDistKm;

  const blendedPace = totalDistance > 0 ? totalDuration / totalDistance : 0;

  return {
    totalRunTime,
    totalWalkTime,
    totalDuration,
    estimatedDistanceKm: totalDistance,
    blendedPaceSecondsPerKm: blendedPace,
  };
}

/**
 * 12. Fartlek Calculator
 */
export function calculateFartlekTotals(
  hardDurationSeconds: number,
  easyDurationSeconds: number,
  cycles: number,
  hardPaceSecondsPerKm?: number,
  easyPaceSecondsPerKm?: number
) {
  const hardTime = hardDurationSeconds * cycles;
  const easyTime = easyDurationSeconds * cycles;
  const totalTime = hardTime + easyTime;
  const hardPct = totalTime > 0 ? (hardTime / totalTime) * 100 : 0;

  let estimatedDistanceKm = 0;
  if (hardPaceSecondsPerKm && hardPaceSecondsPerKm > 0) {
    estimatedDistanceKm += hardTime / hardPaceSecondsPerKm;
  }
  if (easyPaceSecondsPerKm && easyPaceSecondsPerKm > 0) {
    estimatedDistanceKm += easyTime / easyPaceSecondsPerKm;
  }

  return {
    hardTime,
    easyTime,
    totalTime,
    hardPct,
    estimatedDistanceKm,
  };
}

/**
 * 13. Hill Repeat Calculator
 */
export function calculateHillRepeatTotals(
  reps: number,
  climbMetersPerRep: number,
  repDurationSeconds: number,
  recoveryDurationSeconds: number
) {
  const totalClimb = reps * climbMetersPerRep;
  const workTime = reps * repDurationSeconds;
  const recoveryTime = reps * recoveryDurationSeconds;
  const totalTime = workTime + recoveryTime;

  return {
    totalClimb,
    workTime,
    recoveryTime,
    totalTime,
  };
}

/**
 * 14. Workout Comparison Calculator
 */
export function calculateWorkoutComparison(
  workoutA: { duration: number; distance: number; hardTime: number; density: number },
  workoutB: { duration: number; distance: number; hardTime: number; density: number }
) {
  return {
    durationDelta: workoutA.duration - workoutB.duration,
    distanceDelta: workoutA.distance - workoutB.distance,
    hardTimeDelta: workoutA.hardTime - workoutB.hardTime,
    densityDelta: workoutA.density - workoutB.density,
  };
}

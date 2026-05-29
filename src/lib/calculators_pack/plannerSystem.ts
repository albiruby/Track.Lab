/**
 * 15. Calculate weekly mileage sum
 */
export function calculateWeeklyDistance(dailyDistances: number[]): number {
  return dailyDistances.reduce((sum, d) => sum + (isNaN(d) || d < 0 ? 0 : d), 0);
}

/**
 * 16. Calculate weekly duration sum
 */
export function calculateWeeklyDuration(dailyDurations: number[]): number {
  return dailyDurations.reduce((sum, d) => sum + (isNaN(d) || d < 0 ? 0 : d), 0);
}

/**
 * 17. Calculate long run ratio
 */
export function calculateLongRunRatio(longRunDistance: number, weeklyDistance: number): number {
  if (weeklyDistance <= 0 || longRunDistance <= 0) return 0;
  return (longRunDistance / weeklyDistance) * 100;
}

/**
 * 18. Hard/Easy Spacing Checker
 * Analyzes a sequence of 7 days and returns warning labels.
 */
export interface DayPlan {
  distance: number;
  duration: number; // in minutes
  intensity: 'rest' | 'easy' | 'moderate' | 'hard' | 'long run';
}

export function calculateHardEasySpacing(days: DayPlan[]): string[] {
  const warnings: string[] = [];
  if (days.length < 7) return warnings;

  let hardDaysCount = 0;
  let hasRestOrEasy = false;

  days.forEach((day) => {
    if (day.intensity === 'hard') {
      hardDaysCount++;
    }
    if (day.intensity === 'rest' || day.intensity === 'easy') {
      hasRestOrEasy = true;
    }
  });

  // Caution if no rest or easy days at all
  if (!hasRestOrEasy) {
    warnings.push('No dedicated rest or easy recovery days programmed in this microcycle.');
  }

  // Check back-to-back hard days
  for (let i = 0; i < 6; i++) {
    if (days[i].intensity === 'hard' && days[i + 1].intensity === 'hard') {
      warnings.push(`Consecutive high-intensity days programmed on Day ${i + 1} and Day ${i + 2}.`);
    }
  }

  // Check long run after a hard day (Day i is hard, Day i+1 is long run)
  for (let i = 0; i < 6; i++) {
    if (days[i].intensity === 'hard' && days[i + 1].intensity === 'long run') {
      warnings.push(`Long run immediately follows high-intensity day on Day ${i + 2} without active recovery.`);
    }
  }

  // Check more than 2 hard days in any 3-day window
  for (let i = 0; i < 5; i++) {
    let windowHardCount = 0;
    for (let j = 0; j < 3; j++) {
      if (days[i + j].intensity === 'hard') {
        windowHardCount++;
      }
    }
    if (windowHardCount > 2) {
      warnings.push(`Density Alert: High concentration of hard efforts (${windowHardCount} in 3 days) starting Day ${i + 1}.`);
    }
  }

  // De-duplicate warnings
  return Array.from(new Set(warnings));
}

/**
 * 19. Calculate intensity distribution percentages
 */
export function calculateIntensityDistribution(easyMinutes: number, moderateMinutes: number, hardMinutes: number) {
  const total = easyMinutes + moderateMinutes + hardMinutes;
  if (total <= 0) {
    return { easyPct: 0, moderatePct: 0, hardPct: 0 };
  }
  return {
    easyPct: (easyMinutes / total) * 100,
    moderatePct: (moderateMinutes / total) * 100,
    hardPct: (hardMinutes / total) * 100,
  };
}

/**
 * 20. Calculate taper reduction percentage
 */
export function calculateTaperReduction(peakWeekVolume: number, taperWeekVolume: number): number {
  if (peakWeekVolume <= 0) return 0;
  if (taperWeekVolume >= peakWeekVolume) return 0;
  return ((peakWeekVolume - taperWeekVolume) / peakWeekVolume) * 100;
}

/**
 * 21. Calculate build week progression percentage (also known as Acute Volume Growth)
 */
export function calculateBuildWeekProgression(previousWeekVolume: number, currentWeekVolume: number): number {
  if (previousWeekVolume <= 0) return 0;
  return ((currentWeekVolume - previousWeekVolume) / previousWeekVolume) * 100;
}

/**
 * 22. Calculate deload ratio percentage
 */
export function calculateDeloadRatio(currentWeekVolume: number, previousWeekVolume: number): number {
  if (previousWeekVolume <= 0) return 0;
  if (currentWeekVolume >= previousWeekVolume) return 0;
  return ((previousWeekVolume - currentWeekVolume) / previousWeekVolume) * 100;
}

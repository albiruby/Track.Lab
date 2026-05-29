export function calculateWeeklyDistance(dailyDistances: number[]): number {
  if (!dailyDistances || dailyDistances.length === 0) return 0;
  return dailyDistances.reduce((sum, d) => sum + (isNaN(d) ? 0 : d), 0);
}

export function calculateWeeklyDuration(dailyDurations: number[]): number {
  if (!dailyDurations || dailyDurations.length === 0) return 0;
  return dailyDurations.reduce((sum, d) => sum + (isNaN(d) ? 0 : d), 0);
}

export function calculateLongRunRatio(longRunDistance: number, weeklyDistance: number): number {
  if (weeklyDistance <= 0 || isNaN(longRunDistance) || isNaN(weeklyDistance)) return 0;
  return (longRunDistance / weeklyDistance) * 100;
}

export function calculateFastVolumeRatio(fastDistance: number, weeklyDistance: number): number {
  if (weeklyDistance <= 0 || isNaN(fastDistance) || isNaN(weeklyDistance)) return 0;
  return (fastDistance / weeklyDistance) * 100;
}

export function calculateThresholdVolumeRatio(thresholdVolume: number, weeklyVolume: number): number {
  if (weeklyVolume <= 0 || isNaN(thresholdVolume) || isNaN(weeklyVolume)) return 0;
  return (thresholdVolume / weeklyVolume) * 100;
}

export function calculateProgressionRate(previousWeek: number, currentWeek: number): number {
  if (previousWeek <= 0 || isNaN(previousWeek) || isNaN(currentWeek)) return 0;
  return ((currentWeek - previousWeek) / previousWeek) * 100;
}

export function calculateCutbackRatio(peakOrPreviousWeek: number, cutbackWeek: number): number {
  if (peakOrPreviousWeek <= 0 || isNaN(peakOrPreviousWeek) || isNaN(cutbackWeek)) return 0;
  return ((peakOrPreviousWeek - cutbackWeek) / peakOrPreviousWeek) * 100;
}

export function calculateSessionRPELoad(durationMinutes: number, rpe: number): number {
  if (durationMinutes <= 0 || rpe <= 0 || isNaN(durationMinutes) || isNaN(rpe)) return 0;
  return durationMinutes * rpe;
}

export function calculateWeeklySRPELoad(sessionLoads: number[]): number {
  if (!sessionLoads || sessionLoads.length === 0) return 0;
  return sessionLoads.reduce((sum, l) => sum + (isNaN(l) ? 0 : l), 0);
}

export function calculateTrainingMonotony(dailyLoads: number[]): number {
  if (!dailyLoads || dailyLoads.length < 2) return 0;
  const validLoads = dailyLoads.map(v => (isNaN(v) || v < 0 ? 0 : v));
  const total = validLoads.reduce((sum, l) => sum + l, 0);
  const mean = total / validLoads.length;
  if (mean === 0) return 0;

  const variance = validLoads.reduce((sum, l) => sum + Math.pow(l - mean, 2), 0) / validLoads.length;
  const sd = Math.sqrt(variance);
  
  if (sd === 0) return 1.0; // If there is no variation, monotony is mathematically high, standard definition is 1 or constant
  return mean / sd;
}

export function calculateTrainingStrain(weeklyLoad: number, monotony: number): number {
  if (weeklyLoad <= 0 || monotony <= 0 || isNaN(weeklyLoad) || isNaN(monotony)) return 0;
  return weeklyLoad * monotony;
}

export function calculateACWR(acuteLoad: number, chronicLoad: number): number {
  if (chronicLoad <= 0 || isNaN(acuteLoad) || isNaN(chronicLoad)) return 0;
  return acuteLoad / chronicLoad;
}

export function calculateRollingAverage(values: number[], window: number): number[] {
  if (!values || values.length === 0 || window <= 0) return [];
  const averages: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    const subset = values.slice(start, i + 1);
    const avg = subset.reduce((sum, v) => sum + (isNaN(v) ? 0 : v), 0) / subset.length;
    averages.push(avg);
  }
  return averages;
}

export function calculateIntensityDistribution(lowMinutes: number, moderateMinutes: number, highMinutes: number) {
  const total = lowMinutes + moderateMinutes + highMinutes;
  if (total <= 0) {
    return { lowPct: 0, moderatePct: 0, highPct: 0, total };
  }
  return {
    lowPct: (lowMinutes / total) * 100,
    moderatePct: (moderateMinutes / total) * 100,
    highPct: (highMinutes / total) * 100,
    total
  };
}

export function classifyIntensityBalance(lowPercent: number, moderatePercent: number, highPercent: number): string {
  if (lowPercent <= 0 && moderatePercent <= 0 && highPercent <= 0) return 'Awaiting calculation';
  
  // 80/20 style: low around 75-85%
  if (lowPercent >= 75 && lowPercent <= 85) {
    return '80/20 Balanced (Optimized aerobic block development)';
  }
  
  // Powerfully Polarized: high low zone, moderate very low, high zone substantial
  if (lowPercent >= 75 && moderatePercent <= 10 && highPercent >= 8) {
    return 'Polarized (High-contrast aerobic/anerobic polarization)';
  }
  
  // Pyramidal: low > moderate > high, and all greater than zero
  if (lowPercent > moderatePercent && moderatePercent > highPercent && highPercent > 0) {
    return 'Pyramidal (Steadily shifting intensity progression)';
  }
  
  // Threshold-heavy
  if (moderatePercent >= 25 || (moderatePercent + highPercent >= 35 && lowPercent < 70)) {
    return 'Threshold-Heavy (High systemic stress block - monitor adaptation)';
  }
  
  return 'Mixed Distribution (General multi-intensity development)';
}

export function calculateHardEasyRatio(hardMinutes: number, easyMinutes: number): number {
  if (easyMinutes <= 0) return hardMinutes;
  return hardMinutes / easyMinutes;
}

export function calculateRestDayCount(dayTypes: string[]): number {
  return dayTypes.filter(t => t === 'rest').length;
}

export function calculateHardDayCount(dayTypes: string[]): number {
  return dayTypes.filter(t => t === 'hard').length;
}

export function calculateEasyDayCount(dayTypes: string[]): number {
  return dayTypes.filter(t => t === 'easy').length;
}

export function calculateAddRemoveSessionImpact(currentWeekLoad: number, addedSessionLoad: number) {
  const newLoad = currentWeekLoad + addedSessionLoad;
  const pctChange = currentWeekLoad > 0 ? (addedSessionLoad / currentWeekLoad) * 100 : 0;
  return {
    newLoad,
    pctChange
  };
}

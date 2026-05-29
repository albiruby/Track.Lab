export function analyzeWeeklyCalendar(dailyDistances: number[]) {
  const weeklyDistance = dailyDistances.reduce((a, b) => a + b, 0);
  const maxLongRun = Math.max(...dailyDistances);
  const longRunRatio = weeklyDistance > 0 ? (maxLongRun / weeklyDistance) : 0;
  
  // Rule-based hard day spacing: if consecutive days > some threshold, maybe flag it
  // We'll just define consecutive days with > 0 as normal, but if user inputs intensities, we'd check them.
  // For this simple calculator, we'll just return distances.
  
  return {
    weeklyDistance,
    maxLongRun,
    longRunRatio,
  };
}

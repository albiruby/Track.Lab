import { assertPositive } from "./core";

export const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
export const mean = (values: number[]) => sum(values) / values.length;
export const standardDeviation = (values: number[]) => {
  const m = mean(values);
  const variance = mean(values.map(v => Math.pow(v - m, 2)));
  return Math.sqrt(variance);
};

export function longRunRatio(longRunDistance: number, weeklyDistance: number) {
  assertPositive(longRunDistance, "longRunDistance");
  assertPositive(weeklyDistance, "weeklyDistance");
  return (longRunDistance / weeklyDistance) * 100;
}

export function progressionPercent(currentWeekLoad: number, previousWeekLoad: number) {
  assertPositive(currentWeekLoad, "currentWeekLoad");
  assertPositive(previousWeekLoad, "previousWeekLoad");
  return ((currentWeekLoad - previousWeekLoad) / previousWeekLoad) * 100;
}

export function sessionRpeLoad(durationMinutes: number, rpe: number) {
  assertPositive(durationMinutes, "durationMinutes");
  assertPositive(rpe, "rpe");
  return durationMinutes * rpe;
}

export function monotony(dailyLoads: number[]) {
  if (dailyLoads.length < 2) throw new Error("At least 2 daily load values are required.");
  const sd = standardDeviation(dailyLoads);
  if (sd === 0) throw new Error("Standard deviation is zero; monotony cannot be calculated safely.");
  return mean(dailyLoads) / sd;
}

export function strain(weeklyLoad: number, monotonyValue: number) {
  assertPositive(weeklyLoad, "weeklyLoad");
  assertPositive(monotonyValue, "monotonyValue");
  return weeklyLoad * monotonyValue;
}

export function acwr(acuteLoad: number, chronicLoad: number) {
  assertPositive(acuteLoad, "acuteLoad");
  assertPositive(chronicLoad, "chronicLoad");
  return acuteLoad / chronicLoad;
}

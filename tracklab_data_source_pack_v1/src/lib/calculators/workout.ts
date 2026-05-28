import { assertPositive } from "./core";
import { timeFromDistanceAndPace } from "./pace";

export function distanceRepTimeSeconds(repDistanceMeters: number, paceSecondsPerKm: number) {
  return timeFromDistanceAndPace(repDistanceMeters, paceSecondsPerKm);
}

export function distanceRepsSummary(reps: number, repDistanceMeters: number, paceSecondsPerKm: number, restSeconds: number) {
  assertPositive(reps, "reps");
  assertPositive(repDistanceMeters, "repDistanceMeters");
  assertPositive(paceSecondsPerKm, "paceSecondsPerKm");
  const repTime = distanceRepTimeSeconds(repDistanceMeters, paceSecondsPerKm);
  const totalWorkDistance = reps * repDistanceMeters;
  const totalWorkTime = reps * repTime;
  const totalRestTime = Math.max(0, reps - 1) * Math.max(0, restSeconds);
  return { repTime, totalWorkDistance, totalWorkTime, totalRestTime, totalSessionCoreSeconds: totalWorkTime + totalRestTime };
}

export function workRestRatio(workSeconds: number, restSeconds: number) {
  assertPositive(workSeconds, "workSeconds");
  assertPositive(restSeconds, "restSeconds");
  return workSeconds / restSeconds;
}

export function workoutDensity(workSeconds: number, totalSessionSeconds: number) {
  assertPositive(workSeconds, "workSeconds");
  assertPositive(totalSessionSeconds, "totalSessionSeconds");
  return workSeconds / totalSessionSeconds;
}

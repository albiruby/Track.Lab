import { assertPositive } from "./core";

export function gradePercent(elevationGainMeters: number, horizontalDistanceMeters: number) {
  assertPositive(horizontalDistanceMeters, "horizontalDistanceMeters");
  return (elevationGainMeters / horizontalDistanceMeters) * 100;
}

export function elevationPerKm(elevationGainMeters: number, distanceKm: number) {
  assertPositive(distanceKm, "distanceKm");
  return elevationGainMeters / distanceKm;
}

export function verticalSpeedMetersPerHour(elevationGainMeters: number, durationHours: number) {
  assertPositive(durationHours, "durationHours");
  return elevationGainMeters / durationHours;
}

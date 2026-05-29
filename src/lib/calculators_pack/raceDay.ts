export function calculateRaceTimeline(raceStartTimeMins: number, warmupOffsetMins: number) {
  return raceStartTimeMins - warmupOffsetMins;
}

export function calculateFuelingCheckpoints(raceDurationSecs: number, intervalSecs: number) {
  if (intervalSecs <= 0 || raceDurationSecs <= 0) return 0;
  return Math.floor(raceDurationSecs / intervalSecs);
}

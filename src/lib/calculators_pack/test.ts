// Cooper VO2max = (distance_meters - 504.9) / 44.73
export function calculateCooperVo2(distanceMeters: number) {
  if (distanceMeters <= 0) return 0;
  return (distanceMeters - 504.9) / 44.73;
}

// 30-min LTHR field test = average HR from test
export function estimateLthr(averageHr: number) {
  return averageHr;
}

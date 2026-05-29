export function calculateSplits(distanceKm: number, paceSecs: number, segmentKm: number) {
  if (distanceKm <= 0 || paceSecs <= 0 || segmentKm <= 0) return [];
  const splits = [];
  let currentKm = 0;
  while (currentKm < distanceKm) {
    let splitDist = segmentKm;
    if (currentKm + splitDist > distanceKm) {
      splitDist = distanceKm - currentKm;
    }
    const splitTime = splitDist * paceSecs;
    currentKm += splitDist;
    splits.push({ distance: currentKm, time: splitTime });
  }
  return splits;
}

export function generateNegativeSplits(distanceKm: number, totalTimeSeconds: number, splitRatioFirstHalf: number) {
  if (distanceKm <= 0 || totalTimeSeconds <= 0 || splitRatioFirstHalf <= 0 || splitRatioFirstHalf >= 100) return null;
  const firstHalfTime = totalTimeSeconds * (splitRatioFirstHalf / 100);
  const secondHalfTime = totalTimeSeconds - firstHalfTime;
  const halfDist = distanceKm / 2;
  const firstHalfPace = firstHalfTime / halfDist;
  const secondHalfPace = secondHalfTime / halfDist;
  
  return {
    firstHalfTime,
    secondHalfTime,
    firstHalfPace,
    secondHalfPace
  };
}

export function generateProgressiveSplits(distanceKm: number, totalTimeSeconds: number, startSlowerPercent: number, finishFasterPercent: number, segmentKm: number = 1) {
  if (distanceKm <= 0 || totalTimeSeconds <= 0 || segmentKm <= 0) return [];
  const avgPace = totalTimeSeconds / distanceKm;
  const numSegments = Math.ceil(distanceKm / segmentKm);
  
  // Create a linear progression from (avgPace * (1 + startSlowerPercent/100)) to (avgPace * (1 - finishFasterPercent/100))
  const startPace = avgPace * (1 + startSlowerPercent / 100);
  const endPace = avgPace * (1 - finishFasterPercent / 100);
  const paceStep = numSegments > 1 ? (startPace - endPace) / (numSegments - 1) : 0;
  
  let currentKm = 0;
  const splits = [];
  
  // Normalize factors to ensure total time matches exactly, we can sum the unnormalized times first
  let unnormalizedTotal = 0;
  for (let i = 0; i < numSegments; i++) {
    const dist = Math.min(segmentKm, distanceKm - i * segmentKm);
    const pace = startPace - (i * paceStep);
    unnormalizedTotal += (dist * pace);
  }
  
  const normalizationFactor = totalTimeSeconds / unnormalizedTotal;
  
  for (let i = 0; i < numSegments; i++) {
    const splitDist = Math.min(segmentKm, distanceKm - currentKm);
    const unnormalizedPace = startPace - (i * paceStep);
    const normalizedPace = unnormalizedPace * normalizationFactor;
    const splitTime = splitDist * normalizedPace;
    currentKm += splitDist;
    splits.push({ distance: currentKm, time: splitTime, pace: normalizedPace });
  }
  return splits;
}

export function compareSplits(targetPaceSecs: number, actualSegmentTimesSecs: number[], segmentKm: number) {
  if (targetPaceSecs <= 0 || actualSegmentTimesSecs.length === 0 || segmentKm <= 0) return null;
  const targetSegmentTime = targetPaceSecs * segmentKm;
  
  let totalDelta = 0;
  const deltas = actualSegmentTimesSecs.map(actual => {
    const delta = actual - targetSegmentTime;
    totalDelta += delta;
    return delta;
  });
  
  return {
    deltas,
    totalDelta,
    isPositiveSplit: totalDelta > 0, // Slower than target overall
  };
}

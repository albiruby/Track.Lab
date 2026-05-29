export function calculateTrackInterval(reps: number, repDistanceMeters: number, paceSecsPerKm: number, restSeconds: number) {
  if (reps <= 0 || repDistanceMeters <= 0 || paceSecsPerKm <= 0) return null;
  const repKm = repDistanceMeters / 1000;
  const repTimeSecs = repKm * paceSecsPerKm;
  const totalWorkMeters = reps * repDistanceMeters;
  const totalWorkSecs = repTimeSecs * reps;
  const totalRestSecs = restSeconds * (reps - 1);
  const workRestRatio = restSeconds > 0 ? repTimeSecs / restSeconds : 0;
  
  return {
    repTimeSecs,
    totalWorkMeters,
    totalWorkSecs,
    totalRestSecs,
    workRestRatio,
    totalSessionSecs: totalWorkSecs + totalRestSecs
  }
}

export function calculateLadder(distancesMeters: number[], paceSecsPerKm: number, restSeconds: number) {
  if (distancesMeters.length === 0 || paceSecsPerKm <= 0) return null;
  const reps = distancesMeters.map(d => {
    const repTimeSecs = (d / 1000) * paceSecsPerKm;
    return { distanceMeters: d, timeSecs: repTimeSecs };
  });
  
  let totalWorkMeters = 0;
  let totalWorkSecs = 0;
  
  reps.forEach(r => {
    totalWorkMeters += r.distanceMeters;
    totalWorkSecs += r.timeSecs;
  });
  
  const totalRestSecs = restSeconds * (distancesMeters.length - 1);
  
  return {
    reps,
    totalWorkMeters,
    totalWorkSecs,
    totalRestSecs,
    totalSessionSecs: totalWorkSecs + totalRestSecs
  };
}

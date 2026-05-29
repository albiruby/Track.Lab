export function calculateSessionRPELoad(durationMins: number, rpe: number) {
  if (durationMins <= 0 || rpe < 0) return 0;
  return durationMins * rpe;
}

export function classifyBorg620(rpe: number) {
    if (rpe < 6 || rpe > 20) return 'Invalid';
    if (rpe <= 9) return 'Very Light';
    if (rpe <= 11) return 'Light';
    if (rpe <= 13) return 'Somewhat Hard';
    if (rpe <= 15) return 'Hard (Heavy)';
    if (rpe <= 17) return 'Very Hard';
    if (rpe <= 19) return 'Extremely Hard';
    return 'Maximal Effort';
}

export function classifyRPE10(rpe: number) {
  return getRpeClassification(rpe, false);
}

export function mapRpeToZone(rpe: number) {
    if (rpe < 0 || rpe > 10) return 'Invalid';
    if (rpe <= 2) return 'Zone 1 (Recovery)';
    if (rpe <= 4) return 'Zone 2 (Aerobic Base)';
    if (rpe <= 6) return 'Zone 3 (Tempo/Sweet Spot)';
    if (rpe <= 8) return 'Zone 4 (Threshold)';
    return 'Zone 5 (VO2max/Anaerobic)';
}

export function calculateRpeDrift(firstHalfRpe: number, secondHalfRpe: number) {
    return secondHalfRpe - firstHalfRpe;
}

export function plannedVsActualRpe(plannedRpe: number, actualRpe: number) {
    return actualRpe - plannedRpe;
}

export function multiDayRpeTrend(rpes: number[]) {
    const valid = rpes.filter(r => !isNaN(r));
    if (!valid.length) return { average: 0, highest: 0, trend: 'Unknown' };
    const max = Math.max(...valid);
    const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
    let trend = 'Stable';
    if (valid.length >= 2) {
        const last = valid[valid.length - 1];
        const prev = valid[valid.length - 2];
        if (last > prev + 1) trend = 'Increasing';
        else if (last < prev - 1) trend = 'Decreasing';
    }
    return { average: avg, highest: max, trend };
}


export function getRpeClassification(rpe: number, isBorg15: boolean = false) {
  if (isBorg15) { // 6-20 scale
    if (rpe < 6 || rpe > 20) return 'Invalid';
    if (rpe <= 9) return 'Very Light';
    if (rpe <= 11) return 'Light';
    if (rpe <= 13) return 'Somewhat Hard';
    if (rpe <= 15) return 'Hard (Heavy)';
    if (rpe <= 17) return 'Very Hard';
    return 'Maximal Effort';
  } else { // 1-10 scale
    if (rpe < 0 || rpe > 10) return 'Invalid';
    if (rpe <= 2) return 'Very Light';
    if (rpe <= 4) return 'Light';
    if (rpe <= 6) return 'Moderate';
    if (rpe <= 8) return 'Hard';
    if (rpe <= 9) return 'Very Hard';
    return 'Maximal Effort';
  }
}

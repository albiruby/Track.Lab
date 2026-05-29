export function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr || !timeStr.includes(':')) return null;
  const parts = timeStr.split(':');
  if (parts.length < 2) return null;
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

export function calculateSleepDuration(bedTime: string, wakeTime: string): number | null {
  const t1 = parseTimeToMinutes(bedTime);
  const t2 = parseTimeToMinutes(wakeTime);
  if (t1 === null || t2 === null) return null;
  
  let diff = t2 - t1;
  if (diff < 0) {
    diff += 24 * 60; // crossed midnight
  }
  return diff / 60; // in hours
}

export function calculateSleepDebt(targetSleepHours: number, actualSleepHours: number): number {
  if (isNaN(targetSleepHours) || isNaN(actualSleepHours)) return 0;
  return Math.max(0, targetSleepHours - actualSleepHours);
}

export function calculateRHRDelta(todayRHR: number, baselineRHR: number): number {
  if (isNaN(todayRHR) || isNaN(baselineRHR)) return 0;
  return todayRHR - baselineRHR;
}

export function calculateHRVDelta(todayHRV: number, baselineHRV: number): number {
  if (isNaN(todayHRV) || isNaN(baselineHRV) || baselineHRV <= 0) return 0;
  return ((todayHRV - baselineHRV) / baselineHRV) * 100;
}

export function calculateBodyMassChange(todayWeight: number, baselineWeight: number): number {
  if (isNaN(todayWeight) || isNaN(baselineWeight) || baselineWeight <= 0) return 0;
  return ((todayWeight - baselineWeight) / baselineWeight) * 100;
}

export function calculatePreviousSessionLoad(durationMinutes: number, rpe: number): number {
  if (isNaN(durationMinutes) || isNaN(rpe) || durationMinutes < 0 || rpe < 0) return 0;
  return durationMinutes * rpe;
}

export function calculateFatigueScaleCategory(score: number): string {
  if (score <= 2) return "Minimal / Rested";
  if (score <= 4) return "Light / Manageable";
  if (score <= 6) return "Moderate Fatigue";
  if (score <= 8) return "Heavy / Substantial";
  return "Severe Exhaustion";
}

export function calculateSorenessScaleCategory(score: number): string {
  if (score <= 2) return "No Soreness / Fresh";
  if (score <= 4) return "Mild Tightness";
  if (score <= 6) return "Moderate Muscle Soreness";
  if (score <= 8) return "Heavy Soreness / Restricted";
  return "Severe Soreness / Pain";
}

export interface RedFlagInputs {
  illness: boolean;
  pain: boolean;
  dizziness: boolean;
  chestSymptoms: boolean;
  abnormalDiscomfort: boolean;
}

export interface RedFlagOutput {
  hasFlags: boolean;
  activeFlagsList: string[];
  cautionNote: string;
}

export function detectManualRedFlags(inputs: RedFlagInputs): RedFlagOutput {
  const list: string[] = [];
  if (inputs.illness) list.push("Signs of Illness / Fever");
  if (inputs.pain) list.push("Joint or localized severe localized pain");
  if (inputs.dizziness) list.push("Dizziness or lightheadedness");
  if (inputs.chestSymptoms) list.push("Chest tightening or abnormal symptoms");
  if (inputs.abnormalDiscomfort) list.push("Severe generalized fatigue / discomfort");

  const hasFlags = list.length > 0;
  let cautionNote = "No active self-check red flags detected.";
  if (hasFlags) {
    cautionNote = `Rule-based caution: Active self-check symptoms detected (${list.join(", ")}). Consider resting or adjusting targets. If you have severe or unusual symptoms, consider seeking professional medical help. Track.Lab is not medical advice and provides no medical diagnosis or injury prediction.`;
  }

  return {
    hasFlags,
    activeFlagsList: list,
    cautionNote
  };
}

export function calculateRecoveryCategory(inputs: {
  sleepHours: number;
  rhrDelta: number;
  hrvDeltaPct: number;
  fatigueScore: number;
  sorenessScore: number;
  hasFlags: boolean;
}): "Red" | "Yellow" | "Green" {
  if (inputs.hasFlags || inputs.fatigueScore >= 8 || inputs.sorenessScore >= 8) {
    return "Red";
  }
  if (
    inputs.sleepHours < 6.0 ||
    inputs.rhrDelta >= 6 ||
    inputs.hrvDeltaPct <= -15.0 ||
    inputs.fatigueScore >= 5 ||
    inputs.sorenessScore >= 5
  ) {
    return "Yellow";
  }
  return "Green";
}

export function calculateLoadRecoveryBalance(previousLoad: number, category: "Red" | "Yellow" | "Green"): string {
  if (category === "Red") {
    return "High caution recommended. Muscle soreness, elevated cardiovascular stress, or active physical symptoms suggest prioritizing restorative passive rest. Avoid high structural skeletal muscle or metabolic strain workouts.";
  }
  if (category === "Yellow") {
    if (previousLoad > 450) {
      return "Moderate physical capacity. Cumulative residual fatigue from recent sessions is present. Consider keeping today's effort lightweight and flat (~Z1/Z2 easy run). Avoid back-to-back taxing sessions.";
    }
    return "Moderate capacity. Fine for light or steady-state easy miles. Refrain from heavy anaerobic workouts or long-duration trails.";
  }
  // Green
  if (previousLoad > 600) {
    return "Aesthetic metrics indicate excellent recovery, but keep in mind your previous session load was extremely high. Allow ample progressive warming up.";
  }
  return "Steady-state physical readiness. Metrics reflect normal baseline fluctuations. Suitable for scheduled training density.";
}

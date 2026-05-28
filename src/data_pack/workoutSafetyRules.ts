// Auto-generated static datasource for Track.Lab.
// No database. No AI. No runtime formula evaluation.

export const workoutSafetyRules = [
  {
    "id": "long_run_ratio_gt_35",
    "name": "Long Run Ratio Warning",
    "condition": "longRunDistance / weeklyDistance > 0.35",
    "message": "Long run is more than 35% of weekly distance. Treat as a mathematical warning, not injury prediction.",
    "severity": "warning"
  },
  {
    "id": "fast_volume_gt_15_percent",
    "name": "Fast Volume Warning",
    "condition": "fastDistance / weeklyDistance > 0.15",
    "message": "Fast running volume is high relative to weekly distance.",
    "severity": "warning"
  },
  {
    "id": "threshold_volume_gt_20_percent",
    "name": "Threshold Volume Warning",
    "condition": "thresholdDistance / weeklyDistance > 0.20",
    "message": "Threshold volume is high relative to weekly distance.",
    "severity": "warning"
  },
  {
    "id": "quality_days_back_to_back",
    "name": "Back-to-Back Quality Warning",
    "condition": "qualitySessionsOnConsecutiveDays == true",
    "message": "Avoid stacking hard quality sessions on consecutive days unless deliberately planned.",
    "severity": "caution"
  },
  {
    "id": "advanced_only",
    "name": "Advanced Template Warning",
    "condition": "template.advancedOnly == true",
    "message": "Advanced template. Not a recommendation. Requires appropriate background and monitoring.",
    "severity": "warning"
  },
  {
    "id": "requires_lactate_or_hr_monitoring",
    "name": "Monitoring Required Warning",
    "condition": "advancedThresholdTemplate == true && noMonitoring == true",
    "message": "Threshold control should be monitored with HR, RPE, pace, or lactate where available.",
    "severity": "warning"
  },
  {
    "id": "repetition_rep_duration_gt_120s",
    "name": "Repetition Duration Warning",
    "condition": "repDurationSeconds > 120",
    "message": "Repetition bouts are intended to be short. Long reps may shift stimulus away from speed economy.",
    "severity": "caution"
  }
] as const;

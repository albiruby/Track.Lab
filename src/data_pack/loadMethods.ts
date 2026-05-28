// Auto-generated static datasource for Track.Lab.
// No database. No AI. No runtime formula evaluation.

export const loadMethods = [
  {
    "id": "weekly_mileage",
    "name": "Weekly Mileage",
    "formulaDisplay": "Weekly Distance = sum(daily distances)",
    "requiredInputs": [
      "dailyDistances"
    ],
    "precision": "mathematical"
  },
  {
    "id": "weekly_duration",
    "name": "Weekly Duration",
    "formulaDisplay": "Weekly Duration = sum(daily durations)",
    "requiredInputs": [
      "dailyDurations"
    ],
    "precision": "mathematical"
  },
  {
    "id": "long_run_ratio",
    "name": "Long Run Ratio",
    "formulaDisplay": "Long Run Ratio = Long Run Distance / Weekly Distance × 100",
    "requiredInputs": [
      "longRunDistance",
      "weeklyDistance"
    ],
    "precision": "mathematical"
  },
  {
    "id": "progression_rate",
    "name": "Progression Rate",
    "formulaDisplay": "Progression % = (currentWeek - previousWeek) / previousWeek × 100",
    "requiredInputs": [
      "currentWeekLoad",
      "previousWeekLoad"
    ],
    "precision": "mathematical"
  },
  {
    "id": "srpe_load",
    "name": "Session RPE Load",
    "formulaDisplay": "sRPE Load = duration minutes × RPE",
    "requiredInputs": [
      "durationMinutes",
      "rpe"
    ],
    "precision": "field_estimate"
  },
  {
    "id": "monotony",
    "name": "Training Monotony",
    "formulaDisplay": "Monotony = mean daily load / standard deviation daily load",
    "requiredInputs": [
      "dailyLoads"
    ],
    "precision": "mathematical"
  },
  {
    "id": "strain",
    "name": "Training Strain",
    "formulaDisplay": "Strain = Weekly Load × Monotony",
    "requiredInputs": [
      "weeklyLoad",
      "monotony"
    ],
    "precision": "mathematical"
  },
  {
    "id": "acwr",
    "name": "Acute:Chronic Workload Ratio",
    "formulaDisplay": "ACWR = acute load / chronic load",
    "requiredInputs": [
      "acuteLoad",
      "chronicLoad"
    ],
    "precision": "mathematical",
    "limitations": [
      "Load ratio only, not injury prediction."
    ]
  },
  {
    "id": "intensity_distribution",
    "name": "Intensity Distribution",
    "formulaDisplay": "Zone % = zone time / total time × 100",
    "requiredInputs": [
      "zoneDurations"
    ],
    "precision": "mathematical"
  }
] as const;

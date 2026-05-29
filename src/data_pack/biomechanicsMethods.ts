// Auto-generated static datasource for Track.Lab.
// No database. No AI. No runtime formula evaluation.

export const biomechanicsMethods = [
  {
    "id": "cadence",
    "name": "Cadence (Manual steps)",
    "formulaDisplay": "Cadence (spm) = steps / (durationSeconds / 60)",
    "requiredInputs": [
      "steps",
      "durationSeconds"
    ],
    "unit": "steps/min",
    "precision": "mathematical",
    "limitations": [
      "Assumes steady-state continuous pace throughout the entire clocked elapsed duration.",
      "Requires accurate watch stopwatch values or manual lap duration records."
    ]
  },
  {
    "id": "step_count",
    "name": "Step Count Predicited",
    "formulaDisplay": "Steps = cadence (spm) × durationMinutes",
    "requiredInputs": [
      "cadence",
      "durationMinutes"
    ],
    "unit": "steps",
    "precision": "mathematical",
    "limitations": [
      "Assumes user cadence remains unvaried and perfectly steady-state across the full window."
    ]
  },
  {
    "id": "stride_length",
    "name": "Stride Length",
    "formulaDisplay": "Stride Length (m) = distanceMeters / (steps / 2)",
    "requiredInputs": [
      "distanceMeters",
      "steps"
    ],
    "unit": "meters",
    "precision": "mathematical",
    "limitations": [
      "Defined as a complete gait cycle (two steps), representing distance per full left+right stride."
    ]
  },
  {
    "id": "step_length",
    "name": "Step Length",
    "formulaDisplay": "Step Length (m) = distanceMeters / steps",
    "requiredInputs": [
      "distanceMeters",
      "steps"
    ],
    "unit": "meters",
    "precision": "mathematical",
    "limitations": [
      "Represents distance traveled for a single single-step impact contact event."
    ]
  },
  {
    "id": "speed_from_cadence_stride",
    "name": "Speed from Cadence and Stride",
    "formulaDisplay": "Speed (m/min) = cadence (spm) × stepLength (meters)",
    "requiredInputs": [
      "cadence",
      "stepLength"
    ],
    "unit": "m/min",
    "precision": "mathematical",
    "limitations": [
      "Provides estimated linear speed assuming perfect constant friction and no horizontal lateral slippage."
    ]
  },
  {
    "id": "steps_per_km",
    "name": "Steps per Kilometer",
    "formulaDisplay": "Steps per km = cadence (spm) × (paceSecondsPerKm / 60)",
    "requiredInputs": [
      "cadence",
      "paceSecondsPerKm"
    ],
    "unit": "steps/km",
    "precision": "mathematical",
    "limitations": [
      "Mathematical ratio of stride occurrences covering a physical kilometer. Foot strike patterns may vary."
    ]
  },
  {
    "id": "steps_per_mile",
    "name": "Steps per Mile",
    "formulaDisplay": "Steps per mile = cadence (spm) × (paceSecondsPerMile / 60)",
    "requiredInputs": [
      "cadence",
      "paceSecondsPerMile"
    ],
    "unit": "steps/mile",
    "precision": "mathematical",
    "limitations": [
      "Requires constant pace-cadence coupling ratio to hold true throughout."
    ]
  },
  {
    "id": "race_step_estimate",
    "name": "Race Step Volume Estimate",
    "formulaDisplay": "Estimated total steps = raceDistanceKm × stepsPerKm",
    "requiredInputs": [
      "raceDistanceKm",
      "stepsPerKm"
    ],
    "unit": "steps",
    "precision": "mathematical",
    "limitations": [
      "Qualitative scenario planning only. Cumulative biomechanical fatigue typically shifts stride rate."
    ]
  },
  {
    "id": "cadence_drift",
    "name": "Cadence Drift",
    "formulaDisplay": "Drift % = (secondHalfCadence - firstHalfCadence) / firstHalfCadence × 100",
    "requiredInputs": [
      "firstHalfCadence",
      "secondHalfCadence"
    ],
    "unit": "%",
    "precision": "mathematical",
    "limitations": [
      "Measures mechanical pacing decoupling. Can indicate muscular endurance degradation or neuromuscular fatigue."
    ]
  },
  {
    "id": "vertical_ratio",
    "name": "Vertical Ratio",
    "formulaDisplay": "Vertical Ratio % = verticalOscillationCm / stepLengthCm × 100",
    "requiredInputs": [
      "verticalOscillationCm",
      "stepLengthCm"
    ],
    "unit": "%",
    "precision": "mathematical",
    "limitations": [
      "Lower percentages general signify high mechanical efficiency (less vertical bounce, more horizontal forward launch)."
    ]
  }
] as const;

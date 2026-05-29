// Auto-generated static datasource for Track.Lab.
// No database. No AI. No runtime formula evaluation.

export const powerMethods = [
  {
    "id": "watts_per_kg",
    "name": "Power-to-Weight Ratio (W/kg)",
    "formulaDisplay": "W/kg = power watts / body mass kg",
    "requiredInputs": [
      "powerWatts",
      "bodyMassKg"
    ],
    "unit": "W/kg",
    "precision": "mathematical",
    "limitations": [
      "Assumes direct running power comparison is valid. Power values vary drastically by device system algorithms."
    ]
  },
  {
    "id": "power_efficiency",
    "name": "Power Efficiency Index (EF)",
    "formulaDisplay": "Efficiency = speed (m/s) / (power watts / body mass kg)",
    "requiredInputs": [
      "speedKmh",
      "powerWatts",
      "bodyMassKg"
    ],
    "unit": "(m/s) per W/kg",
    "precision": "mathematical",
    "limitations": [
      "Assesses external work translation efficiency. Wind resistance, grade, and shoe mechanics are not separate factors."
    ]
  },
  {
    "id": "power_drift",
    "name": "Power Decoupling Drift",
    "formulaDisplay": "Power drift % = (secondHalfPower - firstHalfPower) / firstHalfPower × 100",
    "requiredInputs": [
      "firstHalfPower",
      "secondHalfPower"
    ],
    "unit": "%",
    "precision": "mathematical",
    "limitations": [
      "Measures metabolic/mechanical fading drift. Relies entirely on steady flat routes and uniform weather."
    ]
  },
  {
    "id": "critical_power_2point",
    "name": "2-Point Critical Power Model (CP & W')",
    "formulaDisplay": "Work = Power × Time; CP = (Work2 - Work1) / (Time2 - Time1); W' = (Power1 - CP) × Time1",
    "requiredInputs": [
      "power1",
      "time1S",
      "power2",
      "time2S"
    ],
    "unit": "Watts & Joules",
    "precision": "field_test",
    "limitations": [
      "Requires two separate raw maximal multi-minute field trial efforts. Under-performing skew results significantly."
    ]
  },
  {
    "id": "critical_power_zone",
    "name": "7-Zone Critical Power Range",
    "formulaDisplay": "Power Zones = Critical Power (CP) × % intensity anchors",
    "requiredInputs": [
      "criticalPower"
    ],
    "unit": "Watts",
    "precision": "custom",
    "limitations": [
      "Individual lactate clearance rates can cause zone boundaries to vary up to 5% from standard population averages."
    ]
  },
  {
    "id": "normalized_power_est",
    "name": "Estimated Normalized Power",
    "formulaDisplay": "NP = [ mean( Power^4 ) ]^(1/4)",
    "requiredInputs": [
      "powerValues"
    ],
    "unit": "Watts",
    "precision": "mathematical",
    "limitations": [
      "Standardised mathematical proxy for cardiac metabolic strain. Best suited for high variability workouts."
    ]
  }
] as const;

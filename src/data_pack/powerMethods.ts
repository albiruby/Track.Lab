// Auto-generated static datasource for Track.Lab.
// No database. No AI. No runtime formula evaluation.

export const powerMethods = [
  {
    "id": "watts_per_kg",
    "name": "W/kg",
    "formulaDisplay": "W/kg = power watts / body mass kg",
    "requiredInputs": [
      "powerWatts",
      "bodyMassKg"
    ],
    "precision": "mathematical"
  },
  {
    "id": "power_efficiency",
    "name": "Power Efficiency Index",
    "formulaDisplay": "Efficiency = speed / power",
    "requiredInputs": [
      "speed",
      "powerWatts"
    ],
    "precision": "mathematical"
  },
  {
    "id": "power_drift",
    "name": "Power Drift",
    "formulaDisplay": "Power drift % = (second half power - first half power) / first half power × 100",
    "requiredInputs": [
      "firstHalfPower",
      "secondHalfPower"
    ],
    "precision": "mathematical"
  },
  {
    "id": "critical_power_zone",
    "name": "Critical Power Zones",
    "formulaDisplay": "Power zones = critical power × selected percentage ranges",
    "requiredInputs": [
      "criticalPower"
    ],
    "precision": "custom"
  }
] as const;

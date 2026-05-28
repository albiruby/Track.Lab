// Auto-generated static datasource for Track.Lab.
// No database. No AI. No runtime formula evaluation.

export const environmentRules = [
  {
    "id": "heat_adjustment_note",
    "name": "Heat Adjustment Estimate",
    "requiredInputs": [
      "temperatureC",
      "humidityPct",
      "targetPace"
    ],
    "formulaDisplay": "Use selected adjustment model to estimate pace/time penalty. Always label as environmental estimate.",
    "precision": "estimate"
  },
  {
    "id": "altitude_adjustment_note",
    "name": "Altitude Adjustment Estimate",
    "requiredInputs": [
      "altitudeMeters",
      "distance",
      "raceTime"
    ],
    "formulaDisplay": "Use selected adjustment model to estimate altitude effect. Always label as estimate.",
    "precision": "estimate"
  },
  {
    "id": "wind_note",
    "name": "Wind Note",
    "requiredInputs": [
      "windSpeed",
      "windDirection"
    ],
    "formulaDisplay": "Qualitative note unless a validated wind model is implemented.",
    "precision": "qualitative"
  }
] as const;

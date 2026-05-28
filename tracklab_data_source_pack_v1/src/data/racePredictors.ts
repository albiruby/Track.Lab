// Auto-generated static datasource for Track.Lab.
// No database. No AI. No runtime formula evaluation.

export const racePredictors = [
  {
    "id": "riegel_106",
    "name": "Riegel 1.06",
    "formulaDisplay": "T2 = T1 × (D2 / D1)^1.06",
    "requiredInputs": [
      "knownDistance",
      "knownTime",
      "targetDistance"
    ],
    "precision": "estimate",
    "limitations": [
      "Assumes adequate endurance for target distance.",
      "Large distance jumps increase uncertainty."
    ]
  },
  {
    "id": "riegel_custom_exponent",
    "name": "Adjustable Riegel",
    "formulaDisplay": "T2 = T1 × (D2 / D1)^exponent",
    "requiredInputs": [
      "knownDistance",
      "knownTime",
      "targetDistance",
      "exponent"
    ],
    "precision": "custom_estimate"
  },
  {
    "id": "multi_race_fit",
    "name": "Multi-Race Regression Fit",
    "formulaDisplay": "Fit log(time) vs log(distance) from multiple results, then estimate target time.",
    "requiredInputs": [
      "raceResults[]"
    ],
    "precision": "estimate",
    "limitations": [
      "Better with recent races over similar terrain and conditions."
    ]
  },
  {
    "id": "goal_pace",
    "name": "Goal Pace Calculator",
    "formulaDisplay": "Goal pace = goal time / race distance",
    "requiredInputs": [
      "targetDistance",
      "targetTime"
    ],
    "precision": "mathematical"
  }
] as const;

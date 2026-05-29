// expanded static datasource for Track.Lab VO2 Methods.
// No database. No AI. No runtime formula evaluation.

export const vo2Methods = [
  {
    "id": "cooper_12min_vo2",
    "category": "vo2_metabolic",
    "name": "Cooper 12-Minute VO2max Estimate",
    "formulaDisplay": "VO2max = (distance_meters - 504.9) / 44.73",
    "requiredInputs": ["distanceMeters"],
    "precision": "field_estimate",
    "limitations": [
      "Estimated from 12-min distance, not a direct gas-exchange measurement.",
      "Assumes uniform pacing and high motivation."
    ],
    "implementationStatus": "implemented"
  },
  {
    "id": "one_five_mile_vo2",
    "category": "vo2_metabolic",
    "name": "1.5-Mile VO2max Estimate",
    "formulaDisplay": "VO2max = 3.5 + 483 / (time_minutes)",
    "requiredInputs": ["timeSeconds"],
    "precision": "field_estimate",
    "limitations": [
      "Aerobic power assumption. Submaximal paces skew prediction.",
      "Requires maximal running effort."
    ],
    "implementationStatus": "implemented"
  },
  {
    "id": "rockport_vo2",
    "category": "vo2_metabolic",
    "name": "Rockport Walk Test VO2max Estimate",
    "formulaDisplay": "VO2max = 132.853 - (0.0769 × weight_lbs) - (0.3877 × age) + (6.315 × sex_val) - (3.2649 × time_mins) - (0.1565 × HR)",
    "requiredInputs": ["age", "sex", "weightKg", "timeSeconds", "heartRate"],
    "precision": "field_estimate",
    "limitations": [
      "Specifically suited for walking rather than running protocols.",
      "Explicitly requires an accurate post-effort pulse."
    ],
    "implementationStatus": "implemented"
  },
  {
    "id": "acsm_running_vo2",
    "category": "vo2_metabolic",
    "name": "ACSM Running VO2 Equation",
    "formulaDisplay": "VO2 = 0.2 × speed + 0.9 × speed × grade + 3.5",
    "requiredInputs": ["speedMetersPerMinute", "gradeDecimal"],
    "precision": "estimate",
    "limitations": [
      "Intended for speeds > 8.0 km/h (5.0 mph).",
      "Assumes steady-state aerobic effort."
    ],
    "implementationStatus": "implemented"
  },
  {
    "id": "acsm_walking_vo2",
    "category": "vo2_metabolic",
    "name": "ACSM Walking VO2 Equation",
    "formulaDisplay": "VO2 = 0.1 × speed + 1.8 × speed × grade + 3.5",
    "requiredInputs": ["speedMetersPerMinute", "gradeDecimal"],
    "precision": "estimate",
    "limitations": [
      "Intended for slow to moderate walking speeds between 1.9 and 6.4 km/h (1.2 - 4.0 mph).",
      "Inaccurate for running intensities."
    ],
    "implementationStatus": "implemented"
  },
  {
    "id": "manual_device_vo2",
    "category": "vo2_metabolic",
    "name": "Manual Device VO2max Input",
    "formulaDisplay": "VO2max = Custom user device input",
    "requiredInputs": ["vo2Max"],
    "precision": "measured_or_custom",
    "limitations": [
      "Smartwatches rely on proprietary HR/speed linear models.",
      "Accuracy can degrade significantly with heat, terrain, or drift."
    ],
    "implementationStatus": "implemented"
  },
  {
    "id": "manual_lab_vo2",
    "category": "vo2_metabolic",
    "name": "Manual Lab VO2max Input",
    "formulaDisplay": "VO2max = Lab metabolic cart measurement",
    "requiredInputs": ["vo2Max"],
    "precision": "measured_or_custom",
    "limitations": [
      "Requires high-precision equipment and gas analysis.",
      "Highly accurate but must be periodically updated."
    ],
    "implementationStatus": "implemented"
  },
  {
    "id": "vo2_reserve",
    "category": "vo2_metabolic",
    "name": "VO2 Reserve (VO2R)",
    "formulaDisplay": "VO2R = VO2max - Resting_VO2",
    "requiredInputs": ["vo2Max"],
    "precision": "mathematical",
    "limitations": [
      "Typically assumes standard resting VO2 of 3.5 ml/kg/min."
    ],
    "implementationStatus": "implemented"
  },
  {
    "id": "pct_vo2_max",
    "category": "vo2_metabolic",
    "name": "%VO2max Utilization",
    "formulaDisplay": "%VO2max = VO2_At_Speed / VO2max × 100",
    "requiredInputs": ["vo2AtSpeed", "vo2Max"],
    "precision": "mathematical",
    "limitations": [
      "Fictionalized if work speed VO2 is not calculated correctly."
    ],
    "implementationStatus": "implemented"
  },
  {
    "id": "grade_impact_vo2",
    "category": "vo2_metabolic",
    "name": "Grade Impact on VO2",
    "formulaDisplay": "Grade Impact = VO2_At_Grade - VO2_Flat",
    "requiredInputs": ["flatVO2", "gradeVO2"],
    "precision": "mathematical",
    "limitations": [
      "Examines aerobic demand delta, ignoring biomechanical stress changes."
    ],
    "implementationStatus": "implemented"
  },
  {
    "id": "speed_to_vo2_table",
    "category": "vo2_metabolic",
    "name": "Speed-to-VO2 Table Generator",
    "formulaDisplay": "Calculates ACSM output over preset range: speed vs grade",
    "requiredInputs": ["speedRangeValues", "gradeDecimal"],
    "precision": "mathematical",
    "limitations": [
      "Assumes typical environmental factors and standard metabolic economy."
    ],
    "implementationStatus": "implemented"
  },
  {
    "id": "balke_vo2",
    "category": "vo2_metabolic",
    "name": "Balke Field Treadmill Protocol",
    "formulaDisplay": "VO2max = 1.444 × duration_minutes + 14.99",
    "requiredInputs": ["durationMinutes"],
    "precision": "field_estimate",
    "limitations": ["Specially suited for clinical treadmill populations."],
    "implementationStatus": "planned"
  },
  {
    "id": "beep_test_vo2",
    "category": "vo2_metabolic",
    "name": "Multi-Stage Beep Test VO2",
    "formulaDisplay": "VO2max = linear fit from peak level achieved",
    "requiredInputs": ["shuttleLevel", "shuttleCount"],
    "precision": "field_estimate",
    "limitations": ["Requires aggressive turning and intermittent accelerations."],
    "implementationStatus": "planned"
  },
  {
    "id": "uth_sorensen_vo2",
    "category": "vo2_metabolic",
    "name": "Uth-Sørensen HR Ratio Method",
    "formulaDisplay": "VO2max = 15.3 × (HRmax / restingHR)",
    "requiredInputs": ["maxHeartRate", "restingHeartRate"],
    "precision": "estimate",
    "limitations": ["Relies on direct correlation between metabolic and HR reserve."],
    "implementationStatus": "planned"
  }
] as const;

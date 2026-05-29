// static datasource for Track.Lab Field Test Methods.
// No database. No AI. No runtime formula evaluation.

export const testMethods = [
  {
    "id": "cooper_12min_test",
    "category": "field_test",
    "name": "Cooper 12-Minute Test",
    "formulaDisplay": "VO2max = (distance_meters - 504.9) / 44.73",
    "requiredInputs": ["distanceMeters"],
    "precision": "field_test",
    "limitations": [
      "Requires maximal sustained 12-minute effort.",
      "Requires flat track or GPS measurement."
    ],
    "implementationStatus": "implemented"
  },
  {
    "id": "one_mile_test",
    "category": "field_test",
    "name": "1-Mile Time Trial",
    "formulaDisplay": "Threshold speed estimate from 1-mile pace adjustments",
    "requiredInputs": ["timeSeconds"],
    "precision": "field_test",
    "limitations": [
      "Typically overestimates threshold paces for aerobic-dominant athletes.",
      "Requires severe high-intensity contribution."
    ],
    "implementationStatus": "implemented"
  },
  {
    "id": "three_k_test",
    "category": "field_test",
    "name": "3K Time Trial Reference",
    "formulaDisplay": "Speed mapping from 3K distance + time",
    "requiredInputs": ["timeSeconds"],
    "precision": "field_test",
    "limitations": [
      "Extremely demanding effort.",
      "Threshold estimate uses typical ~8-10% offset factor."
    ],
    "implementationStatus": "implemented"
  },
  {
    "id": "five_k_test",
    "category": "field_test",
    "name": "5K Time Trial Reference",
    "formulaDisplay": "Pace offset style threshold calculation",
    "requiredInputs": ["timeSeconds"],
    "precision": "field_test",
    "limitations": [
      "Standard fitness standard. Threshold is roughly 5% slower than 5K pace."
    ],
    "implementationStatus": "implemented"
  },
  {
    "id": "twenty_min_threshold_test",
    "category": "field_test",
    "name": "20-Minute Threshold Test",
    "formulaDisplay": "LTHR = Average HR × 0.95 | Threshold Pace = 20-min pace × 1.05",
    "requiredInputs": ["averageHr", "distanceMeters", "timeSeconds"],
    "precision": "field_test",
    "limitations": [
      "Classic test of functional threshold speed.",
      "User pacing errors inside initial 5 mins skew outputs."
    ],
    "implementationStatus": "implemented"
  },
  {
    "id": "thirty_min_lthr_test",
    "category": "field_test",
    "name": "30-Minute LTHR Test",
    "formulaDisplay": "LTHR = Average HR of final 20 minutes",
    "requiredInputs": ["averageHrLast20Minutes"],
    "precision": "field_test",
    "limitations": [
      "Requires sustained solo time-trial pacing."
    ],
    "implementationStatus": "implemented"
  },
  {
    "id": "two_point_cs_test",
    "category": "field_test",
    "name": "2-Point CS Test",
    "formulaDisplay": "CS = (D2 - D1)/(T2 - T1)",
    "requiredInputs": ["t1Distance", "t1Time", "t2Distance", "t2Time"],
    "precision": "field_test",
    "limitations": [
      "Very sensitive to timing or performance errors in either trial."
    ],
    "implementationStatus": "implemented"
  },
  {
    "id": "three_point_cs_test",
    "category": "field_test",
    "name": "3-Point CS Test",
    "formulaDisplay": "distance = CS × time + D′",
    "requiredInputs": ["trialsList"],
    "precision": "field_test",
    "limitations": [
      "Requires multiple high-intensity trials separated by adequate recovery."
    ],
    "implementationStatus": "implemented"
  },
  {
    "id": "hr_recovery_test",
    "category": "field_test",
    "name": "HR Recovery Test",
    "formulaDisplay": "HRR1 = Peak_HR - 1min_HR | HRR2 = Peak_HR - 2min_HR",
    "requiredInputs": ["peakHR", "oneMinHR"],
    "precision": "field_test",
    "limitations": [
      "Slight postures (sitting, standing, lying) modify recovery rates.",
      "Non-medical indicator."
    ],
    "implementationStatus": "implemented"
  },
  {
    "id": "sweat_rate_test",
    "category": "field_test",
    "name": "Sweat Rate Test",
    "formulaDisplay": "Loss = Body_Mass_Loss + Fluid_Intake - Urine_Output",
    "requiredInputs": ["preWeightKg", "postWeightKg", "fluidIntakeLiters", "urineLiters", "durationHours"],
    "precision": "field_test",
    "limitations": [
      "Varies extensively with ambient humidity, solar load, heat acclimation, clothing, and metabolic power."
    ],
    "implementationStatus": "implemented"
  },
  {
    "id": "treadmill_calibration_test",
    "category": "field_test",
    "name": "Treadmill Calibration Test",
    "formulaDisplay": "Error % = (treadmill_dist - measured_dist) / measured_dist × 100",
    "requiredInputs": ["measuredDistance", "treadmillDistance"],
    "precision": "field_test",
    "limitations": [
      "Relies on precision tracker or wheel counting.",
      "Treadmill belt speed often fluctuates under foot strikes."
    ],
    "implementationStatus": "implemented"
  },
  {
    "id": "cadence_test",
    "category": "field_test",
    "name": "Cadence Test",
    "formulaDisplay": "Cadence = steps / minutes",
    "requiredInputs": ["stepsCount", "durationSeconds"],
    "precision": "field_test",
    "limitations": [
      "Step count must be exactly tabulated or recorded from sensor."
    ],
    "implementationStatus": "implemented"
  },
  {
    "id": "stride_length_test",
    "category": "field_test",
    "name": "Stride Length Test",
    "formulaDisplay": "Stride Length = speed_m_per_min / cadence",
    "requiredInputs": ["distanceMeters", "stepsCount"],
    "precision": "field_test",
    "limitations": [
      "Yields descriptive biomechanical metrics, not target limits."
    ],
    "implementationStatus": "implemented"
  },
  {
    "id": "easy_run_drift_test",
    "category": "field_test",
    "name": "Easy Run Metabolic Decoupling (Drift)",
    "formulaDisplay": "Drift % = (EF1 - EF2) / EF1 × 100",
    "requiredInputs": ["firstHalfAvgHR", "firstHalfAvgSpeed", "secondHalfAvgHR", "secondHalfAvgSpeed"],
    "precision": "field_test",
    "limitations": ["Cardiac drift estimate. Highly affected by ambient heat, hydration, and caffeine."],
    "implementationStatus": "implemented"
  },
  {
    "id": "long_run_fueling_test",
    "category": "field_test",
    "name": "Long-Run Fueling Challenge",
    "formulaDisplay": "Qualitative hydration and calorie tolerances tracker",
    "requiredInputs": [],
    "precision": "qualitative",
    "limitations": ["Qualitative protocol, no deterministic formula exists."],
    "implementationStatus": "planned"
  }
] as const;

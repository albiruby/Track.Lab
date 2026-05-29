// Auto-generated static datasource for Track.Lab.
// No database. No AI. No runtime formula evaluation.

import { workoutMethods } from "./workoutMethods";
import { calendarMethods } from "./calendarMethods";
import { recoveryRuleDefinitions } from "./recoveryRules";
import { raceDayMethodDefinitions } from "./raceDayChecklists";
import { conversionOptionsList } from "./conversionMethods";

const staticRegistry = [
  {
    "id": "fox_220_age",
    "category": "heart_rate_max",
    "name": "Fox HRmax",
    "requiredInputs": [
      "age"
    ],
    "formulaDisplay": "HRmax = 220 - age",
    "precision": "estimate",
    "limitations": [
      "Population estimate only.",
      "Can be very inaccurate for individuals."
    ]
  },
  {
    "id": "tanaka_208_07_age",
    "category": "heart_rate_max",
    "name": "Tanaka HRmax",
    "requiredInputs": [
      "age"
    ],
    "formulaDisplay": "HRmax = 208 - 0.7 × age",
    "precision": "estimate",
    "limitations": [
      "Population estimate only.",
      "Prefer measured HRmax when available."
    ]
  },
  {
    "id": "gellish_2069_067_age",
    "category": "heart_rate_max",
    "name": "Gellish HRmax",
    "requiredInputs": [
      "age"
    ],
    "formulaDisplay": "HRmax = 206.9 - 0.67 × age",
    "precision": "estimate",
    "limitations": [
      "Population estimate only.",
      "Not a measured maximum."
    ]
  },
  {
    "id": "gulati_206_088_age",
    "category": "heart_rate_max",
    "name": "Gulati HRmax",
    "requiredInputs": [
      "age"
    ],
    "formulaDisplay": "HRmax = 206 - 0.88 × age",
    "precision": "estimate",
    "limitations": [
      "Population estimate, often referenced for women.",
      "Not a measured maximum."
    ]
  },
  {
    "id": "nes_211_064_age",
    "category": "heart_rate_max",
    "name": "HUNT/Nes HRmax",
    "requiredInputs": [
      "age"
    ],
    "formulaDisplay": "HRmax = 211 - 0.64 × age",
    "precision": "estimate",
    "limitations": [
      "Population estimate only."
    ]
  },
  {
    "id": "manual_hrmax",
    "category": "heart_rate_max",
    "name": "Manual / Measured HRmax",
    "requiredInputs": [
      "maxHeartRate"
    ],
    "formulaDisplay": "HRmax = user-provided measured value",
    "precision": "measured_or_custom",
    "limitations": [
      "Quality depends on how HRmax was measured.",
      "Do not force max tests without supervision."
    ]
  },
  {
    "id": "five_zone_hrmax_standard",
    "category": "heart_rate_zone",
    "name": "5-Zone %HRmax",
    "requiredInputs": [
      "maxHeartRate"
    ],
    "formulaDisplay": "Zone HR = HRmax × percentage range",
    "precision": "estimate",
    "limitations": []
  },
  {
    "id": "five_zone_karvonen_hrr",
    "category": "heart_rate_zone",
    "name": "5-Zone Karvonen / HRR",
    "requiredInputs": [
      "maxHeartRate",
      "restingHeartRate"
    ],
    "formulaDisplay": "Target HR = RHR + intensity × (HRmax - RHR)",
    "precision": "estimate_personalized",
    "limitations": []
  },
  {
    "id": "lthr_8020_five_zone",
    "category": "heart_rate_zone",
    "name": "5-Zone LTHR / 80-20 Style",
    "requiredInputs": [
      "lactateThresholdHeartRate"
    ],
    "formulaDisplay": "Zone HR = LTHR × percentage range",
    "precision": "field_test",
    "limitations": []
  },
  {
    "id": "maf_180",
    "category": "heart_rate_zone",
    "name": "MAF 180 Aerobic Ceiling",
    "requiredInputs": [
      "age",
      "mafModifier"
    ],
    "formulaDisplay": "MAF ceiling = 180 - age + modifier",
    "precision": "estimate",
    "limitations": [
      "Simple aerobic ceiling, not full zone model."
    ]
  },
  {
    "id": "custom_hr_zones",
    "category": "heart_rate_zone",
    "name": "Custom HR Zones",
    "requiredInputs": [
      "customZoneRanges"
    ],
    "formulaDisplay": "User-defined HR ranges",
    "precision": "custom",
    "limitations": []
  },
  {
    "id": "race_derived_generic",
    "category": "pace_zone",
    "name": "Race-Derived Generic Pace Zones",
    "requiredInputs": [
      "recentRaceDistance",
      "recentRaceTime"
    ],
    "formulaDisplay": "Derive current training paces from recent race/time-trial result using selected model.",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "threshold_based",
    "category": "pace_zone",
    "name": "Threshold-Pace-Based Zones",
    "requiredInputs": [
      "thresholdPace"
    ],
    "formulaDisplay": "Zone pace ranges use threshold pace as anchor.",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "critical_speed_based",
    "category": "pace_zone",
    "name": "Critical-Speed-Based Zones",
    "requiredInputs": [
      "criticalSpeed"
    ],
    "formulaDisplay": "Zone speeds are anchored to critical speed.",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "manual_pace_zones",
    "category": "pace_zone",
    "name": "Manual Pace Zones",
    "requiredInputs": [
      "customPaceRanges"
    ],
    "formulaDisplay": "User-defined pace ranges.",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "manual_base_pace_training",
    "category": "pace_zone",
    "name": "Manual Base Pace Training Paces",
    "requiredInputs": [
      "basePace"
    ],
    "formulaDisplay": "Derive training paces from a manual base pace using % threshold estimates.",
    "precision": "mathematical",
    "limitations": [
      "Relies on standard easy pace ratios (~122% threshold pace)."
    ]
  },
  {
    "id": "pace_category_conversion_table",
    "category": "pace_zone",
    "name": "Training Pace Conversion Table",
    "requiredInputs": [
      "pace"
    ],
    "formulaDisplay": "Convert calculated segment pace to equivalent track metrics (100m, 400m, mile) and linear speeds (km/h, mph).",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "riegel_106",
    "category": "race_prediction",
    "name": "Riegel 1.06",
    "requiredInputs": [
      "knownDistance",
      "knownTime",
      "targetDistance"
    ],
    "formulaDisplay": "T2 = T1 × (D2 / D1)^1.06",
    "precision": "estimate",
    "limitations": [
      "Assumes adequate endurance for target distance.",
      "Large distance jumps increase uncertainty."
    ]
  },
  {
    "id": "riegel_custom_exponent",
    "category": "race_prediction",
    "name": "Adjustable Riegel",
    "requiredInputs": [
      "knownDistance",
      "knownTime",
      "targetDistance",
      "exponent"
    ],
    "formulaDisplay": "T2 = T1 × (D2 / D1)^exponent",
    "precision": "custom_estimate",
    "limitations": []
  },
  {
    "id": "multi_race_fit",
    "category": "race_prediction",
    "name": "Multi-Race Regression Fit",
    "requiredInputs": [
      "raceResults[]"
    ],
    "formulaDisplay": "Fit log(time) vs log(distance) from multiple results, then estimate target time.",
    "precision": "estimate",
    "limitations": [
      "Better with recent races over similar terrain and conditions."
    ]
  },
  {
    "id": "goal_pace",
    "category": "race_prediction",
    "name": "Goal Pace Calculator",
    "requiredInputs": [
      "targetDistance",
      "targetTime"
    ],
    "formulaDisplay": "Goal pace = goal time / race distance",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "equivalent_performance_table",
    "category": "race_prediction",
    "name": "Equivalent Performance Table",
    "requiredInputs": [
      "knownDistance",
      "knownTime"
    ],
    "formulaDisplay": "Tabulate Riegel equivalent times across reference distances (400m to 100 Mile).",
    "precision": "estimate",
    "limitations": [
      "Assumes typical physiological profile without specific fiber-type bias."
    ]
  },
  {
    "id": "abc_goal_builder",
    "category": "race_prediction",
    "name": "A/B/C Goal Builder",
    "requiredInputs": [
      "predictedTimeSeconds"
    ],
    "formulaDisplay": "A Goal (aggressive, -2%), B Goal (realistic, base), C Goal (conservative, +2%).",
    "precision": "mathematical",
    "limitations": [
      "Does not replace a customized, condition-aware tactical goal plan."
    ]
  },
  {
    "id": "distance_similarity_confidence",
    "category": "race_prediction",
    "name": "Distance Similarity Confidence",
    "requiredInputs": [
      "knownDistance",
      "targetDistance"
    ],
    "formulaDisplay": "Proximity-based confidence label mapping: <=1.5 (High), <=3.0 (Moderate), <=6.0 (Low), >6.0 (Very Low).",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "conservative_start_scenario",
    "category": "race_prediction",
    "name": "Conservative Start Scenario",
    "requiredInputs": [
      "totalDistance",
      "targetTime"
    ],
    "formulaDisplay": "Calibrate splits with slower initial segments (+5% first km, +3% second km) while conserving total duration.",
    "precision": "mathematical",
    "limitations": [
      "Requires late-race pacing acceleration."
    ]
  },
  {
    "id": "cs_two_point",
    "category": "critical_speed",
    "name": "2-Point Critical Speed",
    "requiredInputs": [
      "trial1Distance",
      "trial1Time",
      "trial2Distance",
      "trial2Time"
    ],
    "formulaDisplay": "CS = (D2 - D1) / (T2 - T1); D′ = D1 - CS × T1",
    "precision": "field_test",
    "limitations": [
      "Trials must be maximal and sufficiently different in duration."
    ]
  },
  {
    "id": "cs_three_point",
    "category": "critical_speed",
    "name": "3-Point Critical Speed",
    "requiredInputs": [
      "trialResults[3+]"
    ],
    "formulaDisplay": "Linear model: distance = CS × time + D′",
    "precision": "field_test",
    "limitations": [
      "More robust than two-point but requires more testing."
    ]
  },
  {
    "id": "manual_cs",
    "category": "critical_speed",
    "name": "Manual Critical Speed",
    "requiredInputs": [
      "criticalSpeed"
    ],
    "formulaDisplay": "CS = user-provided value",
    "precision": "custom",
    "limitations": []
  },
  {
    "id": "above_cs_tools",
    "category": "critical_speed",
    "name": "Above-CS Capacity Tools",
    "requiredInputs": [
      "criticalSpeed",
      "dPrime"
    ],
    "formulaDisplay": "TTE = D' / (Speed - CS) & Distance = (Speed - CS) × Duration",
    "precision": "field_test",
    "limitations": [
      "Only valid for target intensities strictly above Critical Speed."
    ]
  },
  {
    "id": "cs_based_zones",
    "category": "critical_speed",
    "name": "CS-Based Zones",
    "requiredInputs": [
      "criticalSpeed"
    ],
    "formulaDisplay": "Five physiological intensities mapped relative to Critical Speed (Z1 <80%, Z2 80-90%, Z3 90-95%, Z4 95-103%, Z5 >103%).",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "cs_vs_race_comparison",
    "category": "critical_speed",
    "name": "CS vs Race Paces Comparison",
    "requiredInputs": [
      "criticalSpeedPace",
      "thresholdPace"
    ],
    "formulaDisplay": "Compare Critical Speed to lactate threshold and equivalent racing speeds.",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "cooper_12min",
    "category": "vo2_metabolic",
    "name": "Cooper 12-Minute VO2max Estimate",
    "requiredInputs": [
      "distanceMetersIn12Min"
    ],
    "formulaDisplay": "VO2max = (distance_meters - 504.9) / 44.73",
    "precision": "field_estimate",
    "limitations": []
  },
  {
    "id": "acsm_running_vo2",
    "category": "vo2_metabolic",
    "name": "ACSM Running VO2 Equation",
    "requiredInputs": [
      "speedMetersPerMinute",
      "gradeDecimal"
    ],
    "formulaDisplay": "VO2 = 0.2 × speed + 0.9 × speed × grade + 3.5",
    "precision": "estimate",
    "limitations": []
  },
  {
    "id": "met_from_vo2",
    "category": "vo2_metabolic",
    "name": "MET from VO2",
    "requiredInputs": [
      "vo2"
    ],
    "formulaDisplay": "MET = VO2 / 3.5",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "calories_met",
    "category": "vo2_metabolic",
    "name": "Calories from MET",
    "requiredInputs": [
      "met",
      "bodyMassKg",
      "durationMinutes"
    ],
    "formulaDisplay": "kcal = MET × 3.5 × bodyMassKg / 200 × minutes",
    "precision": "estimate",
    "limitations": []
  },
  {
    "id": "weekly_mileage",
    "category": "load",
    "name": "Weekly Mileage",
    "requiredInputs": [
      "dailyDistances"
    ],
    "formulaDisplay": "Weekly Distance = sum(daily distances)",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "weekly_duration",
    "category": "load",
    "name": "Weekly Duration",
    "requiredInputs": [
      "dailyDurations"
    ],
    "formulaDisplay": "Weekly Duration = sum(daily durations)",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "long_run_ratio",
    "category": "load",
    "name": "Long Run Ratio",
    "requiredInputs": [
      "longRunDistance",
      "weeklyDistance"
    ],
    "formulaDisplay": "Long Run Ratio = Long Run Distance / Weekly Distance × 100",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "progression_rate",
    "category": "load",
    "name": "Progression Rate",
    "requiredInputs": [
      "currentWeekLoad",
      "previousWeekLoad"
    ],
    "formulaDisplay": "Progression % = (currentWeek - previousWeek) / previousWeek × 100",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "srpe_load",
    "category": "load",
    "name": "Session RPE Load",
    "requiredInputs": [
      "durationMinutes",
      "rpe"
    ],
    "formulaDisplay": "sRPE Load = duration minutes × RPE",
    "precision": "field_estimate",
    "limitations": []
  },
  {
    "id": "monotony",
    "category": "load",
    "name": "Training Monotony",
    "requiredInputs": [
      "dailyLoads"
    ],
    "formulaDisplay": "Monotony = mean daily load / standard deviation daily load",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "strain",
    "category": "load",
    "name": "Training Strain",
    "requiredInputs": [
      "weeklyLoad",
      "monotony"
    ],
    "formulaDisplay": "Strain = Weekly Load × Monotony",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "acwr",
    "category": "load",
    "name": "Acute:Chronic Workload Ratio",
    "requiredInputs": [
      "acuteLoad",
      "chronicLoad"
    ],
    "formulaDisplay": "ACWR = acute load / chronic load",
    "precision": "mathematical",
    "limitations": [
      "Load ratio only, not injury prediction."
    ]
  },
  {
    "id": "intensity_distribution",
    "category": "load",
    "name": "Intensity Distribution",
    "requiredInputs": [
      "zoneDurations"
    ],
    "formulaDisplay": "Zone % = zone time / total time × 100",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "carb_total",
    "category": "fuel_hydration",
    "name": "Total Carbohydrate",
    "requiredInputs": [
      "durationHours",
      "carbGramsPerHour"
    ],
    "formulaDisplay": "Total carbs = duration hours × carb target per hour",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "gel_count",
    "category": "fuel_hydration",
    "name": "Gel Count",
    "requiredInputs": [
      "totalCarbs",
      "carbsPerGel"
    ],
    "formulaDisplay": "Gel count = total carbs / carbs per gel",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "fluid_total",
    "category": "fuel_hydration",
    "name": "Total Fluid",
    "requiredInputs": [
      "durationHours",
      "fluidMlPerHour"
    ],
    "formulaDisplay": "Total fluid = duration hours × fluid target per hour",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "bottle_count",
    "category": "fuel_hydration",
    "name": "Bottle Count",
    "requiredInputs": [
      "totalFluidMl",
      "bottleVolumeMl"
    ],
    "formulaDisplay": "Bottle count = total fluid / bottle volume",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "sodium_total",
    "category": "fuel_hydration",
    "name": "Total Sodium",
    "requiredInputs": [
      "durationHours",
      "sodiumMgPerHour"
    ],
    "formulaDisplay": "Total sodium = duration hours × sodium target per hour",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "sweat_rate",
    "category": "fuel_hydration",
    "name": "Sweat Rate",
    "requiredInputs": [
      "preWeightKg",
      "postWeightKg",
      "fluidIntakeL",
      "urineOutputL",
      "durationHours"
    ],
    "formulaDisplay": "Sweat loss = body mass loss + fluid intake - urine output; sweat rate = sweat loss / duration",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "heat_adjustment_note",
    "category": "environment",
    "name": "Heat Adjustment Estimate",
    "requiredInputs": [
      "temperatureC",
      "humidityPct",
      "targetPace"
    ],
    "formulaDisplay": "Use selected adjustment model to estimate pace/time penalty. Always label as environmental estimate.",
    "precision": "estimate",
    "limitations": []
  },
  {
    "id": "altitude_adjustment_note",
    "category": "environment",
    "name": "Altitude Adjustment Estimate",
    "requiredInputs": [
      "altitudeMeters",
      "distance",
      "raceTime"
    ],
    "formulaDisplay": "Use selected adjustment model to estimate altitude effect. Always label as estimate.",
    "precision": "estimate",
    "limitations": []
  },
  {
    "id": "wind_note",
    "category": "environment",
    "name": "Wind Note",
    "requiredInputs": [
      "windSpeed",
      "windDirection"
    ],
    "formulaDisplay": "Qualitative note unless a validated wind model is implemented.",
    "precision": "qualitative",
    "limitations": []
  },
  {
    "id": "grade_pct",
    "category": "trail_elevation",
    "name": "Grade Percentage",
    "requiredInputs": [
      "elevationGainMeters",
      "horizontalDistanceMeters"
    ],
    "formulaDisplay": "Grade % = elevation gain / horizontal distance × 100",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "elevation_per_km",
    "category": "trail_elevation",
    "name": "Elevation per KM",
    "requiredInputs": [
      "elevationGainMeters",
      "distanceKm"
    ],
    "formulaDisplay": "Elevation per km = total elevation gain / distance km",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "vertical_speed",
    "category": "trail_elevation",
    "name": "Vertical Speed",
    "requiredInputs": [
      "elevationGainMeters",
      "durationHours"
    ],
    "formulaDisplay": "Vertical speed = elevation gain / time",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "hill_repeat_volume",
    "category": "trail_elevation",
    "name": "Hill Repeat Climb Volume",
    "requiredInputs": [
      "reps",
      "climbMetersPerRep"
    ],
    "formulaDisplay": "Total climb = reps × climb per rep",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "pace_to_kmh",
    "category": "treadmill",
    "name": "Pace to Treadmill Speed",
    "requiredInputs": [
      "paceMinPerKm"
    ],
    "formulaDisplay": "km/h = 60 / pace minutes per km",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "kmh_to_pace",
    "category": "treadmill",
    "name": "Treadmill Speed to Pace",
    "requiredInputs": [
      "speedKmh"
    ],
    "formulaDisplay": "pace min/km = 60 / km/h",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "acsm_treadmill_vo2",
    "category": "treadmill",
    "name": "Treadmill VO2 Estimate",
    "requiredInputs": [
      "speedMetersPerMinute",
      "gradeDecimal"
    ],
    "formulaDisplay": "VO2 = 0.2 × speed + 0.9 × speed × grade + 3.5",
    "precision": "estimate",
    "limitations": []
  },
  {
    "id": "cadence",
    "category": "biomechanics",
    "name": "Cadence",
    "requiredInputs": [
      "steps",
      "durationMinutes"
    ],
    "formulaDisplay": "Cadence = steps / minutes",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "step_count",
    "category": "biomechanics",
    "name": "Step Count",
    "requiredInputs": [
      "cadence",
      "durationMinutes"
    ],
    "formulaDisplay": "Steps = cadence × duration minutes",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "stride_length",
    "category": "biomechanics",
    "name": "Stride Length",
    "requiredInputs": [
      "speedMetersPerMinute",
      "cadence"
    ],
    "formulaDisplay": "Stride length = speed meters per minute / steps per minute",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "speed_from_cadence_stride",
    "category": "biomechanics",
    "name": "Speed from Cadence and Stride Length",
    "requiredInputs": [
      "cadence",
      "strideLengthMeters"
    ],
    "formulaDisplay": "Speed = cadence × stride length",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "watts_per_kg",
    "category": "power",
    "name": "W/kg",
    "requiredInputs": [
      "powerWatts",
      "bodyMassKg"
    ],
    "formulaDisplay": "W/kg = power watts / body mass kg",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "power_efficiency",
    "category": "power",
    "name": "Power Efficiency Index",
    "requiredInputs": [
      "speed",
      "powerWatts"
    ],
    "formulaDisplay": "Efficiency = speed / power",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "power_drift",
    "category": "power",
    "name": "Power Drift",
    "requiredInputs": [
      "firstHalfPower",
      "secondHalfPower"
    ],
    "formulaDisplay": "Power drift % = (second half power - first half power) / first half power × 100",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "critical_power_zone",
    "category": "power",
    "name": "Critical Power Zones",
    "requiredInputs": [
      "criticalPower"
    ],
    "formulaDisplay": "Power zones = critical power × selected percentage ranges",
    "precision": "custom",
    "limitations": []
  },
  {
    "id": "sleep_duration",
    "category": "recovery",
    "name": "Sleep Duration",
    "requiredInputs": [
      "bedtime",
      "wakeTime"
    ],
    "formulaDisplay": "Sleep duration = wake time - bedtime",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "rhr_delta",
    "category": "recovery",
    "name": "Resting HR Delta",
    "requiredInputs": [
      "todayRHR",
      "baselineRHR"
    ],
    "formulaDisplay": "RHR delta = today RHR - baseline RHR",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "hrv_delta_pct",
    "category": "recovery",
    "name": "HRV Change %",
    "requiredInputs": [
      "todayHRV",
      "baselineHRV"
    ],
    "formulaDisplay": "HRV change % = (today HRV - baseline HRV) / baseline HRV × 100",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "body_mass_delta_pct",
    "category": "recovery",
    "name": "Body Mass Change %",
    "requiredInputs": [
      "todayWeight",
      "baselineWeight"
    ],
    "formulaDisplay": "Body mass change % = (today weight - baseline weight) / baseline weight × 100",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "session_rpe_recovery",
    "category": "recovery",
    "name": "Session RPE Load",
    "requiredInputs": [
      "durationMinutes",
      "rpe"
    ],
    "formulaDisplay": "sRPE load = duration minutes × RPE",
    "precision": "field_estimate",
    "limitations": []
  },
  {
    "id": "shoe_remaining_km",
    "category": "gear",
    "name": "Shoe Remaining Distance",
    "requiredInputs": [
      "estimatedMaxKm",
      "currentKm"
    ],
    "formulaDisplay": "Remaining km = estimated max km - current km",
    "precision": "estimate",
    "limitations": []
  },
  {
    "id": "shoe_cost_per_km",
    "category": "gear",
    "name": "Shoe Cost per KM",
    "requiredInputs": [
      "shoePrice",
      "totalKm"
    ],
    "formulaDisplay": "Cost per km = shoe price / total km",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "fuel_cost",
    "category": "gear",
    "name": "Fueling Cost",
    "requiredInputs": [
      "servings",
      "pricePerServing"
    ],
    "formulaDisplay": "Fuel cost = serving count × price per serving",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "even_split",
    "category": "split",
    "name": "Even Split Generator",
    "requiredInputs": ["distance", "targetTime", "segmentDistance"],
    "formulaDisplay": "Split Time = Segment Distance × (Target Time / Total Distance)",
    "precision": "mathematical",
    "limitations": ["Assumes perfectly even pacing without terrain or fatigue adjustments."]
  },
  {
    "id": "srpe_load_new",
    "category": "rpe",
    "name": "Session RPE Load",
    "requiredInputs": ["durationMinutes", "rpe"],
    "formulaDisplay": "sRPE Load = Duration (min) × RPE",
    "precision": "qualitative",
    "limitations": ["Highly subjective. Can vary significantly day-to-day for the same absolute effort. Not a medical measurement."]
  },
  {
    "id": "rpe_classification",
    "category": "rpe",
    "name": "RPE Classification",
    "requiredInputs": ["rpe", "scale"],
    "formulaDisplay": "Maps RPE numeric value to subjective classification label.",
    "precision": "qualitative",
    "limitations": ["Subjective mapping."]
  },
  {
    "id": "track_interval",
    "category": "track",
    "name": "Track Interval Builder",
    "requiredInputs": ["reps", "repDistance", "pace"],
    "formulaDisplay": "Rep Time = Rep Distance × Pace",
    "precision": "mathematical",
    "limitations": ["Mathematical exact outputs. Ignores acceleration curve of actual track running."]
  },
  {
    "id": "race_timeline",
    "category": "race_day",
    "name": "Race Timeline",
    "requiredInputs": ["raceStart", "warmupOffset"],
    "formulaDisplay": "Timeline Event = Race Start Time - Offset",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "logistics_checkpoints",
    "category": "race_day",
    "name": "Race Day Logistics Checkpoints",
    "requiredInputs": ["duration", "interval"],
    "formulaDisplay": "Checkpoints = Math.floor(Duration / Interval)",
    "precision": "mathematical",
    "limitations": ["Does not account for transition times, aid station spacing, or varying consumption rates."]
  },
  {
    "id": "unit_conversion",
    "category": "conversion",
    "name": "Unit Conversion",
    "requiredInputs": ["value", "conversionType"],
    "formulaDisplay": "Value × Standard Conversion Factor",
    "precision": "mathematical",
    "limitations": ["Limited to specified precision."]
  },
  {
    "id": "weekly_calendar_analysis",
    "category": "calendar",
    "name": "Weekly Calendar Analysis",
    "requiredInputs": ["dailyDistances"],
    "formulaDisplay": "Sums and extracts ratios from weekly distance array.",
    "precision": "mathematical",
    "limitations": ["Does not account for non-running stress or intensity."]
  },
  {
    "id": "pace_from_distance_time",
    "category": "pace",
    "name": "Pace from Distance + Time",
    "requiredInputs": ["distance", "time"],
    "formulaDisplay": "Pace = Time / Distance",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "time_from_distance_pace",
    "category": "pace",
    "name": "Time from Distance + Pace",
    "requiredInputs": ["distance", "pace"],
    "formulaDisplay": "Time = Distance × Pace",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "distance_from_time_pace",
    "category": "pace",
    "name": "Distance from Time + Pace",
    "requiredInputs": ["time", "pace"],
    "formulaDisplay": "Distance = Time / Pace",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "speed_from_pace",
    "category": "pace",
    "name": "Speed from Pace",
    "requiredInputs": ["pace"],
    "formulaDisplay": "Speed = 3600 / paceSecsPerKm",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "pace_from_speed",
    "category": "pace",
    "name": "Pace from Speed",
    "requiredInputs": ["speed"],
    "formulaDisplay": "Pace = 3600 / speedKmh",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "min_km_to_min_mile",
    "category": "pace",
    "name": "min/km to min/mile",
    "requiredInputs": ["paceKm"],
    "formulaDisplay": "Pace (mi) = Pace (km) * 1.60934",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "min_mile_to_min_km",
    "category": "pace",
    "name": "min/mile to min/km",
    "requiredInputs": ["paceMile"],
    "formulaDisplay": "Pace (km) = Pace (mi) / 1.60934",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "elapsed_moving_pace",
    "category": "pace",
    "name": "Moving Pace vs Elapsed Pace",
    "requiredInputs": ["distance", "movingTime", "stopTime"],
    "formulaDisplay": "Elapsed Pace = (Moving Time + Stop Time) / Distance",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "run_walk_blended_pace",
    "category": "pace",
    "name": "Run/Walk Blended Pace",
    "requiredInputs": ["runPace", "walkPace", "runDur", "walkDur"],
    "formulaDisplay": "Blended Pace = Cycle Time / Total Distance in Cycle",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "pace_drift",
    "category": "pace",
    "name": "Pace Drift",
    "requiredInputs": ["firstHalfPace", "secondHalfPace"],
    "formulaDisplay": "Drift = ((Late Pace - Early Pace) / Early Pace) * 100",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "even_split_table",
    "category": "split",
    "name": "Even Split Table",
    "requiredInputs": ["distance", "time", "segment"],
    "formulaDisplay": "Split Time = Segment Distance × Pace",
    "precision": "mathematical",
    "limitations": ["Assumes perfectly even pacing"]
  },
  {
    "id": "negative_split_table",
    "category": "split",
    "name": "Negative Split Table",
    "requiredInputs": ["distance", "time", "ratio"],
    "formulaDisplay": "First Half = Target * (Ratio/100)",
    "precision": "mathematical",
    "limitations": ["Scenario calculation, not training advice"]
  },
  {
    "id": "progressive_split_table",
    "category": "split",
    "name": "Progressive Split Table",
    "requiredInputs": ["distance", "time", "startSlower", "finishFaster", "segment"],
    "formulaDisplay": "Linear segment pace interpolation",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "race_pace_band",
    "category": "split",
    "name": "Race Pace Band",
    "requiredInputs": ["distance", "time", "segment"],
    "formulaDisplay": "Time = Distance × Pace",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "split_comparison",
    "category": "split",
    "name": "Target vs Actual Split Comparison",
    "requiredInputs": ["targetPace", "actualSplits", "segment"],
    "formulaDisplay": "Delta = Actual - Target",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "track_pace_table",
    "category": "track",
    "name": "Track Split Calculator",
    "requiredInputs": ["pace"],
    "formulaDisplay": "Time = (Distance / 1000) × Pace",
    "precision": "mathematical",
    "limitations": ["Ignores acceleration curve"]
  },
  {
    "id": "interval_builder",
    "category": "track",
    "name": "Interval Set Builder",
    "requiredInputs": ["reps", "repDistance", "pace", "rest"],
    "formulaDisplay": "Rep Time = Distance × Pace",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "ladder_calculator",
    "category": "track",
    "name": "Ladder Workout Calculator",
    "requiredInputs": ["distances", "pace", "rest"],
    "formulaDisplay": "Rep Time = Distance × Pace",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "pyramid_calculator",
    "category": "track",
    "name": "Pyramid Workout Calculator",
    "requiredInputs": ["distances", "pace", "rest"],
    "formulaDisplay": "Rep Time = Distance × Pace",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "hr_reserve",
    "category": "heart_rate",
    "name": "Heart Rate Reserve",
    "requiredInputs": ["maxHeartRate", "restingHeartRate"],
    "formulaDisplay": "HRR = HRmax - RHR",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "hr_drift",
    "category": "heart_rate",
    "name": "HR Drift",
    "requiredInputs": ["firstHalfHR", "secondHalfHR"],
    "formulaDisplay": "HR Drift % = (Second Half HR - First Half HR) / First Half HR × 100",
    "precision": "mathematical",
    "limitations": ["Input-based durability estimate, not diagnosis."]
  },
  {
    "id": "aerobic_decoupling",
    "category": "heart_rate",
    "name": "Aerobic Decoupling",
    "requiredInputs": ["firstHalfSpeed", "firstHalfHR", "secondHalfSpeed", "secondHalfHR"],
    "formulaDisplay": "Decoupling % = (EF1 - EF2) / EF1 × 100",
    "precision": "mathematical",
    "limitations": ["Input-based durability estimate, not diagnosis."]
  },
  {
    "id": "hr_recovery",
    "category": "heart_rate",
    "name": "HR Recovery",
    "requiredInputs": ["peakHR", "recoveryHR"],
    "formulaDisplay": "Recovery = Peak HR - Recovery HR",
    "precision": "mathematical",
    "limitations": ["Non-medical calculation."]
  },
  {
    "id": "three_zone_polarized",
    "category": "heart_rate_zone",
    "name": "3-Zone Polarized",
    "requiredInputs": ["maxHeartRate", "restingHeartRate"],
    "formulaDisplay": "Zone 1, 2, 3 based on Ventilatory Thresholds",
    "precision": "estimate",
    "limitations": []
  },
  {
    "id": "seven_zone_advanced_hr",
    "category": "heart_rate_zone",
    "name": "7-Zone Advanced HR",
    "requiredInputs": ["maxHeartRate"],
    "formulaDisplay": "7 fine-grained HR percentage zones",
    "precision": "estimate",
    "limitations": []
  },
  {
    "id": "time_in_zone_distribution",
    "category": "zone",
    "name": "Time-in-Zone Distribution",
    "requiredInputs": ["zoneTimes"],
    "formulaDisplay": "Zone % = Zone Time / Total Time × 100",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "intensity_distribution",
    "category": "zone",
    "name": "80/20 / Polarized / Pyramidal Checker",
    "requiredInputs": ["low", "moderate", "high"],
    "formulaDisplay": "Distribution and rule-based classification",
    "precision": "qualitative",
    "limitations": []
  },
  {
    "id": "zone_comparison",
    "category": "zone",
    "name": "Zone Comparison",
    "requiredInputs": ["systemA", "systemB"],
    "formulaDisplay": "Side-by-side comparison",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "borg_6_20",
    "category": "rpe",
    "name": "Borg 6-20 Classification",
    "requiredInputs": ["borg"],
    "formulaDisplay": "Mapping table lookup",
    "precision": "qualitative",
    "limitations": ["Subjective metric"]
  },
  {
    "id": "rpe_to_zone_mapping",
    "category": "rpe",
    "name": "RPE to Zone Mapping",
    "requiredInputs": ["rpe"],
    "formulaDisplay": "Qualitative mapping from effort to likely physiological zone",
    "precision": "qualitative",
    "limitations": ["Subjective effort mapping, not a physiological measurement."]
  },
  {
    "id": "rpe_drift",
    "category": "rpe",
    "name": "RPE Drift",
    "requiredInputs": ["firstHalfRpe", "secondHalfRpe"],
    "formulaDisplay": "Drift = Later RPE - Early RPE",
    "precision": "qualitative",
    "limitations": []
  },
  {
    "id": "planned_vs_actual_rpe",
    "category": "rpe",
    "name": "Planned vs Actual RPE Difference",
    "requiredInputs": ["plannedRpe", "actualRpe"],
    "formulaDisplay": "Delta = Actual - Planned",
    "precision": "qualitative",
    "limitations": []
  },
  {
    "id": "multi_day_rpe_trend",
    "category": "rpe",
    "name": "Multi-day RPE Trend",
    "requiredInputs": ["dailyRpes"],
    "formulaDisplay": "Average, max, and trend logic",
    "precision": "qualitative",
    "limitations": []
  },
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
  },
  {
    "id": "balke_vo2",
    "category": "vo2_metabolic",
    "name": "Balke Field Treadmill Protocol",
    "formulaDisplay": "VO2max = 1.444 × duration_minutes + 14.99",
    "requiredInputs": ["durationMinutes"],
    "precision": "field_estimate",
    "limitations": ["Specially suited for clinical treadmill populations."]
  },
  {
    "id": "beep_test_vo2",
    "category": "vo2_metabolic",
    "name": "Multi-Stage Beep Test VO2",
    "formulaDisplay": "VO2max = linear fit from peak level achieved",
    "requiredInputs": ["shuttleLevel", "shuttleCount"],
    "precision": "field_estimate",
    "limitations": ["Requires aggressive turning and intermittent accelerations."]
  },
  {
    "id": "uth_sorensen_vo2",
    "category": "vo2_metabolic",
    "name": "Uth-Sørensen HR Ratio Method",
    "formulaDisplay": "VO2max = 15.3 × (HRmax / restingHR)",
    "requiredInputs": ["maxHeartRate", "restingHeartRate"],
    "precision": "estimate",
    "limitations": ["Relies on direct correlation between metabolic and HR reserve."]
  },
  {
    "id": "calories_per_session",
    "category": "metabolic",
    "name": "Calories per Session",
    "formulaDisplay": "kcal_total = MET × bodyWeightKg × durationHours",
    "requiredInputs": ["met", "bodyWeightKg", "durationHours"],
    "precision": "estimate",
    "limitations": [
      "Reflects gross energy cost rather than net extra workout energy."
    ]
  },
  {
    "id": "calories_per_km",
    "category": "metabolic",
    "name": "Calories per Kilometer",
    "formulaDisplay": "kcal/km = kcal_total / distanceKm",
    "requiredInputs": ["totalCalories", "distanceKm"],
    "precision": "mathematical",
    "limitations": [
      "Depends entirely on the precision of the total estimated task energy cost."
    ]
  },
  {
    "id": "calories_per_hour",
    "category": "metabolic",
    "name": "Calories per Hour",
    "formulaDisplay": "kcal/hour = kcal_total / durationHours",
    "requiredInputs": ["totalCalories", "durationHours"],
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "energy_cost_per_km",
    "category": "metabolic",
    "name": "Energy Cost per Kilometer",
    "formulaDisplay": "kcal/kg/km = kcal_total / (bodyWeightKg × distanceKm)",
    "requiredInputs": ["bodyWeightKg", "distanceKm", "totalCalories"],
    "precision": "mathematical",
    "limitations": [
      "Standard net running cost is often around 1.0 kcal/kg/km."
    ]
  },
  {
    "id": "weekly_energy_manual",
    "category": "metabolic",
    "name": "Weekly Energy Expenditure",
    "formulaDisplay": "Weekly kcal = sum(Session MET × mass × hours)",
    "requiredInputs": ["sessionsList"],
    "precision": "estimate",
    "limitations": [
      "Excludes non-running active energy expenditure and thermic effect of food."
    ]
  },
  {
    "id": "gross_vs_net_calories",
    "category": "metabolic",
    "name": "Gross vs Net Calorie Estimate",
    "formulaDisplay": "Net kcal = Gross kcal - (1.0 × weight × duration)",
    "requiredInputs": ["grossCalories", "bodyWeightKg", "durationHours"],
    "precision": "estimate",
    "limitations": ["Requires distinct base metabolic rate assumption."]
  },
  {
    "id": "fuel_demand_estimate",
    "category": "metabolic",
    "name": "Fuel Demand / Substrate Partition Estimate",
    "formulaDisplay": "Estimates carbohydrate vs fat ratio based on intensity",
    "requiredInputs": ["intensityPctVO2max", "totalCalories"],
    "precision": "estimate",
    "limitations": ["Strongly depends on individual fat-oxidation profiles."]
  },
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
  },
  {
    "id": "easy_run_drift_test",
    "category": "field_test",
    "name": "Easy Run Metabolic Decoupling (Drift)",
    "formulaDisplay": "Drift % = (EF1 - EF2) / EF1 × 100",
    "requiredInputs": ["firstHalfAvgHR", "firstHalfAvgSpeed", "secondHalfAvgHR", "secondHalfAvgSpeed"],
    "precision": "field_test",
    "limitations": ["Cardiac drift estimate. Highly affected by ambient heat, hydration, and caffeine."]
  },
  {
    "id": "long_run_fueling_test",
    "category": "field_test",
    "name": "Long-Run Fueling Challenge",
    "formulaDisplay": "Qualitative hydration and calorie tolerances tracker",
    "requiredInputs": [],
    "precision": "qualitative",
    "limitations": ["Qualitative protocol, no deterministic formula exists."]
  }
];

const phase8Methods = [
  {
    "id": "heat_index_estimate",
    "category": "environment",
    "name": "Heat Index Estimate",
    "requiredInputs": ["temperatureC", "humidityPct"],
    "formulaDisplay": "Rothfusz Regression or linear simplification based on heat conditions",
    "precision": "estimate",
    "limitations": ["Approximation of perceived temperature. High uncertainty in solar radiation."]
  },
  {
    "id": "dew_point_category",
    "category": "environment",
    "name": "Dew Point Category",
    "requiredInputs": ["temperatureC", "humidityPct"],
    "formulaDisplay": "Magnus-Tetens Equation with rule-based humidity feeling classifications",
    "precision": "mathematical",
    "limitations": ["Atmospheric indicator of absolute moisture only."]
  },
  {
    "id": "heat_stress_category",
    "category": "environment",
    "name": "Heat Stress Category",
    "requiredInputs": ["temperatureC", "humidityPct"],
    "formulaDisplay": "Rule-based classification mapping heat index threshold outputs",
    "precision": "qualitative",
    "limitations": ["Does not account for wind speed, shade, or sun exposure."]
  },
  {
    "id": "heat_pace_scenario",
    "category": "environment",
    "name": "Heat Pace Scenario",
    "requiredInputs": ["basePace", "heatCategory"],
    "formulaDisplay": "Pace% Increase = f(HeatCategory)",
    "precision": "estimate",
    "limitations": ["Scenario simulation only. Individual acclimatization/economy varies."]
  },
  {
    "id": "heat_hydration_scenario",
    "category": "environment",
    "name": "Heat Hydration Scenario",
    "requiredInputs": ["baseFluidPerHour", "heatCategory"],
    "formulaDisplay": "Adjusted Fluid = Base Fluid × Multiplier(heatCategory)",
    "precision": "estimate",
    "limitations": ["Fluid baseline simulation. Sweating rates are highly user-specific."]
  },
  {
    "id": "heat_sodium_scenario",
    "category": "environment",
    "name": "Heat Sodium Scenario",
    "requiredInputs": ["baseSodiumPerHour", "heatCategory"],
    "formulaDisplay": "Adjusted Sodium = Base Sodium × Multiplier(heatCategory)",
    "precision": "estimate",
    "limitations": ["Sodium baseline simulation. Sweat concentration varies widely."]
  },
  {
    "id": "altitude_category",
    "category": "environment",
    "name": "Altitude Category",
    "requiredInputs": ["altitudeMeters"],
    "formulaDisplay": "Rule-based mapping: Low <700m, Moderate <1500m, High <3000m, Extreme >=3000m",
    "precision": "qualitative",
    "limitations": ["Geographic classification. Individual hypoxia toll is personal."]
  },
  {
    "id": "altitude_vo2_reduction",
    "category": "environment",
    "name": "Altitude VO2 Reduction Estimate",
    "requiredInputs": ["altitudeMeters"],
    "formulaDisplay": "VO2 Reduction % = Match(altitudeMeters > 700) ? 0.006 × (altitudeMeters - 700) : 0",
    "precision": "estimate",
    "limitations": ["Mathematical decrease of aerobic capacity based on effective oxygen pressure."]
  },
  {
    "id": "wind_chill_estimate",
    "category": "environment",
    "name": "Wind Chill Estimate",
    "requiredInputs": ["temperatureC", "windSpeedKmh"],
    "formulaDisplay": "Wind Chill = 13.12 + 0.6215*T - 11.37*V^0.16 + 0.3965*T*V^0.16 if T <= 10 and V >= 4.8",
    "precision": "estimate",
    "limitations": ["Applies only to exposed skin under 10°C air temperature."]
  },
  {
    "id": "wind_effect_classification",
    "category": "environment",
    "name": "Wind Effect Classification",
    "requiredInputs": ["windSpeedKmh", "windDirection"],
    "formulaDisplay": "Qualitative aerodynamic penalty and RPE adjustment guidelines",
    "precision": "qualitative",
    "limitations": ["Varies with drafting, clothing, and body surface area."]
  },
  {
    "id": "aqi_category",
    "category": "environment",
    "name": "AQI Category",
    "requiredInputs": ["aqi"],
    "formulaDisplay": "Rule-based EPA AQI threshold mapping",
    "precision": "qualitative",
    "limitations": ["General guidelines only. Respiration sensitivity is highly individual."]
  },
  {
    "id": "surface_effort_note",
    "category": "environment",
    "name": "Surface Effort Note",
    "requiredInputs": ["surfaceType"],
    "formulaDisplay": "Rule-based terrain mechanics and muscular work guidelines",
    "precision": "qualitative",
    "limitations": ["Broad generalizations of rolling resistance and slip characteristics."]
  },
  {
    "id": "environmental_condition_summary",
    "category": "environment",
    "name": "Environmental Condition Summary",
    "requiredInputs": ["temperatureC", "humidityPct", "altitudeMeters", "aqi"],
    "formulaDisplay": "Compiled matrix of qualitative and quantitative microclimate stresses",
    "precision": "qualitative",
    "limitations": ["Aggregates multiple indices without modeling compounding physiological terms."]
  },
  {
    "id": "elevation_per_mile",
    "category": "trail_elevation",
    "name": "Elevation per Mile",
    "requiredInputs": ["elevationGainMeters", "distanceMiles"],
    "formulaDisplay": "Elevation per mile = total elevation gain / distance miles",
    "precision": "mathematical",
    "limitations": ["Simple vertical accumulation over horizontal distance."]
  },
  {
    "id": "vam",
    "category": "trail_elevation",
    "name": "VAM (Vertical Ascent Meters/Hour)",
    "requiredInputs": ["elevationGainMeters", "durationHours"],
    "formulaDisplay": "VAM = elevation gain in meters / duration in hours",
    "precision": "mathematical",
    "limitations": ["Varies with gradient steepness and trail technicality."]
  },
  {
    "id": "climb_density",
    "category": "trail_elevation",
    "name": "Climb Density",
    "requiredInputs": ["elevationGainMeters", "distanceKm"],
    "formulaDisplay": "Climb Density = total gain / distance km",
    "precision": "mathematical",
    "limitations": ["Aggregated ratio. Does not specify individual hill gradients."]
  },
  {
    "id": "descent_density",
    "category": "trail_elevation",
    "name": "Descent Density",
    "requiredInputs": ["elevationLossMeters", "distanceKm"],
    "formulaDisplay": "Descent Density = total loss / distance km",
    "precision": "mathematical",
    "limitations": ["Aggregated ratio; muscular eccentric load varies with steepness."]
  },
  {
    "id": "gain_loss_ratio",
    "category": "trail_elevation",
    "name": "Gain to Loss Ratio",
    "requiredInputs": ["elevationGainMeters", "elevationLossMeters"],
    "formulaDisplay": "Gain/Loss Ratio = total gain / total loss",
    "precision": "mathematical",
    "limitations": ["Ratio metric only. Net zero on loops."]
  },
  {
    "id": "net_elevation",
    "category": "trail_elevation",
    "name": "Net Elevation Change",
    "requiredInputs": ["elevationGainMeters", "elevationLossMeters"],
    "formulaDisplay": "Net Elevation = total gain - total loss",
    "precision": "mathematical",
    "limitations": ["Does not state overall muscular stress/eccentric damage."]
  },
  {
    "id": "hill_repeat_time",
    "category": "trail_elevation",
    "name": "Hill Repeat Total Time",
    "requiredInputs": ["reps", "workSeconds", "recoverySeconds", "restPolicy"],
    "formulaDisplay": "reps × work + ((policy == 'between' ? reps - 1 : reps) × recovery)",
    "precision": "mathematical",
    "limitations": ["Excludes warm-up, cool-down, or transitions."]
  },
  {
    "id": "segment_grade",
    "category": "trail_elevation",
    "name": "Segment Grade Percentage",
    "requiredInputs": ["segmentDistanceMeters", "segmentGainMeters"],
    "formulaDisplay": "Grade % = elevation gain / segment distance × 100",
    "precision": "mathematical",
    "limitations": ["Asserts linear slope projection. Local micro-gradients may be steeper."]
  },
  {
    "id": "segment_difficulty",
    "category": "trail_elevation",
    "name": "Segment Difficulty Profile",
    "requiredInputs": ["distanceKm", "gainMeters", "surface", "technicality"],
    "formulaDisplay": "Rule-based scoring: (Distance × 5 + Gain × 0.1) × SurfaceMod × TechMod",
    "precision": "qualitative",
    "limitations": ["Terrain estimate only. Effort varies with weather conditions."]
  },
  {
    "id": "manual_elevation_profile",
    "category": "trail_elevation",
    "name": "Manual Elevation Profile Builder",
    "requiredInputs": ["segments"],
    "formulaDisplay": "Compile table segments and trace cumulative elevation points",
    "precision": "mathematical",
    "limitations": ["Reliant on user manual entry accuracy and spacing interval resolution."]
  },
  {
    "id": "equivalent_flat_distance",
    "category": "trail_elevation",
    "name": "Equivalent Flat Distance",
    "requiredInputs": ["distanceKm", "gainMeters"],
    "formulaDisplay": "Flat Equivalent = Distance + (Gain / 100)",
    "precision": "estimate",
    "limitations": ["Rule of thumb estimates biomechanical cost of uphill workload."]
  },
  {
    "id": "kmh_to_mph",
    "category": "treadmill",
    "name": "km/h to mph Speed Converter",
    "requiredInputs": ["speedKmh"],
    "formulaDisplay": "mph = km/h × 0.62137119",
    "precision": "mathematical",
    "limitations": ["Direct physical conversion, zero metabolic scaling."]
  },
  {
    "id": "mph_to_kmh",
    "category": "treadmill",
    "name": "mph to km/h Speed Converter",
    "requiredInputs": ["speedMph"],
    "formulaDisplay": "km/h = mph × 1.609344",
    "precision": "mathematical",
    "limitations": ["Direct physical conversion, zero metabolic scaling."]
  },
  {
    "id": "incline_to_grade",
    "category": "treadmill",
    "name": "Incline to Grade Decimal Converter",
    "requiredInputs": ["inclinePercent"],
    "formulaDisplay": "grade = Incline % / 100",
    "precision": "mathematical",
    "limitations": []
  },
  {
    "id": "acsm_treadmill_running_vo2",
    "category": "treadmill",
    "name": "ACSM Treadmill Running VO2",
    "requiredInputs": ["speedMetersPerMinute", "gradeDecimal"],
    "formulaDisplay": "VO2 = (0.2 × Speed) + (0.9 × Speed × Grade) + 3.5",
    "precision": "estimate",
    "limitations": ["Formulated for steady state running speeds between 8.0 and 22.0 km/h."]
  },
  {
    "id": "acsm_treadmill_walking_vo2",
    "category": "treadmill",
    "name": "ACSM Treadmill Walking VO2",
    "requiredInputs": ["speedMetersPerMinute", "gradeDecimal"],
    "formulaDisplay": "VO2 = (0.1 × Speed) + (1.8 × Speed × Grade) + 3.5",
    "precision": "estimate",
    "limitations": ["Formulated for steady state walking speeds between 3.0 and 7.5 km/h."]
  },
  {
    "id": "speed_incline_matrix",
    "category": "treadmill",
    "name": "Speed-Incline VO2 Matrix Builder",
    "requiredInputs": ["speedsKmh", "inclinesPercent", "mode"],
    "formulaDisplay": "Map Speeds × Inclines through ACSM running/walking models",
    "precision": "estimate",
    "limitations": ["Calculates steady-state predictions. Assumes optimal running biomechanics."]
  },
  {
    "id": "treadmill_calibration_error",
    "category": "treadmill",
    "name": "Treadmill Calibration Error Calculator",
    "requiredInputs": ["treadmillDistance", "measuredDistance"],
    "formulaDisplay": "Error % = (treadmillDistance - measuredDistance) / measuredDistance × 100",
    "precision": "mathematical",
    "limitations": ["Reliant on user device manual calibration accuracy."]
  },
  {
    "id": "treadmill_segment_profile",
    "category": "treadmill",
    "name": "Treadmill Segment Profile",
    "requiredInputs": ["segments", "weightKg", "mode"],
    "formulaDisplay": "Trace total workload, calories, and timeline charts chronologically",
    "precision": "mathematical",
    "limitations": ["Assumes instantaneous speed/incline transitions. No metabolic lag modeled."]
  },
  {
    "id": "road_vs_treadmill_note",
    "category": "treadmill",
    "name": "Road vs Treadmill Effort Note",
    "requiredInputs": [],
    "formulaDisplay": "Qualitative physical comparison regarding wind and stabilization muscles",
    "precision": "qualitative",
    "limitations": ["Individual biomechanical response dynamically varies."]
  }
];

import { getAdaptedMethodRegistry } from "./jsonAdapters";

export const methodRegistry = getAdaptedMethodRegistry([
  ...staticRegistry,
  ...workoutMethods,
  ...calendarMethods,
  ...phase8Methods,
  ...recoveryRuleDefinitions,
  ...raceDayMethodDefinitions,
  ...conversionOptionsList
]) as any[];


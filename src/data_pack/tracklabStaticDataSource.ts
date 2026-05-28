// Auto-generated static datasource for Track.Lab.
// No database. No AI. No runtime formula evaluation.

export const tracklabStaticDataSource = {
  "meta": {
    "name": "Track.Lab Static Data Source Pack",
    "version": "1.0.0",
    "principles": [
      "No database",
      "No AI",
      "No fake data",
      "No output without valid input",
      "Transparent formulas"
    ]
  },
  "raceDistances": [
    {
      "id": "100m",
      "name": "100 m",
      "meters": 100,
      "type": "track",
      "group": "sprint"
    },
    {
      "id": "200m",
      "name": "200 m",
      "meters": 200,
      "type": "track",
      "group": "sprint"
    },
    {
      "id": "400m",
      "name": "400 m",
      "meters": 400,
      "type": "track",
      "group": "sprint"
    },
    {
      "id": "800m",
      "name": "800 m",
      "meters": 800,
      "type": "track",
      "group": "middle_distance"
    },
    {
      "id": "1000m",
      "name": "1000 m",
      "meters": 1000,
      "type": "track",
      "group": "middle_distance"
    },
    {
      "id": "1500m",
      "name": "1500 m",
      "meters": 1500,
      "type": "track",
      "group": "middle_distance"
    },
    {
      "id": "mile",
      "name": "Mile",
      "meters": 1609.344,
      "type": "track_road",
      "group": "middle_distance"
    },
    {
      "id": "2000m",
      "name": "2000 m",
      "meters": 2000,
      "type": "track",
      "group": "middle_distance"
    },
    {
      "id": "3000m",
      "name": "3000 m",
      "meters": 3000,
      "type": "track",
      "group": "distance"
    },
    {
      "id": "2mile",
      "name": "2 miles",
      "meters": 3218.688,
      "type": "track_road",
      "group": "distance"
    },
    {
      "id": "5k",
      "name": "5K",
      "meters": 5000,
      "type": "road_track",
      "group": "distance"
    },
    {
      "id": "8k",
      "name": "8K",
      "meters": 8000,
      "type": "road_xc",
      "group": "distance"
    },
    {
      "id": "10k",
      "name": "10K",
      "meters": 10000,
      "type": "road_track",
      "group": "distance"
    },
    {
      "id": "12k",
      "name": "12K",
      "meters": 12000,
      "type": "road_xc",
      "group": "distance"
    },
    {
      "id": "15k",
      "name": "15K",
      "meters": 15000,
      "type": "road",
      "group": "long_distance"
    },
    {
      "id": "10mile",
      "name": "10 miles",
      "meters": 16093.44,
      "type": "road",
      "group": "long_distance"
    },
    {
      "id": "20k",
      "name": "20K",
      "meters": 20000,
      "type": "road",
      "group": "long_distance"
    },
    {
      "id": "half_marathon",
      "name": "Half Marathon",
      "meters": 21097.5,
      "type": "road",
      "group": "long_distance"
    },
    {
      "id": "25k",
      "name": "25K",
      "meters": 25000,
      "type": "road",
      "group": "long_distance"
    },
    {
      "id": "30k",
      "name": "30K",
      "meters": 30000,
      "type": "road",
      "group": "long_distance"
    },
    {
      "id": "marathon",
      "name": "Marathon",
      "meters": 42195,
      "type": "road",
      "group": "marathon"
    },
    {
      "id": "50k",
      "name": "50K Ultra",
      "meters": 50000,
      "type": "trail_road",
      "group": "ultra"
    },
    {
      "id": "50mile",
      "name": "50 miles Ultra",
      "meters": 80467.2,
      "type": "trail_road",
      "group": "ultra"
    },
    {
      "id": "100k",
      "name": "100K Ultra",
      "meters": 100000,
      "type": "trail_road",
      "group": "ultra"
    },
    {
      "id": "100mile",
      "name": "100 miles Ultra",
      "meters": 160934.4,
      "type": "trail_road",
      "group": "ultra"
    },
    {
      "id": "custom",
      "name": "Custom Distance",
      "meters": null,
      "type": "custom",
      "group": "custom"
    }
  ],
  "unitConversions": [
    {
      "id": "meter_to_km",
      "from": "m",
      "to": "km",
      "factor": 0.001
    },
    {
      "id": "km_to_meter",
      "from": "km",
      "to": "m",
      "factor": 1000
    },
    {
      "id": "mile_to_km",
      "from": "mile",
      "to": "km",
      "factor": 1.609344
    },
    {
      "id": "km_to_mile",
      "from": "km",
      "to": "mile",
      "factor": 0.621371192237334
    },
    {
      "id": "mps_to_kmh",
      "from": "m/s",
      "to": "km/h",
      "factor": 3.6
    },
    {
      "id": "kmh_to_mps",
      "from": "km/h",
      "to": "m/s",
      "factor": 0.2777777777777778
    },
    {
      "id": "mph_to_kmh",
      "from": "mph",
      "to": "km/h",
      "factor": 1.609344
    },
    {
      "id": "kg_to_lb",
      "from": "kg",
      "to": "lb",
      "factor": 2.20462262185
    },
    {
      "id": "lb_to_kg",
      "from": "lb",
      "to": "kg",
      "factor": 0.45359237
    }
  ],
  "methodRegistry": [
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
    }
  ],
  "hrmaxMethods": [
    {
      "id": "fox_220_age",
      "name": "Fox HRmax",
      "formulaDisplay": "HRmax = 220 - age",
      "requiredInputs": [
        "age"
      ],
      "precision": "estimate",
      "limitations": [
        "Population estimate only.",
        "Can be very inaccurate for individuals."
      ],
      "sourceTag": "age_predicted_hrmax"
    },
    {
      "id": "tanaka_208_07_age",
      "name": "Tanaka HRmax",
      "formulaDisplay": "HRmax = 208 - 0.7 × age",
      "requiredInputs": [
        "age"
      ],
      "precision": "estimate",
      "limitations": [
        "Population estimate only.",
        "Prefer measured HRmax when available."
      ],
      "sourceTag": "tanaka_2001"
    },
    {
      "id": "gellish_2069_067_age",
      "name": "Gellish HRmax",
      "formulaDisplay": "HRmax = 206.9 - 0.67 × age",
      "requiredInputs": [
        "age"
      ],
      "precision": "estimate",
      "limitations": [
        "Population estimate only.",
        "Not a measured maximum."
      ],
      "sourceTag": "age_predicted_hrmax"
    },
    {
      "id": "gulati_206_088_age",
      "name": "Gulati HRmax",
      "formulaDisplay": "HRmax = 206 - 0.88 × age",
      "requiredInputs": [
        "age"
      ],
      "precision": "estimate",
      "limitations": [
        "Population estimate, often referenced for women.",
        "Not a measured maximum."
      ],
      "sourceTag": "age_predicted_hrmax"
    },
    {
      "id": "nes_211_064_age",
      "name": "HUNT/Nes HRmax",
      "formulaDisplay": "HRmax = 211 - 0.64 × age",
      "requiredInputs": [
        "age"
      ],
      "precision": "estimate",
      "limitations": [
        "Population estimate only."
      ],
      "sourceTag": "age_predicted_hrmax"
    },
    {
      "id": "manual_hrmax",
      "name": "Manual / Measured HRmax",
      "formulaDisplay": "HRmax = user-provided measured value",
      "requiredInputs": [
        "maxHeartRate"
      ],
      "precision": "measured_or_custom",
      "limitations": [
        "Quality depends on how HRmax was measured.",
        "Do not force max tests without supervision."
      ],
      "sourceTag": "user_input"
    }
  ],
  "hrZoneModels": [
    {
      "id": "five_zone_hrmax_standard",
      "name": "5-Zone %HRmax",
      "basis": "hrmax",
      "zones": [
        {
          "zone": "Z1",
          "name": "Recovery",
          "minPct": 0.5,
          "maxPct": 0.6
        },
        {
          "zone": "Z2",
          "name": "Easy / Aerobic",
          "minPct": 0.6,
          "maxPct": 0.7
        },
        {
          "zone": "Z3",
          "name": "Moderate / Steady",
          "minPct": 0.7,
          "maxPct": 0.8
        },
        {
          "zone": "Z4",
          "name": "Threshold",
          "minPct": 0.8,
          "maxPct": 0.9
        },
        {
          "zone": "Z5",
          "name": "VO2 / Anaerobic",
          "minPct": 0.9,
          "maxPct": 1.0
        }
      ],
      "requiredInputs": [
        "maxHeartRate"
      ],
      "formulaDisplay": "Zone HR = HRmax × percentage range",
      "precision": "estimate"
    },
    {
      "id": "five_zone_karvonen_hrr",
      "name": "5-Zone Karvonen / HRR",
      "basis": "hrr",
      "zones": [
        {
          "zone": "Z1",
          "name": "Recovery",
          "minPct": 0.5,
          "maxPct": 0.6
        },
        {
          "zone": "Z2",
          "name": "Easy / Aerobic",
          "minPct": 0.6,
          "maxPct": 0.7
        },
        {
          "zone": "Z3",
          "name": "Moderate / Steady",
          "minPct": 0.7,
          "maxPct": 0.8
        },
        {
          "zone": "Z4",
          "name": "Threshold",
          "minPct": 0.8,
          "maxPct": 0.9
        },
        {
          "zone": "Z5",
          "name": "VO2 / Anaerobic",
          "minPct": 0.9,
          "maxPct": 1.0
        }
      ],
      "requiredInputs": [
        "maxHeartRate",
        "restingHeartRate"
      ],
      "formulaDisplay": "Target HR = RHR + intensity × (HRmax - RHR)",
      "precision": "estimate_personalized"
    },
    {
      "id": "lthr_8020_five_zone",
      "name": "5-Zone LTHR / 80-20 Style",
      "basis": "lthr",
      "zones": [
        {
          "zone": "Z1",
          "name": "Low Aerobic",
          "minPct": 0.75,
          "maxPct": 0.8,
          "rpe": "1-2"
        },
        {
          "zone": "Z2",
          "name": "Moderate Aerobic",
          "minPct": 0.81,
          "maxPct": 0.89,
          "rpe": "3-4"
        },
        {
          "zone": "Z3",
          "name": "Threshold",
          "minPct": 0.96,
          "maxPct": 1.0,
          "rpe": "5.5-6"
        },
        {
          "zone": "Z4",
          "name": "VO2max",
          "minPct": 1.02,
          "maxPct": 1.05,
          "rpe": "7-8"
        },
        {
          "zone": "Z5",
          "name": "Speed",
          "minPct": 1.06,
          "maxPct": null,
          "rpe": "9-10"
        }
      ],
      "requiredInputs": [
        "lactateThresholdHeartRate"
      ],
      "formulaDisplay": "Zone HR = LTHR × percentage range",
      "precision": "field_test"
    },
    {
      "id": "maf_180",
      "name": "MAF 180 Aerobic Ceiling",
      "basis": "age_modifier",
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
      "name": "Custom HR Zones",
      "basis": "custom",
      "requiredInputs": [
        "customZoneRanges"
      ],
      "formulaDisplay": "User-defined HR ranges",
      "precision": "custom"
    }
  ],
  "paceZoneModels": [
    {
      "id": "race_derived_generic",
      "name": "Race-Derived Generic Pace Zones",
      "basis": "recent_race",
      "requiredInputs": [
        "recentRaceDistance",
        "recentRaceTime"
      ],
      "zones": [
        {
          "id": "recovery",
          "name": "Recovery",
          "relativeToRacePace": "slower",
          "purpose": "active recovery"
        },
        {
          "id": "easy",
          "name": "Easy",
          "relativeToRacePace": "slower",
          "purpose": "aerobic volume"
        },
        {
          "id": "long_run",
          "name": "Long Run",
          "relativeToRacePace": "slower",
          "purpose": "endurance"
        },
        {
          "id": "steady",
          "name": "Steady",
          "relativeToRacePace": "moderate",
          "purpose": "aerobic strength"
        },
        {
          "id": "marathon",
          "name": "Marathon Pace",
          "relativeToRacePace": "race specific",
          "purpose": "specific endurance"
        },
        {
          "id": "tempo",
          "name": "Tempo",
          "relativeToRacePace": "controlled hard",
          "purpose": "stamina"
        },
        {
          "id": "threshold",
          "name": "Threshold",
          "relativeToRacePace": "hard controlled",
          "purpose": "lactate threshold"
        },
        {
          "id": "interval",
          "name": "Interval",
          "relativeToRacePace": "fast",
          "purpose": "VO2max"
        },
        {
          "id": "repetition",
          "name": "Repetition",
          "relativeToRacePace": "faster",
          "purpose": "speed economy"
        }
      ],
      "formulaDisplay": "Derive current training paces from recent race/time-trial result using selected model."
    },
    {
      "id": "threshold_based",
      "name": "Threshold-Pace-Based Zones",
      "basis": "threshold_pace",
      "requiredInputs": [
        "thresholdPace"
      ],
      "formulaDisplay": "Zone pace ranges use threshold pace as anchor."
    },
    {
      "id": "critical_speed_based",
      "name": "Critical-Speed-Based Zones",
      "basis": "critical_speed",
      "requiredInputs": [
        "criticalSpeed"
      ],
      "formulaDisplay": "Zone speeds are anchored to critical speed."
    },
    {
      "id": "manual_pace_zones",
      "name": "Manual Pace Zones",
      "basis": "custom",
      "requiredInputs": [
        "customPaceRanges"
      ],
      "formulaDisplay": "User-defined pace ranges."
    }
  ],
  "racePredictors": [
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
  ],
  "criticalSpeedMethods": [
    {
      "id": "cs_two_point",
      "name": "2-Point Critical Speed",
      "formulaDisplay": "CS = (D2 - D1) / (T2 - T1); D′ = D1 - CS × T1",
      "requiredInputs": [
        "trial1Distance",
        "trial1Time",
        "trial2Distance",
        "trial2Time"
      ],
      "precision": "field_test",
      "limitations": [
        "Trials must be maximal and sufficiently different in duration."
      ]
    },
    {
      "id": "cs_three_point",
      "name": "3-Point Critical Speed",
      "formulaDisplay": "Linear model: distance = CS × time + D′",
      "requiredInputs": [
        "trialResults[3+]"
      ],
      "precision": "field_test",
      "limitations": [
        "More robust than two-point but requires more testing."
      ]
    },
    {
      "id": "manual_cs",
      "name": "Manual Critical Speed",
      "formulaDisplay": "CS = user-provided value",
      "requiredInputs": [
        "criticalSpeed"
      ],
      "precision": "custom"
    }
  ],
  "vo2Methods": [
    {
      "id": "cooper_12min",
      "name": "Cooper 12-Minute VO2max Estimate",
      "formulaDisplay": "VO2max = (distance_meters - 504.9) / 44.73",
      "requiredInputs": [
        "distanceMetersIn12Min"
      ],
      "precision": "field_estimate"
    },
    {
      "id": "acsm_running_vo2",
      "name": "ACSM Running VO2 Equation",
      "formulaDisplay": "VO2 = 0.2 × speed + 0.9 × speed × grade + 3.5",
      "requiredInputs": [
        "speedMetersPerMinute",
        "gradeDecimal"
      ],
      "precision": "estimate"
    },
    {
      "id": "met_from_vo2",
      "name": "MET from VO2",
      "formulaDisplay": "MET = VO2 / 3.5",
      "requiredInputs": [
        "vo2"
      ],
      "precision": "mathematical"
    },
    {
      "id": "calories_met",
      "name": "Calories from MET",
      "formulaDisplay": "kcal = MET × 3.5 × bodyMassKg / 200 × minutes",
      "requiredInputs": [
        "met",
        "bodyMassKg",
        "durationMinutes"
      ],
      "precision": "estimate"
    }
  ],
  "workoutCategories": [
    {
      "id": "recovery",
      "name": "Recovery",
      "description": "Easy running for active recovery.",
      "primaryIntensity": "Z1"
    },
    {
      "id": "foundation",
      "name": "Foundation / Easy Aerobic",
      "description": "Low-intensity aerobic development.",
      "primaryIntensity": "Z1-Z2"
    },
    {
      "id": "long_run",
      "name": "Long Run",
      "description": "Extended endurance session.",
      "primaryIntensity": "Z1-Z2"
    },
    {
      "id": "progression",
      "name": "Progression",
      "description": "Starts easier and finishes stronger.",
      "primaryIntensity": "Z1-Z3"
    },
    {
      "id": "fast_finish",
      "name": "Fast Finish",
      "description": "Aerobic run with controlled faster finish.",
      "primaryIntensity": "Z1-Z3"
    },
    {
      "id": "tempo",
      "name": "Tempo",
      "description": "Controlled hard running for stamina.",
      "primaryIntensity": "tempo/threshold"
    },
    {
      "id": "threshold",
      "name": "Threshold",
      "description": "Cruise/threshold segments.",
      "primaryIntensity": "threshold"
    },
    {
      "id": "double_threshold",
      "name": "Double Threshold",
      "description": "Two controlled threshold sessions in one day; advanced only.",
      "primaryIntensity": "threshold"
    },
    {
      "id": "vo2max",
      "name": "VO2max / Interval",
      "description": "Fast intervals with defined recovery.",
      "primaryIntensity": "interval"
    },
    {
      "id": "repetition",
      "name": "Repetition / Speed Economy",
      "description": "Short fast reps with generous recovery.",
      "primaryIntensity": "repetition"
    },
    {
      "id": "fartlek",
      "name": "Fartlek / Speed Play",
      "description": "Alternating easy and hard running.",
      "primaryIntensity": "mixed"
    },
    {
      "id": "hill",
      "name": "Hill",
      "description": "Uphill repeats or hill circuit.",
      "primaryIntensity": "effort_based"
    },
    {
      "id": "race_pace",
      "name": "Race Pace",
      "description": "Specific work around target race pace.",
      "primaryIntensity": "race_specific"
    },
    {
      "id": "taper",
      "name": "Taper / Sharpening",
      "description": "Reduced volume with controlled intensity.",
      "primaryIntensity": "mixed_low_volume"
    }
  ],
  "workoutTemplates": [
    {
      "id": "recovery_20",
      "name": "20 min Recovery Run",
      "goalDistances": [
        "general",
        "5k",
        "10k"
      ],
      "scenario": "recovery",
      "format": "time",
      "warmup": {
        "minutes": 0
      },
      "mainSet": {
        "type": "continuous",
        "durationMinutes": 20,
        "intensity": "recovery"
      },
      "cooldown": {
        "minutes": 0
      },
      "requiredInputs": [],
      "formulaNotes": [
        "Session duration = 20 min."
      ],
      "difficulty": "easy"
    },
    {
      "id": "recovery_30",
      "name": "30 min Recovery Run",
      "goalDistances": [
        "general",
        "5k",
        "10k",
        "half_marathon"
      ],
      "scenario": "recovery",
      "format": "time",
      "mainSet": {
        "type": "continuous",
        "durationMinutes": 30,
        "intensity": "recovery"
      },
      "requiredInputs": [],
      "formulaNotes": [
        "Session duration = 30 min."
      ],
      "difficulty": "easy"
    },
    {
      "id": "foundation_40",
      "name": "40 min Foundation Run",
      "goalDistances": [
        "general",
        "5k",
        "10k",
        "half_marathon"
      ],
      "scenario": "foundation",
      "format": "time",
      "warmup": {
        "minutes": 5,
        "intensity": "recovery"
      },
      "mainSet": {
        "type": "continuous",
        "durationMinutes": 30,
        "intensity": "easy"
      },
      "cooldown": {
        "minutes": 5,
        "intensity": "recovery"
      },
      "requiredInputs": [
        "easyPace or HR zones"
      ],
      "formulaNotes": [
        "Total duration = warm-up + main + cooldown."
      ],
      "difficulty": "easy"
    },
    {
      "id": "foundation_60",
      "name": "60 min Foundation Run",
      "goalDistances": [
        "10k",
        "half_marathon",
        "marathon"
      ],
      "scenario": "foundation",
      "format": "time",
      "warmup": {
        "minutes": 5,
        "intensity": "recovery"
      },
      "mainSet": {
        "type": "continuous",
        "durationMinutes": 50,
        "intensity": "easy"
      },
      "cooldown": {
        "minutes": 5,
        "intensity": "recovery"
      },
      "requiredInputs": [
        "easyPace or HR zones"
      ],
      "difficulty": "easy"
    },
    {
      "id": "long_easy_75",
      "name": "75 min Easy Long Run",
      "goalDistances": [
        "10k",
        "half_marathon"
      ],
      "scenario": "long_run",
      "format": "time",
      "mainSet": {
        "type": "continuous",
        "durationMinutes": 75,
        "intensity": "easy"
      },
      "requiredInputs": [
        "easyPace optional",
        "weeklyMileage optional"
      ],
      "safetyRuleIds": [
        "long_run_ratio_gt_35"
      ],
      "difficulty": "moderate"
    },
    {
      "id": "long_easy_120",
      "name": "120 min Easy Long Run",
      "goalDistances": [
        "half_marathon",
        "marathon"
      ],
      "scenario": "long_run",
      "format": "time",
      "mainSet": {
        "type": "continuous",
        "durationMinutes": 120,
        "intensity": "easy"
      },
      "requiredInputs": [
        "easyPace optional",
        "weeklyMileage optional"
      ],
      "safetyRuleIds": [
        "long_run_ratio_gt_35"
      ],
      "difficulty": "moderate"
    },
    {
      "id": "progression_45",
      "name": "45 min Progression Run",
      "goalDistances": [
        "general",
        "5k",
        "10k"
      ],
      "scenario": "progression",
      "format": "time",
      "segments": [
        {
          "durationMinutes": 15,
          "intensity": "recovery"
        },
        {
          "durationMinutes": 20,
          "intensity": "easy"
        },
        {
          "durationMinutes": 10,
          "intensity": "steady"
        }
      ],
      "requiredInputs": [
        "paceZones or HR zones"
      ],
      "difficulty": "moderate"
    },
    {
      "id": "fast_finish_60",
      "name": "60 min Fast Finish Run",
      "goalDistances": [
        "10k",
        "half_marathon",
        "marathon"
      ],
      "scenario": "fast_finish",
      "format": "time",
      "segments": [
        {
          "durationMinutes": 10,
          "intensity": "recovery"
        },
        {
          "durationMinutes": 40,
          "intensity": "easy"
        },
        {
          "durationMinutes": 10,
          "intensity": "steady"
        }
      ],
      "requiredInputs": [
        "paceZones or HR zones"
      ],
      "difficulty": "moderate"
    },
    {
      "id": "tempo_20",
      "name": "20 min Tempo",
      "goalDistances": [
        "5k",
        "10k",
        "half_marathon"
      ],
      "scenario": "tempo",
      "format": "time",
      "warmup": {
        "minutes": 15,
        "intensity": "easy"
      },
      "mainSet": {
        "type": "continuous",
        "durationMinutes": 20,
        "intensity": "tempo"
      },
      "cooldown": {
        "minutes": 10,
        "intensity": "easy"
      },
      "requiredInputs": [
        "tempoPace or thresholdPace"
      ],
      "safetyRuleIds": [
        "quality_days_back_to_back"
      ],
      "difficulty": "hard_controlled"
    },
    {
      "id": "threshold_2x10",
      "name": "2 × 10 min Threshold",
      "goalDistances": [
        "5k",
        "10k",
        "half_marathon"
      ],
      "scenario": "threshold",
      "format": "time_reps",
      "warmup": {
        "minutes": 15,
        "intensity": "easy"
      },
      "mainSet": {
        "type": "time_reps",
        "reps": 2,
        "durationMinutes": 10,
        "intensity": "threshold",
        "rest": {
          "durationMinutes": 2,
          "type": "jog"
        }
      },
      "cooldown": {
        "minutes": 10,
        "intensity": "easy"
      },
      "requiredInputs": [
        "thresholdPace or thresholdHR"
      ],
      "safetyRuleIds": [
        "threshold_volume_gt_20_percent"
      ],
      "difficulty": "hard_controlled"
    },
    {
      "id": "threshold_3x8",
      "name": "3 × 8 min Threshold",
      "goalDistances": [
        "5k",
        "10k",
        "half_marathon"
      ],
      "scenario": "threshold",
      "format": "time_reps",
      "warmup": {
        "minutes": 15,
        "intensity": "easy"
      },
      "mainSet": {
        "type": "time_reps",
        "reps": 3,
        "durationMinutes": 8,
        "intensity": "threshold",
        "rest": {
          "durationMinutes": 2,
          "type": "jog"
        }
      },
      "cooldown": {
        "minutes": 10,
        "intensity": "easy"
      },
      "requiredInputs": [
        "thresholdPace or thresholdHR"
      ],
      "safetyRuleIds": [
        "threshold_volume_gt_20_percent"
      ],
      "difficulty": "hard_controlled"
    },
    {
      "id": "cruise_5x1k",
      "name": "5 × 1K Cruise Intervals",
      "goalDistances": [
        "5k",
        "10k"
      ],
      "scenario": "threshold",
      "format": "distance_reps",
      "warmup": {
        "minutes": 15,
        "intensity": "easy"
      },
      "mainSet": {
        "type": "distance_reps",
        "reps": 5,
        "distanceMeters": 1000,
        "intensity": "threshold",
        "rest": {
          "durationSeconds": 75,
          "type": "jog"
        }
      },
      "cooldown": {
        "minutes": 10,
        "intensity": "easy"
      },
      "requiredInputs": [
        "thresholdPace"
      ],
      "safetyRuleIds": [
        "threshold_volume_gt_20_percent"
      ],
      "difficulty": "hard_controlled"
    },
    {
      "id": "cruise_3x2k",
      "name": "3 × 2K Cruise Intervals",
      "goalDistances": [
        "10k",
        "half_marathon"
      ],
      "scenario": "threshold",
      "format": "distance_reps",
      "warmup": {
        "minutes": 15,
        "intensity": "easy"
      },
      "mainSet": {
        "type": "distance_reps",
        "reps": 3,
        "distanceMeters": 2000,
        "intensity": "threshold",
        "rest": {
          "durationSeconds": 120,
          "type": "jog"
        }
      },
      "cooldown": {
        "minutes": 10,
        "intensity": "easy"
      },
      "requiredInputs": [
        "thresholdPace"
      ],
      "difficulty": "hard_controlled"
    },
    {
      "id": "dt_am_5x6min_pm_10x1k",
      "name": "Double Threshold Day: 5×6min AM + 10×1K PM",
      "goalDistances": [
        "1500m",
        "5k",
        "10k"
      ],
      "scenario": "double_threshold",
      "format": "double_session",
      "advancedOnly": true,
      "sessions": [
        {
          "label": "AM",
          "mainSet": {
            "type": "time_reps",
            "reps": 5,
            "durationMinutes": 6,
            "intensity": "threshold_low",
            "rest": {
              "durationMinutes": 1
            }
          }
        },
        {
          "label": "PM",
          "mainSet": {
            "type": "distance_reps",
            "reps": 10,
            "distanceMeters": 1000,
            "intensity": "threshold_high",
            "rest": {
              "durationMinutes": 1
            }
          }
        }
      ],
      "requiredInputs": [
        "thresholdPace",
        "weeklyMileage",
        "advancedMonitoring"
      ],
      "safetyRuleIds": [
        "advanced_only",
        "threshold_volume_gt_20_percent",
        "requires_lactate_or_hr_monitoring"
      ],
      "difficulty": "advanced"
    },
    {
      "id": "dt_am_5x2k_pm_25x400",
      "name": "Double Threshold Day: 5×2K AM + 25×400m PM",
      "goalDistances": [
        "1500m",
        "5k",
        "10k"
      ],
      "scenario": "double_threshold",
      "format": "double_session",
      "advancedOnly": true,
      "sessions": [
        {
          "label": "AM",
          "mainSet": {
            "type": "distance_reps",
            "reps": 5,
            "distanceMeters": 2000,
            "intensity": "threshold_low",
            "rest": {
              "durationMinutes": 1
            }
          }
        },
        {
          "label": "PM",
          "mainSet": {
            "type": "distance_reps",
            "reps": 25,
            "distanceMeters": 400,
            "intensity": "threshold_high",
            "rest": {
              "durationSeconds": 30
            }
          }
        }
      ],
      "requiredInputs": [
        "thresholdPace",
        "weeklyMileage",
        "advancedMonitoring"
      ],
      "safetyRuleIds": [
        "advanced_only",
        "requires_lactate_or_hr_monitoring"
      ],
      "difficulty": "advanced"
    },
    {
      "id": "5k_vo2_6x400",
      "name": "6 × 400m Interval",
      "goalDistances": [
        "1500m",
        "5k"
      ],
      "scenario": "vo2max",
      "format": "distance_reps",
      "warmup": {
        "minutes": 15,
        "intensity": "easy"
      },
      "mainSet": {
        "type": "distance_reps",
        "reps": 6,
        "distanceMeters": 400,
        "intensity": "interval",
        "rest": {
          "durationSeconds": 90,
          "type": "jog_walk"
        }
      },
      "cooldown": {
        "minutes": 10,
        "intensity": "easy"
      },
      "requiredInputs": [
        "intervalPace"
      ],
      "safetyRuleIds": [
        "fast_volume_gt_15_percent",
        "quality_days_back_to_back"
      ],
      "difficulty": "hard"
    },
    {
      "id": "5k_vo2_6x800",
      "name": "6 × 800m VO2 Session",
      "goalDistances": [
        "5k",
        "10k"
      ],
      "scenario": "vo2max",
      "format": "distance_reps",
      "warmup": {
        "minutes": 15,
        "intensity": "easy"
      },
      "mainSet": {
        "type": "distance_reps",
        "reps": 6,
        "distanceMeters": 800,
        "intensity": "interval",
        "rest": {
          "rule": "equal_work_time",
          "type": "jog"
        }
      },
      "cooldown": {
        "minutes": 10,
        "intensity": "easy"
      },
      "requiredInputs": [
        "intervalPace"
      ],
      "safetyRuleIds": [
        "fast_volume_gt_15_percent"
      ],
      "formulaNotes": [
        "Rep time = rep distance × interval pace",
        "Rest = rep time when restRule is equal_work_time"
      ],
      "difficulty": "hard"
    },
    {
      "id": "10k_vo2_5x1k",
      "name": "5 × 1K Interval",
      "goalDistances": [
        "5k",
        "10k"
      ],
      "scenario": "vo2max",
      "format": "distance_reps",
      "warmup": {
        "minutes": 15,
        "intensity": "easy"
      },
      "mainSet": {
        "type": "distance_reps",
        "reps": 5,
        "distanceMeters": 1000,
        "intensity": "interval",
        "rest": {
          "durationMinutes": 2,
          "type": "jog"
        }
      },
      "cooldown": {
        "minutes": 10,
        "intensity": "easy"
      },
      "requiredInputs": [
        "intervalPace"
      ],
      "difficulty": "hard"
    },
    {
      "id": "repetition_10x200",
      "name": "10 × 200m Repetition",
      "goalDistances": [
        "800m",
        "1500m",
        "5k"
      ],
      "scenario": "repetition",
      "format": "distance_reps",
      "warmup": {
        "minutes": 15,
        "intensity": "easy"
      },
      "mainSet": {
        "type": "distance_reps",
        "reps": 10,
        "distanceMeters": 200,
        "intensity": "repetition",
        "rest": {
          "durationSeconds": 200,
          "type": "full_recovery"
        }
      },
      "cooldown": {
        "minutes": 10,
        "intensity": "easy"
      },
      "requiredInputs": [
        "repetitionPace"
      ],
      "safetyRuleIds": [
        "repetition_rep_duration_gt_120s"
      ],
      "difficulty": "hard_neuromuscular"
    },
    {
      "id": "repetition_8x100_strides",
      "name": "8 × 100m Strides",
      "goalDistances": [
        "general",
        "5k",
        "10k",
        "half_marathon"
      ],
      "scenario": "repetition",
      "format": "distance_reps",
      "mainSet": {
        "type": "distance_reps",
        "reps": 8,
        "distanceMeters": 100,
        "intensity": "stride",
        "rest": {
          "durationSeconds": 60,
          "type": "walk_jog"
        }
      },
      "requiredInputs": [],
      "difficulty": "easy_moderate"
    },
    {
      "id": "fartlek_10x1on1off",
      "name": "10 × 1 min On / 1 min Off Fartlek",
      "goalDistances": [
        "5k",
        "10k"
      ],
      "scenario": "fartlek",
      "format": "time_reps",
      "warmup": {
        "minutes": 15,
        "intensity": "easy"
      },
      "mainSet": {
        "type": "alternating_time",
        "reps": 10,
        "onMinutes": 1,
        "onIntensity": "hard_controlled",
        "offMinutes": 1,
        "offIntensity": "easy"
      },
      "cooldown": {
        "minutes": 10,
        "intensity": "easy"
      },
      "requiredInputs": [
        "RPE or paceZones optional"
      ],
      "difficulty": "moderate_hard"
    },
    {
      "id": "hill_10x60s",
      "name": "10 × 60s Hill Repeats",
      "goalDistances": [
        "5k",
        "10k",
        "xc"
      ],
      "scenario": "hill",
      "format": "time_reps",
      "warmup": {
        "minutes": 15,
        "intensity": "easy"
      },
      "mainSet": {
        "type": "time_reps",
        "reps": 10,
        "durationSeconds": 60,
        "intensity": "hard_effort_hill",
        "rest": {
          "rule": "jog_back_down"
        }
      },
      "cooldown": {
        "minutes": 10,
        "intensity": "easy"
      },
      "requiredInputs": [
        "hillDuration",
        "effort"
      ],
      "difficulty": "hard"
    },
    {
      "id": "racepace_5k_5x1k",
      "name": "5 × 1K @ 5K Pace",
      "goalDistances": [
        "5k"
      ],
      "scenario": "race_pace",
      "format": "distance_reps",
      "warmup": {
        "minutes": 15,
        "intensity": "easy"
      },
      "mainSet": {
        "type": "distance_reps",
        "reps": 5,
        "distanceMeters": 1000,
        "intensity": "5k_pace",
        "rest": {
          "durationMinutes": 2,
          "type": "jog"
        }
      },
      "cooldown": {
        "minutes": 10,
        "intensity": "easy"
      },
      "requiredInputs": [
        "current5kPace or target5kPace"
      ],
      "difficulty": "hard"
    },
    {
      "id": "racepace_10k_4x2k",
      "name": "4 × 2K @ 10K Pace",
      "goalDistances": [
        "10k"
      ],
      "scenario": "race_pace",
      "format": "distance_reps",
      "warmup": {
        "minutes": 15,
        "intensity": "easy"
      },
      "mainSet": {
        "type": "distance_reps",
        "reps": 4,
        "distanceMeters": 2000,
        "intensity": "10k_pace",
        "rest": {
          "durationMinutes": 2,
          "type": "jog"
        }
      },
      "cooldown": {
        "minutes": 10,
        "intensity": "easy"
      },
      "requiredInputs": [
        "current10kPace or target10kPace"
      ],
      "difficulty": "hard"
    },
    {
      "id": "hm_pace_3x5k",
      "name": "3 × 5K @ HM Pace",
      "goalDistances": [
        "half_marathon"
      ],
      "scenario": "race_pace",
      "format": "distance_reps",
      "warmup": {
        "minutes": 15,
        "intensity": "easy"
      },
      "mainSet": {
        "type": "distance_reps",
        "reps": 3,
        "distanceMeters": 5000,
        "intensity": "half_marathon_pace",
        "rest": {
          "durationMinutes": 3,
          "type": "jog"
        }
      },
      "cooldown": {
        "minutes": 10,
        "intensity": "easy"
      },
      "requiredInputs": [
        "hmPace"
      ],
      "difficulty": "hard_controlled"
    },
    {
      "id": "marathon_mp_12k",
      "name": "12K Marathon Pace Continuous",
      "goalDistances": [
        "marathon"
      ],
      "scenario": "race_pace",
      "format": "continuous_distance",
      "warmup": {
        "distanceMeters": 3000,
        "intensity": "easy"
      },
      "mainSet": {
        "type": "continuous_distance",
        "distanceMeters": 12000,
        "intensity": "marathon_pace"
      },
      "cooldown": {
        "distanceMeters": 2000,
        "intensity": "easy"
      },
      "requiredInputs": [
        "marathonPace"
      ],
      "difficulty": "moderate_hard"
    },
    {
      "id": "marathon_lr_mp_blocks",
      "name": "Long Run with Marathon Pace Blocks",
      "goalDistances": [
        "marathon"
      ],
      "scenario": "long_run",
      "format": "mixed_distance",
      "segments": [
        {
          "distanceMeters": 5000,
          "intensity": "easy"
        },
        {
          "distanceMeters": 8000,
          "intensity": "marathon_pace"
        },
        {
          "distanceMeters": 3000,
          "intensity": "easy"
        },
        {
          "distanceMeters": 5000,
          "intensity": "marathon_pace"
        },
        {
          "distanceMeters": 3000,
          "intensity": "easy"
        }
      ],
      "requiredInputs": [
        "easyPace",
        "marathonPace",
        "weeklyMileage"
      ],
      "safetyRuleIds": [
        "long_run_ratio_gt_35",
        "fast_volume_gt_15_percent"
      ],
      "difficulty": "hard_controlled"
    }
  ],
  "workoutSafetyRules": [
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
  ],
  "loadMethods": [
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
  ],
  "fuelingHydrationRules": [
    {
      "id": "carb_total",
      "name": "Total Carbohydrate",
      "formulaDisplay": "Total carbs = duration hours × carb target per hour",
      "requiredInputs": [
        "durationHours",
        "carbGramsPerHour"
      ],
      "unit": "g"
    },
    {
      "id": "gel_count",
      "name": "Gel Count",
      "formulaDisplay": "Gel count = total carbs / carbs per gel",
      "requiredInputs": [
        "totalCarbs",
        "carbsPerGel"
      ],
      "unit": "servings"
    },
    {
      "id": "fluid_total",
      "name": "Total Fluid",
      "formulaDisplay": "Total fluid = duration hours × fluid target per hour",
      "requiredInputs": [
        "durationHours",
        "fluidMlPerHour"
      ],
      "unit": "mL"
    },
    {
      "id": "bottle_count",
      "name": "Bottle Count",
      "formulaDisplay": "Bottle count = total fluid / bottle volume",
      "requiredInputs": [
        "totalFluidMl",
        "bottleVolumeMl"
      ],
      "unit": "bottles"
    },
    {
      "id": "sodium_total",
      "name": "Total Sodium",
      "formulaDisplay": "Total sodium = duration hours × sodium target per hour",
      "requiredInputs": [
        "durationHours",
        "sodiumMgPerHour"
      ],
      "unit": "mg"
    },
    {
      "id": "sweat_rate",
      "name": "Sweat Rate",
      "formulaDisplay": "Sweat loss = body mass loss + fluid intake - urine output; sweat rate = sweat loss / duration",
      "requiredInputs": [
        "preWeightKg",
        "postWeightKg",
        "fluidIntakeL",
        "urineOutputL",
        "durationHours"
      ],
      "unit": "L/h"
    }
  ],
  "environmentRules": [
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
  ],
  "trailElevationRules": [
    {
      "id": "grade_pct",
      "name": "Grade Percentage",
      "formulaDisplay": "Grade % = elevation gain / horizontal distance × 100",
      "requiredInputs": [
        "elevationGainMeters",
        "horizontalDistanceMeters"
      ],
      "precision": "mathematical"
    },
    {
      "id": "elevation_per_km",
      "name": "Elevation per KM",
      "formulaDisplay": "Elevation per km = total elevation gain / distance km",
      "requiredInputs": [
        "elevationGainMeters",
        "distanceKm"
      ],
      "precision": "mathematical"
    },
    {
      "id": "vertical_speed",
      "name": "Vertical Speed",
      "formulaDisplay": "Vertical speed = elevation gain / time",
      "requiredInputs": [
        "elevationGainMeters",
        "durationHours"
      ],
      "precision": "mathematical"
    },
    {
      "id": "hill_repeat_volume",
      "name": "Hill Repeat Climb Volume",
      "formulaDisplay": "Total climb = reps × climb per rep",
      "requiredInputs": [
        "reps",
        "climbMetersPerRep"
      ],
      "precision": "mathematical"
    }
  ],
  "treadmillRules": [
    {
      "id": "pace_to_kmh",
      "name": "Pace to Treadmill Speed",
      "formulaDisplay": "km/h = 60 / pace minutes per km",
      "requiredInputs": [
        "paceMinPerKm"
      ],
      "precision": "mathematical"
    },
    {
      "id": "kmh_to_pace",
      "name": "Treadmill Speed to Pace",
      "formulaDisplay": "pace min/km = 60 / km/h",
      "requiredInputs": [
        "speedKmh"
      ],
      "precision": "mathematical"
    },
    {
      "id": "acsm_treadmill_vo2",
      "name": "Treadmill VO2 Estimate",
      "formulaDisplay": "VO2 = 0.2 × speed + 0.9 × speed × grade + 3.5",
      "requiredInputs": [
        "speedMetersPerMinute",
        "gradeDecimal"
      ],
      "precision": "estimate"
    }
  ],
  "biomechanicsMethods": [
    {
      "id": "cadence",
      "name": "Cadence",
      "formulaDisplay": "Cadence = steps / minutes",
      "requiredInputs": [
        "steps",
        "durationMinutes"
      ],
      "unit": "steps/min",
      "precision": "mathematical"
    },
    {
      "id": "step_count",
      "name": "Step Count",
      "formulaDisplay": "Steps = cadence × duration minutes",
      "requiredInputs": [
        "cadence",
        "durationMinutes"
      ],
      "unit": "steps",
      "precision": "mathematical"
    },
    {
      "id": "stride_length",
      "name": "Stride Length",
      "formulaDisplay": "Stride length = speed meters per minute / steps per minute",
      "requiredInputs": [
        "speedMetersPerMinute",
        "cadence"
      ],
      "unit": "m/step",
      "precision": "mathematical"
    },
    {
      "id": "speed_from_cadence_stride",
      "name": "Speed from Cadence and Stride Length",
      "formulaDisplay": "Speed = cadence × stride length",
      "requiredInputs": [
        "cadence",
        "strideLengthMeters"
      ],
      "unit": "m/min",
      "precision": "mathematical"
    }
  ],
  "powerMethods": [
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
  ],
  "recoveryChecks": [
    {
      "id": "sleep_duration",
      "name": "Sleep Duration",
      "formulaDisplay": "Sleep duration = wake time - bedtime",
      "requiredInputs": [
        "bedtime",
        "wakeTime"
      ],
      "precision": "mathematical"
    },
    {
      "id": "rhr_delta",
      "name": "Resting HR Delta",
      "formulaDisplay": "RHR delta = today RHR - baseline RHR",
      "requiredInputs": [
        "todayRHR",
        "baselineRHR"
      ],
      "precision": "mathematical"
    },
    {
      "id": "hrv_delta_pct",
      "name": "HRV Change %",
      "formulaDisplay": "HRV change % = (today HRV - baseline HRV) / baseline HRV × 100",
      "requiredInputs": [
        "todayHRV",
        "baselineHRV"
      ],
      "precision": "mathematical"
    },
    {
      "id": "body_mass_delta_pct",
      "name": "Body Mass Change %",
      "formulaDisplay": "Body mass change % = (today weight - baseline weight) / baseline weight × 100",
      "requiredInputs": [
        "todayWeight",
        "baselineWeight"
      ],
      "precision": "mathematical"
    },
    {
      "id": "session_rpe_recovery",
      "name": "Session RPE Load",
      "formulaDisplay": "sRPE load = duration minutes × RPE",
      "requiredInputs": [
        "durationMinutes",
        "rpe"
      ],
      "precision": "field_estimate"
    }
  ],
  "gearCalculators": [
    {
      "id": "shoe_remaining_km",
      "name": "Shoe Remaining Distance",
      "formulaDisplay": "Remaining km = estimated max km - current km",
      "requiredInputs": [
        "estimatedMaxKm",
        "currentKm"
      ],
      "precision": "estimate"
    },
    {
      "id": "shoe_cost_per_km",
      "name": "Shoe Cost per KM",
      "formulaDisplay": "Cost per km = shoe price / total km",
      "requiredInputs": [
        "shoePrice",
        "totalKm"
      ],
      "precision": "mathematical"
    },
    {
      "id": "fuel_cost",
      "name": "Fueling Cost",
      "formulaDisplay": "Fuel cost = serving count × price per serving",
      "requiredInputs": [
        "servings",
        "pricePerServing"
      ],
      "precision": "mathematical"
    }
  ],
  "validationRules": [
    {
      "id": "positive_number",
      "fieldType": "number",
      "rule": "value > 0",
      "message": "Value must be greater than zero."
    },
    {
      "id": "age_range",
      "field": "age",
      "rule": "5 <= value <= 100",
      "message": "Age must be between 5 and 100."
    },
    {
      "id": "hr_range",
      "field": "heartRate",
      "rule": "30 <= value <= 240",
      "message": "Heart rate must be between 30 and 240 bpm."
    },
    {
      "id": "rhr_less_than_hrmax",
      "field": "restingHeartRate,maxHeartRate",
      "rule": "restingHeartRate < maxHeartRate",
      "message": "Resting HR must be lower than max HR."
    },
    {
      "id": "pace_valid",
      "field": "pace",
      "rule": "paceSecondsPerKm > 0",
      "message": "Pace must be valid."
    },
    {
      "id": "race_time_valid",
      "field": "raceTime",
      "rule": "timeSeconds > 0",
      "message": "Race time must be valid."
    },
    {
      "id": "no_output_without_required_input",
      "field": "global",
      "rule": "all requiredInputs are present",
      "message": "Input incomplete. This method requires additional fields."
    }
  ],
  "uiCopy": {
    "productName": "Track.Lab",
    "tagline": "Science-based running calculators. No AI. No database. No gimmick.",
    "globalBadges": [
      "No AI",
      "No database",
      "Formula shown",
      "Manual input",
      "Client-side calculation"
    ],
    "emptyState": "Enter valid inputs to calculate. Track.Lab never generates fake output.",
    "estimateLabel": "Estimate only. Actual response varies by fitness, fatigue, weather, terrain, and measurement quality.",
    "medicalDisclaimer": "Self-check only. Not medical advice. Not diagnosis. Not injury prediction.",
    "advancedTemplateDisclaimer": "Advanced template. Not a recommendation. Requires appropriate background and monitoring."
  },
  "sourceNotes": [
    {
      "id": "nextjs_public",
      "name": "Next.js public folder",
      "url": "https://nextjs.org/docs/app/api-reference/file-conventions/public-folder",
      "notes": "Static files in public can be referenced from app root."
    },
    {
      "id": "vercel_git",
      "name": "Vercel Git deployment",
      "url": "https://vercel.com/docs/git",
      "notes": "Vercel supports automatic deployments from Git repositories."
    },
    {
      "id": "daniels_running_formula",
      "name": "Daniels' Running Formula",
      "notes": "Used as high-level inspiration for categories such as training types, VDOT-style concepts, environment, treadmill, and event-specific structure. Do not copy proprietary tables."
    },
    {
      "id": "nike_5k_plan",
      "name": "Nike Run Club 5K Training Plan",
      "notes": "Used as high-level inspiration for workout categories: speed, long, recovery, rest, flexibility, and pace guide concept. Do not copy plan tables."
    },
    {
      "id": "norwegian_double_threshold_review",
      "name": "Norwegian Double Threshold Review",
      "notes": "Used as high-level inspiration for advanced threshold/double-threshold calculator metadata and warnings."
    },
    {
      "id": "8020_running",
      "name": "80/20 Running",
      "notes": "Used as high-level inspiration for low/moderate/high intensity distribution calculators, RPE and LTHR zone metadata. Do not copy full tables or plans."
    }
  ]
} as const;

// Auto-generated static datasource for Track.Lab.
// No database. No AI. No runtime formula evaluation.

export const hrZoneModels = [
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
] as const;

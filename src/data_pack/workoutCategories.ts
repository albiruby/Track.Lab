// Auto-generated static datasource for Track.Lab.
// No database. No AI. No runtime formula evaluation.

export const workoutCategories = [
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
] as const;

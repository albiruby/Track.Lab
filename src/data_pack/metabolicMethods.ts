// static datasource for Track.Lab Metabolic Methods.
// No database. No AI. No runtime formula evaluation.

export const metabolicMethods = [
  {
    "id": "met_from_vo2",
    "category": "metabolic",
    "name": "MET from VO2",
    "formulaDisplay": "MET = VO2 / 3.5",
    "requiredInputs": ["vo2"],
    "precision": "mathematical",
    "limitations": [
      "Assumes resting metabolic rate equals exactly 3.5 ml/kg/min."
    ],
    "implementationStatus": "implemented"
  },
  {
    "id": "calories_from_met",
    "category": "metabolic",
    "name": "Calories from MET",
    "formulaDisplay": "kcal = MET × bodyWeightKg × durationHours",
    "requiredInputs": ["met", "bodyWeightKg", "durationHours"],
    "precision": "estimate",
    "limitations": [
      "Standard human metabolic rate assumption. Actual efficiency varies based on body composition and individual economy."
    ],
    "implementationStatus": "implemented"
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
    ],
    "implementationStatus": "implemented"
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
    ],
    "implementationStatus": "implemented"
  },
  {
    "id": "calories_per_hour",
    "category": "metabolic",
    "name": "Calories per Hour",
    "formulaDisplay": "kcal/hour = kcal_total / durationHours",
    "requiredInputs": ["totalCalories", "durationHours"],
    "precision": "mathematical",
    "limitations": [],
    "implementationStatus": "implemented"
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
    ],
    "implementationStatus": "implemented"
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
    ],
    "implementationStatus": "implemented"
  },
  {
    "id": "gross_vs_net_calories",
    "category": "metabolic",
    "name": "Gross vs Net Calorie Estimate",
    "formulaDisplay": "Net kcal = Gross kcal - (1.0 × weight × duration)",
    "requiredInputs": ["grossCalories", "bodyWeightKg", "durationHours"],
    "precision": "estimate",
    "limitations": ["Requires distinct base metabolic rate assumption."],
    "implementationStatus": "planned"
  },
  {
    "id": "fuel_demand_estimate",
    "category": "metabolic",
    "name": "Fuel Demand / Substrate Partition Estimate",
    "formulaDisplay": "Estimates carbohydrate vs fat ratio based on intensity",
    "requiredInputs": ["intensityPctVO2max", "totalCalories"],
    "precision": "estimate",
    "limitations": ["Strongly depends on individual fat-oxidation profiles."],
    "implementationStatus": "planned"
  }
] as const;

// Auto-generated static datasource for Track.Lab.
// No database. No AI. No runtime formula evaluation.

export const gearCalculators = [
  {
    "id": "shoe_remaining_km",
    "name": "Shoe Remaining Life Distance",
    "formulaDisplay": "Remaining km = maxEstimatedKm - currentKm",
    "requiredInputs": [
      "maxEstimatedKm",
      "currentKm"
    ],
    "unit": "km",
    "precision": "estimate",
    "limitations": [
      "Manual mathematical projections only. Shoe midsole foam degradation rate varies by runner weight and biomechanics."
    ]
  },
  {
    "id": "shoe_cost_per_km",
    "name": "Shoe Cost-Per-Distance (Projected/Actual)",
    "formulaDisplay": "Cost/km = shoePrice / maxKilometers",
    "requiredInputs": [
      "shoePrice",
      "maxKilometers"
    ],
    "unit": "$/km",
    "precision": "mathematical",
    "limitations": [
      "Provides a uniform financial amortization model. Ignores local tax, sales price changes, or variable compound durability."
    ]
  },
  {
    "id": "fuel_cost",
    "name": "Gels and Mixes Session Expense",
    "formulaDisplay": "Total Session Cost = (gelCount × gelPrice) + (mixServings × pricePerServing) + sodiumCapsList",
    "requiredInputs": [
      "gelCount",
      "gelPrice"
    ],
    "unit": "$",
    "precision": "mathematical",
    "limitations": [
      "Direct multiplication of retail prices. Does not evaluate bulk savings or specific vendor deals."
    ]
  },
  {
    "id": "drink_mix_serving",
    "name": "Drink Mix Cost per Serving",
    "formulaDisplay": "Cost per Serving = totalProductPrice / servingsCount",
    "requiredInputs": [
      "totalProductPrice",
      "servingsCount"
    ],
    "unit": "$/serving",
    "precision": "mathematical",
    "limitations": [
      "Assumes uniform scoop volume serving measurements are consistently used."
    ]
  },
  {
    "id": "cost_per_carb_gram",
    "name": "Fueling Carbon Economics",
    "formulaDisplay": "$ per Carb Gram = totalSessionCost / totalCarbohydrateGrams",
    "requiredInputs": [
      "totalSessionCost",
      "totalCarbohydrateGrams"
    ],
    "unit": "$/g carb",
    "precision": "mathematical",
    "limitations": [
      "Measures raw nutritional financial conversion density. Does not characterize digestive tolerability or flavor."
    ]
  },
  {
    "id": "watch_battery_margin",
    "name": "GPS Battery Safeguard Window",
    "formulaDisplay": "Battery Margin (hr) = deviceGpsBatteryLifeHours - anticipatedRaceCompletionHours",
    "requiredInputs": [
      "deviceGpsBatteryLifeHours",
      "anticipatedRaceCompletionHours"
    ],
    "unit": "hours",
    "precision": "estimate",
    "limitations": [
      "Li-ion battery age, temperature, map-screen refreshing frequency, and sensor navigation tracking severely affect battery lifetime."
    ]
  }
] as const;

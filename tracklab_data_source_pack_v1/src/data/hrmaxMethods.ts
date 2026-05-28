// Auto-generated static datasource for Track.Lab.
// No database. No AI. No runtime formula evaluation.

export const hrmaxMethods = [
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
] as const;

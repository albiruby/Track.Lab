// Static configuration definitions for all unit conversions.

export interface ConversionOption {
  id: string;
  name: string;
  category: "distance" | "pace_speed" | "temperature" | "weight" | "fluid" | "metabolic_power" | "elevation_grade" | "cadence";
  from: string;
  to: string;
  formula: string;
}

export const conversionOptionsList: ConversionOption[] = [
  // Distance
  { id: "km_to_miles", name: "Kilometers (km) to Miles (mi)", category: "distance", from: "km", to: "mi", formula: "mi = km × 0.621371" },
  { id: "miles_to_km", name: "Miles (mi) to Kilometers (km)", category: "distance", from: "mi", to: "km", formula: "km = mi × 1.609344" },
  { id: "meters_to_feet", name: "Meters (m) to Feet (ft)", category: "distance", from: "m", to: "ft", formula: "ft = m × 3.28084" },
  { id: "feet_to_meters", name: "Feet (ft) to Meters (m)", category: "distance", from: "ft", to: "m", formula: "m = ft / 3.28084" },
  { id: "yards_to_meters", name: "Yards (yd) to Meters (m)", category: "distance", from: "yd", to: "m", formula: "m = yd × 0.9144" },
  { id: "meters_to_yards", name: "Meters (m) to Yards (yd)", category: "distance", from: "m", to: "yd", formula: "yd = m / 0.9144" },

  // Pace / Speed
  { id: "min_km_to_min_mile", name: "Min/km to Min/mile Pace", category: "pace_speed", from: "/km", to: "/mile", formula: "Pace(/mi) = Pace(/km) × 1.609344" },
  { id: "min_mile_to_min_km", name: "Min/mile to Min/km Pace", category: "pace_speed", from: "/mile", to: "/km", formula: "Pace(/km) = Pace(/mi) / 1.609344" },
  { id: "kmh_to_mph", name: "km/h to mph Speed", category: "pace_speed", from: "km/h", to: "mph", formula: "mph = km/h × 0.621371" },
  { id: "mph_to_kmh", name: "mph to km/h Speed", category: "pace_speed", from: "mph", to: "km/h", formula: "km/h = mph × 1.609344" },
  { id: "ms_to_kmh", name: "m/s to km/h Speed", category: "pace_speed", from: "m/s", to: "km/h", formula: "km/h = m/s × 3.6" },
  { id: "kmh_to_ms", name: "km/h to m/s Speed", category: "pace_speed", from: "km/h", to: "m/s", formula: "m/s = km/h / 3.6" },
  { id: "pace_to_speed", name: "Pace (min/km) to Speed (km/h)", category: "pace_speed", from: "min/km", to: "km/h", formula: "Speed = 3600 / PaceSeconds" },
  { id: "speed_to_pace", name: "Speed (km/h) to Pace (min/km)", category: "pace_speed", from: "km/h", to: "min/km", formula: "PaceSeconds = 3600 / Speed" },

  // Temperature
  { id: "celsius_to_fahrenheit", name: "Celsius (°C) to Fahrenheit (°F)", category: "temperature", from: "°C", to: "°F", formula: "°F = (°C × 9/5) + 32" },
  { id: "fahrenheit_to_celsius", name: "Fahrenheit (°F) to Celsius (°C)", category: "temperature", from: "°F", to: "°C", formula: "°C = (°F - 32) × 5/9" },

  // Weight
  { id: "kg_to_lb", name: "Kilograms (kg) to Pounds (lb)", category: "weight", from: "kg", to: "lb", formula: "lb = kg × 2.204622" },
  { id: "lb_to_kg", name: "Pounds (lb) to Kilograms (kg)", category: "weight", from: "lb", to: "kg", formula: "kg = lb * 0.453592" },

  // Fluid
  { id: "ml_to_oz", name: "Milliliters (mL) to Fluid Ounces (fl oz)", category: "fluid", from: "mL", to: "oz", formula: "oz = mL × 0.033814" },
  { id: "oz_to_ml", name: "Fluid Ounces (fl oz) to Milliliters (mL)", category: "fluid", from: "oz", to: "mL", formula: "mL = oz / 0.033814" },
  { id: "liters_to_oz", name: "Liters (L) to Fluid Ounces (fl oz)", category: "fluid", from: "L", to: "oz", formula: "oz = L × 33.814" },
  { id: "oz_to_liters", name: "Fluid Ounces (fl oz) to Liters (L)", category: "fluid", from: "oz", to: "L", formula: "L = oz / 33.814" },

  // Sodium
  { id: "sodium_mg_l_to_mg_bottle", name: "Sodium (mg/L) to mg/Bottle", category: "fluid", from: "mg/L", to: "mg/bottle", formula: "mg/bottle = mg/L × BottleLiters" },
  { id: "sodium_mg_bottle_to_mg_l", name: "Sodium mg/Bottle to mg/L", category: "fluid", from: "mg/bottle", to: "mg/L", formula: "mg/L = mg/bottle / BottleLiters" },

  // VO2 / MET
  { id: "vo2_to_met", name: "VO2 (mL/kg/min) to METs", category: "metabolic_power", from: "mL/kg/min", to: "METs", formula: "METs = VO2 / 3.5" },
  { id: "met_to_vo2", name: "METs to VO2 (mL/kg/min)", category: "metabolic_power", from: "METs", to: "mL/kg/min", formula: "VO2 = METs × 3.5" },

  // Calories
  { id: "met_to_calories", name: "METs + Body Mass to Est Calories/Hour", category: "metabolic_power", from: "MET-hr", to: "kcal", formula: "kcal = METs × Weight (kg) × Duration (hr)" },

  // Grade
  { id: "grade_percent_to_decimal", name: "Grade Percentage (%) to Decimal", category: "elevation_grade", from: "%", to: "decimal", formula: "decimal = % / 100" },
  { id: "grade_decimal_to_percent", name: "Grade Decimal to Percentage (%)", category: "elevation_grade", from: "decimal", to: "%", formula: "% = decimal × 100" },

  // Power
  { id: "watts_to_wkg", name: "Watts (W) to Watts/kg (W/kg)", category: "metabolic_power", from: "W", to: "W/kg", formula: "W/kg = W / BodyMass" },
  { id: "wkg_to_watts", name: "Watts/kg (W/kg) to Watts (W)", category: "metabolic_power", from: "W/kg", to: "W", formula: "W = W/kg × BodyMass" },

  // Cadence
  { id: "spm_to_steps_hr", name: "Steps/Min (spm) to Steps/Hour", category: "cadence", from: "spm", to: "steps/hr", formula: "steps/hr = spm × 60" },
  { id: "cadence_to_duration", name: "Cadence (spm) to Step Duration (secs/step)", category: "cadence", from: "spm", to: "secs/step", formula: "seconds = 60 / Cadence" },

  // Elevation
  { id: "gain_km_to_mile", name: "Elevation Gain/km to Gain/mile", category: "elevation_grade", from: "gain/km", to: "gain/mi", formula: "gain/mi = gain/km × 1.609344" },
  { id: "gain_mile_to_km", name: "Elevation Gain/mile to Gain/km", category: "elevation_grade", from: "gain/mi", to: "gain/km", formula: "gain/km = gain/mi / 1.609344" }
];

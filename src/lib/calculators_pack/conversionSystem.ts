// Running and sport science unit conversion system equations.
// Direct exact conversions vs estimate models for MET and Calories.

// Distance Conversions
export function kmToMiles(km: number): number {
  return km * 0.621371192237334;
}

export function milesToKm(miles: number): number {
  return miles * 1.609344;
}

export function metersToFeet(meters: number): number {
  return meters * 3.280839895;
}

export function feetToMeters(feet: number): number {
  return feet / 3.280839895;
}

export function yardsToMeters(yards: number): number {
  return yards * 0.9144;
}

export function metersToYards(meters: number): number {
  return meters / 0.9144;
}

// Pace / Speed Conversions
export function minKmToMinMile(secondsPerKm: number): number {
  return secondsPerKm * 1.609344;
}

export function minMileToMinKm(secondsPerMile: number): number {
  return secondsPerMile / 1.609344;
}

export function kmhToMph(kmh: number): number {
  return kmh * 0.621371192237334;
}

export function mphToKmh(mph: number): number {
  return mph * 1.609344;
}

export function msToKmh(ms: number): number {
  return ms * 3.6;
}

export function kmhToMs(kmh: number): number {
  return kmh / 3.6;
}

export function paceToSpeed(paceSecsPerKm: number): number {
  if (paceSecsPerKm <= 0) return 0;
  return 3600 / paceSecsPerKm;
}

export function speedToPace(speedKmh: number): number {
  if (speedKmh <= 0) return 0;
  return 3600 / speedKmh;
}

// Temperature Conversions
export function celsiusToFahrenheit(c: number): number {
  return (c * 9 / 5) + 32;
}

export function fahrenheitToCelsius(f: number): number {
  return (f - 32) * 5 / 9;
}

// Weight Conversions
export function kgToLb(kg: number): number {
  return kg * 2.20462262185;
}

export function lbToKg(lb: number): number {
  return lb * 0.45359237;
}

// Fluid Conversions
export function mlToFlOz(ml: number): number {
  return ml * 0.0338140227;
}

export function flOzToMl(flOz: number): number {
  return flOz / 0.0338140227;
}

export function litersToOz(liters: number): number {
  return liters * 33.8140227;
}

export function ozToLiters(flOz: number): number {
  return flOz / 33.8140227;
}

// Sodium Conversions
export function sodiumMgPerLiterToMgPerBottle(mgPerLiter: number, bottleLiters: number): number {
  if (isNaN(mgPerLiter) || isNaN(bottleLiters) || bottleLiters < 0) return 0;
  return mgPerLiter * bottleLiters;
}

export function sodiumMgPerBottleToMgPerLiter(mgPerBottle: number, bottleLiters: number): number {
  if (isNaN(mgPerBottle) || isNaN(bottleLiters) || bottleLiters <= 0) return 0;
  return mgPerBottle / bottleLiters;
}

// VO2 / MET Conversions
export function vo2ToMET(vo2: number): number {
  return vo2 / 3.5;
}

export function metToVO2(met: number): number {
  return met * 3.5;
}

// Calories Conversions
export function metToCalories(met: number, weightKg: number, durationHours: number): number {
  if (isNaN(met) || isNaN(weightKg) || isNaN(durationHours) || weightKg <= 0 || durationHours <= 0) return 0;
  // 1 MET = 1 kcal/kg/hour
  return met * weightKg * durationHours;
}

// Grade Conversions
export function gradePercentToDecimal(percent: number): number {
  return percent / 100;
}

export function gradeDecimalToPercent(decimal: number): number {
  return decimal * 100;
}

// Power Conversions
export function wattsToWattsPerKg(watts: number, kg: number): number {
  if (isNaN(watts) || isNaN(kg) || kg <= 0) return 0;
  return watts / kg;
}

export function wattsPerKgToWatts(wkg: number, kg: number): number {
  if (isNaN(wkg) || isNaN(kg) || kg <= 0) return 0;
  return wkg * kg;
}

// Cadence Conversions
export function stepsPerMinToStepsPerHour(spm: number): number {
  return spm * 60;
}

export function cadenceToStepDuration(cadence: number): number {
  if (cadence <= 0) return 0;
  return 60 / cadence; // duration of a single step in seconds
}

// Elevation Conversions
export function gainPerKmToGainPerMile(gainPerKm: number): number {
  return gainPerKm * 1.609344;
}

export function gainPerMileToGainPerKm(gainPerMile: number): number {
  return gainPerMile / 1.609344;
}

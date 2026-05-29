import { parseNonNegativeNumber, parsePositiveNumber } from "../validation/numbers";

/**
 * Standard Rothfusz regression formula to calculate Heat Index in Celsius
 */
export function calculateHeatIndexCelsius(temperatureC: number, relativeHumidity: number): number {
  const T = temperatureC * 1.8 + 32; // Convert to Fahrenheit
  const R = relativeHumidity;

  // Simple formula if heat index is expected to be under 80°F
  let hi = 0.5 * (T + 61.0 + ((T - 68.0) * 1.2) + (R * 0.094));

  if (hi >= 80) {
    // Full Rothfusz regression formula
    hi = -42.379 + 2.04901523 * T + 10.14333127 * R - 0.22475541 * T * R
         - 0.00683783 * T * T - 0.05481717 * R * R + 0.00122874 * T * T * R
         + 0.00085282 * T * R * R - 0.00000199 * T * T * R * R;

    // Adjustments
    if (R < 13 && T >= 80 && T <= 112) {
      const adj = ((13 - R) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
      hi -= adj;
    } else if (R > 85 && T >= 80 && T <= 87) {
      const adj = ((R - 85) / 10) * ((87 - T) / 5);
      hi += adj;
    }
  }

  // Convert back to Celsius
  return (hi - 32) / 1.8;
}

/**
 * Standard Magnus-Tetens approximation for dew point calculation
 */
export function calculateDewPointCelsius(temperatureC: number, relativeHumidity: number): number {
  const a = 17.27;
  const b = 237.7;
  const alpha = ((a * temperatureC) / (b + temperatureC)) + Math.log(relativeHumidity / 100);
  return (b * alpha) / (a - alpha);
}

export function calculateDewPointCategory(temperatureC: number, relativeHumidity: number) {
  const dp = calculateDewPointCelsius(temperatureC, relativeHumidity);
  let category = "Comfortable";
  let description = "Ideal, dry running conditions.";

  if (dp < 10) {
    category = "Dry & Crisp";
    description = "Very dry and highly comfortable heat dissipation.";
  } else if (dp < 13) {
    category = "Comfortable";
    description = "Extremely comfortable air feeling.";
  } else if (dp < 16) {
    category = "Pleasant / Mildly Humid";
    description = "Noticeable but manageable moisture in the air.";
  } else if (dp < 19) {
    category = "Humid / Sticky";
    description = "Sticky feeling; slightly hinders sweat evaporation.";
  } else if (dp < 22) {
    category = "Very Humid / Oppressive";
    description = "Sweat evaporation is slow; high discomfort on long runs.";
  } else {
    category = "Extremely Oppressive";
    description = "Extremely sticky and hazardous; consider treadmill or very easy paces.";
  }

  return { dewPoint: dp, category, description };
}

export function classifyHeatStress(temperatureC: number, relativeHumidity: number): {
  level: "low" | "moderate" | "high" | "very high" | "extreme";
  label: string;
} {
  const hi = calculateHeatIndexCelsius(temperatureC, relativeHumidity);
  
  if (hi < 27) {
    return { level: "low", label: "Low / Caution Free" };
  } else if (hi < 32) {
    return { level: "moderate", label: "Moderate Caution" };
  } else if (hi < 41) {
    return { level: "high", label: "High / Extreme Caution" };
  } else if (hi < 54) {
    return { level: "very high", label: "Very High / Danger" };
  } else {
    return { level: "extreme", label: "Extreme Danger / Severe Risk" };
  }
}

export function calculateHeatPaceCaution(basePaceSec: number, heatLevel: string): {
  adjustedPaceSec: number;
  pctIncrease: number;
  guidance: string;
} {
  let pctIncrease = 0;
  if (heatLevel === "moderate") pctIncrease = 3;
  else if (heatLevel === "high") pctIncrease = 7;
  else if (heatLevel === "very high") pctIncrease = 12;
  else if (heatLevel === "extreme") pctIncrease = 20;

  const adjustedPaceSec = basePaceSec * (1 + pctIncrease / 100);

  let guidance = "Safe running environment. Negligible cardiovascular drift.";
  if (pctIncrease > 0) {
    guidance = `Estimated demand is ${pctIncrease}% higher due to thermal stress. Suggested adjustment shifts target pace to keep aerobic effort constant. (Scenario estimate, not performance guarantee).`;
  }

  return { adjustedPaceSec, pctIncrease, guidance };
}

export function calculateHeatHydrationScenario(baseFluidPerHourMl: number, heatLevel: string): {
  adjustedFluidMl: number;
  multiplier: number;
  note: string;
} {
  let multiplier = 1.0;
  if (heatLevel === "moderate") multiplier = 1.15;
  else if (heatLevel === "high") multiplier = 1.30;
  else if (heatLevel === "very high") multiplier = 1.45;
  else if (heatLevel === "extreme") multiplier = 1.60;

  const adjustedFluidMl = baseFluidPerHourMl * multiplier;
  const note = `Suggested baseline simulation scenario: ${Math.round(adjustedFluidMl)} mL/hr (baseline multiplied by ${multiplier.toFixed(2)}x to offset sweat loss).`;

  return { adjustedFluidMl, multiplier, note };
}

export function calculateHeatSodiumScenario(baseSodiumPerHourMg: number, heatLevel: string): {
  adjustedSodiumMg: number;
  multiplier: number;
  note: string;
} {
  let multiplier = 1.0;
  if (heatLevel === "moderate") multiplier = 1.10;
  else if (heatLevel === "high") multiplier = 1.25;
  else if (heatLevel === "very high") multiplier = 1.40;
  else if (heatLevel === "extreme") multiplier = 1.50;

  const adjustedSodiumMg = baseSodiumPerHourMg * multiplier;
  const note = `Climatic simulation sodium reference: ${Math.round(adjustedSodiumMg)} mg/hr to adjust for salt concentration sweat loss.`;

  return { adjustedSodiumMg, multiplier, note };
}

export function calculateAltitudeVO2Reduction(altitudeMeters: number): {
  vo2ReductionPct: number;
  note: string;
} {
  const reduction = altitudeMeters <= 700 ? 0 : 0.006 * (altitudeMeters - 700); // 0.6% reduction per 100m above 700m
  const vo2ReductionPct = Math.min(30, Math.max(0, reduction)); // clamp to 30% max

  let note = "Negligible VO2max modification under 700m elevation.";
  if (vo2ReductionPct > 0) {
    note = `Estimating a mathematical decrease of around ${vo2ReductionPct.toFixed(1)}% in aerobic capacity based on effective oxygen pressure. (Environmental estimate only. Individual response varies).`;
  }

  return { vo2ReductionPct, note };
}

export function classifyAltitude(altitudeMeters: number): string {
  if (altitudeMeters < 700) return "Sea Level / Low Altitude";
  if (altitudeMeters < 1500) return "Moderate Altitude";
  if (altitudeMeters < 3000) return "High Altitude";
  return "Very High / Extreme Altitude";
}

export function calculateWindChillCelsius(temperatureC: number, windKmh: number): number | null {
  // Standard wind chill formula works when temperature <= 10°C and wind >= 4.8 km/h
  if (temperatureC <= 10 && windKmh >= 4.8) {
    const wc = 13.12 + 0.6215 * temperatureC - 11.37 * Math.pow(windKmh, 0.16) + 0.3965 * temperatureC * Math.pow(windKmh, 0.16);
    return wc;
  }
  return null;
}

export function classifyWindEffect(windSpeedKmh: number, windDirection: "headwind" | "tailwind" | "crosswind"): {
  note: string;
} {
  if (windSpeedKmh <= 0) return { note: "No noticeable wind effect." };
  
  if (windDirection === "headwind") {
    return { note: "Increases aerodynamic resistance. Consider scaling back pace target by 1-3% per 10 km/h wind speed to maintain equal RPE." };
  } else if (windDirection === "tailwind") {
    return { note: "Reduces aerodynamic resistance. May assist pace by roughly 0.5-1.5% per 10 km/h wind speed." };
  } else {
    return { note: "Increases lateral stabilization demand and air resistance. Keep arms compact and posture stable." };
  }
}

export function classifyAQI(aqi: number): {
  category: string;
  caution: string;
} {
  if (aqi <= 50) {
    return { category: "Good", caution: "Minimal risk. Great environment for peak workouts." };
  } else if (aqi <= 100) {
    return { category: "Moderate", caution: "Acceptable quality. Extremely sensitive individuals should monitor respiration." };
  } else if (aqi <= 150) {
    return { category: "Unhealthy for Sensitive Groups", caution: "General public is unlikely to be affected; sensitive groups should reduce intense outdoor work." };
  } else if (aqi <= 200) {
    return { category: "Unhealthy", caution: "Everyone may begin to feel effects. Sensitive runners should consider indoor treadmill sessions." };
  } else if (aqi <= 300) {
    return { category: "Very Unhealthy", caution: "Active individuals should avoid intense outdoor exertion; shift workouts indoors." };
  } else {
    return { category: "Hazardous", caution: "Health warning of emergency conditions. Outdoor efforts must be canceled." };
  }
}

export function classifySurface(surfaceType: string): string {
  const mapped: Record<string, string> = {
    road: "Firm, highly repeatable surface. Lowest rolling resistance, optimal for raw pace maintenance.",
    track: "Elastic and predictable. Near-zero surface-slip loss, extremely consistent pacing stride.",
    trail: "Uneven and technical. Increases stabilization muscular effort, requiring shorter stride length and focusing on RPE rather than raw pace.",
    treadmill: "Perfectly flat and linear, with moving belt support. Low muscular stabilization demand and zero air resistance.",
    grass: "Soft and energy-absorbing. Substantially increases stride work, with 5-10% higher energetic effort depending on turf height.",
    gravel: "Loose rolling surface. Medium stabilization requirements, with slight slip-loss, causing around 2-4% additional mechanical effort.",
    wetroad: "Reduced surface friction. Take caution on sharp corners; braking and linear push-off traction are slightly compromised.",
    mud: "Highly unstable and sticky. Extreme mechanical slip-loss. Energetic cost can increase by 20-40%; focus completely on effort and footing.",
    sand: "Extreme energy absorption. Stride push-off is highly inefficient, requiring up to 1.5x - 2x the normal effort of flat asphalt running."
  };
  return mapped[surfaceType.toLowerCase().replace(/\s+/g, '')] || "Standard outdoor surface. Keep posture tall and maintain visual scanning of terrain.";
}

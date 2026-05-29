'use client';

import { useState, useEffect } from 'react';
import { Input, Label, Select } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { CalculatorPageShell } from '@/components/calculator/CalculatorPageShell';
import { ManualInputPanel } from '@/components/calculator/ManualInputPanel';
import { ExportPanel } from '@/components/calculator/CalculatorSystem';
import { resultToText } from '@/lib/export/manualExport';
import { CalculatorResult } from '@/types';
import {
  kmToMiles,
  milesToKm,
  metersToFeet,
  feetToMeters,
  yardsToMeters,
  metersToYards,
  minKmToMinMile,
  minMileToMinKm,
  kmhToMph,
  mphToKmh,
  msToKmh,
  kmhToMs,
  paceToSpeed,
  speedToPace,
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  kgToLb,
  lbToKg,
  mlToFlOz,
  flOzToMl,
  litersToOz,
  ozToLiters,
  sodiumMgPerLiterToMgPerBottle,
  sodiumMgPerBottleToMgPerLiter,
  vo2ToMET,
  metToVO2,
  metToCalories,
  gradePercentToDecimal,
  gradeDecimalToPercent,
  wattsToWattsPerKg,
  wattsPerKgToWatts,
  stepsPerMinToStepsPerHour,
  cadenceToStepDuration,
  gainPerKmToGainPerMile,
  gainPerMileToGainPerKm
} from '@/lib/calculators_pack/conversionSystem';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

// Pace format utility helpers
function parsePaceToSeconds(paceStr: string): number | null {
  if (!paceStr) return null;
  const clean = paceStr.trim();
  if (clean.includes(':')) {
    const parts = clean.split(':').map(Number);
    if (parts.some(isNaN)) return null;
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return null;
  }
  const num = Number(clean);
  if (!isNaN(num) && num > 0) return num * 60; // assume minutes
  return null;
}

function formatSecondsToPace(totalSecs: number): string {
  if (isNaN(totalSecs) || totalSecs <= 0) return "0:00";
  const m = Math.floor(totalSecs / 60);
  const s = Math.round(totalSecs % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export default function ConversionLabPage() {
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick');
  
  // Category state
  const [category, setCategory] = useState<'distance' | 'pace_speed' | 'temperature' | 'weight' | 'fluid' | 'metabolic_power' | 'elevation_grade' | 'cadence'>('distance');
  // Type state
  const [type, setType] = useState('km_to_miles');
  // Input standard value
  const [val, setVal] = useState('10');
  
  // Secondary inputs
  const [weight, setWeight] = useState('70');
  const [duration, setDuration] = useState('1.0');
  const [bottleLiters, setBottleLiters] = useState('0.5');

  const [result, setResult] = useState<CalculatorResult<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setCategory('distance');
    setType('km_to_miles');
    setVal('10');
    setWeight('70');
    setDuration('1.0');
    setBottleLiters('0.5');
    setResult(null);
    setError(null);
  };

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    let fromUnit = '';
    let toUnit = '';
    let formula = '';
    let steps: string[] = [];
    
    let resRaw = 0;
    let isPaceType = type === 'min_km_to_min_mile' || type === 'min_mile_to_min_km' || type === 'speed_to_pace';

    // Parse main input
    let vNum = 0;
    if (isPaceType) {
      const paceSecs = parsePaceToSeconds(val);
      if (paceSecs === null) return setError('Please enter a valid pace string (e.g. 5:00 or 5.0).');
      vNum = paceSecs;
    } else {
      vNum = parseFloat(val);
      if (isNaN(vNum)) return setError('Please enter a valid numeric value.');
    }

    const wt = parseFloat(weight);
    const dur = parseFloat(duration);
    const bL = parseFloat(bottleLiters);

    // Run specific conversions
    switch (type) {
      // Distance
      case 'km_to_miles':
        resRaw = kmToMiles(vNum);
        fromUnit = 'km'; toUnit = 'mi';
        formula = 'mi = km × 0.621371';
        steps.push(`${vNum} Kilometers multiplied by conversion factor 0.62137119 = ${resRaw.toFixed(4)} mi`);
        break;
      case 'miles_to_km':
        resRaw = milesToKm(vNum);
        fromUnit = 'mi'; toUnit = 'km';
        formula = 'km = mi × 1.609344';
        steps.push(`${vNum} Miles multiplied by exact physical factor 1.609344 = ${resRaw.toFixed(4)} km`);
        break;
      case 'meters_to_feet':
        resRaw = metersToFeet(vNum);
        fromUnit = 'm'; toUnit = 'ft';
        formula = 'ft = m × 3.28084';
        steps.push(`${vNum} Meters multiplied by 3.280839895 = ${resRaw.toFixed(4)} ft`);
        break;
      case 'feet_to_meters':
        resRaw = feetToMeters(vNum);
        fromUnit = 'ft'; toUnit = 'm';
        formula = 'm = ft / 3.28084';
        steps.push(`${vNum} Feet divided by 3.28083989 = ${resRaw.toFixed(4)} m`);
        break;
      case 'yards_to_meters':
        resRaw = yardsToMeters(vNum);
        fromUnit = 'yd'; toUnit = 'm';
        formula = 'm = yd × 0.9144';
        steps.push(`${vNum} Yards multiplied by exact athletic standard 0.9144 = ${resRaw.toFixed(4)} m`);
        break;
      case 'meters_to_yards':
        resRaw = metersToYards(vNum);
        fromUnit = 'm'; toUnit = 'yd';
        formula = 'yd = m / 0.9144';
        steps.push(`${vNum} Meters divided by 0.9144 = ${resRaw.toFixed(4)} yd`);
        break;

      // Pace / Speed
      case 'min_km_to_min_mile':
        resRaw = minKmToMinMile(vNum); // returns seconds/mi
        fromUnit = '/km'; toUnit = '/mi';
        formula = 'Pace(/mi) = Pace(/km) × 1.609344';
        steps.push(`Input pace: ${formatSecondsToPace(vNum)} mins/km (${vNum} seconds/km)`);
        steps.push(`Convert pace to seconds per mile: ${vNum} * 1.609344 = ${resRaw.toFixed(2)} seconds/mile`);
        steps.push(`Result in clock format: ${formatSecondsToPace(resRaw)} min/mile`);
        break;
      case 'min_mile_to_min_km':
        resRaw = minMileToMinKm(vNum);
        fromUnit = '/mi'; toUnit = '/km';
        formula = 'Pace(/km) = Pace(/mi) / 1.609344';
        steps.push(`Input pace: ${formatSecondsToPace(vNum)} mins/mile (${vNum} seconds/mile)`);
        steps.push(`Convert pace to seconds per kilometer: ${vNum} / 1.609344 = ${resRaw.toFixed(2)} seconds/km`);
        steps.push(`Result in clock format: ${formatSecondsToPace(resRaw)} min/km`);
        break;
      case 'kmh_to_mph':
        resRaw = kmhToMph(vNum);
        fromUnit = 'km/h'; toUnit = 'mph';
        formula = 'mph = km/h × 0.621371';
        steps.push(`${vNum} km/h multiplied by 0.62137119 = ${resRaw.toFixed(4)} mph`);
        break;
      case 'mph_to_kmh':
        resRaw = mphToKmh(vNum);
        fromUnit = 'mph'; toUnit = 'km/h';
        formula = 'km/h = mph × 1.609344';
        steps.push(`${vNum} mph multiplied by 1.609344 = ${resRaw.toFixed(4)} km/h`);
        break;
      case 'ms_to_kmh':
        resRaw = msToKmh(vNum);
        fromUnit = 'm/s'; toUnit = 'km/h';
        formula = 'km/h = m/s × 3.6';
        steps.push(`${vNum} meters per second multiplied by aerodynamic scalar 3.6 = ${resRaw.toFixed(4)} km/h`);
        break;
      case 'kmh_to_ms':
        resRaw = kmhToMs(vNum);
        fromUnit = 'km/h'; toUnit = 'm/s';
        formula = 'm/s = km/h / 3.6';
        steps.push(`${vNum} km/h divided by 3.6 = ${resRaw.toFixed(4)} m/s`);
        break;
      case 'pace_to_speed':
        // input: min/km speed in seconds
        resRaw = paceToSpeed(vNum);
        fromUnit = 'min/km'; toUnit = 'km/h';
        formula = 'km/h = 3600 / PaceSeconds';
        steps.push(`Input pace: ${formatSecondsToPace(vNum)} min/km (${vNum} seconds/km)`);
        steps.push(`Calculated aerodynamic speed: 3600 / ${vNum} = ${resRaw.toFixed(4)} km/h`);
        break;
      case 'speed_to_pace':
        resRaw = speedToPace(vNum); // returns seconds/km
        fromUnit = 'km/h'; toUnit = 'min/km';
        formula = 'PaceSeconds = 3600 / Speed';
        steps.push(`Input speed: ${vNum} km/h`);
        steps.push(`Pace seconds per km: 3600 / ${vNum} = ${resRaw.toFixed(2)} seconds/km`);
        steps.push(`Result in clock format: ${formatSecondsToPace(resRaw)} min/km`);
        break;

      // Temperature
      case 'celsius_to_fahrenheit':
        resRaw = celsiusToFahrenheit(vNum);
        fromUnit = '°C'; toUnit = '°F';
        formula = '°F = (°C × 9/5) + 32';
        steps.push(`(${vNum} * 1.8) + 32 = ${resRaw.toFixed(1)} °F`);
        break;
      case 'fahrenheit_to_celsius':
        resRaw = fahrenheitToCelsius(vNum);
        fromUnit = '°F'; toUnit = '°C';
        formula = '°C = (°F - 32) × 5/9';
        steps.push(`(${vNum} - 32) * 0.55555 = ${resRaw.toFixed(1)} °C`);
        break;

      // Weight
      case 'kg_to_lb':
        resRaw = kgToLb(vNum);
        fromUnit = 'kg'; toUnit = 'lb';
        formula = 'lb = kg × 2.20462';
        steps.push(`${vNum} Kilograms multiplied by mass translation factor 2.204622 = ${resRaw.toFixed(3)} lb`);
        break;
      case 'lb_to_kg':
        resRaw = lbToKg(vNum);
        fromUnit = 'lb'; toUnit = 'kg';
        formula = 'kg = lb * 0.453592';
        steps.push(`${vNum} Pounds multiplied by 0.45359237 = ${resRaw.toFixed(3)} kg`);
        break;

      // Fluid
      case 'ml_to_oz':
        resRaw = mlToFlOz(vNum);
        fromUnit = 'mL'; toUnit = 'fl oz';
        formula = 'fl oz = mL × 0.033814';
        steps.push(`${vNum} mL multiplied by fluid ounce density scalar 0.033814 = ${resRaw.toFixed(3)} fl oz`);
        break;
      case 'oz_to_ml':
        resRaw = flOzToMl(vNum);
        fromUnit = 'fl oz'; toUnit = 'mL';
        formula = 'mL = fl oz / 0.033814';
        steps.push(`${vNum} fl oz divided by 0.033814 = ${resRaw.toFixed(1)} mL`);
        break;
      case 'liters_to_oz':
        resRaw = litersToOz(vNum);
        fromUnit = 'L'; toUnit = 'fl oz';
        formula = 'fl oz = L × 33.814';
        steps.push(`${vNum} Liters multiplied by 33.814 = ${resRaw.toFixed(2)} fl oz`);
        break;
      case 'oz_to_liters':
        resRaw = ozToLiters(vNum);
        fromUnit = 'fl oz'; toUnit = 'L';
        formula = 'L = fl oz / 33.814';
        steps.push(`${vNum} fl oz divided by 33.814 = ${resRaw.toFixed(4)} L`);
        break;
      case 'sodium_mg_l_to_mg_bottle':
        if (isNaN(bL) || bL <= 0) return setError('Valid bottle size (Liters) is required.');
        resRaw = sodiumMgPerLiterToMgPerBottle(vNum, bL);
        fromUnit = 'mg/L'; toUnit = 'mg';
        formula = 'mg/bottle = mg/L × BottleLiters';
        steps.push(`Sodium content: ${vNum} mg/L`);
        steps.push(`Multiplied by bottle volume ${bL} Liters = ${resRaw.toFixed(1)} mg sodium in bottle`);
        break;
      case 'sodium_mg_bottle_to_mg_l':
        if (isNaN(bL) || bL <= 0) return setError('Valid bottle size (Liters) is required.');
        resRaw = sodiumMgPerBottleToMgPerLiter(vNum, bL);
        fromUnit = 'mg/bottle'; toUnit = 'mg/L';
        formula = 'mg/L = mg/bottle / BottleLiters';
        steps.push(`Sodium in bottle: ${vNum} mg`);
        steps.push(`Divided by bottle volume ${bL} Liters = ${resRaw.toFixed(1)} mg/L concentration`);
        break;

      // VO2 / METs
      case 'vo2_to_met':
        resRaw = vo2ToMET(vNum);
        fromUnit = 'mL/kg/min'; toUnit = 'METs';
        formula = 'METs = VO2 / 3.5';
        steps.push(`${vNum} units of VO2 divided by standard rest rate 3.5 mL/kg/min = ${resRaw.toFixed(2)} METs`);
        break;
      case 'met_to_vo2':
        resRaw = metToVO2(vNum);
        fromUnit = 'METs'; toUnit = 'mL/kg/min';
        formula = 'VO2 = METs × 3.5';
        steps.push(`${vNum} METs multiplied by oxygen consumption index 3.5 = ${resRaw.toFixed(1)} mL/kg/min`);
        break;
      case 'met_to_calories':
        if (isNaN(wt) || wt <= 0 || isNaN(dur) || dur <= 0) {
          return setError('Valid body mass (kg) and duration (hours) are required for MET to Calorimetry.');
        }
        resRaw = metToCalories(vNum, wt, dur);
        fromUnit = 'METs'; toUnit = 'kcal';
        formula = 'kcal = METs × Weight (kg) × Duration (hr)';
        steps.push(`Metabolic equivalent level: ${vNum} METs`);
        steps.push(`Formulated estimate: ${vNum} METs × ${wt} kg weight × ${dur} hours dur = ${resRaw.toFixed(1)} kcal`);
        break;
      case 'watts_to_wkg':
        if (isNaN(wt) || wt <= 0) return setError('Valid body weight (kg) is required.');
        resRaw = wattsToWattsPerKg(vNum, wt);
        fromUnit = 'W'; toUnit = 'W/kg';
        formula = 'W/kg = W / BodyMass';
        steps.push(`${vNum} Watts divided by weight ${wt} kg = ${resRaw.toFixed(2)} W/kg`);
        break;
      case 'wkg_to_watts':
        if (isNaN(wt) || wt <= 0) return setError('Valid body weight (kg) is required.');
        resRaw = wattsPerKgToWatts(vNum, wt);
        fromUnit = 'W/kg'; toUnit = 'W';
        formula = 'W = W/kg × BodyMass';
        steps.push(`${vNum} W/kg multiplied by weight ${wt} kg = ${resRaw.toFixed(1)} W`);
        break;

      // Grade
      case 'grade_percent_to_decimal':
        resRaw = gradePercentToDecimal(vNum);
        fromUnit = '%'; toUnit = 'decimal';
        formula = 'decimal = % / 100';
        steps.push(`${vNum}% divided by 100 = ${resRaw.toFixed(4)} decimal grade format`);
        break;
      case 'grade_decimal_to_percent':
        resRaw = gradeDecimalToPercent(vNum);
        fromUnit = 'decimal'; toUnit = '%';
        formula = '% = decimal × 100';
        steps.push(`${vNum} decimal grade multiplied by 100 = ${resRaw.toFixed(1)}% incline`);
        break;

      // Cadence
      case 'spm_to_steps_hr':
        resRaw = stepsPerMinToStepsPerHour(vNum);
        fromUnit = 'spm'; toUnit = 'steps/hr';
        formula = 'steps/hr = spm × 60';
        steps.push(`${vNum} steps per minute multiplied by 60 minutes = ${resRaw.toFixed(0)} steps per hour`);
        break;
      case 'cadence_to_duration':
        resRaw = cadenceToStepDuration(vNum);
        fromUnit = 'spm'; toUnit = 'secs/step';
        formula = 'duration = 60 / Cadence';
        steps.push(`Single step impact cycle: 60 / ${vNum} steps/min = ${resRaw.toFixed(4)} seconds/step`);
        break;

      // Elevation
      case 'gain_km_to_mile':
        resRaw = gainPerKmToGainPerMile(vNum);
        fromUnit = 'm/km'; toUnit = 'm/mi';
        formula = 'm/mi = m/km × 1.609344';
        steps.push(`${vNum} meters of gain per km multiplied by 1.609344 = ${resRaw.toFixed(2)} meters/mile`);
        break;
      case 'gain_mile_to_km':
        resRaw = gainPerMileToGainPerKm(vNum);
        fromUnit = 'm/mi'; toUnit = 'm/km';
        formula = 'm/km = m/mi / 1.609344';
        steps.push(`${vNum} meters of gain per mile divided by 1.609344 = ${resRaw.toFixed(2)} meters/km`);
        break;

      default:
        return setError('Selected conversion type is currently unmapped.');
    }

    // Build the visual string of converted result with correct units
    const formattedResultText = isPaceType ? formatSecondsToPace(resRaw) : Number(resRaw.toFixed(3)).toString();

    // Build Benchmarks Scale List & Chart Data for Visual Comparison (20%, 50%, 100%, 150%, 200%)
    const multipliers = [0.2, 0.5, 1.0, 1.5, 2.0];
    const vizData = multipliers.map(m => {
      const parentVal = vNum * m;
      let convertedValue = 0;
      
      // Perform matching mapping of scalar
      switch (type) {
        case 'km_to_miles': convertedValue = kmToMiles(parentVal); break;
        case 'miles_to_km': convertedValue = milesToKm(parentVal); break;
        case 'meters_to_feet': convertedValue = metersToFeet(parentVal); break;
        case 'feet_to_meters': convertedValue = feetToMeters(parentVal); break;
        case 'yards_to_meters': convertedValue = yardsToMeters(parentVal); break;
        case 'meters_to_yards': convertedValue = metersToYards(parentVal); break;
        case 'min_km_to_min_mile': convertedValue = minKmToMinMile(parentVal); break;
        case 'min_mile_to_min_km': convertedValue = minMileToMinKm(parentVal); break;
        case 'kmh_to_mph': convertedValue = kmhToMph(parentVal); break;
        case 'mph_to_kmh': convertedValue = mphToKmh(parentVal); break;
        case 'ms_to_kmh': convertedValue = msToKmh(parentVal); break;
        case 'kmh_to_ms': convertedValue = kmhToMs(parentVal); break;
        case 'pace_to_speed': convertedValue = paceToSpeed(parentVal); break;
        case 'speed_to_pace': convertedValue = speedToPace(parentVal); break;
        case 'celsius_to_fahrenheit': convertedValue = celsiusToFahrenheit(parentVal); break;
        case 'fahrenheit_to_celsius': convertedValue = fahrenheitToCelsius(parentVal); break;
        case 'kg_to_lb': convertedValue = kgToLb(parentVal); break;
        case 'lb_to_kg': convertedValue = lbToKg(parentVal); break;
        case 'ml_to_oz': convertedValue = mlToFlOz(parentVal); break;
        case 'oz_to_ml': convertedValue = flOzToMl(parentVal); break;
        case 'liters_to_oz': convertedValue = litersToOz(parentVal); break;
        case 'oz_to_liters': convertedValue = ozToLiters(parentVal); break;
        case 'sodium_mg_l_to_mg_bottle': convertedValue = sodiumMgPerLiterToMgPerBottle(parentVal, bL); break;
        case 'sodium_mg_bottle_to_mg_l': convertedValue = sodiumMgPerBottleToMgPerLiter(parentVal, bL); break;
        case 'vo2_to_met': convertedValue = vo2ToMET(parentVal); break;
        case 'met_to_vo2': convertedValue = metToVO2(parentVal); break;
        case 'met_to_calories': convertedValue = metToCalories(parentVal, wt, dur); break;
        case 'watts_to_wkg': convertedValue = wattsToWattsPerKg(parentVal, wt); break;
        case 'wkg_to_watts': convertedValue = wattsPerKgToWatts(parentVal, wt); break;
        case 'grade_percent_to_decimal': convertedValue = gradePercentToDecimal(parentVal); break;
        case 'grade_decimal_to_percent': convertedValue = gradeDecimalToPercent(parentVal); break;
        case 'spm_to_steps_hr': convertedValue = stepsPerMinToStepsPerHour(parentVal); break;
        case 'cadence_to_duration': convertedValue = cadenceToStepDuration(parentVal); break;
        case 'gain_km_to_mile': convertedValue = gainPerKmToGainPerMile(parentVal); break;
        case 'gain_mile_to_km': convertedValue = gainPerMileToGainPerKm(parentVal); break;
        default: convertedValue = 0;
      }

      // Format for charts (if pace seconds, represent as decimal minutes for easier chart scales)
      return {
        label: `${Math.round(m * 100)}%`,
        Original: parseFloat((isPaceType ? parentVal / 60 : parentVal).toFixed(2)),
        Converted: parseFloat((isPaceType ? convertedValue / 60 : convertedValue).toFixed(2)),
        origRaw: isPaceType ? formatSecondsToPace(parentVal) : parentVal.toFixed(2),
        convRaw: isPaceType ? formatSecondsToPace(convertedValue) : convertedValue.toFixed(2)
      };
    });

    setResult({
      result: (
        <div className="flex flex-col gap-6">
          {/* Main Visual Conversion Output */}
          <div className="flex flex-col items-center p-6 bg-card border-2 border-border-heavy rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
             <span className="text-muted-foreground text-[10px] mb-1 tracking-widest block uppercase font-bold text-center">
               Converted Result ({toUnit})
             </span>
             <span className="font-display text-5xl font-black text-foreground tracking-tight block text-center select-all">
               {formattedResultText}
             </span>
             <span className="text-zinc-500 font-mono text-[10px] block mt-2 text-center font-bold">
               {isPaceType ? formatSecondsToPace(vNum) : vNum} {fromUnit} = {formattedResultText} {toUnit}
             </span>
          </div>

          {/* Benchmark Table list */}
          <div className="border-2 border-border-heavy bg-white p-4 rounded-xl shadow-[1px_1px_0px_rgba(23,23,23,1)]">
            <span className="text-muted-foreground text-[10px] tracking-widest block uppercase font-bold mb-3">
              Scale mapping references
            </span>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-border-heavy font-bold text-[10px] text-muted-foreground">
                    <th className="py-2">Ratio</th>
                    <th className="py-2">Original ({fromUnit})</th>
                    <th className="py-2 text-right">Converted ({toUnit})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {vizData.map((d, idx) => (
                    <tr key={idx} className={d.label === "100%" ? "bg-blue-50/50 font-bold" : ""}>
                      <td className="py-2 text-zinc-500 font-mono">{d.label}</td>
                      <td className="py-2 text-foreground font-mono">{d.origRaw}</td>
                      <td className="py-2 text-foreground font-mono text-right">{d.convRaw}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Recharts chart representation */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vizData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 9, fontWeight: "bold" }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip wrapperStyle={{ fontSize: 10 }} />
                  <Legend wrapperStyle={{ fontSize: 9 }} />
                  <Bar dataKey="Original" fill="#52525b" name={`${fromUnit} ${isPaceType ? '(mins)' : ''}`} radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Converted" fill="#2563eb" name={`${toUnit} ${isPaceType ? '(mins)' : ''}`} radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Step-by-Step Substations trace */}
          <div className="p-3 border-2 border-border-heavy bg-zinc-50 dark:bg-zinc-900 rounded-lg">
            <span className="font-mono font-bold text-[10px] uppercase tracking-wider text-zinc-400 block mb-2">
              Formula trace & evaluation substitutions:
            </span>
            <div className="font-mono text-[10px] leading-relaxed text-zinc-600 dark:text-zinc-400 space-y-1">
              {steps.map((line, idx) => (
                <div key={idx}>{line}</div>
              ))}
            </div>
          </div>
        </div>
      ),
      methodSelected: `Systematic Conversion (${type.replace(/_/g, " ")})`,
      confidenceLabel: 'Exact Mechanical Factor',
      formulaUsed: formula,
      inputUsed: {
        value: val,
        category,
        type,
        weight: weight || 'N/A',
        duration: duration || 'N/A',
        bottleLiters: bottleLiters || 'N/A'
      },
      limitations: 'Direct physical formula mappings.'
    });
  };

  return (
    <CalculatorPageShell title="Conversion Lab" subtitle="Convert physical running, sport-science, fluid, and metabolic units.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <ManualInputPanel
          mode={mode}
          setMode={setMode}
          supportsAdvanced={false}
          onCalculate={handleCalculate}
          onReset={handleReset}
          error={error}
        >
          {/* Category Selector */}
          <div>
            <Label htmlFor="category">1. Select Conversion Category</Label>
            <Select id="category" value={category} onChange={e => {
              const cat = e.target.value as any;
              setCategory(cat);
              if (cat === 'distance') setType('km_to_miles');
              else if (cat === 'pace_speed') setType('min_km_to_min_mile');
              else if (cat === 'temperature') setType('celsius_to_fahrenheit');
              else if (cat === 'weight') setType('kg_to_lb');
              else if (cat === 'fluid') setType('ml_to_oz');
              else if (cat === 'metabolic_power') setType('vo2_to_met');
              else if (cat === 'elevation_grade') setType('grade_percent_to_decimal');
              else if (cat === 'cadence') setType('spm_to_steps_hr');
            }}>
              <option value="distance">Distance Metrics</option>
              <option value="pace_speed">Pace & Aerodynamic Speed</option>
              <option value="temperature">Ambient Temperature</option>
              <option value="weight">Body Mass & Weight</option>
              <option value="fluid">Fluid & Hydration Volumes</option>
              <option value="metabolic_power">Metabolic (VO2, METs, Watts)</option>
              <option value="elevation_grade">Elevation Gain & Incline Grade</option>
              <option value="cadence">Cadence & Steps Metrics</option>
            </Select>
          </div>

          {/* Type Selector (Dynamic options based on Category) */}
          <div>
            <Label htmlFor="type">2. Select Specific Unit Equations</Label>
            <Select id="type" value={type} onChange={e => setType(e.target.value)}>
              {category === 'distance' && (
                <>
                  <option value="km_to_miles">Kilometers to Miles</option>
                  <option value="miles_to_km">Miles to Kilometers</option>
                  <option value="meters_to_feet">Meters to Feet</option>
                  <option value="feet_to_meters">Feet to Meters</option>
                  <option value="yards_to_meters">Yards to Meters</option>
                  <option value="meters_to_yards">Meters to Yards</option>
                </>
              )}
              {category === 'pace_speed' && (
                <>
                  <option value="min_km_to_min_mile">Min/km to Min/mile Pace</option>
                  <option value="min_mile_to_min_km">Min/mile to Min/km Pace</option>
                  <option value="kmh_to_mph">km/h to mph Speed</option>
                  <option value="mph_to_kmh">mph to km/h Speed</option>
                  <option value="ms_to_kmh">m/s to km/h Speed</option>
                  <option value="kmh_to_ms">km/h to m/s Speed</option>
                  <option value="pace_to_speed">Pace (min/km) to Speed (km/h)</option>
                  <option value="speed_to_pace">Speed (km/h) to Pace (min/km)</option>
                </>
              )}
              {category === 'temperature' && (
                <>
                  <option value="celsius_to_fahrenheit">Celsius (°C) to Fahrenheit (°F)</option>
                  <option value="fahrenheit_to_celsius">Fahrenheit (°F) to Celsius (°C)</option>
                </>
              )}
              {category === 'weight' && (
                <>
                  <option value="kg_to_lb">Kilograms (kg) to Pounds (lb)</option>
                  <option value="lb_to_kg">Pounds (lb) to Kilograms (kg)</option>
                </>
              )}
              {category === 'fluid' && (
                <>
                  <option value="ml_to_oz">Milliliters (mL) to Fluid Ounces (fl oz)</option>
                  <option value="oz_to_ml">Fluid Ounces (fl oz) to Milliliters (mL)</option>
                  <option value="liters_to_oz">Liters (L) to Fluid Ounces (fl oz)</option>
                  <option value="oz_to_liters">Fluid Ounces (fl oz) to Liters (L)</option>
                  <option value="sodium_mg_l_to_mg_bottle">Sodium concentration mg/L to mg/Bottle</option>
                  <option value="sodium_mg_bottle_to_mg_l">Sodium in bottle mg to mg/L concentration</option>
                </>
              )}
              {category === 'metabolic_power' && (
                <>
                  <option value="vo2_to_met">VO2 (mL/kg/min) to METs</option>
                  <option value="met_to_vo2">METs to VO2 (mL/kg/min)</option>
                  <option value="met_to_calories">METs + Body Mass to Est Calories/Hour</option>
                  <option value="watts_to_wkg">Watts (W) to Watts/kg (W/kg)</option>
                  <option value="wkg_to_watts">Watts/kg (W/kg) to Watts (W)</option>
                </>
              )}
              {category === 'elevation_grade' && (
                <>
                  <option value="grade_percent_to_decimal">Grade Percentage (%) to Decimal</option>
                  <option value="grade_decimal_to_percent">Grade Decimal to Percentage (%)</option>
                  <option value="gain_km_to_mile">Elevation Gain/km to Gain/mile</option>
                  <option value="gain_mile_to_km">Elevation Gain/mile to Gain/km</option>
                </>
              )}
              {category === 'cadence' && (
                <>
                  <option value="spm_to_steps_hr">Steps/Min (spm) to Steps/Hour</option>
                  <option value="cadence_to_duration">Cadence (spm) to Step Duration (secs/step)</option>
                </>
              )}
            </Select>
          </div>

          {/* Main numeric value input */}
          <div>
            <Label htmlFor="val">
              {type === 'min_km_to_min_mile' || type === 'min_mile_to_min_km' || type === 'pace_to_speed'
                ? "Enter Pace Value (MM:SS or minutes, e.g. 5:30)"
                : "Enter Numerical Value to Convert"}
            </Label>
            <Input
              id="val"
              type="text"
              value={val}
              onChange={e => setVal(e.target.value)}
              placeholder={type.includes('pace') ? "5:00" : "10"}
              required
            />
          </div>

          {/* Secondary Inputs based on the specific type */}
          {(type === 'watts_to_wkg' || type === 'wkg_to_watts' || type === 'met_to_calories') && (
            <div>
              <Label htmlFor="weight">Body Mass Weight (kg)</Label>
              <Input id="weight" type="number" step="0.1" value={weight} onChange={e => setWeight(e.target.value)} required />
            </div>
          )}

          {type === 'met_to_calories' && (
            <div>
              <Label htmlFor="duration">Work Duration (hours)</Label>
              <Input id="duration" type="number" step="0.1" value={duration} onChange={e => setDuration(e.target.value)} required />
            </div>
          )}

          {(type === 'sodium_mg_l_to_mg_bottle' || type === 'sodium_mg_bottle_to_mg_l') && (
            <div>
              <Label htmlFor="bottleLiters">Bottle Size Volume (Liters)</Label>
              <Input id="bottleLiters" type="number" step="0.05" value={bottleLiters} onChange={e => setBottleLiters(e.target.value)} required />
            </div>
          )}
        </ManualInputPanel>

        {/* Output Area */}
        <div className="h-full flex flex-col gap-6">
          {result ? (
            <>
              <ResultCard result={result} />
              <ExportPanel textToCopy={resultToText(result, "Unit Conversion Results")} />
            </>
          ) : (
            <div className="p-6 border-2 border-dashed border-border-heavy bg-card rounded-xl text-center flex flex-col items-center justify-center h-full min-h-[300px]">
              <span className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-1 block">Awaiting Target Conversion</span>
              <p className="text-xs text-zinc-500 max-w-sm">
                Select category, unit equations, fill in values, and click &quot;Calculate&quot; to inspect converted results and scaling charts.
              </p>
            </div>
          )}
        </div>
      </div>
    </CalculatorPageShell>
  );
}

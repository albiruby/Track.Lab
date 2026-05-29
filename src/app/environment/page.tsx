'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input, Label, Button, Select, ValidationMessage } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { LabPageHeader } from '@/components/layout/LabPageHeader';
import { 
  calculateHeatIndexCelsius, 
  calculateDewPointCategory, 
  classifyHeatStress, 
  calculateHeatPaceCaution, 
  calculateHeatHydrationScenario, 
  calculateHeatSodiumScenario, 
  calculateAltitudeVO2Reduction, 
  classifyAltitude, 
  calculateWindChillCelsius, 
  classifyWindEffect, 
  classifyAQI, 
  classifySurface 
} from '@/lib/calculators_pack';
import { methodRegistry } from '@/data';
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
import { 
  Thermometer, 
  Sparkles, 
  Wind, 
  Compass, 
  Activity, 
  ShieldAlert, 
  RefreshCw, 
  Copy, 
  FileText, 
  Droplet 
} from 'lucide-react';

export default function EnvironmentLab() {
  const [activeTab, setActiveTab] = useState<'heat_humidity' | 'altitude' | 'wind' | 'aqi' | 'surface' | 'summary'>('heat_humidity');
  const [isAdvanced, setIsAdvanced] = useState<boolean>(true);

  // States for Heat & Humidity
  const [temperature, setTemperature] = useState('30');
  const [humidity, setHumidity] = useState('80');
  const [basePace, setBasePace] = useState('5:00');
  const [baseFluid, setBaseFluid] = useState('600');
  const [baseSodium, setBaseSodium] = useState('500');

  // States for Altitude
  const [altitude, setAltitude] = useState('1800');
  const [vo2max, setVo2max] = useState('50');

  // States for Wind
  const [windSpeed, setWindSpeed] = useState('15');
  const [windDirection, setWindDirection] = useState<'headwind' | 'tailwind' | 'crosswind'>('headwind');

  // States for AQI
  const [aqi, setAqi] = useState('120');

  // States for Surface
  const [surfaceType, setSurfaceType] = useState('trail');

  // Validation state
  const [error, setError] = useState<string | null>(null);

  // Parse utils
  const parsePaceToSeconds = (paceStr: string): number | null => {
    if (!paceStr) return null;
    const parts = paceStr.split(":");
    if (parts.length === 2) {
      const min = parseInt(parts[0], 10);
      const sec = parseInt(parts[1], 10);
      if (!isNaN(min) && !isNaN(sec)) {
        return min * 60 + sec;
      }
    }
    const val = parseFloat(paceStr);
    if (!isNaN(val) && val > 0) return val * 60;
    return null;
  };

  const formatPaceFromSeconds = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds) || seconds <= 0) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Reset function
  const handleReset = () => {
    setTemperature('30');
    setHumidity('80');
    setBasePace('5:00');
    setBaseFluid('600');
    setBaseSodium('500');
    setAltitude('1800');
    setVo2max('50');
    setWindSpeed('15');
    setWindDirection('headwind');
    setAqi('120');
    setSurfaceType('trail');
    setError(null);
  };

  // Safe parsed values
  const tNum = parseFloat(temperature);
  const hNum = parseFloat(humidity);
  const altNum = parseFloat(altitude);
  const aqiNum = parseInt(aqi);
  const windNum = parseFloat(windSpeed);

  // Custom live validations
  const validationError = useMemo(() => {
    if (isNaN(tNum)) return "Temperature must be a valid number.";
    if (isNaN(hNum) || hNum < 0 || hNum > 100) return "Humidity must be a percentage between 0% and 100%.";
    if (isNaN(altNum) || altNum < 0) return "Altitude must be a non-negative number.";
    if (isNaN(aqiNum) || aqiNum < 0 || aqiNum > 500) return "AQI must be an integer between 0 and 500.";
    if (isNaN(windNum) || windNum < 0) return "Wind speed must be a non-negative number.";
    return null;
  }, [tNum, hNum, altNum, aqiNum, windNum]);

  // Derived Results
  const res = useMemo(() => {
    if (validationError) return null;

    // 1. Heat & Dew Point
    const heatIndex = calculateHeatIndexCelsius(tNum, hNum);
    const dewPointInfo = calculateDewPointCategory(tNum, hNum);
    const heatStress = classifyHeatStress(tNum, hNum);

    const paceSec = parsePaceToSeconds(basePace);
    const paceCaution = paceSec ? calculateHeatPaceCaution(paceSec, heatStress.level) : null;

    const fluidNum = parseFloat(baseFluid);
    const fluidCaution = !isNaN(fluidNum) && fluidNum > 0 ? calculateHeatHydrationScenario(fluidNum, heatStress.level) : null;

    const sodiumNum = parseFloat(baseSodium);
    const sodiumCaution = !isNaN(sodiumNum) && sodiumNum > 0 ? calculateHeatSodiumScenario(sodiumNum, heatStress.level) : null;

    // 2. Altitude
    const altCategory = classifyAltitude(altNum);
    const altVO2 = calculateAltitudeVO2Reduction(altNum);

    // 3. Wind
    const windChill = calculateWindChillCelsius(tNum, windNum);
    const windEffect = classifyWindEffect(windNum, windDirection);

    // 4. AQI
    const aqiCategory = classifyAQI(aqiNum);

    // 5. Surface
    const surfaceEffort = classifySurface(surfaceType);

    // Dynamic Chart Data
    const chartData = [
      {
        name: 'Fluid intake (mL/h)',
        Baseline: fluidNum || 0,
        Adjusted: fluidCaution ? Math.round(fluidCaution.adjustedFluidMl) : (fluidNum || 0),
      },
      {
        name: 'Sodium intake (mg/h)',
        Baseline: sodiumNum || 0,
        Adjusted: sodiumCaution ? Math.round(sodiumCaution.adjustedSodiumMg) : (sodiumNum || 0),
      }
    ];

    return {
      heatIndex,
      dewPoint: dewPointInfo.dewPoint,
      dewPointCategory: dewPointInfo.category,
      dewPointDesc: dewPointInfo.description,
      heatStressLevel: heatStress.level,
      heatStressLabel: heatStress.label,
      paceCaution,
      fluidCaution,
      sodiumCaution,
      altCategory,
      altVO2,
      windChill,
      windEffect: windEffect.note,
      aqiCategory: aqiCategory.category,
      aqiCaution: aqiCategory.caution,
      surfaceEffort,
      chartData
    };
  }, [tNum, hNum, altNum, aqiNum, windNum, basePace, baseFluid, baseSodium, windDirection, surfaceType, validationError]);

  // Export functions
  const handleCopy = () => {
    if (!res) return;
    const textStr = `Track.Lab Environment Report
------------------------------------
Inputs:
- Temp: ${temperature}°C, Humidity: ${humidity}%
- Altitude: ${altitude}m
- Wind Speed: ${windSpeed} km/h, Direction: ${windDirection}
- AQI: ${aqi}
- Surface: ${surfaceType}

Deterministic Calculator Outcomes:
- Heat Stress Category: ${res.heatStressLabel}
- Calculated Heat Index: ${res.heatIndex.toFixed(1)}°C
- Calculated Dew Point: ${res.dewPoint.toFixed(1)}°C (${res.dewPointCategory})
- Altitude Category: ${res.altCategory}
- Suggested Altitude VO2 max reduction: ${res.altVO2.vo2ReductionPct.toFixed(1)}%
- Wind Effect Note: ${res.windEffect}
- AQI Category: ${res.aqiCategory} (${res.aqiCaution})
- Surface Effort Note: ${res.surfaceEffort}

Safety Caveats:
- Scenario estimates only. Under no circumstances constitutes medical advice, cardiac diagnostics, or guaranteed pace performance.`;

    navigator.clipboard.writeText(textStr);
    alert("Results copied to clipboard!");
  };

  const handleExportJSON = () => {
    if (!res) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      module: "Environment Lab",
      inputs: { temperature, humidity, basePace, baseFluid, baseSodium, altitude, vo2max, windSpeed, windDirection, aqi, surfaceType },
      calculations: {
        heatIndexCelsius: res.heatIndex,
        dewPointCelsius: res.dewPoint,
        dewPointCategory: res.dewPointCategory,
        heatStressLevel: res.heatStressLevel,
        heatStressLabel: res.heatStressLabel,
        altitudeCategory: res.altCategory,
        altitudeVO2ReductionPct: res.altVO2.vo2ReductionPct,
        windChill: res.windChill,
        aqiCategory: res.aqiCategory,
        surfaceEffort: res.surfaceEffort
      },
      confidence: "exact/estimate",
      disclaimer: "Scenario simulation estimate. Not medical advice."
    }, null, 2));

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "tracklab_environment_export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const activeMethodMeta = useMemo(() => {
    const mapTabToId: Record<string, string> = {
      heat_humidity: 'heat_stress_category',
      altitude: 'altitude_vo2_reduction',
      wind: 'wind_effect_classification',
      aqi: 'aqi_category',
      surface: 'surface_effort_note',
      summary: 'environmental_condition_summary'
    };
    const methodId = mapTabToId[activeTab];
    return methodRegistry.find(m => m.id === methodId) || {
      name: "Environmental Summary",
      formulaDisplay: "Aggregates multiple deterministic calculations into a consolidated reference report.",
      precision: "qualitative",
      limitations: ["Each variable functions as an independent physiological metric without compounding models."]
    };
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <LabPageHeader 
        title="ENVIRONMENT LAB" 
        subtitle="Manual metabolic condition assessments regarding thermal stress, high-elevation, wind resistance, and ground friction mechanics." 
      />

      {/* Mode Selector and Quick Indicators */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-50 border-2 border-border-heavy p-4 rounded-xl shadow-[1px_1px_0px_rgba(23,23,23,1)]">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={isAdvanced ? "primary" : "outline"} 
            onClick={() => setIsAdvanced(true)}
            className="text-xs uppercase tracking-wider"
          >
            Advanced Calculator Mode
          </Button>
          <Button 
            variant={!isAdvanced ? "primary" : "outline"} 
            onClick={() => setIsAdvanced(false)}
            className="text-xs uppercase tracking-wider"
          >
            Quick Summary Mode
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleReset} variant="outline" className="flex items-center text-xs h-9 py-1 px-3">
            <RefreshCw className="h-3 w-3 mr-1" /> Reset Inputs
          </Button>
          <Button onClick={handleCopy} variant="outline" className="flex items-center text-xs h-9 py-1 px-3" disabled={!!validationError}>
            <Copy className="h-3 w-3 mr-1" /> Copy Report
          </Button>
          <Button onClick={handleExportJSON} variant="outline" className="flex items-center text-xs h-9 py-1 px-3" disabled={!!validationError}>
            <FileText className="h-3 w-3 mr-1" /> Export JSON
          </Button>
        </div>
      </div>

      {validationError && (
        <Card className="border-2 border-destructive shadow-[2px_2px_0px_rgba(232,76,61,1)]">
          <CardContent className="pt-6 space-y-2">
            <div className="flex items-center">
              <ShieldAlert className="h-5 w-5 text-destructive mr-2" />
              <span className="font-bold text-destructive">User Input Validation Failure</span>
            </div>
            <p className="text-sm font-medium text-foreground">{validationError}</p>
          </CardContent>
        </Card>
      )}

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Navigation & Inputs */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-2 border-border-heavy rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
            <CardHeader className="bg-zinc-50 border-b-2 border-border-heavy py-4">
              <CardTitle className="text-sm font-black uppercase tracking-wider">Lab Categories</CardTitle>
            </CardHeader>
            <CardContent className="p-2 flex flex-col gap-1">
              <button
                onClick={() => { setActiveTab('heat_humidity'); setIsAdvanced(true); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${activeTab === 'heat_humidity' ? 'bg-primary text-primary-foreground font-black shadow-[1px_1px_0px_rgba(23,23,23,1)]' : 'hover:bg-zinc-100 text-foreground'}`}
              >
                <span className="flex items-center"><Thermometer className="h-4 w-4 mr-2" /> Heat & Humidity</span>
                {res && <span className="text-[10px] uppercase bg-black/10 px-1.5 py-0.5 rounded font-mono">{res.heatStressLevel}</span>}
              </button>
              <button
                onClick={() => { setActiveTab('altitude'); setIsAdvanced(true); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${activeTab === 'altitude' ? 'bg-primary text-primary-foreground font-black shadow-[1px_1px_0px_rgba(23,23,23,1)]' : 'hover:bg-zinc-100 text-foreground'}`}
              >
                <span className="flex items-center"><Compass className="h-4 w-4 mr-2" /> Mountain & Altitude</span>
                {res && <span className="text-[10px] uppercase bg-black/10 px-1.5 py-0.5 rounded font-mono">{altNum >= 1500 ? "High" : "Low"}</span>}
              </button>
              <button
                onClick={() => { setActiveTab('wind'); setIsAdvanced(true); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${activeTab === 'wind' ? 'bg-primary text-primary-foreground font-black shadow-[1px_1px_0px_rgba(23,23,23,1)]' : 'hover:bg-zinc-100 text-foreground'}`}
              >
                <span className="flex items-center"><Wind className="h-4 w-4 mr-2" /> Aerodynamic Wind</span>
                {res && <span className="text-[10px] uppercase bg-black/10 px-1.5 py-0.5 rounded font-mono">{windDirection}</span>}
              </button>
              <button
                onClick={() => { setActiveTab('aqi'); setIsAdvanced(true); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${activeTab === 'aqi' ? 'bg-primary text-primary-foreground font-black shadow-[1px_1px_0px_rgba(23,23,23,1)]' : 'hover:bg-zinc-100 text-foreground'}`}
              >
                <span className="flex items-center"><Activity className="h-4 w-4 mr-2" /> Respiratory AQI</span>
                {res && <span className="text-[10px] uppercase bg-black/10 px-1.5 py-0.5 rounded font-mono">{res.aqiCategory}</span>}
              </button>
              <button
                onClick={() => { setActiveTab('surface'); setIsAdvanced(true); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${activeTab === 'surface' ? 'bg-primary text-primary-foreground font-black shadow-[1px_1px_0px_rgba(23,23,23,1)]' : 'hover:bg-zinc-100 text-foreground'}`}
              >
                <span className="flex items-center"><Droplet className="h-4 w-4 mr-2" /> Ground & Surface</span>
                <span className="text-[10px] uppercase bg-black/10 px-1.5 py-0.5 rounded font-mono">{surfaceType}</span>
              </button>
              <button
                onClick={() => { setActiveTab('summary'); setIsAdvanced(true); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between border-t border-dashed border-border-heavy mt-2 ${activeTab === 'summary' ? 'bg-zinc-900 text-white font-black shadow-[1px_1px_0px_rgba(23,23,23,1)]' : 'hover:bg-zinc-100 text-foreground'}`}
              >
                <span className="flex items-center text-primary dark:text-foreground"><Sparkles className="h-4 w-4 mr-2" /> Unified Condition Summary</span>
                <span>📋</span>
              </button>
            </CardContent>
          </Card>

          {/* Form inputs panel based on category */}
          <Card className="border-2 border-border-heavy rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
            <CardHeader className="bg-zinc-50 border-b-2 border-border-heavy">
              <CardTitle className="text-sm font-black uppercase tracking-wider">Adjustment Variables</CardTitle>
              <CardDescription className="text-xs">Provide current environmental parameters below.</CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              
              {/* Common Inputs always visible for reference */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="temperature">Temperature (°C)</Label>
                  <Input id="temperature" type="number" step="1" value={temperature} onChange={e => setTemperature(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="humidity">Humidity (%)</Label>
                  <Input id="humidity" type="number" step="1" value={humidity} onChange={e => setHumidity(e.target.value)} required />
                </div>
              </div>

              {activeTab === 'heat_humidity' && (
                <div className="space-y-4 pt-2 border-t border-dashed border-zinc-200">
                  <div className="space-y-1">
                    <Label htmlFor="basePace">Baseline Pace (min/km, e.g. 5:00)</Label>
                    <Input id="basePace" type="text" value={basePace} onChange={e => setBasePace(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="baseFluid">Baseline Fluid (mL/h)</Label>
                      <Input id="baseFluid" type="number" value={baseFluid} onChange={e => setBaseFluid(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="baseSodium">Baseline Sodium (mg/h)</Label>
                      <Input id="baseSodium" type="number" value={baseSodium} onChange={e => setBaseSodium(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'altitude' && (
                <div className="space-y-4 pt-2 border-t border-dashed border-zinc-200">
                  <div className="space-y-1">
                    <Label htmlFor="altitude">Elevation Altitude (meters)</Label>
                    <Input id="altitude" type="number" value={altitude} onChange={e => setAltitude(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="vo2max">Baseline VO₂ Max (optional)</Label>
                    <Input id="vo2max" type="number" value={vo2max} onChange={e => setVo2max(e.target.value)} />
                  </div>
                </div>
              )}

              {activeTab === 'wind' && (
                <div className="space-y-4 pt-2 border-t border-dashed border-zinc-200">
                  <div className="space-y-1">
                    <Label htmlFor="windSpeed">Wind Speed (km/h)</Label>
                    <Input id="windSpeed" type="number" value={windSpeed} onChange={e => setWindSpeed(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="windDirection">Wind Direction Relative to Path</Label>
                    <Select id="windDirection" value={windDirection} onChange={e => setWindDirection(e.target.value as any)}>
                      <option value="headwind">Direct Headwind</option>
                      <option value="tailwind">Direct Tailwind</option>
                      <option value="crosswind">Crosswind</option>
                    </Select>
                  </div>
                </div>
              )}

              {activeTab === 'aqi' && (
                <div className="space-y-4 pt-2 border-t border-dashed border-zinc-200">
                  <div className="space-y-1">
                    <Label htmlFor="aqi">Air Quality Index (AQI)</Label>
                    <Input id="aqi" type="number" value={aqi} onChange={e => setAqi(e.target.value)} required />
                  </div>
                </div>
              )}

              {activeTab === 'surface' && (
                <div className="space-y-4 pt-2 border-t border-dashed border-zinc-200">
                  <div className="space-y-1">
                    <Label htmlFor="surfaceType">Surface Type</Label>
                    <Select id="surfaceType" value={surfaceType} onChange={e => setSurfaceType(e.target.value)}>
                      <option value="road">Asphalt / Road</option>
                      <option value="track">Synthetic Track</option>
                      <option value="trail">Hardpack Dirt Trail</option>
                      <option value="treadmill">Treadmill Belt</option>
                      <option value="grass">Grass Turf</option>
                      <option value="gravel">Loose Gravel</option>
                      <option value="wetroad">Wet asphalt</option>
                      <option value="mud">Wet Mud</option>
                      <option value="sand">Beach Sand</option>
                    </Select>
                  </div>
                </div>
              )}

              {activeTab === 'summary' && (
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-mono text-muted-foreground">
                  The summary compile computes indexes for all tabs above using current entered state. Modify tabs to tweak specific variables.
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* Right Side: Quick summary vs Advanced result cards */}
        <div className="lg:col-span-2 space-y-6">
          {!isAdvanced ? (
            /* Quick Summary Unified Mode */
            <Card className="border-2 border-border-heavy rounded-xl shadow-[4px_4px_0px_rgba(23,23,23,1)] overflow-hidden">
              <HeaderCardTitle label="DETERMINISTIC CLIMATIC INDICATOR SUMMARY" />
              <CardContent className="p-6 space-y-6">
                {res ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border-2 border-border-heavy rounded-xl bg-zinc-50 font-mono space-y-1">
                      <div className="text-[10px] text-muted-foreground uppercase font-sans font-extrabold tracking-widest">Heat Stress</div>
                      <div className="text-lg font-black text-foreground capitalize">{res.heatStressLevel}</div>
                      <div className="text-xs text-muted-foreground font-sans">Index temperature of {res.heatIndex.toFixed(1)}°C</div>
                    </div>

                    <div className="p-4 border-2 border-border-heavy rounded-xl bg-zinc-50 font-mono space-y-1">
                      <div className="text-[10px] text-muted-foreground uppercase font-sans font-extrabold tracking-widest">Altitude Density</div>
                      <div className="text-lg font-black text-foreground">{altNum} meters</div>
                      <div className="text-xs text-muted-foreground font-sans">{res.altCategory}</div>
                    </div>

                    <div className="p-4 border-2 border-border-heavy rounded-xl bg-zinc-50 font-mono space-y-1">
                      <div className="text-[10px] text-muted-foreground uppercase font-sans font-extrabold tracking-widest">Wind Factor</div>
                      <div className="text-lg font-black text-foreground">{windSpeed} km/h</div>
                      <div className="text-xs text-muted-foreground font-sans capitalize">{windDirection} note applied</div>
                    </div>

                    <div className="p-4 border-2 border-border-heavy rounded-xl bg-zinc-50 font-mono space-y-1">
                      <div className="text-[10px] text-muted-foreground uppercase font-sans font-extrabold tracking-widest">Air Quality</div>
                      <div className="text-lg font-black text-foreground">AQI {aqi}</div>
                      <div className="text-xs text-muted-foreground font-sans">{res.aqiCategory}</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-muted-foreground italic">Provide correct input parameters on the left to review metrics.</p>
                )}
                
                <div className="pt-4 border-t border-zinc-200">
                  <div className="text-xs uppercase tracking-wider font-extrabold text-muted-foreground mb-2">Cross-Module Integration References:</div>
                  <ul className="text-xs space-y-1 text-foreground list-disc list-inside">
                    <li><span className="font-bold text-primary">Cross-Link:</span> Use these environmental scenario metrics to align your hydration strategy inside our <a href="/fuel" className="font-bold underline text-primary">Fuel Lab</a>.</li>
                    <li>Compare calculated heat pace drift with reference race estimations in our <a href="/pace" className="font-bold underline text-primary">Pace Lab</a>.</li>
                    <li>Incorporate heat/altitude stress notes inside your chronological <a href="/race" className="font-bold underline text-primary">Race Day Lab Page</a> outline.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Advanced Mode (specific tab rendering) */
            <div className="space-y-6">
              
              {/* Tab Title Block */}
              <Card className="border-2 border-border-heavy rounded-xl shadow-[4px_4px_0px_rgba(23,23,23,1)]">
                <CardHeader className="bg-primary text-primary-foreground">
                  <CardTitle className="text-base font-black uppercase tracking-wider flex items-center justify-between">
                    <span>{activeMethodMeta.name}</span>
                    <span className="bg-black/25 text-white font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-white/20">
                      {activeMethodMeta.precision?.replace('_', ' ') || "qualitative"}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  
                  {res ? (
                    <div className="space-y-6">
                      
                      {/* SPECIFIC TAB OUTPUTS */}
                      {activeTab === 'heat_humidity' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-zinc-50 border-2 border-border-heavy p-4 rounded-xl font-mono text-center">
                              <div className="text-xs font-sans font-bold text-muted-foreground uppercase">Calculated Heat Index</div>
                              <div className="text-2xl font-black text-foreground mt-1">{res.heatIndex.toFixed(1)} °C</div>
                              <div className="text-[10px] text-muted-foreground font-sans mt-0.5">({(res.heatIndex * 1.8 + 32).toFixed(1)} °F)</div>
                            </div>
                            <div className="bg-zinc-50 border-2 border-border-heavy p-4 rounded-xl font-mono text-center">
                              <div className="text-xs font-sans font-bold text-muted-foreground uppercase">Calculated Dew Point</div>
                              <div className="text-2xl font-black text-foreground mt-1">{res.dewPoint.toFixed(1)} °C</div>
                              <div className="text-xs text-[#d35400] font-sans font-bold mt-1">{res.dewPointCategory}</div>
                            </div>
                            <div className="bg-zinc-50 border-2 border-border-heavy p-4 rounded-xl font-mono text-center">
                              <div className="text-xs font-sans font-bold text-muted-foreground uppercase">Heat Stress Caution</div>
                              <div className="text-xl font-black text-foreground mt-1.5 uppercase tracking-wide">{res.heatStressLabel}</div>
                              <div className="text-[10px] text-muted-foreground font-sans mt-1">Estimates perceived index risk</div>
                            </div>
                          </div>

                          <div className="p-4 bg-amber-50/50 border-l-4 border-amber-500 rounded-lg text-xs space-y-2 text-foreground font-sans">
                            <div className="font-bold flex items-center text-amber-800">
                              <ShieldAlert className="h-4 w-4 mr-1" /> Heat Index Atmospheric Caution Note
                            </div>
                            <p>Dew point is currently <span className="font-bold">{res.dewPoint.toFixed(1)}°C</span>. {res.dewPointDesc}</p>
                          </div>

                          {/* Pace adjustments scenario */}
                          {res.paceCaution && (
                            <div className="p-4 border-2 border-border-heavy bg-zinc-50 rounded-xl font-mono space-y-1">
                              <div className="text-[10px] text-muted-foreground uppercase font-sans font-black tracking-wider">Calculated Intensity Balance Preview</div>
                              <div className="text-sm font-black text-foreground mt-1">
                                Base Pace {basePace}/km <span className="text-primary font-bold">→ Adjusted Pace {formatPaceFromSeconds(res.paceCaution.adjustedPaceSec)}/km</span>
                              </div>
                              <div className="text-xs text-muted-foreground font-sans leading-relaxed pt-1">{res.paceCaution.guidance}</div>
                            </div>
                          )}

                          {/* Hydration / Sodium scenarios */}
                          {(res.fluidCaution || res.sodiumCaution) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                              {res.fluidCaution && (
                                <div className="p-4 border-2 border-border-heavy bg-zinc-50 rounded-xl font-mono space-y-1 text-xs">
                                  <div className="font-sans font-bold text-muted-foreground uppercase text-[10px]">Suggested Fluid Plan</div>
                                  <div className="text-base font-black text-foreground">{Math.round(res.fluidCaution.adjustedFluidMl)} mL/hr</div>
                                  <div className="text-muted-foreground leading-normal font-sans text-[11px]">{res.fluidCaution.note}</div>
                                </div>
                              )}
                              {res.sodiumCaution && (
                                <div className="p-4 border-2 border-border-heavy bg-zinc-50 rounded-xl font-mono space-y-1 text-xs">
                                  <div className="font-sans font-bold text-muted-foreground uppercase text-[10px]">Suggested Sodium Reference</div>
                                  <div className="text-base font-black text-zinc-800">{Math.round(res.sodiumCaution.adjustedSodiumMg)} mg/hr</div>
                                  <div className="text-muted-foreground leading-normal font-sans text-[11px]">{res.sodiumCaution.note}</div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Real Chart */}
                          <div className="mt-4 border-2 border-border-heavy rounded-xl p-4 bg-white shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                            <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-3">Fluid & Sodium Fluid Drift Simulation</div>
                            <div className="h-60 w-full font-mono text-xs">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={res.chartData} margin={{ left: -10, right: 10, top: 10, bottom: 0 }}>
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" />
                                  <YAxis />
                                  <Tooltip />
                                  <Legend />
                                  <Bar dataKey="Baseline" fill="#71717a" radius={[4, 4, 0, 0]} />
                                  <Bar dataKey="Adjusted" fill="#18181b" radius={[4, 4, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>

                        </div>
                      )}

                      {activeTab === 'altitude' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-zinc-50 border-2 border-border-heavy p-4 rounded-xl font-mono text-center">
                              <div className="text-xs font-sans font-bold text-muted-foreground uppercase">Altitude Classification</div>
                              <div className="text-xl font-black text-foreground mt-2">{res.altCategory}</div>
                              <div className="text-xs text-muted-foreground font-sans mt-1">{altitude} meters above sea level</div>
                            </div>
                            <div className="bg-zinc-50 border-2 border-border-heavy p-4 rounded-xl font-mono text-center">
                              <div className="text-xs font-sans font-bold text-muted-foreground uppercase">VO₂ Max Reduction Estimate</div>
                              <div className="text-2xl font-black text-black mt-1">-{res.altVO2.vo2ReductionPct.toFixed(1)}%</div>
                              <div className="text-xs text-muted-foreground font-sans mt-1">Effective aerobic reduction term</div>
                            </div>
                          </div>

                          <div className="p-4 border-2 border-border-heavy bg-zinc-50 rounded-xl space-y-1 font-sans text-xs">
                            <div className="font-bold text-foreground">Altitude Physiology Reference Guidance:</div>
                            <p className="text-muted-foreground leading-relaxed mt-1">{res.altVO2.note}</p>
                          </div>
                        </div>
                      )}

                      {activeTab === 'wind' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-zinc-50 border-2 border-border-heavy p-4 rounded-xl font-mono text-center">
                              <div className="text-xs font-sans font-bold text-muted-foreground uppercase">Wind Speed & Direction</div>
                              <div className="text-xl font-black text-foreground mt-1.5 capitalize">{windSpeed} km/h - {windDirection}</div>
                              <div className="text-[10px] text-muted-foreground font-sans mt-1">Exerted aerodynamic parameter</div>
                            </div>
                            <div className="bg-zinc-50 border-2 border-border-heavy p-4 rounded-xl font-mono text-center">
                              <div className="text-xs font-sans font-bold text-muted-foreground uppercase">Apparent Wind Chill</div>
                              <div className="text-2xl font-black text-foreground mt-1">
                                {res.windChill !== null ? `${res.windChill.toFixed(1)} °C` : "Not Applicable"}
                              </div>
                              <div className="text-[10px] text-muted-foreground font-sans mt-1">Valid when Temp ≤ 10°C & Wind ≥ 4.8 km/h</div>
                            </div>
                          </div>

                          <div className="p-4 border-2 border-border-heavy bg-zinc-50 rounded-xl space-y-1 font-sans text-xs">
                            <div className="font-bold text-foreground uppercase tracking-wider text-[10px]">Apparent Wind Resistance Impact Note:</div>
                            <p className="text-muted-foreground leading-relaxed mt-1">{res.windEffect}</p>
                          </div>
                        </div>
                      )}

                      {activeTab === 'aqi' && (
                        <div className="space-y-4">
                          <div className="bg-zinc-50 border-2 border-border-heavy p-4 rounded-xl font-mono text-center">
                            <div className="text-xs font-sans font-bold text-muted-foreground uppercase">EPA Air Quality Level</div>
                            <div className="text-2xl font-black text-foreground mt-1.5">{aqi} (AQI)</div>
                            <div className="text-xs text-primary font-bold font-sans mt-1">{res.aqiCategory}</div>
                          </div>

                          <div className="p-4 border-2 border-border-heavy bg-zinc-50 rounded-xl space-y-1 font-sans text-xs">
                            <div className="font-bold text-foreground flex items-center">
                              <ShieldAlert className="h-4 w-4 mr-1 text-primary" /> Respiratory Caution Warning
                            </div>
                            <p className="text-muted-foreground leading-relaxed mt-1">{res.aqiCaution}</p>
                          </div>
                        </div>
                      )}

                      {activeTab === 'surface' && (
                        <div className="space-y-4">
                          <div className="bg-zinc-50 border-2 border-border-heavy p-4 rounded-xl font-mono text-center">
                            <div className="text-xs font-sans font-bold text-muted-foreground uppercase">Ground Surface Category</div>
                            <div className="text-2xl font-black text-foreground mt-1.5 capitalize">{surfaceType}</div>
                            <div className="text-xs text-muted-foreground font-sans mt-1">Ground friction mechanical variable</div>
                          </div>

                          <div className="p-4 border-2 border-border-heavy bg-zinc-50 rounded-xl space-y-1 font-sans text-xs">
                            <div className="font-bold text-foreground uppercase tracking-wider text-[10px]">Terrain Mechanics Note:</div>
                            <p className="text-muted-foreground leading-relaxed mt-1">{res.surfaceEffort}</p>
                          </div>
                        </div>
                      )}

                      {activeTab === 'summary' && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono">
                            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                              <div className="text-[10px] text-muted-foreground font-sans uppercase">Heat stress</div>
                              <div className="font-bold text-foreground text-sm mt-0.5 capitalize">{res.heatStressLevel}</div>
                            </div>
                            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                              <div className="text-[10px] text-muted-foreground font-sans uppercase">Altitude</div>
                              <div className="font-bold text-foreground text-sm mt-0.5">{altitude}m</div>
                            </div>
                            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                              <div className="text-[10px] text-muted-foreground font-sans uppercase">Wind speed</div>
                              <div className="font-bold text-foreground text-sm mt-0.5">{windSpeed}km/h</div>
                            </div>
                            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                              <div className="text-[10px] text-muted-foreground font-sans uppercase">AQI status</div>
                              <div className="font-bold text-foreground text-sm mt-0.5">{res.aqiCategory}</div>
                            </div>
                          </div>

                          <div className="p-4 border-2 border-zinc-900 rounded-xl space-y-3 font-sans text-xs bg-white shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                            <div className="font-extrabold uppercase text-[10px] tracking-wider text-muted-foreground border-b pb-1">Comprehensive microclimate report summary:</div>
                            <div className="space-y-2">
                              <p>• <span className="font-bold">Thermal Stress:</span> Classified as <span className="font-bold">{res.heatStressLabel}</span> with calculated heat index of <span className="font-bold">{res.heatIndex.toFixed(1)}°C</span> and dew point of <span className="font-bold">{res.dewPoint.toFixed(1)}°C</span>.</p>
                              <p>• <span className="font-bold">Hypoxic Reduction:</span> Effective altitude reduces steady-state aerobic limits by roughly <span className="font-bold">{res.altVO2.vo2ReductionPct.toFixed(1)}%</span>.</p>
                              <p>• <span className="font-bold">Aerodynamics:</span> Wind is running <span className="font-bold">{windSpeed} km/h ({windDirection})</span>. {res.windEffect}</p>
                              <p>• <span className="font-bold">Respiration:</span> AQI rating of <span className="font-bold">{aqi} ({res.aqiCategory})</span>. {res.aqiCaution}</p>
                              <p>• <span className="font-bold">Ground Mechanics:</span> Ground is classified as <span className="font-bold capitalize">{surfaceType}</span>. {res.surfaceEffort}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Formula tracing and confidence indicator block */}
                      <div className="p-4 border-2 border-border-heavy rounded-xl space-y-2 font-mono text-xs text-left bg-zinc-50">
                        <div>
                          <span className="font-bold text-muted-foreground uppercase">Formula Trace:</span>
                          <div className="bg-white border rounded p-2 text-foreground font-sans text-[11px] mt-1 break-all">
                            {activeMethodMeta.formulaDisplay}
                          </div>
                        </div>
                        <div className="pt-2 border-t border-dashed border-zinc-200">
                          <span className="font-bold text-muted-foreground uppercase">Biomechanical Cautions & Limitations:</span>
                          <div className="text-slate-600 font-sans leading-relaxed text-[10px] mt-1">
                            Calculations are deterministic estimators based on generalized physics formulas. Under no circumstances represents medical/environmental diagnoses, heat stress medical prognosis, cardiac metrics, bronchial diagnostic models, or athlete performance guarantees.
                          </div>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <p className="text-zinc-500 font-mono italic text-sm text-center">Awaiting inputs to formulate environment diagnostics...</p>
                  )}

                </CardContent>
              </Card>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}

function HeaderCardTitle({ label }: { label: string }) {
  return (
    <div className="bg-zinc-900 border-b-2 border-border-heavy px-6 py-3">
      <h3 className="text-xs font-black uppercase text-white tracking-widest">{label}</h3>
    </div>
  );
}

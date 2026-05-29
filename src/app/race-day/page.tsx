'use client';

import { useState } from 'react';
import { Input, Label, Select } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { CalculatorPageShell } from '@/components/calculator/CalculatorPageShell';
import { ManualInputPanel } from '@/components/calculator/ManualInputPanel';
import { ExportPanel } from '@/components/calculator/CalculatorSystem';
import { resultToText } from '@/lib/export/manualExport';
import { CalculatorResult } from '@/types';
import {
  generateRaceDayTimeline,
  calculateABCRaceGoalTable,
  calculateRaceSplitCard,
  generateRaceDayKitChecklist,
  calculatePostRaceRecoveryChecklist
} from '@/lib/calculators_pack/raceDaySystem';
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

// Duration helpers
function parseDurationToSeconds(durationStr: string): number | null {
  if (!durationStr) return null;
  const parts = durationStr.trim().split(':').map(Number);
  if (parts.some(isNaN)) return null;
  if (parts.length === 3) {
    const [h, m, s] = parts;
    return h * 3600 + m * 60 + s;
  }
  if (parts.length === 2) {
    const [m, s] = parts;
    return m * 60 + s;
  }
  if (parts.length === 1) {
    return parts[0] * 60; // assume minutes
  }
  return null;
}

function formatSecondsToDuration(totalSecs: number): string {
  const h = Math.floor(totalSecs / 3600);
  const m = Math.floor((totalSecs % 3600) / 60);
  const s = Math.round(totalSecs % 60);
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }
  return `${m}:${String(s).padStart(2, '0')}`;
}

function formatSecondsToPaceMinKm(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = Math.round(secs % 60);
  return `${m}:${String(s).padStart(2, '0')} /km`;
}

export default function RaceDayLabPage() {
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick');
  
  // Inputs: Pre-race Schedule offsets in minutes
  const [raceStart, setRaceStart] = useState('07:00');
  const [wakeOffset, setWakeOffset] = useState('180');
  const [mealOffset, setMealOffset] = useState('150');
  const [hydrationOffset, setHydrationOffset] = useState('90');
  const [caffeineOffset, setCaffeineOffset] = useState('45');
  const [warmupOffset, setWarmupOffset] = useState('40');
  
  // Inputs: Race parameters
  const [distanceKm, setDistanceKm] = useState('21.1');
  const [targetDuration, setTargetDuration] = useState('1:45:00');
  const [segmentSize, setSegmentSize] = useState('5.0');
  
  // Inputs: Nutrition intervals
  const [gelInterval, setGelInterval] = useState('30');
  const [fluidInterval, setFluidInterval] = useState('15');
  const [sodiumInterval, setSodiumInterval] = useState('60');

  // Inputs: Checklist factors
  const [raceType, setRaceType] = useState('road');
  const [weatherCondition, setWeatherCondition] = useState('nominal');

  // Multipliers for goals (percentage adjustments)
  const [aggressivePct, setAggressivePct] = useState('2.5');
  const [conservativePct, setConservativePct] = useState('2.5');

  const [result, setResult] = useState<CalculatorResult<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setRaceStart('07:00');
    setWakeOffset('180');
    setMealOffset('150');
    setHydrationOffset('90');
    setCaffeineOffset('45');
    setWarmupOffset('40');
    setDistanceKm('21.1');
    setTargetDuration('1:45:00');
    setSegmentSize('5.0');
    setGelInterval('30');
    setFluidInterval('15');
    setSodiumInterval('60');
    setRaceType('road');
    setWeatherCondition('nominal');
    setAggressivePct('2.5');
    setConservativePct('2.5');
    setResult(null);
    setError(null);
  };

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    // Parse parameters
    const dist = parseFloat(distanceKm);
    if (isNaN(dist) || dist <= 0) {
      return setError('Target Race Distance must be a positive number.');
    }

    const durSecs = parseDurationToSeconds(targetDuration);
    if (durSecs === null || durSecs <= 0) {
      return setError('Please provide a valid Target Finish Duration in HH:MM:SS format (e.g., 1:45:00).');
    }

    const segSize = parseFloat(segmentSize);
    if (isNaN(segSize) || segSize <= 0 || segSize > dist) {
      return setError('Segment split sizing must be a valid positive number within the race distance.');
    }

    const startParts = raceStart.split(':');
    if (startParts.length < 2 || isNaN(Number(startParts[0])) || isNaN(Number(startParts[1]))) {
      return setError('Invalid race start time format. Use HH:MM.');
    }

    const aggP = parseFloat(aggressivePct);
    const conP = parseFloat(conservativePct);
    if (isNaN(aggP) || aggP < 0 || aggP > 20 || isNaN(conP) || conP < 0 || conP > 20) {
      return setError('Aggressive and conservative goal adjustments should be realistic numbers between 0% and 20%.');
    }

    const wMins = parseFloat(wakeOffset);
    const mMins = parseFloat(mealOffset);
    const hMins = parseFloat(hydrationOffset);
    const cMins = parseFloat(caffeineOffset);
    const wpMins = parseFloat(warmupOffset);
    
    if (isNaN(wMins) || isNaN(mMins) || isNaN(hMins) || isNaN(cMins) || isNaN(wpMins)) {
      return setError('Logistical timing offsets must be numbers.');
    }

    const gelT = parseFloat(gelInterval);
    const fluidT = parseFloat(fluidInterval);
    const sodiumT = parseFloat(sodiumInterval);

    if (isNaN(gelT) || isNaN(fluidT) || isNaN(sodiumT)) {
      return setError('Fueling checkpoints intervals must be valid numbers.');
    }

    const raceDurationMinutes = durSecs / 60;

    // Call Systems Engines
    const timelineEvents = generateRaceDayTimeline({
      raceStartTime: raceStart,
      wakeOffsetMins: wMins,
      mealOffsetMins: mMins,
      hydrationOffsetMins: hMins,
      caffeineOffsetMins: cMins,
      warmupOffsetMins: wpMins,
      raceDurationMins: raceDurationMinutes,
      gelIntervalMins: gelT,
      fluidIntervalMins: fluidT,
      sodiumIntervalMins: sodiumT
    });

    const goals = calculateABCRaceGoalTable(durSecs, conP, aggP, dist);
    const splitsList = calculateRaceSplitCard(dist, durSecs, segSize);
    const gearList = generateRaceDayKitChecklist(raceType, weatherCondition);
    
    // Categorize distance for post-race recommendations
    let distCategory = "short_distance";
    if (dist >= 42.1) distCategory = "marathon";
    else if (dist >= 21.0) distCategory = "half_marathon";
    const postRaceChecklist = calculatePostRaceRecoveryChecklist(distCategory);

    // Formulation trace logging representation
    const stepsTrace = [
      `1. Target Finish Duration parsed to time seconds: ${durSecs} seconds (${targetDuration})`,
      `2. Race Average Mechanical Pace: ${formatSecondsToPaceMinKm(durSecs / dist)} (${(durSecs / dist).toFixed(1)} secs/km)`,
      `3. Split schedule segment resolution: ${segSize.toFixed(2)} km segments`,
      `4. Pre-Race Timelines scheduled using offset subtraction from Start Time (${raceStart}):`,
      `   - Wake-up: Start - ${wMins} mins`,
      `   - Carbohydrate Meal: Start - ${mMins} mins`,
      `   - Pre-Race Hydration: Start - ${hMins} mins`,
      `   - Pre-Race Caffeine: Start - ${cMins} mins (Optional)`,
      `   - activation Drill Warm-up: Start - ${wpMins} mins`,
      `5. Fuel checkpoints calculated inside duration (${raceDurationMinutes.toFixed(1)} mins):`,
      `   - Gels every ${gelT} mins -> Number checkpoints: ${Math.floor(raceDurationMinutes / gelT)}`,
      `   - Fluid every ${fluidT} mins -> Number checkpoints: ${Math.floor(raceDurationMinutes / fluidT)}`,
      `   - Sodium every ${sodiumT} mins -> Number checkpoints: ${Math.floor(raceDurationMinutes / sodiumT)}`,
      `6. Goal Matrix percentage adjustments:`,
      `   - A Goal (Aggressive): Target Finish - ${aggP}% = ${formatSecondsToDuration(durSecs * (1 - aggP / 100))}`,
      `   - B Goal (Realistic/Baseline): Target Finish = ${formatSecondsToDuration(durSecs)}`,
      `   - C Goal (Conservative): Target Finish + ${conP}% = ${formatSecondsToDuration(durSecs * (1 + conP / 100))}`,
      `7. Gear Checklist initialized for: Race Type = ${raceType && raceType.toUpperCase()} | Weather = ${weatherCondition && weatherCondition.toUpperCase()}`
    ];

    // Chart representation data: A, B, and C goals in minutes
    const chartGoalsData = goals.map(g => ({
      name: g.label,
      Minutes: parseFloat((g.targetTimeSecs / 60).toFixed(1)),
      Pace: formatSecondsToPaceMinKm(g.averagePaceSecsPerKm)
    }));

    setResult({
      result: (
        <div className="flex flex-col gap-6">
          {/* Target pacing summary banner */}
          <div className="p-4 border-2 border-border-heavy bg-zinc-50 dark:bg-zinc-800 rounded-xl text-center shadow-[1px_1px_0px_rgba(23,23,23,1)]">
            <span className="text-muted-foreground text-[10px] tracking-widest block uppercase font-bold mb-1">
              Target Baseline Mechanical Pace
            </span>
            <span className="font-display text-3xl font-black text-foreground tracking-tight block">
              {formatSecondsToPaceMinKm(durSecs / dist)}
            </span>
            <span className="text-[10px] text-zinc-500 font-mono block mt-1">
              Average speed: {(dist / (durSecs / 3600)).toFixed(2)} km/h over {dist.toFixed(1)} km
            </span>
          </div>

          {/* Table 1: Logistics Timeline */}
          <div className="border-2 border-border-heavy bg-white p-4 rounded-xl shadow-[1px_1px_0px_rgba(23,23,23,1)]">
            <span className="text-muted-foreground text-[10px] tracking-widest block uppercase font-bold mb-3">
              1. Chronological Tactical Logistics Timeline
            </span>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-border-heavy">
                    <th className="py-2 font-bold uppercase tracking-wider text-[10px] text-muted-foreground w-1/5">Clock</th>
                    <th className="py-2 font-bold uppercase tracking-wider text-[10px] text-muted-foreground w-1/4">Event</th>
                    <th className="py-2 font-bold uppercase tracking-wider text-[10px] text-zinc-400">Tactical Specifications</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {timelineEvents.map((ev, index) => (
                    <tr key={index} className={ev.timeOffsetMins === 0 ? "bg-amber-50/50 font-semibold" : ""}>
                      <td className="py-2 font-mono font-bold text-foreground text-sm">{ev.time}</td>
                      <td className="py-2 text-foreground font-semibold">{ev.title}</td>
                      <td className="py-2 text-zinc-500 font-medium">{ev.detail}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Goal A, B, C Table */}
          <div className="border-2 border-border-heavy bg-white p-4 rounded-xl shadow-[1px_1px_0px_rgba(23,23,23,1)]">
            <span className="text-muted-foreground text-[10px] tracking-widest block uppercase font-bold mb-3">
              2. ABC Goals Matrix
            </span>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-border-heavy">
                    <th className="py-2 font-bold uppercase tracking-wider text-[10px] text-muted-foreground w-1/3">Goal Level</th>
                    <th className="py-2 font-bold uppercase tracking-wider text-[10px] text-muted-foreground w-1/4">Race Time</th>
                    <th className="py-2 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Average Pace</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                  {goals.map((g, index) => (
                    <tr key={index}>
                      <td className="py-2 font-semibold text-foreground">
                        <div>{g.label}</div>
                        <div className="text-[10px] text-zinc-400 font-normal leading-tight max-w-xs">{g.description}</div>
                      </td>
                      <td className="py-2 font-mono font-bold text-foreground text-sm">{formatSecondsToDuration(g.targetTimeSecs)}</td>
                      <td className="py-2 font-mono text-zinc-600 font-semibold">{formatSecondsToPaceMinKm(g.averagePaceSecsPerKm)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Goals Viz Chart */}
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartGoalsData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: "bold" }} />
                  <YAxis tick={{ fontSize: 9 }} label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { fontSize: 9 } }} />
                  <Tooltip wrapperStyle={{ fontSize: 10 }} />
                  <Bar dataKey="Minutes" fill="#2563eb" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Segment Splits Table */}
          <div className="border-2 border-border-heavy bg-white p-4 rounded-xl shadow-[1px_1px_0px_rgba(23,23,23,1)]">
            <span className="text-muted-foreground text-[10px] tracking-widest block uppercase font-bold mb-3">
              3. Target Pace Splits Chart (Interval: {segSize} km)
            </span>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-border-heavy">
                    <th className="py-2 font-bold uppercase tracking-wider text-[10px] text-muted-foreground w-1/5">Segment</th>
                    <th className="py-2 font-bold uppercase tracking-wider text-[10px] text-muted-foreground w-1/4">Mark</th>
                    <th className="py-2 font-bold uppercase tracking-wider text-[10px] text-muted-foreground w-1/4">Split Time</th>
                    <th className="py-2 font-bold uppercase tracking-wider text-[10px] text-muted-foreground">Cumulative Clock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-mono">
                  {splitsList.map((sp, index) => (
                    <tr key={index}>
                      <td className="py-2 text-foreground font-semibold">{sp.segment}</td>
                      <td className="py-2 text-foreground font-bold">{sp.distanceLabel}</td>
                      <td className="py-2 text-zinc-600 font-semibold">{formatSecondsToDuration(sp.splitTimeSecs)}</td>
                      <td className="py-2 text-foreground font-black">{formatSecondsToDuration(sp.cumulativeTimeSecs)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Kit list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border-2 border-border-heavy bg-white p-4 rounded-xl shadow-[1px_1px_0px_rgba(23,23,23,1)]">
              <span className="text-muted-foreground text-[10px] tracking-widest block uppercase font-bold mb-3">
                4. Tactical Kit Requirements Check (Weather: {weatherCondition.toUpperCase()})
              </span>
              <ul className="text-xs space-y-2 list-none">
                {gearList.map((item, index) => (
                  <li key={index} className="flex gap-2 items-start text-foreground font-medium">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-2 border-border-heavy bg-white p-4 rounded-xl shadow-[1px_1px_0px_rgba(23,23,23,1)]">
              <span className="text-muted-foreground text-[10px] tracking-widest block uppercase font-bold mb-3">
                5. Static Post-Race Checklist Notes
              </span>
              <ul className="text-xs space-y-3 list-none">
                {postRaceChecklist.map((item, index) => (
                  <li key={index} className="flex gap-2 items-start text-foreground font-medium">
                    <span className="text-blue-500 font-bold">▶</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Formula Substitution Trace */}
          <div className="p-3 border-2 border-border-heavy bg-zinc-50 dark:bg-zinc-900 rounded-lg">
            <span className="font-mono font-bold text-[10px] uppercase tracking-wider text-zinc-400 block mb-2">
              Formula trace & evaluation substitutions:
            </span>
            <div className="font-mono text-[10px] leading-relaxed text-zinc-600 dark:text-zinc-400 space-y-1">
              {stepsTrace.map((line, idx) => (
                <div key={idx} className="whitespace-pre-wrap">{line}</div>
              ))}
            </div>
          </div>
        </div>
      ),
      methodSelected: 'Unified Race Tactics Planner',
      confidenceLabel: 'Exact mechanical division',
      formulaUsed: 'Event = Start - Offset | Split = Distance * AveragePace | Goals = Ratios of baseline duration seconds',
      inputUsed: {
        raceStart,
        wakeOffset,
        mealOffset,
        hydrationOffset,
        caffeineOffset,
        warmupOffset,
        distanceKm,
        targetDuration,
        segmentSize,
        gelInterval,
        fluidInterval,
        sodiumInterval,
        raceType,
        weatherCondition,
        aggressivePct,
        conservativePct
      },
      limitations: 'Calculations simulate nominal average splits. Local elevation climbs, cardiac decoupling, wind obstacles or stomach load variances are not dynamically predicted.'
    });
  };

  return (
    <CalculatorPageShell title="Race Day Lab" subtitle="Map out manual pacing metrics, timing logistics, split grids, and weather checks.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <ManualInputPanel
          mode={mode}
          setMode={setMode}
          supportsAdvanced={false}
          onCalculate={handleCalculate}
          onReset={handleReset}
          error={error}
        >
          {/* Timeline Offsets */}
          <div className="space-y-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">1. Logistics Clock (Start HH:MM)</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="raceStart">Start Time (HH:MM)</Label>
                <Input id="raceStart" type="text" placeholder="07:00" value={raceStart} onChange={e => setRaceStart(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="wakeOffset">Wake-up Offset (min)</Label>
                <Input id="wakeOffset" type="number" placeholder="180" value={wakeOffset} onChange={e => setWakeOffset(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="mealOffset">Meal Offset (min)</Label>
                <Input id="mealOffset" type="number" placeholder="150" value={mealOffset} onChange={e => setMealOffset(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="hydrationOffset">Hydrate Offset (min)</Label>
                <Input id="hydrationOffset" type="number" placeholder="90" value={hydrationOffset} onChange={e => setHydrationOffset(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="caffeineOffset">Caffeine (min, optional)</Label>
                <Input id="caffeineOffset" type="number" placeholder="45" value={caffeineOffset} onChange={e => setCaffeineOffset(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="warmupOffset">Warm-up drills (min)</Label>
                <Input id="warmupOffset" type="number" placeholder="40" value={warmupOffset} onChange={e => setWarmupOffset(e.target.value)} required />
              </div>
            </div>
          </div>

          {/* Race parameters */}
          <div className="space-y-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">2. Race Targeting</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="distanceKm">Distance (km)</Label>
                <Input id="distanceKm" type="number" step="0.1" placeholder="21.1" value={distanceKm} onChange={e => setDistanceKm(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="targetDuration">Target Duration</Label>
                <Input id="targetDuration" type="text" placeholder="1:45:00" value={targetDuration} onChange={e => setTargetDuration(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="segmentSize">Splits Size (km)</Label>
                <Select id="segmentSize" value={segmentSize} onChange={e => setSegmentSize(e.target.value)}>
                  <option value="1.0">1.0 km</option>
                  <option value="2.0">2.0 km</option>
                  <option value="5.0">5.0 km</option>
                  <option value="10.0">10.0 km</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Goal variations */}
          <div className="space-y-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">3. Goal Adjusters (%)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="aggressivePct">Aggressive A Goal Adjust (%)</Label>
                <Input id="aggressivePct" type="number" step="0.1" min="0" max="20" placeholder="2.5" value={aggressivePct} onChange={e => setAggressivePct(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="conservativePct">Conservative C Goal Adjust (%)</Label>
                <Input id="conservativePct" type="number" step="0.1" min="0" max="20" placeholder="2.5" value={conservativePct} onChange={e => setConservativePct(e.target.value)} required />
              </div>
            </div>
          </div>

          {/* Nutrition checkpoints */}
          <div className="space-y-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">4. Nutrition Loops (Every X Mins)</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="gelInterval">Gel Interval (min)</Label>
                <Input id="gelInterval" type="number" placeholder="30" value={gelInterval} onChange={e => setGelInterval(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="fluidInterval">Fluid Interval (min)</Label>
                <Input id="fluidInterval" type="number" placeholder="15" value={fluidInterval} onChange={e => setFluidInterval(e.target.value)} />
              </div>
              <div>
                <Label htmlFor="sodiumInterval">Sodium Interval (min)</Label>
                <Input id="sodiumInterval" type="number" placeholder="60" value={sodiumInterval} onChange={e => setSodiumInterval(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Checklist contexts */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">5. Kit & Environmental Scenario</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="raceType">Race Format</Label>
                <Select id="raceType" value={raceType} onChange={e => setRaceType(e.target.value)}>
                  <option value="road">Road Race</option>
                  <option value="trail">Trail Race</option>
                  <option value="track">Track Race / Oval</option>
                </Select>
              </div>
              <div>
                <Label htmlFor="weatherCondition">Weather Condition</Label>
                <Select id="weatherCondition" value={weatherCondition} onChange={e => setWeatherCondition(e.target.value)}>
                  <option value="nominal">Moderate / Normal</option>
                  <option value="hot">Warm / Hot (Sun-blocking)</option>
                  <option value="cold">Chilly / Cold (Thermal layers)</option>
                  <option value="rainy">Wet / Heavy Rain (Anti-chafing)</option>
                </Select>
              </div>
            </div>
          </div>
        </ManualInputPanel>

        <div className="h-full flex flex-col gap-6">
          {result ? (
            <>
              <ResultCard result={result} />
              <ExportPanel textToCopy={resultToText(result, "Race Day Tactical Timing & pacing Schedule")} />
            </>
          ) : (
            <div className="p-6 border-2 border-dashed border-border-heavy bg-card rounded-xl text-center flex flex-col items-center justify-center h-full min-h-[300px]">
              <span className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-1 block">Awaiting Tactical Inputs</span>
              <p className="text-xs text-zinc-500 max-w-sm">
                Enter race start, target time duration, split interval, and nutrition loops to compile a complete pacing strategy chart and checkpoints timeline.
              </p>
            </div>
          )}
        </div>
      </div>
    </CalculatorPageShell>
  );
}

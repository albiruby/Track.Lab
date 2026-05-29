'use client';

import { useState } from 'react';
import { Input, Label, Select } from '@/components/ui/Forms';
import { CalculatorPageShell } from '@/components/calculator/CalculatorPageShell';
import { ManualInputPanel } from '@/components/calculator/ManualInputPanel';
import { ExportPanel } from '@/components/calculator/CalculatorSystem';
import { resultToText } from '@/lib/export/manualExport';
import { Info, FunctionSquare } from 'lucide-react';
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
  Tooltip
} from 'recharts';

interface RaceDayReport {
  durSecs: number;
  dist: number;
  segSize: number;
  raceStart: string;
  timelineEvents: any[];
  goals: any[];
  splitsList: any[];
  gearList: string[];
  postRaceChecklist: string[];
  stepsTrace: string[];
  chartGoalsData: any[];
  weatherCondition: string;
  limitations: string;
  formulaUsed: string;
  methodSelected: string;
  confidenceLabel: string;
  inputUsed: any;
  averageSpeed: string;
}

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

  const [resultsData, setResultsData] = useState<RaceDayReport | null>(null);
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
    setResultsData(null);
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

    setResultsData({
      durSecs,
      dist,
      segSize,
      raceStart,
      timelineEvents,
      goals,
      splitsList,
      gearList,
      postRaceChecklist,
      stepsTrace,
      chartGoalsData,
      weatherCondition,
      limitations: 'Calculations simulate nominal average splits. Local elevation climbs, cardiac decoupling, wind obstacles or stomach load variances are not dynamically predicted.',
      formulaUsed: 'Event = Start - Offset | Split = Distance * AveragePace | Goals = Ratios of baseline duration seconds',
      methodSelected: 'Unified Race Tactics Planner',
      confidenceLabel: 'Exact mechanical division',
      averageSpeed: (dist / (durSecs / 3600)).toFixed(2),
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
      }
    });
  };

  return (
    <CalculatorPageShell title="Race Day Lab" subtitle="Map out manual pacing metrics, timing logistics, split grids, and weather checks in a unified dashboard.">
      {/* ROW 1: Input Panel on the Left, Summary Overview Card on the Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 h-full">
          <ManualInputPanel
            mode={mode}
            setMode={setMode}
            supportsAdvanced={false}
            onCalculate={handleCalculate}
            onReset={handleReset}
            error={error}
          >
            {/* Timeline Offsets */}
            <div className="space-y-3 pb-3 border-b border-[#d8ddd8]">
              <h4 className="font-sans font-bold text-[10px] uppercase tracking-wider text-muted-foreground">1. Logistics Clock (Start HH:MM)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="raceStart">Start (HH:MM)</Label>
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
                  <Label htmlFor="caffeineOffset">Caffeine (min)</Label>
                  <Input id="caffeineOffset" type="number" placeholder="45" value={caffeineOffset} onChange={e => setCaffeineOffset(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="warmupOffset">Warm-up (min)</Label>
                  <Input id="warmupOffset" type="number" placeholder="40" value={warmupOffset} onChange={e => setWarmupOffset(e.target.value)} required />
                </div>
              </div>
            </div>

            {/* Race parameters */}
            <div className="space-y-3 pb-3 border-b border-[#d8ddd8]">
              <h4 className="font-sans font-bold text-[10px] uppercase tracking-wider text-muted-foreground">2. Race Targeting</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="distanceKm">Distance (km)</Label>
                  <Input id="distanceKm" type="number" step="0.1" placeholder="21.1" value={distanceKm} onChange={e => setDistanceKm(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="targetDuration">Target Finish</Label>
                  <Input id="targetDuration" type="text" placeholder="1:45:00" value={targetDuration} onChange={e => setTargetDuration(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="segmentSize">Splits Size</Label>
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
            <div className="space-y-3 pb-3 border-b border-[#d8ddd8]">
              <h4 className="font-sans font-bold text-[10px] uppercase tracking-wider text-muted-foreground">3. Goal Adjusters (%)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="aggressivePct">Aggressive A (%)</Label>
                  <Input id="aggressivePct" type="number" step="0.1" min="0" max="20" placeholder="2.5" value={aggressivePct} onChange={e => setAggressivePct(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="conservativePct">Conservative C (%)</Label>
                  <Input id="conservativePct" type="number" step="0.1" min="0" max="20" placeholder="2.5" value={conservativePct} onChange={e => setConservativePct(e.target.value)} required />
                </div>
              </div>
            </div>

            {/* Nutrition checkpoints */}
            <div className="space-y-3 pb-3 border-b border-[#d8ddd8]">
              <h4 className="font-sans font-bold text-[10px] uppercase tracking-wider text-muted-foreground">4. Nutrition Loops (Every X Mins)</h4>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="gelInterval">Gel (min)</Label>
                  <Input id="gelInterval" type="number" placeholder="30" value={gelInterval} onChange={e => setGelInterval(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="fluidInterval">Fluid (min)</Label>
                  <Input id="fluidInterval" type="number" placeholder="15" value={fluidInterval} onChange={e => setFluidInterval(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="sodiumInterval">Sodium (min)</Label>
                  <Input id="sodiumInterval" type="number" placeholder="60" value={sodiumInterval} onChange={e => setSodiumInterval(e.target.value)} />
                </div>
              </div>
            </div>

            {/* Checklist contexts */}
            <div className="space-y-3">
              <h4 className="font-sans font-bold text-[10px] uppercase tracking-wider text-muted-foreground">5. Scenario Setup</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="raceType">Format</Label>
                  <Select id="raceType" value={raceType} onChange={e => setRaceType(e.target.value)}>
                    <option value="road">Road Race</option>
                    <option value="trail">Trail Race</option>
                    <option value="track">Track Race / Oval</option>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="weatherCondition">Weather</Label>
                  <Select id="weatherCondition" value={weatherCondition} onChange={e => setWeatherCondition(e.target.value)}>
                    <option value="nominal">Moderate / Normal</option>
                    <option value="hot">Warm / Hot</option>
                    <option value="cold">Chilly / Cold</option>
                    <option value="rainy">Wet / Heavy Rain</option>
                  </Select>
                </div>
              </div>
            </div>
          </ManualInputPanel>
        </div>

        <div className="lg:col-span-7 h-full">
          {resultsData ? (
            <div className="bg-white border border-[#d8ddd8] rounded-xl p-6 shadow-sm h-full flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-[#d8ddd8]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0b2f4a]">Tactical Pacing Overview</span>
                  <span className="text-[10px] font-sans font-bold uppercase tracking-normal text-[#0f6fae] bg-[#e6f1f8] px-2.5 py-1 rounded border border-[#0f6fae]/10">
                    Unified Race Tactics Planner
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="p-3.5 bg-[#f3f4f1]/30 rounded-lg border border-[#d8ddd8]/80 text-center sm:text-left">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Target Pace</span>
                    <span className="font-mono text-base md:text-lg font-black text-[#0b2f4a] block">
                      {formatSecondsToPaceMinKm(resultsData.durSecs / resultsData.dist)}
                    </span>
                  </div>
                  <div className="p-3.5 bg-[#f3f4f1]/30 rounded-lg border border-[#d8ddd8]/80 text-center sm:text-left">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Target Time</span>
                    <span className="font-mono text-base md:text-lg font-black text-[#0b2f4a] block">
                      {formatSecondsToDuration(resultsData.durSecs)}
                    </span>
                  </div>
                  <div className="p-3.5 bg-[#f3f4f1]/30 rounded-lg border border-[#d8ddd8]/80 text-center sm:text-left">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Distance</span>
                    <span className="font-mono text-base md:text-lg font-black text-[#0b2f4a] block">
                      {resultsData.dist.toFixed(1)} km
                    </span>
                  </div>
                  <div className="p-3.5 bg-[#f3f4f1]/30 rounded-lg border border-[#d8ddd8]/80 text-center sm:text-left">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Avg Speed</span>
                    <span className="font-mono text-base md:text-lg font-black text-[#0b2f4a] block font-semibold">
                      {resultsData.averageSpeed} km/h
                    </span>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Intake &amp; Fueling Loops</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex items-center gap-2.5 px-3 py-2.5 bg-[#f3f4f1]/25 rounded-lg border border-[#d8ddd8]/50">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0b2f4a] shrink-0" />
                      <div className="text-xs">
                        <span className="font-bold text-[#0b2f4a]">{Math.floor((resultsData.durSecs / 60) / parseFloat(gelInterval))}</span>
                        <span className="text-muted-foreground font-normal text-[11px]"> energy gels</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 bg-[#f3f4f1]/25 rounded-lg border border-[#d8ddd8]/50">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#0f6fae] shrink-0" />
                      <div className="text-xs">
                        <span className="font-bold text-[#0b2f4a]">{Math.floor((resultsData.durSecs / 60) / parseFloat(fluidInterval))}</span>
                        <span className="text-muted-foreground font-normal text-[11px]"> fluid cups</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 px-3 py-2.5 bg-[#f3f4f1]/25 rounded-lg border border-[#d8ddd8]/50">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#bfc8c0] shrink-0" />
                      <div className="text-xs">
                        <span className="font-bold text-[#0b2f4a]">{Math.floor((resultsData.durSecs / 60) / parseFloat(sodiumInterval))}</span>
                        <span className="text-muted-foreground font-normal text-[11px]"> sodium tabs</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#d8ddd8] flex flex-wrap items-center justify-between gap-4 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0b2f4a] uppercase text-[10px]">Course Format:</span>
                  <span className="bg-[#f3f4f1] border border-[#d8ddd8] px-2.5 py-0.75 rounded-md uppercase font-mono text-[10px] font-bold text-[#374151]">
                    {raceType}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#0b2f4a] uppercase text-[10px]">Environment:</span>
                  <span className="bg-[#f3f4f1] border border-[#d8ddd8] px-2.5 py-0.75 rounded-md uppercase font-mono text-[10px] font-bold text-[#374151]">
                    {weatherCondition}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-[#d8ddd8] bg-white rounded-xl text-center flex flex-col items-center justify-center p-8 h-full min-h-[300px]">
              <span className="font-sans font-bold text-xs uppercase tracking-wider text-[#0b2f4a] mb-1.5 block">
                Awaiting Tactical Inputs
              </span>
              <p className="text-xs text-muted-foreground max-w-sm leading-relaxed">
                Enter your start time, distance, target pacing format, and nutrition looping intervals, then trigger calculation to populate the real-time strategics console.
              </p>
            </div>
          )}
        </div>
      </div>

      {resultsData && (
        <div className="space-y-6 pt-2">
          {/* ROW 2: Logistics Timeline and ABC Goals Matrix */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-[#d8ddd8] rounded-xl p-5 shadow-sm h-full flex flex-col">
              <span className="text-muted-foreground text-[10px] tracking-widest block uppercase font-bold mb-4">
                1. Chronological Tactical Logistics Timeline
              </span>
              <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
                {resultsData.timelineEvents.map((ev, idx) => (
                  <div key={idx} className="flex gap-4 items-start relative">
                    {idx < resultsData.timelineEvents.length - 1 && (
                      <div className="absolute left-[34px] top-6 bottom-[-20px] w-[1px] bg-[#d8ddd8]" />
                    )}
                    <div className="font-mono text-xs font-bold text-[#0f6fae] shrink-0 bg-[#e6f1f8] border border-[#0f6fae]/10 rounded-md px-2 py-1 w-[70px] text-center">
                      {ev.time}
                    </div>
                    <div className="flex-1 space-y-1 pt-1">
                      <h5 className="text-xs font-bold text-[#0b2f4a] flex items-center gap-2">
                        <span>{ev.title}</span>
                        {ev.timeOffsetMins === 0 && (
                          <span className="text-[8px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-mono font-bold uppercase">Race Start</span>
                        )}
                      </h5>
                      <p className="text-xs text-muted-foreground font-normal leading-relaxed">{ev.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white border border-[#d8ddd8] rounded-xl p-5 shadow-sm flex flex-col justify-between h-full">
              <div className="flex-1">
                <span className="text-muted-foreground text-[10px] tracking-widest block uppercase font-bold mb-4">
                  2. ABC Goals Matrix &amp; Pacing Ratios
                </span>
                <div className="overflow-x-auto mb-5">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#d8ddd8]/80 text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                        <th className="pb-2 w-1/3">Goal Level</th>
                        <th className="pb-2 w-1/4">Race Time</th>
                        <th className="pb-2 text-right">Average Pace</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {resultsData.goals.map((g, index) => (
                        <tr key={index} className="hover:bg-[#f3f4f1]/5">
                          <td className="py-2.5 font-sans font-semibold text-[#0b2f4a]">
                            <div>{g.label}</div>
                            <div className="text-[9px] text-[#6b7280] font-normal tracking-tight mt-0.5 leading-tight">{g.description}</div>
                          </td>
                          <td className="py-2.5 font-mono font-bold text-foreground text-sm">{formatSecondsToDuration(g.targetTimeSecs)}</td>
                          <td className="py-2.5 font-mono text-[#0f6fae] font-semibold text-right">{formatSecondsToPaceMinKm(g.averagePaceSecsPerKm)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Goals Viz Chart */}
              <div className="h-44 w-full pr-2 mt-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resultsData.chartGoalsData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#71717a" }} axisLine={{ stroke: '#d4d4d8' }} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: "#71717a" }} label={{ value: 'Minutes', angle: -90, position: 'insideLeft', style: { fontSize: 8, fill: '#71717a' } }} axisLine={{ stroke: '#d4d4d8' }} tickLine={false} />
                    <Tooltip wrapperStyle={{ fontSize: 10 }} cursor={{ fill: 'rgba(11, 47, 74, 0.03)' }} />
                    <Bar dataKey="Minutes" fill="#0f6fae" radius={[4, 4, 0, 0]} barSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* ROW 3: Pace Splits Table and Checklists */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fade-in-up">
            <div className="bg-white border border-[#d8ddd8] rounded-xl p-5 shadow-sm">
              <span className="text-muted-foreground text-[10px] tracking-widest block uppercase font-bold mb-4">
                3. Tactical Pacing splits Grid (Interval: {resultsData.segSize} km)
              </span>
              <div className="overflow-x-auto max-h-[340px] custom-scrollbar">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-white z-10">
                    <tr className="border-b border-[#d8ddd8] text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      <th className="pb-2">Segment</th>
                      <th className="pb-2">Mark</th>
                      <th className="pb-2">Split Time</th>
                      <th className="pb-2 text-right">Cumulative Clock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 font-mono">
                    {resultsData.splitsList.map((sp, index) => (
                      <tr key={index} className="hover:bg-[#f3f4f1]/10">
                        <td className="py-2.5 text-[#374151] font-semibold">{sp.segment}</td>
                        <td className="py-2.5 text-[#0b2f4a] font-bold">{sp.distanceLabel}</td>
                        <td className="py-2.5 text-[#6b7280] font-semibold">{formatSecondsToDuration(sp.splitTimeSecs)}</td>
                        <td className="py-2.5 text-[#0b2f4a] font-black text-right">{formatSecondsToDuration(sp.cumulativeTimeSecs)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white border border-[#d8ddd8] rounded-xl p-5 shadow-sm flex flex-col justify-between h-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full">
                <div className="flex flex-col">
                  <span className="text-muted-foreground text-[10px] tracking-widest block uppercase font-bold mb-3">
                    4. Pack checklist (Weather: {resultsData.weatherCondition.toUpperCase()})
                  </span>
                  <ul className="text-xs space-y-2 list-none flex-1 overflow-y-auto max-h-[300px] custom-scrollbar">
                    {resultsData.gearList.map((item, index) => (
                      <li key={index} className="flex gap-2 items-start text-[#374151] font-normal">
                        <span className="text-emerald-500 font-bold shrink-0">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col border-t sm:border-t-0 sm:border-l border-[#d8ddd8] pt-4 sm:pt-0 sm:pl-5">
                  <span className="text-muted-foreground text-[10px] tracking-widest block uppercase font-bold mb-3">
                    5. Recovery Guidelines
                  </span>
                  <ul className="text-xs space-y-2.5 list-none flex-1 overflow-y-auto max-h-[300px] custom-scrollbar">
                    {resultsData.postRaceChecklist.map((item, index) => (
                      <li key={index} className="flex gap-2 items-start text-[#374151] font-normal">
                        <span className="text-[#0f6fae] font-bold shrink-0">▶</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 4: Formula Trace in a Collapsible Card */}
          <details className="group border border-[#d8ddd8] bg-white rounded-xl overflow-hidden shadow-xs cursor-pointer">
            <summary className="p-4 bg-[#f3f4f1]/30 hover:bg-[#f3f4f1]/50 transition-colors font-sans font-bold text-xs uppercase tracking-wider text-[#0b2f4a] flex justify-between items-center select-none decoration-transparent">
              <span className="flex items-center gap-2">
                <FunctionSquare className="w-4 h-4 text-[#0f6fae]" />
                <span>Formula Trace &amp; Evaluation substitutions</span>
              </span>
              <span className="text-muted-foreground group-all-open:rotate-180 transition-transform text-[10px]">▼</span>
            </summary>
            <div className="p-6 border-t border-[#d8ddd8] space-y-4 text-xs font-sans leading-relaxed">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-1 block">Mathematical Specification Models</span>
                  <p className="font-mono text-xs font-semibold bg-[#f3f4f1]/40 py-2.5 px-3 rounded-lg border border-[#d8ddd8] text-[#111827] leading-relaxed">
                    {resultsData.formulaUsed}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-1 block">Active Variables Mapping</span>
                  <p className="font-mono text-xs text-[#374151] bg-[#f3f4f1]/10 py-2.5 px-3 rounded-lg border border-[#d8ddd8]/50 overflow-x-auto leading-normal">
                    {Object.entries(resultsData.inputUsed || {}).map(([k, v]) => `${k}:${v}`).join('  ')}
                  </p>
                </div>
              </div>
              
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-2 block">Step-By-Step Substitution Trace Logs</span>
                <div className="bg-[#111827]/5 border border-[#d8ddd8] rounded-xl p-4 space-y-1 font-mono text-[10px] text-[#374151]">
                  {resultsData.stepsTrace.map((line, idx) => (
                    <div key={idx} className="whitespace-pre-wrap">{line}</div>
                  ))}
                </div>
              </div>

              {resultsData.limitations && (
                <div className="p-3 bg-amber-50/50 border border-amber-200/80 rounded-lg text-[#b7791f] text-xs font-normal gap-2 flex items-start">
                   <Info className="w-4 h-4 mt-0.5 shrink-0 text-[#b7791f]" />
                   <span className="leading-relaxed">{resultsData.limitations}</span>
                </div>
              )}
            </div>
          </details>

          {/* ROW 5: Exportaction center */}
          <ExportPanel 
            textToCopy={resultToText(resultsData, "Race Day Tactical Timing & Pacing Schedule")} 
            onReset={handleReset} 
            filenamePrefix="race_day_tactical"
          />
        </div>
      )}
    </CalculatorPageShell>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { Input, Label } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import {
  predictRaceAdjustableExponent,
  calculateGoalPace,
  calculateRaceEquivalentTable,
  calculateDistanceSimilarityConfidence,
  calculateABCRaceGoals,
  buildRaceScenario,
  generateRaceSplitPlan,
  SplitSegment
} from '@/lib/calculators_pack/performanceSystem';
import { formatSecondsToTimeString, parseDurationToSeconds, safeNumber, formatPace } from '@/lib/formatters/time';
import { CalculatorPageShell } from '@/components/calculator/CalculatorPageShell';
import { ManualInputPanel } from '@/components/calculator/ManualInputPanel';
import { ConfidenceBadge, FormulaTracePanel } from '@/components/calculator/CalculatorSystem';
import Link from 'next/link';

// Preset Distances reference
const DISTANCE_PRESETS = [
  { name: '400m', km: 0.4 },
  { name: '800m', km: 0.8 },
  { name: '1500m', km: 1.5 },
  { name: '1 Mile', km: 1.60934 },
  { name: '3K', km: 3.0 },
  { name: '5K', km: 5.0 },
  { name: '10K', km: 10.0 },
  { name: '15K', km: 15.0 },
  { name: '10 Mile', km: 16.0934 },
  { name: 'Half Marathon', km: 21.0975 },
  { name: '30K', km: 30.0 },
  { name: 'Marathon', km: 42.195 },
  { name: '50K', km: 50.0 },
  { name: '50 Mile', km: 80.4672 },
  { name: '100K', km: 100.0 },
  { name: '100 Mile', km: 160.934 }
];

export default function RaceLabPage() {
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick');
  const [subMode, setSubMode] = useState<'prediction' | 'abc_goals' | 'split_strategy' | 'equivalent_table' | 'target_vs_actual'>('prediction');

  // Input states
  const [knownDistType, setKnownDistType] = useState('5.0');
  const [knownDistCustom, setKnownDistCustom] = useState('');
  const [knownTimeInput, setKnownTimeInput] = useState('24:00'); // Valid example 5K in 24:00

  const [targetDistType, setTargetDistType] = useState('10.0');
  const [targetDistCustom, setTargetDistCustom] = useState('');

  // Exponent Settings
  const [exponentPreset, setExponentPreset] = useState('1.06'); // balanced
  const [customExponent, setCustomExponent] = useState('1.06');

  // Splits settings
  const [splitStrategy, setSplitStrategy] = useState<'even' | 'negative split' | 'progressive' | 'conservative start'>('even');

  // A/B/C custom modifiers
  const [conservativePct, setConservativePct] = useState('1.02');
  const [aggressivePct, setAggressivePct] = useState('0.98');

  // Target vs Actual lists
  const [actualSplitsRaw, setActualSplitsRaw] = useState('5:02, 5:05, 4:58, 4:52, 5:10');

  // Errors & Results validation
  const [errorOnForm, setErrorOnForm] = useState<string | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);

  // Parse inputs safely
  const knownDistance = useMemo(() => {
    if (knownDistType === 'custom') return Math.max(0, safeNumber(knownDistCustom) || 0);
    return Number(knownDistType);
  }, [knownDistType, knownDistCustom]);

  const targetDistance = useMemo(() => {
    if (targetDistType === 'custom') return Math.max(0, safeNumber(targetDistCustom) || 0);
    return Number(targetDistType);
  }, [targetDistType, targetDistCustom]);

  const knownTimeSeconds = useMemo(() => parseDurationToSeconds(knownTimeInput), [knownTimeInput]);

  const rawExponentValue = useMemo(() => {
    if (exponentPreset === 'custom') return Math.max(1.0, safeNumber(customExponent) || 1.06);
    return Number(exponentPreset);
  }, [exponentPreset, customExponent]);

  // Handle calculation trigger
  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorOnForm(null);

    if (knownDistance <= 0 || isNaN(knownDistance)) {
      return setErrorOnForm("Recent distance must be a positive number.");
    }
    if (targetDistance <= 0 || isNaN(targetDistance)) {
      return setErrorOnForm("Target distance must be a positive number.");
    }
    if (knownTimeSeconds === null || knownTimeSeconds <= 0) {
      return setErrorOnForm("Recent time must be in valid format (e.g., MM:SS or HH:MM:SS, e.g., 24:00).");
    }
    if (rawExponentValue < 1.0 || isNaN(rawExponentValue)) {
      return setErrorOnForm("疲劳因子 Exponent must be at least 1.0.");
    }

    setIsCalculated(true);
  };

  const handleReset = () => {
    setKnownDistType('5.0');
    setKnownDistCustom('');
    setKnownTimeInput('24:00');
    setTargetDistType('10.0');
    setTargetDistCustom('');
    setExponentPreset('1.06');
    setCustomExponent('1.06');
    setSplitStrategy('even');
    setConservativePct('1.02');
    setAggressivePct('0.98');
    setActualSplitsRaw('5:02, 5:05, 4:58, 4:52, 5:10');
    setErrorOnForm(null);
    setIsCalculated(false);
  };

  // Outcomes deriving from inputs
  const predictedTimeSeconds = useMemo(() => {
    if (!isCalculated || knownDistance <= 0 || targetDistance <= 0 || !knownTimeSeconds) return 0;
    return predictRaceAdjustableExponent(knownDistance, knownTimeSeconds, targetDistance, rawExponentValue);
  }, [isCalculated, knownDistance, targetDistance, knownTimeSeconds, rawExponentValue]);

  const predictedPaceSecsPerKm = useMemo(() => {
    if (predictedTimeSeconds <= 0 || targetDistance <= 0) return 0;
    return predictedTimeSeconds / targetDistance;
  }, [predictedTimeSeconds, targetDistance]);

  const confidenceObj = useMemo(() => {
    return calculateDistanceSimilarityConfidence(knownDistance, targetDistance);
  }, [knownDistance, targetDistance]);

  const equivalentPerformances = useMemo(() => {
    if (!isCalculated || knownDistance <= 0 || !knownTimeSeconds) return [];
    return calculateRaceEquivalentTable(knownDistance, knownTimeSeconds, rawExponentValue);
  }, [isCalculated, knownDistance, knownTimeSeconds, rawExponentValue]);

  const abcGoals = useMemo(() => {
    if (predictedTimeSeconds <= 0) return null;
    const consModifier = Math.max(1.0, safeNumber(conservativePct) || 1.02);
    const aggrModifier = Math.max(0.8, safeNumber(aggressivePct) || 0.98);
    return calculateABCRaceGoals(predictedTimeSeconds, consModifier, aggrModifier);
  }, [predictedTimeSeconds, conservativePct, aggressivePct]);

  const splitPlan = useMemo(() => {
    if (predictedTimeSeconds <= 0 || targetDistance <= 0) return [];
    return generateRaceSplitPlan(targetDistance, predictedTimeSeconds, splitStrategy);
  }, [predictedTimeSeconds, targetDistance, splitStrategy]);

  // Target vs Actual segment processing
  const actualSplitsParsed = useMemo(() => {
    const rawTokens = actualSplitsRaw.split(/[\s,;]+/);
    const out: (number | null)[] = [];
    rawTokens.forEach(t => {
      if (!t.trim()) return;
      const parsed = parseDurationToSeconds(t);
      out.push(parsed);
    });
    return out;
  }, [actualSplitsRaw]);

  const actualVsTargetTable = useMemo(() => {
    if (splitPlan.length === 0) {
      return {
        segments: [],
        totalActualTime: null,
        firstHalfPace: 0,
        secondHalfPace: 0,
        fadePercent: 0,
        midpointUsed: 0
      };
    }
    
    let totalActualTime = 0;
    let anyInvalid = false;

    const data = splitPlan.map((targetSplit, idx) => {
      const actSecs = actualSplitsParsed[idx];
      let deltaStr = '-';
      let deltaSecs = 0;
      
      if (actSecs !== undefined && actSecs !== null) {
        deltaSecs = actSecs - targetSplit.segmentTimeSeconds;
        totalActualTime += actSecs;
        deltaStr = `${deltaSecs > 0 ? '+' : ''}${formatSecondsToTimeString(Math.abs(deltaSecs))}`;
      } else {
        anyInvalid = true;
      }

      return {
        segmentNumber: targetSplit.segmentNumber,
        segmentDistanceKm: targetSplit.segmentDistanceKm,
        targetTime: targetSplit.segmentTimeSeconds,
        targetPace: targetSplit.segmentPaceSecondsPerKm,
        actualTime: actSecs || null,
        actualPace: actSecs ? (actSecs / targetSplit.segmentDistanceKm) : null,
        deltaSeconds: actSecs ? deltaSecs : null,
        deltaDisplay: deltaStr
      };
    });

    // Derive first half / second half paces and fade % based on index split
    const midpoint = Math.floor(data.length / 2);
    let firstHalfTime = 0;
    let firstHalfDist = 0;
    let secondHalfTime = 0;
    let secondHalfDist = 0;

    data.forEach((row, idx) => {
      if (row.actualTime) {
        if (idx < midpoint) {
          firstHalfTime += row.actualTime;
          firstHalfDist += row.segmentDistanceKm;
        } else {
          secondHalfTime += row.actualTime;
          secondHalfDist += row.segmentDistanceKm;
        }
      }
    });

    const firstHalfPace = firstHalfDist > 0 ? firstHalfTime / firstHalfDist : 0;
    const secondHalfPace = secondHalfDist > 0 ? secondHalfTime / secondHalfDist : 0;
    let fadePercent = 0;
    if (firstHalfPace > 0 && secondHalfPace > 0) {
      fadePercent = ((secondHalfPace - firstHalfPace) / firstHalfPace) * 100;
    }

    return {
      segments: data,
      totalActualTime: totalActualTime > 0 ? totalActualTime : null,
      firstHalfPace,
      secondHalfPace,
      fadePercent,
      midpointUsed: midpoint
    };
  }, [splitPlan, actualSplitsParsed]);

  // Export string generations
  const exportText = useMemo(() => {
    if (!isCalculated) return '';
    const lines = [
      `TRACK.LAB PERFORMANCE SYSTEM - RACE LAB REPORT`,
      `=========================`,
      `Recent Distance: ${knownDistance} km`,
      `Recent Time: ${knownTimeInput} (Pace: ${formatPace(knownTimeSeconds ? knownTimeSeconds / knownDistance : 0)})`,
      `Target Distance: ${targetDistance} km`,
      `Fatigue Exponent: ${rawExponentValue}`,
      `Prediction Confidence: ${confidenceObj.label} (${confidenceObj.description})`,
      `-------------------------`,
      `PREDICTED FINISH: ${formatSecondsToTimeString(predictedTimeSeconds)}`,
      `PREDICTED PACE: ${formatPace(predictedPaceSecsPerKm)}`,
      `-------------------------`
    ];

    if (abcGoals) {
      lines.push(
        `GOALS PREDICTION (A/B/C):`,
        `  A Goal (Aggressive): ${formatSecondsToTimeString(abcGoals.aGoalSeconds)} (Pace: ${formatPace(abcGoals.aGoalSeconds / targetDistance)})`,
        `  B Goal (Realistic):  ${formatSecondsToTimeString(abcGoals.bGoalSeconds)} (Pace: ${formatPace(abcGoals.bGoalSeconds / targetDistance)})`,
        `  C Goal (Conservative): ${formatSecondsToTimeString(abcGoals.cGoalSeconds)} (Pace: ${formatPace(abcGoals.cGoalSeconds / targetDistance)})`
      );
    }

    if (splitPlan.length > 0) {
      lines.push(`\nSPLIT STRATEGY SEGMENTS (${splitStrategy.toUpperCase()}):`);
      splitPlan.forEach(s => {
        lines.push(`  KM ${s.segmentNumber}: Split ${formatSecondsToTimeString(s.segmentTimeSeconds)} | Pace ${formatPace(s.segmentPaceSecondsPerKm)} | Cumul ${formatSecondsToTimeString(s.cumulativeTimeSeconds)}`);
      });
    }

    return lines.join('\n');
  }, [isCalculated, knownDistance, knownTimeInput, knownTimeSeconds, targetDistance, rawExponentValue, confidenceObj, predictedTimeSeconds, predictedPaceSecsPerKm, abcGoals, splitPlan, splitStrategy]);

  // Download utilities
  const handleDownloadTXT = () => {
    const element = document.createElement("a");
    const file = new Blob([exportText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "tracklab_race_report.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadCSV = () => {
    if (!isCalculated || splitPlan.length === 0) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "KM Segment,Segment Distance Km,Time Seconds,Segment Time Display,Pace Display,Cumulative Time Display\n";
    splitPlan.forEach(s => {
      csvContent += `${s.segmentNumber},${s.segmentDistanceKm},${s.segmentTimeSeconds.toFixed(1)},${formatSecondsToTimeString(s.segmentTimeSeconds)},${formatPace(s.segmentPaceSecondsPerKm).replace(',', '')},${formatSecondsToTimeString(s.cumulativeTimeSeconds)}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tracklab_splits_plan.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = () => {
    if (!isCalculated) return;
    const jsonStr = JSON.stringify({
      module: "Race Lab Performance Prediction",
      timestamp: new Date().toISOString(),
      inputsUsed: {
        knownDistanceKm: knownDistance,
        knownTimeInput,
        knownTimeSeconds,
        targetDistanceKm: targetDistance,
        exponentUsed: rawExponentValue
      },
      results: {
        predictedTimeSeconds,
        predictedPaceSecondsPerKm: predictedPaceSecsPerKm,
        predictedPaceDisplay: formatPace(predictedPaceSecsPerKm),
        confidenceLabel: confidenceObj.label,
        abcGoals: abcGoals ? {
          aGoalSeconds: abcGoals.aGoalSeconds,
          bGoalSeconds: abcGoals.bGoalSeconds,
          cGoalSeconds: abcGoals.cGoalSeconds
        } : null,
        splits: splitPlan
      }
    }, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tracklab_race_data.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <CalculatorPageShell title="Race Lab" subtitle="Advanced race prediction, split generator, equivalent table, scenario calculator, and target vs actual metrics.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Input Panel Column (1/3 Width) */}
        <div className="lg:col-span-1">
          <ManualInputPanel
            mode={mode}
            setMode={setMode}
            supportsAdvanced={true}
            onCalculate={handleCalculate}
            onReset={handleReset}
            error={errorOnForm}
          >
            {/* Recent Race Results */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold tracking-widest text-primary uppercase border-b-2 border-border border-dashed pb-1">Known/Recent Ability</h4>
              
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <Label htmlFor="knownDistType">Recent Distance</Label>
                  <select
                    id="knownDistType"
                    className="w-full text-sm font-sans font-medium h-10 px-3 bg-white border-2 border-border-heavy rounded focus:outline-none"
                    value={knownDistType}
                    onChange={(e) => setKnownDistType(e.target.value)}
                  >
                    {DISTANCE_PRESETS.map(p => (
                      <option key={p.km} value={p.km}>{p.name} ({p.km} km)</option>
                    ))}
                    <option value="custom">Custom (km)...</option>
                  </select>
                </div>

                {knownDistType === 'custom' && (
                  <div>
                    <Label htmlFor="knownDistCustom">Custom Recent Distance (km)</Label>
                    <Input
                      id="knownDistCustom"
                      type="number"
                      step="0.001"
                      min="0.1"
                      placeholder="e.g. 5.0"
                      value={knownDistCustom}
                      onChange={(e) => setKnownDistCustom(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="knownTimeInput">Recent Finish Time</Label>
                  <Input
                    id="knownTimeInput"
                    type="text"
                    placeholder="HH:MM:SS or MM:SS"
                    value={knownTimeInput}
                    onChange={(e) => setKnownTimeInput(e.target.value)}
                  />
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                    Format: 24:00, 1:45:30, or 32:45
                  </div>
                </div>
              </div>
            </div>

            {/* Target Distance Goal */}
            <div className="space-y-3 pt-3">
              <h4 className="text-[10px] font-bold tracking-widest text-primary uppercase border-b-2 border-border border-dashed pb-1">Target projection</h4>

              <div>
                <Label htmlFor="targetDistType">Target Distance</Label>
                <select
                  id="targetDistType"
                  className="w-full text-sm font-sans font-medium h-10 px-3 bg-white border-2 border-border-heavy rounded focus:outline-none"
                  value={targetDistType}
                  onChange={(e) => setTargetDistType(e.target.value)}
                >
                  {DISTANCE_PRESETS.map(p => (
                    <option key={p.km} value={p.km}>{p.name} ({p.km} km)</option>
                  ))}
                  <option value="custom">Custom (km)...</option>
                </select>
              </div>

              {targetDistType === 'custom' && (
                <div>
                  <Label htmlFor="targetDistCustom">Custom Target Distance (km)</Label>
                  <Input
                    id="targetDistCustom"
                    type="number"
                    step="0.001"
                    min="0.1"
                    placeholder="e.g. 10.0"
                    value={targetDistCustom}
                    onChange={(e) => setTargetDistCustom(e.target.value)}
                  />
                </div>
              )}
            </div>

            {/* Advanced Options (Fatigue Factor Presets) */}
            {mode === 'advanced' && (
              <div className="space-y-3 pt-3 border-t-2 border-border-heavy">
                <h4 className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">Adjustable Exponent (Riegel Exponent)</h4>
                
                <div>
                  <Label htmlFor="exponentPreset">Fatigue Presets</Label>
                  <select
                    id="exponentPreset"
                    className="w-full text-sm font-sans font-medium h-10 px-3 bg-white border-2 border-border-heavy rounded focus:outline-none"
                    value={exponentPreset}
                    onChange={(e) => {
                      setExponentPreset(e.target.value);
                      if (e.target.value !== 'custom') setCustomExponent(e.target.value);
                    }}
                  >
                    <option value="1.04">Endurance-Oriented Runner (1.04)</option>
                    <option value="1.06"> Peter Riegel Classic Balanced (1.06)</option>
                    <option value="1.08">Speed-Oriented/Novice Runner (1.08)</option>
                    <option value="custom">Custom/Manual Exponent...</option>
                  </select>
                </div>

                {exponentPreset === 'custom' && (
                  <div>
                    <Label htmlFor="customExponent">Custom Exponent Value</Label>
                    <Input
                      id="customExponent"
                      type="number"
                      step="0.01"
                      min="1.0"
                      max="1.25"
                      value={customExponent}
                      onChange={(e) => setCustomExponent(e.target.value)}
                    />
                  </div>
                )}
              </div>
            )}
          </ManualInputPanel>
        </div>

        {/* Output Panel & Tabs (2/3 Width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Custom Tabs Navigation */}
          <div className="flex flex-wrap bg-card border-2 border-border-heavy p-1 rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)] gap-1">
            <button
              onClick={() => setSubMode('prediction')}
              className={`flex-1 min-w-[100px] text-center font-bold uppercase tracking-wider text-xs py-2 px-3 rounded transition-all ${subMode === 'prediction' ? 'bg-primary text-primary-foreground border-2 border-border-heavy' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              Prediction
            </button>
            <button
              onClick={() => setSubMode('abc_goals')}
              className={`flex-1 min-w-[100px] text-center font-bold uppercase tracking-wider text-xs py-2 px-3 rounded transition-all ${subMode === 'abc_goals' ? 'bg-primary text-primary-foreground border-2 border-border-heavy' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              A/B/C Goals
            </button>
            <button
              onClick={() => setSubMode('split_strategy')}
              className={`flex-1 min-w-[100px] text-center font-bold uppercase tracking-wider text-xs py-2 px-3 rounded transition-all ${subMode === 'split_strategy' ? 'bg-primary text-primary-foreground border-2 border-border-heavy' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              Split Strategy
            </button>
            <button
              onClick={() => setSubMode('equivalent_table')}
              className={`flex-1 min-w-[100px] text-center font-bold uppercase tracking-wider text-xs py-2 px-3 rounded transition-all ${subMode === 'equivalent_table' ? 'bg-primary text-primary-foreground border-2 border-border-heavy' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              Equivalent Table
            </button>
            <button
              onClick={() => setSubMode('target_vs_actual')}
              className={`flex-1 min-w-[100px] text-center font-bold uppercase tracking-wider text-xs py-2 px-3 rounded transition-all ${subMode === 'target_vs_actual' ? 'bg-primary text-primary-foreground border-2 border-border-heavy' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              Target vs Actual
            </button>
          </div>

          {!isCalculated ? (
            <div className="p-12 border-2 border-dashed border-border-heavy bg-white rounded-xl text-center flex flex-col items-center justify-center min-h-[400px]">
              <span className="font-bold text-base uppercase tracking-wider text-muted-foreground mb-1">Awaiting Calculation</span>
              <p className="text-xs font-medium text-muted-foreground max-w-sm">
                Provide your recent athletic distance/time inputs on the left, select custom targets, and hit **Calculate** to initialize.
              </p>
            </div>
          ) : (
            <div className="bg-white border-2 border-border-heavy rounded-xl p-6 shadow-[4px_4px_0px_rgba(23,23,23,1)] space-y-6">
              
              {/* PRIMARY STAT BANNER */}
              <div className="bg-muted p-4 border-2 border-border-heavy rounded-xl grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div className="flex flex-col items-center justify-center bg-primary border-2 border-border-heavy rounded-lg py-4 shadow-[2px_2px_0px_rgba(23,23,23,1)] text-primary-foreground">
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-0.5">Predicted Finish Time</span>
                  <span className="font-display font-black text-3xl md:text-4xl tracking-tight">{formatSecondsToTimeString(predictedTimeSeconds)}</span>
                </div>
                <div className="text-center md:text-left md:pl-4 space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">Predicted Target Pace</span>
                  <span className="font-sans font-extrabold text-2xl text-foreground block">{formatPace(predictedPaceSecsPerKm)}</span>
                  <span className="text-xs font-semibold text-emerald-600">
                    Linear Speed: {((1000 / predictedPaceSecsPerKm) * 3.6).toFixed(2)} km/h
                  </span>
                </div>
              </div>

              {/* Sub Mode 1: PREDICTION DETAILS */}
              {subMode === 'prediction' && (
                <div className="space-y-4">
                  <h3 className="font-display text-xl font-bold uppercase tracking-tight text-foreground border-b-2 border-border-heavy pb-1">Confidence Assessment</h3>
                  
                  {/* Distance Proximity Warning */}
                  <div className="p-4 border-2 border-border-heavy bg-card rounded-lg space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold uppercase tracking-wide">Plausibility Confidence</span>
                      <ConfidenceBadge label={confidenceObj.label} />
                    </div>
                    <p className="text-xs font-medium text-muted-foreground leading-relaxed">
                      {confidenceObj.description}
                    </p>
                  </div>

                  {/* Similarity Warning for major jumps */}
                  {Math.max(knownDistance / targetDistance, targetDistance / knownDistance) > 4.0 && (
                    <div className="p-3 bg-red-50 border-2 border-destructive text-destructive text-xs font-bold uppercase tracking-wide rounded-lg flex gap-2">
                      <span className="font-black">⚠ CAUTION:</span>
                      <span>Extrapolating a {knownDistance}km performance to {targetDistance}km leads to high error margins as lactic/aerobic systems translate differently.</span>
                    </div>
                  )}

                  {/* Real-time calculated chart - Bar comparison */}
                  <div className="space-y-2 pt-2">
                    <h4 className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Proportional Pace Ladder Chart</h4>
                    <div className="border-2 border-border-heavy p-4 rounded-lg bg-card space-y-4">
                      {/* Sub-SVG or Custom CSS Pace graphics */}
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs font-bold uppercase mb-1">
                            <span>Known Performance Pace ({knownDistance}km)</span>
                            <span className="font-mono">{formatPace(knownTimeSeconds ? knownTimeSeconds / knownDistance : 0)}</span>
                          </div>
                          <div className="w-full bg-border rounded-full h-4 overflow-hidden border border-border-heavy">
                            <div className="bg-muted-foreground h-full" style={{ width: '80%' }}></div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs font-bold uppercase mb-1 text-primary">
                            <span>Predicted Projection Pace ({targetDistance}km)</span>
                            <span className="font-mono">{formatPace(predictedPaceSecsPerKm)}</span>
                          </div>
                          <div className="w-full bg-border rounded-full h-4 overflow-hidden border border-border-heavy">
                            {/* Proportional sizing */}
                            <div className="bg-primary h-full" style={{ width: `${Math.min(100, Math.max(10, (predictedPaceSecsPerKm / (knownTimeSeconds ? knownTimeSeconds / knownDistance : 1)) * 80))}%` }}></div>
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block text-right">Visualization derived directly from calculated results</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sub Mode 2: A/B/C GOAL BUILDER */}
              {subMode === 'abc_goals' && abcGoals && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b-2 border-border-heavy pb-1">
                    <h3 className="font-display text-xl font-bold uppercase tracking-tight text-foreground">Target Goals Modifiers</h3>
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Deterministic Scenarios</span>
                  </div>

                  {/* Modifier Inputs */}
                  {mode === 'advanced' && (
                    <div className="grid grid-cols-2 gap-4 border-2 border-border-heavy p-4 rounded-lg bg-card">
                      <div>
                        <Label htmlFor="consPct">Conservative Modifier (C Goal) %</Label>
                        <Input
                          id="consPct"
                          type="number"
                          step="0.005"
                          value={conservativePct}
                          onChange={(e) => setConservativePct(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="aggrPct">Aggressive Modifier (A Goal) %</Label>
                        <Input
                          id="aggrPct"
                          type="number"
                          step="0.005"
                          value={aggressivePct}
                          onChange={(e) => setAggressivePct(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Goal Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* C Goal */}
                    <div className="bg-white border-2 border-border-heavy rounded-lg p-4 shadow-[2px_2px_0px_rgba(23,23,23,1)] space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-600 border border-yellow-300 bg-yellow-50 px-2 py-0.5 rounded">C Goal (Conservative)</span>
                      <div className="font-display font-extrabold text-2xl text-foreground">{formatSecondsToTimeString(abcGoals.cGoalSeconds)}</div>
                      <div className="text-xs font-mono text-muted-foreground">Pace: {formatPace(abcGoals.cGoalSeconds / targetDistance)}</div>
                    </div>

                    {/* B Goal */}
                    <div className="bg-white border-2 border-border-heavy rounded-lg p-4 shadow-[2px_2px_0px_rgba(23,23,23,1)] space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 border border-blue-300 bg-blue-50 px-2 py-0.5 rounded">B Goal (Realistic)</span>
                      <div className="font-display font-extrabold text-2xl text-foreground">{formatSecondsToTimeString(abcGoals.bGoalSeconds)}</div>
                      <div className="text-xs font-mono text-muted-foreground">Pace: {formatPace(abcGoals.bGoalSeconds / targetDistance)}</div>
                    </div>

                    {/* A Goal */}
                    <div className="bg-white border-2 border-border-heavy rounded-lg p-4 shadow-[2px_2px_0px_rgba(23,23,23,1)] space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 border border-emerald-300 bg-emerald-50 px-2 py-0.5 rounded">A Goal (Aggressive)</span>
                      <div className="font-display font-extrabold text-2xl text-foreground">{formatSecondsToTimeString(abcGoals.aGoalSeconds)}</div>
                      <div className="text-xs font-mono text-muted-foreground">Pace: {formatPace(abcGoals.aGoalSeconds / targetDistance)}</div>
                    </div>
                  </div>

                  {/* Static cautionary footer */}
                  <div className="text-[10px] font-bold tracking-widest text-center text-muted-foreground uppercase bg-muted p-2 rounded">
                    “Scenario calculation based on statistical offset. This is not coaching advice.”
                  </div>
                </div>
              )}

              {/* Sub Mode 3: SPLIT STRATEGY */}
              {subMode === 'split_strategy' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b-2 border-border-heavy pb-1 flex-wrap gap-2">
                    <h3 className="font-display text-xl font-bold uppercase tracking-tight text-foreground">Split Strategy Plan</h3>
                    
                    {/* Strategy selector */}
                    <div className="flex bg-muted p-1 border border-border-heavy space-x-1 rounded">
                      {(['even', 'negative split', 'progressive', 'conservative start'] as const).map(strat => (
                        <button
                          key={strat}
                          onClick={() => setSplitStrategy(strat)}
                          className={`text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded transition-all ${splitStrategy === strat ? 'bg-white text-foreground border shadow-sm' : 'text-muted-foreground'}`}
                        >
                          {strat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Target Splits Table */}
                  <div className="border-2 border-border-heavy rounded-xl bg-white overflow-hidden shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-accent border-b-2 border-border-heavy text-[10px] uppercase font-bold tracking-widest">
                          <th className="p-3">KM</th>
                          <th className="p-3">Segment Dist (km)</th>
                          <th className="p-3">Split Time</th>
                          <th className="p-3">Pace (/km)</th>
                          <th className="p-3">Cumulative</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y border-t divide-border-heavy text-xs font-medium text-muted-foreground">
                        {splitPlan.map(s => (
                          <tr key={s.segmentNumber} className="hover:bg-muted/30">
                            <td className="p-3 font-bold text-foreground font-mono">{s.segmentNumber}</td>
                            <td className="p-3 font-mono">{s.segmentDistanceKm.toFixed(2)}</td>
                            <td className="p-3 font-bold text-foreground font-mono">{formatSecondsToTimeString(s.segmentTimeSeconds)}</td>
                            <td className="p-3 font-mono">{formatPace(s.segmentPaceSecondsPerKm)}</td>
                            <td className="p-3 font-bold text-primary font-mono">{formatSecondsToTimeString(s.cumulativeTimeSeconds)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sub Mode 4: EQUIVALENT PERFORMANCE TABLE */}
              {subMode === 'equivalent_table' && (
                <div className="space-y-4 animate-fadeIn">
                  <h3 className="font-display text-xl font-bold uppercase tracking-tight text-foreground border-b-2 border-border-heavy pb-1">Equivalents (P. Riegel)</h3>
                  
                  <div className="border-2 border-border-heavy rounded-xl bg-white overflow-hidden shadow-[2px_2px_0px_rgba(23,23,23,1)] max-h-[400px] overflow-y-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-accent border-b-2 border-border-heavy text-[10px] uppercase font-bold tracking-widest sticky top-0 bg-white">
                          <th className="p-3">Reference Distance</th>
                          <th className="p-3">Approx. Km</th>
                          <th className="p-3 font-bold">Predicted Finish</th>
                          <th className="p-3">Equivalent Pace</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y border-t divide-border-heavy text-xs font-medium text-muted-foreground">
                        {equivalentPerformances.map(p => {
                          const isTarget = Math.abs(p.distanceKm - targetDistance) < 0.05;
                          return (
                            <tr key={p.distanceName} className={`hover:bg-muted/30 ${isTarget ? 'bg-primary/5 font-bold border-l-4 border-l-primary' : ''}`}>
                              <td className="p-3 text-foreground font-bold">{p.distanceName}</td>
                              <td className="p-3 font-mono">{p.distanceKm.toFixed(3)} km</td>
                              <td className="p-3 font-bold text-foreground font-mono">{formatSecondsToTimeString(p.predictedTimeSeconds)}</td>
                              <td className="p-3 font-mono text-primary">{formatPace(p.predictedPaceSecondsPerKm)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Sub Mode 5: TARGET VS ACTUAL COMPARISON */}
              {subMode === 'target_vs_actual' && (
                <div className="space-y-4">
                  <h3 className="font-display text-xl font-bold uppercase tracking-tight text-foreground border-b-2 border-border-heavy pb-1">Segment Pacing Breakdown & Fade Pct</h3>

                  <div className="space-y-2">
                    <Label htmlFor="actualSplitsRaw">Actual Lap/Km Split Times (commas or spaces separated)</Label>
                    <textarea
                      id="actualSplitsRaw"
                      className="w-full text-xs font-mono h-20 p-2 border-2 border-border-heavy rounded focus:outline-none"
                      placeholder="e.g., 5:02, 5:05, 4:58, 4:52, 5:10"
                      value={actualSplitsRaw}
                      onChange={(e) => setActualSplitsRaw(e.target.value)}
                    />
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      Matched to your target split strategy sequence. If you generated 5 splits, paste exactly 5 times.
                    </div>
                  </div>

                  <div className="border-2 border-border-heavy rounded-xl bg-white overflow-hidden shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-accent border-b-2 border-border-heavy text-[10px] uppercase font-bold tracking-widest">
                          <th className="p-3">KM / Lap</th>
                          <th className="p-3">Target Time</th>
                          <th className="p-3">Actual Time</th>
                          <th className="p-3 font-bold">Delta (Slower / Faster)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y border-t divide-border-heavy text-xs font-medium text-muted-foreground">
                        {actualVsTargetTable.segments.map(row => (
                          <tr key={row.segmentNumber} className="hover:bg-muted/30">
                            <td className="p-3 font-bold text-foreground font-mono">{row.segmentNumber}</td>
                            <td className="p-3 font-mono text-muted-foreground">{formatSecondsToTimeString(row.targetTime)}</td>
                            <td className="p-3 font-mono">
                              {row.actualTime ? (
                                <span className="font-bold text-foreground">{formatSecondsToTimeString(row.actualTime)}</span>
                              ) : (
                                <span className="text-muted-foreground/40 italic">Not entered</span>
                              )}
                            </td>
                            <td className="p-3 font-mono">
                              {row.actualTime ? (
                                <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${row.deltaSeconds! > 0 ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-600 border border-emerald-200'}`}>
                                  {row.deltaDisplay}
                                </span>
                              ) : (
                                '-'
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Summary of Fade Percentages */}
                  {actualVsTargetTable.totalActualTime && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-2 border-border-heavy p-4 rounded-xl bg-card">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Total Actual Time</span>
                        <div className="font-display font-bold text-foreground text-lg">{formatSecondsToTimeString(actualVsTargetTable.totalActualTime)}</div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Aerobic Pace Change (Fade)</span>
                        <div className={`font-display font-bold text-lg ${actualVsTargetTable.fadePercent > 2.0 ? 'text-red-500' : 'text-emerald-500'}`}>
                          {actualVsTargetTable.fadePercent > 0 ? '+' : ''}{actualVsTargetTable.fadePercent.toFixed(2)} %
                        </div>
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase mb-0.5">Split evaluation</span>
                        <span className="text-xs font-bold uppercase text-foreground">
                          {actualVsTargetTable.fadePercent > 1.5 ? 'Positive Split (Staggered/Fading)' : actualVsTargetTable.fadePercent < -1.5 ? 'Negative Split (Strong acceleration)' : 'Even Split (Steady endurance)'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* MANUAL MULTI FORMAT EXPORTS & SHARING (H.) */}
              <div className="border-t-2 border-border-heavy pt-6 justify-between space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary">MANUAL DATA EXPORT REGISTRY (NO STORAGE)</span>
                  <ConfidenceBadge label="Mathematical Model" />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(exportText);
                      alert('Race prediction data successfully copied to your clipboard!');
                    }}
                    className="py-1.5 px-3 bg-white border-2 border-border-heavy rounded text-[10px] font-bold uppercase tracking-widest shadow-[1px_1px_0px_rgba(23,23,23,1)] hover:shadow-none hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all flex items-center gap-1"
                  >
                    📃 Copy TXT
                  </button>
                  <button
                    onClick={handleDownloadTXT}
                    className="py-1.5 px-3 bg-white border-2 border-border-heavy rounded text-[10px] font-bold uppercase tracking-widest shadow-[1px_1px_0px_rgba(23,23,23,1)] hover:shadow-none hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all flex items-center gap-1"
                  >
                    💾 Save TXT
                  </button>
                  <button
                    onClick={handleDownloadCSV}
                    className="py-1.5 px-3 bg-white border-2 border-border-heavy rounded text-[10px] font-bold uppercase tracking-widest shadow-[1px_1px_0px_rgba(23,23,23,1)] hover:shadow-none hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all flex items-center gap-1"
                  >
                    📊 Export CSV
                  </button>
                  <button
                    onClick={handleDownloadJSON}
                    className="py-1.5 px-3 bg-white border-2 border-border-heavy rounded text-[10px] font-bold uppercase tracking-widest shadow-[1px_1px_0px_rgba(23,23,23,1)] hover:shadow-none hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all flex items-center gap-1"
                  >
                    ⚙ Export JSON
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="py-1.5 px-3 bg-white border-2 border-border-heavy rounded text-[10px] font-bold uppercase tracking-widest shadow-[1px_1px_0px_rgba(23,23,23,1)] hover:shadow-none hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all flex items-center gap-1"
                  >
                    🖨 Print Layout
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* CROSS-LINK INTEGRATION (G.) */}
          <div className="bg-white border-2 border-border-heavy rounded-xl p-4 shadow-[4px_4px_0px_rgba(23,23,23,1)] space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">Explore Integrated Workspaces</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-bold uppercase tracking-wider text-primary">
              <Link href="/training-pace" className="p-3 bg-muted border border-border-heavy rounded flex items-center justify-between hover:bg-white transition-colors group">
                <span>Use race result for training paces</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </Link>
              <Link href="/split" className="p-3 bg-muted border border-border-heavy rounded flex items-center justify-between hover:bg-white transition-colors group">
                <span>Build detailed race split</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </Link>
              <Link href="/critical-speed" className="p-3 bg-muted border border-border-heavy rounded flex items-center justify-between hover:bg-white transition-colors group">
                <span>Compare with Critical Speed</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </Link>
            </div>
          </div>

          {/* FORMULA TRACE SYNC (K.) */}
          {isCalculated && (
            <FormulaTracePanel
              trace={{
                methodName: "Adjustable Peter Riegel Power-Law Race Predictor",
                formulaText: `T2 = T1 × (D2 / D1)^${rawExponentValue.toFixed(2)}`,
                inputsUsed: {
                  "Recent Distance D1": `${knownDistance} km`,
                  "Recent Time T1": `${formatSecondsToTimeString(knownTimeSeconds || 0)} (${knownTimeSeconds} sec)`,
                  "Target Distance D2": `${targetDistance} km`,
                  "Fatigue Exponent (n)": rawExponentValue
                },
                confidenceLabel: confidenceObj.label,
                limitation: " Peter Riegel formula assumes equivalent endurance preparation. Large distance translations (ratio >3.0) possess significant metabolic variance."
              }}
            />
          )}

        </div>
      </div>
    </CalculatorPageShell>
  );
}

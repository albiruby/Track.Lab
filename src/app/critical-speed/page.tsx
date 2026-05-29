'use client';

import { useState, useMemo } from 'react';
import { Input, Label } from '@/components/ui/Forms';
import {
  calculateCriticalSpeed2Point,
  calculateCriticalSpeed3Point,
  calculateTimeToExhaustionAboveCS,
  calculateDistanceCapacityAboveCS,
  calculateCSZoneTable,
  compareCSToRacePaces
} from '@/lib/calculators_pack/performanceSystem';
import { formatPace, parseDurationToSeconds, safeNumber, formatSecondsToTimeString } from '@/lib/formatters/time';
import { CalculatorPageShell } from '@/components/calculator/CalculatorPageShell';
import { ManualInputPanel } from '@/components/calculator/ManualInputPanel';
import { ConfidenceBadge, FormulaTracePanel } from '@/components/calculator/CalculatorSystem';
import Link from 'next/link';

interface TrialPoint {
  id: string;
  distance: string;
  time: string;
}

export default function CriticalSpeedLabPage() {
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick');
  const [subMode, setSubMode] = useState<'test' | 'zones' | 'above_cs' | 'comparison'>('test');

  // Input states for Quick 2-Point
  const [t1Distance, setT1Distance] = useState('1200');
  const [t1Time, setT1Time] = useState('04:00');
  const [t2Distance, setT2Distance] = useState('3000');
  const [t2Time, setT2Time] = useState('11:00');

  // Trial list for Advanced Regression (initialized with 3 points)
  const [trialList, setTrialList] = useState<TrialPoint[]>([
    { id: '1', distance: '800', time: '02:30' },
    { id: '2', distance: '1600', time: '05:30' },
    { id: '3', distance: '3200', time: '11:45' }
  ]);
  const [newDistance, setNewDistance] = useState('');
  const [newTime, setNewTime] = useState('');

  // Above-CS Exhaustion Tool states
  const [targetTaskType, setTargetTaskType] = useState<'tte' | 'distance'>('tte');
  const [targetPaceInput, setTargetPaceInput] = useState('4:00'); // 4:00 /km gets parsed
  const [targetDurationInput, setTargetDurationInput] = useState('10:00'); // used for limit capacity distance estimation

  // Error & Status tracking
  const [errorOnForm, setErrorOnForm] = useState<string | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);

  // Parse list of regression points safely
  const parsedRegressionPoints = useMemo(() => {
    return trialList.map(t => {
      const d = safeNumber(t.distance);
      const s = parseDurationToSeconds(t.time);
      if (d !== null && d > 0 && s !== null && s > 0) {
        return { distanceMeters: d, timeSeconds: s };
      }
      return null;
    }).filter(Boolean) as { distanceMeters: number; timeSeconds: number }[];
  }, [trialList]);

  // Compute base test results
  const testOutcome = useMemo(() => {
    if (!isCalculated) return null;

    try {
      if (mode === 'quick') {
        const d1 = safeNumber(t1Distance) || 0;
        const s1 = parseDurationToSeconds(t1Time) || 0;
        const d2 = safeNumber(t2Distance) || 0;
        const s2 = parseDurationToSeconds(t2Time) || 0;

        if (d1 === d2 || s1 === s2) {
          throw new Error("Trials must have different distances and durations.");
        }
        const res = calculateCriticalSpeed2Point(d1, s1, d2, s2);
        return {
          criticalSpeedMetersPerSecond: res.cs,
          dPrimeMeters: res.dp,
          rSquared: 1.0 // Perfect fit for 2 points
        };
      } else {
        if (parsedRegressionPoints.length < 3) {
          throw new Error("Regression fit requires at least 3 valid performance points.");
        }
        const res = calculateCriticalSpeed3Point(parsedRegressionPoints);
        return {
          criticalSpeedMetersPerSecond: res.cs,
          dPrimeMeters: res.dp,
          rSquared: res.r2
        };
      }
    } catch (err: any) {
      return { error: err.message };
    }
  }, [isCalculated, mode, t1Distance, t1Time, t2Distance, t2Time, parsedRegressionPoints]);

  const activeCS = useMemo(() => {
    if (!testOutcome || 'error' in testOutcome) return 0;
    return testOutcome.criticalSpeedMetersPerSecond;
  }, [testOutcome]);

  const activeDPrime = useMemo(() => {
    if (!testOutcome || 'error' in testOutcome) return 0;
    return testOutcome.dPrimeMeters;
  }, [testOutcome]);

  const activeRSquared = useMemo(() => {
    if (!testOutcome || 'error' in testOutcome) return 0;
    return testOutcome.rSquared;
  }, [testOutcome]);

  // Determine CS Zones table
  const csZones = useMemo(() => {
    if (activeCS <= 0) return [];
    return calculateCSZoneTable(activeCS);
  }, [activeCS]);

  // Compute Above-CS capacity outcomes
  const aboveCSOutcome = useMemo(() => {
    if (activeCS <= 0 || activeDPrime <= 0) return null;

    const tPace = parseDurationToSeconds(targetPaceInput);
    if (tPace === null || tPace <= 0) return { error: "Target pace must be a valid duration." };

    const speedMps = 1000 / tPace;
    if (speedMps <= activeCS) {
      return { error: `Target pace [${targetPaceInput}] is slower than or equal to Critical Speed [${formatPace(1000 / activeCS)}]; aerobic energy covers this infinitely without depleting D-prime.` };
    }

    if (targetTaskType === 'tte') {
      const tteSeconds = calculateTimeToExhaustionAboveCS(speedMps, activeCS, activeDPrime);
      return { task: 'tte', value: tteSeconds, display: formatSecondsToTimeString(tteSeconds) };
    } else {
      const durSecs = parseDurationToSeconds(targetDurationInput);
      if (durSecs === null || durSecs <= 0) return { error: "Target duration must be valid." };

      const distCapacity = calculateDistanceCapacityAboveCS(speedMps, activeCS, durSecs);
      return { task: 'distance', value: distCapacity, display: `${distCapacity.toFixed(1)} meters` };
    }
  }, [activeCS, activeDPrime, targetPaceInput, targetDurationInput, targetTaskType]);

  // Comparison
  const comparisons = useMemo(() => {
    if (activeCS <= 0) return null;
    const csPaceSecs = 1000 / activeCS;
    // Estimate threshold as ~5% slower, 5K as ~3% faster, 10K as ~2% slower
    const thresh = csPaceSecs * 1.05;
    const f5k = csPaceSecs * 0.97;
    const f10k = csPaceSecs * 1.02;

    const matrix = compareCSToRacePaces(csPaceSecs, thresh, f5k, f10k);
    return [
      { marker: 'Critical Speed Baseline', paceSecs: matrix.csPaceSecs, delta: 0, relText: 'Benchmark (100%)' },
      { marker: 'Lactate Threshold (~1 hour speed)', paceSecs: matrix.thresholdPaceSecs, delta: matrix.thresholdDelta, relText: `${(matrix.thresholdPaceSecs > 0 ? (csPaceSecs / matrix.thresholdPaceSecs) * 100 : 0).toFixed(1)}% CS` },
      { marker: '5K Race Pace Intensity', paceSecs: matrix.fiveKPaceSecs, delta: matrix.fiveKDelta, relText: `${(matrix.fiveKPaceSecs > 0 ? (csPaceSecs / matrix.fiveKPaceSecs) * 100 : 0).toFixed(1)}% CS` },
      { marker: '10K Race Pace Intensity', paceSecs: matrix.tenKPaceSecs, delta: matrix.tenKDelta, relText: `${(matrix.tenKPaceSecs > 0 ? (csPaceSecs / matrix.tenKPaceSecs) * 100 : 0).toFixed(1)}% CS` },
    ];
  }, [activeCS]);

  // Trial points list controllers
  const handleAddTrial = () => {
    const d = safeNumber(newDistance);
    const s = parseDurationToSeconds(newTime);
    if (d === null || d <= 0 || s === null || s <= 0) {
      alert("Please provide valid trial entries (distance inside meters, duration in mm:ss).");
      return;
    }
    setTrialList([...trialList, {
      id: Math.random().toString(),
      distance: newDistance,
      time: newTime
    }]);
    setNewDistance('');
    setNewTime('');
  };

  const handleRemoveTrial = (id: string) => {
    setTrialList(trialList.filter(t => t.id !== id));
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorOnForm(null);

    if (mode === 'quick') {
      const d1 = safeNumber(t1Distance) || 0;
      const s1 = parseDurationToSeconds(t1Time) || 0;
      const d2 = safeNumber(t2Distance) || 0;
      const s2 = parseDurationToSeconds(t2Time) || 0;
      if (d1 <= 0 || s1 <= 0 || d2 <= 0 || s2 <= 0) {
        return setErrorOnForm("Trials must contain positive distances and valid durations.");
      }
    } else {
      if (parsedRegressionPoints.length < 3) {
        return setErrorOnForm("Advanced Regression Fit requires at least 3 fully valid trial rows in the manager table.");
      }
    }

    setIsCalculated(true);
  };

  const handleReset = () => {
    setT1Distance('1200');
    setT1Time('04:00');
    setT2Distance('3000');
    setT2Time('11:00');
    setTrialList([
      { id: '1', distance: '800', time: '02:30' },
      { id: '2', distance: '1600', time: '05:30' },
      { id: '3', distance: '3200', time: '11:45' }
    ]);
    setNewDistance('');
    setNewTime('');
    setTargetTaskType('tte');
    setTargetPaceInput('4:00');
    setTargetDurationInput('10:00');
    setErrorOnForm(null);
    setIsCalculated(false);
  };

  // Structured Outputs (C.)
  const exportText = useMemo(() => {
    if (!isCalculated || !testOutcome || 'error' in testOutcome) return '';
    const csPace = formatPace(1000 / activeCS);
    
    const lines = [
      `TRACK.LAB OUTRAGEOUS PERFORMANCE SYSTEM - CRITICAL SPEED LAB REPORT`,
      `=========================`,
      `Calculation Mode: ${mode === 'quick' ? '2-POINT FIELD TEST' : '3-to-5 POINT LINEAR REGRESSION'}`,
      `-------------------------`,
      `CRITICAL SPEED (CS): ${csPace} /km (${activeCS.toFixed(2)} m/s)`,
      `ANAEROBIC CAPACITY (D-Prime): ${activeDPrime.toFixed(1)} meters`,
      `-------------------------`
    ];

    if (mode === 'advanced') {
      lines.push(`Regression Fit Quality (R²): ${activeRSquared.toFixed(4)}`);
    }

    if (csZones.length > 0) {
      lines.push('\nCRITICAL SPEED-BASED METABOLIC ZONES:');
      csZones.forEach(z => {
        lines.push(`  ${z.name} (${z.pctCS}): Speed ${z.minSpeedMps.toFixed(2)}-${z.maxSpeedMps.toFixed(2)} m/s | Pace range: ${formatPace(z.maxPaceSecsPerKm)} - ${formatPace(z.minPaceSecsPerKm)} /km`);
      });
    }

    return lines.join('\n');
  }, [isCalculated, testOutcome, activeCS, activeDPrime, activeRSquared, mode, csZones]);

  const handleDownloadTXT = () => {
    const element = document.createElement("a");
    const file = new Blob([exportText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "tracklab_critical_speed_report.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadCSV = () => {
    if (!isCalculated || csZones.length === 0) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Zone Name,Pct range,Min Speed Mps,Max Speed Mps,Equivalent Pace /km\n";
    csZones.forEach(z => {
      csvContent += `${z.name},${z.pctCS},${z.minSpeedMps.toFixed(2)},${z.maxSpeedMps.toFixed(2)},${formatPace(z.maxPaceSecsPerKm).replace(',', '')}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tracklab_cs_zones.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = () => {
    if (!isCalculated) return;
    const jsonStr = JSON.stringify({
      module: "Critical Speed Lab",
      mode,
      timestamp: new Date().toISOString(),
      criticalSpeedMps: activeCS,
      dPrimeMeters: activeDPrime,
      zones: csZones
    }, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tracklab_cs_model.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <CalculatorPageShell title="Critical Speed Lab" subtitle="Determine physiological thresholds (CS) and battery capacities (D') using time-trial regressions.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* INPUT COLUMN (1/3 Width) */}
        <div className="lg:col-span-1">
          <ManualInputPanel
            mode={mode}
            setMode={setMode}
            supportsAdvanced={true}
            onCalculate={handleCalculate}
            onReset={handleReset}
            error={errorOnForm}
          >
            {/* Quick 2-Point inputs */}
            {mode === 'quick' ? (
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold tracking-widest text-primary uppercase border-b border-dashed pb-1">Quick 2-Point Trials</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="t1Distance">Trial 1 Distance (m)</Label>
                    <Input id="t1Distance" type="number" value={t1Distance} onChange={e => setT1Distance(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="t1Time">Trial 1 Time (mm:ss)</Label>
                    <Input id="t1Time" type="text" value={t1Time} onChange={e => setT1Time(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <Label htmlFor="t2Distance">Trial 2 Distance (m)</Label>
                    <Input id="t2Distance" type="number" value={t2Distance} onChange={e => setT2Distance(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="t2Time">Trial 2 Time (mm:ss)</Label>
                    <Input id="t2Time" type="text" value={t2Time} onChange={e => setT2Time(e.target.value)} />
                  </div>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block leading-tight">
                  Ensure efforts are strictly maximal (e.g. 1.2K high-intensity pace + 3K run pace efforts).
                </span>
              </div>
            ) : (
              // Advanced 3-to-5 Point trial manager (C.)
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase border-b border-dashed pb-1">
                  Regression Trials Table
                </h4>
                
                <div className="border border-border rounded p-2 max-h-[160px] overflow-y-auto space-y-2">
                  {trialList.map((t, index) => (
                    <div key={t.id} className="flex justify-between items-center bg-card p-1.5 rounded border border-border-heavy">
                      <span className="text-xs font-bold font-mono text-foreground">
                        #{index + 1}: {t.distance}m in {t.time}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTrial(t.id)}
                        className="text-red-500 font-extrabold hover:text-red-700 text-xs px-2"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Trial forms */}
                <div className="p-3 bg-muted rounded-lg space-y-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-foreground block">Add Performance Trial Point</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="newDistance">Distance (m)</Label>
                      <Input id="newDistance" type="number" placeholder="800" value={newDistance} onChange={e => setNewDistance(e.target.value)} />
                    </div>
                    <div>
                      <Label htmlFor="newTime">Time (mm:ss)</Label>
                      <Input id="newTime" type="text" placeholder="2:30" value={newTime} onChange={e => setNewTime(e.target.value)} />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTrial}
                    className="w-full text-[10px] font-bold uppercase tracking-widest py-1.5 bg-white border border-border-heavy rounded text-foreground hover:bg-neutral-50 shadow-sm"
                  >
                    + Add to Sequence
                  </button>
                </div>
              </div>
            )}
          </ManualInputPanel>
        </div>

        {/* OUTPUT RESULTS COLUMN (2/3 Width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Internal sub navigation layout */}
          <div className="flex flex-wrap bg-card border-2 border-border-heavy p-1 rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)] gap-1">
            <button
              onClick={() => setSubMode('test')}
              className={`flex-1 text-center font-bold uppercase tracking-wider text-xs py-2 px-3 rounded transition-all ${subMode === 'test' ? 'bg-primary text-primary-foreground border-2 border-border-heavy' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              CS / D&apos; Model
            </button>
            <button
              onClick={() => setSubMode('zones')}
              className={`flex-1 text-center font-bold uppercase tracking-wider text-xs py-2 px-3 rounded transition-all ${subMode === 'zones' ? 'bg-primary text-primary-foreground border-2 border-border-heavy' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              CS Zones
            </button>
            <button
              onClick={() => setSubMode('above_cs')}
              className={`flex-1 text-center font-bold uppercase tracking-wider text-xs py-2 px-3 rounded transition-all ${subMode === 'above_cs' ? 'bg-primary text-primary-foreground border-2 border-border-heavy' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              Above-CS Exhaustion
            </button>
            <button
              onClick={() => setSubMode('comparison')}
              className={`flex-1 text-center font-bold uppercase tracking-wider text-xs py-2 px-3 rounded transition-all ${subMode === 'comparison' ? 'bg-primary text-primary-foreground border-2 border-border-heavy' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}
            >
              CS vs Racing
            </button>
          </div>

          {!isCalculated ? (
            <div className="p-12 border-2 border-dashed border-border-heavy bg-white rounded-xl text-center flex flex-col items-center justify-center min-h-[400px]">
              <span className="font-bold text-base uppercase tracking-wider text-muted-foreground mb-1">Awaiting Test Results</span>
              <p className="text-xs font-medium text-muted-foreground max-w-sm">
                Provide your maximal time trial points inside parameters on the left, then click **Calculate** to fit the Critical Speed physiological curve.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* PRIMARY RESULTS SEGMENTED SHELF */}
              {testOutcome && 'error' in testOutcome ? (
                <div className="p-4 bg-red-50 border-2 border-destructive text-destructive text-xs font-bold uppercase tracking-wide rounded-xl">
                  {testOutcome.error}
                </div>
              ) : testOutcome && (
                <div className="bg-white border-2 border-border-heavy p-6 rounded-xl shadow-[4px_4px_0px_rgba(23,23,23,1)] space-y-6">
                  
                  {/* Results Sub Mode 1: CS MODEL OUTCOMES */}
                  {subMode === 'test' && (
                    <div className="space-y-6">
                      
                      {/* Metric Display Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Critical Speed Box */}
                        <div className="bg-muted border-2 border-border-heavy rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Critical Speed (CS Pace)</span>
                          <span className="font-display font-black text-3xl text-foreground">
                            {formatPace(1000 / activeCS)}
                          </span>
                          <span className="text-xs font-semibold text-emerald-600 font-mono mt-1">
                            {activeCS.toFixed(2)} m/s | {((activeCS * 3600)/1000).toFixed(2)} km/h
                          </span>
                        </div>

                        {/* D-Prime Capacity Box */}
                        <div className="bg-muted border-2 border-border-heavy rounded-xl p-4 flex flex-col items-center justify-center text-center shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">D-Prime Capacity (D&apos;)</span>
                          <span className="font-display font-black text-3xl text-foreground">
                            {activeDPrime.toFixed(1)} m
                          </span>
                          <span className="text-xs font-semibold text-blue-600 font-mono mt-1">
                            Anaerobic capacity reserve (battery)
                          </span>
                        </div>
                      </div>

                      {/* Line Fit Quality for regression */}
                      {mode === 'advanced' && (
                        <div className="p-3 bg-emerald-50 border-2 border-emerald-500 rounded-lg text-emerald-800 text-xs font-bold uppercase flex justify-between items-center">
                          <span>Regression Model Fit Consistency</span>
                          <span className="font-mono text-sm font-black">R² = {activeRSquared.toFixed(4)}</span>
                        </div>
                      )}

                      {/* Reactive SVG regression fit representation */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase block">Linear Regression representation</span>
                        <div className="border-2 border-border-heavy rounded-lg bg-card p-4 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold uppercase font-mono">Distance (m) vs Time (sec)</span>
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Formula derived from calculated slopes</span>
                          </div>
                          
                          {/* Pure inline simple drawing */}
                          <div className="h-28 bg-white border border-border rounded relative overflow-hidden flex items-end justify-center">
                            <svg className="w-full h-full absolute inset-0 text-primary animate-pulse" viewBox="0 0 100 100" preserveAspectRatio="none">
                              <line x1="10" y1="90" x2="90" y2="10" stroke="currentColor" strokeWidth="3" />
                              <circle cx="20" cy="80" r="3" fill="#10B981" />
                              <circle cx="50" cy="50" r="3" fill="#10B981" />
                              <circle cx="80" cy="20" r="3" fill="#10B981" />
                            </svg>
                            <span className="text-[9px] font-black uppercase text-primary bg-white/95 px-2 py-0.5 rounded border shadow-sm absolute bottom-2 right-2">
                              y = {activeCS.toFixed(2)}x + {activeDPrime.toFixed(0)}m
                            </span>
                          </div>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* Results Sub Mode 2: CS-BASED METABOLIC ZONES */}
                  {subMode === 'zones' && csZones.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-display text-xl font-bold uppercase tracking-tight text-foreground border-b border-border-heavy pb-1">
                        Critical Speed Anchored Zones
                      </h3>

                      <div className="border-2 border-border-heavy rounded-xl bg-white overflow-hidden shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-accent text-accent-foreground border-b-2 border-border-heavy text-[10px] uppercase font-bold tracking-widest">
                              <th className="p-3">Zone intensity</th>
                              <th className="p-3">Percentage of CS</th>
                              <th className="p-3">Limits speed</th>
                              <th className="p-3">Equivalent Pace Range</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y border-t divide-border-heavy text-xs font-medium text-muted-foreground">
                            {csZones.map((z, idx) => (
                              <tr key={idx} className="hover:bg-muted/30">
                                <td className="p-3 font-bold text-foreground">{z.name}</td>
                                <td className="p-3 font-semibold text-emerald-600">{z.pctCS}</td>
                                <td className="p-3 font-mono">{z.minSpeedMps.toFixed(2)} - {z.maxSpeedMps.toFixed(2)} m/s</td>
                                <td className="p-3 font-bold font-mono text-primary">
                                  {formatPace(z.maxPaceSecsPerKm)} - {formatPace(z.minPaceSecsPerKm)} /km
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Results Sub Mode 3: ABOVE-CS DEPLETION (TTE) */}
                  {subMode === 'above_cs' && (
                    <div className="space-y-4">
                      <h3 className="font-display text-xl font-bold uppercase tracking-tight text-foreground border-b border-border-heavy pb-1">
                        Above-CS Exhaustion (D&apos; depletion)
                      </h3>

                      {/* Option Task Selector */}
                      <div className="grid grid-cols-2 gap-3 border border-border p-2 rounded-lg bg-card">
                        <button
                          type="button"
                          onClick={() => setTargetTaskType('tte')}
                          className={`text-xs font-bold uppercase tracking-wide py-1.5 rounded transition-all ${targetTaskType === 'tte' ? 'bg-primary text-white border-2 border-border-heavy' : 'text-muted-foreground'}`}
                        >
                          Find Max Time (TTE)
                        </button>
                        <button
                          type="button"
                          onClick={() => setTargetTaskType('distance')}
                          className={`text-xs font-bold uppercase tracking-wide py-1.5 rounded transition-all ${targetTaskType === 'distance' ? 'bg-primary text-white border-2 border-border-heavy' : 'text-muted-foreground'}`}
                        >
                          Find Max Distance
                        </button>
                      </div>

                      {/* Inputs parameters */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="targetPaceInput">Define Work Pacing (intensity strictly above CS)</Label>
                          <Input
                            id="targetPaceInput"
                            type="text"
                            value={targetPaceInput}
                            onChange={(e) => setTargetPaceInput(e.target.value)}
                          />
                          <span className="text-[9px] font-semibold text-muted-foreground block mt-1 uppercase">
                            CS Baseline: {formatPace(1000 / activeCS)} /km
                          </span>
                        </div>

                        {targetTaskType === 'distance' && (
                          <div>
                            <Label htmlFor="targetDurationInput">Available Target Time (mm:ss)</Label>
                            <Input
                              id="targetDurationInput"
                              type="text"
                              value={targetDurationInput}
                              onChange={(e) => setTargetDurationInput(e.target.value)}
                            />
                          </div>
                        )}
                      </div>

                      {/* Outcomes rendering */}
                      {aboveCSOutcome && (
                        <div className="p-4 rounded-xl border-2 border-border-heavy bg-card space-y-3">
                          {'error' in aboveCSOutcome ? (
                            <span className="text-red-500 font-bold text-xs leading-relaxed uppercase block">
                              {aboveCSOutcome.error}
                            </span>
                          ) : (
                            <div className="text-center space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block">
                                {aboveCSOutcome.task === 'tte' ? 'Estimated Time to Exhaustion (TTE)' : 'Estimated Achievable Pacing Distance'}
                              </span>
                              <div className="font-display font-black text-3xl text-primary block leading-none py-1">
                                {aboveCSOutcome.display}
                              </div>
                              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block">
                                Derived using linear metabolic model trace. Assumes maximal consistent effort.
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  )}

                  {/* Results Sub Mode 4: COMPARATIVE MATRIX */}
                  {subMode === 'comparison' && comparisons && (
                    <div className="space-y-4">
                      <h3 className="font-display text-xl font-bold uppercase tracking-tight text-foreground border-b border-border-heavy pb-1">
                        CS Comparative Speed Matching
                      </h3>

                      <div className="border-2 border-border-heavy rounded-xl bg-white overflow-hidden shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-accent text-accent-foreground border-b-2 border-border-heavy text-[10px] uppercase font-bold tracking-widest">
                              <th className="p-3">Reference Marker</th>
                              <th className="p-3">Pace (/km)</th>
                              <th className="p-3">Pace Over/Under CS</th>
                              <th className="p-3">CS Relationship %</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y border-t divide-border-heavy text-xs font-medium text-muted-foreground">
                            {comparisons.map((c, idx) => {
                              const isBase = idx === 0;
                              return (
                                <tr key={idx} className="hover:bg-muted/30">
                                  <td className="p-3 font-bold text-foreground">{c.marker}</td>
                                  <td className="p-3 font-bold font-mono text-primary">{formatPace(c.paceSecs)}</td>
                                  <td className="p-3 font-mono">
                                    {isBase ? '-' : c.delta > 0 ? `+${formatPace(c.delta)}` : `-${formatPace(Math.abs(c.delta))}`}
                                  </td>
                                  <td className={`p-3 font-bold font-mono ${idx === 0 ? 'text-foreground' : idx === 2 ? 'text-emerald-600' : 'text-blue-600'}`}>
                                    {c.relText}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* MANUAL EXPORT REGISTRY BOX */}
              <div className="bg-white border-2 border-border-heavy p-6 rounded-xl shadow-[4px_4px_0px_rgba(23,23,23,1)] space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary block font-mono">EXPORT WORKSPACE RAW MODEL (NO STORAGE)</span>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(exportText);
                      alert('Critical speed model copied to clipboard successfully!');
                    }}
                    className="py-1.5 px-3 bg-white border-2 border-border-heavy rounded text-[10px] font-bold uppercase tracking-widest shadow-[1px_1px_0px_rgba(23,23,23,1)] hover:shadow-none hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all"
                  >
                    📃 Copy Clipboard
                  </button>
                  <button
                    onClick={handleDownloadTXT}
                    className="py-1.5 px-3 bg-white border-2 border-border-heavy rounded text-[10px] font-bold uppercase tracking-widest shadow-[1px_1px_0px_rgba(23,23,23,1)] hover:shadow-none hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all"
                  >
                    💾 Save TXT
                  </button>
                  <button
                    onClick={handleDownloadCSV}
                    className="py-1.5 px-3 bg-white border-2 border-border-heavy rounded text-[10px] font-bold uppercase tracking-widest shadow-[1px_1px_0px_rgba(23,23,23,1)] hover:shadow-none hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all"
                  >
                    📊 Save CSV
                  </button>
                  <button
                    onClick={handleDownloadJSON}
                    className="py-1.5 px-3 bg-white border-2 border-border-heavy rounded text-[10px] font-bold uppercase tracking-widest shadow-[1px_1px_0px_rgba(23,23,23,1)] hover:shadow-none hover:translate-x-[0.5px] hover:translate-y-[0.5px] transition-all"
                  >
                    ⚙ Download JSON
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* CROSS LINK NAVIGATION FOOTER */}
          <div className="bg-white border-2 border-border-heavy rounded-xl p-4 shadow-[4px_4px_0px_rgba(23,23,23,1)] space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block font-mono">CROSS-LAB REDIRECTIONS</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-bold uppercase tracking-wider text-primary">
              <Link href="/race" className="p-3 bg-muted border border-border-heavy rounded flex items-center justify-between hover:bg-white transition-colors group">
                <span>Predict Race Finishing with CS Base</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </Link>
              <Link href="/training-pace" className="p-3 bg-muted border border-border-heavy rounded flex items-center justify-between hover:bg-white transition-colors group">
                <span>Calibrate target zones using CS limits</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </Link>
            </div>
          </div>

          {/* SYSTEM FORMULA TRACE SYNC */}
          {isCalculated && testOutcome && !('error' in testOutcome) && (
            <FormulaTracePanel
              trace={{
                methodName: mode === 'quick' ? "2-Point Linear Work/Intensity Formula" : "Multi-Point Linear Regression Trend Line Fitting",
                formulaText: mode === 'quick' ? "CS = (D2 - D1)/(T2 - T1) ; D' = D1 - CS * T1" : "Distance = CS * duration + D' (Line of Best Fit)",
                inputsUsed: mode === 'quick' ? {
                  "Trial 1 (D1/T1)": `${t1Distance}m in ${t1Time}`,
                  "Trial 2 (D2/T2)": `${t2Distance}m in ${t2Time}`,
                  "Resulting CS": `${activeCS.toFixed(2)} m/s`,
                  "Resulting D'": `${activeDPrime.toFixed(1)} meters`
                } : {
                  "Number of Trial Points Fit": parsedRegressionPoints.length,
                  "Resulting Slope (CS)": `${activeCS.toFixed(2)} m/s`,
                  "Resulting Intercept (D')": `${activeDPrime.toFixed(1)} meters`
                },
                confidenceLabel: mode === 'quick' ? "Field Test" : "Advanced Regression Fit",
                limitation: "Critical Speed models make linear assumptions. High-duration (trials > 15-20 min) or low-duration (trials < 2 min) data can yield physiological errors inside the anaerobic modeling."
              }}
            />
          )}

        </div>

      </div>
    </CalculatorPageShell>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { Input, Label } from '@/components/ui/Forms';
import {
  calculateTrainingPacesFromRaceResult,
  calculateTrainingPacesFromThreshold,
  calculateTrainingPacesFromCriticalSpeed,
  calculateTrainingPacesFromManualBasePace,
  calculateTrainingPaceConversions,
  TrainingPaceRow
} from '@/lib/calculators_pack/performanceSystem';
import { formatPace, parseDurationToSeconds, safeNumber, formatSecondsToTimeString } from '@/lib/formatters/time';
import { CalculatorPageShell } from '@/components/calculator/CalculatorPageShell';
import { ManualInputPanel } from '@/components/calculator/ManualInputPanel';
import { ConfidenceBadge, FormulaTracePanel } from '@/components/calculator/CalculatorSystem';
import Link from 'next/link';

export default function TrainingPaceLabPage() {
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick');
  
  // Anchoring Methods
  const [anchorMethod, setAnchorMethod] = useState<'race' | 'threshold' | 'critical_speed' | 'base_pace'>('race');

  // Input states
  const [raceDistance, setRaceDistance] = useState('10.0');
  const [raceTime, setRaceTime] = useState('48:00'); // 10K in 48 mins

  const [thresholdPaceInput, setThresholdPaceInput] = useState('4:40'); // 4:40 /km
  const [criticalSpeedMpsInput, setCriticalSpeedMpsInput] = useState('3.5'); // 3.5 m/s (~4:45/km)
  const [baseEasyPaceInput, setBaseEasyPaceInput] = useState('5:45'); // Easy run base

  // Goal-Paced warning toggle
  const [isGoalPace, setIsGoalPace] = useState(false);

  // Advanced mode multiplier fine-tuning overrides
  const [multiplierOverrides, setMultiplierOverrides] = useState<Record<string, string>>({
    'Recovery': '1.0',
    'Easy': '1.0',
    'Long Run': '1.0',
    'Steady': '1.0',
    'Threshold': '1.0',
    'Tempo': '1.0',
    'Interval': '1.0',
    'Repetition': '1.0',
  });

  // Track the active selected pace card for equivalent conversions (default to Threshold)
  const [selectedPaceForConversion, setSelectedPaceForConversion] = useState<number | null>(null);
  const [selectedPaceName, setSelectedPaceName] = useState<string>('Threshold');

  // Validation & Calculation Trackers
  const [errorOnForm, setErrorOnForm] = useState<string | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);

  // Reset calculations
  const handleReset = () => {
    setAnchorMethod('race');
    setRaceDistance('10.0');
    setRaceTime('48:00');
    setThresholdPaceInput('4:40');
    setCriticalSpeedMpsInput('3.5');
    setBaseEasyPaceInput('5:45');
    setIsGoalPace(false);
    setSelectedPaceForConversion(null);
    setSelectedPaceName('Threshold');
    setMultiplierOverrides({
      'Recovery': '1.0',
      'Easy': '1.0',
      'Long Run': '1.0',
      'Steady': '1.0',
      'Threshold': '1.0',
      'Tempo': '1.0',
      'Interval': '1.0',
      'Repetition': '1.0',
    });
    setErrorOnForm(null);
    setIsCalculated(false);
  };

  // Process calculation trigger
  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorOnForm(null);

    if (anchorMethod === 'race') {
      const dist = safeNumber(raceDistance);
      const secs = parseDurationToSeconds(raceTime);
      if (dist === null || dist <= 0) {
        return setErrorOnForm("Race distance must be a positive number.");
      }
      if (secs === null || secs <= 0) {
        return setErrorOnForm("Recent race time must be a valid duration (e.g., 20:00 or 1:45:00).");
      }
    } else if (anchorMethod === 'threshold') {
      const paceSecs = parseDurationToSeconds(thresholdPaceInput);
      if (paceSecs === null || paceSecs <= 0) {
        return setErrorOnForm("Threshold pace must be a valid duration /km (e.g., 4:30).");
      }
    } else if (anchorMethod === 'critical_speed') {
      const csMps = safeNumber(criticalSpeedMpsInput);
      if (csMps === null || csMps <= 0) {
        return setErrorOnForm("Critical Speed must be a positive number in m/s.");
      }
    } else if (anchorMethod === 'base_pace') {
      const baseSecs = parseDurationToSeconds(baseEasyPaceInput);
      if (baseSecs === null || baseSecs <= 0) {
        return setErrorOnForm("Base easy pace must be a valid duration /km (e.g., 5:45).");
      }
    }

    setIsCalculated(true);
    setSelectedPaceForConversion(null); // Reset detail selector to use computed default
    setSelectedPaceName('Threshold'); // reset label to threshold
  };

  // Compute pace zones based on active anchor and multiplier settings
  const computedPaces = useMemo(() => {
    if (!isCalculated) return [];

    let rawOutput: TrainingPaceRow[] = [];

    if (anchorMethod === 'race') {
      const d = Number(raceDistance);
      const secs = parseDurationToSeconds(raceTime) || 0;
      rawOutput = calculateTrainingPacesFromRaceResult(d, secs);
    } else if (anchorMethod === 'threshold') {
      const tPace = parseDurationToSeconds(thresholdPaceInput) || 0;
      rawOutput = calculateTrainingPacesFromThreshold(tPace);
    } else if (anchorMethod === 'critical_speed') {
      const csSpeed = Number(criticalSpeedMpsInput);
      rawOutput = calculateTrainingPacesFromCriticalSpeed(csSpeed);
    } else if (anchorMethod === 'base_pace') {
      const bPace = parseDurationToSeconds(baseEasyPaceInput) || 0;
      rawOutput = calculateTrainingPacesFromManualBasePace(bPace);
    }

    // Apply advanced customized percentage overrides if in advanced mode
    if (mode === 'advanced') {
      return rawOutput.map(p => {
        const factorStr = multiplierOverrides[p.category];
        if (factorStr) {
          const factor = parseFloat(factorStr);
          if (!isNaN(factor) && factor > 0) {
            return {
              ...p,
              minPaceSecsPerKm: p.minPaceSecsPerKm * factor,
              maxPaceSecsPerKm: p.maxPaceSecsPerKm * factor
            };
          }
        }
        return p;
      });
    }

    return rawOutput;
  }, [isCalculated, anchorMethod, raceDistance, raceTime, thresholdPaceInput, criticalSpeedMpsInput, baseEasyPaceInput, multiplierOverrides, mode]);

  // Group outputs for structured categories (B.)
  const aerobicPaces = useMemo(() => {
    return computedPaces.filter(p => ['Recovery', 'Easy', 'Long Run', 'Steady', 'Marathon'].includes(p.category));
  }, [computedPaces]);

  const anaerobicPaces = useMemo(() => {
    return computedPaces.filter(p => ['Tempo', 'Threshold', 'Cruise Interval', '10K', '5K', '3K', 'Mile', 'Interval', 'Repetition', 'Strides'].includes(p.category));
  }, [computedPaces]);

  // Determine active converter target pace (averaging the range bounds)
  const activeConversionPace = useMemo(() => {
    if (selectedPaceForConversion !== null) return selectedPaceForConversion;
    // Fallback to Threshold or first computed zone
    const thresholdItem = computedPaces.find(p => p.category === 'Threshold');
    if (thresholdItem) return (thresholdItem.minPaceSecsPerKm + thresholdItem.maxPaceSecsPerKm) / 2;
    if (computedPaces.length > 0) {
      return (computedPaces[0].minPaceSecsPerKm + computedPaces[0].maxPaceSecsPerKm) / 2;
    }
    return 0;
  }, [computedPaces, selectedPaceForConversion]);

  // Conversion table output
  const conversionData = useMemo(() => {
    if (activeConversionPace <= 0) return null;
    return calculateTrainingPaceConversions(activeConversionPace);
  }, [activeConversionPace]);

  // Dynamic warning condition (if 10K target is unhealthily fast or user toggles goal-mode) (D.)
  const showGoalWarning = useMemo(() => {
    if (isGoalPace) return true;
    if (anchorMethod === 'race') {
      const d = Number(raceDistance);
      const s = parseDurationToSeconds(raceTime) || 1;
      if (d > 0 && s / d < 180) return true; // Less than 3:00/km holds warning
    }
    return false;
  }, [isGoalPace, anchorMethod, raceDistance, raceTime]);

  // Manual Exports (C.)
  const exportText = useMemo(() => {
    if (!isCalculated) return '';
    const lines = [
      `TRACK.LAB OUTRAGEOUS PERFORMANCE SYSTEM - TRAINING PACES REPORT`,
      `=========================`,
      `Anchor Method: ${anchorMethod.toUpperCase()}`,
      `Inputs: ${anchorMethod === 'race' ? `${raceDistance}km / ${raceTime}` : anchorMethod === 'threshold' ? `${thresholdPaceInput}/km` : anchorMethod === 'critical_speed' ? `${criticalSpeedMpsInput} m/s` : `${baseEasyPaceInput}/km`}`,
      `Is hypothetical Goal Paces? ${isGoalPace ? 'YES (Aggressive estimate)' : 'NO (Priceless fitness assessment)'}`,
      `-------------------------`,
      `DERIVED TRAINING PACES:`,
      `-------------------------`
    ];

    computedPaces.forEach(p => {
      lines.push(`${p.category.toUpperCase()}: ${formatPace(p.minPaceSecsPerKm)} - ${formatPace(p.maxPaceSecsPerKm)} /km`);
    });

    if (conversionData) {
      lines.push(
        `\nCONVERSION TABLE FOR SELECTED TRANSITION: ${selectedPaceName}`,
        `-------------------------`,
        `Mile Pace: ${formatPace(conversionData.oneMileSeconds)} /mile`,
        `Speed: ${conversionData.kmh.toFixed(2)} km/h | ${conversionData.mph.toFixed(2)} mph`,
        `100m repr: ${formatSecondsToTimeString(conversionData.oneHundredMetersSeconds)}`,
        `200m repr: ${formatSecondsToTimeString(conversionData.twoHundredMetersSeconds)}`,
        `400m Reps: ${formatSecondsToTimeString(conversionData.fourHundredMetersSeconds)}`,
        `800m Reps: ${formatSecondsToTimeString(conversionData.eightHundredMetersSeconds)}`
      );
    }

    return lines.join('\n');
  }, [isCalculated, anchorMethod, raceDistance, raceTime, thresholdPaceInput, criticalSpeedMpsInput, baseEasyPaceInput, isGoalPace, computedPaces, conversionData, selectedPaceName]);

  const handleDownloadTXT = () => {
    const element = document.createElement("a");
    const file = new Blob([exportText], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "tracklab_training_paces.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadCSV = () => {
    if (!isCalculated || computedPaces.length === 0) return;
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Zone Name,Min Pace Secs,Max Pace Secs,Min Pace Display,Max Pace Display\n";
    computedPaces.forEach(p => {
      csvContent += `${p.category},${p.minPaceSecsPerKm.toFixed(1)},${p.maxPaceSecsPerKm.toFixed(1)},${formatPace(p.minPaceSecsPerKm).replace(',', '')},${formatPace(p.maxPaceSecsPerKm).replace(',', '')}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "tracklab_training_paces.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadJSON = () => {
    if (!isCalculated) return;
    const jsonStr = JSON.stringify({
      module: "Training Pace Lab",
      anchorMethod,
      timestamp: new Date().toISOString(),
      isGoalPace,
      paces: computedPaces
    }, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tracklab_training_paces.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <CalculatorPageShell title="Training Pace Lab" subtitle="Calibrate precise physiological zones anchored to current threshold, race estimates or CS baseline.">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* INPUT PANEL (1/3 Width) */}
        <div className="lg:col-span-1">
          <ManualInputPanel
            mode={mode}
            setMode={setMode}
            supportsAdvanced={true}
            onCalculate={handleCalculate}
            onReset={handleReset}
            error={errorOnForm}
          >
            {/* Anchor Selection */}
            <div className="space-y-2">
              <Label htmlFor="anchorMethod">Anchor Reference Method</Label>
              <select
                id="anchorMethod"
                className="w-full text-sm font-sans font-medium h-10 px-3 bg-white border-2 border-border-heavy rounded focus:outline-none"
                value={anchorMethod}
                onChange={(e) => setAnchorMethod(e.target.value as any)}
              >
                <option value="race">Recent Race Performance</option>
                <option value="threshold">Lactate Threshold Pace</option>
                <option value="critical_speed">Critical Speed (m/s)</option>
                <option value="base_pace">Manual Easy/Base Pace</option>
              </select>
            </div>

            {/* Render Contextual Inputs based on Anchor Selection */}
            {anchorMethod === 'race' && (
              <div className="space-y-4 pt-2 border-t border-dashed">
                <div>
                  <Label htmlFor="raceDistance">Race Distance (km)</Label>
                  <Input
                    id="raceDistance"
                    type="number"
                    step="0.1"
                    value={raceDistance}
                    onChange={(e) => setRaceDistance(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="raceTime">Finish Time (MM:SS or HH:MM:SS)</Label>
                  <Input
                    id="raceTime"
                    type="text"
                    value={raceTime}
                    onChange={(e) => setRaceTime(e.target.value)}
                  />
                </div>
              </div>
            )}

            {anchorMethod === 'threshold' && (
              <div className="pt-2 border-t border-dashed">
                <Label htmlFor="thresholdPaceInput">Manual Threshold Pace (/km)</Label>
                <Input
                  id="thresholdPaceInput"
                  type="text"
                  placeholder="e.g. 4:30"
                  value={thresholdPaceInput}
                  onChange={(e) => setThresholdPaceInput(e.target.value)}
                />
              </div>
            )}

            {anchorMethod === 'critical_speed' && (
              <div className="pt-2 border-t border-dashed">
                <Label htmlFor="criticalSpeedMpsInput">Critical Speed (m/s)</Label>
                <Input
                  id="criticalSpeedMpsInput"
                  type="number"
                  step="0.05"
                  value={criticalSpeedMpsInput}
                  onChange={(e) => setCriticalSpeedMpsInput(e.target.value)}
                />
                <span className="text-[10px] font-mono block text-muted-foreground mt-1">
                  Pace value gets derived automatically.
                </span>
              </div>
            )}

            {anchorMethod === 'base_pace' && (
              <div className="pt-2 border-t border-dashed">
                <Label htmlFor="baseEasyPaceInput">Baseline Easy Run Pace (/km)</Label>
                <Input
                  id="baseEasyPaceInput"
                  type="text"
                  placeholder="e.g. 5:45"
                  value={baseEasyPaceInput}
                  onChange={(e) => setBaseEasyPaceInput(e.target.value)}
                />
              </div>
            )}

            {/* Goal Paced caution trigger toggle */}
            <div className="flex items-center gap-2 pt-3 border-t border-border-heavy">
              <input
                id="isGoalPace"
                type="checkbox"
                className="w-4 h-4 border-2 rounded text-primary focus:ring-0 cursor-pointer"
                checked={isGoalPace}
                onChange={(e) => setIsGoalPace(e.target.checked)}
              />
              <Label htmlFor="isGoalPace" className="cursor-pointer select-none">
                This is a futuristic / Target Goal performance
              </Label>
            </div>

            {/* Advanced Multipliers Modification */}
            {mode === 'advanced' && (
              <div className="space-y-3 pt-3 border-t border-border-heavy">
                <h4 className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase">Tune target speed factors</h4>
                {Object.keys(multiplierOverrides).map(name => (
                  <div key={name} className="flex justify-between items-center gap-2">
                    <span className="text-xs font-semibold">{name}</span>
                    <input
                      type="number"
                      step="0.01"
                      className="w-20 text-xs font-mono border-2 border-border-heavy rounded text-right p-1"
                      value={multiplierOverrides[name]}
                      onChange={(e) => setMultiplierOverrides({
                        ...multiplierOverrides,
                        [name]: e.target.value
                      })}
                    />
                  </div>
                ))}
              </div>
            )}
          </ManualInputPanel>
        </div>

        {/* OUTPUT RESULTS COLUMN (2/3 Width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Goal Run Warning Banner */}
          {showGoalWarning && (
            <div className="p-4 bg-yellow-50 border-2 border-yellow-500 text-yellow-800 rounded-xl space-y-2 shadow-[2px_2px_0px_rgba(245,158,11,1)]">
              <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">
                <span>⚠️ GOAL-PACED METABOLIC CAUTION</span>
              </div>
              <p className="text-xs font-medium leading-relaxed">
                Training with hypothetical goal paces instead of actual current threshold ability can lead to heavy muscular fatigue, rapid aerobic deceleration, and joint injury because cardiovascular stress matches present mitochondrial densities, not target projections.
              </p>
            </div>
          )}

          {!isCalculated ? (
            <div className="p-12 border-2 border-dashed border-border-heavy bg-white rounded-xl text-center flex flex-col items-center justify-center min-h-[400px]">
              <span className="font-bold text-base uppercase tracking-wider text-muted-foreground mb-1">Awaiting Evaluation</span>
              <p className="text-xs font-medium text-muted-foreground max-w-sm">
                Complete the manual input parameters, define your baseline anchor, and click **Calculate** to output training zones.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* PRIMARY RESULTS SEGMENTED BOX */}
              <div className="bg-white border-2 border-border-heavy p-6 rounded-xl shadow-[4px_4px_0px_rgba(23,23,23,1)] space-y-6">
                
                {/* 1. AEROBIC / ENDURANCE GROUP (B.) */}
                <div className="space-y-4">
                  <h3 className="font-display text-lg font-black uppercase text-foreground border-b-2 border-border border-dashed pb-1 tracking-tight">
                    1. Aerobic & Endurance Classes
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aerobicPaces.map(p => {
                      const isActive = selectedPaceName === p.category;
                      return (
                        <div
                          key={p.category}
                          onClick={() => {
                            setSelectedPaceForConversion((p.minPaceSecsPerKm + p.maxPaceSecsPerKm) / 2);
                            setSelectedPaceName(p.category);
                          }}
                          className={`p-4 border-2 rounded-xl transition-all cursor-pointer select-none text-left flex flex-col justify-between ${isActive ? 'bg-primary/5 border-primary shadow-[2px_2px_0px_rgba(23,23,23,1)]' : 'bg-white border-border-heavy hover:translate-x-[1px] hover:translate-y-[1px]'}`}
                        >
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{p.category}</span>
                            <div className="font-display font-extrabold text-lg text-foreground mt-1">
                              {formatPace(p.minPaceSecsPerKm)} - {formatPace(p.maxPaceSecsPerKm)}
                              <span className="text-xs font-sans font-normal text-muted-foreground"> /km</span>
                            </div>
                            <span className="text-[10px] leading-tight text-muted-foreground block mt-1">
                              {p.description}
                            </span>
                          </div>
                          <span className="text-[9px] font-semibold text-primary/80 mt-2 block uppercase tracking-wider">Click to view equivalents ⚙</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. ANAEROBIC / SPEED QUALITY GROUP (B.) */}
                <div className="space-y-4 pt-4 border-t-2 border-border-heavy">
                  <h3 className="font-display text-lg font-black uppercase text-foreground border-b-2 border-border border-dashed pb-1 tracking-tight">
                    2. Anaerobic & Speed Quality
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {anaerobicPaces.map(p => {
                      const isActive = selectedPaceName === p.category;
                      return (
                        <div
                          key={p.category}
                          onClick={() => {
                            setSelectedPaceForConversion((p.minPaceSecsPerKm + p.maxPaceSecsPerKm) / 2);
                            setSelectedPaceName(p.category);
                          }}
                          className={`p-4 border-2 rounded-xl transition-all cursor-pointer select-none text-left flex flex-col justify-between ${isActive ? 'bg-primary/5 border-primary shadow-[2px_2px_0px_rgba(23,23,23,1)]' : 'bg-white border-border-heavy hover:translate-x-[1px] hover:translate-y-[1px]'}`}
                        >
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{p.category}</span>
                            <div className="font-display font-extrabold text-lg text-foreground mt-1">
                              {formatPace(p.minPaceSecsPerKm)} - {formatPace(p.maxPaceSecsPerKm)}
                              <span className="text-xs font-sans font-normal text-muted-foreground"> /km</span>
                            </div>
                            <span className="text-[10px] leading-tight text-muted-foreground block mt-1">
                              {p.description}
                            </span>
                          </div>
                          <span className="text-[9px] font-semibold text-primary/80 mt-2 block uppercase tracking-wider">Click to view equivalents ⚙</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* INTERACTIVE TRACK CONVERSION DETAILS (C.) */}
              {conversionData && (
                <div className="bg-white border-2 border-border-heavy p-6 rounded-xl shadow-[4px_4px_0px_rgba(23,23,23,1)] space-y-4">
                  <div className="flex justify-between items-center border-b-2 border-border-heavy pb-1">
                    <h3 className="font-display text-xl font-bold uppercase tracking-tight text-foreground">
                      Pacing Conversion - {selectedPaceName}
                    </h3>
                    <span className="text-[10px] font-mono font-bold text-primary border border-primary/30 bg-primary/5 px-2 py-0.5 rounded">
                      ~ {formatPace(activeConversionPace)} /km
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="border border-border p-2.5 rounded bg-muted/30">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block mb-0.5">100m rep</span>
                      <span className="font-mono font-bold text-sm text-foreground">{formatSecondsToTimeString(conversionData.oneHundredMetersSeconds || 0)}</span>
                    </div>
                    <div className="border border-border p-2.5 rounded bg-muted/30">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block mb-0.5">200m rep</span>
                      <span className="font-mono font-bold text-sm text-foreground">{formatSecondsToTimeString(conversionData.twoHundredMetersSeconds || 0)}</span>
                    </div>
                    <div className="border border-border p-2.5 rounded bg-muted/30">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block mb-0.5">400m Reps</span>
                      <span className="font-mono font-bold text-sm text-foreground">{formatSecondsToTimeString(conversionData.fourHundredMetersSeconds || 0)}</span>
                    </div>
                    <div className="border border-border p-2.5 rounded bg-muted/30">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block mb-0.5">800m Reps</span>
                      <span className="font-mono font-bold text-sm text-foreground">{formatSecondsToTimeString(conversionData.eightHundredMetersSeconds || 0)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                    <div className="border border-border p-2.5 rounded bg-card flex justify-between items-center">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Mile Equivalent Pace</span>
                      <span className="font-mono font-bold text-xs text-foreground">{formatPace(conversionData.oneMileSeconds)} /mile</span>
                    </div>
                    <div className="border border-border p-2.5 rounded bg-card flex justify-between items-center">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Speed km/h</span>
                      <span className="font-mono font-bold text-xs text-emerald-600">{conversionData.kmh.toFixed(2)} km/h</span>
                    </div>
                    <div className="border border-border p-2.5 rounded bg-card flex justify-between items-center">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Speed mph</span>
                      <span className="font-mono font-bold text-xs text-blue-600">{conversionData.mph.toFixed(2)} mph</span>
                    </div>
                  </div>
                </div>
              )}

              {/* MANUAL DATA EXPORT GRID */}
              <div className="bg-white border-2 border-border-heavy p-6 rounded-xl shadow-[4px_4px_0px_rgba(23,23,23,1)] space-y-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary block">MANUAL EXPORTS (DETERMINISTIC FITNESS DATA)</span>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(exportText);
                      alert('Derived training paces copied successfully!');
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

          {/* CROSS LINKS */}
          <div className="bg-white border-2 border-border-heavy rounded-xl p-4 shadow-[4px_4px_0px_rgba(23,23,23,1)] space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block font-mono">WORKSPACE INTERLINKING</span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-bold uppercase tracking-wider text-primary">
              <Link href="/race" className="p-3 bg-muted border border-border-heavy rounded flex items-center justify-between hover:bg-white transition-colors group">
                <span>Predict race performance with these paces</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </Link>
              <Link href="/critical-speed" className="p-3 bg-muted border border-border-heavy rounded flex items-center justify-between hover:bg-white transition-colors group">
                <span>Compare bounds with Critical Speed trials</span>
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </Link>
            </div>
          </div>

          {/* FORMULA TRACE SYNC */}
          {isCalculated && (
            <FormulaTracePanel
              trace={{
                methodName: anchorMethod === 'race' ? "Race-Derived Training Intensity Bounds" : anchorMethod === 'threshold' ? "Lactate Threshold Percentage Splits" : anchorMethod === 'critical_speed' ? "Critical Speed Derivation Anchor" : "Manual Easy Base Linear Derivation",
                formulaText: `PaceZoneRange = BaseAnchorPace * MultiplierRange`,
                inputsUsed: {
                  "Anchor Type": anchorMethod,
                  "Easy Pace Range": computedPaces.find(p => p.category === 'Easy') ? `${formatPace(computedPaces.find(p => p.category === 'Easy')!.minPaceSecsPerKm)} - ${formatPace(computedPaces.find(p => p.category === 'Easy')!.maxPaceSecsPerKm)}` : 'N/A',
                  "Threshold Pace Range": computedPaces.find(p => p.category === 'Threshold') ? `${formatPace(computedPaces.find(p => p.category === 'Threshold')!.minPaceSecsPerKm)} - ${formatPace(computedPaces.find(p => p.category === 'Threshold')!.maxPaceSecsPerKm)}` : 'N/A'
                },
                confidenceLabel: "Personalized Estimate",
                limitation: "Training multiplier ranges represent standard demographic ratios. Actual threshold profiles vary based on individual muscle fiber composition and aerobic volume."
              }}
            />
          )}

        </div>

      </div>
    </CalculatorPageShell>
  );
}

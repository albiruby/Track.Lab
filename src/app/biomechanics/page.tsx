'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input, Label, Button, Select, ValidationMessage } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { LabPageHeader } from '@/components/layout/LabPageHeader';
import { 
  calculateCadence,
  calculateStepCount,
  calculateStepLength,
  calculateStrideLength,
  calculateSpeedFromCadenceStride,
  calculatePaceFromCadenceStride,
  calculateStepsPerKm,
  calculateStepsPerMile,
  calculateRaceStepEstimate,
  calculateStrideLengthAtPace,
  calculateCadenceAtPace,
  calculateCadenceDrift,
  calculateCadenceTargetDifference,
  calculateVerticalRatio,
  calculateGroundContactBalance,
  calculateMetronomeTarget
} from '@/lib/calculators_pack';
import { methodRegistry } from '@/data';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { 
  Gauge, 
  Activity, 
  RefreshCw, 
  Copy, 
  FileText, 
  Flame, 
  Sliders, 
  Grid, 
  Bookmark, 
  Volume2, 
  Ruler, 
  TrendingUp, 
  Footprints,
  Info
} from 'lucide-react';

export default function BiomechanicsPage() {
  const [isAdvanced, setIsAdvanced] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'quick_coupling' | 'advanced_pacing' | 'drift_fatigue' | 'vertical_osc' | 'metronome'>('quick_coupling');
  const [error, setError] = useState<string | null>(null);

  // --- Quick Coupling Mode States ---
  // A. Cadence from steps + duration
  const [stepsInput, setStepsInput] = useState('1700');
  const [durSecsInput, setDurSecsInput] = useState('600'); // 10 minutes
  
  // B. Stride/Step length from distance + steps
  const [distMetersInput, setDistMetersInput] = useState('5000');
  const [stepsCountInput, setStepsCountInput] = useState('5000');

  // --- Advanced Mode States ---
  // A. Cadence & Stride Pacing
  const [cadenceVal, setCadenceVal] = useState('175');
  const [strideVal, setStrideVal] = useState('1.15'); // Step length in meters (standard simplification)
  const [selectedRaceDist, setSelectedRaceDist] = useState('10');

  // B. Cadence Drift (Decoupling)
  const [firstHalfCadence, setFirstHalfCadence] = useState('178');
  const [secondHalfCadence, setSecondHalfCadence] = useState('172');

  // C. Vertical Ratio & GC Balance
  const [vertOsc, setVertOsc] = useState('8.5'); // cm
  const [stepLenCm, setStepLenCm] = useState('115'); // cm
  const [gcBalanceL, setGcBalanceL] = useState('49.2'); // Left %
  const [gcBalanceR, setGcBalanceR] = useState('50.8'); // Right %

  // D. Stride / Cadence Target & Metronome
  const [targetPaceMin, setTargetPaceMin] = useState('4');
  const [targetPaceSec, setTargetPaceSec] = useState('15'); // 4:15 min/km
  const [targetCadenceValue, setTargetCadenceValue] = useState('180');

  // --- Reset All Inputs ---
  const handleReset = () => {
    // Quick
    setStepsInput('1700');
    setDurSecsInput('600');
    setDistMetersInput('5000');
    setStepsCountInput('5000');
    // Advanced
    setCadenceVal('175');
    setStrideVal('1.15');
    setSelectedRaceDist('10');
    setFirstHalfCadence('178');
    setSecondHalfCadence('172');
    setVertOsc('8.5');
    setStepLenCm('115');
    setGcBalanceL('49.2');
    setGcBalanceR('50.8');
    setTargetPaceMin('4');
    setTargetPaceSec('15');
    setTargetCadenceValue('180');
    setError(null);
  };

  // --- Computations ---
  
  // Quick A: Calculated Cadence
  const quickCadence = useMemo(() => {
    const s = parseFloat(stepsInput);
    const d = parseFloat(durSecsInput);
    if (isNaN(s) || isNaN(d) || s <= 0 || d <= 0) return 0;
    return calculateCadence(s, d);
  }, [stepsInput, durSecsInput]);

  // Quick B: Calculated Step & Stride Lengths
  const quickStepLength = useMemo(() => {
    const dist = parseFloat(distMetersInput);
    const st = parseFloat(stepsCountInput);
    if (isNaN(dist) || isNaN(st) || dist <= 0 || st <= 0) return 0;
    return calculateStepLength(dist, st);
  }, [distMetersInput, stepsCountInput]);

  const quickStrideLength = useMemo(() => {
    const dist = parseFloat(distMetersInput);
    const st = parseFloat(stepsCountInput);
    if (isNaN(dist) || isNaN(st) || dist <= 0 || st <= 0) return 0;
    return calculateStrideLength(dist, st);
  }, [distMetersInput, stepsCountInput]);

  // Advanced A: Cadence & Stride Pacing
  const speedMMin = useMemo(() => {
    const c = parseFloat(cadenceVal);
    const s = parseFloat(strideVal);
    if (isNaN(c) || isNaN(s) || c <= 0 || s <= 0) return 0;
    return calculateSpeedFromCadenceStride(c, s);
  }, [cadenceVal, strideVal]);

  const paceSecsKm = useMemo(() => {
    const c = parseFloat(cadenceVal);
    const s = parseFloat(strideVal);
    if (isNaN(c) || isNaN(s) || c <= 0 || s <= 0) return 0;
    return calculatePaceFromCadenceStride(c, s);
  }, [cadenceVal, strideVal]);

  const paceDisplay = useMemo(() => {
    if (paceSecsKm <= 0) return "0:00/km";
    const mins = Math.floor(paceSecsKm / 60);
    const secs = Math.round(paceSecsKm % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}/km`;
  }, [paceSecsKm]);

  const stepsPerKmVal = useMemo(() => {
    const c = parseFloat(cadenceVal);
    if (isNaN(c) || c <= 0 || paceSecsKm <= 0) return 0;
    return calculateStepsPerKm(c, paceSecsKm);
  }, [cadenceVal, paceSecsKm]);

  const stepsPerMileVal = useMemo(() => {
    const c = parseFloat(cadenceVal);
    if (isNaN(c) || c <= 0 || paceSecsKm <= 0) return 0;
    const paceMile = paceSecsKm * 1.60934;
    return calculateStepsPerMile(c, paceMile);
  }, [cadenceVal, paceSecsKm]);

  const raceStepsEstimate = useMemo(() => {
    const raceDist = parseFloat(selectedRaceDist);
    if (isNaN(raceDist) || raceDist <= 0 || stepsPerKmVal <= 0) return 0;
    return calculateRaceStepEstimate(raceDist, stepsPerKmVal);
  }, [stepsPerKmVal, selectedRaceDist]);

  // Advanced B: Cadence Drift (Decoupling)
  const driftPct = useMemo(() => {
    const f = parseFloat(firstHalfCadence);
    const s = parseFloat(secondHalfCadence);
    if (isNaN(f) || isNaN(s) || f <= 0 || s <= 0) return 0;
    return calculateCadenceDrift(f, s);
  }, [firstHalfCadence, secondHalfCadence]);

  // Advanced C: Vertical Ratio & GC Balance
  const vertRatioPct = useMemo(() => {
    const vo = parseFloat(vertOsc);
    const sl = parseFloat(stepLenCm);
    if (isNaN(vo) || isNaN(sl) || vo <= 0 || sl <= 0) return 0;
    return calculateVerticalRatio(vo, sl);
  }, [vertOsc, stepLenCm]);

  const gcBalanceDelta = useMemo(() => {
    const l = parseFloat(gcBalanceL);
    const r = parseFloat(gcBalanceR);
    if (isNaN(l) || isNaN(r)) return 0;
    return calculateGroundContactBalance(l, r);
  }, [gcBalanceL, gcBalanceR]);

  // Advanced D: Stride Length at Target Pace & Metronome
  const paceInputSeconds = useMemo(() => {
    const m = parseFloat(targetPaceMin);
    const s = parseFloat(targetPaceSec);
    if (isNaN(m) || isNaN(s)) return 0;
    return (m * 60) + s;
  }, [targetPaceMin, targetPaceSec]);

  const reqStrideAtTarget = useMemo(() => {
    const tc = parseFloat(targetCadenceValue);
    if (isNaN(tc) || tc <= 0 || paceInputSeconds <= 0) return 0;
    return calculateStrideLengthAtPace(paceInputSeconds, tc);
  }, [paceInputSeconds, targetCadenceValue]);

  const metronomeTarget = useMemo(() => {
    const tc = parseFloat(targetCadenceValue);
    if (isNaN(tc) || tc <= 0) return 0;
    return calculateMetronomeTarget(tc);
  }, [targetCadenceValue]);


  // --- Recharts Pacing Curves Data (strictly on real calculated results) ---
  const dynamicCurveData = useMemo(() => {
    if (strideVal === "" || cadenceVal === "") return [];
    const baseStride = parseFloat(strideVal);
    const baseCadence = parseFloat(cadenceVal);
    if (isNaN(baseStride) || isNaN(baseCadence) || baseStride <= 0 || baseCadence <= 0) return [];
    
    // Generate a cadence range curve based on current stride length
    const sampleCadences = [150, 160, 165, 170, 175, 180, 185, 190, 195, 200];
    return sampleCadences.map(c => {
      const speed = calculateSpeedFromCadenceStride(c, baseStride);
      const psKm = speed > 0 ? (60000 / speed) : 0;
      const speedKmh = (speed * 60) / 1000;
      return {
        cadence: c,
        PaceMin: psKm > 0 ? Number((psKm / 60).toFixed(2)) : 0,
        SpeedKmh: Number(speedKmh.toFixed(2)),
        StepsPerKm: Math.round(calculateStepsPerKm(c, psKm))
      };
    });
  }, [strideVal, cadenceVal]);

  // --- Manual Export Mechanics ---
  const handleExport = (format: 'txt' | 'csv' | 'json') => {
    let outputText = '';
    const dateStr = new Date().toISOString().split('T')[0];

    const dataObj = {
      title: "Track.Lab Biomechanics Analysis",
      date: dateStr,
      metrics: {
        quickMode: {
          currentCadence: quickCadence > 0 ? `${quickCadence.toFixed(1)} spm` : 'N/A',
          stepLength: quickStepLength > 0 ? `${quickStepLength.toFixed(2)} m` : 'N/A',
          strideLength: quickStrideLength > 0 ? `${quickStrideLength.toFixed(2)} m` : 'N/A'
        },
        advancedMode: {
          cadenceVal: `${cadenceVal} spm`,
          stepLengthVal: `${strideVal} m`,
          speedResult: `${(speedMMin * 0.06).toFixed(2)} km/h`,
          calculatedPace: paceDisplay,
          stepsPerKm: Math.round(stepsPerKmVal),
          stepsPerMile: Math.round(stepsPerMileVal),
          steps10kEstimate: Math.round(raceStepsEstimate),
          cadenceDecouplingDrift: `${driftPct.toFixed(2)}%`,
          verticalRatio: `${vertRatioPct.toFixed(2)}%`,
          gcBalanceImbalance: `${gcBalanceDelta.toFixed(1)}%`
        }
      },
      traces: {
        cadenceFormula: "Steps / (DurationSeconds / 60)",
        strideFormula: "Distance / (Steps / 2)",
        stepLengthFormula: "Distance / Steps",
        driftFormula: "((SecondHalf - FirstHalf) / FirstHalf) * 100"
      }
    };

    if (format === 'json') {
      outputText = JSON.stringify(dataObj, null, 2);
    } else if (format === 'csv') {
      outputText = `Metric,Value,Formula\n` +
        `Quick Cadence,${dataObj.metrics.quickMode.currentCadence},steps / minutes\n` +
        `Step Length,${dataObj.metrics.quickMode.stepLength},distance / steps\n` +
        `Stride Length,${dataObj.metrics.quickMode.strideLength},distance / steps * 2\n` +
        `Core Cadence,${dataObj.metrics.advancedMode.cadenceVal},user input\n` +
        `Core Step Length,${dataObj.metrics.advancedMode.stepLengthVal},user input\n` +
        `Calculated Pace,${dataObj.metrics.advancedMode.calculatedPace},60000 / speed\n` +
        `Cadence Drift,${dataObj.metrics.advancedMode.cadenceDecouplingDrift},((P2-P1)/P1)*100\n` +
        `Vertical Ratio,${dataObj.metrics.advancedMode.verticalRatio},VO/SL * 100\n`;
    } else {
      outputText = `=========================================\n` +
        `TRACK.LAB BIOMECHANICS REPORT - ${dateStr}\n` +
        `=========================================\n\n` +
        `--- QUICK MODE METRICS ---\n` +
        `• Cadence Estimate: ${dataObj.metrics.quickMode.currentCadence}\n` +
        `• Single Step Length: ${dataObj.metrics.quickMode.stepLength}\n` +
        `• Complete Stride Length: ${dataObj.metrics.quickMode.strideLength}\n\n` +
        `--- ADVANCED BIOMETRIC MATRIX ---\n` +
        `• Base Cadence: ${dataObj.metrics.advancedMode.cadenceVal}\n` +
        `• Base Step Length: ${dataObj.metrics.advancedMode.stepLengthVal}\n` +
        `• Pace Estimate: ${dataObj.metrics.advancedMode.calculatedPace}\n` +
        `• Steps Per Kilometer: ${dataObj.metrics.advancedMode.stepsPerKm}\n` +
        `• Steps Per Mile: ${dataObj.metrics.advancedMode.stepsPerMile}\n` +
        `• Pacing Cadence Drift Decoupling: ${dataObj.metrics.advancedMode.cadenceDecouplingDrift}\n` +
        `• Vertical Stiffness Ratio: ${dataObj.metrics.advancedMode.verticalRatio}\n` +
        `• GC Balance Imbalance: ${dataObj.metrics.advancedMode.gcBalanceImbalance}\n\n` +
        `--- DETERMINISTIC FORMULA TRACES ---\n` +
        `• Speed: Pace = 60000 / (Cadence * Stride)\n` +
        `• Drift: ((SubSecond - SubFirst) / SubFirst) * 100\n` +
        `• Vertical Ratio: Vertical_Osc / Step_Length * 100\n` +
        `=========================================\n`;
    }

    // copy to clipboard
    navigator.clipboard.writeText(outputText).then(() => {
      alert(`Manual results report copied to clipboard as ${format.toUpperCase()}!`);
    }).catch(err => {
      alert("Clipboard access blocked. Copying output text failed.");
    });
  };

  return (
    <div className="space-y-6">
      <LabPageHeader 
        title="BIOMECHANICS LAB" 
        subtitle="Manual mechanical efficiency, cadence coupling ratios, and vertical stiffness estimates." 
      />

      {/* Mode Toolbar Selector */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
        <div className="flex items-center gap-2">
          <Footprints className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
          <span className="font-semibold text-sm">Operation Framework:</span>
          <div className="flex items-center bg-zinc-200 dark:bg-zinc-800 p-1 rounded-md text-xs">
            <button 
              className={`px-3 py-1 rounded transition ${!isAdvanced ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium' : 'text-zinc-600 dark:text-zinc-400'}`}
              onClick={() => setIsAdvanced(false)}
            >
              Quick Mode
            </button>
            <button 
              className={`px-3 py-1 rounded transition ${isAdvanced ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-medium' : 'text-zinc-600 dark:text-zinc-400'}`}
              onClick={() => setIsAdvanced(true)}
            >
              Advanced Mode
            </button>
          </div>
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => handleExport('txt')} className="flex-1 sm:flex-none text-xs gap-1 py-1 px-3 h-8">
            <Copy className="w-3.5 h-3.5" /> Copy TXT
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')} className="flex-1 sm:flex-none text-xs gap-1 py-1 px-3 h-8">
            <FileText className="w-3.5 h-3.5" /> Copy CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('json')} className="flex-1 sm:flex-none text-xs gap-1 py-1 px-3 h-8">
            <Sliders className="w-3.5 h-3.5" /> Copy JSON
          </Button>
          <Button variant="outline" onClick={handleReset} className="text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 py-1 px-3 h-8">
            <RefreshCw className="w-3.5 h-3.5 mr-1" /> Reset Lab
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: Calculations Column */}
        <div className="xl:col-span-2 space-y-6">
          
          {!isAdvanced ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Quick Cadence Calculator */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-zinc-950 dark:text-zinc-50" />
                    <CardTitle className="text-base font-semibold">Cadence Ratio</CardTitle>
                  </div>
                  <CardDescription>Determine frequency spm from elapsed run variables.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stepsInput">Total Steps</Label>
                      <Input 
                        id="stepsInput" 
                        type="number" 
                        value={stepsInput} 
                        onChange={e => setStepsInput(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="durSecsInput">Duration (sec)</Label>
                      <Input 
                        id="durSecsInput" 
                        type="number" 
                        value={durSecsInput} 
                        onChange={e => setDurSecsInput(e.target.value)} 
                      />
                    </div>
                  </div>

                  {quickCadence > 0 && (
                    <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                      <div className="text-xs text-zinc-500 uppercase tracking-wider font-mono">Calculated Cadence</div>
                      <div className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                        {Math.round(quickCadence)} <span className="text-xs text-zinc-500 font-normal">spm</span>
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono mt-2 uppercase">
                        Trace: steps ({stepsInput}) / ( ({durSecsInput}s) / 60 )
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stride Length Matcher */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-zinc-950 dark:text-zinc-50" />
                    <CardTitle className="text-base font-semibold">Stride Matcher</CardTitle>
                  </div>
                  <CardDescription>Determine physical length parameters from total strides.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="distMetersInput">Distance (meters)</Label>
                      <Input 
                        id="distMetersInput" 
                        type="number" 
                        value={distMetersInput} 
                        onChange={e => setDistMetersInput(e.target.value)} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stepsCountInput">Total Steps</Label>
                      <Input 
                        id="stepsCountInput" 
                        type="number" 
                        value={stepsCountInput} 
                        onChange={e => setStepsCountInput(e.target.value)} 
                      />
                    </div>
                  </div>

                  {quickStepLength > 0 && (
                    <div className="space-y-2 p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                      <div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider font-mono">Single Step Length</div>
                        <div className="text-xl font-bold font-mono text-zinc-950 dark:text-zinc-50">
                          {quickStepLength.toFixed(2)} <span className="text-xs text-zinc-500 font-normal">m/step</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500 uppercase tracking-wider font-mono">Full Gate Cycle (2 steps)</div>
                        <div className="text-xl font-bold font-mono text-zinc-950 dark:text-zinc-50">
                          {quickStrideLength.toFixed(2)} <span className="text-xs text-zinc-500 font-normal">m/stride</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          ) : (
            
            // --- Advanced Sub-tabs ---
            <div className="space-y-6">
              
              <div className="flex border-b border-zinc-200 dark:border-zinc-800 text-sm overflow-x-auto whitespace-nowrap">
                <button 
                  className={`py-2 px-4 border-b-2 font-medium transition ${activeTab === 'quick_coupling' ? 'border-zinc-950 text-zinc-950 dark:border-zinc-50 dark:text-zinc-50' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
                  onClick={() => setActiveTab('quick_coupling')}
                >
                  Pace & Stride Ratio
                </button>
                <button 
                  className={`py-2 px-4 border-b-2 font-medium transition ${activeTab === 'drift_fatigue' ? 'border-zinc-950 text-zinc-950 dark:border-zinc-50 dark:text-zinc-50' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
                  onClick={() => setActiveTab('drift_fatigue')}
                >
                  Cadence Drift
                </button>
                <button 
                  className={`py-2 px-4 border-b-2 font-medium transition ${activeTab === 'vertical_osc' ? 'border-zinc-950 text-zinc-950 dark:border-zinc-50 dark:text-zinc-50' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
                  onClick={() => setActiveTab('vertical_osc')}
                >
                  Vertical Ratio & GC
                </button>
                <button 
                  className={`py-2 px-4 border-b-2 font-medium transition ${activeTab === 'metronome' ? 'border-zinc-950 text-zinc-950 dark:border-zinc-50 dark:text-zinc-50' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
                  onClick={() => setActiveTab('metronome')}
                >
                  Metronome & Targets
                </button>
              </div>

              {activeTab === 'quick_coupling' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Cadence & Stride Length Coupling</CardTitle>
                    <CardDescription>
                      Calculate projected speed, linear pace, and cyclic step counts based on steady-state stride relationships.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cadenceVal">Manual Cadence (spm)</Label>
                        <Input 
                          id="cadenceVal" 
                          type="number" 
                          value={cadenceVal} 
                          onChange={e => setCadenceVal(e.target.value)} 
                        />
                        <span className="text-[10px] text-zinc-500 font-mono">Steps per minute</span>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="strideVal">Step Length (m)</Label>
                        <Input 
                          id="strideVal" 
                          type="number" 
                          step="0.01" 
                          value={strideVal} 
                          onChange={e => setStrideVal(e.target.value)} 
                        />
                        <span className="text-[10px] text-zinc-500 font-mono">Distance per single step</span>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="selectedRaceDist">Race Target Estimate</Label>
                        <Select 
                          id="selectedRaceDist"
                          value={selectedRaceDist}
                          onChange={e => setSelectedRaceDist(e.target.value)}
                        >
                          <option value="5">5K Road (5.00 km)</option>
                          <option value="10">10K Road (10.00 km)</option>
                          <option value="21.0975">Half Marathon (21.10 km)</option>
                          <option value="42.195">Full Marathon (42.20 km)</option>
                        </Select>
                        <span className="text-[10px] text-zinc-500 font-mono">For total steps math</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                      
                      <div className="space-y-3">
                        <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                          <span className="text-xs text-zinc-400 font-mono uppercase block">Estimated Running Speed</span>
                          <span className="text-2xl font-bold font-mono text-zinc-950 dark:text-zinc-50">
                            {(speedMMin * 0.06).toFixed(2)} <span className="text-xs text-zinc-500 font-normal">km/h</span>
                          </span>
                          <span className="text-xs text-zinc-500 block font-mono mt-1">
                            ({speedMMin.toFixed(0)} meters per minute)
                          </span>
                        </div>

                        <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                          <span className="text-xs text-zinc-400 font-mono uppercase block">Amortized Pacing</span>
                          <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                            {paceDisplay}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                          <span className="text-xs text-zinc-400 font-mono uppercase block">Estimated Foot Strikes</span>
                          <div className="grid grid-cols-2 gap-2 mt-1">
                            <div>
                              <span className="text-xs text-zinc-500 font-mono block">Per Kilometer:</span>
                              <span className="font-bold text-base font-mono">{Math.round(stepsPerKmVal)}</span>
                            </div>
                            <div>
                              <span className="text-xs text-zinc-500 font-mono block">Per Mile:</span>
                              <span className="font-bold text-base font-mono">{Math.round(stepsPerMileVal)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                          <span className="text-xs text-zinc-400 font-mono uppercase block">Race Step Volume Projector</span>
                          <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
                            {Math.round(raceStepsEstimate).toLocaleString()} <span className="text-xs text-zinc-500 font-normal">steps</span>
                          </span>
                        </div>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'drift_fatigue' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Cadence Decay / Drift Decoupling</CardTitle>
                    <CardDescription>
                      Compare average mechanics across first and second halves of key sessions to identify biomechanical stability.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstHalfCadence">First-Half Cadence (spm)</Label>
                        <Input 
                          id="firstHalfCadence" 
                          type="number" 
                          value={firstHalfCadence} 
                          onChange={e => setFirstHalfCadence(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="secondHalfCadence">Second-Half Cadence (spm)</Label>
                        <Input 
                          id="secondHalfCadence" 
                          type="number" 
                          value={secondHalfCadence} 
                          onChange={e => setSecondHalfCadence(e.target.value)} 
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md space-y-2">
                      <div className="text-xs text-zinc-500 uppercase font-mono">Calculated Decoupling Drift</div>
                      <div className={`text-4xl font-extrabold font-mono ${driftPct < 0 ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-zinc-100'}`}>
                        {driftPct > 0 ? '+' : ''}{driftPct.toFixed(2)}%
                      </div>
                      
                      <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                        <p className="font-semibold text-zinc-700 dark:text-zinc-300">Biomechanical Rule-Based Note:</p>
                        {driftPct < -3 ? (
                          <p>Significant mechanical cadence decay detected. Indicates typical aerobic strength drift or leg-muscle fatigue.</p>
                        ) : driftPct > 3 ? (
                          <p>Aggressive step frequency elevation during final stretch. Pacing reflects kick performance style.</p>
                        ) : (
                          <p>Stable, balanced neuromuscular coordination. Excellent resistance to physical gait decoupling.</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'vertical_osc' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Vertical Ratio & Foot strike Balance</CardTitle>
                    <CardDescription>
                      Evaluate vertical oscillation offset compared to horizontal stride length to measure absolute displacement waste.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="vertOsc">Vertical Oscillation (cm)</Label>
                        <Input 
                          id="vertOsc" 
                          type="number" 
                          step="0.1" 
                          value={vertOsc} 
                          onChange={e => setVertOsc(e.target.value)} 
                        />
                        <span className="text-[10px] text-zinc-500 font-mono">Upward torso bounce per step</span>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stepLenCm">Horizontal Step Length (cm)</Label>
                        <Input 
                          id="stepLenCm" 
                          type="number" 
                          value={stepLenCm} 
                          onChange={e => setStepLenCm(e.target.value)} 
                        />
                        <span className="text-[10px] text-zinc-500 font-mono">Should equal your step length on page 1</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                      
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                        <span className="text-xs text-zinc-400 font-mono uppercase block">Calculated Vertical Ratio</span>
                        <span className="text-2xl font-bold font-mono text-zinc-950 dark:text-zinc-50">
                          {vertRatioPct.toFixed(2)}%
                        </span>
                        <div className="text-[10px] text-zinc-500 font-mono mt-1">
                          {vertRatioPct < 6 ? "Exceptional vertical economy (<6%)" : vertRatioPct <= 10 ? "Good standard vertical displacement (6-10%)" : "Wasteful vertical bounce (>10%)"}
                        </div>
                      </div>

                      <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                        <span className="text-xs text-zinc-400 font-mono uppercase block">Ground Contact Symmetry Balance</span>
                        <div className="grid grid-cols-2 gap-4 mt-2">
                          <div className="space-y-1">
                            <Label className="text-[10px] block font-mono">Left (%)</Label>
                            <Input 
                              type="number" 
                              value={gcBalanceL} 
                              onChange={e => {
                                setGcBalanceL(e.target.value);
                                const parsed = parseFloat(e.target.value);
                                if (!isNaN(parsed) && parsed <= 100) {
                                  setGcBalanceR((100 - parsed).toFixed(1));
                                }
                              }} 
                              className="h-8 font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] block font-mono">Right (%)</Label>
                            <Input 
                              type="number" 
                              value={gcBalanceR} 
                              onChange={e => {
                                setGcBalanceR(e.target.value);
                                const parsed = parseFloat(e.target.value);
                                if (!isNaN(parsed) && parsed <= 100) {
                                  setGcBalanceL((100 - parsed).toFixed(1));
                                }
                              }} 
                              className="h-8 font-mono"
                            />
                          </div>
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono mt-2 uppercase">
                          Symmetry Footstrike Imbalance: {gcBalanceDelta.toFixed(1)}% {gcBalanceDelta > 1 ? "⚠️" : "✅"}
                        </div>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'metronome' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Metronome & Target Cadence Configurator</CardTitle>
                    <CardDescription>
                      Simulate a targeted pacing cadence and see the exact step stride dimensions required to achieve it.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Target Pace Minutes</Label>
                        <Input 
                          type="number" 
                          value={targetPaceMin} 
                          onChange={e => setTargetPaceMin(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Target Pace Seconds</Label>
                        <Input 
                          type="number" 
                          value={targetPaceSec} 
                          onChange={e => setTargetPaceSec(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="targetCadenceValue">Target Cadence (spm)</Label>
                        <Input 
                          id="targetCadenceValue" 
                          type="number" 
                          value={targetCadenceValue} 
                          onChange={e => setTargetCadenceValue(e.target.value)} 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                      
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                        <span className="text-xs text-zinc-400 font-mono block uppercase">Needed Step Length</span>
                        <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100 block mt-1">
                          {reqStrideAtTarget.toFixed(2)} <span className="text-xs text-zinc-500 font-normal font-sans">meters</span>
                        </span>
                        <p className="text-[10px] text-zinc-500 font-mono mt-2">
                          At {targetCadenceValue} spm, you need {reqStrideAtTarget.toFixed(2)}m steps to hold a {targetPaceMin}:{targetPaceSec}/km pace.
                        </p>
                      </div>

                      <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md flex flex-col justify-between">
                        <div>
                          <span className="text-xs text-zinc-400 font-mono block uppercase">Target Metronome SPM</span>
                          <span className="text-3xl font-extrabold font-mono text-zinc-950 dark:text-zinc-50 block mt-1">
                            {metronomeTarget} <span className="text-xs text-zinc-500 font-normal">BPM</span>
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-500 font-mono mt-2">
                          Synchronize run gate strike frequencies directly to {metronomeTarget} beats per minute audio timers.
                        </p>
                      </div>

                    </div>
                  </CardContent>
                </Card>
              )}

            </div>
          )}

          {/* Active Visual Graph Section (Rendered only on dynamic calculated state arrays) */}
          {isAdvanced && dynamicCurveData.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Cadence-to-Velocity Coupling Curve</CardTitle>
                <CardDescription>
                  This dynamic plot traces running velocity (km/h) as a function of stepping cadence, assuming your current step length of {strideVal}m.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dynamicCurveData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="cadence" label={{ value: 'Cadence (spm)', position: 'insideBottom', offset: -5 }} stroke="#a1a1aa" fontSize={11} tickLine={false} />
                      <YAxis yAxisId="left" stroke="#18181b" fontSize={11} tickLine={false} label={{ value: 'Velocity (km/h)', angle: -90, position: 'insideLeft' }} />
                      <YAxis yAxisId="right" orientation="right" stroke="#71717a" fontSize={11} tickLine={false} label={{ value: 'Steps per Kilometer', angle: 90, position: 'insideRight' }} />
                      <Tooltip />
                      <Legend verticalAlign="top" height={36}/>
                      <Line yAxisId="left" type="monotone" dataKey="SpeedKmh" name="Velocity (km/h)" stroke="#18181b" strokeWidth={2} activeDot={{ r: 8 }} />
                      <Line yAxisId="right" type="monotone" dataKey="StepsPerKm" name="Total Steps/km" stroke="#71717a" strokeDasharray="5 5" strokeWidth={1} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Right Side Column: Educational Panel */}
        <div className="space-y-6">
          <Card className="border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-zinc-800 dark:text-zinc-200" />
                <CardTitle className="text-sm font-bold uppercase tracking-wider">Methodology Footnotes & Source Trace</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs font-mono text-zinc-600 dark:text-zinc-400">
              
              <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                <div className="font-semibold text-zinc-800 dark:text-zinc-200 uppercase mb-1">Cadence Model</div>
                <p>Formula: steps / minutes</p>
                <p className="mt-1 text-[10px] text-zinc-400">
                  Calculates total individual foot contact events per unit time. Real-time accelerometers measure peaks.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                <div className="font-semibold text-zinc-800 dark:text-zinc-200 uppercase mb-1">Stride / Step Length</div>
                <p>Step Length = distance / steps</p>
                <p>Stride Cycle = stepLength × 2</p>
                <p className="mt-1 text-[10px] text-zinc-400">
                  Track.Lab conforms to consumer telemetry standards by modeling stride length as step length for simplified visual feedback.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                <div className="font-semibold text-zinc-800 dark:text-zinc-200 uppercase mb-1">Decoupling (Drift)</div>
                <p>Drift = (second½ - first½) / first½ × 100</p>
                <p className="mt-1 text-[10px] text-zinc-400">
                  Highlights metabolic drift fatigue. Steady-state running demands stable mechanics across aerobic duration blocks.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                <div className="font-semibold text-zinc-800 dark:text-zinc-200 uppercase mb-1">Vertical Ratio</div>
                <p>Ratio % = Vert_Osc (cm) / Step_Length (cm) × 100</p>
                <p className="mt-1 text-[10px] text-zinc-400">
                  Measures displacement waste. A high ratio shows energy lost traveling upward against gravity instead of forward horizontally.
                </p>
              </div>

              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-400 rounded-md text-[10px]">
                <span className="font-bold block uppercase mb-1">LIMITATIONS NOTE:</span>
                Mathematical estimates are precise but qualitative in nature. Track.Lab does NOT offer running form diagnosis, physical therapy advice, or injury predictions.
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

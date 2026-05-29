'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input, Label, Button, Select, ValidationMessage } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { CalculatorPageShell } from '@/components/calculator/CalculatorPageShell';
import { ManualInputPanel } from '@/components/calculator/ManualInputPanel';
import { ExportPanel } from '@/components/calculator/CalculatorSystem';
import { resultToText } from '@/lib/export/manualExport';
import { CalculatorResult } from '@/types';
import {
  calculateSleepDuration,
  calculateSleepDebt,
  calculateRHRDelta,
  calculateHRVDelta,
  calculateBodyMassChange,
  calculatePreviousSessionLoad,
  calculateFatigueScaleCategory,
  calculateSorenessScaleCategory,
  detectManualRedFlags,
  calculateRecoveryCategory,
  calculateLoadRecoveryBalance
} from '@/lib/calculators_pack/recoverySystem';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell
} from 'recharts';

export default function RecoveryCheckLabPage() {
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick');
  
  // Inputs state
  const [targetSleep, setTargetSleep] = useState('8.0');
  const [sleepStart, setSleepStart] = useState('22:00');
  const [sleepEnd, setSleepEnd] = useState('06:00');
  
  const [baseRhr, setBaseRhr] = useState('54');
  const [todayRhr, setTodayRhr] = useState('56');
  
  const [baseHrv, setBaseHrv] = useState('65');
  const [todayHrv, setTodayHrv] = useState('58');
  
  const [baseW, setBaseW] = useState('72.5');
  const [todayW, setTodayW] = useState('72.1');
  
  const [sessionDur, setSessionDur] = useState('45');
  const [sessionRpe, setSessionRpe] = useState('6');
  
  const [fatigue, setFatigue] = useState('3');
  const [soreness, setSoreness] = useState('2');
  
  // Red flag symptoms checkboxes
  const [illness, setIllness] = useState(false);
  const [pain, setPain] = useState(false);
  const [dizziness, setDizziness] = useState(false);
  const [chestSymptoms, setChestSymptoms] = useState(false);
  const [abnormalDiscomfort, setAbnormalDiscomfort] = useState(false);

  const [result, setResult] = useState<CalculatorResult<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setTargetSleep('8.0');
    setSleepStart('22:00');
    setSleepEnd('06:00');
    setBaseRhr('54');
    setTodayRhr('56');
    setBaseHrv('65');
    setTodayHrv('58');
    setBaseW('72.5');
    setTodayW('72.1');
    setSessionDur('45');
    setSessionRpe('6');
    setFatigue('3');
    setSoreness('2');
    setIllness(false);
    setPain(false);
    setDizziness(false);
    setChestSymptoms(false);
    setAbnormalDiscomfort(false);
    setResult(null);
    setError(null);
  };

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const actualSleepHours = calculateSleepDuration(sleepStart, sleepEnd);
    if (actualSleepHours === null) {
      return setError('Please provide valid sleep times.');
    }

    const targetH = parseFloat(targetSleep);
    if (isNaN(targetH) || targetH <= 0 || targetH > 24) {
      return setError('Please provide a valid target sleep duration.');
    }

    const bRhr = parseFloat(baseRhr);
    const tRhr = parseFloat(todayRhr);
    if (isNaN(bRhr) || isNaN(tRhr) || bRhr <= 0 || tRhr <= 0) {
      return setError('Please enter positive numbers for RHR (Resting Heart Rate).');
    }

    const bHrv = parseFloat(baseHrv);
    const tHrv = parseFloat(todayHrv);
    if (isNaN(bHrv) || isNaN(tHrv) || bHrv <= 0 || tHrv <= 0) {
      return setError('Please enter positive numbers for HRV in milliseconds.');
    }

    const bW = parseFloat(baseW);
    const tW = parseFloat(todayW);
    if (isNaN(bW) || isNaN(tW) || bW <= 0 || tW <= 0) {
      return setError('Please enter positive values for body mass / weight.');
    }

    const sDur = parseFloat(sessionDur);
    const sRpe = parseFloat(sessionRpe);
    if (isNaN(sDur) || isNaN(sRpe) || sDur < 0 || sRpe < 0) {
      return setError('Previous session duration and RPE must be non-negative.');
    }

    const fatScore = parseInt(fatigue, 10);
    const sorScore = parseInt(soreness, 10);
    if (isNaN(fatScore) || isNaN(sorScore)) {
      return setError('Please select valid fatigue and soreness ratings.');
    }

    // Process calculators
    const sleepDebt = calculateSleepDebt(targetH, actualSleepHours);
    const rhrDelta = calculateRHRDelta(tRhr, bRhr);
    const hrvDeltaPct = calculateHRVDelta(tHrv, bHrv);
    const weightDeltaPct = calculateBodyMassChange(tW, bW);
    const sLoad = calculatePreviousSessionLoad(sDur, sRpe);
    
    const fatigueLabel = calculateFatigueScaleCategory(fatScore);
    const sorenessLabel = calculateSorenessScaleCategory(sorScore);
    
    const flagsObj = detectManualRedFlags({
      illness,
      pain,
      dizziness,
      chestSymptoms,
      abnormalDiscomfort
    });

    const category = calculateRecoveryCategory({
      sleepHours: actualSleepHours,
      rhrDelta,
      hrvDeltaPct,
      fatigueScore: fatScore,
      sorenessScore: sorScore,
      hasFlags: flagsObj.hasFlags
    });

    const advice = calculateLoadRecoveryBalance(sLoad, category);

    // Color schema for qualitative levels
    const themeColor = category === "Green" ? "text-emerald-600" : category === "Yellow" ? "text-amber-500" : "text-rose-600";
    const bgFrame = category === "Green" ? "bg-emerald-50 dark:bg-emerald-950/20" : category === "Yellow" ? "bg-amber-50 dark:bg-amber-950/20" : "bg-rose-50 dark:bg-rose-950/20";
    const borderFrame = category === "Green" ? "border-emerald-200 dark:border-emerald-800" : category === "Yellow" ? "border-amber-200 dark:border-amber-800" : "border-rose-200 dark:border-rose-800";

    // Trace formulas representation
    const stepsTrace = [
      `1. Actual Sleep Duration: [Wake Time (${sleepEnd}) - Bedtime (${sleepStart})] = ${actualSleepHours.toFixed(2)} hours`,
      `2. Sleep Debt: Max(0, Target Sleep (${targetH.toFixed(1)}h) - Actual Sleep (${actualSleepHours.toFixed(2)}h)) = ${sleepDebt.toFixed(2)} hours`,
      `3. RHR Delta: Today's RHR (${tRhr} bpm) - Baseline ${bRhr} bpm = ${rhrDelta > 0 ? '+' : ''}${rhrDelta.toFixed(1)} bpm`,
      `4. HRV Change Percentage: [(Today HRV (${tHrv} ms) - Baseline (${bHrv} ms)) / Baseline (${bHrv} ms)] * 100 = ${hrvDeltaPct > 0 ? '+' : ''}${hrvDeltaPct.toFixed(2)}%`,
      `5. Body Mass Change: [(Today's Weight (${tW} kg) - Baseline (${bW} kg)) / Baseline (${bW} kg)] * 100 = ${weightDeltaPct > 0 ? '+' : ''}${weightDeltaPct.toFixed(2)}%`,
      `6. Session sRPE Load: Duration (${sDur} min) * RPE rating (${sRpe}) = ${sLoad.toFixed(0)}`,
      `7. Fatigue Checklist Profile Score: ${fatScore}/10 (${fatigueLabel})`,
      `8. Soreness Checklist Profile Score: ${sorScore}/10 (${sorenessLabel})`,
      `9. Self-Reported Symptoms Red Flag: Status = ${flagsObj.hasFlags ? 'ACTIVE WARNING' : 'NOMINAL'}. Active: ${flagsObj.activeFlagsList.length > 0 ? flagsObj.activeFlagsList.join(", ") : "None"}`,
      `10. Modeled Physical Readiness Category logic:`,
      `    - IF redFlags is true OR fatigue >= 8 OR soreness >= 8 -> Category = RED.`,
      `    - ELSE IF actualSleep < 6.0h OR rhrDelta >= 6 bpm OR hrvDeltaPct <= -15.0% OR fatigue >= 5 OR soreness >= 5 -> Category = YELLOW.`,
      `    - ELSE -> Category = GREEN.`,
      `    Resulting Category: ${category && category.toUpperCase()}`
    ];

    // Data for Comparison Chart
    const barChartData = [
      { name: "Sleep Duration", Current: actualSleepHours, Baseline: targetH, Unit: "hrs" },
      { name: "Resting HR", Current: tRhr, Baseline: bRhr, Unit: "bpm" },
      { name: "HRV Index", Current: tHrv, Baseline: bHrv, Unit: "ms" },
      { name: "Body Mass (Scale/10)", Current: parseFloat((tW / 10).toFixed(2)), Baseline: parseFloat((bW / 10).toFixed(2)), Unit: "kg/10" }
    ];

    setResult({
      result: (
        <div className="flex flex-col gap-5">
          {/* Status Badge */}
          <div className={`p-4 border-2 rounded-xl text-center shadow-[1px_1px_0px_rgba(23,23,23,1)] ${bgFrame} ${borderFrame}`}>
            <span className="text-muted-foreground text-[10px] tracking-widest block uppercase font-bold mb-1">
              Manual Recovery Check Status
            </span>
            <span className={`font-display text-2xl font-black ${themeColor} tracking-tight`}>
              {category === "Green" ? "🟢 GREEN - RESTED" : category === "Yellow" ? "🟡 YELLOW - MODERATE REST" : "🔴 RED - CAUTION REQUIRED"}
            </span>
          </div>

          {/* Load Balance Advice */}
          <div className="p-3 border-2 border-border-heavy bg-zinc-50 dark:bg-zinc-900 rounded-lg shadow-[1px_1px_0px_rgba(23,23,23,1)] text-xs space-y-1">
            <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground block">
              Load & Recovery Balancing Suggestion
            </span>
            <p className="text-foreground leading-relaxed font-medium">
              {advice}
            </p>
          </div>

          {/* Quantitative Metrics Deltas Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="p-3 border-2 border-border-heavy bg-white rounded-lg shadow-[1px_1px_0px_rgba(23,23,23,1)]">
              <span className="text-muted-foreground text-[9px] block uppercase font-bold tracking-wider">Sleep Actual</span>
              <span className="font-mono font-bold text-foreground text-sm">{actualSleepHours.toFixed(1)}h</span>
              <span className="text-zinc-500 text-[9px] block mt-0.5">Debt: {sleepDebt.toFixed(1)}h</span>
            </div>
            
            <div className="p-3 border-2 border-border-heavy bg-white rounded-lg shadow-[1px_1px_0px_rgba(23,23,23,1)]">
              <span className="text-muted-foreground text-[9px] block uppercase font-bold tracking-wider">RHR Delta</span>
              <span className={`font-mono font-bold text-sm ${rhrDelta > 0 ? "text-orange-600" : "text-emerald-600"}`}>
                {rhrDelta > 0 ? '+' : ''}{rhrDelta.toFixed(1)} bpm
              </span>
              <span className="text-zinc-500 text-[9px] block mt-0.5">Base: {bRhr} / Today: {tRhr}</span>
            </div>

            <div className="p-3 border-2 border-border-heavy bg-white rounded-lg shadow-[1px_1px_0px_rgba(23,23,23,1)]">
              <span className="text-muted-foreground text-[9px] block uppercase font-bold tracking-wider">HRV Change</span>
              <span className={`font-mono font-bold text-sm ${hrvDeltaPct < -10 ? "text-orange-600" : "text-emerald-700"}`}>
                {hrvDeltaPct > 0 ? '+' : ''}{hrvDeltaPct.toFixed(1)}%
              </span>
              <span className="text-zinc-500 text-[9px] block mt-0.5">Base: {bHrv} / Today: {tHrv}</span>
            </div>

            <div className="p-3 border-2 border-border-heavy bg-white rounded-lg shadow-[1px_1px_0px_rgba(23,23,23,1)]">
              <span className="text-muted-foreground text-[9px] block uppercase font-bold tracking-wider">Weight Change</span>
              <span className="font-mono font-bold text-foreground text-sm">
                {weightDeltaPct > 0 ? '+' : ''}{weightDeltaPct.toFixed(2)}%
              </span>
              <span className="text-zinc-500 text-[9px] block mt-0.5">{tW} kg / Base: {bW}</span>
            </div>

            <div className="p-3 border-2 border-border-heavy bg-white rounded-lg shadow-[1px_1px_0px_rgba(23,23,23,1)]">
              <span className="text-muted-foreground text-[9px] block uppercase font-bold tracking-wider">Last sRPE Load</span>
              <span className="font-mono font-bold text-foreground text-sm">{sLoad}</span>
              <span className="text-zinc-500 text-[9px] block mt-0.5">{sDur}m at RPE {sRpe}</span>
            </div>

            <div className="p-3 border-2 border-border-heavy bg-white rounded-lg shadow-[1px_1px_0px_rgba(23,23,23,1)]">
              <span className="text-muted-foreground text-[9px] block uppercase font-bold tracking-wider">Subjective Index</span>
              <span className="font-mono font-bold text-foreground text-xs block truncate" title={`Fatigue: ${fatScore}, Soreness: ${sorScore}`}>
                F: {fatScore} | S: {sorScore}
              </span>
              <span className="text-zinc-500 text-[9px] block mt-0.5 truncate">{sorenessLabel}</span>
            </div>
          </div>

          {/* Red Flag Warning Box */}
          {flagsObj.hasFlags && (
            <div className="p-3 border-2 border-rose-300 bg-rose-50 dark:bg-rose-950/20 rounded-lg text-rose-800 dark:text-rose-200 text-xs font-semibold leading-normal">
              ⚠️ {flagsObj.cautionNote}
            </div>
          )}

          {/* Chart Section */}
          <div className="border-2 border-border-heavy bg-white p-4 rounded-xl shadow-[1px_1px_0px_rgba(23,23,23,1)]">
            <span className="text-muted-foreground text-[10px] tracking-widest block uppercase font-bold mb-3">
              Comparative Physical Dashboard (Today vs Baseline)
            </span>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: "bold" }} />
                  <YAxis tick={{ fontSize: 9 }} />
                  <Tooltip wrapperStyle={{ fontSize: 10 }} />
                  <Legend wrapperStyle={{ fontSize: 9 }} />
                  <Bar dataKey="Baseline" fill="#71717a" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Current" fill="#2563eb" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <span className="text-[9px] text-zinc-500 block text-center mt-2 font-mono">
              Note: Body Mass value is scaled down by 10 to fit on the dual axis chart.
            </span>
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
      methodSelected: 'Unified Manual Recovery Checking',
      confidenceLabel: 'Manual',
      formulaUsed: 'Delta = Today - Baseline | sRPE Load = Duration * RPE | Logical Conditions mapping',
      inputUsed: {
        sleepStart,
        sleepEnd,
        baseRhr,
        todayRhr,
        baseHrv,
        todayHrv,
        baseW,
        todayW,
        sessionDur,
        sessionRpe,
        fatigue,
        soreness,
        symptoms: `${illness ? 'illness,' : ''}${pain ? 'pain,' : ''}${dizziness ? 'dizziness,' : ''}${chestSymptoms ? 'chest,' : ''}${abnormalDiscomfort ? 'abnormal' : ''}` || 'none'
      },
      limitations: 'Subjective self-ratings are included. This program forms zero clinical diagnoses, injuries forecast, or readiness prediction.'
    });
  };

  return (
    <CalculatorPageShell title="Recovery Check Lab" subtitle="Combine rest metrics, cardiovascular deltas, and self-checks in a manual recovery check panel.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <ManualInputPanel
          mode={mode}
          setMode={setMode}
          supportsAdvanced={false}
          onCalculate={handleCalculate}
          onReset={handleReset}
          error={error}
        >
          {/* Section 1: Sleep Parameters */}
          <div className="space-y-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">1. Rest & Sleep Timeline</h4>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="targetSleep">Target (hrs)</Label>
                <Input id="targetSleep" type="number" step="0.5" value={targetSleep} onChange={e => setTargetSleep(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="sleepStart">Bedtime (HH:MM)</Label>
                <Input id="sleepStart" type="text" placeholder="22:00" value={sleepStart} onChange={e => setSleepStart(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="sleepEnd">Wake Time (HH:MM)</Label>
                <Input id="sleepEnd" type="text" placeholder="06:00" value={sleepEnd} onChange={e => setSleepEnd(e.target.value)} required />
              </div>
            </div>
          </div>

          {/* Section 2: Cardiovascular Baseline */}
          <div className="space-y-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">2. Cardiovascular Baseline vs Today</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="baseRhr">Baseline RHR (bpm)</Label>
                <Input id="baseRhr" type="number" placeholder="50" value={baseRhr} onChange={e => setBaseRhr(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="todayRhr">Today&apos;s RHR (bpm)</Label>
                <Input id="todayRhr" type="number" placeholder="52" value={todayRhr} onChange={e => setTodayRhr(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="baseHrv">Baseline HRV (ms)</Label>
                <Input id="baseHrv" type="number" placeholder="60" value={baseHrv} onChange={e => setBaseHrv(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="todayHrv">Today&apos;s HRV (ms)</Label>
                <Input id="todayHrv" type="number" placeholder="55" value={todayHrv} onChange={e => setTodayHrv(e.target.value)} required />
              </div>
            </div>
          </div>

          {/* Section 3: Mass Balance */}
          <div className="space-y-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">3. Body Mass Fluctuations</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="baseW">Baseline Weight (kg)</Label>
                <Input id="baseW" type="number" step="0.1" placeholder="70.0" value={baseW} onChange={e => setBaseW(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="todayW">Today&apos;s Weight (kg)</Label>
                <Input id="todayW" type="number" step="0.1" placeholder="69.8" value={todayW} onChange={e => setTodayW(e.target.value)} required />
              </div>
            </div>
          </div>

          {/* Section 4: Previous Session Fatigue */}
          <div className="space-y-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">4. Previous Session sRPE Strain</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sessionDur">Duration (mins)</Label>
                <Input id="sessionDur" type="number" placeholder="60" value={sessionDur} onChange={e => setSessionDur(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="sessionRpe">Session RPE (1-10 scale)</Label>
                <Input id="sessionRpe" type="number" placeholder="6" min="1" max="10" value={sessionRpe} onChange={e => setSessionRpe(e.target.value)} required />
              </div>
            </div>
          </div>

          {/* Section 5: Subjective Wellness Indicators */}
          <div className="space-y-3 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <h4 className="font-bold text-xs uppercase tracking-widest text-muted-foreground">5. Subjective Wellness (1-10 Dials)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fatigue">Fatigue Rating (1-10)</Label>
                <Select id="fatigue" value={fatigue} onChange={e => setFatigue(e.target.value)}>
                  {[...Array(10)].map((_, i) => (
                    <option key={i+1} value={i+1}>{i+1} - {calculateFatigueScaleCategory(i+1)}</option>
                  ))}
                </Select>
              </div>
              <div>
                <Label htmlFor="soreness">Muscle Soreness Rating (1-10)</Label>
                <Select id="soreness" value={soreness} onChange={e => setSoreness(e.target.value)}>
                  {[...Array(10)].map((_, i) => (
                    <option key={i+1} value={i+1}>{i+1} - {calculateSorenessScaleCategory(i+1)}</option>
                  ))}
                </Select>
              </div>
            </div>
          </div>

          {/* Section 6: Manual Symptom Flag Checklist */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-widest text-rose-500">6. Manual Symptom Flag Checklist</h4>
            <div className="space-y-2 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-foreground font-medium">
                <input type="checkbox" checked={illness} onChange={e => setIllness(e.target.checked)} className="rounded border-zinc-300 dark:border-zinc-700 bg-background accent-rose-600 w-4 h-4" />
                <span>Signs of active illness (fever, chills, cold)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-foreground font-medium">
                <input type="checkbox" checked={pain} onChange={e => setPain(e.target.checked)} className="rounded border-zinc-300 dark:border-zinc-700 bg-background accent-rose-600 w-4 h-4" />
                <span>Localized acute joint or osseous pain</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-foreground font-medium">
                <input type="checkbox" checked={dizziness} onChange={e => setDizziness(e.target.checked)} className="rounded border-zinc-300 dark:border-zinc-700 bg-background accent-rose-600 w-4 h-4" />
                <span>Unusual lightheadedness, chest tightness, or dynamic symptoms</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-foreground font-medium">
                <input type="checkbox" checked={chestSymptoms} onChange={e => setChestSymptoms(e.target.checked)} className="rounded border-zinc-300 dark:border-zinc-700 bg-background accent-rose-600 w-4 h-4" />
                <span>Abnormal cardiovascular fatigue patterns</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-foreground font-medium">
                <input type="checkbox" checked={abnormalDiscomfort} onChange={e => setAbnormalDiscomfort(e.target.checked)} className="rounded border-zinc-300 dark:border-zinc-700 bg-background accent-rose-600 w-4 h-4" />
                <span>Generalized severe localized discomfort</span>
              </label>
            </div>
            <span className="text-[10px] text-zinc-500 block leading-tight pt-1">
              Track.Lab checks do not provide medical diagnosis, readiness oracle estimations, or injury guarantees. Use for passive planning references only.
            </span>
          </div>
        </ManualInputPanel>

        {/* Results and Exports Panel */}
        <div className="h-full flex flex-col gap-6">
          {result ? (
            <>
              <ResultCard result={result} />
              <ExportPanel textToCopy={resultToText(result, "Recovery Check Lab Results")} />
            </>
          ) : (
            <div className="p-6 border-2 border-dashed border-border-heavy bg-card rounded-xl text-center flex flex-col items-center justify-center h-full min-h-[300px]">
              <span className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-1 block">Awaiting Manual Metrics Entry</span>
              <p className="text-xs text-zinc-500 max-w-sm">
                Provide bedtime, wake schedule, baseline and today&apos;s cardiovascular indices, weight data, and click &quot;Calculate&quot; to inspect physical balances.
              </p>
            </div>
          )}
        </div>
      </div>
    </CalculatorPageShell>
  );
}

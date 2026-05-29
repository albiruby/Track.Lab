'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input, Label, Select, Button, ValidationMessage } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { CalculatorPageShell } from '@/components/calculator/CalculatorPageShell';
import { ExportPanel } from '@/components/calculator/CalculatorSystem';
import { resultToText } from '@/lib/export/manualExport';
import { 
  formatSecondsToTimeString, 
  parseDurationToSeconds,
  safeNumber
} from '@/lib/formatters/time';
import {
  calculateWeeklyDistance,
  calculateWeeklyDuration,
  calculateLongRunRatio,
  calculateHardEasySpacing,
  calculateIntensityDistribution,
  calculateTaperReduction,
  calculateBuildWeekProgression,
  calculateDeloadRatio
} from '@/lib/calculators_pack/plannerSystem';

interface DailyPlannerDay {
  dayName: string;
  offType: 'rest' | 'run' | 'cross_train';
  distance: number;
  durationSeconds: number;
  intensity: 'rest' | 'recovery' | 'easy' | 'moderate' | 'hard' | 'threshold';
  rpe: number;
  comment: string;
}
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Sparkles, 
  ShieldAlert, 
  Copy, 
  RotateCcw, 
  Plus, 
  Trash, 
  HelpCircle, 
  SlidersHorizontal, 
  Calendar, 
  Printer, 
  Activity, 
  TrendingUp, 
  Coffee,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet
} from 'lucide-react';
import Link from 'next/link';

export default function CalendarLabPage() {
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick');

  // Quick Mode state
  const [quickDistances, setQuickDistances] = useState('5, 0, 8, 0, 10, 0, 15');
  const [quickPace, setQuickPace] = useState('5:00'); // corresponding to minutes:seconds per km or mile
  const [isCalculatedQuick, setIsCalculatedQuick] = useState(false);

  // Advanced Mode state
  const [days, setDays] = useState<DailyPlannerDay[]>([
    { dayName: 'Monday', offType: 'rest', distance: 0, durationSeconds: 0, intensity: 'rest', rpe: 0, comment: '' },
    { dayName: 'Tuesday', offType: 'run', distance: 8, durationSeconds: 2400, intensity: 'easy', rpe: 4, comment: 'Easy building loops' },
    { dayName: 'Wednesday', offType: 'run', distance: 10, durationSeconds: 2700, intensity: 'moderate', rpe: 6, comment: 'Steady mid-week tempo segments' },
    { dayName: 'Thursday', offType: 'rest', distance: 0, durationSeconds: 0, intensity: 'rest', rpe: 0, comment: '' },
    { dayName: 'Friday', offType: 'run', distance: 8, durationSeconds: 2160, intensity: 'hard', rpe: 8, comment: 'Critical speed interval sets' },
    { dayName: 'Saturday', offType: 'cross_train', distance: 0, durationSeconds: 1800, intensity: 'recovery', rpe: 3, comment: 'Active recovery spin cycle' },
    { dayName: 'Sunday', offType: 'run', distance: 16, durationSeconds: 5120, intensity: 'easy', rpe: 5, comment: 'Weekly endurance long run' },
  ]);

  // Progression reference week mileages
  const [prevWeekMileage, setPrevWeekMileage] = useState('45');

  // Formatting and output states
  const [error, setError] = useState<string | null>(null);
  const [isPrintLayout, setIsPrintLayout] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const handleReset = () => {
    setError(null);
    setIsCalculatedQuick(false);
    setIsPrintLayout(false);
    setCopyStatus(null);
    
    setQuickDistances('5, 0, 8, 0, 10, 0, 15');
    setQuickPace('5:00');
    setPrevWeekMileage('45');

    setDays([
      { dayName: 'Monday', offType: 'rest', distance: 0, durationSeconds: 0, intensity: 'rest', rpe: 0, comment: '' },
      { dayName: 'Tuesday', offType: 'run', distance: 8, durationSeconds: 2400, intensity: 'easy', rpe: 4, comment: 'Easy building loops' },
      { dayName: 'Wednesday', offType: 'run', distance: 10, durationSeconds: 2700, intensity: 'moderate', rpe: 6, comment: 'Steady mid-week tempo segments' },
      { dayName: 'Thursday', offType: 'rest', distance: 0, durationSeconds: 0, intensity: 'rest', rpe: 0, comment: '' },
      { dayName: 'Friday', offType: 'run', distance: 8, durationSeconds: 2160, intensity: 'hard', rpe: 8, comment: 'Critical speed interval sets' },
      { dayName: 'Saturday', offType: 'cross_train', distance: 0, durationSeconds: 1800, intensity: 'recovery', rpe: 3, comment: 'Active recovery spin cycle' },
      { dayName: 'Sunday', offType: 'run', distance: 16, durationSeconds: 5120, intensity: 'easy', rpe: 5, comment: 'Weekly endurance long run' },
    ]);
  };

  // Convert quick mode inputs into daily objects
  const quickDaysArray = useMemo(() => {
    const dists = quickDistances.split(',').map(s => parseFloat(s.trim()));
    const pSec = parseDurationToSeconds(quickPace) || 300; // default 5:00
    const dayLabels = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return dayLabels.map((name, i) => {
      const dist = i < dists.length && !isNaN(dists[i]) ? dists[i] : 0;
      const tSec = dist * pSec;
      return {
        dayName: name,
        offType: dist === 0 ? 'rest' as const : 'run' as const,
        distance: dist,
        durationSeconds: tSec,
        intensity: dist === 0 ? 'rest' as const : (dist >= 12 ? 'easy' as const : 'moderate' as const),
        rpe: dist === 0 ? 0 : 5,
        comment: ''
      };
    });
  }, [quickDistances, quickPace]);

  // Active planning objects based on mode set
  const activeDays = useMemo(() => {
    return mode === 'quick' ? quickDaysArray : days;
  }, [mode, quickDaysArray, days]);

  // Calculate high-fidelity planning outputs
  const weeklyAnalysis = useMemo(() => {
    const activeData = activeDays;
    
    const distances = activeData.map(d => d.distance);
    const durations = activeData.map(d => d.durationSeconds);

    const totalDistance = calculateWeeklyDistance(distances);
    const totalDurationSeconds = calculateWeeklyDuration(durations);
    
    // Find long run (highest mileage run)
    const runDistances = activeData.filter(d => d.offType === 'run').map(d => d.distance);
    const maxLongRun = runDistances.length > 0 ? Math.max(...runDistances) : 0;
    const longRunRatio = calculateLongRunRatio(maxLongRun, totalDistance);

    // Spacing heuristics checks (Map to standard DayPlan format)
    const mappedDays = activeData.map(d => {
      let intensityVal: 'rest' | 'easy' | 'moderate' | 'hard' | 'long run' = 'easy';
      if (d.offType === 'rest' || d.intensity === 'rest') {
        intensityVal = 'rest';
      } else if (d.offType === 'run' && d.distance === maxLongRun && d.distance >= 12) {
        intensityVal = 'long run';
      } else if (d.intensity === 'hard' || d.intensity === 'threshold') {
        intensityVal = 'hard';
      } else if (d.intensity === 'moderate') {
        intensityVal = 'moderate';
      }
      return {
        distance: d.distance,
        duration: d.durationSeconds / 60,
        intensity: intensityVal
      };
    });

    const spacingWarnings = calculateHardEasySpacing(mappedDays);
    const spacingResult = {
      isValid: spacingWarnings.length === 0,
      cautions: spacingWarnings
    };

    // Counts day summaries
    const restDays = activeData.filter(d => d.offType === 'rest' || d.intensity === 'rest').length;
    const runDays = activeData.filter(d => d.offType === 'run').length;
    const xTrainDays = activeData.filter(d => d.offType === 'cross_train').length;

    const hardDays = activeData.filter(d => d.intensity === 'hard' || d.intensity === 'threshold').length;
    const easyDays = activeData.filter(d => d.intensity === 'easy' || d.intensity === 'recovery').length;

    // Intensity Distribution minutes
    const easyMinutes = activeData
      .filter(d => d.intensity === 'easy' || d.intensity === 'recovery')
      .reduce((sum, d) => sum + d.durationSeconds / 60, 0);
    const moderateMinutes = activeData
      .filter(d => d.intensity === 'moderate')
      .reduce((sum, d) => sum + d.durationSeconds / 60, 0);
    const hardMinutes = activeData
      .filter(d => d.intensity === 'hard' || d.intensity === 'threshold')
      .reduce((sum, d) => sum + d.durationSeconds / 60, 0);

    const distPercentage = calculateIntensityDistribution(easyMinutes, moderateMinutes, hardMinutes);
    const distribution = {
      easy: easyMinutes * 60,
      moderate: moderateMinutes * 60,
      hard: hardMinutes * 60,
      easyPct: distPercentage.easyPct,
      moderatePct: distPercentage.moderatePct,
      hardPct: distPercentage.hardPct
    };

    return {
      totalDistance,
      totalDurationSeconds,
      maxLongRun,
      longRunRatio,
      spacingResult,
      restDays,
      runDays,
      xTrainDays,
      hardDays,
      easyDays,
      distribution
    };
  }, [activeDays]);

  // Calculate Build / Deload / Taper Rates
  const planningRates = useMemo(() => {
    const currentVol = weeklyAnalysis.totalDistance;
    const prevVol = parseFloat(prevWeekMileage);
    if (isNaN(prevVol) || prevVol <= 0 || currentVol <= 0) return null;

    const buildRate = calculateBuildWeekProgression(prevVol, currentVol);
    const deloadRate = calculateDeloadRatio(prevVol, currentVol);
    const taperRate = calculateTaperReduction(prevVol, currentVol);

    return {
      buildRate,
      deloadRate,
      taperRate,
      currentVol,
      prevVol
    };
  }, [prevWeekMileage, weeklyAnalysis]);

  // Format Recharts Pie Data for intensity minutes
  const intensityPieData = useMemo(() => {
    const list = [
      { name: 'Low (Z1 Recovery)', value: Math.round(weeklyAnalysis.distribution.easy / 60), color: '#3182ce' },
      { name: 'Moderate (Z2)', value: Math.round(weeklyAnalysis.distribution.moderate / 60), color: '#d69e2e' },
      { name: 'High (Threshold/HIIT)', value: Math.round(weeklyAnalysis.distribution.hard / 60), color: '#e53e3e' }
    ];
    return list.filter(item => item.value > 0);
  }, [weeklyAnalysis]);

  // Clipboard copy assembler
  const handleCopySummary = () => {
    const listText = activeDays.map(d => 
      `${d.dayName}: ${d.offType.toUpperCase()} | ${d.distance.toFixed(1)} km | ` +
      `${formatSecondsToTimeString(d.durationSeconds)} | Intensity: ${d.intensity.toUpperCase()} ${d.comment ? `(${d.comment})` : ''}`
    ).join('\n');

    const spacingDesc = weeklyAnalysis.spacingResult.isValid 
      ? 'Fully Compliant: Proper spacing between high-intensity efforts.'
      : `Caution Flag: ${weeklyAnalysis.spacingResult.cautions.join(', ')}`;

    const textPayload = 
      `Track.Lab Weekly Training Cadence Plan:\n` +
      `-----------------------------------------\n` +
      `Total Structural Distance: ${weeklyAnalysis.totalDistance.toFixed(2)} km\n` +
      `Estimated Time on Feet: ${formatSecondsToTimeString(weeklyAnalysis.totalDurationSeconds)}\n` +
      `Long Run Mileage Ratio: ${weeklyAnalysis.longRunRatio.toFixed(1)}% (Max run: ${weeklyAnalysis.maxLongRun} km)\n` +
      `Hard efforts count: ${weeklyAnalysis.hardDays} | Easy recovery: ${weeklyAnalysis.easyDays} | Rest/Off days: ${weeklyAnalysis.restDays}\n` +
      `Spacing Compliance: ${spacingDesc}\n\n` +
      `Daily Breakdown:\n` +
      `${listText}`;

    navigator.clipboard.writeText(textPayload);
    setCopyStatus('Summary copied!');
    setTimeout(() => setCopyStatus(null), 2500);
  };

  // CSV Exporter
  const handleExportCSV = () => {
    const headers = "Day,Activity,Distance,Duration,Intensity,RPE,Comment\n";
    const body = activeDays.map(d => 
      `"${d.dayName}","${d.offType}",${d.distance},"${formatSecondsToTimeString(d.durationSeconds)}","${d.intensity}",${d.rpe},"${d.comment.replace(/"/g, '""')}"`
    ).join('\n');

    const blob = new Blob([headers + body], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `tracklab_weekly_planner_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to change single advanced weekday attributes
  const handleUpdateDay = (idx: number, field: keyof DailyPlannerDay, value: any) => {
    const nextList = [...days];
    if (field === 'distance') {
      nextList[idx].distance = safeNumber(value) || 0;
    } else if (field === 'durationSeconds') {
      nextList[idx].durationSeconds = parseDurationToSeconds(value) || 0;
    } else if (field === 'rpe') {
      nextList[idx].rpe = parseInt(value, 10) || 0;
    } else {
      (nextList[idx] as any)[field] = value;
    }
    
    // Auto intensity if rest
    if (field === 'offType' && value === 'rest') {
      nextList[idx].intensity = 'rest';
      nextList[idx].distance = 0;
      nextList[idx].durationSeconds = 0;
      nextList[idx].rpe = 0;
    } else if (field === 'offType' && value === 'run' && nextList[idx].intensity === 'rest') {
      nextList[idx].intensity = 'easy';
    }
    setDays(nextList);
  };

  return (
    <CalculatorPageShell 
      title="Calendar Lab" 
      subtitle="Map out your manual weekly running structure, analyze critical load spacing, and trace training percentages without database storage or third-party AI."
    >
      {/* Short Dynamic Deep Links */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 bg-muted border-2 border-border-heavy p-3 rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
        <Link href="/workout" className="text-[10px] font-black uppercase tracking-wider text-center py-2 bg-white border border-border rounded-lg hover:bg-neutral-50 transition-colors">
          🛠️ OPEN WORKOUT LAB
        </Link>
        <Link href="/workout-library" className="text-[10px] font-black uppercase tracking-wider text-center py-2 bg-white border border-border rounded-lg hover:bg-neutral-50 transition-colors">
          📚 POPULAR PROTOCOLS
        </Link>
        <Link href="/load" className="text-[10px] font-black uppercase tracking-wider text-center py-2 bg-white border border-border rounded-lg hover:bg-neutral-50 transition-colors">
          📊 TRACE ACWR ACUTE STRESS
        </Link>
        <Link href="/pace" className="text-[10px] font-black uppercase tracking-wider text-center py-2 bg-white border border-border rounded-lg hover:bg-neutral-50 transition-colors">
          🏃 CHECK PACE ZONES
        </Link>
      </div>

      {/* Main Container Layout */}
      <div className={`grid grid-cols-1 ${isPrintLayout ? '' : 'lg:grid-cols-12'} gap-6 items-start`}>
        
        {/* INPUT PLANNING GRID */}
        <div className={`${isPrintLayout ? 'hidden' : 'lg:col-span-6'} space-y-6`}>
          
          {/* Quick vs Advanced Selection */}
          <div className="p-6 border-2 border-border-heavy bg-card rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
            <h3 className="font-display font-black text-xs uppercase tracking-widest text-zinc-700 mb-3">SCHEDULE SYSTEM ENGINE</h3>
            <div className="flex bg-neutral-100 p-1 border border-zinc-200 rounded-lg">
              <button
                onClick={() => { setMode('quick'); setError(null); }}
                className={`flex-1 text-center py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${mode === 'quick' ? 'bg-primary text-primary-foreground font-extrabold border border-border-heavy shadow-[1px_1px_0px_rgba(23,23,23,1)]' : 'text-muted-foreground'}`}
              >
                Quick Mode (Dists list)
              </button>
              <button
                onClick={() => { setMode('advanced'); setError(null); }}
                className={`flex-1 text-center py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${mode === 'advanced' ? 'bg-primary text-primary-foreground font-extrabold border border-border-heavy shadow-[1px_1px_0px_rgba(23,23,23,1)]' : 'text-muted-foreground'}`}
              >
                Advanced Mode (Weekly Matrix)
              </button>
            </div>
          </div>

          {/* Quick Mode Box */}
          {mode === 'quick' && (
            <div className="p-6 border-2 border-border-heavy bg-white rounded-xl shadow-[4px_4px_0px_rgba(23,23,23,1)] space-y-4">
              <div>
                <h3 className="font-display font-black text-lg mb-1 uppercase text-zinc-800">QUICK WEEK CONFIG</h3>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Provide 7 comma-separated daily mileages (Mon to Sun).</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); setIsCalculatedQuick(true); }} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="quickdists">Daily Distance Values (Mon to Sun)</Label>
                  <Input 
                    id="quickdists" 
                    type="text" 
                    value={quickDistances} 
                    onChange={e => { setQuickDistances(e.target.value); setIsCalculatedQuick(false); }} 
                    required 
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="quickpace">Representative Pace (MM:SS/unit)</Label>
                  <Input 
                    id="quickpace" 
                    type="text" 
                    placeholder="5:00" 
                    value={quickPace} 
                    onChange={e => { setQuickPace(e.target.value); setIsCalculatedQuick(false); }} 
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <Button type="submit" className="flex-1">Analyze Quick Week</Button>
                  <Button type="button" variant="outline" onClick={handleReset} className="px-4">
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Advanced Mode Weekly Matrix */}
          {mode === 'advanced' && (
            <div className="space-y-4">
              <div className="p-4 bg-muted border-2 border-border-heavy rounded-xl flex justify-between items-center shadow-sm">
                <span className="font-display font-black text-[10px] tracking-widest uppercase text-zinc-650">WEEK DAY DESK MATRIX</span>
                <Button variant="outline" onClick={handleReset} className="py-1 px-3 text-[10px] font-black leading-none bg-white h-8 uppercase">
                  <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Grid
                </Button>
              </div>

              <div className="space-y-3 max-h-[480px] overflow-y-auto border-2 border-border-heavy p-2 bg-neutral-50 rounded-lg">
                {days.map((day, idx) => {
                  const isOff = day.offType === 'rest';
                  return (
                    <div key={day.dayName} className="p-4 bg-white border-2 border-border-heavy rounded-xl shadow-sm space-y-3">
                      <div className="flex justify-between items-center border-b pb-1.5">
                        <span className="font-display font-black text-sm text-zinc-800 uppercase tracking-tight">{day.dayName}</span>
                        <div className="w-max">
                          <Select 
                            value={day.offType} 
                            onChange={e => handleUpdateDay(idx, 'offType', e.target.value)}
                            className="h-8 py-0 px-2 text-[10px] font-bold uppercase rounded"
                          >
                            <option value="run">🏃 Run Session</option>
                            <option value="rest">🛌 Complete Rest</option>
                            <option value="cross_train">🚴 Cross Train</option>
                          </Select>
                        </div>
                      </div>

                      {!isOff && (
                        <div className="grid grid-cols-2 gap-2.5 pt-1">
                          <div>
                            <Label className="text-[9px]">Distance</Label>
                            <Input 
                              type="number" 
                              step="0.1" 
                              value={day.distance} 
                              onChange={e => handleUpdateDay(idx, 'distance', e.target.value)}
                              className="h-9 py-1 px-2.5 text-xs rounded-lg"
                            />
                          </div>
                          <div>
                            <Label className="text-[9px]">Duration (MM:SS)</Label>
                            <Input 
                              type="text" 
                              placeholder="e.g. 50:00" 
                              value={formatSecondsToTimeString(day.durationSeconds)} 
                              onChange={e => handleUpdateDay(idx, 'durationSeconds', e.target.value)}
                              className="h-9 py-1 px-2.5 text-xs font-mono rounded-lg"
                            />
                          </div>
                          <div>
                            <Label className="text-[9px]">Intensity tag</Label>
                            <Select 
                              value={day.intensity} 
                              onChange={e => handleUpdateDay(idx, 'intensity', e.target.value)}
                              className="h-9 py-1 px-2.5 text-xs rounded-lg font-bold"
                            >
                              <option value="recovery">Z1 Recovery</option>
                              <option value="easy">Z2 Easy</option>
                              <option value="moderate">Z3 Aerobic Tempo</option>
                              <option value="hard">Z4 Threshold Intervals</option>
                              <option value="threshold">Z5 Rep speed</option>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-[9px]">Subjective RPE (1-10)</Label>
                            <Input 
                              type="number" 
                              min="0" 
                              max="10" 
                              value={day.rpe === 0 ? '' : day.rpe} 
                              onChange={e => handleUpdateDay(idx, 'rpe', e.target.value)}
                              className="h-9 py-1 px-2.5 text-xs rounded-lg"
                              placeholder="5"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-[9px]">Short comment / workout title</Label>
                            <Input 
                              type="text" 
                              placeholder="Describe segment goal briefly..." 
                              value={day.comment} 
                              onChange={e => handleUpdateDay(idx, 'comment', e.target.value)}
                              className="h-9 py-1 px-2.5 text-xs rounded-lg"
                            />
                          </div>
                        </div>
                      )}

                      {isOff && (
                        <p className="text-[10px] font-bold text-muted-foreground uppercase py-2 tracking-wide text-center bg-neutral-50 rounded italic">
                          Selected Day Off. Regenerating muscles.
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* BUILD & PROGRESSION CALIBRATOR BLOCK */}
          <div className="p-6 border-2 border-border-heavy bg-card rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)] space-y-4">
            <h4 className="font-display font-black text-xs tracking-widest text-zinc-755 uppercase flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-primary" /> SYSTEM LOAD MATRIX (COMPARE PREVIOUS)
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prevmile">Previous Week Vol</Label>
                <Input 
                  id="prevmile" 
                  type="number" 
                  value={prevWeekMileage} 
                  onChange={e => setPrevWeekMileage(e.target.value)} 
                />
                <p className="text-[9px] text-muted-foreground mt-1 text-center font-bold">Input numerical km / mile reference.</p>
              </div>

              {planningRates && (
                <div className="space-y-1 bg-white border-2 border-border-heavy p-2.5 rounded text-[10px] font-mono font-bold leading-normal">
                  <span className="block text-[8px] uppercase font-sans text-muted-foreground mb-1">DETERMINISTIC RATE DELTAS:</span>
                  <div className="flex justify-between">
                    <span>Build Progression:</span>
                    <strong className={planningRates.buildRate > 10 ? 'text-amber-500' : 'text-green-600'}>
                      {planningRates.buildRate.toFixed(1)}% {planningRates.buildRate > 10 ? '⚠️ High' : '✅ Safe'}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Deload Reduction:</span>
                    <strong className="text-indigo-600">{planningRates.deloadRate.toFixed(1)}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Taper volume drop:</span>
                    <strong className="text-zinc-700">{planningRates.taperRate.toFixed(1)}%</strong>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* OUTPUT MATRICES & CHARTS */}
        <div className={`${isPrintLayout ? 'lg:col-span-12' : 'lg:col-span-6'} space-y-6`}>
          
          {/* Main calculated panel */}
          <div className="border-2 border-border-heavy bg-white rounded-xl shadow-[4px_4px_0px_rgba(23,23,23,1)] overflow-hidden">
            
            {/* Print Header */}
            <div className="bg-neutral-900 text-white p-4 border-b-2 border-border-heavy flex justify-between items-center">
              <span className="font-display font-black text-xs uppercase tracking-widest text-indigo-400">
                {isPrintLayout ? 'PRINT LAYOUT WEEK PLANNER' : 'CURRENT PLAN METRICS'}
              </span>
              <div className="flex gap-2 shrink-0">
                <Button 
                  onClick={() => setIsPrintLayout(!isPrintLayout)} 
                  variant="outline" 
                  className="py-1 px-3 bg-white hover:bg-neutral-100 text-foreground h-8 text-[10px] font-black border border-border"
                >
                  <Printer className="w-3.5 h-3.5 mr-1 text-zinc-700" /> {isPrintLayout ? 'Normal View' : 'Print Mode'}
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">

              {/* SPACING CAUTIONS PANEL (Static Rules) */}
              {mode === 'advanced' && (
                <div className="space-y-3">
                  {!weeklyAnalysis.spacingResult.isValid ? (
                    <motion.div initial={{ scale: 0.98 }} animate={{ scale: 1 }} className="p-4 border-2 border-destructive bg-white text-destructive rounded-lg shadow-[2px_2px_0px_rgba(180,4,4,1)] flex gap-2.5">
                      <ShieldAlert className="w-5 h-5 grow-0 shrink-0 text-destructive mt-0.5" />
                      <div className="text-xs text-foreground leading-normal font-medium">
                        <strong className="text-destructive uppercase tracking-widest text-[10px] block mb-1">SPACING WARNING ENCOUNTERED</strong>
                        {weeklyAnalysis.spacingResult.cautions.map((c, i) => (
                          <div key={i} className="mb-1 bg-red-50 p-1.5 border border-red-100 rounded text-[11px] leading-snug font-mono text-destructive">
                            ⚠️ {c}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="p-3 bg-green-50 text-green-700 border border-green-200 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wide">
                      <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" /> Spacing fully compliant. Balanced density verified.
                    </div>
                  )}
                </div>
              )}

              {/* Highlight summary cards */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3.5 bg-muted border-2 border-border-heavy rounded-lg text-center">
                  <span className="block text-[8px] uppercase font-black text-muted-foreground tracking-widest mb-1">TOTAL VOLUME</span>
                  <strong className="font-display font-black text-md md:text-xl text-zinc-950">{weeklyAnalysis.totalDistance.toFixed(2)} km</strong>
                  <span className="block text-[8px] uppercase tracking-wider text-zinc-500 font-bold mt-1">Sum mileage</span>
                </div>
                <div className="p-3.5 bg-muted border-2 border-border-heavy rounded-lg text-center">
                  <span className="block text-[8px] uppercase font-black text-muted-foreground tracking-widest mb-1">TIME ON FEET</span>
                  <strong className="font-display font-black text-md md:text-xl text-zinc-950">{formatSecondsToTimeString(weeklyAnalysis.totalDurationSeconds)}</strong>
                  <span className="block text-[8px] uppercase tracking-wider text-zinc-500 font-bold mt-1">Duration sum</span>
                </div>
                <div className="p-3.5 bg-muted border-2 border-border-heavy rounded-lg text-center">
                  <span className="block text-[8px] uppercase font-black text-muted-foreground tracking-widest mb-1">LONG RUN RATIO</span>
                  <strong className={`font-display font-black text-md md:text-xl ${weeklyAnalysis.longRunRatio > 35 ? 'text-amber-600' : 'text-zinc-950'}`}>
                    {weeklyAnalysis.longRunRatio.toFixed(1)}%
                  </strong>
                  <span className="block text-[8px] uppercase tracking-wider text-zinc-500 font-bold mt-1">Max: {weeklyAnalysis.maxLongRun} km</span>
                </div>
              </div>

              {/* Weekly Agenda Table (Print-friendly) */}
              <div className="border border-border rounded overflow-hidden">
                <div className="bg-neutral-150 p-2 border-b font-display font-black text-[10px] text-zinc-650 tracking-widest uppercase text-center bg-neutral-100">
                  WEEK TRAINING LOG AGENDA
                </div>
                <table className="w-full text-left font-mono text-[11px] font-bold">
                  <thead className="bg-zinc-50 border-b uppercase font-bold text-[9px] text-zinc-550 select-none">
                    <tr>
                      <th className="p-2.5">Day</th>
                      <th className="p-2.5">Activity</th>
                      <th className="p-2.5">Vol (km)</th>
                      <th className="p-2.5">Duration</th>
                      <th className="p-2.5">Intensity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeDays.map(d => (
                      <tr key={d.dayName} className="border-b hover:bg-neutral-50">
                        <td className="p-2 text-primary font-bold uppercase">{d.dayName.slice(0, 3)}</td>
                        <td className="p-2">
                          <span className={`text-[10px] px-1 py-0.2 uppercase rounded ${d.offType === 'rest' ? 'bg-neutral-200 text-zinc-600' : 'bg-blue-10 w-max text-blue-700 font-extrabold'}`}>
                            {d.offType}
                          </span>
                        </td>
                        <td className="p-2">{d.distance > 0 ? `${d.distance.toFixed(1)} km` : '-'}</td>
                        <td className="p-2">{d.durationSeconds > 0 ? formatSecondsToTimeString(d.durationSeconds) : '-'}</td>
                        <td className="p-2 uppercase text-[10px] text-indigo-700">{d.intensity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Intensity Distribution bar Chart */}
              {intensityPieData.length > 0 && (
                <div className="space-y-1.5 pt-2">
                  <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1.5">Intensity Minutes Distribution</div>
                  <div className="h-44 w-full border border-border bg-neutral-50 p-2.5 rounded">
                    <ResponsiveContainer width="100%" height="105%">
                      <BarChart data={intensityPieData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'bold' }} />
                        <YAxis unit="m" tick={{ fontSize: 9, fontWeight: 'bold' }} />
                        <Tooltip formatter={(value) => [`${value} min`, 'Duration']} />
                        <Bar dataKey="value">
                          {intensityPieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Spacing indices counts */}
              <div className="grid grid-cols-4 gap-2.5 text-xs font-mono font-bold text-center">
                <div className="p-2 border border-border bg-card rounded shadow-sm">
                  <span className="block text-[8px] text-muted-foreground uppercase tracking-wider mb-0.5">Off Days</span>
                  <span>{weeklyAnalysis.restDays}</span>
                </div>
                <div className="p-2 border border-border bg-card rounded shadow-sm">
                  <span className="block text-[8px] text-muted-foreground uppercase tracking-wider mb-0.5">Run Days</span>
                  <span>{weeklyAnalysis.runDays}</span>
                </div>
                <div className="p-2 border border-border bg-card rounded shadow-sm">
                  <span className="block text-[8px] text-muted-foreground uppercase tracking-wider mb-0.5">Easy Days</span>
                  <span>{weeklyAnalysis.easyDays}</span>
                </div>
                <div className="p-2 border border-border bg-card rounded shadow-sm">
                  <span className="block text-[8px] text-muted-foreground uppercase tracking-wider mb-0.5">Hard Days</span>
                  <span>{weeklyAnalysis.hardDays}</span>
                </div>
              </div>

              {/* Limitations details and traceability */}
              <div className="p-4 bg-zinc-50 border border-zinc-200 rounded text-[10px] font-mono leading-relaxed space-y-3">
                <p><strong className="text-foreground uppercase text-[8px] font-sans block">Trace methods:</strong> Weekly schedule aggregator and Acute Hard sequencing checkers.</p>
                <p><strong className="text-foreground uppercase text-[8px] font-sans block">Axioms &amp; Limitations:</strong> Calculations focus entirely on typed calendar durations. Individual physical regeneration rates shift heavily on sleep parameters, age, and genetics.</p>
                <p><strong className="text-foreground uppercase text-[8px] font-sans block">Confidence label:</strong> Rule-based heuristic coaching model</p>
              </div>

              {/* Export Panel Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <Button variant="secondary" onClick={handleCopySummary} className="text-xs">
                  <Copy className="w-4 h-4 mr-2" /> {copyStatus || 'Copy text summary'}
                </Button>
                <Button variant="outline" onClick={handleExportCSV} className="text-xs">
                  <FileSpreadsheet className="w-4 h-4 mr-2 text-green-700" /> Export Weekly CSV
                </Button>
              </div>

            </div>

          </div>

        </div>

      </div>

    </CalculatorPageShell>
  );
}

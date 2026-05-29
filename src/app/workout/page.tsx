'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Input, Label, Select, ValidationMessage, Button } from '@/components/ui/Forms';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/Card';
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
  calculateRepTime,
  calculateTotalWorkDistance,
  calculateTotalWorkTime,
  calculateTotalRestTime,
  calculateSessionDuration,
  calculateWorkRestRatio,
  calculateWorkoutDensity,
  calculateHardEasyDistribution,
  calculateWorkoutSessionRPELoad,
  calculateWorkoutBlockTotals,
  calculateRunWalkWorkout,
  calculateFartlekTotals,
  calculateHillRepeatTotals,
  calculateWorkoutComparison,
  WorkoutBlock
} from '@/lib/calculators_pack/workoutSystem';
import { workoutTemplates } from '@/data';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  Play, 
  Trash, 
  Plus, 
  Copy, 
  RotateCcw, 
  Info, 
  ArrowLeftRight, 
  HelpCircle, 
  Calendar, 
  Layout, 
  Activity, 
  Navigation,
  FileSpreadsheet
} from 'lucide-react';
import Link from 'next/link';

type AdvancedSubMode = 
  | 'interval_set' 
  | 'block_builder' 
  | 'run_walk' 
  | 'fartlek' 
  | 'hill_repeats' 
  | 'tempo_threshold' 
  | 'ladder_pyramid' 
  | 'comparison';

export default function WorkoutLabPage() {
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick');
  const [subMode, setSubMode] = useState<AdvancedSubMode>('interval_set');

  const [error, setError] = useState<string | null>(null);
  const [generalTrace, setGeneralTrace] = useState<string>('');

  // 1. Quick & Advanced Interval Set Inputs
  const [reps, setReps] = useState('6');
  const [distance, setDistance] = useState('0.8');
  const [pace, setPace] = useState('5:00'); // corresponding to 5:00/km (4:00 for 800m)
  const [rest, setRest] = useState('2:00');
  const [restPolicy, setRestPolicy] = useState<'between reps' | 'after every rep'>('between reps');
  const [warmup, setWarmup] = useState('10:00');
  const [cooldown, setCooldown] = useState('10:00');
  const [rpe, setRpe] = useState('7');

  const [intervalResult, setIntervalResult] = useState<any>(null);

  // 2. Advanced Block Builder State
  const [blocks, setBlocks] = useState<WorkoutBlock[]>([
    { id: '1', type: 'warmup', durationSeconds: 600, distanceMeters: 1500, repeats: 1 },
    { id: '2', type: 'threshold', durationSeconds: 480, distanceMeters: 1600, paceSecondsPerKm: 300, repeats: 2 },
    { id: '3', type: 'easy', durationSeconds: 300, distanceMeters: 800, repeats: 1 },
    { id: '4', type: 'strides', durationSeconds: 30, distanceMeters: 100, repeats: 4 },
    { id: '5', type: 'cooldown', durationSeconds: 600, distanceMeters: 1500, repeats: 1 },
  ]);
  const [newBlockType, setNewBlockType] = useState('easy');
  const [newBlockDuration, setNewBlockDuration] = useState('5:00');
  const [newBlockDistance, setNewBlockDistance] = useState('1.0');
  const [newBlockPace, setNewBlockPace] = useState('');
  const [newBlockRepeats, setNewBlockRepeats] = useState('1');

  // 3. Run-Walk State
  const [rwRunDur, setRwRunDur] = useState('4:00');
  const [rwWalkDur, setRwWalkDur] = useState('1:00');
  const [rwCycles, setRwCycles] = useState('6');
  const [rwRunPace, setRwRunPace] = useState('5:00');
  const [rwWalkPace, setRwWalkPace] = useState('8:00');
  const [rwResult, setRwResult] = useState<any>(null);

  // 4. Fartlek State
  const [fartlekHardDur, setFartlekHardDur] = useState('1:00');
  const [fartlekEasyDur, setFartlekEasyDur] = useState('1:00');
  const [fartlekCycles, setFartlekCycles] = useState('10');
  const [fartlekHardPace, setFartlekHardPace] = useState('4:30');
  const [fartlekEasyPace, setFartlekEasyPace] = useState('6:00');
  const [fartlekResult, setFartlekResult] = useState<any>(null);

  // 5. Hill Repeat State
  const [hillReps, setHillReps] = useState('8');
  const [hillClimb, setHillClimb] = useState('20');
  const [hillDur, setHillDur] = useState('1:30');
  const [hillRecovery, setHillRecovery] = useState('2:30');
  const [hillResult, setHillResult] = useState<any>(null);

  // 6. Tempo / Threshold State
  const [tempoDur, setTempoDur] = useState('20:00');
  const [tempoReps, setTempoReps] = useState('1');
  const [tempoRecovery, setTempoRecovery] = useState('2:00');
  const [tempoPace, setTempoPace] = useState('4:15');
  const [tempoResult, setTempoResult] = useState<any>(null);

  // 7. Ladder / Pyramid State
  const [ladderDistances, setLadderDistances] = useState('400, 800, 1200, 800, 400');
  const [ladderPace, setLadderPace] = useState('4:00');
  const [ladderRest, setLadderRest] = useState('2:00');
  const [ladderResult, setLadderResult] = useState<any>(null);

  // 8. Workout Comparison State
  const [compNameA, setCompNameA] = useState('Interval Drill');
  const [compDurA, setCompDurA] = useState('50:00');
  const [compDistA, setCompDistA] = useState('8.4');
  const [compHardA, setCompHardA] = useState('24:00');
  const [compDensityA, setCompDensityA] = useState('48');

  const [compNameB, setCompNameB] = useState('Tempo Sustained');
  const [compDurB, setCompDurB] = useState('45:00');
  const [compDistB, setCompDistB] = useState('9.0');
  const [compHardB, setCompHardB] = useState('20:00');
  const [compDensityB, setCompDensityB] = useState('44');

  const [compResult, setCompResult] = useState<any>(null);

  // On page mount, look for link-through params to optionally copy a template
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const templateId = params.get('template');
      if (templateId) {
        setTimeout(() => {
          setMode('advanced');
          setSubMode('interval_set');
          const found = workoutTemplates.find(t => t.id === templateId);
          if (found) {
            if ('mainSet' in found && found.mainSet) {
              const ms = found.mainSet as any;
              if (ms.reps) setReps(String(ms.reps));
              if (ms.distanceMeters) setDistance(String(ms.distanceMeters / 1000));
              if (ms.durationMinutes) {
                setTempoDur(formatSecondsToTimeString(ms.durationMinutes * 60));
                setSubMode('tempo_threshold');
              }
              if (ms.rest?.durationSeconds) setRest(formatSecondsToTimeString(ms.rest.durationSeconds));
            }
          }
        }, 0);
      }
    }
  }, []);

  // Universal Resets
  const handleReset = () => {
    setError(null);
    setGeneralTrace('');
    
    // Quick / Interval defaults
    setReps('6');
    setDistance('0.8');
    setPace('5:00');
    setRest('2:00');
    setRestPolicy('between reps');
    setWarmup('10:00');
    setCooldown('10:00');
    setRpe('7');
    setIntervalResult(null);

    // Advanced block builder defaults
    setBlocks([
      { id: '1', type: 'warmup', durationSeconds: 600, distanceMeters: 1500, repeats: 1 },
      { id: '2', type: 'threshold', durationSeconds: 480, distanceMeters: 1600, paceSecondsPerKm: 300, repeats: 2 },
      { id: '3', type: 'easy', durationSeconds: 300, distanceMeters: 800, repeats: 1 },
      { id: '4', type: 'strides', durationSeconds: 30, distanceMeters: 100, repeats: 4 },
      { id: '5', type: 'cooldown', durationSeconds: 600, distanceMeters: 1500, repeats: 1 },
    ]);

    // Run-Walk reset
    setRwRunDur('4:00');
    setRwWalkDur('1:00');
    setRwCycles('6');
    setRwRunPace('5:00');
    setRwWalkPace('8:00');
    setRwResult(null);

    // Fartlek Reset
    setFartlekHardDur('1:00');
    setFartlekEasyDur('1:00');
    setFartlekCycles('10');
    setFartlekHardPace('4:30');
    setFartlekEasyPace('6:00');
    setFartlekResult(null);

    // Hill Repeats Reset
    setHillReps('8');
    setHillClimb('20');
    setHillDur('1:30');
    setHillRecovery('2:30');
    setHillResult(null);

    // Tempo / Threshold Reset
    setTempoDur('20:00');
    setTempoReps('1');
    setTempoRecovery('2:00');
    setTempoPace('4:15');
    setTempoResult(null);

    // Ladder/Pyramid Reset
    setLadderDistances('400, 800, 1200, 800, 400');
    setLadderPace('4:00');
    setLadderRest('2:00');
    setLadderResult(null);

    // Comparison Reset
    setCompNameA('Interval Drill');
    setCompDurA('50:00');
    setCompDistA('8.4');
    setCompHardA('24:00');
    setCompDensityA('48');
    setCompNameB('Tempo Sustained');
    setCompDurB('45:00');
    setCompDistB('9.0');
    setCompHardB('20:00');
    setCompDensityB('44');
    setCompResult(null);
  };

  // 1. Calculate Standard Interval Set (Quick Mode & Advanced Submode 1)
  const calculateInterval = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const rCount = safeNumber(reps);
    const dVal = safeNumber(distance); // in km
    const pSec = parseDurationToSeconds(pace);
    const rSec = parseDurationToSeconds(rest);
    const wuSec = parseDurationToSeconds(warmup) || 0;
    const cdSec = parseDurationToSeconds(cooldown) || 0;
    const rpeVal = safeNumber(rpe) || 0;

    if (!rCount || rCount <= 0) return setError('Please verify the reps number.');
    if (!dVal || dVal <= 0) return setError('Please verify the rep distance (km).');
    if (!pSec || pSec <= 0) return setError('Please verify the pace time format.');
    if (rSec === null || rSec < 0) return setError('Please verify the rest time format.');

    // Calculate core totals using deterministic helper routines
    const repDistanceMeters = dVal * 1000;
    const repTimeSec = calculateRepTime(repDistanceMeters, pSec);
    const workDistKm = calculateTotalWorkDistance(rCount, repDistanceMeters) / 1000;
    const workTimeSec = calculateTotalWorkTime(rCount, repTimeSec);
    const restTimeSec = calculateTotalRestTime(rCount, rSec, restPolicy);
    const totalDurationSec = calculateSessionDuration(wuSec, workTimeSec, restTimeSec, cdSec);

    const ratio = calculateWorkRestRatio(workTimeSec, restTimeSec);
    const density = calculateWorkoutDensity(workTimeSec, totalDurationSec);
    const distribution = calculateHardEasyDistribution(workTimeSec, wuSec + cdSec, restTimeSec);
    const sRpeLoadVal = calculateWorkoutSessionRPELoad(totalDurationSec / 60, rpeVal);

    // Build trace
    const trace = 
      `Step 1: Parse Inputs -> Reps: ${rCount}, Rep Dist: ${repDistanceMeters}m (${~~dVal} km), Target Pace: ${pace} (${~~pSec} s/km)\n` +
      `Step 2: Calculate individual Rep Duration -> (Dist / 1000) × Pace = (${repDistanceMeters}/1000) × ${pSec} = ${repTimeSec}s (${formatSecondsToTimeString(repTimeSec)})\n` +
      `Step 3: Calculate Cumulative High-Intensity Work Time -> Reps × Rep Duration = ${rCount} × ${repTimeSec} = ${workTimeSec}s (${formatSecondsToTimeString(workTimeSec)})\n` +
      `Step 4: Calculate Active Rest Duration (${restPolicy}) -> ${restPolicy === 'between reps' ? `${rSec} × (${rCount} - 1)` : `${rSec} × ${rCount}`} = ${restTimeSec}s\n` +
      `Step 5: Sum Core Session Time -> Warmup + Work + Rest + Cooldown = ${wuSec} + ${workTimeSec} + ${restTimeSec} + ${cdSec} = ${totalDurationSec}s (${formatSecondsToTimeString(totalDurationSec)})\n` +
      `Step 6: Assess Session Load Metric -> Duration (${(totalDurationSec / 60).toFixed(1)} mins) × RPE (${rpeVal}) = ${sRpeLoadVal.toFixed(0)} points.`;

    setGeneralTrace(trace);
    setIntervalResult({
      repTimeSec,
      workDistKm,
      workTimeSec,
      restTimeSec,
      totalDurationSec,
      ratio,
      density,
      distribution,
      sRpeLoadVal,
      inputUsed: {
        'Reps': rCount,
        'Rep Distance': dVal + ' km',
        'Target Pace': pace + ' /km',
        'Rest Duration': rest,
        'Warmup Phase': warmup,
        'Cooldown Phase': cooldown,
        'Subjective RPE': rpeVal
      }
    });
  };

  // 2. Block Builder Block Aggregator
  const blockResult = useMemo(() => {
    if (blocks.length === 0) return null;
    return calculateWorkoutBlockTotals(blocks);
  }, [blocks]);

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const durSec = parseDurationToSeconds(newBlockDuration);
    const distKm = parseFloat(newBlockDistance);
    const parsedPace = newBlockPace ? parseDurationToSeconds(newBlockPace) : undefined;
    const paceSec = (parsedPace !== null && parsedPace !== undefined) ? parsedPace : undefined;
    const repsVal = parseInt(newBlockRepeats, 10);

    if (!durSec || durSec <= 0) return setError('Invalid block duration time.');
    if (isNaN(repsVal) || repsVal <= 0) return setError('Repeats must be at least 1.');

    const newBlock: WorkoutBlock = {
      id: String(Date.now()),
      type: newBlockType,
      durationSeconds: durSec,
      distanceMeters: !isNaN(distKm) ? distKm * 1000 : undefined,
      paceSecondsPerKm: paceSec,
      repeats: repsVal
    };

    setBlocks([...blocks, newBlock]);
    setNewBlockDuration('5:00');
    setNewBlockDistance('1.0');
    setNewBlockPace('');
    setNewBlockRepeats('1');
  };

  const handleRemoveBlock = (id: string) => {
    setBlocks(blocks.filter(b => b.id !== id));
  };

  // 3. Run-Walk Calculations
  const calculateRw = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const runSec = parseDurationToSeconds(rwRunDur);
    const walkSec = parseDurationToSeconds(rwWalkDur);
    const cyc = parseInt(rwCycles, 10);
    const runP = parseDurationToSeconds(rwRunPace);
    const walkP = parseDurationToSeconds(rwWalkPace);

    if (!runSec || runSec <= 0) return setError('Invalid run interval duration.');
    if (walkSec === null || walkSec < 0) return setError('Invalid walk interval duration.');
    if (isNaN(cyc) || cyc <= 0) return setError('Please enter a valid number of cycles.');
    if (!runP || runP <= 0) return setError('Please specify run pace per kilometer.');
    if (!walkP || walkP <= 0) return setError('Please specify walk pace per kilometer.');

    const res = calculateRunWalkWorkout(runSec, walkSec, cyc, runP, walkP);

    const trace = 
      `Step 1: Calculate Total Run Time -> ${runSec}s × ${cyc} cycles = ${res.totalRunTime}s\n` +
      `Step 2: Calculate Total Walk Time -> ${walkSec}s × ${cyc} cycles = ${res.totalWalkTime}s\n` +
      `Step 3: Estimate Running Distance -> Total Run Time / Run Pace = ${res.totalRunTime} / ${runP} = ${((res.totalRunTime / runP)).toFixed(3)} km\n` +
      `Step 4: Estimate Walking Distance -> Total Walk Time / Walk Pace = ${res.totalWalkTime} / ${walkP} = ${((res.totalWalkTime / walkP)).toFixed(3)} km\n` +
      `Step 5: Sum Total Distance -> Run Dist + Walk Dist = ${res.estimatedDistanceKm.toFixed(2)} km\n` +
      `Step 6: Blended Avg Pace -> Total Time / Summed Distance = ${res.totalDuration}s / ${res.estimatedDistanceKm.toFixed(3)} km = ${res.blendedPaceSecondsPerKm.toFixed(0)} s/km (${formatSecondsToTimeString(res.blendedPaceSecondsPerKm)}/km)`;

    setGeneralTrace(trace);
    setRwResult(res);
  };

  // 4. Fartlek Calculations
  const calculateFartlek = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const hardSec = parseDurationToSeconds(fartlekHardDur);
    const easySec = parseDurationToSeconds(fartlekEasyDur);
    const cyc = parseInt(fartlekCycles, 10);
    const parsedHPace = fartlekHardPace ? parseDurationToSeconds(fartlekHardPace) : undefined;
    const parsedEPace = fartlekEasyPace ? parseDurationToSeconds(fartlekEasyPace) : undefined;
    const hPaceSec = (parsedHPace !== null && parsedHPace !== undefined) ? parsedHPace : undefined;
    const ePaceSec = (parsedEPace !== null && parsedEPace !== undefined) ? parsedEPace : undefined;

    if (!hardSec || hardSec <= 0) return setError('Invalid hard interval duration.');
    if (!easySec || easySec <= 0) return setError('Invalid easy interval duration.');
    if (isNaN(cyc) || cyc <= 0) return setError('Cycles must be at least 1.');

    const res = calculateFartlekTotals(hardSec, easySec, cyc, hPaceSec, ePaceSec);

    const trace = 
      `Step 1: Fartlek Hard Time -> ${hardSec}s × ${cyc} = ${res.hardTime}s\n` +
      `Step 2: Fartlek Easy Time -> ${easySec}s × ${cyc} = ${res.easyTime}s\n` +
      `Step 3: Total Combined Duration -> Hard Time + Easy Time = ${res.totalTime}s\n` +
      `Step 4: Compute Hard Percentage Yield -> Hard Time / Total Duration × 100 = ${res.hardPct.toFixed(1)}%\n` +
      (res.estimatedDistanceKm > 0 ? `Step 5: Estimated Volume from Paces -> ${res.estimatedDistanceKm.toFixed(2)} km` : `Step 5: Paces not specified. Cannot output mathematical distance projection.`);

    setGeneralTrace(trace);
    setFartlekResult(res);
  };

  // 5. Hill Reps Calculations
  const calculateHill = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const repsVal = parseInt(hillReps, 10);
    const climb = parseFloat(hillClimb);
    const rDur = parseDurationToSeconds(hillDur);
    const recDur = parseDurationToSeconds(hillRecovery);

    if (isNaN(repsVal) || repsVal <= 0) return setError('Reps count must be at least 1.');
    if (isNaN(climb) || climb < 0) return setError('Verify the vertical climbed metres.');
    if (!rDur || rDur <= 0) return setError('Verify uphill repetition duration.');
    if (!recDur || recDur <= 0) return setError('Verify recovery duration.');

    const res = calculateHillRepeatTotals(repsVal, climb, rDur, recDur);

    const trace = 
      `Step 1: Total Vertical Climb -> Reps × Height per Rep = ${repsVal} × ${climb}m = ${res.totalClimb}m\n` +
      `Step 2: Total Active Climb Time -> Reps × Rep Duration = ${repsVal} × ${rDur}s = ${res.workTime}s\n` +
      `Step 3: Cumulative Descents / Rest Phase -> Reps × Recovery Duration = ${repsVal} × ${recDur}s = ${res.recoveryTime}s\n` +
      `Step 4: Workout Duration -> Active Climb Time + Recovery Duration = ${res.totalTime}s (${formatSecondsToTimeString(res.totalTime)})`;

    setGeneralTrace(trace);
    setHillResult(res);
  };

  // 6. Tempo / Threshold Calculations
  const calculateTempo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const bDur = parseDurationToSeconds(tempoDur);
    const repsVal = parseInt(tempoReps, 10);
    const recDur = parseDurationToSeconds(tempoRecovery);
    const tP = tempoPace ? parseDurationToSeconds(tempoPace) : undefined;

    if (!bDur || bDur <= 0) return setError('Verify tempo segment duration.');
    if (isNaN(repsVal) || repsVal <= 0) return setError('Verify threshold repeats count.');
    if (repsVal > 1 && (!recDur || recDur < 0)) return setError('Verify block rest interval duration.');

    const workSeconds = bDur * repsVal;
    const restSeconds = repsVal > 1 ? (recDur || 0) * (repsVal - 1) : 0;
    const sessionSeconds = workSeconds + restSeconds;

    let distKm = 0;
    if (tP && tP > 0) {
      distKm = workSeconds / tP;
    }

    const trace = 
      `Step 1: Calculate Total Threshold Time -> Duration × Repeats = ${bDur}s × ${repsVal} = ${workSeconds}s\n` +
      `Step 2: Calculate Rest Segment time -> Count × Duration = ${repsVal - 1} × ${recDur}s = ${restSeconds}s\n` +
      `Step 3: Combined Frame Session Time -> Threshold + Rest = ${sessionSeconds}s\n` +
      (distKm > 0 ? `Step 4: Projected threshold distance -> Work seconds / Pace seconds/km = ${workSeconds} / ${tP} = ${distKm.toFixed(2)} km` : `Step 4: Pace not supplied. Cannot yield exact volume projection.`);

    setGeneralTrace(trace);
    setTempoResult({
      workSeconds,
      restSeconds,
      sessionSeconds,
      distKm,
      inputUsed: {
        'Segment Duration': tempoDur,
        'Repeats': repsVal,
        'Active Rest': tempoRecovery,
        'Lactate Threshold Pace': tempoPace || 'None'
      }
    });
  };

  // 7. Ladder / Pyramid Calculations
  const calculateLadder = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const distList = ladderDistances.split(',').map(s => parseFloat(s.trim()));
    const pSec = parseDurationToSeconds(ladderPace);
    const restSec = parseDurationToSeconds(ladderRest);

    if (distList.some(isNaN) || distList.length === 0) return setError('Please verify comma-separated distances list.');
    if (!pSec || pSec <= 0) return setError('Please verify ladder target pace format.');
    if (restSec === null || restSec < 0) return setError('Please verify standard rest break duration.');

    const totalWorkDistanceMeters = distList.reduce((a, b) => a + b, 0);
    const totalWorkTimeSeconds = (totalWorkDistanceMeters / 1000) * pSec;
    const totalRestTimeSeconds = (distList.length - 1) * restSec;
    const totalSessionSeconds = totalWorkTimeSeconds + totalRestTimeSeconds;

    const repsBreakdown = distList.map((dist, idx) => {
      const repTime = (dist / 1000) * pSec;
      return {
        repNum: idx + 1,
        distanceMeters: dist,
        durationSeconds: repTime,
        restSeconds: idx === distList.length - 1 ? 0 : restSec
      };
    });

    const trace = 
      `Step 1: Calculate Cumulative Ladder Distance -> Sum(${ladderDistances}) = ${totalWorkDistanceMeters}m (${(totalWorkDistanceMeters / 1000).toFixed(2)} km)\n` +
      `Step 2: Calculate Rep Times sequentially (Distance / 1000) × Pace:\n` +
      repsBreakdown.map(r => `  Rep ${r.repNum}: ${r.distanceMeters}m -> ${formatSecondsToTimeString(r.durationSeconds)}`).join('\n') + `\n` +
      `Step 3: Accumulate Core Active Work Time -> ${totalWorkTimeSeconds}s\n` +
      `Step 4: Accumulate Static Recoveries -> (${distList.length} - 1) × ${restSec}s = ${totalRestTimeSeconds}s\n` +
      `Step 5: Core Session Duration -> Work + Rest = ${totalSessionSeconds}s (${formatSecondsToTimeString(totalSessionSeconds)})`;

    setGeneralTrace(trace);
    setLadderResult({
      totalWorkDistanceMeters,
      totalWorkTimeSeconds,
      totalRestTimeSeconds,
      totalSessionSeconds,
      repsBreakdown,
      inputUsed: {
        'Ladder Distances (m)': ladderDistances,
        'Goal Pace': ladderPace + ' /km',
        'Break Rep Rest': ladderRest
      }
    });
  };

  // 8. Analyze Structure Comparer
  const calculateComparison = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const durA = parseDurationToSeconds(compDurA);
    const durB = parseDurationToSeconds(compDurB);
    const distA = parseFloat(compDistA);
    const distB = parseFloat(compDistB);
    const hardA = parseDurationToSeconds(compHardA);
    const hardB = parseDurationToSeconds(compHardB);
    const denA = parseFloat(compDensityA);
    const denB = parseFloat(compDensityB);

    if (!durA || !durB) return setError('Verify total duration formats for comparison.');
    if (isNaN(distA) || isNaN(distB)) return setError('Verify distances (km) for comparison.');
    if (!hardA || !hardB) return setError('Verify hard effort time formats for comparison.');
    if (isNaN(denA) || isNaN(denB)) return setError('Verify session density percentages.');

    const res = calculateWorkoutComparison(
      { duration: durA, distance: distA, hardTime: hardA, density: denA },
      { duration: durB, distance: distB, hardTime: hardB, density: denB }
    );

    const trace = 
      `Step 1: Compare Duration Delta -> ${compDurA} (${~~durA}s) vs ${compDurB} (${~~durB}s) = ${res.durationDelta}s (${formatSecondsToTimeString(Math.abs(res.durationDelta))} ${res.durationDelta < 0 ? 'longer in B' : 'longer in A'})\n` +
      `Step 2: Compare Volume Delta -> ${compDistA} km vs ${compDistB} km = ${res.distanceDelta.toFixed(2)} km\n` +
      `Step 3: Compare Intensity Core Delta -> ${compHardA} (${~~hardA}s) vs ${compHardB} (${~~hardB}s) = ${res.hardTimeDelta}s\n` +
      `Step 4: Density Difference -> ${denA}% vs ${denB}% = ${res.densityDelta.toFixed(1)}%`;

    setGeneralTrace(trace);
    setCompResult({
      durationDelta: res.durationDelta,
      distanceDelta: res.distanceDelta,
      hardTimeDelta: res.hardTimeDelta,
      densityDelta: res.densityDelta,
      workoutA: { name: compNameA, dur: durA, dist: distA, hard: hardA, density: denA },
      workoutB: { name: compNameB, dur: durB, dist: distB, hard: hardB, density: denB }
    });
  };

  // Compile Recharts Bar Data for Block Builder Only
  const blockChartData = useMemo(() => {
    return blocks.map((b, idx) => ({
      name: `#${idx + 1} ${b.type.toUpperCase()}`,
      duration: Math.round((b.durationSeconds * b.repeats) / 60),
      repeats: b.repeats,
      type: b.type
    }));
  }, [blocks]);

  // Color mapper for Recharts Bars
  const getBlockColor = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('warmup') || t.includes('cooldown') || t.includes('easy')) return '#3182ce'; // Blue
    if (t.includes('threshold') || t.includes('tempo') || t.includes('steady')) return '#d69e2e'; // Amber
    if (t.includes('5k') || t.includes('10k') || t.includes('mile') || t.includes('best') || t.includes('hill') || t.includes('strides')) return '#e53e3e'; // Red
    return '#718096'; // Gray rest
  };

  const getExportData = () => {
    let title = "Workout Plan Summary";
    let data: any = {};
    if (mode === 'quick' && intervalResult) {
      title = "Standard Interval Session";
      data = intervalResult;
    } else if (mode === 'advanced') {
      if (subMode === 'interval_set' && intervalResult) {
        title = "Paced Repetition Set";
        data = intervalResult;
      } else if (subMode === 'block_builder' && blockResult) {
        title = "Structured Blocks Plan";
        data = blockResult;
      } else if (subMode === 'run_walk' && rwResult) {
        title = "Run-Walk Plan";
        data = rwResult;
      } else if (subMode === 'fartlek' && fartlekResult) {
        title = "Fartlek Structure";
        data = fartlekResult;
      } else if (subMode === 'hill_repeats' && hillResult) {
        title = "Hill Repeats Structure";
        data = hillResult;
      } else if (subMode === 'tempo_threshold' && tempoResult) {
        title = "Threshold Frame";
        data = tempoResult;
      } else if (subMode === 'ladder_pyramid' && ladderResult) {
        title = "Paced Ladder Pyramid Drill";
        data = ladderResult;
      } else if (subMode === 'comparison' && compResult) {
        title = "Asymmetric Workout Comparison";
        data = compResult;
      }
    }
    return { title, data };
  };

  const { title: currentExportTitle, data: currentExportData } = getExportData();

  return (
    <CalculatorPageShell 
      title="Workout Lab" 
      subtitle="Assemble, calculate, and compare structured workouts using manual variables and exact deterministic formulas."
    >
      {/* Dynamic Link bar */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 bg-muted border-2 border-border-heavy p-3 rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
        <Link href="/workout-library" className="text-[10px] font-black uppercase tracking-wider text-center py-2 bg-white border border-border rounded-lg hover:bg-neutral-50 transition-colors">
          📚 BROWSE STATIC TEMPLATES
        </Link>
        <Link href="/load" className="text-[10px] font-black uppercase tracking-wider text-center py-2 bg-white border border-border rounded-lg hover:bg-neutral-50 transition-colors">
          📊 SESSION LOAD CALCS
        </Link>
        <Link href="/pace" className="text-[10px] font-black uppercase tracking-wider text-center py-2 bg-white border border-border rounded-lg hover:bg-neutral-50 transition-colors">
          🏃 TRAINING PACE LAB
        </Link>
        <Link href="/calendar" className="text-[10px] font-black uppercase tracking-wider text-center py-2 bg-white border border-border rounded-lg hover:bg-neutral-50 transition-colors">
          📅 PREVIEW WEEK CALENDAR
        </Link>
      </div>

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* INPUTS COLUMN */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Main Select Mode Panel */}
          <div className="p-6 border-2 border-border-heavy bg-card rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
            <h3 className="font-display font-black text-sm uppercase tracking-widest mb-4">SYSTEM CALIBRATOR</h3>
            <div className="flex bg-neutral-100 p-1 border border-zinc-200 rounded-lg mb-4">
              <button
                onClick={() => { setMode('quick'); setError(null); }}
                className={`flex-1 text-center py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${mode === 'quick' ? 'bg-primary text-primary-foreground font-extrabold border border-border-heavy shadow-[1px_1px_0px_rgba(23,23,23,1)]' : 'text-muted-foreground'}`}
              >
                Quick Mode
              </button>
              <button
                onClick={() => { setMode('advanced'); setError(null); }}
                className={`flex-1 text-center py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-colors ${mode === 'advanced' ? 'bg-primary text-primary-foreground font-extrabold border border-border-heavy shadow-[1px_1px_0px_rgba(23,23,23,1)]' : 'text-muted-foreground'}`}
              >
                Advanced Mode
              </button>
            </div>

            {mode === 'advanced' && (
              <div className="space-y-2">
                <Label>Choose Workout Type Submodule</Label>
                <Select value={subMode} onChange={(e) => { setSubMode(e.target.value as AdvancedSubMode); setError(null); }}>
                  <option value="interval_set">Interval Set (Custom Options)</option>
                  <option value="block_builder">Block-Based Builder (Live Chart)</option>
                  <option value="run_walk">Run-Walk Workout</option>
                  <option value="fartlek">Fartlek Speed Play</option>
                  <option value="hill_repeats">Hill Repeat Climbs</option>
                  <option value="tempo_threshold">Tempo / Threshold Blocks</option>
                  <option value="ladder_pyramid">Ladder / Pyramid Repeats</option>
                  <option value="comparison">Workout Comparer</option>
                </Select>
              </div>
            )}
          </div>

          {/* Quick Mode / Interval Set Forms */}
          {((mode === 'quick') || (mode === 'advanced' && subMode === 'interval_set')) && (
            <div className="p-6 border-2 border-border-heavy bg-white rounded-xl shadow-[4px_4px_0px_rgba(23,23,23,1)]">
              <h3 className="font-display font-black text-lg mb-1 uppercase text-zinc-800">INTERVAL SET PARAMETERS</h3>
              <p className="text-xs text-muted-foreground mb-4 font-semibold uppercase tracking-wider">Calculate target paces, core ratios, and cumulative load.</p>
              
              <form onSubmit={calculateInterval} className="space-y-4" noValidate>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="reps">Number of Reps</Label>
                    <Input id="reps" type="number" min="1" value={reps} onChange={(e) => setReps(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="distance">Dist. per Rep (km)</Label>
                    <Input id="distance" type="number" step="0.01" min="0.01" value={distance} onChange={(e) => setDistance(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="pace">Pace per Rep (MM:SS/km)</Label>
                    <Input id="pace" type="text" placeholder="5:00" value={pace} onChange={(e) => setPace(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="rest">Rest Break (MM:SS)</Label>
                    <Input id="rest" type="text" placeholder="2:00" value={rest} onChange={(e) => setRest(e.target.value)} required />
                  </div>
                </div>

                {mode === 'advanced' && (
                  <div className="pt-4 border-t border-zinc-200 mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <Label>Rest Scheduling Policy</Label>
                        <Select value={restPolicy} onChange={(e: any) => setRestPolicy(e.target.value)}>
                          <option value="between reps">Between Reps Only</option>
                          <option value="after every rep">After Every Single Rep</option>
                        </Select>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="rpe">Subjective Session RPE (1-10)</Label>
                        <Input id="rpe" type="number" min="1" max="10" placeholder="7" value={rpe} onChange={(e) => setRpe(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="wu">Warmup Duration</Label>
                        <Input id="wu" type="text" placeholder="10:00" value={warmup} onChange={(e) => setWarmup(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="cd">Cooldown Duration</Label>
                        <Input id="cd" type="text" placeholder="10:00" value={cooldown} onChange={(e) => setCooldown(e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}

                <ValidationMessage message={error} />
                <div className="flex gap-2.5 pt-2">
                  <Button type="submit" className="flex-1">Calculate Interval Set</Button>
                  <Button type="button" variant="outline" onClick={handleReset} className="px-4">
                    <RotateCcw className="w-5 h-5 text-foreground" />
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Block Builder Form */}
          {mode === 'advanced' && subMode === 'block_builder' && (
            <div className="p-6 border-2 border-border-heavy bg-white rounded-xl shadow-[4px_4px_0px_rgba(23,23,23,1)] space-y-6">
              <div>
                <h3 className="font-display font-black text-lg mb-1 uppercase text-zinc-800">BLOCK BUILDER</h3>
                <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Interactively pile workout stages below. The timeline adjusts in real-time.</p>
              </div>

              {/* Live Editable Lists */}
              <div className="space-y-2 max-h-[220px] overflow-y-auto border-2 border-border-heavy p-2 bg-neutral-50 rounded-lg">
                {blocks.map((b, i) => (
                  <div key={b.id} className="flex justify-between items-center bg-white border border-border p-2 rounded text-xs font-mono font-bold shadow-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full" style={{ backgroundColor: getBlockColor(b.type) }} />
                      <span className="uppercase tracking-wide">#{i+1} {b.type}</span>
                    </span>
                    <span className="text-zinc-500">
                      {formatSecondsToTimeString(b.durationSeconds)} {b.distanceMeters ? `| ${(b.distanceMeters/1000).toFixed(2)} km` : ''} {b.repeats > 1 ? `(×${b.repeats})` : ''}
                    </span>
                    <button onClick={() => handleRemoveBlock(b.id)} className="text-destructive hover:scale-105 transition-transform" title="Remove block">
                      <Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {blocks.length === 0 && (
                  <p className="text-center text-xs p-4 italic text-zinc-400 font-bold">No intervals. Pile dynamic blocks below.</p>
                )}
              </div>

              {/* Add New Block Item Form */}
              <form onSubmit={handleAddBlock} className="p-4 bg-muted border-2 border-border-heavy rounded-lg space-y-4">
                <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block mb-1">Add Segment Block</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Segment Type</Label>
                    <Select value={newBlockType} onChange={(e) => setNewBlockType(e.target.value)}>
                      <option value="warmup">Warmup</option>
                      <option value="easy">Easy Aerobic</option>
                      <option value="steady">Steady Pace</option>
                      <option value="tempo">Tempo Pace</option>
                      <option value="threshold">Lactate Threshold</option>
                      <option value="10k">10K Target Pace</option>
                      <option value="5k">5K Target Pace</option>
                      <option value="mile">Mile/Speed Pace</option>
                      <option value="hill">Uphill Repeat</option>
                      <option value="strides">Post-Run Strides</option>
                      <option value="recovery">Recovery Jog</option>
                      <option value="walk">Walk Rest</option>
                      <option value="stand">Stand Rest</option>
                      <option value="cooldown">Cooldown</option>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <Label>Section Duration (MM:SS)</Label>
                    <Input type="text" placeholder="5:00" value={newBlockDuration} onChange={(e) => setNewBlockDuration(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Distance (km, optional)</Label>
                    <Input type="number" step="0.01" placeholder="1.0" value={newBlockDistance} onChange={(e) => setNewBlockDistance(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Rep Target Pace (optional)</Label>
                    <Input type="text" placeholder="MM:SS" value={newBlockPace} onChange={(e) => setNewBlockPace(e.target.value)} />
                  </div>
                </div>

                <div className="flex gap-2.5 items-end">
                  <div className="flex-1 space-y-1">
                    <Label>Repeats Count (Optional Pattern Group)</Label>
                    <Input type="number" min="1" value={newBlockRepeats} onChange={(e) => setNewBlockRepeats(e.target.value)} required />
                  </div>
                  <Button type="submit" variant="secondary" className="h-12 flex gap-1 items-center px-4 shrink-0">
                    <Plus className="w-4 h-4" /> Add Segment
                  </Button>
                </div>
              </form>

              <ValidationMessage message={error} />
              <div className="flex gap-2.5">
                <Button type="button" variant="outline" onClick={handleReset} className="w-full">
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset Entire Layout
                </Button>
              </div>
            </div>
          )}

          {/* Run-Walk Form */}
          {mode === 'advanced' && subMode === 'run_walk' && (
            <div className="p-6 border-2 border-border-heavy bg-white rounded-xl shadow-[4px_4px_0px_rgba(23,23,23,1)]">
              <h3 className="font-display font-black text-lg mb-1 uppercase text-zinc-800">RUN-WALK MATH</h3>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-4">Calculate combined duration, distance, and blended pace.</p>
              
              <form onSubmit={calculateRw} className="space-y-4" noValidate>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Run Cycle Duration</Label>
                    <Input type="text" placeholder="4:00" value={rwRunDur} onChange={(e) => setRwRunDur(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Walk Cycle Duration</Label>
                    <Input type="text" placeholder="1:00" value={rwWalkDur} onChange={(e) => setRwWalkDur(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Run Pace per km</Label>
                    <Input type="text" placeholder="5:00" value={rwRunPace} onChange={(e) => setRwRunPace(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Walk Pace per km</Label>
                    <Input type="text" placeholder="8:00" value={rwWalkPace} onChange={(e) => setRwWalkPace(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Repeated Cycles (Count)</Label>
                  <Input type="number" min="1" value={rwCycles} onChange={(e) => setRwCycles(e.target.value)} required />
                </div>

                <ValidationMessage message={error} />
                <div className="flex gap-2.5 pt-2">
                  <Button type="submit" className="flex-1">Calculate Run-Walk Session</Button>
                  <Button type="button" variant="outline" onClick={handleReset} className="px-4">
                    <RotateCcw className="w-5 h-5 text-foreground" />
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Fartlek Form */}
          {mode === 'advanced' && subMode === 'fartlek' && (
            <div className="p-6 border-2 border-border-heavy bg-white rounded-xl shadow-[4px_4px_0px_rgba(23,23,23,1)]">
              <h3 className="font-display font-black text-lg mb-1 uppercase text-zinc-800">FARTLEK PARAMETERS</h3>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-4">Calculate total active frames, high/easy ratios, and estimated distances.</p>
              
              <form onSubmit={calculateFartlek} className="space-y-4" noValidate>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Hard Segment Duration</Label>
                    <Input type="text" placeholder="1:00" value={fartlekHardDur} onChange={(e) => setFartlekHardDur(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Easy / Rest Duration</Label>
                    <Input type="text" placeholder="1:00" value={fartlekEasyDur} onChange={(e) => setFartlekEasyDur(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Hard Segment Target Pace (Optional)</Label>
                    <Input type="text" placeholder="4:30" value={fartlekHardPace} onChange={(e) => setFartlekHardPace(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Easy Segment Target Pace (Optional)</Label>
                    <Input type="text" placeholder="6:00" value={fartlekEasyPace} onChange={(e) => setFartlekEasyPace(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Total Cycles</Label>
                  <Input type="number" min="1" value={fartlekCycles} onChange={(e) => setFartlekCycles(e.target.value)} required />
                </div>

                <ValidationMessage message={error} />
                <div className="flex gap-2.5 pt-2">
                  <Button type="submit" className="flex-1">Calculate Fartlek Totals</Button>
                  <Button type="button" variant="outline" onClick={handleReset} className="px-4">
                    <RotateCcw className="w-5 h-5 text-zinc-850" />
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Hill Repeats Form */}
          {mode === 'advanced' && subMode === 'hill_repeats' && (
            <div className="p-6 border-2 border-border-heavy bg-white rounded-xl shadow-[4px_4px_0px_rgba(23,23,23,1)]">
              <h3 className="font-display font-black text-lg mb-1 uppercase text-zinc-800">HILL REPEAT SPECS</h3>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-4">Formulate total climb vertical bounds and active climb loads.</p>
              
              <form onSubmit={calculateHill} className="space-y-4" noValidate>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Number of Climb Reps</Label>
                    <Input type="number" min="1" value={hillReps} onChange={(e) => setHillReps(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Climb Altitude (m) per Rep</Label>
                    <Input type="number" min="0" value={hillClimb} onChange={(e) => setHillClimb(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Uphill Duration (MM:SS)</Label>
                    <Input type="text" placeholder="1:30" value={hillDur} onChange={(e) => setHillDur(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Recovery / Walk Down Break</Label>
                    <Input type="text" placeholder="2:30" value={hillRecovery} onChange={(e) => setHillRecovery(e.target.value)} required />
                  </div>
                </div>

                <ValidationMessage message={error} />
                <div className="flex gap-2.5 pt-2">
                  <Button type="submit" className="flex-1">Calculate Hill Repeats</Button>
                  <Button type="button" variant="outline" onClick={handleReset} className="px-4">
                    <RotateCcw className="w-5 h-5 text-foreground" />
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Tempo / Threshold Form */}
          {mode === 'advanced' && subMode === 'tempo_threshold' && (
            <div className="p-6 border-2 border-border-heavy bg-white rounded-xl shadow-[4px_4px_0px_rgba(23,23,23,1)]">
              <h3 className="font-display font-black text-lg mb-1 uppercase text-zinc-800">TEMPO RUN CALCS</h3>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-4">Calculate sustained tempo volume and threshold recovery sessions.</p>
              
              <form onSubmit={calculateTempo} className="space-y-4" noValidate>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Active Block Duration</Label>
                    <Input type="text" placeholder="20:00" value={tempoDur} onChange={(e) => setTempoDur(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Tempo Repeats Segment (Count)</Label>
                    <Input type="number" min="1" value={tempoReps} onChange={(e) => setTempoReps(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Recovery Phase Break (if reps &gt; 1)</Label>
                    <Input type="text" placeholder="2:00" value={tempoRecovery} onChange={(e) => setTempoRecovery(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Target Tempo Pace (Optional)</Label>
                    <Input type="text" placeholder="4:15" value={tempoPace} onChange={(e) => setTempoPace(e.target.value)} />
                  </div>
                </div>

                <ValidationMessage message={error} />
                <div className="flex gap-2.5 pt-2">
                  <Button type="submit" className="flex-1">Calculate Tempo Block</Button>
                  <Button type="button" variant="outline" onClick={handleReset} className="px-4">
                    <RotateCcw className="w-5 h-5 text-foreground" />
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Ladder / Pyramid Form */}
          {mode === 'advanced' && subMode === 'ladder_pyramid' && (
            <div className="p-6 border-2 border-border-heavy bg-white rounded-xl shadow-[4px_4px_0px_rgba(23,23,23,1)]">
              <h3 className="font-display font-black text-lg mb-1 uppercase text-zinc-800">LADDER / PYRAMID DRILL</h3>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-4">Trace paced workouts that expand and contract in sequential sizes.</p>
              
              <form onSubmit={calculateLadder} className="space-y-4" noValidate>
                <div className="space-y-1">
                  <Label>Reps Sizes List (comma-separated metres)</Label>
                  <Input type="text" placeholder="400, 800, 1200, 800, 400" value={ladderDistances} onChange={(e) => setLadderDistances(e.target.value)} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label>Workout Pace (MM:SS/km)</Label>
                    <Input type="text" placeholder="4:00" value={ladderPace} onChange={(e) => setLadderPace(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label>Inter-Rep Rest Breather (MM:SS)</Label>
                    <Input type="text" placeholder="2:00" value={ladderRest} onChange={(e) => setLadderRest(e.target.value)} required />
                  </div>
                </div>

                <ValidationMessage message={error} />
                <div className="flex gap-2.5 pt-2">
                  <Button type="submit" className="flex-1">Calculate Ladder Pyramid</Button>
                  <Button type="button" variant="outline" onClick={handleReset} className="px-4">
                    <RotateCcw className="w-5 h-5 text-foreground" />
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Comparer Form */}
          {mode === 'advanced' && subMode === 'comparison' && (
            <div className="p-6 border-2 border-border-heavy bg-white rounded-xl shadow-[4px_4px_0px_rgba(23,23,23,1)]">
              <h3 className="font-display font-black text-lg mb-1 uppercase text-zinc-800">COMPARE STRUCTURES</h3>
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-4">Contrast volume, density, and hard active limits between two structures.</p>
              
              <form onSubmit={calculateComparison} className="space-y-4" noValidate>
                <div className="grid grid-cols-2 gap-4 border-r border-border pr-2">
                  <div>
                    <h5 className="font-display font-black text-xs uppercase text-zinc-650 tracking-wider mb-2 text-primary border-b pb-1">Workout A Specs</h5>
                    <div className="space-y-2">
                      <div>
                        <Label>Label</Label>
                        <Input type="text" value={compNameA} onChange={(e) => setCompNameA(e.target.value)} />
                      </div>
                      <div>
                        <Label>Total Duration</Label>
                        <Input type="text" placeholder="50:00" value={compDurA} onChange={(e) => setCompDurA(e.target.value)} />
                      </div>
                      <div>
                        <Label>Workout Vol (km)</Label>
                        <Input type="number" step="0.1" value={compDistA} onChange={(e) => setCompDistA(e.target.value)} />
                      </div>
                      <div>
                        <Label>Hard minutes (MM:SS)</Label>
                        <Input type="text" value={compHardA} onChange={(e) => setCompHardA(e.target.value)} />
                      </div>
                      <div>
                        <Label>Workout Density (%)</Label>
                        <Input type="number" min="1" max="100" value={compDensityA} onChange={(e) => setCompDensityA(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h5 className="font-display font-black text-xs uppercase text-zinc-650 tracking-wider mb-2 text-primary border-b pb-1">Workout B Specs</h5>
                    <div className="space-y-2">
                      <div>
                        <Label>Label</Label>
                        <Input type="text" value={compNameB} onChange={(e) => setCompNameB(e.target.value)} />
                      </div>
                      <div>
                        <Label>Total Duration</Label>
                        <Input type="text" placeholder="45:00" value={compDurB} onChange={(e) => setCompDurB(e.target.value)} />
                      </div>
                      <div>
                        <Label>Workout Vol (km)</Label>
                        <Input type="number" step="0.1" value={compDistB} onChange={(e) => setCompDistB(e.target.value)} />
                      </div>
                      <div>
                        <Label>Hard minutes (MM:SS)</Label>
                        <Input type="text" value={compHardB} onChange={(e) => setCompHardB(e.target.value)} />
                      </div>
                      <div>
                        <Label>Workout Density (%)</Label>
                        <Input type="number" min="1" max="100" value={compDensityB} onChange={(e) => setCompDensityB(e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>

                <ValidationMessage message={error} />
                <div className="flex gap-2.5 pt-2">
                  <Button type="submit" className="w-full">Compare Two Workout Structures</Button>
                  <Button type="button" variant="outline" onClick={handleReset} className="px-4">
                    <RotateCcw className="w-5 h-5 text-foreground" />
                  </Button>
                </div>
              </form>
            </div>
          )}

        </div>

        {/* OUTPUTS COLUMN */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Output Presentation Box */}
          <div className="space-y-6">

            {/* Quick Mode & Interval Set Results Card */}
            {((mode === 'quick' && intervalResult) || (mode === 'advanced' && subMode === 'interval_set' && intervalResult)) && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <ResultCard
                  result={{
                    confidenceLabel: 'mathematical projection',
                    methodSelected: 'Deterministic Interval Set Core',
                    formulaUsed: 'Rep Duration = (Dist/1000) * Pace; VolumeSum = Reps * Dist',
                    limitations: 'Does not account for dyno mobility, environmental thermoregulation or gradual physical deceleration.',
                    inputUsed: intervalResult.inputUsed,
                    result: (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 border-2 border-border-heavy bg-white rounded-lg text-center shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                            <span className="block text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Estimated Rep Time</span>
                            <span className="font-mono text-xl font-black text-indigo-600">{formatSecondsToTimeString(intervalResult.repTimeSec)}</span>
                          </div>
                          <div className="p-3 border-2 border-border-heavy bg-white rounded-lg text-center shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                            <span className="block text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Total Paced Distance</span>
                            <span className="font-mono text-xl font-black text-foreground">{intervalResult.workDistKm.toFixed(2)} km</span>
                          </div>
                          <div className="p-3 border-2 border-border-heavy bg-white rounded-lg text-center shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                            <span className="block text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Total Active Work</span>
                            <span className="font-mono text-xl font-black text-foreground">{formatSecondsToTimeString(intervalResult.workTimeSec)}</span>
                          </div>
                          <div className="p-3 border-2 border-border-heavy bg-white rounded-lg text-center shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                            <span className="block text-[9px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Total Rest Duration</span>
                            <span className="font-mono text-xl font-black text-foreground">{formatSecondsToTimeString(intervalResult.restTimeSec)}</span>
                          </div>
                        </div>

                        <div className="p-4 border-2 border-border-heavy bg-neutral-900 text-white rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)] text-center relative overflow-hidden">
                          <span className="block text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-1">TOTAL PLAN SESSION TIME</span>
                          <span className="font-display font-black text-4xl leading-none">{formatSecondsToTimeString(intervalResult.totalDurationSec)}</span>
                          {intervalResult.sRpeLoadVal > 0 && (
                            <div className="mt-2 text-[10px] uppercase font-mono tracking-widest text-zinc-400">
                              Estimated Subjective Load Score: <strong className="text-white bg-indigo-600 px-1.5 py-0.5 rounded text-xs">{intervalResult.sRpeLoadVal.toFixed(0)} points</strong>
                            </div>
                          )}
                        </div>

                        {/* Density indicators */}
                        <div className="grid grid-cols-2 gap-3 text-xs font-mono font-bold">
                          <div className="p-3.5 bg-card border border-border rounded-lg shadow-sm">
                            <span className="block text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Work/Rest Ratio</span>
                            <span className="text-sm font-black text-foreground">1 : {intervalResult.ratio.toFixed(2)}</span>
                          </div>
                          <div className="p-3.5 bg-card border border-border rounded-lg shadow-sm">
                            <span className="block text-[9px] text-muted-foreground uppercase tracking-wider mb-1">Active Density %</span>
                            <span className="text-sm font-black text-foreground">{intervalResult.density.toFixed(1)}%</span>
                          </div>
                        </div>
                      </div>
                    )
                  }}
                />
              </motion.div>
            )}

            {/* Block Builder Advanced Outputs */}
            {mode === 'advanced' && subMode === 'block_builder' && blockResult && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
                <Card className="border-2 border-border-heavy shadow-[4px_4px_0px_rgba(23,23,23,1)] bg-white">
                  <div className="bg-accent text-accent-foreground p-3 border-b-2 border-border-heavy">
                    <span className="font-display font-black text-xs uppercase tracking-widest text-foreground">STRUCTURE SEGMENTS SUMMARY</span>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 bg-muted border border-border rounded-lg text-center">
                        <span className="block text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">Total Duration</span>
                        <span className="font-mono text-md font-extrabold text-foreground">{formatSecondsToTimeString(blockResult.totalDuration)}</span>
                      </div>
                      <div className="p-3 bg-muted border border-border rounded-lg text-center">
                        <span className="block text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">Est. Distance</span>
                        <span className="font-mono text-md font-extrabold text-foreground">{blockResult.totalDistanceKm.toFixed(2)} km</span>
                      </div>
                      <div className="p-3 bg-muted border border-border rounded-lg text-center">
                        <span className="block text-[9px] text-muted-foreground uppercase font-black tracking-widest mb-1">Hard minutes</span>
                        <span className="font-mono text-md font-extrabold text-red-650">{formatSecondsToTimeString(blockResult.hardSeconds)}</span>
                      </div>
                    </div>

                    {/* Timeline visualization bar */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Segment Duration Distribution (m)</div>
                      <div className="h-48 w-full border border-border bg-neutral-50 rounded p-2">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={blockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 9, fontWeight: 'bold' }} />
                            <YAxis unit="m" tick={{ fontSize: 9, fontWeight: 'bold' }} />
                            <Tooltip formatter={(value) => [`${value} min`, 'Duration']} />
                            <Bar dataKey="duration">
                              {blockChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getBlockColor(entry.type)} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <p className="text-[9px] uppercase tracking-wider text-muted-foreground italic text-center">
                      🔵 Blue = Warmup/Easy | 🟡 Amber = Steady/Tempo | 🔴 Red = Interval/Speed repeats
                    </p>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Run-Walk Outputs Card */}
            {mode === 'advanced' && subMode === 'run_walk' && rwResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <ResultCard
                  result={{
                    confidenceLabel: 'blended average pace',
                    methodSelected: 'Paced Run-Walk Blended Model',
                    formulaUsed: 'Total Duration = cycles × (runDur + walkDur); Distance = Dur / Pace',
                    limitations: 'Assumes instantaneous cycle transition speeds without physics acceleration frame curves.',
                    inputUsed: {
                      'Run Time/Rep': rwRunDur,
                      'Walk Time/Rep': rwWalkDur,
                      'Run Pace': rwRunPace,
                      'Walk Pace': rwWalkPace,
                      'Cycles': rwCycles
                    },
                    result: (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 border border-border bg-white rounded text-center">
                            <span className="block text-[9px] text-muted-foreground uppercase font-black tracking-widest">Total running time</span>
                            <span className="font-mono text-lg font-black text-foreground">{formatSecondsToTimeString(rwResult.totalRunTime)}</span>
                          </div>
                          <div className="p-3 border border-border bg-white rounded text-center">
                            <span className="block text-[9px] text-muted-foreground uppercase font-black tracking-widest">Total walking time</span>
                            <span className="font-mono text-lg font-black text-foreground">{formatSecondsToTimeString(rwResult.totalWalkTime)}</span>
                          </div>
                        </div>

                        <div className="p-4 border-2 border-border-heavy bg-card rounded-xl text-center shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                          <span className="block text-[9px] uppercase tracking-widest font-black text-muted-foreground mb-1">BLENDED METRIC PACE</span>
                          <span className="font-display font-black text-3xl text-zinc-800">{formatSecondsToTimeString(rwResult.blendedPaceSecondsPerKm)}/km</span>
                          <div className="text-xs text-muted-foreground font-semibold mt-1">Total Distance: <strong className="text-foreground">{rwResult.estimatedDistanceKm.toFixed(2)} km</strong></div>
                        </div>

                        <div className="p-4 bg-muted border border-border rounded text-center">
                          <span className="block text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1.5">Session cycle timeline</span>
                          <div className="text-4xl font-black font-display text-zinc-800">{formatSecondsToTimeString(rwResult.totalDuration)}</div>
                          <span className="text-[10px] uppercase font-mono tracking-widest block mt-0.5 text-zinc-500">Duration Summed</span>
                        </div>
                      </div>
                    )
                  }}
                />
              </motion.div>
            )}

            {/* Fartlek Outputs Card */}
            {mode === 'advanced' && subMode === 'fartlek' && fartlekResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <ResultCard
                  result={{
                    confidenceLabel: 'interval projection',
                    methodSelected: 'Fartlek active duration',
                    formulaUsed: 'Total Time = Cycles * (Hard + Easy); Hard % = Hard / Total * 100',
                    limitations: 'Estimates limits. Paces drift widely during unstructured outdoor speed play sessions.',
                    inputUsed: {
                      'Hard Reps Dur': fartlekHardDur,
                      'Easy Recovery Dur': fartlekEasyDur,
                      'Cycles Count': fartlekCycles,
                      'Hard Pace': fartlekHardPace || 'None',
                      'Easy Pace': fartlekEasyPace || 'None'
                    },
                    result: (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 border border-border bg-white rounded text-center">
                            <span className="block text-[9px] text-muted-foreground uppercase font-black tracking-widest">Total hard minutes</span>
                            <span className="font-mono text-lg font-black text-red-650">{formatSecondsToTimeString(fartlekResult.hardTime)}</span>
                          </div>
                          <div className="p-3 border border-border bg-white rounded text-center">
                            <span className="block text-[9px] text-muted-foreground uppercase font-black tracking-widest">Total easy / recovery</span>
                            <span className="font-mono text-lg font-black text-foreground">{formatSecondsToTimeString(fartlekResult.easyTime)}</span>
                          </div>
                        </div>

                        <div className="p-5 border-2 border-border-heavy bg-neutral-900 text-white rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)] text-center">
                          <span className="block text-[9px] uppercase tracking-widest text-indigo-400 font-bold mb-1">HARD LOAD RATIO</span>
                          <span className="font-display font-black text-4xl text-white">{fartlekResult.hardPct.toFixed(1)}%</span>
                          {fartlekResult.estimatedDistanceKm > 0 && (
                            <div className="mt-2 text-[10px] uppercase font-mono tracking-widest text-zinc-400">
                              Estimated Session Distance: <strong className="text-white">{fartlekResult.estimatedDistanceKm.toFixed(2)} km</strong>
                            </div>
                          )}
                        </div>

                        <div className="p-4 bg-muted border border-border rounded text-center">
                          <span className="block text-[9px] font-black uppercase text-muted-foreground tracking-widest">Session active sum</span>
                          <div className="text-3xl font-mono font-black text-foreground">{formatSecondsToTimeString(fartlekResult.totalTime)}</div>
                        </div>
                      </div>
                    )
                  }}
                />
              </motion.div>
            )}

            {/* Hill Repeats Outputs Card */}
            {mode === 'advanced' && subMode === 'hill_repeats' && hillResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <ResultCard
                  result={{
                    confidenceLabel: 'gravitational vertical gain metric',
                    methodSelected: 'Hill repeation climb rate',
                    formulaUsed: 'Total Climb = Climbing Reps * MeterGain; Work Time = Reps * RepDur',
                    limitations: 'Calculates physical work alone. Musculoskeletal loads are considerably greater upward.',
                    inputUsed: {
                      'Reps Count': hillReps,
                      'Metres Climbed / Rep': hillClimb + 'm',
                      'Climb Segment': hillDur,
                      'Recovery break': hillRecovery
                    },
                    result: (
                      <div className="space-y-4">
                        <div className="p-5 border-2 border-border-heavy bg-card rounded-xl text-center shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                          <span className="block text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">CUMULATIVE ALTITUDE GAINED</span>
                          <span className="font-display font-black text-4xl text-primary">{hillResult.totalClimb}m</span>
                          <span className="text-[9px] uppercase font-mono tracking-widest block mt-0.5 text-zinc-550">Vertical elevation gain sum</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 border border-border bg-white rounded text-center">
                            <span className="block text-[9px] text-muted-foreground uppercase font-black tracking-widest">Total Climbing Work</span>
                            <span className="font-mono text-lg font-black text-foreground">{formatSecondsToTimeString(hillResult.workTime)}</span>
                          </div>
                          <div className="p-3 border border-border bg-white rounded text-center">
                            <span className="block text-[9px] text-muted-foreground uppercase font-black tracking-widest">Total Descent Recovery</span>
                            <span className="font-mono text-lg font-black text-foreground">{formatSecondsToTimeString(hillResult.recoveryTime)}</span>
                          </div>
                        </div>

                        <div className="p-4 bg-zinc-900 text-white border-2 border-border-heavy rounded text-center shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                          <span className="block text-[9px] font-black uppercase tracking-widest text-zinc-400">SESSION COMBINED DURATION</span>
                          <div className="text-3xl font-display font-black text-white">{formatSecondsToTimeString(hillResult.totalTime)}</div>
                        </div>
                      </div>
                    )
                  }}
                />
              </motion.div>
            )}

            {/* Tempo Run Outputs Card */}
            {mode === 'advanced' && subMode === 'tempo_threshold' && tempoResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <ResultCard
                  result={{
                    confidenceLabel: 'steady-state pacing model',
                    methodSelected: 'Lactate threshold tempo segment',
                    formulaUsed: 'Work Time = BlockDuration * Reps; Total Session = WorkTime + RestTime',
                    limitations: 'Calculates structural steady-state duration. Real threshold metabolic levels fluctuate outdoors.',
                    inputUsed: tempoResult.inputUsed,
                    result: (
                      <div className="space-y-4">
                        <div className="p-5 border-2 border-border-heavy bg-card rounded-xl text-center shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                          <span className="block text-[10px] font-black uppercase text-muted-foreground mb-1 tracking-widest">TOTAL TEMPO ACTIVE WORK</span>
                          <span className="font-display font-black text-4xl text-zinc-800">{formatSecondsToTimeString(tempoResult.workSeconds)}</span>
                          {tempoResult.distKm > 0 && (
                            <span className="text-[10px] uppercase font-mono tracking-widest block mt-1 text-zinc-500">
                              Estimated Tempo Distance: <strong className="text-foreground">{tempoResult.distKm.toFixed(2)} km</strong>
                            </span>
                          )}
                        </div>

                        {tempoResult.restSeconds > 0 && (
                          <div className="p-3 border border-border bg-white rounded text-center">
                            <span className="block text-[9px] text-muted-foreground uppercase font-black tracking-widest">Active Rest Breaks</span>
                            <span className="font-mono text-lg font-black text-foreground">{formatSecondsToTimeString(tempoResult.restSeconds)}</span>
                          </div>
                        )}

                        <div className="p-4 bg-muted border border-border rounded text-center">
                          <span className="block text-[9px] font-black uppercase text-muted-foreground tracking-widest">Tempo duration total</span>
                          <div className="text-3xl font-mono font-black text-foreground">{formatSecondsToTimeString(tempoResult.sessionSeconds)}</div>
                        </div>
                      </div>
                    )
                  }}
                />
              </motion.div>
            )}

            {/* Ladder / Pyramid Outputs Card */}
            {mode === 'advanced' && subMode === 'ladder_pyramid' && ladderResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <Card className="border-2 border-border-heavy shadow-[4px_4px_0px_rgba(23,23,23,1)] bg-white">
                  <div className="bg-muted p-3 border-b-2 border-border-heavy flex justify-between items-center">
                    <span className="font-display font-black text-xs uppercase tracking-widest text-foreground">Rep-by-Rep Ladder Schedule</span>
                    <span className="font-mono text-xs font-black text-primary">Distance Sum: {(ladderResult.totalWorkDistanceMeters / 1000).toFixed(2)} km</span>
                  </div>
                  <div className="p-4 space-y-4">
                    {/* Table scroll */}
                    <div className="max-h-[200px] overflow-y-auto border border-border rounded">
                      <table className="w-full text-[11px] font-mono text-left font-bold">
                        <thead className="bg-neutral-100 uppercase text-[9px] text-zinc-550 border-b">
                          <tr>
                            <th className="p-2">Rep #</th>
                            <th className="p-2">Distance</th>
                            <th className="p-2">Target Time</th>
                            <th className="p-2">Recovery</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ladderResult.repsBreakdown.map((r: any) => (
                            <tr key={r.repNum} className="border-b hover:bg-neutral-50">
                              <td className="p-2 text-primary">Rep {r.repNum}</td>
                              <td className="p-2">{r.distanceMeters}m</td>
                              <td className="p-2 text-foreground font-black">{formatSecondsToTimeString(r.durationSeconds)}</td>
                              <td className="p-2 text-muted-foreground">{r.restSeconds > 0 ? formatSecondsToTimeString(r.restSeconds) : 'Done'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="p-2.5 bg-neutral-50 rounded border">
                        <span className="block text-[9px] uppercase tracking-widest text-muted-foreground">Work time sum</span>
                        <span className="text-sm font-black text-foreground">{formatSecondsToTimeString(ladderResult.totalWorkTimeSeconds)}</span>
                      </div>
                      <div className="p-2.5 bg-neutral-50 rounded border">
                        <span className="block text-[9px] uppercase tracking-widest text-muted-foreground">Rest sum</span>
                        <span className="text-sm font-black text-foreground">{formatSecondsToTimeString(ladderResult.totalRestTimeSeconds)}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-neutral-900 text-white text-center rounded">
                      <span className="block text-[8px] uppercase tracking-widest text-zinc-400">Total session duration</span>
                      <strong className="text-xl font-display">{formatSecondsToTimeString(ladderResult.totalSessionSeconds)}</strong>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Workout Comparison Outputs Card */}
            {mode === 'advanced' && subMode === 'comparison' && compResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <Card className="border-2 border-border-heavy shadow-[4px_4px_0px_rgba(23,23,23,1)] bg-white font-mono">
                  <div className="bg-accent p-3 border-b-2 border-border-heavy text-accent-foreground text-xs font-bold uppercase tracking-widest">
                    📊 COMPARISON SUMMARY DELTAS
                  </div>
                  <div className="p-6 space-y-4 font-bold text-xs leading-relaxed text-zinc-800">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>PLAN A LABEL</span>
                      <span className="text-primary">{compResult.workoutA.name}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>PLAN B LABEL</span>
                      <span className="text-primary">{compResult.workoutB.name}</span>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="p-3 bg-neutral-50 border border-border rounded">
                        <div className="flex justify-between text-xs mb-1">
                          <span>DURATION DELTA</span>
                          <span className={compResult.durationDelta < 0 ? "text-green-600" : "text-amber-600"}>
                            {compResult.durationDelta === 0 ? 'Equal' : `${formatSecondsToTimeString(Math.abs(compResult.durationDelta))} ${compResult.durationDelta < 0 ? 'shorter A' : 'shorter B'}`}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-neutral-50 border border-border rounded">
                        <div className="flex justify-between text-xs mb-1">
                          <span>VOLUME DELTA</span>
                          <span className={compResult.distanceDelta < 0 ? "text-green-600" : "text-amber-600"}>
                            {compResult.distanceDelta === 0 ? 'Equal' : `${Math.abs(compResult.distanceDelta).toFixed(2)} km ${compResult.distanceDelta < 0 ? 'less in A' : 'less in B'}`}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-neutral-50 border border-border rounded">
                        <div className="flex justify-between text-xs mb-1">
                          <span>HARD CORE WORK TIME DELTA</span>
                          <span className={compResult.hardTimeDelta < 0 ? "text-green-600" : "text-amber-600"}>
                            {compResult.hardTimeDelta === 0 ? 'Equal' : `${formatSecondsToTimeString(Math.abs(compResult.hardTimeDelta))} ${compResult.hardTimeDelta < 0 ? 'less in A' : 'less in B'}`}
                          </span>
                        </div>
                      </div>

                      <div className="p-3 bg-neutral-50 border border-border rounded">
                        <div className="flex justify-between text-xs mb-1">
                          <span>ACTIVE DENSITY DELTA %</span>
                          <span className="text-primary">{compResult.densityDelta.toFixed(1)}% difference</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Empty State / Not Calculated Indicator */}
            {(!intervalResult && !rwResult && !fartlekResult && !hillResult && !tempoResult && !ladderResult && !compResult && subMode !== 'block_builder') && (
              <div className="p-12 border-2 border-dashed border-border-heavy bg-card rounded-xl text-center flex flex-col items-center justify-center h-full min-h-[350px]">
                <HelpCircle className="w-12 h-12 text-muted-foreground stroke-1 mb-3" />
                <span className="font-bold text-sm uppercase tracking-wider text-muted-foreground block mb-2">Awaiting Input</span>
                <p className="text-xs text-zinc-550 max-w-sm px-4">
                  Fill in manual workout variables in the left panel, and click &quot;Calculate&quot; to inspect exact physical duration outlines. No AI recommendations or random generations are used.
                </p>
              </div>
            )}

            {/* DETERMINISTIC FORMULA ROAD TRACE COPIES */}
            {generalTrace && (
              <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                <CardHeader className="p-4 border-b border-border bg-card">
                  <span className="font-bold text-[10px] tracking-widest text-primary uppercase block">DETERMINISTIC FORMULA TRACE & EXPORT</span>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <pre className="p-3 bg-muted border border-border text-[10px] font-mono whitespace-pre-wrap rounded text-foreground font-semibold leading-relaxed">
                    {generalTrace}
                  </pre>
                  <ExportPanel textToCopy={resultToText({
                    methodSelected: currentExportTitle,
                    inputUsed: currentExportData?.inputUsed || {},
                    formulaUsed: "Deterministic workout block arithmetic",
                    confidenceLabel: "mathematical formulation",
                    limitations: "Subjects to cardiac drift and pacing, non-coaching metadata only."
                  }, "Workout Lab Record")} />
                </CardContent>
              </Card>
            )}

          </div>

        </div>

      </div>

    </CalculatorPageShell>
  );
}

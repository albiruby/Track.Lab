'use client';

import { useState, useMemo } from 'react';
import { Input, Label } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { CalculatorPageShell } from '@/components/calculator/CalculatorPageShell';
import { ManualInputPanel } from '@/components/calculator/ManualInputPanel';
import { ExportPanel } from '@/components/calculator/CalculatorSystem';
import { resultToText } from '@/lib/export/manualExport';
import { 
  calculateWeeklyDistance,
  calculateWeeklyDuration,
  calculateLongRunRatio,
  calculateFastVolumeRatio,
  calculateThresholdVolumeRatio,
  calculateProgressionRate,
  calculateCutbackRatio,
  calculateSessionRPELoad,
  calculateWeeklySRPELoad,
  calculateTrainingMonotony,
  calculateTrainingStrain,
  calculateACWR,
  calculateIntensityDistribution,
  classifyIntensityBalance,
  calculateHardEasyRatio,
  calculateAddRemoveSessionImpact
} from '@/lib/calculators_pack/loadSystem';
import { parseDurationToSeconds, formatSecondsToTimeString } from '@/lib/formatters/time';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  Activity, 
  TrendingUp, 
  Scale, 
  Layers, 
  Calendar, 
  Copy, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRightLeft, 
  Plus, 
  Minus, 
  Info,
  Printer
} from 'lucide-react';

type SubModule = 'weekly_volume' | 'srpe_load' | 'intensity_dist' | 'progression' | 'acwr' | 'comparison';

export default function LoadLabPage() {
  const [activeTab, setActiveTab] = useState<SubModule>('weekly_volume');
  const [error, setError] = useState<string | null>(null);
  const [advancedMode, setAdvancedMode] = useState<boolean>(false);

  // ---------------------------------------------------------------------------
  // 1. Weekly Volume STATE
  // ---------------------------------------------------------------------------
  const [d1Dist, setD1Dist] = useState('6');
  const [d2Dist, setD2Dist] = useState('0');
  const [d3Dist, setD3Dist] = useState('8');
  const [d4Dist, setD4Dist] = useState('6');
  const [d5Dist, setD5Dist] = useState('0');
  const [d6Dist, setD6Dist] = useState('12');
  const [d7Dist, setD7Dist] = useState('16');

  const [d1Dur, setD1Dur] = useState('35:00');
  const [d2Dur, setD2Dur] = useState('0');
  const [d3Dur, setD3Dur] = useState('45:00');
  const [d4Dur, setD4Dur] = useState('35:00');
  const [d5Dur, setD5Dur] = useState('0');
  const [d6Dur, setD6Dur] = useState('1:10:00');
  const [d7Dur, setD7Dur] = useState('1:35:00');

  const [longRunDist, setLongRunDist] = useState('16');
  const [fastDist, setFastDist] = useState('5');
  const [threshDist, setThreshDist] = useState('3');

  // Simple Mode Helpers
  const [simpleDistances, setSimpleDistances] = useState('5, 0, 8, 0, 10, 0, 15');
  const [simpleDurations, setSimpleDurations] = useState('30:00, 0, 48:00, 0, 1:00:00, 0, 1:30:00');

  // ---------------------------------------------------------------------------
  // 2. sRPE Load STATE
  // ---------------------------------------------------------------------------
  const [singleSessionDuration, setSingleSessionDuration] = useState('60');
  const [singleSessionRpe, setSingleSessionRpe] = useState('7');

  const [d1Rpe, setD1Rpe] = useState('4');
  const [d2Rpe, setD2Rpe] = useState('0');
  const [d3Rpe, setD3Rpe] = useState('6');
  const [d4Rpe, setD4Rpe] = useState('4');
  const [d5Rpe, setD5Rpe] = useState('0');
  const [d6Rpe, setD6Rpe] = useState('8');
  const [d7Rpe, setD7Rpe] = useState('7');

  const [d1Min, setD1Min] = useState('30');
  const [d2Min, setD2Min] = useState('0');
  const [d3Min, setD3Min] = useState('50');
  const [d4Min, setD4Min] = useState('30');
  const [d5Min, setD5Min] = useState('0');
  const [d6Min, setD6Min] = useState('70');
  const [d7Min, setD7Min] = useState('95');

  // ---------------------------------------------------------------------------
  // 3. Intensity Distribution STATE
  // ---------------------------------------------------------------------------
  const [lowMinutes, setLowMinutes] = useState('180');
  const [modMinutes, setModMinutes] = useState('40');
  const [highMinutes, setHighMinutes] = useState('20');

  // ---------------------------------------------------------------------------
  // 4. Progression / Cutback / Taper STATE
  // ---------------------------------------------------------------------------
  const [prevWeekVol, setPrevWeekVol] = useState('30');
  const [currWeekVol, setCurrWeekVol] = useState('36');
  const [peakWeekVol, setPeakWeekVol] = useState('50');
  const [cutbackWeekVol, setCutbackWeekVol] = useState('35');

  // ---------------------------------------------------------------------------
  // 5. ACWR STATE
  // ---------------------------------------------------------------------------
  const [acuteLoad, setAcuteLoad] = useState('500');
  const [chronicLoad, setChronicLoad] = useState('400');

  // ---------------------------------------------------------------------------
  // 6. Comparison STATE
  // ---------------------------------------------------------------------------
  const [compVolA, setCompVolA] = useState('40');
  const [compDurA, setCompDurA] = useState('200');
  const [compLoadA, setCompLoadA] = useState('1200');
  const [compHardA, setCompHardA] = useState('30');

  const [compVolB, setCompVolB] = useState('48');
  const [compDurB, setCompDurB] = useState('260');
  const [compLoadB, setCompLoadB] = useState('1680');
  const [compHardB, setCompHardB] = useState('60');

  // ---------------------------------------------------------------------------
  // RESETS
  // ---------------------------------------------------------------------------
  const handleReset = () => {
    setError(null);
    if (activeTab === 'weekly_volume') {
      setD1Dist('6'); setD2Dist('0'); setD3Dist('8'); setD4Dist('6'); setD5Dist('0'); setD6Dist('12'); setD7Dist('16');
      setD1Dur('35:00'); setD2Dur('0'); setD3Dur('45:00'); setD4Dur('35:00'); setD5Dur('0'); setD6Dur('1:10:00'); setD7Dur('1:35:00');
      setLongRunDist('16'); setFastDist('5'); setThreshDist('3');
      setSimpleDistances('5, 0, 8, 0, 10, 0, 15');
      setSimpleDurations('30:00, 0, 48:00, 0, 1:00:00, 0, 1:30:00');
    } else if (activeTab === 'srpe_load') {
      setSingleSessionDuration('60');
      setSingleSessionRpe('7');
      setD1Rpe('4'); setD2Rpe('0'); setD3Rpe('6'); setD4Rpe('4'); setD5Rpe('0'); setD6Rpe('8'); setD7Rpe('7');
      setD1Min('30'); setD2Min('0'); setD3Min('50'); setD4Min('30'); setD5Min('0'); setD6Min('70'); setD7Min('95');
    } else if (activeTab === 'intensity_dist') {
      setLowMinutes('180');
      setModMinutes('40');
      setHighMinutes('20');
    } else if (activeTab === 'progression') {
      setPrevWeekVol('30');
      setCurrWeekVol('36');
      setPeakWeekVol('50');
      setCutbackWeekVol('35');
    } else if (activeTab === 'acwr') {
      setAcuteLoad('500');
      setChronicLoad('400');
    } else if (activeTab === 'comparison') {
      setCompVolA('40'); setCompDurA('200'); setCompLoadA('1200'); setCompHardA('30');
      setCompVolB('48'); setCompDurB('260'); setCompLoadB('1680'); setCompHardB('60');
    }
  };

  // ---------------------------------------------------------------------------
  // PROCESS CALCULATIONS (DERIVED STATE)
  // ---------------------------------------------------------------------------
  const derivedResults = useMemo(() => {
    if (activeTab === 'weekly_volume') {
      let distances: number[] = [];
      let durationsSec: number[] = [];
      let lrD = parseFloat(longRunDist);
      let fD = parseFloat(fastDist);
      let tD = parseFloat(threshDist);

      if (advancedMode) {
        distances = [
          parseFloat(d1Dist) || 0,
          parseFloat(d2Dist) || 0,
          parseFloat(d3Dist) || 0,
          parseFloat(d4Dist) || 0,
          parseFloat(d5Dist) || 0,
          parseFloat(d6Dist) || 0,
          parseFloat(d7Dist) || 0
        ];
        
        const rawDurs = [d1Dur, d2Dur, d3Dur, d4Dur, d5Dur, d6Dur, d7Dur];
        durationsSec = rawDurs.map(t => {
          if (!t || t.trim() === '0' || t.trim() === '') return 0;
          const s = parseDurationToSeconds(t);
          return s !== null ? s : 0;
        });
      } else {
        distances = simpleDistances.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
        const rawDurs = simpleDurations.split(',');
        durationsSec = rawDurs.map(t => {
          if (!t || t.trim() === '0' || t.trim() === '') return 0;
          const s = parseDurationToSeconds(t.trim());
          return s !== null ? s : 0;
        });
        
        // Use highest mileage as long run default if simple list
        lrD = Math.max(...distances, 0);
        fD = 0;
        tD = 0;
      }

      const totalDist = calculateWeeklyDistance(distances);
      const totalDurSec = calculateWeeklyDuration(durationsSec);
      const totalDurMin = totalDurSec / 60;
      const lrRatio = calculateLongRunRatio(lrD, totalDist);
      const fastRatio = calculateFastVolumeRatio(fD, totalDist);
      const threshRatio = calculateThresholdVolumeRatio(tD, totalDist);

      // Cautions
      const cautions: string[] = [];
      if (lrRatio > 35) {
        cautions.push(`Long run ratio is ${(lrRatio).toFixed(1)}% (exceeds recommended 35% of weekly mileage to balance mechanical stress).`);
      }
      if (totalDist > 0 && (fD + tD) / totalDist > 0.3) {
        cautions.push(`High intensity volume represents ${(((fD + tD) / totalDist) * 100).toFixed(1)}% of weekly mileage. Focus recovery spacing.`);
      }

      // Chart Data
      const daysOfWeek = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
      const barData = distances.map((dist, idx) => ({
        name: daysOfWeek[idx] || `Day ${idx + 1}`,
        Distance: dist,
        Duration: Math.round(durationsSec[idx] / 60)
      }));

      const trace = `Step 1: Calculate Weekly Distance = ${distances.join(' + ')} = ${totalDist.toFixed(1)} units.\n` +
        `Step 2: Calculate Weekly Duration = ${durationsSec.map(d => formatSecondsToTimeString(d)).join(' + ')} = ${formatSecondsToTimeString(totalDurSec)} (${totalDurMin.toFixed(0)} mins).\n` +
        `Step 3: Calculate Long Run Ratio = (Long Run ${lrD} / Total ${totalDist.toFixed(1)}) × 100 = ${lrRatio.toFixed(1)}%.\n` +
        `Step 4: Calculate Fast Ratio = (Fast ${fD} / Total ${totalDist.toFixed(1)}) × 100 = ${fastRatio.toFixed(1)}%.\n` +
        `Step 5: Calculate Threshold Ratio = (Threshold ${tD} / Total ${totalDist.toFixed(1)}) × 100 = ${threshRatio.toFixed(1)}%.`;

      return {
        totalDist,
        totalDurMin,
        totalDurSec,
        lrRatio,
        fastRatio,
        threshRatio,
        cautions,
        barData,
        trace,
        inputsUsed: advancedMode ? {
          'D1': `${d1Dist}u, ${d1Dur}`,
          'D2': `${d2Dist}u, ${d2Dur}`,
          'D3': `${d3Dist}u, ${d3Dur}`,
          'D4': `${d4Dist}u, ${d4Dur}`,
          'D5': `${d5Dist}u, ${d5Dur}`,
          'D6': `${d6Dist}u, ${d6Dur}`,
          'D7': `${d7Dist}u, ${d7Dur}`,
          'Long Run': `${lrD}u`,
          'Fast Distance': `${fD}u`,
          'Threshold Distance': `${tD}u`
        } : {
          'Daily Distances': simpleDistances,
          'Daily Durations': simpleDurations
        }
      };
    }

    if (activeTab === 'srpe_load') {
      let loadVal = 0;
      let monotonyVal = 0;
      let strainVal = 0;
      let dailyLoads: number[] = [];
      let trace = '';
      let barData: any[] = [];
      let inputsUsed: any = {};

      if (!advancedMode) {
        const dur = parseFloat(singleSessionDuration) || 0;
        const rpe = parseFloat(singleSessionRpe) || 0;
        loadVal = calculateSessionRPELoad(dur, rpe);
        trace = `Step 1: Calculate Session sRPE Load = Duration (${dur} min) × RPE (Scale ${rpe}) = ${loadVal}.`;
        inputsUsed = { 'Duration (min)': dur, 'RPE': rpe };
        barData = [{ name: 'Session', Load: loadVal }];
      } else {
        const dMins = [
          parseFloat(d1Min) || 0,
          parseFloat(d2Min) || 0,
          parseFloat(d3Min) || 0,
          parseFloat(d4Min) || 0,
          parseFloat(d5Min) || 0,
          parseFloat(d6Min) || 0,
          parseFloat(d7Min) || 0
        ];
        const dRpes = [
          parseFloat(d1Rpe) || 0,
          parseFloat(d2Rpe) || 0,
          parseFloat(d3Rpe) || 0,
          parseFloat(d4Rpe) || 0,
          parseFloat(d5Rpe) || 0,
          parseFloat(d6Rpe) || 0,
          parseFloat(d7Rpe) || 0
        ];

        dailyLoads = dMins.map((m, idx) => calculateSessionRPELoad(m, dRpes[idx]));
        loadVal = calculateWeeklySRPELoad(dailyLoads);
        monotonyVal = calculateTrainingMonotony(dailyLoads);
        strainVal = calculateTrainingStrain(loadVal, monotonyVal);

        const daysOfWeek = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
        barData = dailyLoads.map((l, idx) => ({
          name: daysOfWeek[idx] || `Day ${idx + 1}`,
          Load: l
        }));

        inputsUsed = {
          'Daily Durations (min)': dMins.join(', '),
          'Daily RPEs (1-10)': dRpes.join(', ')
        };

        const nonZero = dailyLoads.filter(v => v > 0);
        const meanLoad = nonZero.length > 0 ? (nonZero.reduce((a, b) => a + b, 0) / nonZero.length) : 0;

        trace = `Step 1: Calculate Daily Loads: [${dailyLoads.join(', ')}]\n` +
          `Step 2: Calculate Weekly sRPE Load Sum = ${loadVal}.\n` +
          `Step 3: Calculate Training Monotony (Mean / StdDev of all 7 days) = ${monotonyVal.toFixed(2)}.\n` +
          `Step 4: Calculate Training Strain (Weekly sRPE Load × Monotony) = ${loadVal} × ${monotonyVal.toFixed(2)} = ${strainVal.toFixed(0)}.`;
      }

      const cautions: string[] = [];
      if (monotonyVal > 2.0) {
        cautions.push('Training Monotony is extremely high (> 2.0). Lack of recovery variation increases hard load stress.');
      }
      if (strainVal > 2500) {
        cautions.push('Training Strain exceeds 2500. Ensure hard and easy workouts alternate effectively.');
      }

      return {
        loadVal,
        monotonyVal,
        strainVal,
        dailyLoads,
        barData,
        trace,
        cautions,
        inputsUsed
      };
    }

    if (activeTab === 'intensity_dist') {
      const low = parseFloat(lowMinutes) || 0;
      const mod = parseFloat(modMinutes) || 0;
      const high = parseFloat(highMinutes) || 0;

      const { lowPct, moderatePct, highPct, total } = calculateIntensityDistribution(low, mod, high);
      const classification = classifyIntensityBalance(lowPct, moderatePct, highPct);

      const pieData = [
        { name: 'Low (Easy/Rec)', value: Math.round(lowPct), color: '#3b82f6' },
        { name: 'Moderate (Tempo)', value: Math.round(moderatePct), color: '#f59e0b' },
        { name: 'High (Hard/Threshold)', value: Math.round(highPct), color: '#ef4444' }
      ].filter(d => d.value > 0);

      const ratio = calculateHardEasyRatio(high, low);

      const trace = `Step 1: Sum Total Minutes = ${low} + ${mod} + ${high} = ${total} mins.\n` +
        `Step 2: Low Intensity (Easy) % = (${low} / ${total}) × 100 = ${lowPct.toFixed(1)}%.\n` +
        `Step 3: Moderate Intensity (Tempo) % = (${mod} / ${total}) × 100 = ${moderatePct.toFixed(1)}%.\n` +
        `Step 4: High Intensity (Hard) % = (${high} / ${total}) × 100 = ${highPct.toFixed(1)}%.\n` +
        `Step 5: Blended Hard-to-Easy Ratio = ${high} / ${low || 1} = ${ratio.toFixed(2)}.`;

      return {
        lowPct,
        moderatePct,
        highPct,
        total,
        classification,
        pieData,
        ratio,
        trace,
        cautions: highPct > 25 ? ['High intensity portion exceeds 25% of total volume. Monitor deep muscle sleep and micro-strain.'] : [],
        inputsUsed: { 'Low (Easy) min': low, 'Moderate min': mod, 'High (Hard) min': high }
      };
    }

    if (activeTab === 'progression') {
      const prev = parseFloat(prevWeekVol) || 0;
      const curr = parseFloat(currWeekVol) || 0;
      const peak = parseFloat(peakWeekVol) || 0;
      const cutback = parseFloat(cutbackWeekVol) || 0;

      const progression = calculateProgressionRate(prev, curr);
      const cutbackRatio = calculateCutbackRatio(peak, cutback);

      const cautions: string[] = [];
      if (progression > 10) {
        cautions.push(`Weekly Progression Rate is ${progression.toFixed(1)}% (exceeds conservative 10% volume expansion mark).`);
      }
      if (cutbackRatio < 15 && cutbackWeekVol) {
        cautions.push(`Cutback/Recovery reduction is only ${cutbackRatio.toFixed(1)}% of Peak. Standard deload blocks drop 15% to 25% for systemic recovery.`);
      }

      const barData = [
        { name: 'Previous Week', Volume: prev },
        { name: 'Current Week', Volume: curr },
        { name: 'Peak Week', Volume: peak },
        { name: 'Cutback Week', Volume: cutback }
      ];

      const trace = `Step 1: Calculate Progression Rate = (Current ${curr} - Previous ${prev}) / Previous ${prev} × 100 = ${progression.toFixed(1)}%.\n` +
        `Step 2: Calculate Cutback Ratio = (Peak ${peak} - Cutback ${cutback}) / Peak ${peak} × 100 = ${cutbackRatio.toFixed(1)}%.`;

      return {
        progression,
        cutbackRatio,
        cautions,
        barData,
        trace,
        inputsUsed: { 'Previous Week Vol': prev, 'Current Week Vol': curr, 'Peak Vol': peak, 'Cutback Vol': cutback }
      };
    }

    if (activeTab === 'acwr') {
      const ac = parseFloat(acuteLoad) || 0;
      const ch = parseFloat(chronicLoad) || 0;
      const ratio = calculateACWR(ac, ch);

      const cautions: string[] = [];
      let statusTheme = 'text-green-500 border-green-500';
      let statusText = 'Optimal Workload Span (0.8 - 1.3)';

      if (ratio < 0.8) {
        statusText = 'Under-training / High Deload Block (< 0.8)';
        statusTheme = 'text-blue-500 border-blue-500';
        cautions.push('ACWR Ratio is below 0.8. Fitness level might be decelerating. Keep structure consistent.');
      } else if (ratio > 1.5) {
        statusText = 'Systemic Rapid Load Spike (> 1.5)';
        statusTheme = 'text-red-500 border-red-500';
        cautions.push('ACWR exceeds 1.5. Drastic spike in acute load compared to chronic foundation. Limit structural micro-spikes.');
      } else if (ratio > 1.3) {
        statusText = 'Elevated Threshold Warning Zone (1.3 - 1.5)';
        statusTheme = 'text-amber-500 border-amber-500';
        cautions.push('ACWR is in the cautious 1.3-1.5 range. Prioritize post-run physical restoration.');
      }

      const barData = [
        { name: 'Chronic load (Avg)', Load: ch },
        { name: 'Acute load (Current)', Load: ac }
      ];

      const trace = `Step 1: Calculate ACWR = Acute Load (${ac}) / Chronic Load (${ch}) = ${ratio.toFixed(2)}.\n` +
        `Step 2: Classify ACWR against mathematical bounds: 0.8 - 1.3 representing balanced expansion.`;

      return {
        ratio,
        statusText,
        statusTheme,
        cautions,
        barData,
        trace,
        inputsUsed: { 'Acute Workload': ac, 'Chronic Workload': ch }
      };
    }

    if (activeTab === 'comparison') {
      const volA = parseFloat(compVolA) || 0;
      const durA = parseFloat(compDurA) || 0;
      const loadA = parseFloat(compLoadA) || 0;
      const hardA = parseFloat(compHardA) || 0;

      const volB = parseFloat(compVolB) || 0;
      const durB = parseFloat(compDurB) || 0;
      const loadB = parseFloat(compLoadB) || 0;
      const hardB = parseFloat(compHardB) || 0;

      const volDelta = volB - volA;
      const volDeltaPct = volA > 0 ? (volDelta / volA) * 100 : 0;

      const durDelta = durB - durA;
      const durDeltaPct = durA > 0 ? (durDelta / durA) * 100 : 0;

      const loadDelta = loadB - loadA;
      const loadDeltaPct = loadA > 0 ? (loadDelta / loadA) * 100 : 0;

      const hardDelta = hardB - hardA;
      const hardDeltaPct = hardA > 0 ? (hardDelta / hardA) * 100 : 0;

      const barData = [
        { name: 'Volume', PlanA: volA, PlanB: volB },
        { name: 'Duration (m)', PlanA: durA, PlanB: durB },
        { name: 'sRPE Load', PlanA: loadA, PlanB: loadB },
        { name: 'Hard min', PlanA: hardA, PlanB: hardB }
      ];

      const trace = `Step 1: Calculate Volume Delta = Scenario B (${volB}) - Scenario A (${volA}) = ${volDelta.toFixed(1)} (${volDeltaPct.toFixed(1)}%).\n` +
        `Step 2: Calculate Duration Delta = Scenario B (${durB}) - Scenario A (${durA}) = ${durDelta.toFixed(0)} mins (${durDeltaPct.toFixed(1)}%).\n` +
        `Step 3: Calculate Load Delta = Scenario B (${loadB}) - Scenario A (${loadA}) = ${loadDelta.toFixed(0)} (${loadDeltaPct.toFixed(1)}%).\n` +
        `Step 4: Calculate Hard Time Delta = Scenario B (${hardB}) - Scenario A (${hardA}) = ${hardDelta.toFixed(0)} mins (${hardDeltaPct.toFixed(1)}%).`;

      return {
        volDelta, volDeltaPct,
        durDelta, durDeltaPct,
        loadDelta, loadDeltaPct,
        hardDelta, hardDeltaPct,
        barData,
        trace,
        cautions: (volDeltaPct > 20 || loadDeltaPct > 20) ? ['Scenario B represents a substantial (>20%) rise from Scenario A. Build load in increments.'] : [],
        inputsUsed: {
          'Scenario A': `${volA}u, ${durA}m, ${loadA}L, ${hardA}m`,
          'Scenario B': `${volB}u, ${durB}m, ${loadB}L, ${hardB}m`
        }
      };
    }

    return null;
  }, [
    activeTab, advancedMode,
    d1Dist, d2Dist, d3Dist, d4Dist, d5Dist, d6Dist, d7Dist,
    d1Dur, d2Dur, d3Dur, d4Dur, d5Dur, d6Dur, d7Dur,
    longRunDist, fastDist, threshDist,
    simpleDistances, simpleDurations,
    singleSessionDuration, singleSessionRpe,
    d1Rpe, d2Rpe, d3Rpe, d4Rpe, d5Rpe, d6Rpe, d7Rpe,
    d1Min, d2Min, d3Min, d4Min, d5Min, d6Min, d7Min,
    lowMinutes, modMinutes, highMinutes,
    prevWeekVol, currWeekVol, peakWeekVol, cutbackWeekVol,
    acuteLoad, chronicLoad,
    compVolA, compDurA, compLoadA, compHardA,
    compVolB, compDurB, compLoadB, compHardB
  ]);

  const res = derivedResults as any;

  // Handle Export Content
  const exportData = useMemo(() => {
    if (!derivedResults) return '';
    const outputText = `TRACK.LAB MANUAL LOAD ESTIMATOR REPORT
Generated Time: ${new Date().toISOString()}
Module: ${activeTab.toUpperCase()}
Inputs Used: ${JSON.stringify(derivedResults.inputsUsed, null, 2)}
Formula Trace:
${derivedResults.trace}
Safety Limitations: Load ratio parameters derived from manual scenario entries only. This is not medical diagnosis, treatment guidance, or injury prediction algorithms.`;
    return outputText;
  }, [derivedResults, activeTab]);

  return (
    <CalculatorPageShell 
      title="Load Dynamics Lab" 
      subtitle="Manually inspect volume pacing metrics, weekly workloads, sRPE trends, and ACWR indices."
    >
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-border pb-4" id="load_tab_selector">
        <button 
          onClick={() => { setActiveTab('weekly_volume'); setAdvancedMode(false); }}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border-2 transition-all ${activeTab === 'weekly_volume' ? 'bg-primary text-primary-foreground border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]' : 'bg-card border-border hover:bg-muted'}`}
        >
          <Calendar className="inline h-3.5 w-3.5 mr-1" /> Weekly Volume
        </button>
        <button 
          onClick={() => { setActiveTab('srpe_load'); setAdvancedMode(false); }}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border-2 transition-all ${activeTab === 'srpe_load' ? 'bg-primary text-primary-foreground border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]' : 'bg-card border-border hover:bg-muted'}`}
        >
          <Activity className="inline h-3.5 w-3.5 mr-1" /> sRPE Workload
        </button>
        <button 
          onClick={() => { setActiveTab('intensity_dist'); setAdvancedMode(false); }}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border-2 transition-all ${activeTab === 'intensity_dist' ? 'bg-primary text-primary-foreground border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]' : 'bg-card border-border hover:bg-muted'}`}
        >
          <Layers className="inline h-3.5 w-3.5 mr-1" /> Intensity Distribution
        </button>
        <button 
          onClick={() => { setActiveTab('progression'); setAdvancedMode(false); }}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border-2 transition-all ${activeTab === 'progression' ? 'bg-primary text-primary-foreground border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]' : 'bg-card border-border hover:bg-muted'}`}
        >
          <TrendingUp className="inline h-3.5 w-3.5 mr-1" /> Progression & Cutback
        </button>
        <button 
          onClick={() => { setActiveTab('acwr'); setAdvancedMode(false); }}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border-2 transition-all ${activeTab === 'acwr' ? 'bg-primary text-primary-foreground border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]' : 'bg-card border-border hover:bg-muted'}`}
        >
          <Scale className="inline h-3.5 w-3.5 mr-1" /> ACWR Ratio
        </button>
        <button 
          onClick={() => { setActiveTab('comparison'); setAdvancedMode(false); }}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg border-2 transition-all ${activeTab === 'comparison' ? 'bg-primary text-primary-foreground border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]' : 'bg-card border-border hover:bg-muted'}`}
        >
          <ArrowRightLeft className="inline h-3.5 w-3.5 mr-1" /> Load Comparison
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Side: Inputs */}
        <div className="space-y-6">
          <ManualInputPanel
            mode={advancedMode ? 'advanced' : 'quick'}
            setMode={(m) => setAdvancedMode(m === 'advanced')}
            supportsAdvanced={activeTab === 'weekly_volume' || activeTab === 'srpe_load'}
            onCalculate={() => {}}
            onReset={handleReset}
            error={error}
          >
            {activeTab === 'weekly_volume' && (
              <div className="space-y-4">
                <div className="text-xl font-display font-black uppercase">Weekly Distance & Duration</div>
                
                {!advancedMode ? (
                  <>
                    <div>
                      <Label htmlFor="simpleDistances">Daily Distances (7 Comma Separated Val)</Label>
                      <Input 
                        id="simpleDistances" 
                        value={simpleDistances} 
                        onChange={(e) => setSimpleDistances(e.target.value)} 
                        placeholder="5, 0, 8, 0, 10, 0, 15" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="simpleDurations">Daily Durations (7 Comma Separated formats)</Label>
                      <Input 
                        id="simpleDurations" 
                        value={simpleDurations} 
                        onChange={(e) => setSimpleDurations(e.target.value)} 
                        placeholder="30:00, 0, 48:00, 0, 1:00:00, 0, 1:30:00" 
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 font-bold uppercase tracking-widest text-[9px] text-muted-foreground border-b border-border pb-1">
                      <div>Day</div>
                      <div>Distance (u)</div>
                      <div>Duration</div>
                    </div>
                    
                    {[
                      { label: 'Day 1', dist: d1Dist, setDist: setD1Dist, dur: d1Dur, setDur: setD1Dur },
                      { label: 'Day 2', dist: d2Dist, setDist: setD2Dist, dur: d2Dur, setDur: setD2Dur },
                      { label: 'Day 3', dist: d3Dist, setDist: setD3Dist, dur: d3Dur, setDur: setD3Dur },
                      { label: 'Day 4', dist: d4Dist, setDist: setD4Dist, dur: d4Dur, setDur: setD4Dur },
                      { label: 'Day 5', dist: d5Dist, setDist: setD5Dist, dur: d5Dur, setDur: setD5Dur },
                      { label: 'Day 6', dist: d6Dist, setDist: setD6Dist, dur: d6Dur, setDur: setD6Dur },
                      { label: 'Day 7', dist: d7Dist, setDist: setD7Dist, dur: d7Dur, setDur: setD7Dur },
                    ].map((row, idx) => (
                      <div key={idx} className="grid grid-cols-3 gap-2 items-center">
                        <span className="text-xs font-semibold">{row.label}</span>
                        <Input 
                          type="number" 
                          step="0.1" 
                          value={row.dist} 
                          onChange={(e) => row.setDist(e.target.value)} 
                          className="h-8 py-1"
                        />
                        <Input 
                          type="text" 
                          value={row.dur} 
                          onChange={(e) => row.setDur(e.target.value)} 
                          placeholder="M:SS / H:MM:SS"
                          className="h-8 py-1"
                        />
                      </div>
                    ))}

                    <div className="border-t border-border pt-4 grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="longRunDist">Long Run Dist</Label>
                        <Input id="longRunDist" type="number" step="0.1" value={longRunDist} onChange={e => setLongRunDist(e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="fastDist">Fast Run Dist (opt)</Label>
                        <Input id="fastDist" type="number" step="0.1" value={fastDist} onChange={e => setFastDist(e.target.value)} />
                      </div>
                      <div>
                        <Label htmlFor="threshDist">Threshold (opt)</Label>
                        <Input id="threshDist" type="number" step="0.1" value={threshDist} onChange={e => setThreshDist(e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'srpe_load' && (
              <div className="space-y-4">
                <div className="text-xl font-display font-black uppercase">sRPE Session Load</div>
                
                {!advancedMode ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="singleSessionDuration">Session Duration (min)</Label>
                      <Input 
                        id="singleSessionDuration" 
                        type="number" 
                        value={singleSessionDuration} 
                        onChange={(e) => setSingleSessionDuration(e.target.value)} 
                      />
                    </div>
                    <div>
                      <Label htmlFor="singleSessionRpe">Session RPE (1-10)</Label>
                      <Input 
                        id="singleSessionRpe" 
                        type="number" 
                        min="1" 
                        max="10" 
                        value={singleSessionRpe} 
                        onChange={(e) => setSingleSessionRpe(e.target.value)} 
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-2 font-bold uppercase tracking-widest text-[9px] text-muted-foreground border-b border-border pb-1">
                      <div>Day</div>
                      <div>Session Mins</div>
                      <div>RPE Score (1-10)</div>
                    </div>
                    {[
                      { label: 'Day 1', min: d1Min, setMin: setD1Min, rpe: d1Rpe, setRpe: setD1Rpe },
                      { label: 'Day 2', min: d2Min, setMin: setD2Min, rpe: d2Rpe, setRpe: setD2Rpe },
                      { label: 'Day 3', min: d3Min, setMin: setD3Min, rpe: d3Rpe, setRpe: setD3Rpe },
                      { label: 'Day 4', min: d4Min, setMin: setD4Min, rpe: d4Rpe, setRpe: setD4Rpe },
                      { label: 'Day 5', min: d5Min, setMin: setD5Min, rpe: d5Rpe, setRpe: setD5Rpe },
                      { label: 'Day 6', min: d6Min, setMin: setD6Min, rpe: d6Rpe, setRpe: setD6Rpe },
                      { label: 'Day 7', min: d7Min, setMin: setD7Min, rpe: d7Rpe, setRpe: setD7Rpe },
                    ].map((row, idx) => (
                      <div key={idx} className="grid grid-cols-3 gap-2 items-center">
                        <span className="text-xs font-semibold">{row.label}</span>
                        <Input 
                          type="number" 
                          value={row.min} 
                          onChange={(e) => row.setMin(e.target.value)} 
                          className="h-8 py-1"
                        />
                        <Input 
                          type="number" 
                          min="0" 
                          max="10" 
                          value={row.rpe} 
                          onChange={(e) => row.setRpe(e.target.value)} 
                          className="h-8 py-1"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'intensity_dist' && (
              <div className="space-y-4">
                <div className="text-xl font-display font-black uppercase">Intensity Distribution (min)</div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="lowMinutes">Low Intensity (Easy/Rec)</Label>
                    <Input id="lowMinutes" type="number" value={lowMinutes} onChange={(e) => setLowMinutes(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="modMinutes">Moderate (Tempo/Steady)</Label>
                    <Input id="modMinutes" type="number" value={modMinutes} onChange={(e) => setModMinutes(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="highMinutes">High (Hard/VO2/Thresh)</Label>
                    <Input id="highMinutes" type="number" value={highMinutes} onChange={(e) => setHighMinutes(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'progression' && (
              <div className="space-y-4">
                <div className="text-xl font-display font-black uppercase">Progression & Cutbacks</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="prevWeekVol">Previous Week Volume</Label>
                    <Input id="prevWeekVol" type="number" value={prevWeekVol} onChange={(e) => setPrevWeekVol(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="currWeekVol">Current Week Volume</Label>
                    <Input id="currWeekVol" type="number" value={currWeekVol} onChange={(e) => setCurrWeekVol(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="peakWeekVol">Peak Build Volume</Label>
                    <Input id="peakWeekVol" type="number" value={peakWeekVol} onChange={(e) => setPeakWeekVol(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="cutbackWeekVol">Cutback Week Volume</Label>
                    <Input id="cutbackWeekVol" type="number" value={cutbackWeekVol} onChange={(e) => setCutbackWeekVol(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'acwr' && (
              <div className="space-y-4">
                <div className="text-xl font-display font-black uppercase">ACWR Ratio Calculator</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="acuteLoad">Acute Workload (1-Week Sum)</Label>
                    <Input id="acuteLoad" type="number" value={acuteLoad} onChange={(e) => setAcuteLoad(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="chronicLoad">Chronic Workload (4-Week Avg)</Label>
                    <Input id="chronicLoad" type="number" value={chronicLoad} onChange={(e) => setChronicLoad(e.target.value)} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'comparison' && (
              <div className="space-y-4">
                <div className="text-xl font-display font-black uppercase">Plan / Scenario Comparison</div>
                
                <div className="border border-border p-4 bg-muted/30 rounded-xl space-y-3">
                  <div className="font-bold text-xs uppercase text-primary">Scenario A</div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <Label htmlFor="compVolA" className="text-[10px]">Volume u</Label>
                      <Input id="compVolA" type="number" value={compVolA} onChange={e => setCompVolA(e.target.value)} className="h-8 text-xs" />
                    </div>
                    <div>
                      <Label htmlFor="compDurA" className="text-[10px]">Duration min</Label>
                      <Input id="compDurA" type="number" value={compDurA} onChange={e => setCompDurA(e.target.value)} className="h-8 text-xs" />
                    </div>
                    <div>
                      <Label htmlFor="compLoadA" className="text-[10px]">Load sRPE</Label>
                      <Input id="compLoadA" type="number" value={compLoadA} onChange={e => setCompLoadA(e.target.value)} className="h-8 text-xs" />
                    </div>
                    <div>
                      <Label htmlFor="compHardA" className="text-[10px]">Hard min</Label>
                      <Input id="compHardA" type="number" value={compHardA} onChange={e => setCompHardA(e.target.value)} className="h-8 text-xs" />
                    </div>
                  </div>
                </div>

                <div className="border border-border p-4 bg-muted/30 rounded-xl space-y-3">
                  <div className="font-bold text-xs uppercase text-primary">Scenario B</div>
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <Label htmlFor="compVolB" className="text-[10px]">Volume u</Label>
                      <Input id="compVolB" type="number" value={compVolB} onChange={e => setCompVolB(e.target.value)} className="h-8 text-xs" />
                    </div>
                    <div>
                      <Label htmlFor="compDurB" className="text-[10px]">Duration min</Label>
                      <Input id="compDurB" type="number" value={compDurB} onChange={e => setCompDurB(e.target.value)} className="h-8 text-xs" />
                    </div>
                    <div>
                      <Label htmlFor="compLoadB" className="text-[10px]">Load sRPE</Label>
                      <Input id="compLoadB" type="number" value={compLoadB} onChange={e => setCompLoadB(e.target.value)} className="h-8 text-xs" />
                    </div>
                    <div>
                      <Label htmlFor="compHardB" className="text-[10px]">Hard min</Label>
                      <Input id="compHardB" type="number" value={compHardB} onChange={e => setCompHardB(e.target.value)} className="h-8 text-xs" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ManualInputPanel>

          {/* Honest cross links block */}
          <div className="border-2 border-border-heavy p-4 rounded-xl space-y-2 bg-card shadow-[2px_2px_0px_rgba(23,23,23,1)]">
            <div className="text-xs uppercase font-bold text-muted-foreground flex items-center">
              <Info className="h-3.5 w-3.5 mr-1" /> Honest Lab Integration
            </div>
            <ul className="text-xs space-y-1 text-slate-600">
              <li>• Link to <a href="/calendar" className="text-primary hover:underline font-semibold">Calendar Lab</a>: Preview weekly structuring and spacing cautions</li>
              <li>• Link to <a href="/workout" className="text-primary hover:underline font-semibold">Workout Lab</a>: Use custom session totals for sRPE load calculations</li>
              <li>• Link to <a href="/rpe" className="text-primary hover:underline font-semibold">RPE Lab</a>: Learn Borg 6-20 mappings & score calculations</li>
              <li>• Link to <a href="/zone" className="text-primary hover:underline font-semibold">Zone Lab</a>: Calculate training zones based on threshold pace</li>
            </ul>
          </div>
        </div>

        {/* Right Side: Results & Visuals */}
        <div className="space-y-6">
          {derivedResults ? (
            <>
              <ResultCard
                result={{
                  result: (
                    <div className="w-full space-y-6" id="load_lab_results">
                      {activeTab === 'weekly_volume' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 border-2 border-border-heavy bg-card rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                              <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Weekly Mileage</div>
                              <div className="text-3xl font-display font-black text-foreground">{res.totalDist.toFixed(1)} u</div>
                            </div>
                            <div className="p-4 border-2 border-border-heavy bg-card rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                              <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Weekly Duration</div>
                              <div className="text-2xl font-mono font-bold text-foreground">{Math.round(res.totalDurMin)} mins</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="p-3 border-2 border-border-heavy bg-card rounded-xl shadow-[1px_1px_0px_rgba(23,23,23,1)] text-center">
                              <div className="text-[9px] font-bold text-muted-foreground uppercase">Long Run Ratio</div>
                              <div className="text-lg font-mono font-black">{res.lrRatio.toFixed(1)}%</div>
                            </div>
                            <div className="p-3 border-2 border-border-heavy bg-card rounded-xl shadow-[1px_1px_0px_rgba(23,23,23,1)] text-center">
                              <div className="text-[9px] font-bold text-muted-foreground uppercase">Fast Vol Ratio</div>
                              <div className="text-lg font-mono font-black">{res.fastRatio.toFixed(1)}%</div>
                            </div>
                            <div className="p-3 border-2 border-border-heavy bg-card rounded-xl shadow-[1px_1px_0px_rgba(23,23,23,1)] text-center">
                              <div className="text-[9px] font-bold text-muted-foreground uppercase">Thresh Ratio</div>
                              <div className="text-lg font-mono font-black">{res.threshRatio.toFixed(1)}%</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'srpe_load' && (
                        <div className="space-y-4">
                          {!advancedMode ? (
                            <div className="p-5 border-2 border-border-heavy bg-card rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)] text-center">
                              <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Session sRPE Load</div>
                              <div className="text-5xl font-display font-black text-primary">{res.loadVal}</div>
                              <div className="text-[10px] text-muted-foreground mt-2">Calculated from Session Duration × Session RPE</div>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              <div className="grid grid-cols-3 gap-3">
                                <div className="p-3 border-2 border-border-heavy bg-card rounded-xl shadow-[1.5px_1.5px_0px_rgba(23,23,23,1)] text-center">
                                  <div className="text-[9px] font-bold text-muted-foreground uppercase">Weekly Load</div>
                                  <div className="text-xl font-mono font-bold text-primary">{res.loadVal}</div>
                                </div>
                                <div className="p-3 border-2 border-border-heavy bg-card rounded-xl shadow-[1.5px_1.5px_0px_rgba(23,23,23,1)] text-center">
                                  <div className="text-[9px] font-bold text-muted-foreground uppercase">Monotony Index</div>
                                  <div className="text-xl font-mono font-bold text-amber-500">{res.monotonyVal.toFixed(2)}</div>
                                </div>
                                <div className="p-3 border-2 border-border-heavy bg-card rounded-xl shadow-[1.5px_1.5px_0px_rgba(23,23,23,1)] text-center">
                                  <div className="text-[9px] font-bold text-muted-foreground uppercase">Training Strain</div>
                                  <div className="text-xl font-mono font-bold text-foreground">{Math.round(res.strainVal)}</div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'intensity_dist' && (
                        <div className="space-y-4">
                          <div className="p-5 border-2 border-border-heavy bg-card rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)] text-center">
                            <div className="text-[10px] text-muted-foreground uppercase font-black tracking-widest mb-1">Balance Classification</div>
                            <div className="text-xl font-bold font-display text-primary">{res.classification}</div>
                          </div>
                          
                          <div className="grid grid-cols-4 gap-2 text-center">
                            <div className="p-2 border border-border bg-card rounded-lg">
                              <div className="text-[8px] font-bold uppercase text-blue-500">Low Pct</div>
                              <div className="text-sm font-mono font-black">{res.lowPct.toFixed(1)}%</div>
                            </div>
                            <div className="p-2 border border-border bg-card rounded-lg">
                              <div className="text-[8px] font-bold uppercase text-amber-500">Mod Pct</div>
                              <div className="text-sm font-mono font-black">{res.moderatePct.toFixed(1)}%</div>
                            </div>
                            <div className="p-2 border border-border bg-card rounded-lg">
                              <div className="text-[8px] font-bold uppercase text-red-500">High Pct</div>
                              <div className="text-sm font-mono font-black">{res.highPct.toFixed(1)}%</div>
                            </div>
                            <div className="p-2 border border-border bg-card rounded-lg">
                              <div className="text-[8px] font-bold uppercase text-muted-foreground">Hard/Easy</div>
                              <div className="text-sm font-mono font-black">{res.ratio.toFixed(2)}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'progression' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-4 border-2 border-border-heavy bg-card rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Progression Rate</span>
                            <span className={`text-3xl font-display font-black block ${res.progression > 10 ? 'text-amber-500' : 'text-primary'}`}>
                              {res.progression.toFixed(1)}%
                            </span>
                            <span className="text-[9px] font-bold text-muted-foreground">Previous vs. Current Week</span>
                          </div>

                          <div className="p-4 border-2 border-border-heavy bg-card rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-1">Cutback Reduction</span>
                            <span className="text-3xl font-display font-black text-foreground block">
                              {res.cutbackRatio.toFixed(1)}%
                            </span>
                            <span className="text-[9px] font-bold text-muted-foreground">Peak vs. Taper/Cutback Week</span>
                          </div>
                        </div>
                      )}

                      {activeTab === 'acwr' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 items-center">
                            <div className="p-4 border-2 border-border-heavy bg-card rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)] text-center">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">ACWR Index</span>
                              <span className="text-5xl font-display font-black text-primary">{res.ratio.toFixed(2)}</span>
                            </div>
                            <div className="space-y-2">
                              <div className="text-xs uppercase font-bold text-muted-foreground">ACWR Range Status</div>
                              <div className={`p-2 border-2 rounded-lg text-xs font-bold text-center ${res.statusTheme}`}>
                                {res.statusText}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'comparison' && (
                        <div className="space-y-3">
                          <div className="text-xs font-semibold uppercase text-muted-foreground pb-1 border-b border-border">Plan A vs. B Deltas</div>
                          <div className="grid grid-cols-4 gap-2 text-center">
                            <div className="p-2 border border-border bg-card rounded-lg">
                              <div className="text-[8px] font-bold text-muted-foreground uppercase">Vol Delta</div>
                              <div className={`text-xs font-black ${res.volDelta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {res.volDelta >= 0 ? '+' : ''}{res.volDelta.toFixed(1)} ({res.volDeltaPct.toFixed(0)}%)
                              </div>
                            </div>
                            <div className="p-2 border border-border bg-card rounded-lg">
                              <div className="text-[8px] font-bold text-muted-foreground uppercase">Dur Delta</div>
                              <div className={`text-xs font-black ${res.durDelta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {res.durDelta >= 0 ? '+' : ''}{res.durDelta.toFixed(0)}m ({res.durDeltaPct.toFixed(0)}%)
                              </div>
                            </div>
                            <div className="p-2 border border-border bg-card rounded-lg">
                              <div className="text-[8px] font-bold text-muted-foreground uppercase">Load Delta</div>
                              <div className={`text-xs font-black ${res.loadDelta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {res.loadDelta >= 0 ? '+' : ''}{res.loadDelta.toFixed(0)} ({res.loadDeltaPct.toFixed(0)}%)
                              </div>
                            </div>
                            <div className="p-2 border border-border bg-card rounded-lg">
                              <div className="text-[8px] font-bold text-muted-foreground uppercase">Hard Delta</div>
                              <div className={`text-xs font-black ${res.hardDelta >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {res.hardDelta >= 0 ? '+' : ''}{res.hardDelta.toFixed(0)}m ({res.hardDeltaPct.toFixed(0)}%)
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Caution Warnings */}
                      {res.cautions && res.cautions.length > 0 && (
                        <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg space-y-1 text-xs text-amber-800">
                          <div className="font-bold flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-1 text-amber-500" /> Mathematical Cautions (Not Medical Diagnoses)
                          </div>
                          {res.cautions.map((c: string, i: number) => (
                            <div key={i}>• {c}</div>
                          ))}
                        </div>
                      )}

                      {/* Charts section */}
                      <div className="h-[200px] w-full pt-2">
                        {activeTab === 'intensity_dist' ? (
                          <div className="flex h-full items-center justify-around">
                            <div className="w-[150px] h-full">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={res.pieData}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={30}
                                    outerRadius={60}
                                    paddingAngle={2}
                                  >
                                    {res.pieData.map((entry: any, idx: number) => (
                                      <Cell key={`cell-${idx}`} fill={entry.color} />
                                    ))}
                                  </Pie>
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="text-xs space-y-1 font-mono text-left">
                              {res.pieData.map((d: any, idx: number) => (
                                <div key={idx} className="flex items-center">
                                  <span className="w-3 h-3 rounded-full mr-1" style={{ backgroundColor: d.color }}></span>
                                  <span>{d.name}: <strong>{d.value}%</strong></span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={res.barData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                              <YAxis tick={{ fontSize: 10 }} />
                              <Tooltip contentStyle={{ fontSize: 11, backgroundColor: '#fff', borderRadius: '8px' }} />
                              {activeTab === 'comparison' ? (
                                <>
                                  <Bar dataKey="PlanA" fill="#4f46e5" name="Scenario A" />
                                  <Bar dataKey="PlanB" fill="#06b6d4" name="Scenario B" />
                                </>
                              ) : (
                                <Bar 
                                  dataKey={activeTab === 'weekly_volume' ? 'Distance' : activeTab === 'progression' ? 'Volume' : 'Load'} 
                                  fill="#2563eb" 
                                />
                              )}
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                  ),
                  inputUsed: res.inputsUsed,
                  methodSelected: activeTab === 'weekly_volume' ? 'Weekly Volume Metrics' : activeTab === 'srpe_load' ? 'Session RPE Load' : activeTab === 'intensity_dist' ? 'Zone Intensity Balance' : activeTab === 'progression' ? 'Progression / Cutbacks' : activeTab === 'acwr' ? 'ACWR Workload Ratio' : 'Workout Scenario Comparison',
                  formulaUsed: activeTab === 'weekly_volume' ? 'Volume = Sum(Daily), Ratio = Sub / Total × 100' : activeTab === 'srpe_load' ? 'sRPE Load = Mins × RPE' : 'Category % = Minutes / Total Minutes × 100',
                  limitations: 'Calculated results model structural trends statistically based on manual inputs and spacing heuristics. Under no circumstances represents medical diagnoses, cardiac risk evaluation, autonomic assessments, or injury prognosis.',
                  confidenceLabel: 'Linear Estimate'
                }}
              />
              
              <ExportPanel textToCopy={exportData} />
            </>
          ) : (
            <div className="p-8 border-2 border-dashed border-border-heavy bg-card rounded-xl text-center flex flex-col items-center justify-center min-h-[300px] shadow-[2px_2px_0px_rgba(23,23,23,1)]">
              <span className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Awaiting Manual Entries</span>
            </div>
          )}
        </div>
      </div>
    </CalculatorPageShell>
  );
}

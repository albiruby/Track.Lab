'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input, Label, Button, Select, ValidationMessage } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { CalculatorPageShell } from '@/components/calculator/CalculatorPageShell';
import {
  estimateVO2Cooper12,
  estimateThresholdPaceFromFieldTest,
  estimateLTHRFrom30MinuteTest,
  calculateSweatRate,
  calculateHRRecoveryFieldTest,
  calculateTreadmillCalibration,
  calculateCadenceTest
} from '@/lib/calculators_pack/metabolicSystem';
import { methodRegistry, fieldTestProtocols } from '@/data';
import { Search, SlidersHorizontal, BookOpen, ShieldAlert, Award, ClipboardList, CheckCircle, ExternalLink, ArrowLeftRight, Copy } from 'lucide-react';
import { CalculatorResult } from '@/types';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';

export default function TestLabPage() {
  const [mode, setMode] = useState<'quick' | 'advanced' | 'protocols'>('quick');
  const [protocolSearch, setProtocolSearch] = useState('');
  const [protocolTypeFilter, setProtocolTypeFilter] = useState('all');
  const [selectedProtocolId, setSelectedProtocolId] = useState<string | null>(null);
  const [protocolCopyStatus, setProtocolCopyStatus] = useState<string | null>(null);

  // Universal export helper
  const triggerPrint = () => {
    window.print();
  };

  const handleExportText = (title: string, result: any, traceText: string) => {
    if (!result) return '';
    const output = `--- TRACK.LAB MANUALLY EXPORTED FILE ---\n` +
      `Test Lab Section: ${title}\n` +
      `Method: ${result.methodSelected}\n` +
      `Formula: ${result.formulaUsed}\n` +
      `Inputs:\n` +
      Object.entries(result.inputUsed || {}).map(([k, v]) => `  - ${k}: ${v}`).join('\n') + `\n\n` +
      `--- FORMULA TRACE ---\n` +
      traceText + `\n\n` +
      `--- ESTIMATES ---\n` +
      `Confidence Level: ${result.confidenceLabel || 'Estimate'}\n` +
      `Limitations: ${result.limitations || ''}\n`;
    return output;
  };

  const handleExportCSV = (title: string, result: any) => {
    if (!result) return '';
    const rows = [
      ['Field', 'Value'],
      ['Lab Title', title],
      ['Method Selected', result.methodSelected],
      ['Formula Display', result.formulaUsed],
      ...Object.entries(result.inputUsed || {}),
      ['Confidence Label', result.confidenceLabel],
      ['Limitations / Notes', result.limitations]
    ];
    return rows.map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
  };

  const handleExportJSON = (title: string, result: any, traceText: string) => {
    if (!result) return '';
    return JSON.stringify({
      lab: 'Test Lab',
      section: title,
      methodSelected: result.methodSelected,
      formulaUsed: result.formulaUsed,
      inputs: result.inputUsed,
      confidenceLabel: result.confidenceLabel,
      limitations: result.limitations,
      formulaTrace: traceText.split('\n')
    }, null, 2);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // =========================================================
  //                  QUICK TEST MODULES
  // =========================================================

  // 1. Cooper 12-Minute Test State
  const [cooperDist, setCooperDist] = useState('2800');
  const [cooperResult, setCooperResult] = useState<CalculatorResult<string> | null>(null);
  const [cooperTrace, setCooperTrace] = useState('');
  const [errorCooper, setErrorCooper] = useState<string | null>(null);

  const handleCalculateCooper = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCooper(null);
    try {
      const dist = parseFloat(cooperDist);
      if (isNaN(dist) || dist <= 504.9) {
        return setErrorCooper('Distance must be greater than 504.9m to compute.');
      }

      const vo2 = estimateVO2Cooper12(dist);
      const thresholdPaceSeconds = estimateThresholdPaceFromFieldTest(dist, 720); // 12 mins = 720s
      const minsPace = Math.floor(thresholdPaceSeconds / 60);
      const secsPace = Math.round(thresholdPaceSeconds % 60);

      const methodMeta = methodRegistry.find(m => m.id === 'cooper_12min_test') || {
        name: 'Cooper 12-Minute Test',
        formulaDisplay: 'VO2max = (Distance - 504.9) / 44.73',
        limitations: []
      };

      setCooperTrace(
        `Step 1: Distance = ${dist} meters\n` +
        `Step 2: Apply Cooper: (${dist} - 504.9) / 44.73 = ${vo2.toFixed(4)} ml/kg/min\n` +
        `Step 3: Average speed = ${dist} / 720 = ${(dist / 720).toFixed(4)} m/s\n` +
        `Step 4: Average pace = 1000 / ${(dist / 720).toFixed(4)} = ${(1000 / (dist / 720)).toFixed(2)} seconds/km\n` +
        `Step 5: Apply 8% pace adjustment for ~3K field test: ${(1000 / (dist / 720)).toFixed(2)} × 1.08 = ${thresholdPaceSeconds.toFixed(2)} seconds/km\n` +
        `Step 6: Formatted threshold pace estimate = ${minsPace}:${secsPace.toString().padStart(2, '0')}/km`
      );

      setCooperResult({
        result: `Estimated VO2max: ${vo2.toFixed(1)} ml/kg/min | Threshold Pace: ${minsPace}:${secsPace.toString().padStart(2, '0')}/km`,
        inputUsed: { 'Cooper 12-Min Distance': dist + ' m' },
        methodSelected: methodMeta.name,
        formulaUsed: methodMeta.formulaDisplay,
        confidenceLabel: 'Field-Test Estimate',
        limitations: 'Estimated fitness. ' + methodMeta.limitations?.join(' ')
      });
    } catch (err: any) {
      setErrorCooper(err.message);
    }
  };

  // 2. 20-Minute Threshold Test State
  const [twentyMinDist, setTwentyMinDist] = useState('4500');
  const [twentyMinAvgHR, setTwentyMinAvgHR] = useState('168');
  const [twentyMinResult, setTwentyMinResult] = useState<CalculatorResult<any> | null>(null);
  const [twentyMinTrace, setTwentyMinTrace] = useState('');
  const [errorTwentyMin, setErrorTwentyMin] = useState<string | null>(null);

  const handleCalculateTwentyMin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorTwentyMin(null);
    try {
      const dist = parseFloat(twentyMinDist);
      const hr = parseFloat(twentyMinAvgHR);

      if (isNaN(dist) || dist <= 0) return setErrorTwentyMin('Please enter a valid forward testing distance.');
      if (isNaN(hr) || hr <= 40) return setErrorTwentyMin('Please enter an accurate average heart rate (>40 bpm).');

      const avgSpeedMps = dist / 1200; // 20 mins = 1200s
      const avgPaceSecs = 1000 / avgSpeedMps;
      const thresholdPaceSecs = avgPaceSecs * 1.05; // 5% slower for threshold from 20-min pace
      const lthr = hr * 0.95; // LTHR is 95% of 20-min average

      const minsPace = Math.floor(thresholdPaceSecs / 60);
      const secsPace = Math.round(thresholdPaceSecs % 60);

      const methodMeta = methodRegistry.find(m => m.id === 'twenty_min_threshold_test') || {
        name: '20-Minute Threshold Test',
        formulaDisplay: 'LTHR = Average HR × 0.95 | Threshold Pace = 20-min pace × 1.05',
        limitations: []
      };

      setTwentyMinTrace(
        `Step 1: Distance = ${dist} m, Time = 1200 secs, Avg HR = ${hr} bpm\n` +
        `Step 2: Average 20-min pace = 1000 / (${dist} / 1200) = ${avgPaceSecs.toFixed(2)} secs/km\n` +
        `Step 3: Threshold Pace = ${avgPaceSecs.toFixed(2)} × 1.05 = ${thresholdPaceSecs.toFixed(2)} secs/km\n` +
        `Step 4: LTHR = ${hr} × 0.95 = ${lthr.toFixed(1)} bpm\n` +
        `Step 5: Formatted Threshold Pace = ${minsPace}:${secsPace.toString().padStart(2, '0')}/km`
      );

      setTwentyMinResult({
        result: (
          <div className="space-y-3">
            <div className="flex justify-between items-center py-1.5 border-b border-border">
              <span className="font-bold text-sm">Estimated LTHR</span>
              <span className="font-mono text-base font-black text-primary">{lthr.toFixed(0)} bpm</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-border">
              <span className="font-bold text-sm font-display">Threshold Pace (ST)</span>
              <span className="font-mono text-base font-black text-primary">{minsPace}:${secsPace.toString().padStart(2, '0')}/km</span>
            </div>
          </div>
        ),
        inputUsed: {
          '20-Min Distance': dist + ' m',
          '20-Min Average HR': hr + ' bpm'
        },
        methodSelected: methodMeta.name,
        formulaUsed: methodMeta.formulaDisplay,
        confidenceLabel: 'Aerobic Power Field Test',
        limitations: 'Assumes sustained hard flat-velocity effort. Cardiac drift or dehydration can skew heart rate averages. ' + methodMeta.limitations?.join(' ')
      });
    } catch (err: any) {
      setErrorTwentyMin(err.message);
    }
  };

  // 3. 30-Minute LTHR Test State
  const [thirtyMinHR, setThirtyMinHR] = useState('172');
  const [thirtyMinProtocol, setThirtyMinProtocol] = useState<'last20' | 'full'>('last20');
  const [thirtyMinResult, setThirtyMinResult] = useState<CalculatorResult<string> | null>(null);
  const [thirtyMinTrace, setThirtyMinTrace] = useState('');
  const [errorThirtyMin, setErrorThirtyMin] = useState<string | null>(null);

  const handleCalculateThirtyMin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorThirtyMin(null);
    try {
      const hr = parseFloat(thirtyMinHR);
      if (isNaN(hr) || hr <= 40) return setErrorThirtyMin('Please enter a valid average heart rate.');

      const lthr = estimateLTHRFrom30MinuteTest(hr, thirtyMinProtocol);
      const methodMeta = methodRegistry.find(m => m.id === 'thirty_min_lthr_test') || {
        name: '30-Minute LTHR Test',
        formulaDisplay: 'LTHR = Average of final 20 minutes',
        limitations: []
      };

      setThirtyMinTrace(
        `Step 1: Avg HR = ${hr} bpm, Protocol = ${thirtyMinProtocol === 'last20' ? 'Last 20 Mins' : 'Full 30 Mins'}\n` +
        `Step 2: LTHR multiplier: ${thirtyMinProtocol === 'last20' ? '1.00' : '0.95'}\n` +
        `Step 3: ${hr} × ${thirtyMinProtocol === 'last20' ? '1.00' : '0.95'} = ${lthr.toFixed(1)} bpm`
      );

      setThirtyMinResult({
        result: `Estimated LTHR: ${lthr.toFixed(0)} bpm`,
        inputUsed: {
          'Sustained Heart Rate': hr + ' bpm',
          'Averaging Method': thirtyMinProtocol === 'last20' ? 'Final 20 mins of 30-min run' : 'Full 30-minute run'
        },
        methodSelected: methodMeta.name,
        formulaUsed: methodMeta.formulaDisplay,
        confidenceLabel: 'Classic Joe Friel Protocol',
        limitations: 'Highly specific to solo, flat, pacing-stable performance. ' + methodMeta.limitations?.join(' ')
      });
    } catch (err: any) {
      setErrorThirtyMin(err.message);
    }
  };

  // Dedicated typesafe states for charts
  const [hrrChartVals, setHrrChartVals] = useState<{ peak: number; r1: number; r2: number } | null>(null);
  const [sweatChartStats, setSweatChartStats] = useState<{ sweatLossLiters: number; fluidIntakeLiters: number } | null>(null);

  // 4. HR Recovery (HRR) Test State
  const [hrrPeak, setHrrPeak] = useState('180');
  const [hrr1Min, setHrr1Min] = useState('142');
  const [hrr2Min, setHrr2Min] = useState('120');
  const [hrrResult, setHrrResult] = useState<CalculatorResult<any> | null>(null);
  const [hrrTrace, setHrrTrace] = useState('');
  const [errorHrr, setErrorHrr] = useState<string | null>(null);

  const handleCalculateHrr = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorHrr(null);
    try {
      const peak = parseFloat(hrrPeak);
      const r1 = parseFloat(hrr1Min);
      const r2 = parseFloat(hrr2Min);

      if (isNaN(peak) || peak <= 60) return setErrorHrr('Peak HR must represent intense activity (>60 bpm).');
      if (isNaN(r1) || r1 >= peak) return setErrorHrr('1-Min recovery HR must be lower than peak.');
      if (isNaN(r2) || r2 >= r1) return setErrorHrr('2-Min recovery HR must be lower than 1-Min recovery HR.');

      const hrr1 = calculateHRRecoveryFieldTest(peak, r1);
      const hrr2 = calculateHRRecoveryFieldTest(peak, r2);

      let rating = 'Typical / Standard';
      if (hrr1 >= 30) rating = 'Excellent Cardiorespiratory Fitness';
      else if (hrr1 >= 18) rating = 'Good Aerobic Recovery';
      else if (hrr1 < 12) rating = 'Reduced Recovery Rate (Load Caution)';

      const methodMeta = methodRegistry.find(m => m.id === 'hr_recovery_test') || {
        name: 'Heart Rate Recovery Test',
        formulaDisplay: 'Recovery Drop = Peak HR - Recovery HR',
        limitations: []
      };

      setHrrTrace(
        `Step 1: Peak HR = ${peak} bpm, 1-Min HR = ${r1} bpm, 2-Min HR = ${r2} bpm\n` +
        `Step 2: 1-Min Drop = ${peak} - ${r1} = ${hrr1} bpm\n` +
        `Step 3: 2-Min Drop = ${peak} - ${r2} = ${hrr2} bpm\n` +
        `Step 4: Assess HR recovery category = ${rating}`
      );

      setHrrChartVals({ peak, r1, r2 });

      setHrrResult({
        result: (
          <div className="space-y-3">
            <div className="flex justify-between items-center py-1.5 border-b border-border">
              <span className="font-bold text-sm">1-Minute Recovery Drop</span>
              <span className="font-mono text-base font-black text-primary">-{hrr1} bpm</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-border">
              <span className="font-bold text-sm">2-Minute Recovery Drop</span>
              <span className="font-mono text-base font-black text-primary">-{hrr2} bpm</span>
            </div>
            <div className="py-2 px-3 bg-muted border border-border rounded text-center text-xs font-black text-foreground uppercase tracking-wider">
              HR Recovery Category (Non-Medical): {rating}
            </div>
          </div>
        ),
        inputUsed: {
          'Peak Heart Rate': peak + ' bpm',
          '1-Min Post-Effort': r1 + ' bpm',
          '2-Min Post-Effort': r2 + ' bpm'
        },
        methodSelected: methodMeta.name,
        formulaUsed: methodMeta.formulaDisplay,
        confidenceLabel: 'HR recovery / HR response estimate',
        limitations: 'Subject to high ambient heat, active standing vs lying stance, and fatigue levels. ' + methodMeta.limitations?.join(' ')
      });
    } catch (err: any) {
      setErrorHrr(err.message);
    }
  };

  // For Recovery Chart
  const recoveryChartData = hrrChartVals ? [
    { name: 'Peak', value: hrrChartVals.peak },
    { name: '1-Min', value: hrrChartVals.r1 },
    { name: '2-Min', value: hrrChartVals.r2 }
  ] : [];

  // =========================================================
  //                 ADVANCED TEST MODULES
  // =========================================================

  // 5. Sweat Rate Test State
  const [sweatPre, setSweatPre] = useState('75.2'); // kg
  const [sweatPost, setSweatPost] = useState('74.5'); // kg
  const [sweatFluid, setSweatFluid] = useState('0.500'); // L
  const [sweatUrine, setSweatUrine] = useState('0.100'); // L
  const [sweatDur, setSweatDur] = useState('1.0'); // hrs
  const [sweatResult, setSweatResult] = useState<CalculatorResult<any> | null>(null);
  const [sweatTrace, setSweatTrace] = useState('');
  const [errorSweat, setErrorSweat] = useState<string | null>(null);

  const handleCalculateSweat = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorSweat(null);
    try {
      const pre = parseFloat(sweatPre);
      const post = parseFloat(sweatPost);
      const fluid = parseFloat(sweatFluid);
      const urine = parseFloat(sweatUrine);
      const dur = parseFloat(sweatDur);

      if (isNaN(pre) || pre <= 30) return setErrorSweat('Invalid pre-activity weight.');
      if (isNaN(post) || post <= 30 || post > pre) return setErrorSweat('Post-activity weight must be less than pre-activity weight.');
      if (isNaN(fluid) || fluid < 0) return setErrorSweat('Invalid fluid intake.');
      if (isNaN(urine) || urine < 0) return setErrorSweat('Invalid urine excretion.');
      if (isNaN(dur) || dur <= 0) return setErrorSweat('Testing duration must exceed 0 hours.');

      const stats = calculateSweatRate(pre, post, fluid, urine, dur);
      const methodMeta = methodRegistry.find(m => m.id === 'sweat_rate_test') || {
        name: 'Sweat Rate Formula',
        formulaDisplay: 'Sweat Loss = Body Mass Loss + Intake - Excretion',
        limitations: []
      };

      setSweatTrace(
        `Step 1: Mass Loss = ${pre} - ${post} = ${(pre - post).toFixed(3)} kg (or Liters)\n` +
        `Step 2: Total Sweat Loss = ${(pre - post).toFixed(3)} + ${fluid} (intake) - ${urine} (urine) = ${stats.sweatLossLiters.toFixed(3)} L\n` +
        `Step 3: Hourly Sweat Rate = ${stats.sweatLossLiters.toFixed(3)} / ${dur} hr = ${stats.sweatRateLitersPerHour.toFixed(3)} L/hr\n` +
        `Step 4: Body mass dehydrated = (${(pre - post).toFixed(3)} / ${pre}) × 100 = ${stats.bodyMassLossPercent.toFixed(2)}%`
      );

      let dehyCaution = 'Normal hydration range';
      if (stats.bodyMassLossPercent >= 2.0) {
        dehyCaution = 'Dehydration Caution (Fatigue & Mechanical stress risk)';
      }

      setSweatChartStats({ sweatLossLiters: stats.sweatLossLiters, fluidIntakeLiters: fluid });

      setSweatResult({
        result: (
          <div className="space-y-3">
            <div className="flex justify-between items-center py-1.5 border-b border-border">
              <span className="font-bold text-sm">Hourly Sweat Rate</span>
              <span className="font-mono text-base font-black text-primary">{stats.sweatRateLitersPerHour.toFixed(2)} L/hour</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-border">
              <span className="font-bold text-sm">Net Body Mass Loss</span>
              <span className="font-mono text-base font-black text-primary">{stats.bodyMassLossPercent.toFixed(1)}%</span>
            </div>
            <div className="py-2 px-3 bg-muted border border-border rounded text-center text-xs font-black text-red-700 uppercase tracking-widest leading-tight">
              {dehyCaution}
            </div>
          </div>
        ),
        inputUsed: {
          'Before Run Weight': pre + ' kg',
          'After Run Weight': post + ' kg',
          'Fluids Ingested': fluid + ' L',
          'Urine Released': urine + ' L',
          'Active Time': dur + ' hr'
        },
        methodSelected: methodMeta.name,
        formulaUsed: methodMeta.formulaDisplay,
        confidenceLabel: 'sweat rate estimate',
        limitations: 'Varies by sweat rate, humidity, solar exposure, and pacing. ' + methodMeta.limitations?.join(' ')
      });
    } catch (err: any) {
      setErrorSweat(err.message);
    }
  };

  // 6. Treadmill Calibration Test State
  const [calMeasured, setCalMeasured] = useState('5000'); // m
  const [calTreadmill, setCalTreadmill] = useState('5150'); // m
  const [calResult, setCalResult] = useState<CalculatorResult<string> | null>(null);
  const [calTrace, setCalTrace] = useState('');
  const [errorCal, setErrorCal] = useState<string | null>(null);

  const handleCalculateCal = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCal(null);
    try {
      const meas = parseFloat(calMeasured);
      const read = parseFloat(calTreadmill);

      if (isNaN(meas) || meas <= 0) return setErrorCal('Please enter a valid actual distance.');
      if (isNaN(read) || read <= 0) return setErrorCal('Please enter a valid speedometer distance.');

      const errPct = calculateTreadmillCalibration(meas, read);
      const methodMeta = methodRegistry.find(m => m.id === 'treadmill_calibration_test') || {
        name: 'Treadmill Speedometer Calibration',
        formulaDisplay: 'Error % = (Treadmill_Dist - Actual_Dist) / Actual_Dist × 100',
        limitations: []
      };

      setCalTrace(
        `Step 1: Measured Actual = ${meas} m, Treadmill Reading = ${read} m\n` +
        `Step 2: Absolute delta = ${read} - ${meas} = ${read - meas} m\n` +
        `Step 3: Error Ratio = ${read - meas} / ${meas} = ${((read - meas) / meas).toFixed(6)}\n` +
        `Step 4: Percentage Error = ${errPct.toFixed(2)}%`
      );

      const desc = errPct > 0
        ? `Treadmill displays ${errPct.toFixed(1)}% farther than actual.`
        : `Treadmill displays ${Math.abs(errPct).toFixed(1)}% shorter than actual.`;

      setCalResult({
        result: `${errPct.toFixed(1)}% Speedometer Drift (${desc})`,
        inputUsed: { 'Measured Path': meas + ' m', 'Treadmill Dial': read + ' m' },
        methodSelected: methodMeta.name,
        formulaUsed: methodMeta.formulaDisplay,
        confidenceLabel: 'Mechanical Audit Calibration',
        limitations: 'Fluctuates based on user foot strike friction or motor speed. ' + methodMeta.limitations?.join(' ')
      });
    } catch (err: any) {
      setErrorCal(err.message);
    }
  };

  // 7. Cadence & Biomechanics Test State
  const [cadSteps, setCadSteps] = useState('1800');
  const [cadDist, setCadDist] = useState('1609'); // meters (1 mile)
  const [cadSecs, setCadSecs] = useState('480'); // 8 mins
  const [cadResult, setCadResult] = useState<CalculatorResult<any> | null>(null);
  const [cadTrace, setCadTrace] = useState('');
  const [errorCad, setErrorCad] = useState<string | null>(null);

  const handleCalculateCad = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCad(null);
    try {
      const steps = parseFloat(cadSteps);
      const dist = parseFloat(cadDist);
      const secs = parseFloat(cadSecs);

      if (isNaN(steps) || steps <= 0) return setErrorCad('Steps count must be a positive integer.');
      if (isNaN(dist) || dist <= 0) return setErrorCad('Distance must be a positive integer.');
      if (isNaN(secs) || secs <= 5) return setErrorCad('Duration of biomechanics test is too short.');

      const spm = calculateCadenceTest(steps, secs);
      const stride = dist / steps; // stride length in m

      const methodMeta = methodRegistry.find(m => m.id === 'cadence_test') || {
        name: 'Cadence & Biomechanical Test',
        formulaDisplay: 'SPM = Steps / Minutes | Stride = Distance / Steps',
        limitations: []
      };

      setCadTrace(
        `Step 1: Test inputs -> Steps = ${steps}, Distance = ${dist} m, Time = ${secs} s\n` +
        `Step 2: Convert time to minutes: ${secs} / 60 = ${(secs / 60).toFixed(4)} mins\n` +
        `Step 3: Cadence steps/min = ${steps} / ${(secs / 60).toFixed(4)} = ${spm.toFixed(2)} spm\n` +
        `Step 4: Stride length = ${dist} / ${steps} = ${stride.toFixed(4)} meters`
      );

      setCadResult({
        result: (
          <div className="space-y-3">
            <div className="flex justify-between items-center py-1.5 border-b border-border">
              <span className="font-bold text-sm">Testing Cadence</span>
              <span className="font-mono text-base font-black text-primary">{spm.toFixed(0)} steps/min</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-border">
              <span className="font-bold text-sm">Average Stride Length</span>
              <span className="font-mono text-base font-black text-primary">{stride.toFixed(2)} meters</span>
            </div>
          </div>
        ),
        inputUsed: { 'Steps Counted': steps, 'Measured Distance': dist + ' m', 'Time Elapsed': secs + ' s' },
        methodSelected: methodMeta.name,
        formulaUsed: methodMeta.formulaDisplay,
        confidenceLabel: 'Biomechanical Field Audit',
        limitations: 'Stride and cadence change continuously based on terrain, shoes, fatigue, and elevation. ' + methodMeta.limitations?.join(' ')
      });
    } catch (err: any) {
      setErrorCad(err.message);
    }
  };

  // 8. Easy Run Decoupling (Cardiac Drift) Test State
  const [driftHr1, setDriftHr1] = useState('140');
  const [driftSpeed1, setDriftSpeed1] = useState('11.5'); // kmh
  const [driftHr2, setDriftHr2] = useState('148');
  const [driftSpeed2, setDriftSpeed2] = useState('11.5');
  const [driftResult, setDriftResult] = useState<CalculatorResult<string> | null>(null);
  const [driftTrace, setDriftTrace] = useState('');
  const [errorDrift, setErrorDrift] = useState<string | null>(null);

  const handleCalculateDrift = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorDrift(null);
    try {
      const hr1 = parseFloat(driftHr1);
      const s1 = parseFloat(driftSpeed1);
      const hr2 = parseFloat(driftHr2);
      const s2 = parseFloat(driftSpeed2);

      if (isNaN(hr1) || hr1 <= 40 || isNaN(hr2) || hr2 <= 40) return setErrorDrift('Heart rate outputs must be higher than 40 bpm.');
      if (isNaN(s1) || s1 <= 0 || isNaN(s2) || s2 <= 0) return setErrorDrift('Forward velocities must be positive (>0).');

      // Aerobic efficiency factor = speed / HR
      const ef1 = s1 / hr1;
      const ef2 = s2 / hr2;
      // Drift % = (ef1 - ef2) / ef1 * 100
      const drift = ((ef1 - ef2) / ef1) * 100;

      const methodMeta = methodRegistry.find(m => m.id === 'easy_run_drift_test') || {
        name: 'Easy Run Decoupling Test',
        formulaDisplay: 'Cardiac Drift % = (EF1 - EF2) / EF1 × 100',
        limitations: []
      };

      setDriftTrace(
        `Step 1: First Half HR = ${hr1} bpm, Speed = ${s1} km/h\n` +
        `Step 2: Efficiency Factor 1 (EF1) = ${s1} / ${hr1} = ${ef1.toFixed(6)}\n` +
        `Step 3: Second Half HR = ${hr2} bpm, Speed = ${s2} km/h\n` +
        `Step 4: Efficiency Factor 2 (EF2) = ${s2} / ${hr2} = ${ef2.toFixed(6)}\n` +
        `Step 5: Decoupling Drift = ((${ef1.toFixed(6)} - ${ef2.toFixed(6)}) / ${ef1.toFixed(6)}) × 100 = ${drift.toFixed(2)}%`
      );

      let interpretation = 'Excellent aerobic conditioning (drift under 5%).';
      if (drift >= 10.0) {
        interpretation = 'Substantial Decoupling (Fatigue Caution: consider mechanical stress reduction).';
      } else if (drift >= 5.0) {
        interpretation = 'Standard moderate decoupling drop.';
      }

      setDriftResult({
        result: `${drift.toFixed(1)}% Metabolic Decoupling (${interpretation})`,
        inputUsed: {
          '1st Half Avg HR': hr1 + ' bpm',
          '1st Half Speed': s1 + ' km/h',
          '2nd Half Avg HR': hr2 + ' bpm',
          '2nd Half Speed': s2 + ' km/h'
        },
        methodSelected: methodMeta.name,
        formulaUsed: methodMeta.formulaDisplay,
        confidenceLabel: 'Cardiovascular Conditioning Index',
        limitations: 'Highly impacted by state of hydration, caffeine, room temperature, or humidity. ' + methodMeta.limitations?.join(' ')
      });
    } catch (err: any) {
      setErrorDrift(err.message);
    }
  };

  return (
    <CalculatorPageShell title="Test Lab" subtitle="Calculate field-test outputs, HR recovery / HR response estimate, and sweat rate calibrations.">
      <div className="space-y-6">

        {/* --- NAVIGATION TO OTHER LABS --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-muted border-2 border-border-heavy p-3 rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
          <Link href="/critical-speed" className="text-[10px] font-black uppercase tracking-wider text-center py-2 bg-white border border-border rounded-lg hover:bg-neutral-50 transition-colors">
            🔗 CRITICAL SPEED LAB
          </Link>
          <Link href="/pace" className="text-[10px] font-black uppercase tracking-wider text-center py-2 bg-white border border-border rounded-lg hover:bg-neutral-50 transition-colors">
            🔗 TRAINING PACE LAB
          </Link>
          <Link href="/fuel" className="text-[10px] font-black uppercase tracking-wider text-center py-2 bg-white border border-border rounded-lg hover:bg-neutral-50 transition-colors">
            🔗 FUEL & HYDRATION
          </Link>
          <Link href="/vo2" className="text-[10px] font-black uppercase tracking-wider text-center py-2 bg-white border border-border rounded-lg hover:bg-neutral-50 transition-colors">
            🔗 VO2 & METABOLIC
          </Link>
        </div>

        {/* --- MODE SWITCHER --- */}
        <div className="flex border-2 border-border-heavy rounded-xl p-1 bg-white max-w-md shadow-[2px_2px_0px_rgba(23,23,23,1)] overflow-hidden">
          <button
            onClick={() => setMode('quick')}
            className={`flex-1 text-center py-2 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${mode === 'quick' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
          >
            Quick Tests
          </button>
          <button
            onClick={() => setMode('advanced')}
            className={`flex-1 text-center py-2 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${mode === 'advanced' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
          >
            Advanced Audits
          </button>
          <button
            onClick={() => setMode('protocols')}
            className={`flex-1 text-center py-2 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${mode === 'protocols' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
          >
            Protocol Manuals ({fieldTestProtocols.length})
          </button>
        </div>

        {/* ========================================================= */}
        {/*                       QUICK MODE                          */}
        {/* ========================================================= */}
        {mode === 'quick' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            
            {/* Cooper 12min Test */}
            <div className="space-y-4">
              <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                <CardHeader className="bg-muted border-b-2 border-border-heavy">
                  <CardTitle className="uppercase font-display font-black tracking-tight text-xl">Cooper 12-Minute Test</CardTitle>
                  <CardDescription className="text-xs font-medium text-muted-foreground">Estimate your peak oxygen carrying capacity and threshold running pace from a 12-minute run.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleCalculateCooper} className="space-y-4" noValidate>
                    <div className="space-y-2">
                      <Label htmlFor="cooperDistInput">Total Covered Distance (meters)</Label>
                      <Input id="cooperDistInput" type="number" step="10" value={cooperDist} onChange={e => setCooperDist(e.target.value)} required />
                    </div>
                    <ValidationMessage message={errorCooper} />
                    <div className="flex gap-2.5">
                      <Button type="submit" className="flex-1">Calculate Test Outputs</Button>
                      <Button type="button" variant="outline" onClick={() => { setCooperDist('2800'); setCooperResult(null); setCooperTrace(''); }} className="px-4">Reset</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {cooperResult && (
                <div className="space-y-4">
                  <ResultCard result={cooperResult} />
                  <Card class-new="true" className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                    <CardHeader className="p-4 border-b border-border bg-card">
                      <div className="text-[10px] font-bold tracking-widest text-primary uppercase">DETERMINISTIC FORMULA TRACE & EXPORT</div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <pre className="p-3 bg-muted border border-border text-[10px] font-mono whitespace-pre-wrap rounded text-foreground font-semibold leading-relaxed">
                        {cooperTrace}
                      </pre>
                      <div className="flex gap-1.5 justify-end">
                        <Button onClick={() => downloadFile(handleExportText('Cooper Test', cooperResult, cooperTrace), 'cooper_field_trial.txt', 'text/plain')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">TXT</Button>
                        <Button onClick={() => downloadFile(handleExportCSV('Cooper Test', cooperResult), 'cooper_field_trial.csv', 'text/csv')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">CSV</Button>
                        <Button onClick={() => downloadFile(handleExportJSON('Cooper Test', cooperResult, cooperTrace), 'cooper_field_trial.json', 'application/json')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">JSON</Button>
                        <Button onClick={() => navigator.clipboard.writeText(handleExportText('Cooper Test', cooperResult, cooperTrace))} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">Copy</Button>
                        <Button onClick={triggerPrint} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">Print</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* 20-Minute Threshold Test */}
            <div className="space-y-4">
              <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                <CardHeader className="bg-muted border-b-2 border-border-heavy">
                  <CardTitle className="uppercase font-display font-black tracking-tight text-xl">20-Min Threshold Test</CardTitle>
                  <CardDescription className="text-xs font-medium text-muted-foreground font-display">Estimate LTHR and Threshold Pace (ST) from a high-intensity 20-minute solo time trial.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleCalculateTwentyMin} className="space-y-4" noValidate>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="twentyMinDist">Trial Distance (meters)</Label>
                        <Input id="twentyMinDist" type="number" step="1" value={twentyMinDist} onChange={e => setTwentyMinDist(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="twentyMinAvgHR">Average Heart Rate (bpm)</Label>
                        <Input id="twentyMinAvgHR" type="number" step="1" value={twentyMinAvgHR} onChange={e => setTwentyMinAvgHR(e.target.value)} required />
                      </div>
                    </div>
                    <ValidationMessage message={errorTwentyMin} />
                    <div className="flex gap-2.5">
                      <Button type="submit" className="flex-1">Calculate Thresholds</Button>
                      <Button type="button" variant="outline" onClick={() => { setTwentyMinDist('4500'); setTwentyMinAvgHR('168'); setTwentyMinResult(null); setTwentyMinTrace(''); }} className="px-4">Reset</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {twentyMinResult && (
                <div className="space-y-4">
                  <ResultCard result={twentyMinResult} />
                  <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                    <CardHeader className="p-4 border-b border-border bg-card">
                      <div className="text-[10px] font-bold tracking-widest text-primary uppercase">DETERMINISTIC FORMULA TRACE & EXPORT</div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <pre className="p-3 bg-muted border border-border text-[10px] font-mono whitespace-pre-wrap rounded text-foreground font-semibold leading-relaxed">
                        {twentyMinTrace}
                      </pre>
                      <div className="flex gap-1.5 justify-end">
                        <Button onClick={() => downloadFile(handleExportText('20-Min Test', twentyMinResult, twentyMinTrace), 'twenty_min_field.txt', 'text/plain')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">TXT</Button>
                        <Button onClick={() => downloadFile(handleExportCSV('20-Min Test', twentyMinResult), 'twenty_min_field.csv', 'text/csv')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">CSV</Button>
                        <Button onClick={() => downloadFile(handleExportJSON('20-Min Test', twentyMinResult, twentyMinTrace), 'twenty_min_field.json', 'application/json')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">JSON</Button>
                        <Button onClick={() => navigator.clipboard.writeText(handleExportText('20-Min Test', twentyMinResult, twentyMinTrace))} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">Copy</Button>
                        <Button onClick={triggerPrint} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">Print</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* 30-Minute LTHR Test */}
            <div className="space-y-4">
              <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                <CardHeader className="bg-muted border-b-2 border-border-heavy">
                  <CardTitle className="uppercase font-display font-black tracking-tight text-xl">30-Minute LTHR Test</CardTitle>
                  <CardDescription className="text-xs font-medium text-muted-foreground font-display">Friel time-trial protocol to extract Lactate Threshold Heart Rate without lab blood kits.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleCalculateThirtyMin} className="space-y-4" noValidate>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="thirtyMinHR">Test Heart Rate (bpm)</Label>
                        <Input id="thirtyMinHR" type="number" step="1" value={thirtyMinHR} onChange={e => setThirtyMinHR(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="thirtyMinProtocol">Measuring Method</Label>
                        <Select id="thirtyMinProtocol" value={thirtyMinProtocol} onChange={e => setThirtyMinProtocol(e.target.value as any)}>
                          <option value="last20">Last 20 minutes (avg)</option>
                          <option value="full">Full 30 minutes (avg)</option>
                        </Select>
                      </div>
                    </div>
                    <ValidationMessage message={errorThirtyMin} />
                    <div className="flex gap-2.5">
                      <Button type="submit" className="flex-1">Estimate Joe Friel LTHR</Button>
                      <Button type="button" variant="outline" onClick={() => { setThirtyMinHR('172'); setThirtyMinProtocol('last20'); setThirtyMinResult(null); setThirtyMinTrace(''); }} className="px-4">Reset</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {thirtyMinResult && (
                <div className="space-y-4">
                  <ResultCard result={thirtyMinResult} />
                  <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                    <CardHeader className="p-4 border-b border-border bg-card">
                      <div className="text-[10px] font-bold tracking-widest text-primary uppercase">DETERMINISTIC FORMULA TRACE & EXPORT</div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <pre className="p-3 bg-muted border border-border text-[10px] font-mono whitespace-pre-wrap rounded text-foreground font-semibold leading-relaxed">
                        {thirtyMinTrace}
                      </pre>
                      <div className="flex gap-1.5 justify-end">
                        <Button onClick={() => downloadFile(handleExportText('30-Min Joe Friel LTHR', thirtyMinResult, thirtyMinTrace), 'thirty_min_lthr.txt', 'text/plain')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">TXT</Button>
                        <Button onClick={() => downloadFile(handleExportCSV('30-Min Joe Friel LTHR', thirtyMinResult), 'thirty_min_lthr.csv', 'text/csv')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">CSV</Button>
                        <Button onClick={() => downloadFile(handleExportJSON('30-Min Joe Friel LTHR', thirtyMinResult, thirtyMinTrace), 'thirty_min_lthr.json', 'application/json')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">JSON</Button>
                        <Button onClick={() => navigator.clipboard.writeText(handleExportText('30-Min Joe Friel LTHR', thirtyMinResult, thirtyMinTrace))} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">Copy</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* HR Recovery (HRR) Test */}
            <div className="space-y-4">
              <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                <CardHeader className="bg-muted border-b-2 border-border-heavy">
                  <CardTitle className="uppercase font-display font-black tracking-tight text-xl">Heart Rate Recovery (HRR)</CardTitle>
                  <CardDescription className="text-xs font-medium text-muted-foreground font-display">Examine HR recovery category (non-medical) by assessing your heart rate collapse during post-run rest.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleCalculateHrr} className="space-y-4" noValidate>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="hrrPeak">Peak HR (bpm)</Label>
                        <Input id="hrrPeak" type="number" step="1" value={hrrPeak} onChange={e => setHrrPeak(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hrr1Min">1-Min Drop HR</Label>
                        <Input id="hrr1Min" type="number" step="1" value={hrr1Min} onChange={e => setHrr1Min(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hrr2Min">2-Min Drop HR</Label>
                        <Input id="hrr2Min" type="number" step="1" value={hrr2Min} onChange={e => setHrr2Min(e.target.value)} required />
                      </div>
                    </div>
                    <ValidationMessage message={errorHrr} />
                    <div className="flex gap-2.5">
                      <Button type="submit" className="flex-1">Calculate HR Recovery Drop</Button>
                      <Button type="button" variant="outline" onClick={() => { setHrrPeak('180'); setHrr1Min('142'); setHrr2Min('120'); setHrrResult(null); setHrrTrace(''); }} className="px-4">Reset</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {hrrResult && (
                <div className="space-y-4">
                  <ResultCard result={hrrResult} />
                  
                  {/* REAL DATA BAR CHART FOR HR RECOVERY */}
                  <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)] font-sans">
                    <CardHeader className="p-4 border-b border-border bg-card">
                      <div className="text-[10px] font-bold tracking-widest text-primary uppercase">Heart Rate Recovery Curve</div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="h-44 w-full text-xs">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={recoveryChartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fill: '#71717a' }} />
                            <YAxis domain={['dataMin - 10', 'dataMax + 10']} tick={{ fill: '#71717a' }} />
                            <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #71717a' }} />
                            <Bar dataKey="value" name="Heart Rate (bpm)" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                              <Cell fill="#ef4444" />
                              <Cell fill="#eab308" />
                              <Cell fill="#22c55e" />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                    <CardHeader className="p-4 border-b border-border bg-card">
                      <div className="text-[10px] font-bold tracking-widest text-primary uppercase">DETERMINISTIC FORMULA TRACE & EXPORT</div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <pre className="p-3 bg-muted border border-border text-[10px] font-mono whitespace-pre-wrap rounded text-foreground font-semibold leading-relaxed">
                        {hrrTrace}
                      </pre>
                      <div className="flex gap-1.5 justify-end">
                        <Button onClick={() => downloadFile(handleExportText('HR Recovery', hrrResult, hrrTrace), 'hr_recovery.txt', 'text/plain')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">TXT</Button>
                        <Button onClick={() => downloadFile(handleExportCSV('HR Recovery', hrrResult), 'hr_recovery.csv', 'text/csv')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">CSV</Button>
                        <Button onClick={() => downloadFile(handleExportJSON('HR Recovery', hrrResult, hrrTrace), 'hr_recovery.json', 'application/json')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">JSON</Button>
                        <Button onClick={() => navigator.clipboard.writeText(handleExportText('HR Recovery', hrrResult, hrrTrace))} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">Copy</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/*                     ADVANCED MODE                         */}
        {/* ========================================================= */}
        {mode === 'advanced' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
            
            {/* Sweat Rate Test */}
            <div className="space-y-4">
              <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                <CardHeader className="bg-muted border-b-2 border-border-heavy">
                  <CardTitle className="uppercase font-display font-black tracking-tight text-xl">Sweat Rate Calibration</CardTitle>
                  <CardDescription className="text-xs font-medium text-muted-foreground">Calculate fluid loss per hour to avoid extreme hydration drift or high fatigue load caution states.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleCalculateSweat} className="space-y-4" noValidate>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sweatPre">Body Mass Before Run (kg)</Label>
                        <Input id="sweatPre" type="number" step="0.01" value={sweatPre} onChange={e => setSweatPre(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sweatPost">Body Mass After Run (kg)</Label>
                        <Input id="sweatPost" type="number" step="0.01" value={sweatPost} onChange={e => setSweatPost(e.target.value)} required />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="sweatFluid">Fluids Ingested (Liters)</Label>
                        <Input id="sweatFluid" type="number" step="0.005" value={sweatFluid} onChange={e => setSweatFluid(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sweatUrine">Urine Released (Liters)</Label>
                        <Input id="sweatUrine" type="number" step="0.005" value={sweatUrine} onChange={e => setSweatUrine(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sweatDur">Workout Hours (hrs)</Label>
                        <Input id="sweatDur" type="number" step="0.1" value={sweatDur} onChange={e => setSweatDur(e.target.value)} required />
                      </div>
                    </div>

                    <ValidationMessage message={errorSweat} />
                    <div className="flex gap-2.5">
                      <Button type="submit" className="flex-1">Calculate Sweat Index</Button>
                      <Button type="button" variant="outline" onClick={() => { setSweatPre('75.2'); setSweatPost('74.5'); setSweatFluid('0.500'); setSweatUrine('0.100'); setSweatDur('1.0'); setSweatResult(null); setSweatTrace(''); }} className="px-4">Reset</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {sweatResult && (
                <div className="space-y-4">
                  <ResultCard result={sweatResult} />
                  
                  {/* REAL DATA CHART OR STATS RECHART */}
                  <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)] font-sans">
                    <CardHeader className="p-4 border-b border-border bg-card">
                      <div className="text-[10px] font-bold tracking-widest text-primary uppercase">Hydration Volume Balance (Liters)</div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="h-40 w-full text-xs">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={sweatChartStats ? [
                            { name: 'Total Sweat Lost', value: parseFloat(sweatChartStats.sweatLossLiters.toFixed(3)), fill: '#3b82f6' },
                            { name: 'Fluid Input', value: sweatChartStats.fluidIntakeLiters, fill: '#22c55e' }
                          ] : []} layout="vertical" margin={{ top: 5, right: 10, left: 30, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" tick={{ fill: '#71717a' }} />
                            <YAxis dataKey="name" type="category" tick={{ fill: '#71717a' }} />
                            <Tooltip contentStyle={{ background: '#ffffff' }} />
                            <Bar dataKey="value" name="Volume (L)" radius={[0, 4, 4, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                    <CardHeader className="p-4 border-b border-border bg-card">
                      <div className="text-[10px] font-bold tracking-widest text-primary uppercase">DETERMINISTIC FORMULA TRACE & EXPORT</div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <pre className="p-3 bg-muted border border-border text-[10px] font-mono whitespace-pre-wrap rounded text-foreground font-semibold leading-relaxed">
                        {sweatTrace}
                      </pre>
                      <div className="flex gap-1.5 justify-end">
                        <Button onClick={() => downloadFile(handleExportText('Sweat Rate Test', sweatResult, sweatTrace), 'sweat_rate.txt', 'text/plain')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">TXT</Button>
                        <Button onClick={() => downloadFile(handleExportCSV('Sweat Rate Test', sweatResult), 'sweat_rate.csv', 'text/csv')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">CSV</Button>
                        <Button onClick={() => downloadFile(handleExportJSON('Sweat Rate Test', sweatResult, sweatTrace), 'sweat_rate.json', 'application/json')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">JSON</Button>
                        <Button onClick={() => navigator.clipboard.writeText(handleExportText('Sweat Rate Test', sweatResult, sweatTrace))} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">Copy</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Easy Run Decoupling (Cardiac Drift) */}
            <div className="space-y-4">
              <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                <CardHeader className="bg-muted border-b-2 border-border-heavy">
                  <CardTitle className="uppercase font-display font-black tracking-tight text-xl">Easy Run Decoupling (Drift)</CardTitle>
                  <CardDescription className="text-xs font-medium text-muted-foreground font-display">Contrast metabolic efficiency metrics between the first and second halves of steady runs.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleCalculateDrift} className="space-y-4" noValidate>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="driftHr1">1st Half Avg HR (bpm)</Label>
                        <Input id="driftHr1" type="number" step="1" value={driftHr1} onChange={e => setDriftHr1(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="driftSpeed1">1st Half Speed (km/h)</Label>
                        <Input id="driftSpeed1" type="number" step="0.1" value={driftSpeed1} onChange={e => setDriftSpeed1(e.target.value)} required />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-border pt-3">
                      <div className="space-y-2">
                        <Label htmlFor="driftHr2">2nd Half Avg HR (bpm)</Label>
                        <Input id="driftHr2" type="number" step="1" value={driftHr2} onChange={e => setDriftHr2(e.target.value)} required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="driftSpeed2">2nd Half Speed (km/h)</Label>
                        <Input id="driftSpeed2" type="number" step="0.1" value={driftSpeed2} onChange={e => setDriftSpeed2(e.target.value)} required />
                      </div>
                    </div>

                    <ValidationMessage message={errorDrift} />
                    <div className="flex gap-2.5">
                      <Button type="submit" className="flex-1">Calculate Decoupling</Button>
                      <Button type="button" variant="outline" onClick={() => { setDriftHr1('140'); setDriftSpeed1('11.5'); setDriftHr2('148'); setDriftSpeed2('11.5'); setDriftResult(null); setDriftTrace(''); }} className="px-4">Reset</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {driftResult && (
                <div className="space-y-4">
                  <ResultCard result={driftResult} />
                  <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                    <CardHeader className="p-4 border-b border-border bg-card">
                      <div className="text-[10px] font-bold tracking-widest text-primary uppercase">DETERMINISTIC FORMULA TRACE & EXPORT</div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <pre className="p-3 bg-muted border border-border text-[10px] font-mono whitespace-pre-wrap rounded text-foreground font-semibold leading-relaxed">
                        {driftTrace}
                      </pre>
                      <div className="flex gap-1.5 justify-end">
                        <Button onClick={() => downloadFile(handleExportText('Easy Run Drift', driftResult, driftTrace), 'cardiac_drift.json', 'application/json')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">JSON</Button>
                        <Button onClick={() => navigator.clipboard.writeText(handleExportText('Easy Run Drift', driftResult, driftTrace))} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">Copy</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Cadence & Biomechanics Test */}
            <div className="space-y-4">
              <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                <CardHeader className="bg-muted border-b-2 border-border-heavy">
                  <CardTitle className="uppercase font-display font-black tracking-tight text-xl">Cadence & Biomechanics</CardTitle>
                  <CardDescription className="text-xs font-medium text-muted-foreground font-display">Audit exact running cadence strides/min and average stride length in meters.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleCalculateCad} className="space-y-4" noValidate>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2 col-span-1">
                        <Label htmlFor="cadSteps">Counted Steps</Label>
                        <Input id="cadSteps" type="number" step="10" value={cadSteps} onChange={e => setCadSteps(e.target.value)} required />
                      </div>
                      <div className="space-y-2 col-span-1">
                        <Label htmlFor="cadDist">Distance (m)</Label>
                        <Input id="cadDist" type="number" step="10" value={cadDist} onChange={e => setCadDist(e.target.value)} required />
                      </div>
                      <div className="space-y-2 col-span-1">
                        <Label htmlFor="cadSecs">Duration (secs)</Label>
                        <Input id="cadSecs" type="number" step="1" value={cadSecs} onChange={e => setCadSecs(e.target.value)} required />
                      </div>
                    </div>
                    <ValidationMessage message={errorCad} />
                    <div className="flex gap-2.5">
                      <Button type="submit" className="flex-1">Calculate Biomechanics</Button>
                      <Button type="button" variant="outline" onClick={() => { setCadSteps('1800'); setCadDist('1609'); setCadSecs('480'); setCadResult(null); setCadTrace(''); }} className="px-4">Reset</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {cadResult && (
                <div className="space-y-4">
                  <ResultCard result={cadResult} />
                  <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                    <CardHeader className="p-4 border-b border-border bg-card">
                      <div className="text-[10px] font-bold tracking-widest text-primary uppercase">DETERMINISTIC FORMULA TRACE & EXPORT</div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <pre className="p-3 bg-muted border border-border text-[10px] font-mono whitespace-pre-wrap rounded text-foreground font-semibold leading-relaxed">
                        {cadTrace}
                      </pre>
                      <div className="flex gap-1.5 justify-end">
                        <Button onClick={() => downloadFile(handleExportText('Cadence Test', cadResult, cadTrace), 'biomechanics.txt', 'text/plain')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">TXT</Button>
                        <Button onClick={() => downloadFile(handleExportCSV('Cadence Test', cadResult), 'biomechanics.csv', 'text/csv')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">CSV</Button>
                        <Button onClick={() => downloadFile(handleExportJSON('Cadence Test', cadResult, cadTrace), 'biomechanics.json', 'application/json')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto font-mono">JSON</Button>
                        <Button onClick={() => navigator.clipboard.writeText(handleExportText('Cadence Test', cadResult, cadTrace))} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">Copy</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            {/* Treadmill Calibration Test */}
            <div className="space-y-4">
              <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                <CardHeader className="bg-muted border-b-2 border-border-heavy">
                  <CardTitle className="uppercase font-display font-black tracking-tight text-xl">Treadmill Calibration</CardTitle>
                  <CardDescription className="text-xs font-medium text-muted-foreground font-display">Verify the speedometer accuracy ratio of standard treadmill belts.</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleCalculateCal} className="space-y-4" noValidate>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="calMeasured">Measured Distance (meters)</Label>
                        <Input id="calMeasured" type="number" step="1" value={calMeasured} onChange={e => setCalMeasured(e.target.value)} required />
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Usually counted physically using wheels.</div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="calTreadmill">Treadmill Reading (meters)</Label>
                        <Input id="calTreadmill" type="number" step="1" value={calTreadmill} onChange={e => setCalTreadmill(e.target.value)} required />
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">The scale distance reported inside treadmill dial display.</div>
                      </div>
                    </div>
                    <ValidationMessage message={errorCal} />
                    <div className="flex gap-2.5">
                      <Button type="submit" className="flex-1">Calculate Calibration Offset</Button>
                      <Button type="button" variant="outline" onClick={() => { setCalMeasured('5000'); setCalTreadmill('5150'); setCalResult(null); setCalTrace(''); }} className="px-4">Reset</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {calResult && (
                <div className="space-y-4">
                  <ResultCard result={calResult} />
                  <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                    <CardHeader className="p-4 border-b border-border bg-card">
                      <div className="text-[10px] font-bold tracking-widest text-primary uppercase">DETERMINISTIC FORMULA TRACE & EXPORT</div>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <pre className="p-3 bg-muted border border-border text-[10px] font-mono whitespace-pre-wrap rounded text-foreground font-semibold leading-relaxed">
                        {calTrace}
                      </pre>
                      <div className="flex gap-1.5 justify-end">
                        <Button onClick={() => downloadFile(handleExportText('Treadmill Calibration', calResult, calTrace), 'treadmill_cal.txt', 'text/plain')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">TXT</Button>
                        <Button onClick={() => downloadFile(handleExportCSV('Treadmill Calibration', calResult), 'treadmill_cal.csv', 'text/csv')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto font-sans">CSV</Button>
                        <Button onClick={() => downloadFile(handleExportJSON('Treadmill Calibration', calResult, calTrace), 'treadmill_cal.json', 'application/json')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">JSON</Button>
                        <Button onClick={() => navigator.clipboard.writeText(handleExportText('Treadmill Calibration', calResult, calTrace))} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">Copy</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ========================================================= */}
        {/*                     PROTOCOLS MODE                        */}
        {/* ========================================================= */}
        {mode === 'protocols' && (
          <div className="space-y-6">
            {!selectedProtocolId ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                
                {/* SEARCH PANEL */}
                <div className="lg:col-span-4 p-6 border-2 border-border-heavy bg-card rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)] space-y-4">
                  <div className="flex justify-between items-center pb-2 border-b">
                    <span className="font-display font-black text-xs uppercase tracking-widest text-zinc-700 flex items-center gap-1.5">
                      <SlidersHorizontal className="w-4 h-4 text-primary" /> PROTOCOL SEARCH
                    </span>
                    <button onClick={() => { setProtocolSearch(''); setProtocolTypeFilter('all'); }} className="text-[10px] font-black uppercase text-muted-foreground hover:text-foreground">
                      Reset
                    </button>
                  </div>

                  <div className="space-y-1">
                    <Label>Keyword Query</Label>
                    <div className="relative">
                      <Input
                        type="text"
                        placeholder="e.g. cooper, threshold..."
                        value={protocolSearch}
                        onChange={e => setProtocolSearch(e.target.value)}
                        className="pl-10 text-xs"
                      />
                      <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Protocol Category</Label>
                    <Select value={protocolTypeFilter} onChange={e => setProtocolTypeFilter(e.target.value)} className="text-xs">
                      <option value="all">All Test Types</option>
                      <option value="metabolic">Metabolic / VO2</option>
                      <option value="threshold">Threshold Limits</option>
                      <option value="cardiac">Cardiac / Heart Rate</option>
                      <option value="physiological">Physiological Capacity</option>
                      <option value="calibration">Treadmill & Gear</option>
                    </Select>
                  </div>
                </div>

                {/* PROTOCOL LIST */}
                <div className="lg:col-span-8 space-y-4">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
                      Showing {
                        fieldTestProtocols.filter(p => {
                          const matchesSearch = p.name.toLowerCase().includes(protocolSearch.toLowerCase()) ||
                            p.purpose.toLowerCase().includes(protocolSearch.toLowerCase()) ||
                            p.testType.toLowerCase().includes(protocolSearch.toLowerCase());
                          const matchesType = protocolTypeFilter === 'all' || p.testType.toLowerCase().includes(protocolTypeFilter.toLowerCase()) || p.purpose.toLowerCase().includes(protocolTypeFilter.toLowerCase());
                          return matchesSearch && matchesType;
                        }).length
                      } of {fieldTestProtocols.length} Manual Reference Guides
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fieldTestProtocols.filter(p => {
                      const matchesSearch = p.name.toLowerCase().includes(protocolSearch.toLowerCase()) ||
                        p.purpose.toLowerCase().includes(protocolSearch.toLowerCase()) ||
                        p.testType.toLowerCase().includes(protocolSearch.toLowerCase());
                      const matchesType = protocolTypeFilter === 'all' || p.testType.toLowerCase().includes(protocolTypeFilter.toLowerCase()) || p.purpose.toLowerCase().includes(protocolTypeFilter.toLowerCase());
                      return matchesSearch && matchesType;
                    }).map(protocol => (
                      <div key={protocol.id} className="border-2 border-border-heavy bg-white rounded-xl shadow-[2.5px_2.5px_0px_rgba(23,23,23,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_rgba(23,23,23,1)] transition-all flex flex-col justify-between overflow-hidden">
                        <div className="bg-muted p-4 border-b-2 border-border-heavy flex justify-between items-start">
                          <div>
                            <h4 className="font-display font-black text-sm uppercase text-zinc-800 leading-tight">{protocol.name}</h4>
                            <span className="text-[9px] font-mono font-bold uppercase text-primary tracking-widest bg-white border px-1.5 py-0.5 rounded block mt-1.5 w-max">
                              {protocol.testType.toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                          <p className="text-xs text-zinc-550 leading-relaxed line-clamp-3">
                            {protocol.purpose}
                          </p>
                          <div className="pt-2 border-t border-neutral-100 flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setSelectedProtocolId(protocol.id)}
                              className="w-full text-xs font-extrabold h-9"
                            >
                              OPEN PROTOCOL GUIDE
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (() => {
              const protocol = fieldTestProtocols.find(p => p.id === selectedProtocolId);
              if (!protocol) return null;
              
              const handleCopyInstructions = () => {
                const text = 
                  `PROTOCOL: ${protocol.name}\n` +
                  `PURPOSE: ${protocol.purpose}\n\n` +
                  `STEPS:\n` + protocol.protocolSteps.map((s, idx) => `${idx + 1}. ${s}`).join('\n') + `\n\n` +
                  `SAFETY WARNINGS:\n` + protocol.safetyNotes.join('\n');
                
                navigator.clipboard.writeText(text);
                setProtocolCopyStatus('Copied to Clipboard!');
                setTimeout(() => setProtocolCopyStatus(null), 2000);
              };

              return (
                <div className="space-y-6">
                  <Button variant="outline" onClick={() => setSelectedProtocolId(null)} className="text-xs">
                    ← Back to Protocols Gallery
                  </Button>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    
                    {/* DETAILS CARD */}
                    <div className="lg:col-span-7 border-2 border-border-heavy bg-white rounded-xl shadow-[4px_4px_0px_rgba(23,23,23,1)] overflow-hidden space-y-6 p-6">
                      
                      <div>
                        <span className="px-2 py-0.5 bg-neutral-900 text-white rounded text-[8px] font-bold uppercase tracking-widest block w-max">
                          {protocol.testType.toUpperCase()} MANUAL
                        </span>
                        <h3 className="font-display font-black text-2xl text-zinc-800 uppercase mt-2">{protocol.name}</h3>
                        <p className="text-xs text-zinc-550 italic leading-relaxed mt-1.5">{protocol.purpose}</p>
                      </div>

                      {/* Best used and relative limitations */}
                      <div className="grid grid-cols-2 gap-4 text-xs font-sans">
                        <div className="p-3 bg-emerald-50 text-emerald-950 border border-emerald-100 rounded-lg">
                          <strong className="block text-[8px] font-bold uppercase tracking-wider text-emerald-800 mb-1">Recommended Audience:</strong>
                          {protocol.bestUsedFor}
                        </div>
                        <div className="p-3 bg-red-50 text-red-950 border border-red-150 rounded-lg">
                          <strong className="block text-[8px] font-bold uppercase tracking-wider text-red-800 mb-1">Inherent Pitfalls / Avoid:</strong>
                          {protocol.notIdealFor}
                        </div>
                      </div>

                      {/* Checklist parameters */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest block">Required Inputs Checklist:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {protocol.requiredInputs.map(inp => (
                            <span key={inp.key} className="px-2 py-1 bg-zinc-100 border text-zinc-700 rounded text-[10px] font-mono uppercase font-bold flex items-center gap-1">
                              <ClipboardList className="w-3.5 h-3.5 text-primary" /> {inp.label} {inp.unit ? `(${inp.unit})` : ''}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Chronological Protocol Steps */}
                      <div className="space-y-4 pt-2">
                        <span className="font-display font-black text-xs uppercase tracking-widest text-zinc-700 flex items-center gap-1.5 border-b pb-1">
                          <ClipboardList className="w-4 h-4 text-primary" /> TEST STEPS CHRONOLOGICAL ORDER
                        </span>
                        <div className="space-y-3">
                          {protocol.protocolSteps.map((step, idx) => (
                            <div key={idx} className="flex gap-3 text-xs leading-relaxed items-start">
                              <span className="px-2 py-0.5 bg-primary text-primary-foreground font-mono font-black rounded text-[10px] shrink-0">
                                {idx + 1}
                              </span>
                              <p className="text-zinc-805 font-medium">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                    {/* ACTIONS & EXCULPATIONS */}
                    <div className="lg:col-span-5 space-y-6">
                      
                      {/* Safety & Compliance Card */}
                      <div className="p-5 border-2 border-dashed border-red-400 bg-red-50/50 text-red-950 rounded-xl space-y-3">
                        <div className="flex items-center gap-1.5 text-red-800">
                          <ShieldAlert className="w-5 h-5 shrink-0" />
                          <strong className="text-xs uppercase tracking-wider font-extrabold font-display">SAFETY AND STRESS LABELS</strong>
                        </div>
                        <div className="space-y-2 text-xs leading-relaxed">
                          {protocol.safetyNotes.map((note, idx) => (
                            <div key={idx} className="flex gap-2 items-start">
                              <span className="text-red-500 font-bold shrink-0">•</span>
                              <p className="text-zinc-850 font-medium">{note}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Scientific Transparency and Limitations */}
                      <div className="p-5 border-2 border-border-heavy bg-white rounded-xl shadow-[4px_4px_0px_rgba(23,23,23,1)] space-y-4">
                        <span className="block text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500">Traceability & Limitations Matrix:</span>
                        <div className="space-y-4 font-mono text-[10px] leading-relaxed text-zinc-650">
                          <div>
                            <strong className="text-foreground block font-sans text-[8px] uppercase mb-0.5">Confidence Level:</strong>
                            <span className="font-sans font-bold text-zinc-800 bg-neutral-100 px-1.5 py-0.5 rounded">{protocol.confidenceLabel}</span>
                          </div>
                          <div>
                            <strong className="text-foreground block font-sans text-[8px] uppercase mb-0.5">Physical Limitations / Inaccuracies:</strong>
                            {protocol.limitation}
                          </div>
                          <div>
                            <strong className="text-foreground block font-sans text-[8px] uppercase mb-0.5">Interactions / Associated Calculators:</strong>
                            <span className="flex flex-wrap gap-1 mt-1">
                              {protocol.relatedModules.map(mod => {
                                const matchedMethod = methodRegistry.find(m => m.id === mod || (m.category === mod));
                                return (
                                  <span key={mod} className="bg-zinc-100 border border-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded leading-none text-[8px] font-bold">
                                    ⚙️ {matchedMethod?.name || mod.toUpperCase()}
                                  </span>
                                );
                              })}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2">
                          <Button onClick={handleCopyInstructions} className="w-full text-xs font-black uppercase">
                            <Copy className="w-4 h-4 mr-2" /> {protocolCopyStatus || 'COPY PROTOCOL GUIDE'}
                          </Button>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Dynamic Disclaimer Card */}
        <div className="p-4 bg-white border-2 border-border-heavy rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)] text-xs text-muted-foreground font-medium leading-relaxed uppercase">
          <span className="font-bold text-foreground block mb-2 tracking-wide text-xs">⚠️ HEALTH DRIFT AND MECHANICAL STRESS CAUTION</span>
          Physical field endurance tests place high cardiovascular, respiratory, and musculoskeletal strain on athletes. Track.Lab deterministic model metrics represent statistical linear approximations of threshold bounds and HR response estimates. They are intended solely for coaching education, and under no circumstances correspond to medical guidance, clinical diagnoses, or injury prognosis metrics. Practice self-awareness during all field protocols.
        </div>

      </div>
    </CalculatorPageShell>
  );
}

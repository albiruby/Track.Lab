'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input, Label, Button, Select, ValidationMessage } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { LabPageHeader } from '@/components/layout/LabPageHeader';
import {
  estimateVO2Cooper12,
  estimateVO2From15Mile,
  estimateVO2Rockport,
  calculateACSMRunningVO2,
  calculateACSMWalkingVO2,
  calculateMETFromVO2,
  calculateCaloriesFromMET,
  calculateCaloriesPerKm,
  calculateCaloriesPerHour,
  calculateEnergyCostPerKm,
  calculateVO2Reserve,
  calculatePercentVO2max,
  calculateGradeImpactVO2,
  calculateSpeedToVO2Table
} from '@/lib/calculators_pack/metabolicSystem';
import { methodRegistry } from '@/data';
import { CalculatorResult } from '@/types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const SPEED_RANGE_KMH = [6, 8, 10, 12, 14, 16, 18];

export default function Vo2Page() {
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick');

  // --- SAVED ACTIVE VO2 STATE (Integrates Field with Lab) ---
  const [activeVO2max, setActiveVO2max] = useState<number>(45.0);
  const [activeVO2Source, setActiveVO2Source] = useState<string>('Default Baseline');

  // --- QUICK MODE STATES ---
  // Cooper
  const [cooperDist, setCooperDist] = useState('2800');
  const [cooperResult, setCooperResult] = useState<CalculatorResult<string> | null>(null);
  const [cooperTrace, setCooperTrace] = useState<string>('');
  const [errorCooper, setErrorCooper] = useState<string | null>(null);

  // 1.5-Mile Run
  const [mileTimeMins, setMileTimeMins] = useState('11');
  const [mileTimeSecs, setMileTimeSecs] = useState('30');
  const [mileResult, setMileResult] = useState<CalculatorResult<string> | null>(null);
  const [mileTrace, setMileTrace] = useState<string>('');
  const [errorMile, setErrorMile] = useState<string | null>(null);

  // Rockport Walk
  const [rockAge, setRockAge] = useState('35');
  const [rockSex, setRockSex] = useState<'male' | 'female'>('male');
  const [rockWeight, setRockWeight] = useState('75'); // kg
  const [rockMins, setRockMins] = useState('14');
  const [rockSecs, setRockSecs] = useState('20');
  const [rockHR, setRockHR] = useState('130');
  const [rockResult, setRockResult] = useState<CalculatorResult<string> | null>(null);
  const [rockTrace, setRockTrace] = useState<string>('');
  const [errorRock, setErrorRock] = useState<string | null>(null);

  // Manual Input
  const [manualDeviceVO2, setManualDeviceVO2] = useState('44.5');
  const [manualLabVO2, setManualLabVO2] = useState('48.2');
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // --- ADVANCED MODE STATES ---
  // ACSM VO2 Estimator
  const [acsmSpeedInputType, setAcsmSpeedInputType] = useState<'mps' | 'kmh' | 'pase'>('kmh');
  const [acsmSpeedValue, setAcsmSpeedValue] = useState('12'); // or "5:00" etc.
  const [acsmGrade, setAcsmGrade] = useState('1.5'); // %
  const [acsmProtocol, setAcsmProtocol] = useState<'running' | 'walking'>('running');
  const [acsmResult, setAcsmResult] = useState<CalculatorResult<any> | null>(null);
  const [acsmRawVO2, setAcsmRawVO2] = useState<number | null>(null);
  const [acsmTrace, setAcsmTrace] = useState<string>('');
  const [errorAcsm, setErrorAcsm] = useState<string | null>(null);

  // Metabolic Cost Calculator
  const [metMass, setMetMass] = useState('70'); // kg
  const [metDuration, setMetDuration] = useState('45'); // min
  const [metVO2Type, setMetVO2Type] = useState<'active' | 'custom'>('active');
  const [metCustomVO2, setMetCustomVO2] = useState('40.0');
  const [metResult, setMetResult] = useState<CalculatorResult<any> | null>(null);
  const [metTrace, setMetTrace] = useState<string>('');
  const [errorMet, setErrorMet] = useState<string | null>(null);

  // Speed-to-Vo2 Table/Chart
  const [tableGrade, setTableGrade] = useState('1.0'); // %
  const [tableProtocol, setTableProtocol] = useState<'running' | 'walking'>('running');

  // --- HELPERS ---
  const convertPaceToMpm = (paceStr: string): number => {
    // converts "M:S" pace (per km) to meters per minute
    const parts = paceStr.split(':');
    const mins = parseInt(parts[0], 10);
    const secs = parts[1] ? parseInt(parts[1], 10) : 0;
    if (isNaN(mins)) return 0;
    const totalSecondsPerKm = mins * 60 + secs;
    if (totalSecondsPerKm <= 0) return 0;
    // Speed in km/h = 3600 / totalSecondsPerKm
    const kmh = 3600 / totalSecondsPerKm;
    // Speed in m/min = (kmh * 1000) / 60
    return (kmh * 1000) / 60;
  };

  const getMpmFromSpeedInput = (type: 'mps' | 'kmh' | 'pase', valStr: string): number => {
    const val = parseFloat(valStr);
    if (type === 'mps') {
      if (isNaN(val) || val <= 0) return 0;
      return val * 60; // m/s to m/yd
    } else if (type === 'kmh') {
      if (isNaN(val) || val <= 0) return 0;
      return (val * 1000) / 60; // km/h to m/min
    } else {
      return convertPaceToMpm(valStr);
    }
  };

  // --- ACTIONS ---
  // Save Active VO2max
  const handleSaveActiveVO2 = (vo2: number, sourceName: string) => {
    if (vo2 > 0 && vo2 < 100) {
      setActiveVO2max(vo2);
      setActiveVO2Source(sourceName);
      setSaveMessage(`Active VO2max loaded from ${sourceName}: ${vo2.toFixed(1)} ml/kg/min`);
      setTimeout(() => setSaveMessage(null), 5000);
    }
  };

  // Cooper Calculations
  const calculateCooper = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCooper(null);
    try {
      const dist = parseFloat(cooperDist);
      if (isNaN(dist) || dist <= 504.9) {
        return setErrorCooper('Distance must be greater than 504.9m (BMR cutoff).');
      }

      const vo2 = estimateVO2Cooper12(dist);
      const methodMeta = methodRegistry.find((m) => m.id === 'cooper_12min_vo2') || {
        name: 'Cooper Estimator',
        formulaDisplay: 'VO2max = (Distance - 504.9) / 44.73',
        limitations: []
      };

      setCooperTrace(
        `Step 1: Input Distance = ${dist} m\n` +
        `Step 2: Apply Cooper Formula: (Distance - 504.9) / 44.73\n` +
        `Step 3: (${dist} - 504.9) / 44.73 = ${vo2.toFixed(4)}\n` +
        `Step 4: Round to 1 decimal place = ${vo2.toFixed(1)} ml/kg/min`
      );

      setCooperResult({
        result: vo2.toFixed(1) + ' ml/kg/min',
        inputUsed: { 'Cooper 12-Min Distance': dist + ' m' },
        methodSelected: methodMeta.name,
        formulaUsed: methodMeta.formulaDisplay,
        confidenceLabel: 'Field-Test Estimate',
        limitations: 'Indirect estimate based on model assumption. ' + methodMeta.limitations?.join(' ')
      });
    } catch (err: any) {
      setErrorCooper(err.message);
    }
  };

  // 1.5-Mile Calculations
  const calculateMile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMile(null);
    try {
      const mins = parseFloat(mileTimeMins);
      const secs = parseFloat(mileTimeSecs);
      if (isNaN(mins) || mins < 0 || isNaN(secs) || secs < 0 || secs >= 60) {
        return setErrorMile('Please enter valid minutes and seconds.');
      }
      const totalSecs = mins * 60 + secs;
      if (totalSecs <= 120) {
        return setErrorMile('Duration must be greater than 2 minutes.');
      }

      const vo2 = estimateVO2From15Mile(totalSecs);
      const methodMeta = methodRegistry.find((m) => m.id === 'one_five_mile_vo2') || {
        name: '1.5-Mile Run Formula',
        formulaDisplay: 'VO2max = 3.5 + 483 / Time_minutes',
        limitations: []
      };

      setMileTrace(
        `Step 1: Time = ${mins}m ${secs}s -> ${totalSecs} seconds\n` +
        `Step 2: Convert to minutes: ${totalSecs} / 60 = ${(totalSecs / 60).toFixed(4)} mins\n` +
        `Step 3: Apply 1.5-Mile Formula: 3.5 + 483 / mins\n` +
        `Step 4: 3.5 + 483 / ${(totalSecs / 60).toFixed(4)} = ${vo2.toFixed(4)}\n` +
        `Step 5: Round to 1 decimal place = ${vo2.toFixed(1)} ml/kg/min`
      );

      setMileResult({
        result: vo2.toFixed(1) + ' ml/kg/min',
        inputUsed: { '1.5-Mile Time': `${mins}:${secs.toString().padStart(2, '0')}` },
        methodSelected: methodMeta.name,
        formulaUsed: methodMeta.formulaDisplay,
        confidenceLabel: 'Field-Test Estimate',
        limitations: 'Indirect estimate. ' + methodMeta.limitations?.join(' ')
      });
    } catch (err: any) {
      setErrorMile(err.message);
    }
  };

  // Rockport Calculations
  const calculateRockport = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorRock(null);
    try {
      const age = parseInt(rockAge, 10);
      const weight = parseFloat(rockWeight);
      const mins = parseFloat(rockMins);
      const secs = parseFloat(rockSecs);
      const hr = parseFloat(rockHR);

      if (isNaN(age) || age <= 0) return setErrorRock('Invalid age.');
      if (isNaN(weight) || weight <= 0) return setErrorRock('Invalid body weight.');
      if (isNaN(mins) || mins < 0 || isNaN(secs) || secs < 0 || secs >= 60) {
        return setErrorRock('Invalid duration.');
      }
      if (isNaN(hr) || hr <= 50) return setErrorRock('Please enter an accurate post-exercise heart rate (>50 bpm).');

      const totalSecs = mins * 60 + secs;
      const vo2 = estimateVO2Rockport(age, rockSex, weight, totalSecs, hr);
      const methodMeta = methodRegistry.find((m) => m.id === 'rockport_vo2') || {
        name: 'Rockport Walk Formula',
        formulaDisplay: 'VO2max = 132.853 - 0.0769W_lbs - 0.3877Age + 6.315Sex - 3.2649Time_mins - 0.1565HR',
        limitations: []
      };

      const sexVal = rockSex === 'male' ? 1 : 0;
      const weightLbs = weight * 2.20462;
      const timeMins = totalSecs / 60;

      setRockTrace(
        `Step 1: Inputs -> Age = ${age}, Weight = ${weight} kg (${weightLbs.toFixed(1)} lbs), Sex = ${rockSex} (${sexVal}), Time = ${timeMins.toFixed(3)} mins, HR = ${hr} bpm\n` +
        `Step 2: Linear components:\n` +
        `  - Weight impact: -0.0769 × ${weightLbs.toFixed(1)} = ${(-0.0769 * weightLbs).toFixed(3)}\n` +
        `  - Age impact: -0.3877 × ${age} = ${(-0.3877 * age).toFixed(3)}\n` +
        `  - Sex bonus: +6.315 × ${sexVal} = ${6.315 * sexVal}\n` +
        `  - Time penalty: -3.2649 × ${timeMins.toFixed(3)} = ${(-3.2649 * timeMins).toFixed(3)}\n` +
        `  - HR penalty: -0.1565 × ${hr} = ${(-0.1565 * hr).toFixed(3)}\n` +
        `Step 3: Combine with constant (132.853) = ${vo2.toFixed(4)}\n` +
        `Step 4: Round to 1 decimal place = ${vo2.toFixed(1)} ml/kg/min`
      );

      setRockResult({
        result: Math.max(0, vo2).toFixed(1) + ' ml/kg/min',
        inputUsed: {
          'Age': age,
          'Sex': rockSex,
          'Weight': weight + ' kg',
          'Finish Time': `${mins}:${secs.toString().padStart(2, '0')}`,
          'Post-Walk HR': hr + ' bpm'
        },
        methodSelected: methodMeta.name,
        formulaUsed: methodMeta.formulaDisplay,
        confidenceLabel: 'Submaximal Field Estimate',
        limitations: 'Indirect estimation. ' + methodMeta.limitations?.join(' ')
      });
    } catch (err: any) {
      setErrorRock(err.message);
    }
  };

  // ACSM Calculations
  const calculateAcsm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorAcsm(null);
    try {
      const mpm = getMpmFromSpeedInput(acsmSpeedInputType, acsmSpeedValue);
      const grade = parseFloat(acsmGrade);

      if (mpm <= 0) return setErrorAcsm('Please enter a valid forward speed.');
      if (isNaN(grade) || grade < 0) return setErrorAcsm('Treadmill gradient must be positive/neutral.');

      const gradeDecimal = grade / 100;
      const isRunning = acsmProtocol === 'running';
      const vo2 = isRunning
        ? calculateACSMRunningVO2(mpm, gradeDecimal)
        : calculateACSMWalkingVO2(mpm, gradeDecimal);
      const met = calculateMETFromVO2(vo2);

      const methodId = isRunning ? 'acsm_running_vo2' : 'acsm_walking_vo2';
      const methodMeta = methodRegistry.find((m) => m.id === methodId) || {
        name: isRunning ? 'ACSM Run Equation' : 'ACSM Walk Equation',
        formulaDisplay: isRunning ? 'VO2 = 0.2 × S + 0.9 × S × G + 3.5' : 'VO2 = 0.1 × S + 1.8 × S × G + 3.5',
        limitations: []
      };

      setAcsmTrace(
        `Step 1: Translated Speed = ${mpm.toFixed(1)} m/min, Grade = ${grade}% (${gradeDecimal} decimal)\n` +
        `Step 2: Linear components:\n` +
        `  - Horizontal: ${isRunning ? '0.2' : '0.1'} × ${mpm.toFixed(1)} = ${(isRunning ? 0.2 * mpm : 0.1 * mpm).toFixed(2)}\n` +
        `  - Vertical: ${isRunning ? '0.9' : '1.8'} × ${mpm.toFixed(1)} × ${gradeDecimal} = ${(isRunning ? 0.9 * mpm * gradeDecimal : 1.8 * mpm * gradeDecimal).toFixed(2)}\n` +
        `  - Resting: +3.5\n` +
        `Step 3: sum elements = ${vo2.toFixed(4)} ml/kg/min\n` +
        `Step 4: Calculate equivalent METs = ${vo2.toFixed(4)} / 3.5 = ${met.toFixed(2)}`
      );

      setAcsmResult({
        result: (
          <div className="space-y-3">
            <div className="flex justify-between items-center py-1.5 border-b border-border text-foreground">
              <span className="font-bold text-sm">Oxygen Demand (VO2)</span>
              <span className="font-mono text-base font-black text-primary">{vo2.toFixed(1)} ml/kg/min</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-border text-foreground">
              <span className="font-bold text-sm">Metabolic Equivalents (METs)</span>
              <span className="font-mono text-base font-black text-primary">{met.toFixed(1)} METs</span>
            </div>
          </div>
        ),
        inputUsed: {
          'Speed': `${mpm.toFixed(1)} m/min`,
          'Grade': `${grade}%`,
          'Protocol': isRunning ? 'Running Model' : 'Walking Model'
        },
        methodSelected: methodMeta.name,
        formulaUsed: methodMeta.formulaDisplay,
        confidenceLabel: 'Energy demand estimate',
        limitations: 'Estimated boundaries based on steady-state model. ' + methodMeta.limitations?.join(' ')
      });
      setAcsmRawVO2(vo2);
    } catch (err: any) {
      setErrorAcsm(err.message);
    }
  };

  // Metabolic Cost Calculation
  const calculateMetabolicCost = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMet(null);
    try {
      const mass = parseFloat(metMass);
      const dur = parseFloat(metDuration);
      const vo2 = metVO2Type === 'active' ? activeVO2max : parseFloat(metCustomVO2);

      if (isNaN(mass) || mass <= 0) return setErrorMet('Invalid body weight.');
      if (isNaN(dur) || dur <= 0) return setErrorMet('Invalid session duration.');
      if (isNaN(vo2) || vo2 <= 3.5) return setErrorMet('VO2 value must exceed resting rate (3.5 ml/kg/min).');

      const met = calculateMETFromVO2(vo2);
      const hourFract = dur / 60;
      const totalKcal = calculateCaloriesFromMET(met, mass, hourFract);
      const kcalPerHour = calculateCaloriesPerHour(totalKcal, hourFract);

      // We don't have a distance here unless we assume standard speed or keep it based on time. Let's make it beautiful:
      const methodMeta = methodRegistry.find((m) => (m.id as string) === 'calories_per_session') || {
        name: 'Metabolic Energy Conversions',
        formulaDisplay: 'kcal = METs × Weight × Hours',
        limitations: []
      };

      setMetTrace(
        `Step 1: VO2 Used = ${vo2.toFixed(1)} ml/kg/min (Source: ${metVO2Type === 'active' ? activeVO2Source : 'Custom value'})\n` +
        `Step 2: convert to METs: ${vo2.toFixed(1)} / 3.5 = ${met.toFixed(4)}\n` +
        `Step 3: convert Duration to Hours: ${dur} / 60 = ${hourFract.toFixed(4)} hours\n` +
        `Step 4: Calculate total Calories: ${met.toFixed(4)} × ${mass} kg × ${hourFract.toFixed(4)} hours = ${totalKcal.toFixed(2)} kcal\n` +
        `Step 5: Calories per hour: ${totalKcal.toFixed(2)} / ${hourFract.toFixed(4)} = ${kcalPerHour.toFixed(0)} kcal/hr`
      );

      setMetResult({
        result: (
          <div className="space-y-3">
            <div className="flex justify-between items-center py-1.5 border-b border-border text-foreground">
              <span className="font-bold text-sm">Total Energy Spent</span>
              <span className="font-mono text-base font-black text-primary">{totalKcal.toFixed(0)} kcal</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-border text-foreground">
              <span className="font-bold text-sm">Hourly Burn Rate</span>
              <span className="font-mono text-base font-black text-primary">{kcalPerHour.toFixed(0)} kcal/h</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-border text-foreground">
              <span className="font-bold text-sm font-mono text-xs text-muted-foreground">METs Level</span>
              <span className="font-mono text-sm text-muted-foreground">{met.toFixed(2)}</span>
            </div>
          </div>
        ),
        inputUsed: {
          'Body Mass': mass + ' kg',
          'Duration': dur + ' minutes',
          'Intensity VO2': vo2.toFixed(1) + ' ml/kg/min'
        },
        methodSelected: methodMeta.name,
        formulaUsed: methodMeta.formulaDisplay,
        confidenceLabel: 'Energy demand estimate',
        limitations: 'Calculates gross energetic cost. Metabolic efficiency, wind, terrain, and individual fitness fluctuate baseline cost. ' + methodMeta.limitations?.join(' ')
      });
    } catch (err: any) {
      setErrorMet(err.message);
    }
  };

  // Speed-to-Vo2 Table Data
  const tableRows = useMemo(() => {
    const gradeVal = parseFloat(tableGrade);
    const gradeDecimal = isNaN(gradeVal) ? 0.01 : gradeVal / 100;
    return calculateSpeedToVO2Table(SPEED_RANGE_KMH, gradeDecimal, tableProtocol === 'walking');
  }, [tableGrade, tableProtocol]);

  // For charts
  const chartData = tableRows.map(row => ({
    speed: `${row.speedKmh} km/h`,
    vo2: parseFloat(row.vo2.toFixed(1)),
    mets: parseFloat(row.met.toFixed(1))
  }));

  // Export handlers
  const triggerPrint = () => {
    window.print();
  };

  const handleExportText = (title: string, result: any, traceText: string) => {
    if (!result) return '';
    const output = `--- TRACK.LAB MANUALLY EXPORTED FILE ---\n` +
      `System Test: ${title}\n` +
      `Method: ${result.methodSelected}\n` +
      `Formula Display: ${result.formulaUsed}\n` +
      `Inputs:\n` +
      Object.entries(result.inputUsed || {}).map(([k, v]) => `  - ${k}: ${v}`).join('\n') + `\n\n` +
      `--- DETERMINISTIC FORMULA TRACE ---\n` +
      traceText + `\n\n` +
      `--- RESULTS SECTIONS ---\n` +
      `Result Label: ${result.confidenceLabel || 'Estimate'}\n` +
      `Estimated Limits/Note: ${result.limitations || ''}\n`;
    return output;
  };

  const handleExportCSV = (title: string, result: any) => {
    if (!result) return '';
    const keys = ['Field', 'Value'];
    const rows = [
      ['Lab Title', title],
      ['Method Selected', result.methodSelected],
      ['Formula Display', result.formulaUsed],
      ...Object.entries(result.inputUsed || {}),
      ['Confidence Label', result.confidenceLabel],
      ['Limitations / Notes', result.limitations]
    ];
    return [keys.join(','), ...rows.map(r => r.map(x => `"${String(x).replace(/"/g, '""')}"`).join(','))].join('\n');
  };

  const handleExportJSON = (title: string, result: any, traceText: string) => {
    if (!result) return '';
    return JSON.stringify({
      lab: 'VO2 & Metabolic Lab',
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

  return (
    <div className="space-y-6 pb-12">
      <LabPageHeader title="VO2 & Metabolic Lab" subtitle="Scientific field calculators for oxygen uptake, thermal MET conversion, and gross energy expend." />

      {/* --- ACTIVE WORKOUT CONVERSIONS NOTIFICATION --- */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-muted border-2 border-border-heavy rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
        <div>
          <span className="text-[10px] font-bold text-primary tracking-widest block uppercase">GLOBAL CONVERSIONS STATE</span>
          <p className="text-xs font-semibold text-foreground mt-0.5">
            Active Baseline VO2max:{' '}
            <span className="font-mono text-primary font-black">{activeVO2max.toFixed(1)} ml/kg/min</span> (loaded from{' '}
            <span className="underline font-bold text-foreground">{activeVO2Source}</span>)
          </p>
        </div>
        <div className="text-[10px] font-bold text-zinc-500 max-w-sm text-right leading-snug hidden md:block uppercase">This value is dynamically referenced as an intensity baseline in advanced calorie conversions.</div>
      </div>

      {saveMessage && (
        <div className="p-3 bg-teal-50 border-2 border-teal-500 text-teal-900 rounded-lg text-xs font-bold font-mono text-center shadow-[1px_1px_0px_rgba(0,0,0,1)] animate-pulse">
          ✓ {saveMessage}
        </div>
      )}

      {/* --- QUICK vs ADVANCED SWITCHER --- */}
      <div className="flex border-2 border-border-heavy rounded-xl p-1 bg-white max-w-sm shadow-[2px_2px_0px_rgba(23,23,23,1)] overflow-hidden">
        <button
          onClick={() => { setMode('quick'); }}
          className={`flex-1 text-center py-2 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${mode === 'quick' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
        >
          Quick Estimation
        </button>
        <button
          onClick={() => { setMode('advanced'); }}
          className={`flex-1 text-center py-2 px-4 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${mode === 'advanced' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted text-muted-foreground'}`}
        >
          ACSM & Conversions
        </button>
      </div>

      {/* ========================================================= */}
      {/*                       QUICK MODE                          */}
      {/* ========================================================= */}
      {mode === 'quick' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          {/* Section 1: Cooper */}
          <div className="space-y-4">
            <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
              <CardHeader className="bg-muted border-b-2 border-border-heavy">
                <CardTitle className="uppercase font-display font-black tracking-tight text-xl">Cooper 12-Min VO2 Test</CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground">Estimate your peak oxygen carrying capacity from a maximal 12-minute run.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={calculateCooper} className="space-y-4" noValidate>
                  <div className="space-y-2">
                    <Label htmlFor="cooperDist">Sustained 12-Minute Distance (m)</Label>
                    <Input id="cooperDist" type="number" step="10" value={cooperDist} onChange={e => setCooperDist(e.target.value)} required />
                    <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Example: 2400 (Fair), 2800 (Good), 3200 (Excellent)</div>
                  </div>
                  <ValidationMessage message={errorCooper} />
                  <div className="flex gap-2.5 pt-2">
                    <Button type="submit" className="flex-1">Calculate VO2max</Button>
                    <Button type="button" variant="outline" onClick={() => { setCooperDist('2800'); setCooperResult(null); setCooperTrace(''); }} className="px-4">Reset</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {cooperResult && (
              <div className="space-y-4">
                <ResultCard result={cooperResult} />
                <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                  <CardHeader className="p-4 border-b border-border bg-card">
                    <div className="text-[10px] font-bold tracking-widest text-primary uppercase">DETERMINISTIC FORMULA TRACE & EXPORT</div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <pre className="p-3 bg-muted border border-border text-[10px] font-mono whitespace-pre-wrap rounded text-foreground font-semibold leading-relaxed">
                      {cooperTrace}
                    </pre>
                    <div className="flex flex-col gap-2">
                      <div className="text-[10px] font-bold text-foreground">Save Result inside Conversions Session State:</div>
                      <Button
                        onClick={() => {
                          const vo2 = estimateVO2Cooper12(parseFloat(cooperDist));
                          handleSaveActiveVO2(vo2, 'Cooper 12-Min Estimate');
                        }}
                        className="w-full text-[10px] font-black uppercase py-1 border-2"
                        variant="outline"
                      >
                        ⚡ LOAD THIS VO2 AS ACTIVE REFERENCE
                      </Button>
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border mt-1 justify-end">
                        <Button onClick={() => downloadFile(handleExportText('Cooper Test', cooperResult, cooperTrace), 'cooper_vo2.txt', 'text/plain')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">TXT</Button>
                        <Button onClick={() => downloadFile(handleExportCSV('Cooper Test', cooperResult), 'cooper_vo2.csv', 'text/csv')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">CSV</Button>
                        <Button onClick={() => downloadFile(handleExportJSON('Cooper Test', cooperResult, cooperTrace), 'cooper_vo2.json', 'application/json')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">JSON</Button>
                        <Button onClick={() => navigator.clipboard.writeText(handleExportText('Cooper Test', cooperResult, cooperTrace))} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">Copy Text</Button>
                        <Button onClick={triggerPrint} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">Print</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Section 2: 1.5-Mile */}
          <div className="space-y-4">
            <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
              <CardHeader className="bg-muted border-b-2 border-border-heavy">
                <CardTitle className="uppercase font-display font-black tracking-tight text-xl">1.5-Mile Run Estimator</CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground font-display">Estimate maximal VO2 from your absolute best 2.4K solo benchmark effort.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={calculateMile} className="space-y-4" noValidate>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="mileTimeMins">Minutes</Label>
                      <Input id="mileTimeMins" type="number" step="1" value={mileTimeMins} onChange={e => setMileTimeMins(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="mileTimeSecs">Seconds</Label>
                      <Input id="mileTimeSecs" type="number" step="1" val-max="59" value={mileTimeSecs} onChange={e => setMileTimeSecs(e.target.value)} required />
                    </div>
                  </div>
                  <ValidationMessage message={errorMile} />
                  <div className="flex gap-2.5 pt-2">
                    <Button type="submit" className="flex-1">Calculate VO2max</Button>
                    <Button type="button" variant="outline" onClick={() => { setMileTimeMins('11'); setMileTimeSecs('30'); setMileResult(null); setMileTrace(''); }} className="px-4">Reset</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {mileResult && (
              <div className="space-y-4">
                <ResultCard result={mileResult} />
                <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                  <CardHeader className="p-4 border-b border-border bg-card">
                    <div className="text-[10px] font-bold tracking-widest text-primary uppercase">DETERMINISTIC FORMULA TRACE & EXPORT</div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <pre className="p-3 bg-muted border border-border text-[10px] font-mono whitespace-pre-wrap rounded text-foreground font-semibold leading-relaxed">
                      {mileTrace}
                    </pre>
                    <div className="flex flex-col gap-2">
                      <div className="text-[10px] font-bold text-foreground">Save Result inside Conversions Session State:</div>
                      <Button
                        onClick={() => {
                          const totalSecs = parseFloat(mileTimeMins) * 60 + parseFloat(mileTimeSecs);
                          const vo2 = estimateVO2From15Mile(totalSecs);
                          handleSaveActiveVO2(vo2, '1.5-Mile Benchmark');
                        }}
                        className="w-full text-[10px] font-black uppercase py-1 border-2"
                        variant="outline"
                      >
                        ⚡ LOAD THIS VO2 AS ACTIVE REFERENCE
                      </Button>
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border mt-1 justify-end">
                        <Button onClick={() => downloadFile(handleExportText('1.5-Mile Test', mileResult, mileTrace), '1.5mile_vo2.txt', 'text/plain')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">TXT</Button>
                        <Button onClick={() => downloadFile(handleExportCSV('1.5-Mile Test', mileResult), '1.5mile_vo2.csv', 'text/csv')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">CSV</Button>
                        <Button onClick={() => downloadFile(handleExportJSON('1.5-Mile Test', mileResult, mileTrace), '1.5mile_vo2.json', 'application/json')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">JSON</Button>
                        <Button onClick={() => navigator.clipboard.writeText(handleExportText('1.5-Mile Test', mileResult, mileTrace))} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">Copy Text</Button>
                        <Button onClick={triggerPrint} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">Print</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Section 3: Rockport Walking Test */}
          <div className="space-y-4">
            <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
              <CardHeader className="bg-muted border-b-2 border-border-heavy">
                <CardTitle className="uppercase font-display font-black tracking-tight text-xl">Rockport Walk Test</CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground font-display">A lightweight submaximal walking formula suited for safety-conscious populations.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={calculateRockport} className="space-y-4" noValidate>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="rockAge">Age (yrs)</Label>
                      <Input id="rockAge" type="number" value={rockAge} onChange={e => setRockAge(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rockSex">Sex</Label>
                      <Select id="rockSex" value={rockSex} onChange={e => setRockSex(e.target.value as any)}>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rockWeight">Weight (kg)</Label>
                      <Input id="rockWeight" type="number" step="0.1" value={rockWeight} onChange={e => setRockWeight(e.target.value)} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="rockMins">Walk Mins</Label>
                      <Input id="rockMins" type="number" value={rockMins} onChange={e => setRockMins(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rockSecs">Walk Secs</Label>
                      <Input id="rockSecs" type="number" value={rockSecs} onChange={e => setRockSecs(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="rockHR">Post-Walk HR</Label>
                      <Input id="rockHR" type="number" value={rockHR} onChange={e => setRockHR(e.target.value)} required />
                    </div>
                  </div>

                  <ValidationMessage message={errorRock} />
                  <div className="flex gap-2.5 pt-2">
                    <Button type="submit" className="flex-1">Calculate VO2max</Button>
                    <Button type="button" variant="outline" onClick={() => { setRockAge('35'); setRockSex('male'); setRockWeight('75'); setRockMins('14'); setRockSecs('20'); setRockHR('130'); setRockResult(null); setRockTrace(''); }} className="px-4">Reset</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {rockResult && (
              <div className="space-y-4">
                <ResultCard result={rockResult} />
                <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                  <CardHeader className="p-4 border-b border-border bg-card">
                    <div className="text-[10px] font-bold tracking-widest text-primary uppercase">DETERMINISTIC FORMULA TRACE & EXPORT</div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <pre className="p-3 bg-muted border border-border text-[10px] font-mono whitespace-pre-wrap rounded text-foreground font-semibold leading-relaxed">
                      {rockTrace}
                    </pre>
                    <div className="flex flex-col gap-2">
                      <div className="text-[10px] font-bold text-foreground">Save Result inside Conversions Session State:</div>
                      <Button
                        onClick={() => {
                          const ageVal = parseInt(rockAge, 10);
                          const weightVal = parseFloat(rockWeight);
                          const totalSecs = parseFloat(rockMins) * 60 + parseFloat(rockSecs);
                          const hrVal = parseFloat(rockHR);
                          const vo2 = estimateVO2Rockport(ageVal, rockSex, weightVal, totalSecs, hrVal);
                          handleSaveActiveVO2(vo2, 'Rockport Submax Walk');
                        }}
                        className="w-full text-[10px] font-black uppercase py-1 border-2"
                        variant="outline"
                      >
                        ⚡ LOAD THIS VO2 AS ACTIVE REFERENCE
                      </Button>
                      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border mt-1 justify-end">
                        <Button onClick={() => downloadFile(handleExportText('Rockport Test', rockResult, rockTrace), 'rockport_vo2.txt', 'text/plain')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">TXT</Button>
                        <Button onClick={() => downloadFile(handleExportCSV('Rockport Test', rockResult), 'rockport_vo2.csv', 'text/csv')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">CSV</Button>
                        <Button onClick={() => downloadFile(handleExportJSON('Rockport Test', rockResult, rockTrace), 'rockport_vo2.json', 'application/json')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">JSON</Button>
                        <Button onClick={() => navigator.clipboard.writeText(handleExportText('Rockport Test', rockResult, rockTrace))} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">Copy Text</Button>
                        <Button onClick={triggerPrint} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">Print</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Section 4: Manual Outputs */}
          <div className="space-y-4">
            <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
              <CardHeader className="bg-muted border-b-2 border-border-heavy">
                <CardTitle className="uppercase font-display font-black tracking-tight text-xl">Direct Manual inputs</CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground font-display">Provide verified smartwatch device predictions or clinical lab metabolic cart measurements.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="manualDevice">Smartwatch / Device Estimate (ml/kg/min)</Label>
                  <div className="flex gap-2">
                    <Input id="manualDevice" type="number" step="0.1" value={manualDeviceVO2} onChange={e => setManualDeviceVO2(e.target.value)} />
                    <Button type="button" onClick={() => handleSaveActiveVO2(parseFloat(manualDeviceVO2), 'Smartwatch Device')} className="px-5 font-bold text-xs uppercase">Save Reference</Button>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Usually calculated via linear speed-to-HR regression.</div>
                </div>

                <div className="space-y-3 pt-3 border-t border-border">
                  <Label htmlFor="manualLab">Lab Metabolic Cart (ml/kg/min)</Label>
                  <div className="flex gap-2">
                    <Input id="manualLab" type="number" step="0.1" value={manualLabVO2} onChange={e => setManualLabVO2(e.target.value)} />
                    <Button type="button" onClick={() => handleSaveActiveVO2(parseFloat(manualLabVO2), 'Lab Metabolic Cart')} className="px-5 font-bold text-xs uppercase">Save Reference</Button>
                  </div>
                  <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">The clinical medical standard for exact gas-exchange metrics.</div>
                </div>
              </CardContent>
            </Card>

            <div className="p-4 bg-white border-2 border-border-heavy rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)] text-xs text-muted-foreground font-medium leading-relaxed">
              <span className="font-bold text-foreground block mb-2 uppercase tracking-wide text-xs">⚠️ PHYSIOLOGICAL BOUNDARIES DISCLAIMER</span>
              All calculated metrics are mathematically derived estimates. Individual running economy, biomechanics, environmental heat, altitude, wind resistance, and psychological motivation mean real-world limits can diverge significantly from statistical linear estimators. None of these calculators represent medical tests or health diagnoses.
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/*                     ADVANCED MODE                         */}
      {/* ========================================================= */}
      {mode === 'advanced' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
          {/* Column A: ACSM and Metabolic Conversions */}
          <div className="space-y-6">
            <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
              <CardHeader className="bg-muted border-b-2 border-border-heavy">
                <CardTitle className="uppercase font-display font-black tracking-tight text-xl">ACSM VO2 Estimator</CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground">Deterministic steady-state oxygen demand calculations published by the ACSM.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={calculateAcsm} className="space-y-4" noValidate>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="acsmSpeedType">Speed Format</Label>
                      <Select id="acsmSpeedType" value={acsmSpeedInputType} onChange={e => setAcsmSpeedInputType(e.target.value as any)}>
                        <option value="kmh">Speed (km/h)</option>
                        <option value="mps">Speed (m/s)</option>
                        <option value="pase">Pace (M:S /km)</option>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="acsmSpeedVal">Speed/Pace Value</Label>
                      <Input id="acsmSpeedVal" type="text" value={acsmSpeedValue} onChange={e => setAcsmSpeedValue(e.target.value)} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="acsmGrade">Treadmill Gradient (%)</Label>
                      <Input id="acsmGrade" type="number" step="0.1" value={acsmGrade} onChange={e => setAcsmGrade(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="acsmProtocol">Activity Model</Label>
                      <Select id="acsmProtocol" value={acsmProtocol} onChange={e => setAcsmProtocol(e.target.value as any)}>
                        <option value="running">Running (&gt; 8 km/h / 5 mph)</option>
                        <option value="walking">Walking (1.9 to 6.4 km/h)</option>
                      </Select>
                    </div>
                  </div>

                  <ValidationMessage message={errorAcsm} />
                  <div className="flex gap-2.5 pt-2">
                    <Button type="submit" className="flex-1">Estimate ACSM Demand</Button>
                    <Button type="button" variant="outline" onClick={() => { setAcsmSpeedInputType('kmh'); setAcsmSpeedValue('12'); setAcsmGrade('1.5'); setAcsmProtocol('running'); setAcsmResult(null); setAcsmTrace(''); }} className="px-4">Reset</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {acsmResult && (
              <div className="space-y-4">
                <ResultCard result={acsmResult} />
                <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                  <CardHeader className="p-4 border-b border-border bg-card">
                    <div className="text-[10px] font-bold tracking-widest text-primary uppercase">DETERMINISTIC FORMULA TRACE & EXPORT</div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <pre className="p-3 bg-muted border border-border text-[10px] font-mono whitespace-pre-wrap rounded text-foreground font-semibold leading-relaxed">
                      {acsmTrace}
                    </pre>
                    <div className="flex justify-between items-center py-2 border-t border-border mt-1 gap-2 flex-wrap">
                      <Button
                        onClick={() => {
                          if (acsmRawVO2) handleSaveActiveVO2(acsmRawVO2, 'ACSM Estimated Demand');
                        }}
                        className="text-[10px] font-black uppercase py-1 border-2"
                        variant="outline"
                      >
                        ⚡ LOAD VO2 AS ACTIVE REFERENCE
                      </Button>
                      <div className="flex gap-1.5 ml-auto">
                        <Button onClick={() => downloadFile(handleExportText('ACSM VO2 Estimator', acsmResult, acsmTrace), 'acsm_vo2.txt', 'text/plain')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">TXT</Button>
                        <Button onClick={() => downloadFile(handleExportCSV('ACSM VO2 Estimator', acsmResult), 'acsm_vo2.csv', 'text/csv')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">CSV</Button>
                        <Button onClick={() => downloadFile(handleExportJSON('ACSM VO2 Estimator', acsmResult, acsmTrace), 'acsm_vo2.json', 'application/json')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">JSON</Button>
                        <Button onClick={() => navigator.clipboard.writeText(handleExportText('ACSM VO2 Estimator', acsmResult, acsmTrace))} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">Copy Text</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Metabolic Conversions (METs to key Calories, Cost) */}
            <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
              <CardHeader className="bg-muted border-b-2 border-border-heavy">
                <CardTitle className="uppercase font-display font-black tracking-tight text-xl">Metabolic Cost Converter</CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground">Translate oxygen consumption rate (ml/kg/min) to gross exercise energy burn.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={calculateMetabolicCost} className="space-y-4" noValidate>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="metMass">Body Weight (kg)</Label>
                      <Input id="metMass" type="number" step="0.1" value={metMass} onChange={e => setMetMass(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="metDuration">Exercise Duration (mins)</Label>
                      <Input id="metDuration" type="number" step="1" value={metDuration} onChange={e => setMetDuration(e.target.value)} required />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-border pt-3">
                    <div className="space-y-2">
                      <Label htmlFor="metVO2Type">VO2 Intensity Source</Label>
                      <Select id="metVO2Type" value={metVO2Type} onChange={e => setMetVO2Type(e.target.value as any)}>
                        <option value="active">Active State ({activeVO2max.toFixed(1)} ml/kg/min)</option>
                        <option value="custom">Custom VO2 Input</option>
                      </Select>
                    </div>
                    {metVO2Type === 'custom' && (
                      <div className="space-y-2">
                        <Label htmlFor="metCustomVO2">Custom VO2 (ml/kg/min)</Label>
                        <Input id="metCustomVO2" type="number" step="0.1" value={metCustomVO2} onChange={e => setMetCustomVO2(e.target.value)} required />
                      </div>
                    )}
                  </div>

                  <ValidationMessage message={errorMet} />
                  <div className="flex gap-2.5 pt-2">
                    <Button type="submit" className="flex-1">Calculate Energy Demand Cost</Button>
                    <Button type="button" variant="outline" onClick={() => { setMetMass('70'); setMetDuration('45'); setMetVO2Type('active'); setMetCustomVO2('40.0'); setMetResult(null); setMetTrace(''); }} className="px-4">Reset</Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {metResult && (
              <div className="space-y-4">
                <ResultCard result={metResult} />
                <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                  <CardHeader className="p-4 border-b border-border bg-card">
                    <div className="text-[10px] font-bold tracking-widest text-primary uppercase">DETERMINISTIC FORMULA TRACE & EXPORT</div>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <pre className="p-3 bg-muted border border-border text-[10px] font-mono whitespace-pre-wrap rounded text-foreground font-semibold leading-relaxed">
                      {metTrace}
                    </pre>
                    <div className="flex justify-end gap-1.5 border-t border-border pt-3">
                      <Button onClick={() => downloadFile(handleExportText('Metabolic Cost', metResult, metTrace), 'met_cost.txt', 'text/plain')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">TXT</Button>
                      <Button onClick={() => downloadFile(handleExportCSV('Metabolic Cost', metResult), 'met_cost.csv', 'text/csv')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">CSV</Button>
                      <Button onClick={() => downloadFile(handleExportJSON('Metabolic Cost', metResult, metTrace), 'met_cost.json', 'application/json')} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">JSON</Button>
                      <Button onClick={() => navigator.clipboard.writeText(handleExportText('Metabolic Cost', metResult, metTrace))} variant="outline" className="text-[10px] font-black uppercase px-2 py-1 h-auto">Copy Text</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          {/* Column B: Interactive ACSM Table and Real-Data Chart */}
          <div className="space-y-6">
            <Card className="border-2 border-border-heavy shadow-[2px_2px_0px_rgba(23,23,23,1)]">
              <CardHeader className="bg-muted border-b-2 border-border-heavy">
                <CardTitle className="uppercase font-display font-black tracking-tight text-xl">ACSM Speed-to-VO2 Table</CardTitle>
                <CardDescription className="text-xs font-medium text-muted-foreground">A multi-point reference mapping speeds to theoretical oxygen demand at selected treadmill grade.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3 p-3 bg-muted border-2 border-border-heavy rounded-xl shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                  <div>
                    <Label htmlFor="tableGrade" className="text-[10px] tracking-widest text-muted-foreground uppercase font-black block mb-1">Treadmill Gradient (%)</Label>
                    <Input id="tableGrade" type="number" step="0.5" className="h-8 py-1 font-mono font-bold" value={tableGrade} onChange={e => setTableGrade(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="tableProtocol" className="text-[10px] tracking-widest text-muted-foreground uppercase font-black block mb-1">Activity Model</Label>
                    <Select id="tableProtocol" className="h-8 py-0.5 text-xs font-bold" value={tableProtocol} onChange={e => setTableProtocol(e.target.value as any)}>
                      <option value="running">Running Model</option>
                      <option value="walking">Walking Model</option>
                    </Select>
                  </div>
                </div>

                <div className="overflow-x-auto border-2 border-border-heavy rounded-lg overflow-hidden bg-white shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                  <table className="w-full text-left text-xs text-foreground divide-y divide-border font-medium">
                    <thead className="bg-muted text-[10px] uppercase tracking-wider font-black text-muted-foreground">
                      <tr>
                        <th className="p-3">Speed (km/h)</th>
                        <th className="p-3">Pace (/km)</th>
                        <th className="p-3">ACSM VO2</th>
                        <th className="p-3">METs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {tableRows.map((row) => {
                        const mins = Math.floor(row.paceSecondsPerKm / 60);
                        const secs = Math.round(row.paceSecondsPerKm % 60);
                        const paceFormatted = isNaN(mins) || mins === Infinity ? '--:--' : `${mins}:${secs.toString().padStart(2, '0')}`;
                        return (
                          <tr key={row.speedKmh} className="hover:bg-muted/50 font-mono text-[11px] font-semibold text-foreground">
                            <td className="p-3 text-foreground font-black">{row.speedKmh} km/h</td>
                            <td className="p-3">{paceFormatted}</td>
                            <td className="p-3 text-primary font-bold">{row.vo2.toFixed(1)} ml/kg/min</td>
                            <td className="p-3">{row.met.toFixed(1)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* REAL DATA LINE CHART */}
                <div className="border border-border p-4 rounded-xl bg-white shadow-sm space-y-2">
                  <div className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Oxygen Intake Curve: Speed vs. VO2</div>
                  <div className="h-60 w-full font-sans text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="speed" tick={{ fill: '#71717a' }} />
                        <YAxis tick={{ fill: '#71717a' }} />
                        <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #71717a' }} />
                        <Legend />
                        <Line type="monotone" dataKey="vo2" name="Demand VO2 (ml/kg/min)" stroke="#ef4444" strokeWidth={3} activeDot={{ r: 8 }} />
                        <Line type="monotone" dataKey="mets" name="Demand METs" stroke="#3b82f6" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

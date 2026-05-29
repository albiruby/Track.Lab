'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input, Label, Button, Select, ValidationMessage } from '@/components/ui/Forms';
import { LabPageHeader } from '@/components/layout/LabPageHeader';
import { 
  calculateWattsPerKg,
  calculatePowerEfficiency,
  calculatePowerDrift,
  calculatePowerFade,
  calculateCriticalPowerZones,
  calculateTimeToExhaustionAboveCP,
  comparePowerToHR,
  comparePowerToPace,
  calculateCriticalPower2Point,
  calculatePowerPerKm
} from '@/lib/calculators_pack';
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
  Zap, 
  Gauge, 
  Activity, 
  RefreshCw, 
  Copy, 
  FileText, 
  Sliders, 
  Bookmark, 
  Flame, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  Info
} from 'lucide-react';

export default function PowerLabPage() {
  const [isAdvanced, setIsAdvanced] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'metrics_eff' | 'critical_power' | 'burn_exhaustion' | 'zones_table'>('metrics_eff');
  const [error, setError] = useState<string | null>(null);

  // --- Quick Mode States ---
  const [quickPower, setQuickPower] = useState('300');
  const [quickWeight, setQuickWeight] = useState('70');

  // --- Advanced Mode States ---
  // A. Power & Weight & Efficiency
  const [avgPower, setAvgPower] = useState('280');
  const [bodyMass, setBodyMass] = useState('72');
  const [avgHr, setAvgHr] = useState('155');
  const [avgSpeed, setAvgSpeed] = useState('14.2'); // km/h
  const [firstHalfPower, setFirstHalfPower] = useState('285');
  const [secondHalfPower, setSecondHalfPower] = useState('275');

  // B. Critical Power Trials (Modeling CP & W')
  const [trial1Power, setTrial1Power] = useState('350');
  const [trial1TimeMin, setTrial1TimeMin] = useState('3');
  const [trial1TimeSec, setTrial1TimeSec] = useState('0'); // 3 mins (180s)
  
  const [trial2Power, setTrial2Power] = useState('310');
  const [trial2TimeMin, setTrial2TimeMin] = useState('12');
  const [trial2TimeSec, setTrial2TimeSec] = useState('0'); // 12 mins (720s)

  // C. Time To Exhaustion & Burn above CP
  const [userCriticalPower, setUserCriticalPower] = useState('280');
  const [userWPrime, setUserWPrime] = useState('15000'); // Joules
  const [tteTargetPower, setTteTargetPower] = useState('320');

  // --- Reset All Inputs ---
  const handleReset = () => {
    setQuickPower('300');
    setQuickWeight('70');
    setAvgPower('280');
    setBodyMass('72');
    setAvgHr('155');
    setAvgSpeed('14.2');
    setFirstHalfPower('285');
    setSecondHalfPower('275');
    setTrial1Power('350');
    setTrial1TimeMin('3');
    setTrial1TimeSec('0');
    setTrial2Power('310');
    setTrial2TimeMin('12');
    setTrial2TimeSec('0');
    setUserCriticalPower('280');
    setUserWPrime('15000');
    setTteTargetPower('320');
    setError(null);
  };

  // --- Computations ---

  // Quick Mode Watts/kg
  const quickWkg = useMemo(() => {
    const p = parseFloat(quickPower);
    const w = parseFloat(quickWeight);
    if (isNaN(p) || isNaN(w) || p <= 0 || w <= 0) return 0;
    return calculateWattsPerKg(p, w);
  }, [quickPower, quickWeight]);

  // Advanced A: Power to Weight, efficiency indices & decoupling drift
  const advWkg = useMemo(() => {
    const p = parseFloat(avgPower);
    const w = parseFloat(bodyMass);
    if (isNaN(p) || isNaN(w) || p <= 0 || w <= 0) return 0;
    return calculateWattsPerKg(p, w);
  }, [avgPower, bodyMass]);

  const powerToHrRatio = useMemo(() => {
    const p = parseFloat(avgPower);
    const hr = parseFloat(avgHr);
    if (isNaN(p) || isNaN(hr) || p <= 0 || hr <= 0) return 0;
    return comparePowerToHR(p, hr);
  }, [avgPower, avgHr]);

  const rawSpeedMs = useMemo(() => {
    const sKmh = parseFloat(avgSpeed);
    if (isNaN(sKmh) || sKmh <= 0) return 0;
    return (sKmh * 1000) / 3600;
  }, [avgSpeed]);

  const speedToPowerEfficiencyValue = useMemo(() => {
    if (rawSpeedMs <= 0 || advWkg <= 0) return 0;
    return calculatePowerEfficiency(rawSpeedMs, advWkg);
  }, [rawSpeedMs, advWkg]);

  const advDriftPct = useMemo(() => {
    const f = parseFloat(firstHalfPower);
    const s = parseFloat(secondHalfPower);
    if (isNaN(f) || isNaN(s) || f <= 0 || s <= 0) return 0;
    return calculatePowerDrift(f, s);
  }, [firstHalfPower, secondHalfPower]);

  const powerSessionKcalBurnKm = useMemo(() => {
    const p = parseFloat(avgPower);
    const sKmh = parseFloat(avgSpeed);
    if (isNaN(p) || isNaN(sKmh) || p <= 0 || sKmh <= 0) return "N/A";
    const paceSecKm = 3600 / sKmh;
    return calculatePowerPerKm(p, paceSecKm);
  }, [avgPower, avgSpeed]);

  // Advanced B: Critical Power (2-Point Model)
  const trial1Seconds = useMemo(() => {
    const m = parseFloat(trial1TimeMin);
    const s = parseFloat(trial1TimeSec);
    if (isNaN(m) || isNaN(s)) return 0;
    return (m * 60) + s;
  }, [trial1TimeMin, trial1TimeSec]);

  const trial2Seconds = useMemo(() => {
    const m = parseFloat(trial2TimeMin);
    const s = parseFloat(trial2TimeSec);
    if (isNaN(m) || isNaN(s)) return 0;
    return (m * 60) + s;
  }, [trial2TimeMin, trial2TimeSec]);

  const modeledCriticalPowerObj = useMemo(() => {
    const p1 = parseFloat(trial1Power);
    const p2 = parseFloat(trial2Power);
    if (isNaN(p1) || isNaN(p2) || trial1Seconds <= 0 || trial2Seconds <= 0 || p1 <= 0 || p2 <= 0) {
      return { criticalPower: 0, wPrime: 0 };
    }
    return calculateCriticalPower2Point(p1, trial1Seconds, p2, trial2Seconds);
  }, [trial1Power, trial1Seconds, trial2Power, trial2Seconds]);

  // Advanced C: Exhaustion calculations
  const timeToExhaustionSeconds = useMemo(() => {
    const cp = parseFloat(userCriticalPower);
    const wp = parseFloat(userWPrime);
    const tp = parseFloat(tteTargetPower);
    if (isNaN(cp) || isNaN(wp) || isNaN(tp) || cp <= 0 || wp <= 0 || tp <= 0) return 0;
    return calculateTimeToExhaustionAboveCP(wp, tp, cp);
  }, [userCriticalPower, userWPrime, tteTargetPower]);

  const tteDisplay = useMemo(() => {
    if (timeToExhaustionSeconds <= 0) return "Constant state (power below threshold)";
    const mins = Math.floor(timeToExhaustionSeconds / 60);
    const secs = Math.round(timeToExhaustionSeconds % 60);
    return `${mins}m ${secs}s`;
  }, [timeToExhaustionSeconds]);

  // Advanced D: Seven-Zone table generator from CP
  const sevenZonePowerTable = useMemo(() => {
    const cp = parseFloat(userCriticalPower);
    if (isNaN(cp) || cp <= 0) return [];
    return calculateCriticalPowerZones(cp);
  }, [userCriticalPower]);


  // --- Recharts Power Curve Data (strictly on modeled critical power results) ---
  const powerDurationCurveData = useMemo(() => {
    const cp = parseFloat(userCriticalPower);
    const wp = parseFloat(userWPrime);
    if (isNaN(cp) || isNaN(wp) || cp <= 0 || wp <= 0) return [];

    // Durations in minutes: 1, 2, 3, 5, 8, 10, 15, 20, 30, 45, 60
    const minutesSample = [1, 2, 3, 5, 8, 10, 15, 20, 30, 45, 60];
    return minutesSample.map(m => {
      const seconds = m * 60;
      // Power = CP + W'/t
      const p = cp + (wp / seconds);
      return {
        durationMin: m,
        MaxSustainableWatts: Math.round(p),
        CriticalPowerLimit: Math.round(cp)
      };
    });
  }, [userCriticalPower, userWPrime]);


  // --- Manual Copy / Exports ---
  const handleExport = (format: 'txt' | 'csv' | 'json') => {
    let outputText = '';
    const dateStr = new Date().toISOString().split('T')[0];

    const dataObj = {
      title: "Track.Lab Run Power Performance Report",
      date: dateStr,
      metrics: {
        quickMode: {
          powerWatts: `${quickPower} W`,
          weightKg: `${quickWeight} kg`,
          ratioWkg: `${quickWkg.toFixed(2)} W/kg`
        },
        advancedMode: {
          avgPower: `${avgPower} W`,
          weight: `${bodyMass} kg`,
          wkg: `${advWkg.toFixed(2)} W/kg`,
          powerHrEfficiency: powerToHrRatio > 0 ? `${powerToHrRatio.toFixed(2)} W/bpm` : 'N/A',
          speedToPowerEfficiency: speedToPowerEfficiencyValue > 0 ? `${speedToPowerEfficiencyValue.toFixed(3)} (m/s) per W/kg` : 'N/A',
          firstHalfAvg: `${firstHalfPower} W`,
          secondHalfAvg: `${secondHalfPower} W`,
          powerDriftPercent: `${advDriftPct.toFixed(2)}%`,
          metabolicWorkEstimate: powerSessionKcalBurnKm,
          modeledCriticalPower: `${modeledCriticalPowerObj.criticalPower.toFixed(1)} W`,
          modeledWPrimeCapacity: `${Math.round(modeledCriticalPowerObj.wPrime)} Joules`,
          targetPowerExhaustion: `${tteTargetPower} W`,
          predictedTimeToExhaust: tteDisplay
        }
      },
      traces: {
        powerRatioFormula: "PowerWatts / WeightKg",
        efficiencyFormula: "SpeedMs / WattsPerKg",
        driftFormula: "((SubSecond - SubFirst) / SubFirst) * 100",
        criticalPower2Point: "CP = (W2 - W1)/(t2-t1) | W' = (P1-CP)*t1",
        exhaustionFormula: "TTE = W' / (Target - CP)"
      }
    };

    if (format === 'json') {
      outputText = JSON.stringify(dataObj, null, 2);
    } else if (format === 'csv') {
      outputText = `Metric,Value,Equation/Trace\n` +
        `Power Watts,${quickPower} W,User Input\n` +
        `Weight,${quickWeight} kg,User Input\n` +
        `Watts/kg Ratio,${dataObj.metrics.quickMode.ratioWkg},Power / Weight\n` +
        `Power/HR Index,${dataObj.metrics.advancedMode.powerHrEfficiency},Power / HR\n` +
        `Drift Decoupling,${dataObj.metrics.advancedMode.powerDriftPercent},((P2-P1)/P1)*100\n` +
        `Modeled Critical Power,${dataObj.metrics.advancedMode.modeledCriticalPower},Trials 2-point regression\n` +
        `TimeToExhaustion,${dataObj.metrics.advancedMode.predictedTimeToExhaust},W' / (Target - CP)\n`;
    } else {
      outputText = `=========================================\n` +
        `TRACK.LAB RUN POWER ANALYSIS REPORT - ${dateStr}\n` +
        `=========================================\n\n` +
        `--- BASICS (QUICK MODE) ---\n` +
        `• Given Power Output: ${dataObj.metrics.quickMode.powerWatts}\n` +
        `• Given Body Weight: ${dataObj.metrics.quickMode.weightKg}\n` +
        `• Critical Power-to-weight: ${dataObj.metrics.quickMode.ratioWkg}\n\n` +
        `--- METRICS & EFFICIENCY (ADVANCED) ---\n` +
        `• Average Power: ${dataObj.metrics.advancedMode.avgPower}\n` +
        `• Body Mass: ${dataObj.metrics.advancedMode.weight}\n` +
        `• Running W/kg Ratio: ${dataObj.metrics.advancedMode.wkg}\n` +
        `• Power-to-HR Index (EF): ${dataObj.metrics.advancedMode.powerHrEfficiency}\n` +
        `• Speed-to-Power Coefficient: ${dataObj.metrics.advancedMode.speedToPowerEfficiency}\n` +
        `• Session Pacing Power Drift: ${dataObj.metrics.advancedMode.powerDriftPercent}\n` +
        `• Metabolic Energy Load: ${dataObj.metrics.advancedMode.metabolicWorkEstimate}\n\n` +
        `--- CRITICAL POWER MODELED (2-POINT) ---\n` +
        `• Trial Regression CP: ${dataObj.metrics.advancedMode.modeledCriticalPower}\n` +
        `• Modeled W' Capacity: ${dataObj.metrics.advancedMode.modeledWPrimeCapacity}\n\n` +
        `--- BURN EXHAUSTION PROFILE ---\n` +
        `• Targeted High Power: ${dataObj.metrics.advancedMode.targetPowerExhaustion}\n` +
        `• Calculated Sustained Limits (TTE): ${dataObj.metrics.advancedMode.predictedTimeToExhaust}\n\n` +
        `--- METRIC FORMULA TRACES ---\n` +
        `• Watts/kg: Power (W) / Weight (kg)\n` +
        `• Drift Decoupling: ( (P_SecondHalf - P_FirstHalf) / P_FirstHalf ) * 100\n` +
        `• CP Model: CP = (W2 - W1)/(t2-t1)\n` +
        `• W' Capacity: W' = (Trial_Power - CP) * trial_time_seconds\n` +
        `=========================================\n`;
    }

    navigator.clipboard.writeText(outputText).then(() => {
      alert(`Manual results report copied to clipboard as ${format.toUpperCase()}!`);
    }).catch(err => {
      alert("Clipboard access blocked. Copying output text failed.");
    });
  };

  return (
    <div className="space-y-6">
      <LabPageHeader 
        title="POWER LAB" 
        subtitle="Running power efficiency meters, W/kg amortization, critical power regressions, and anaerobic W' depletion curves." 
      />

      {/* Warnings & Device Limitations Caveat Box */}
      <div className="p-4 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-zinc-900 dark:text-zinc-50 flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">Mandatory Power Device Disclaimer</p>
          <p className="text-zinc-600 dark:text-zinc-400 font-medium">
            Running power is not directly measured. It varies by wearable device manufacturer (Garmin, Coros, Polar, Apple) and proprietary algorithm systems. 
            Track.Lab does not generate or sync live sensor power. Use manually entered averages, matching equivalent sources to maintain validation consistency.
          </p>
        </div>
      </div>

      {/* Mode Selector Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
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

        <div className="flex gap-2 w-full sm:w-auto font-mono">
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
        
        {/* Left Side calculations columns */}
        <div className="xl:col-span-2 space-y-6">
          
          {!isAdvanced ? (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-zinc-950 dark:text-zinc-50" />
                  <CardTitle className="text-base font-semibold">Quick Watts/kg Ratio</CardTitle>
                </div>
                <CardDescription>Calculate baseline normalized relative power output from weight offsets.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quickPower">Average Power (W)</Label>
                    <Input 
                      id="quickPower" 
                      type="number" 
                      value={quickPower} 
                      onChange={e => setQuickPower(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quickWeight">Body Weight (kg)</Label>
                    <Input 
                      id="quickWeight" 
                      type="number" 
                      value={quickWeight} 
                      onChange={e => setQuickWeight(e.target.value)} 
                    />
                  </div>
                </div>

                {quickWkg > 0 && (
                  <div className="p-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider font-mono">Relative Power Value</div>
                    <div className="text-3xl font-extrabold font-mono text-zinc-950 dark:text-zinc-50">
                      {quickWkg.toFixed(2)} <span className="text-xs text-zinc-500 font-normal">W/kg</span>
                    </div>
                    <div className="text-[10px] text-zinc-400 font-mono mt-2 uppercase">
                      Formula trace: {quickPower} Watts / {quickWeight} kg
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            
            // --- Advanced Sub Tabs ---
            <div className="space-y-6">
              
              <div className="flex border-b border-zinc-200 dark:border-zinc-800 text-sm overflow-x-auto whitespace-nowrap">
                <button 
                  className={`py-2 px-4 border-b-2 font-medium transition ${activeTab === 'metrics_eff' ? 'border-zinc-950 text-zinc-950 dark:border-zinc-50 dark:text-zinc-50' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
                  onClick={() => setActiveTab('metrics_eff')}
                >
                  Metrics & Efficiency
                </button>
                <button 
                  className={`py-2 px-4 border-b-2 font-medium transition ${activeTab === 'critical_power' ? 'border-zinc-950 text-zinc-950 dark:border-zinc-50 dark:text-zinc-50' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
                  onClick={() => setActiveTab('critical_power')}
                >
                  Modeled CP & W&apos;
                </button>
                <button 
                  className={`py-2 px-4 border-b-2 font-medium transition ${activeTab === 'burn_exhaustion' ? 'border-zinc-950 text-zinc-950 dark:border-zinc-50 dark:text-zinc-50' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
                  onClick={() => setActiveTab('burn_exhaustion')}
                >
                  Anaerobic Burn (TTE)
                </button>
                <button 
                  className={`py-2 px-4 border-b-2 font-medium transition ${activeTab === 'zones_table' ? 'border-zinc-950 text-zinc-950 dark:border-zinc-50 dark:text-zinc-50' : 'border-transparent text-zinc-500 hover:text-zinc-800'}`}
                  onClick={() => setActiveTab('zones_table')}
                >
                  7-Zone Table
                </button>
              </div>

              {activeTab === 'metrics_eff' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold font-sans">Power Metrics, Efficiency & Decoupling Drifts</CardTitle>
                    <CardDescription>
                      Evaluate absolute metabolic cost, cardiovascular decoupling, and mechanical work translation indexes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="avgPower">Avg Power (W)</Label>
                        <Input 
                          id="avgPower" 
                          type="number" 
                          value={avgPower} 
                          onChange={e => setAvgPower(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bodyMass">Body Weight (kg)</Label>
                        <Input 
                          id="bodyMass" 
                          type="number" 
                          value={bodyMass} 
                          onChange={e => setBodyMass(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="avgHr">Avg Heart Rate (bpm)</Label>
                        <Input 
                          id="avgHr" 
                          type="number" 
                          value={avgHr} 
                          onChange={e => setAvgHr(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="avgSpeed">Avg Speed (km/h)</Label>
                        <Input 
                          id="avgSpeed" 
                          type="number" 
                          step="0.1" 
                          value={avgSpeed} 
                          onChange={e => setAvgSpeed(e.target.value)} 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                      <div className="space-y-2">
                        <Label>Power Session Decoupling Drift Inputs</Label>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label className="text-[10px] block font-mono">1st Half Avg W</Label>
                            <Input 
                              type="number" 
                              value={firstHalfPower} 
                              onChange={e => setFirstHalfPower(e.target.value)} 
                              className="h-8 font-mono"
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-[10px] block font-mono">2nd Half Avg W</Label>
                            <Input 
                              type="number" 
                              value={secondHalfPower} 
                              onChange={e => setSecondHalfPower(e.target.value)} 
                              className="h-8 font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                        <span className="text-xs text-zinc-400 font-mono uppercase block">Pacing Power Drift</span>
                        <span className={`text-xl font-bold font-mono block ${advDriftPct < -5 ? 'text-red-500' : 'text-zinc-950 dark:text-zinc-50'}`}>
                          {advDriftPct > 0 ? '+' : ''}{advDriftPct.toFixed(2)}%
                        </span>
                        <span className="text-[10px] text-zinc-500 block leading-tight mt-1 font-mono">
                          Trace: ( ({secondHalfPower} - {firstHalfPower}) / {firstHalfPower} ) * 100
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                      <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                        <span className="text-xs text-zinc-400 font-mono uppercase block">Relative Power Output</span>
                        <span className="text-xl font-bold font-mono">
                          {advWkg.toFixed(2)} <span className="text-xs text-zinc-500 font-normal">W/kg</span>
                        </span>
                      </div>

                      <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                        <span className="text-xs text-zinc-400 font-mono uppercase block">Power/HR (EF Value)</span>
                        <span className="text-xl font-bold font-mono">
                          {powerToHrRatio.toFixed(2)} <span className="text-xs text-zinc-500 font-normal">W/bpm</span>
                        </span>
                      </div>

                      <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                        <span className="text-xs text-zinc-400 font-mono uppercase block">Velocity Efficiency</span>
                        <span className="text-xl font-bold font-mono">
                          {speedToPowerEfficiencyValue.toFixed(3)} <span className="text-[9px] text-zinc-500 font-normal font-sans">m/s per W/kg</span>
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'critical_power' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Critical Power Trials (Linear Regressions)</CardTitle>
                    <CardDescription>
                      Construct Critical Power (CP) limits and finite W&apos; reserve energy capacities from two manual maximum sustainable effort tests.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md space-y-3">
                        <h4 className="font-semibold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Max Short Trial 1</h4>
                        <div className="space-y-2">
                          <Label>Sustained Average Power (Watts)</Label>
                          <Input 
                            type="number" 
                            value={trial1Power} 
                            onChange={e => setTrial1Power(e.target.value)} 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-[10px] block mb-1">Trial Minutes</Label>
                            <Input 
                              type="number" 
                              value={trial1TimeMin} 
                              onChange={e => setTrial1TimeMin(e.target.value)} 
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] block mb-1">Trial Seconds</Label>
                            <Input 
                              type="number" 
                              value={trial1TimeSec} 
                              onChange={e => setTrial1TimeSec(e.target.value)} 
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md space-y-3">
                        <h4 className="font-semibold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Max Long Trial 2</h4>
                        <div className="space-y-2">
                          <Label>Sustained Average Power (Watts)</Label>
                          <Input 
                            type="number" 
                            value={trial2Power} 
                            onChange={e => setTrial2Power(e.target.value)} 
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-[10px] block mb-1">Trial Minutes</Label>
                            <Input 
                              type="number" 
                              value={trial2TimeMin} 
                              onChange={e => setTrial2TimeMin(e.target.value)} 
                            />
                          </div>
                          <div>
                            <Label className="text-[10px] block mb-1">Trial Seconds</Label>
                            <Input 
                              type="number" 
                              value={trial2TimeSec} 
                              onChange={e => setTrial2TimeSec(e.target.value)} 
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                      
                      <div className="p-3 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md">
                        <span className="text-xs text-zinc-400 font-mono uppercase block">Modeled Critical Power (CP)</span>
                        {modeledCriticalPowerObj.criticalPower > 0 ? (
                          <>
                            <span className="text-2xl font-bold font-mono">
                              {Math.round(modeledCriticalPowerObj.criticalPower)} <span className="text-xs text-zinc-500 font-normal font-sans">Watts</span>
                            </span>
                            <span className="text-[10px] text-zinc-500 block leading-normal mt-1 font-mono">
                              Trace: (Power2×t2 - Power1×t1) / (t2 - t1)
                            </span>
                          </>
                        ) : (
                          <span className="text-zinc-400 font-mono block text-sm mt-1">Please insert trial values above.</span>
                        )}
                      </div>

                      <div className="p-3 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md">
                        <span className="text-xs text-zinc-400 font-mono uppercase block">Modeled W&apos; Anaerobic Capacity</span>
                        {modeledCriticalPowerObj.wPrime > 0 ? (
                          <>
                            <span className="text-2xl font-bold font-mono">
                              {Math.round(modeledCriticalPowerObj.wPrime / 1000).toFixed(1)} <span className="text-xs text-zinc-500 font-normal font-sans">kJ</span>
                            </span>
                            <span className="text-[10px] text-zinc-500 block leading-normal mt-1 font-mono">
                              ({Math.round(modeledCriticalPowerObj.wPrime)} Joules) | Trace: (P1 - CP) × t1
                            </span>
                          </>
                        ) : (
                          <span className="text-zinc-400 font-mono block text-sm mt-1">Please insert trial values above.</span>
                        )}
                      </div>

                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'burn_exhaustion' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Anaerobic Energy Burn & Exhaustion (TTE)</CardTitle>
                    <CardDescription>
                      Anticipate maximum sustain durations (TTE) above your critical thresholds by depleting your finite W&apos; battery storage levels.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="userCriticalPower">Active CP Anchored Threshold (W)</Label>
                        <Input 
                          id="userCriticalPower" 
                          type="number" 
                          value={userCriticalPower} 
                          onChange={e => setUserCriticalPower(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="userWPrime">W&apos; Anaerobic Storage Capacity (Joules)</Label>
                        <Input 
                          id="userWPrime" 
                          type="number" 
                          value={userWPrime} 
                          onChange={e => setUserWPrime(e.target.value)} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tteTargetPower">Target Power Level (Watts)</Label>
                        <Input 
                          id="tteTargetPower" 
                          type="number" 
                          value={tteTargetPower} 
                          onChange={e => setTteTargetPower(e.target.value)} 
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-2">
                      <span className="text-xs text-zinc-500 uppercase font-mono block">Estimated Time-to-Exhaustion (TTE)</span>
                      
                      {parseFloat(tteTargetPower) > parseFloat(userCriticalPower) ? (
                        <>
                          <div className="text-3xl font-extrabold font-mono text-zinc-950 dark:text-zinc-50">
                            {tteDisplay}
                          </div>
                          <div className="text-[10px] text-zinc-500 font-mono mt-1">
                            Trace equation: W&apos; ({userWPrime} J) / ( TargetPower ({tteTargetPower}W) - CP ({userCriticalPower}W) )
                          </div>
                        </>
                      ) : (
                        <div className="text-zinc-900 dark:text-zinc-100 text-sm font-semibold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Comfortable steady state. Target power is within basic CP clearance thresholds (infinite metabolic duration).
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeTab === 'zones_table' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Seven-Zone Power Table Ranges</CardTitle>
                    <CardDescription>
                      Structured physiological intensities calculated relative to your threshold critical power baseline of {userCriticalPower}W.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sevenZonePowerTable.length > 0 ? (
                      <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-lg">
                        <table className="w-full text-xs font-mono text-left">
                          <thead className="bg-zinc-100 dark:bg-zinc-900 text-[10px] uppercase text-zinc-500 uppercase font-bold border-b border-zinc-200 dark:border-zinc-800">
                            <tr>
                              <th className="p-3">Zone Number</th>
                              <th className="p-3">Intensity Level Name</th>
                              <th className="p-3">Intensity Percentage Targets</th>
                              <th className="p-3">Output Ranges (Watts)</th>
                              <th className="p-3">Physiological Focus Notes</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {sevenZonePowerTable.map(z => (
                              <tr key={z.zoneNumber} className="hover:bg-zinc-50/50">
                                <td className="p-3 font-bold">Z{z.zoneNumber}</td>
                                <td className="p-3 font-semibold text-zinc-800 dark:text-zinc-200">{z.name}</td>
                                <td className="p-3 text-zinc-500">{z.minPct}% - {z.maxPct === 999 ? "MAX" : `${z.maxPct}%`}</td>
                                <td className="p-3 font-bold text-zinc-950 dark:text-zinc-50">{z.minWatts}W{z.maxPct === 999 ? "+" : ` - ${z.maxWatts}W`}</td>
                                <td className="p-3 text-zinc-500 text-[11px] font-sans">{z.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-zinc-400 font-mono text-xs text-center py-6">
                        Provide a valid CP baseline to calculate active target training zones.
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

            </div>
          )}

          {/* Sustainable Limits curve graph mapped strictly on real inputs */}
          {isAdvanced && powerDurationCurveData.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Sustainable Power-Duration Battery Curve</CardTitle>
                <CardDescription>
                  Shows your sustainable physical power output (Watts) modeled across duration intervals based on critical limits and W&apos; reserve capacity.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={powerDurationCurveData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="durationMin" label={{ value: 'Duration (Minutes)', position: 'insideBottom', offset: -5 }} stroke="#a1a1aa" fontSize={11} tickLine={false} />
                      <YAxis stroke="#18181b" fontSize={11} tickLine={false} label={{ value: 'Sustainable Watts', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Legend verticalAlign="top" height={36}/>
                      <Line type="monotone" dataKey="MaxSustainableWatts" name="Sustainable Power Limits (Watts)" stroke="#18181b" strokeWidth={2.5} activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="CriticalPowerLimit" name="Aerobic CP Limit (Steady Threshold)" stroke="#ef4444" strokeDasharray="4 4" strokeWidth={1} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Right educational methodologies column */}
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
                <div className="font-semibold text-zinc-800 dark:text-zinc-200 uppercase mb-1">Power to Weight</div>
                <p>Formula: Watts / BodyMass (kg)</p>
                <p className="mt-1 text-[10px] text-zinc-400">
                  Measures metabolic output normalized by mass. Critical predictor for incline climbing or elevation trail efficiency.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                <div className="font-semibold text-zinc-800 dark:text-zinc-200 uppercase mb-1">Power/HR (EF Value)</div>
                <p>Formula: Avg_Power / Avg_HR</p>
                <p className="mt-1 text-[10px] text-zinc-400">
                  Cardiac efficiency metric. Lower heart rate holding equivalent power levels highlights vascular system adaptation.
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md">
                <div className="font-semibold text-zinc-800 dark:text-zinc-200 uppercase mb-1 font-mono">Critical Power & W&apos;</div>
                <p>CP = (W2 - W1) / (t2 - t1)</p>
                <p>W&apos; = (Trial_Power - CP) × duration</p>
                <p className="mt-1 text-[10px] text-zinc-400">
                  CP represents aerobic steady-state threshold capacity. W&apos; represents finite anaerobic anaerobic energy reserve of metabolic substrate.
                </p>
              </div>

              <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-400 rounded-md text-[10px]">
                <span className="font-bold block uppercase mb-1">LIMITATIONS NOTE:</span>
                Mathematical estimates are precise but qualitative in nature. Track.Lab does NOT offer form diagnosis, injury prediction, or system sensor sync services. Note that running power varies across different wrist devices.
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

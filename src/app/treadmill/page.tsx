'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input, Label, Button, Select, ValidationMessage } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { LabPageHeader } from '@/components/layout/LabPageHeader';
import { 
  convertKmhToPace,
  convertKmhToMph,
  convertMphToKmh,
  convertInclinePercentToGradeDecimal,
  calculateInclineAdjustedVO2,
  buildSpeedInclineMatrix,
  calculateTreadmillCalibrationError,
  calculateTreadmillSegmentProfile
} from '@/lib/calculators_pack';
import { methodRegistry } from '@/data';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { 
  ArrowRightLeft, 
  Activity, 
  Grid, 
  Percent, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Copy, 
  FileText, 
  ShieldAlert 
} from 'lucide-react';

interface LocalSegment {
  id: number;
  name: string;
  durationMinutes: number;
  speedKmh: number;
  inclinePercent: number;
}

export default function TreadmillLab() {
  const [activeTab, setActiveTab] = useState<'conversions' | 'vo2_energy' | 'matrix' | 'calibration' | 'segments'>('conversions');
  const [isAdvanced, setIsAdvanced] = useState<boolean>(true);

  // 1. Conversions State
  const [speedKmh, setSpeedKmh] = useState('12');
  const [inclinePct, setInclinePct] = useState('1');

  // 2. VO2 & Energy State
  const [vo2Weight, setVo2Weight] = useState('70');
  const [vo2Speed, setVo2Speed] = useState('10');
  const [vo2Incline, setVo2Incline] = useState('2');
  const [vo2Mode, setVo2Mode] = useState<'running' | 'walking' | 'auto'>('running');

  // 3. Matrix State
  const [matrixBaseSpeed, setMatrixBaseSpeed] = useState('10');
  const [matrixCompareMode, setMatrixCompareMode] = useState<'running' | 'walking' | 'auto'>('running');

  // 4. Calibration State
  const [displayedSpeedKmh, setDisplayedSpeedKmh] = useState('12');
  const [beltLengthMeters, setBeltLengthMeters] = useState('2.85');
  const [measuredRevsPerMin, setMeasuredRevsPerMin] = useState('71');

  // 5. Segments State (Timeline build rows)
  const [segments, setSegments] = useState<LocalSegment[]>([
    { id: 1, name: "Warmup Interval", durationMinutes: 5, speedKmh: 9.0, inclinePercent: 1.0 },
    { id: 2, name: "Steady Pace", durationMinutes: 15, speedKmh: 11.5, inclinePercent: 1.5 },
    { id: 3, name: "Threshold Hill", durationMinutes: 8, speedKmh: 10.0, inclinePercent: 4.5 },
    { id: 4, name: "Cooldown Glide", durationMinutes: 5, speedKmh: 8.5, inclinePercent: 0.5 }
  ]);
  const [newSegName, setNewSegName] = useState('');
  const [newSegDur, setNewSegDur] = useState('5');
  const [newSegSpeed, setNewSegSpeed] = useState('10');
  const [newSegInc, setNewSegInc] = useState('1');

  // Clean Reset
  const handleReset = () => {
    setSpeedKmh('12');
    setInclinePct('1');
    setVo2Weight('70');
    setVo2Speed('10');
    setVo2Incline('2');
    setVo2Mode('running');
    setMatrixBaseSpeed('10');
    setMatrixCompareMode('running');
    setDisplayedSpeedKmh('12');
    setBeltLengthMeters('2.85');
    setMeasuredRevsPerMin('71');
    setSegments([
      { id: 1, name: "Warmup Interval", durationMinutes: 5, speedKmh: 9.0, inclinePercent: 1.0 },
      { id: 2, name: "Steady Pace", durationMinutes: 15, speedKmh: 11.5, inclinePercent: 1.5 },
      { id: 3, name: "Threshold Hill", durationMinutes: 8, speedKmh: 10.0, inclinePercent: 4.5 },
      { id: 4, name: "Cooldown Glide", durationMinutes: 5, speedKmh: 8.5, inclinePercent: 0.5 }
    ]);
  };

  // Safe numerical parsed items
  const speedNum = parseFloat(speedKmh);
  const incNum = parseFloat(inclinePct);
  const wtNum = parseFloat(vo2Weight);
  const vSpdNum = parseFloat(vo2Speed);
  const vIncNum = parseFloat(vo2Incline);
  const dSpdNum = parseFloat(displayedSpeedKmh);
  const bLthNum = parseFloat(beltLengthMeters);
  const mRevsNum = parseFloat(measuredRevsPerMin);
  const matBaseNum = parseFloat(matrixBaseSpeed);

  // Custom Validations
  const validationError = useMemo(() => {
    if (activeTab === 'conversions') {
      if (isNaN(speedNum) || speedNum <= 0) return "Treadmill speed must be a positive non-zero number.";
      if (isNaN(incNum) || incNum < 0 || incNum > 40) return "Incline must be between 0% and 40%.";
    }
    if (activeTab === 'vo2_energy') {
      if (isNaN(wtNum) || wtNum <= 0) return "Weight status must be positive.";
      if (isNaN(vSpdNum) || vSpdNum <= 0) return "Treadmill speed is required.";
      if (isNaN(vIncNum) || vIncNum < 0 || vIncNum > 40) return "Incline must stretch between 0% and 40%.";
    }
    if (activeTab === 'matrix') {
      if (isNaN(matBaseNum) || matBaseNum <= 0) return "Baseline seed speed must be positive.";
    }
    if (activeTab === 'calibration') {
      if (isNaN(dSpdNum) || dSpdNum <= 0) return "Displayed speed must be positive.";
      if (isNaN(bLthNum) || bLthNum <= 0) return "Belt loop length in meters must be positive.";
      if (isNaN(mRevsNum) || mRevsNum < 0) return "Revolutions count must be non-negative.";
    }
    return null;
  }, [activeTab, speedNum, incNum, wtNum, vSpdNum, vIncNum, dSpdNum, bLthNum, mRevsNum, matBaseNum]);

  const formatPaceFromSeconds = (seconds: number): string => {
    if (isNaN(seconds) || !isFinite(seconds) || seconds <= 0) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = Math.round(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Derived Calculations
  const res = useMemo(() => {
    if (validationError) return null;

    // 1. Conversions
    const kmPaceSec = convertKmhToPace(speedNum);
    const speedMph = convertKmhToMph(speedNum);
    const milePaceSec = convertKmhToPace(speedMph);
    
    const pacePerKm = formatPaceFromSeconds(kmPaceSec);
    const pacePerMile = formatPaceFromSeconds(milePaceSec);

    // 2. VO2 & Energy
    const acsmVO2 = calculateInclineAdjustedVO2(vSpdNum, vIncNum, vo2Mode);
    const mets = acsmVO2 / 3.5;
    const minCalories = mets * 1.05 * wtNum * (1 / 60);
    const hourCalories = mets * 1.05 * wtNum * 1;

    // 3. Matrix Table
    const speedsCompareList = [matBaseNum - 2, matBaseNum - 1, matBaseNum, matBaseNum + 1, matBaseNum + 2].filter(s => s > 0);
    const inclinesCompareList = [0, 1, 2, 4, 6, 8, 10, 12];
    const rawMatrixData = buildSpeedInclineMatrix(speedsCompareList, inclinesCompareList, matrixCompareMode);

    // 4. Calibration
    // Measured distance = Belt length * revolutions
    const measuredDistanceM = bLthNum * mRevsNum;
    // In speed comparison: Treadmill is running measured distance per minute
    const actualSpeedKmhVal = (measuredDistanceM * 60) / 1000;
    const calObj = calculateTreadmillCalibrationError(dSpdNum, actualSpeedKmhVal);

    // 5. Segment Profile
    const formattedSegments = segments.map(s => ({
      durationSeconds: s.durationMinutes * 60,
      speedKmh: s.speedKmh,
      inclinePercent: s.inclinePercent
    }));
    const profileAnalysisRaw = calculateTreadmillSegmentProfile(formattedSegments, wtNum, vo2Mode);

    return {
      pacePerKm,
      pacePerMile,
      gradePct: incNum,
      vo2: acsmVO2,
      mets,
      minCalories,
      hourCalories,
      matrix: rawMatrixData,
      calibration: {
        actualSpeedKmh: actualSpeedKmhVal,
        percentageError: calObj.errorPercent,
        errorLabel: calObj.errorPercent > 2 ? "Over-Reporting" : calObj.errorPercent < -2 ? "Under-Reporting" : "Calibrated",
        guidanceNote: calObj.guidanceNote
      },
      profileAnalysis: {
        totalDurationMins: Math.round(profileAnalysisRaw.totalDurationSeconds / 60),
        totalVerticalGainMeters: profileAnalysisRaw.totalDistanceKm * 1000 * (profileAnalysisRaw.averageInclinePercent / 100),
        totalCaloriesBurned: profileAnalysisRaw.totalCaloriesKcal,
        averageSpeedKmh: profileAnalysisRaw.averageSpeedKmh,
        averageInclinePercent: profileAnalysisRaw.averageInclinePercent,
        segments: profileAnalysisRaw.segments.map((seg, idx) => ({
          ...seg,
          name: segments[idx]?.name || `Seg ${idx + 1}`,
          durationMinutes: Math.round(seg.durationSeconds / 60)
        })),
        chartPoints: profileAnalysisRaw.timelineChartPoints
      }
    };
  }, [validationError, speedNum, incNum, wtNum, vSpdNum, vIncNum, vo2Mode, matBaseNum, matrixCompareMode, dSpdNum, bLthNum, mRevsNum, segments]);

  // Insert Custom segment timeline row
  const handleAddSegment = (e: React.FormEvent) => {
    e.preventDefault();
    const durVal = parseFloat(newSegDur);
    const spdVal = parseFloat(newSegSpeed);
    const incVal = parseFloat(newSegInc);

    if (isNaN(durVal) || durVal <= 0 || isNaN(spdVal) || spdVal <= 0 || isNaN(incVal) || incVal < 0) {
      alert("Invalid segment values. Speed & Duration must be positive.");
      return;
    }

    const nRow: LocalSegment = {
      id: segments.length > 0 ? Math.max(...segments.map(s => s.id)) + 1 : 1,
      name: newSegName.trim() || `Interval ${segments.length + 1}`,
      durationMinutes: durVal,
      speedKmh: spdVal,
      inclinePercent: incVal
    };

    setSegments([...segments, nRow]);
    setNewSegName('');
    setNewSegDur('5');
    setNewSegSpeed('11');
    setNewSegInc('1.5');
  };

  const handleRemoveSegment = (id: number) => {
    setSegments(segments.filter(s => s.id !== id));
  };

  // Report Copy
  const handleCopy = () => {
    if (!res) return;
    let txt = `Track.Lab Treadmill Diagnostics\n--------------------------------\n`;
    if (activeTab === 'conversions') {
      txt += `Pace / Speed:\n- Input speed: ${speedKmh} km/h\n- Calculated Pace: ${res.pacePerKm} /km | ${res.pacePerMile} /mile\n- Incline: ${inclinePct}%\n`;
    } else if (activeTab === 'vo2_energy') {
      txt += `Oxygen & Load:\n- ACSM VO2: ${res.vo2.toFixed(1)} ml/kg/min\n- MET demand: ${res.mets.toFixed(1)} METs\n- Calorie hourly cost: ${res.hourCalories.toFixed(0)} kcal/hr\n`;
    } else if (activeTab === 'matrix') {
      txt += `Incline Matrix Profile for base ${matrixBaseSpeed} km/h\n`;
    } else if (activeTab === 'calibration') {
      txt += `Diagnostic calibrate:\n- Actual Speed: ${res.calibration.actualSpeedKmh.toFixed(2)} km/h\n- Shift error: ${res.calibration.percentageError.toFixed(2)}%\n- Diagnosis: ${res.calibration.errorLabel}\n`;
    } else {
      txt += `Segments summary:\n- Duration: ${res.profileAnalysis.totalDurationMins}m\n- Calories Burned: ${res.profileAnalysis.totalCaloriesBurned.toFixed(0)} kcal\n- Climbed meters: ${res.profileAnalysis.totalVerticalGainMeters.toFixed(0)}m\n`;
    }
    txt += `\nDisclaimer: Manual estimates based on ACSM equations. Theoretical variables vary. Not medical/clinical advice.`;
    navigator.clipboard.writeText(txt);
    alert("Copied treadmill report!");
  };

  const handleExportJSON = () => {
    if (!res) return;
    const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
      module: "Treadmill Lab Page",
      activeSubModule: activeTab,
      timestamp: new Date().toISOString(),
      inputsApplied: { speedKmh, inclinePct, vo2Weight, vo2Speed, vo2Incline, vo2Mode, displayedSpeedKmh, beltLengthMeters, measuredRevsPerMin },
      outcomes: {
        paceKm: res.pacePerKm,
        paceMile: res.pacePerMile,
        calculatedVO2: res.vo2,
        mets: res.mets,
        caloriesPerHour: res.hourCalories,
        calibrationErrorPct: res.calibration.percentageError
      }
    }, null, 2));

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", jsonStr);
    downloadAnchor.setAttribute("download", "tracklab_treadmill_export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const activeMethodMeta = useMemo(() => {
    const tabToId: Record<string, string> = {
      conversions: 'pace_to_kmh',
      vo2_energy: 'acsm_treadmill_running_vo2',
      matrix: 'speed_incline_matrix',
      calibration: 'treadmill_calibration_error',
      segments: 'treadmill_segment_profile'
    };
    return methodRegistry.find(m => m.id === tabToId[activeTab]) || {
      name: "Treadmill Performance Mechanics",
      formulaDisplay: "Metabolic and mathematical treadmill kinematics.",
      precision: "exact_formula",
      limitations: ["ACSM equations assume standardized biological metabolic efficiencies and steady state dynamics."]
    };
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <LabPageHeader 
        title="TREADMILL LAB" 
        subtitle="Calibrate belt velocity metrics, map exact incline-to-speed equivalents, and perform ACSM-pattern metabolic energy formulas." 
      />

      {/* Controller headers */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-50 border-2 border-border-heavy p-4 rounded-xl shadow-[1px_1px_0px_rgba(23,23,23,1)]">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={isAdvanced ? "primary" : "outline"} 
            onClick={() => setIsAdvanced(true)}
            className="text-xs uppercase tracking-wider font-extrabold"
          >
            Advanced Calibration Mode
          </Button>
          <Button 
            variant={!isAdvanced ? "primary" : "outline"} 
            onClick={() => setIsAdvanced(false)}
            className="text-xs uppercase tracking-wider font-extrabold"
          >
            Quick Conversions Mode
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleReset} variant="outline" className="flex items-center text-xs h-9 py-1 px-3">
            <RefreshCw className="h-3 w-3 mr-1" /> Reset Inputs
          </Button>
          <Button onClick={handleCopy} variant="outline" className="flex items-center text-xs h-9 py-1 px-3" disabled={!!validationError}>
            <Copy className="h-3 w-3 mr-1" /> Copy Report
          </Button>
          <Button onClick={handleExportJSON} variant="outline" className="flex items-center text-xs h-9 py-1 px-3" disabled={!!validationError}>
            <FileText className="h-3 w-3 mr-1" /> Save JSON
          </Button>
        </div>
      </div>

      {validationError && (
        <Card className="border-2 border-destructive shadow-[2px_2px_0px_rgba(232,76,61,1)]">
          <CardContent className="pt-6 space-y-2">
            <div className="flex items-center">
              <ShieldAlert className="h-4 w-4 text-destructive mr-2" />
              <span className="font-bold text-destructive">User Input Validation Alert</span>
            </div>
            <p className="text-sm font-medium text-foreground">{validationError}</p>
          </CardContent>
        </Card>
      )}

      {/* Grid structure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Navigation & Input variables */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-2 border-border-heavy rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
            <CardHeader className="bg-zinc-50 border-b-2 border-border-heavy py-3">
              <CardTitle className="text-sm font-black uppercase tracking-wider">Sub-Modules</CardTitle>
            </CardHeader>
            <CardContent className="p-2 flex flex-col gap-1">
              <button
                onClick={() => { setActiveTab('conversions'); setIsAdvanced(true); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${activeTab === 'conversions' ? 'bg-primary text-primary-foreground font-black shadow-[1px_1px_0px_rgba(23,23,23,1)]' : 'hover:bg-zinc-100 text-foreground'}`}
              >
                <span>🔄 Pace & Speed Conversions</span>
                {res && <span className="text-[10px] uppercase font-mono">{speedKmh} km/h</span>}
              </button>
              <button
                onClick={() => { setActiveTab('vo2_energy'); setIsAdvanced(true); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${activeTab === 'vo2_energy' ? 'bg-primary text-primary-foreground font-black shadow-[1px_1px_0px_rgba(23,23,23,1)]' : 'hover:bg-zinc-100 text-foreground'}`}
              >
                <span>⚡ ACSM Incline & Oxygen (VO₂)</span>
                {res && <span className="text-[10px] uppercase font-mono">{res.vo2.toFixed(0)} VO₂</span>}
              </button>
              <button
                onClick={() => { setActiveTab('matrix'); setIsAdvanced(true); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${activeTab === 'matrix' ? 'bg-primary text-primary-foreground font-black shadow-[1px_1px_0px_rgba(23,23,23,1)]' : 'hover:bg-zinc-100 text-foreground'}`}
              >
                <span>📊 Incline Equivalent Matrix</span>
                <span className="text-[10px] uppercase bg-black/10 px-1.5 rounded font-mono">Slope chart</span>
              </button>
              <button
                onClick={() => { setActiveTab('calibration'); setIsAdvanced(true); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${activeTab === 'calibration' ? 'bg-primary text-primary-foreground font-black shadow-[1px_1px_0px_rgba(23,23,23,1)]' : 'hover:bg-zinc-100 text-foreground'}`}
              >
                <span>🎯 Belt Calibration Errors</span>
                {res && <span className="text-[10px] uppercase font-mono">{res.calibration.percentageError.toFixed(1)}%</span>}
              </button>
              <button
                onClick={() => { setActiveTab('segments'); setIsAdvanced(true); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between border-t border-dashed border-border-heavy mt-2 ${activeTab === 'segments' ? 'bg-zinc-900 text-white font-black shadow-[1px_1px_0px_rgba(23,23,23,1)]' : 'hover:bg-zinc-100 text-foreground'}`}
              >
                <span className="flex items-center text-primary dark:text-foreground">🎬 Workout Segment Profile</span>
                <span className="text-[10px] uppercase bg-black/10 px-1.5 rounded font-mono">{segments.length} rows</span>
              </button>
            </CardContent>
          </Card>

          {/* Form parameters */}
          <Card className="border-2 border-border-heavy rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
            <CardHeader className="bg-zinc-50 border-b-2 border-border-heavy py-3">
              <CardTitle className="text-sm font-black uppercase tracking-wider">Calibration Parameters</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              
              {activeTab === 'conversions' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="speedKmh">Workout Target Speed (km/h)</Label>
                    <Input id="speedKmh" type="number" step="0.1" value={speedKmh} onChange={e => setSpeedKmh(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="inclinePct">Incline Gradient (%)</Label>
                    <Input id="inclinePct" type="number" step="0.5" value={inclinePct} onChange={e => setInclinePct(e.target.value)} required />
                  </div>
                </div>
              )}

              {activeTab === 'vo2_energy' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="vo2Speed">Speed (km/h)</Label>
                      <Input id="vo2Speed" type="number" step="0.1" value={vo2Speed} onChange={e => setVo2Speed(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="vo2Incline">Incline (%)</Label>
                      <Input id="vo2Incline" type="number" value={vo2Incline} onChange={e => setVo2Incline(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="vo2Weight">User Body Mass (kg)</Label>
                    <Input id="vo2Weight" type="number" value={vo2Weight} onChange={e => setVo2Weight(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="vo2Mode">ACSM Formula Standard</Label>
                    <Select id="vo2Mode" value={vo2Mode} onChange={e => setVo2Mode(e.target.value as any)}>
                      <option value="running">ACSM Running Equation (≥ 8.0 km/h)</option>
                      <option value="walking">ACSM Walking Equation (≤ 6.0 km/h)</option>
                      <option value="auto">Auto Select (by speed threshold)</option>
                    </Select>
                  </div>
                </div>
              )}

              {activeTab === 'matrix' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="matrixBaseSpeed">Baseline Pace Speed (km/h)</Label>
                    <Input id="matrixBaseSpeed" type="number" value={matrixBaseSpeed} onChange={e => setMatrixBaseSpeed(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="matrixCompareMode">ACSM Pattern</Label>
                    <Select id="matrixCompareMode" value={matrixCompareMode} onChange={e => setMatrixCompareMode(e.target.value as any)}>
                      <option value="running">Running Equation Model</option>
                      <option value="walking">Walking Equation Model</option>
                      <option value="auto">Auto speed trigger</option>
                    </Select>
                  </div>
                </div>
              )}

              {activeTab === 'calibration' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="displayedSpeedKmh">Displayed Screen Speed (km/h)</Label>
                    <Input id="displayedSpeedKmh" type="number" step="0.1" value={displayedSpeedKmh} onChange={e => setDisplayedSpeedKmh(e.target.value)} required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="beltLengthMeters">Belt Length (meters)</Label>
                      <Input id="beltLengthMeters" type="number" step="0.01" value={beltLengthMeters} onChange={e => setBeltLengthMeters(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="measuredRevsPerMin">Belt Revolutions / 60s</Label>
                      <Input id="measuredRevsPerMin" type="number" value={measuredRevsPerMin} onChange={e => setMeasuredRevsPerMin(e.target.value)} required />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'segments' && (
                <form onSubmit={handleAddSegment} className="space-y-3">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase border-b pb-1">Append Timeline Workout Segment:</div>
                  <div className="space-y-1">
                    <Label htmlFor="newSegName">Segment Name</Label>
                    <Input id="newSegName" type="text" placeholder="e.g. Ramp Interval" value={newSegName} onChange={e => setNewSegName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="newSegDur">Dur (min)</Label>
                      <Input id="newSegDur" type="number" value={newSegDur} onChange={e => setNewSegDur(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="newSegSpeed">Speed (km/h)</Label>
                      <Input id="newSegSpeed" type="number" step="0.1" value={newSegSpeed} onChange={e => setNewSegSpeed(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="newSegInc">Inc (%)</Label>
                      <Input id="newSegInc" type="number" step="0.5" value={newSegInc} onChange={e => setNewSegInc(e.target.value)} />
                    </div>
                  </div>
                  <Button type="submit" className="w-full mt-1.5 font-bold"><Plus className="h-4 w-4 mr-1" /> Append Row</Button>
                </form>
              )}

            </CardContent>
          </Card>
        </div>

        {/* Diagnostic Results */}
        <div className="lg:col-span-2 space-y-6">
          {!isAdvanced ? (
            /* Quick summary */
            <Card className="border-2 border-border-heavy rounded-xl shadow-[4px_4px_0px_rgba(23,23,23,1)] overflow-hidden">
              <div className="bg-zinc-900 border-b-2 border-border-heavy px-6 py-3">
                <h3 className="text-xs font-black uppercase text-white tracking-widest">TREADMILL KINEMATIC DIAGNOSTICS</h3>
              </div>
              <CardContent className="p-6 space-y-6">
                {res ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border-2 border-border-heavy rounded-xl bg-zinc-50 font-mono space-y-1">
                      <div className="text-[10px] text-muted-foreground uppercase font-sans font-extrabold tracking-widest">Calculated Pace</div>
                      <div className="text-xl font-black text-foreground">
                        {res.pacePerKm} /km ({res.pacePerMile} /mi)
                      </div>
                      <div className="text-xs text-muted-foreground font-sans">Speed conversion at {speedKmh} km/h</div>
                    </div>

                    <div className="p-4 border-2 border-border-heavy rounded-xl bg-zinc-50 font-mono space-y-1">
                      <div className="text-[10px] text-muted-foreground uppercase font-sans font-extrabold tracking-widest">Estimated VO₂ Demand</div>
                      <div className="text-xl font-black text-foreground">{res.vo2.toFixed(1)} ml/kg/min</div>
                      <div className="text-xs text-muted-foreground font-sans">{res.mets.toFixed(1)} metabolic MET equivalent</div>
                    </div>

                    <div className="p-4 border-2 border-border-heavy rounded-xl bg-zinc-50 font-mono space-y-1">
                      <div className="text-[10px] text-muted-foreground uppercase font-sans font-extrabold tracking-widest">Calibration Error</div>
                      <div className="text-xl font-black text-foreground">{res.calibration.percentageError.toFixed(2)}% error</div>
                      <div className="text-xs text-muted-foreground font-sans">{res.calibration.errorLabel}</div>
                    </div>

                    <div className="p-4 border-2 border-border-heavy rounded-xl bg-zinc-50 font-mono space-y-1">
                      <div className="text-[10px] text-muted-foreground uppercase font-sans font-extrabold tracking-widest">Estimated Energy Cost</div>
                      <div className="text-xl font-black text-zinc-900">~{res.hourCalories.toFixed(0)} kcal/hr</div>
                      <div className="text-xs text-muted-foreground font-sans">Based on weight {vo2Weight} kg</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-muted-foreground italic">Input core parameters to prompt quick kinematics layout.</p>
                )}

                <div className="pt-4 border-t border-zinc-200">
                  <div className="text-xs uppercase tracking-wider font-extrabold text-muted-foreground mb-2">Cross-Module Integration References:</div>
                  <ul className="text-xs space-y-1 text-foreground list-disc list-inside">
                    <li><span className="font-bold text-primary">Cross-Link:</span> Map these ACSM oxygen demands to aerobic estimates inside our <a href="/vo2" className="font-bold underline text-primary">VO₂ Lab Page</a>.</li>
                    <li>Utilize treadmill segment calories inside our holistic <a href="/fuel" className="font-bold underline text-primary">Fuel Lab</a> hydration charts.</li>
                    <li>Port your manual calibration indices to the official calibration protocol checklist in your manual training records.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Advanced Sub-module details */
            <div className="space-y-6">
              
              <Card className="border-2 border-border-heavy rounded-xl shadow-[4px_4px_0px_rgba(23,23,23,1)]">
                <CardHeader className="bg-primary text-primary-foreground border-b-2 border-border-heavy">
                  <CardTitle className="text-base font-black uppercase tracking-wider flex items-center justify-between">
                    <span>{activeMethodMeta.name}</span>
                    <span className="bg-black/25 text-white font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-white/20">
                      {activeMethodMeta.precision?.replace('_', ' ') || "exact_formula"}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  
                  {res ? (
                    <div className="space-y-6">
                      
                      {activeTab === 'conversions' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-zinc-50 border-2 border-border-heavy p-4 rounded-xl font-mono text-center">
                              <div className="text-xs font-sans font-bold text-muted-foreground uppercase">Calculated Pace per Kilometer</div>
                              <div className="text-2xl font-black text-foreground mt-1.5">{res.pacePerKm} min/km</div>
                              <div className="text-xs text-muted-foreground font-sans mt-0.5">({(speedNum / 1.609344).toFixed(1)} mph display equivalent)</div>
                            </div>
                            <div className="bg-zinc-50 border-2 border-border-heavy p-4 rounded-xl font-mono text-center">
                              <div className="text-xs font-sans font-bold text-muted-foreground uppercase">Calculated Pace per Mile</div>
                              <div className="text-2xl font-black text-foreground mt-1.5">{res.pacePerMile} min/mile</div>
                              <div className="text-xs text-muted-foreground font-sans mt-0.5">Incline Grade decimal: {convertInclinePercentToGradeDecimal(incNum).toFixed(3)}</div>
                            </div>
                          </div>

                          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-sans leading-relaxed text-zinc-700">
                            <strong>Note on Road vs. Treadmill:</strong> Due to lack of air resistance and treadmill belt helper assistance, running on a treadmill at 0% incline is metabolically easier than flat road running. Setting incline to 1% is commonly used to approximate road effort at typical training paces.
                          </div>
                        </div>
                      )}

                      {activeTab === 'vo2_energy' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-zinc-50 border-2 border-border-heavy p-4 rounded-xl font-mono text-center">
                              <div className="text-xs font-sans font-bold text-muted-foreground uppercase">ACSM VO₂ Oxygen Request</div>
                              <div className="text-2xl font-black text-foreground mt-1">{res.vo2.toFixed(1)} ml/kg/min</div>
                              <div className="text-[10px] text-zinc-500 font-sans mt-1">Steady State limit model</div>
                            </div>
                            <div className="bg-zinc-50 border-2 border-border-heavy p-4 rounded-xl font-mono text-center">
                              <div className="text-xs font-sans font-bold text-muted-foreground uppercase">Metabolic Load (METs)</div>
                              <div className="text-2xl font-black text-foreground mt-1">{res.mets.toFixed(1)} METs</div>
                              <div className="text-[10px] text-zinc-500 font-sans mt-1">Multiples of resting metabolic rate</div>
                            </div>
                            <div className="bg-zinc-50 border-2 border-border-heavy p-4 rounded-xl font-mono text-center">
                              <div className="text-xs font-sans font-bold text-muted-foreground uppercase">Caloric Expenditure</div>
                              <div className="text-xl font-black text-foreground mt-1">{res.hourCalories.toFixed(0)} kcal/hr</div>
                              <div className="text-[10px] text-zinc-500 font-sans mt-1">For weight {vo2Weight} kg</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'matrix' && (
                        <div className="space-y-4">
                          <div className="text-xs font-bold text-foreground">
                            Speed Incline Equi-effort Matrix (Base speed: <span className="font-mono text-primary font-black">{matrixBaseSpeed} km/h</span> at <span className="font-mono text-primary font-black">1% Incline</span>)
                          </div>
                          
                          <div className="border-2 border-border-heavy rounded-xl overflow-hidden shadow-[1px_1px_0px_rgba(23,23,23,1)] bg-white text-xs">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-zinc-900 text-white font-extrabold uppercase text-[10px] tracking-widest leading-none py-3 border-b-2 border-border-heavy">
                                  <th className="p-3">Core Speed</th>
                                  <th className="p-3 font-mono">Incline 0%</th>
                                  <th className="p-3 font-mono">Incline 1%</th>
                                  <th className="p-3 font-mono">Incline 2%</th>
                                  <th className="p-3 font-mono">Incline 4%</th>
                                  <th className="p-3 font-mono">Incline 6%</th>
                                  <th className="p-3 font-mono">Incline 8%</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y border-t border-border-light font-mono text-zinc-800">
                                {res.matrix.map((row, idx) => (
                                  <tr key={row.speedKmh} className={idx % 2 === 0 ? "bg-zinc-50/50" : "bg-white"}>
                                    <td className="p-3 font-bold">{row.speedKmh} km/h</td>
                                    {row.inclineVals.map(v => (
                                      <td key={v.inclinePercent} className="p-3">
                                        <div className="font-black text-primary">{v.vo2.toFixed(1)}</div>
                                        <div className="text-[9px] text-muted-foreground">({v.met.toFixed(1)}M)</div>
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {activeTab === 'calibration' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-zinc-50 border-2 border-border-heavy p-4 rounded-xl font-mono text-center">
                              <div className="text-xs font-sans font-bold text-muted-foreground uppercase">Actual Measured Speed</div>
                              <div className="text-2xl font-black text-foreground mt-1">{res.calibration.actualSpeedKmh.toFixed(2)} km/h</div>
                              <div className="text-xs text-muted-foreground font-sans mt-1">({(res.calibration.actualSpeedKmh * 0.621371).toFixed(2)} mph)</div>
                            </div>
                            <div className="bg-zinc-50 border-2 border-border-heavy p-4 rounded-xl font-mono text-center">
                              <div className="text-xs font-sans font-bold text-muted-foreground uppercase">Inaccuracy drift error</div>
                              <div className="text-2xl font-black text-primary mt-1">{res.calibration.percentageError.toFixed(2)} %</div>
                              <div className="text-xs text-muted-foreground font-sans mt-1">Percentage speed drift</div>
                            </div>
                            <div className="bg-zinc-50 border-2 border-border-heavy p-4 rounded-xl font-mono text-center">
                              <div className="text-xs font-sans font-bold text-muted-foreground uppercase">Calibration status</div>
                              <div className="text-lg font-black text-foreground uppercase tracking-wider mt-2">{res.calibration.errorLabel}</div>
                              <div className="text-[10px] text-muted-foreground font-sans mt-0.5">Discrepancy validation</div>
                            </div>
                          </div>

                          <div className="p-4 bg-amber-50/50 border-l-4 border-amber-500 rounded-lg text-xs font-sans text-zinc-800 leading-relaxed space-y-2">
                            <div className="font-bold flex items-center text-amber-800">
                              <ShieldAlert className="h-4 w-4 mr-1" /> Calibration Diagnostic Warning:
                            </div>
                            <p>{res.calibration.guidanceNote}</p>
                          </div>
                        </div>
                      )}

                      {activeTab === 'segments' && (
                        <div className="space-y-6">
                          
                          {/* Segment rows custom builder */}
                          <div className="border-2 border-border-heavy rounded-xl overflow-hidden shadow-[1px_1px_0px_rgba(23,23,23,1)] bg-white text-xs">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-zinc-900 text-white font-extrabold uppercase text-[10px] tracking-wide border-b-2 border-border-heavy">
                                  <th className="p-3">Segment Name</th>
                                  <th className="p-3">Duration (min)</th>
                                  <th className="p-3">Speed (km/h)</th>
                                  <th className="p-3">Incline (%)</th>
                                  <th className="p-3">Vert Gain (m)</th>
                                  <th className="p-3">Est. Energy (kcal)</th>
                                  <th className="p-3 text-center">Delete</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y border-t border-border-light font-mono text-foreground">
                                {res.profileAnalysis.segments.map((s, idx) => (
                                  <tr key={s.id} className={idx % 2 === 0 ? "bg-zinc-50/50" : "bg-white"}>
                                    <td className="p-3 font-bold font-sans">{s.name}</td>
                                    <td className="p-3">{s.durationMinutes} min</td>
                                    <td className="p-3">{s.speedKmh.toFixed(1)} km/h</td>
                                    <td className="p-3 text-primary font-bold">{s.inclinePercent}%</td>
                                    <td className="p-3">+{s.distanceKm ? (s.distanceKm * 1000 * (s.inclinePercent / 100)).toFixed(0) : 0} m</td>
                                    <td className="p-3">{res.profileAnalysis.totalCaloriesBurned > 0 ? (res.profileAnalysis.totalCaloriesBurned * (s.durationMinutes / res.profileAnalysis.totalDurationMins)).toFixed(0) : 0} kcal</td>
                                    <td className="p-3 text-center">
                                      <button 
                                        type="button" 
                                        onClick={() => handleRemoveSegment(s.id)} 
                                        className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                                {res.profileAnalysis.segments.length === 0 && (
                                  <tr>
                                    <td colSpan={7} className="p-6 text-center text-muted-foreground italic font-sans" id="empty-treadmill-seg">No workout segments. Append timeline intervals on the left.</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>

                          {/* Sum metrics */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono">
                            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                              <div className="text-[9px] text-muted-foreground font-sans uppercase">Total duration</div>
                              <div className="font-extrabold text-foreground text-sm mt-0.5">{res.profileAnalysis.totalDurationMins} mins</div>
                            </div>
                            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                              <div className="text-[9px] text-muted-foreground font-sans uppercase">Weighted Mean Speed</div>
                              <div className="font-extrabold text-foreground text-sm mt-0.5">{res.profileAnalysis.averageSpeedKmh.toFixed(1)} km/h</div>
                            </div>
                            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                              <div className="text-[9px] text-muted-foreground font-sans uppercase">Sum Vert Climb</div>
                              <div className="font-extrabold text-foreground text-sm mt-0.5 text-primary">+{res.profileAnalysis.totalVerticalGainMeters.toFixed(0)} m</div>
                            </div>
                            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                              <div className="text-[9px] text-muted-foreground font-sans uppercase">Total Energy Cost</div>
                              <div className="font-extrabold text-foreground text-sm mt-0.5 font-bold">~{res.profileAnalysis.totalCaloriesBurned.toFixed(0)} kcal</div>
                            </div>
                          </div>

                          {/* Recharts Treadmill segments bar/area chart */}
                          {res.profileAnalysis.segments.length > 0 && (
                            <div className="border-2 border-border-heavy rounded-xl p-4 bg-white shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                              <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-between">
                                <span>📈 Segment Timeline Progression Profile Chart (Incline vs Speed)</span>
                              </div>
                              <div className="h-60 w-full font-mono text-xs">
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={res.profileAnalysis.chartPoints} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                    <defs>
                                      <linearGradient id="colorSpeed" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#18181b" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#18181b" stopOpacity={0}/>
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="timeMin" type="number" name="Time" unit="min" />
                                    <YAxis />
                                    <Tooltip />
                                    <Legend />
                                    <Area type="stepAfter" name="Speed (km/h)" dataKey="speed" stroke="#18181b" fillOpacity={1} fill="url(#colorSpeed)" />
                                    <Area type="stepAfter" name="Incline (%)" dataKey="incline" stroke="#ef4444" fillOpacity={0.1} fill="#ef4444" />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          )}

                        </div>
                      )}

                      {/* Trace formulas */}
                      <div className="p-4 border-2 border-border-heavy rounded-xl space-y-2 font-mono text-xs text-left bg-zinc-50">
                        <div>
                          <span className="font-bold text-muted-foreground uppercase">Mathematical Formula Trace:</span>
                          <div className="bg-white border rounded p-2 text-foreground font-sans text-[11px] mt-1 break-all">
                            {activeMethodMeta.formulaDisplay}
                          </div>
                        </div>
                        <div className="pt-2 border-t border-dashed border-zinc-200 text-slate-500 font-sans text-[10px] leading-relaxed">
                          Treadmill ACSM steady state and conversion formulas demonstrate statistical norms. General cardiovascular capacities, room ventilation states, personal mechanic patterns, and device sensor wears heavily modify real-world caloric rates and performance margins. Under no circumstances represents medical/metabolic diagnostic claims.
                        </div>
                      </div>

                    </div>
                  ) : (
                    <p className="text-center font-mono italic text-sm text-zinc-400">Awaiting input values to trigger telemetry calculations...</p>
                  )}

                </CardContent>
              </Card>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}

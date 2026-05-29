'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input, Label, Button, Select, ValidationMessage } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { LabPageHeader } from '@/components/layout/LabPageHeader';
import { 
  calculateGradePercent, 
  calculateElevationPerKm, 
  calculateElevationPerMile, 
  calculateVerticalSpeed, 
  calculateVAM, 
  calculateClimbDensity, 
  calculateDescentDensity, 
  calculateGainLossRatio, 
  calculateNetElevation, 
  calculateHillRepeatVolume, 
  calculateHillRepeatTime, 
  calculateSegmentGrade, 
  calculateSegmentDifficulty, 
  calculateEquivalentFlatDistance, 
  buildManualElevationProfile,
  ManualSegment 
} from '@/lib/calculators_pack';
import { methodRegistry } from '@/data';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { 
  Compass, 
  ArrowUpRight, 
  Timer, 
  TrendingUp, 
  Plus, 
  Trash2, 
  RefreshCw, 
  Copy, 
  FileText, 
  Activity, 
  MapPin, 
  ShieldAlert 
} from 'lucide-react';

export default function TrailElevationLab() {
  const [activeTab, setActiveTab] = useState<'grade' | 'vertical_metrics' | 'hill_repeats' | 'segment_builder' | 'trail_difficulty'>('grade');
  const [isAdvanced, setIsAdvanced] = useState<boolean>(true);

  // Grade State
  const [horizontalDistance, setHorizontalDistance] = useState('2000');
  const [elevationGain, setElevationGain] = useState('100');

  // Vertical Metrics State
  const [totalGain, setTotalGain] = useState('600');
  const [durationMins, setDurationMins] = useState('60');
  const [distanceKm, setDistanceKm] = useState('10');

  // Hill Repeats State
  const [hillReps, setHillReps] = useState('8');
  const [gainPerRep, setGainPerRep] = useState('20');
  const [workSeconds, setWorkSeconds] = useState('120');
  const [recSeconds, setRecSeconds] = useState('90');
  const [restPolicy, setRestPolicy] = useState<'between' | 'after'>('between');

  // Segment Builder State (Initial template rows)
  const [segments, setSegments] = useState<ManualSegment[]>([
    { name: "Initial Climb", distanceKm: 1.5, gainMeters: 120, lossMeters: 0, surface: "trail", technicality: "medium" },
    { name: "Ridge Traverse", distanceKm: 3.0, gainMeters: 40, lossMeters: 30, surface: "gravel", technicality: "low" },
    { name: "Scree Descent", distanceKm: 1.2, gainMeters: 10, lossMeters: 150, surface: "trail", technicality: "high" }
  ]);
  const [newSegName, setNewSegName] = useState('');
  const [newSegDist, setNewSegDist] = useState('1.0');
  const [newSegGain, setNewSegGain] = useState('50');
  const [newSegLoss, setNewSegLoss] = useState('10');
  const [newSegSurface, setNewSegSurface] = useState('trail');
  const [newSegTech, setNewSegTech] = useState<'low' | 'medium' | 'high'>('medium');

  // Difficulty Calculator State (single item reference)
  const [diffDist, setDiffDist] = useState('5.0');
  const [diffGain, setDiffGain] = useState('300');
  const [diffSurface, setDiffSurface] = useState('trail');
  const [diffTech, setDiffTech] = useState<'low' | 'medium' | 'high'>('medium');

  // Clean Reset
  const handleReset = () => {
    setHorizontalDistance('2000');
    setElevationGain('100');
    setTotalGain('600');
    setDurationMins('60');
    setDistanceKm('10');
    setHillReps('8');
    setGainPerRep('20');
    setWorkSeconds('120');
    setRecSeconds('90');
    setRestPolicy('between');
    setDiffDist('5.0');
    setDiffGain('300');
    setDiffSurface('trail');
    setDiffTech('medium');
    setSegments([
      { name: "Initial Climb", distanceKm: 1.5, gainMeters: 120, lossMeters: 0, surface: "trail", technicality: "medium" },
      { name: "Ridge Traverse", distanceKm: 3.0, gainMeters: 40, lossMeters: 30, surface: "gravel", technicality: "low" },
      { name: "Scree Descent", distanceKm: 1.2, gainMeters: 10, lossMeters: 150, surface: "trail", technicality: "high" }
    ]);
  };

  // Live validation calculation
  const validationError = useMemo(() => {
    if (activeTab === 'grade') {
      const dist = parseFloat(horizontalDistance);
      if (isNaN(dist) || dist <= 0) return "Horizontal distance must be a positive non-zero number.";
      if (isNaN(parseFloat(elevationGain))) return "Elevation gain must be a valid number.";
    }
    if (activeTab === 'vertical_metrics') {
      const gain = parseFloat(totalGain);
      const minutes = parseFloat(durationMins);
      const distKm = parseFloat(distanceKm);
      if (isNaN(gain) || gain < 0) return "Total elevation gain must be a non-negative number.";
      if (isNaN(minutes) || minutes <= 0) return "Duration must be positive.";
      if (isNaN(distKm) || distKm <= 0) return "Distance must be positive.";
    }
    if (activeTab === 'hill_repeats') {
      const reps = parseInt(hillReps);
      const gp = parseFloat(gainPerRep);
      const ws = parseFloat(workSeconds);
      const rs = parseFloat(recSeconds);
      if (isNaN(reps) || reps < 1) return "Hill reps must be at least 1.";
      if (isNaN(gp) || gp < 0) return "Gain per rep must be non-negative.";
      if (isNaN(ws) || ws <= 0 || isNaN(rs) || rs < 0) return "Work duration must be positive; recovery must be non-negative.";
    }
    if (activeTab === 'trail_difficulty') {
      const dd = parseFloat(diffDist);
      const dg = parseFloat(diffGain);
      if (isNaN(dd) || dd <= 0) return "Distance must be positive.";
      if (isNaN(dg) || dg < 0) return "Elevation gain must be non-negative.";
    }
    return null;
  }, [activeTab, horizontalDistance, elevationGain, totalGain, durationMins, distanceKm, hillReps, gainPerRep, workSeconds, recSeconds, diffDist, diffGain]);

  // Derived calculations
  const res = useMemo(() => {
    if (validationError) return null;

    // 1. Grade Specs
    const gDist = parseFloat(horizontalDistance);
    const gGain = parseFloat(elevationGain);
    const gradePercent = calculateGradePercent(gGain, gDist);
    // Flat equivalent distance
    const flatEquivalent = calculateEquivalentFlatDistance(gDist / 1000, gGain);

    // 2. Vertical metrics
    const vmGain = parseFloat(totalGain);
    const vmMins = parseFloat(durationMins);
    const vmDistKm = parseFloat(distanceKm);
    const vmHours = vmMins / 60;
    const durSecs = vmMins * 60;
    const verticalSpeedObj = calculateVerticalSpeed(vmGain, durSecs);
    const vam = calculateVAM(vmGain, vmHours);
    const climbDensity = calculateClimbDensity(vmGain, vmDistKm);
    const elevationPerKmVal = calculateElevationPerKm(vmGain, vmDistKm);
    const elevationPerMileVal = calculateElevationPerMile(vmGain, vmDistKm * 0.621371);

    // 3. Hill Repeats
    const hReps = parseInt(hillReps);
    const hGainRep = parseFloat(gainPerRep);
    const hWork = parseFloat(workSeconds);
    const hRec = parseFloat(recSeconds);
    const hillVolume = calculateHillRepeatVolume(hReps, hGainRep);
    const hillTimes = calculateHillRepeatTime(hReps, hWork, hRec, restPolicy);

    // 4. Segment Build list
    const segmentProfile = buildManualElevationProfile(segments);

    // 5. Difficulty single item evaluation
    const dDist = parseFloat(diffDist);
    const dGain = parseFloat(diffGain);
    const diffEvaluation = calculateSegmentDifficulty(dDist, dGain, diffSurface, diffTech);

    return {
      gradePercent,
      flatEquivalentKm: flatEquivalent.flatDistanceKm,
      flatEquivalentNote: flatEquivalent.formulaNote,
      verticalSpeedMin: verticalSpeedObj.metersPerMinute,
      verticalSpeedHr: verticalSpeedObj.metersPerHour,
      vam,
      climbDensity,
      elevPerKm: elevationPerKmVal,
      elevPerMile: elevationPerMileVal,
      hillVolume,
      totalWorkTimeSec: hillTimes.totalWorkSeconds,
      totalRecTimeSec: hillTimes.totalRecoverySeconds,
      totalDurationSec: hillTimes.totalDurationSeconds,
      segmentProfile,
      difficultyScore: diffEvaluation.score,
      difficultyCategory: diffEvaluation.category,
      difficultyDesc: diffEvaluation.description
    };
  }, [
    validationError, horizontalDistance, elevationGain, totalGain, durationMins, distanceKm,
    hillReps, gainPerRep, workSeconds, recSeconds, restPolicy, segments, diffDist, diffGain, diffSurface, diffTech
  ]);

  // Form helpers for segment builder
  const handleAddSegment = (e: React.FormEvent) => {
    e.preventDefault();
    const dist = parseFloat(newSegDist);
    const gainVal = parseFloat(newSegGain);
    const lossVal = parseFloat(newSegLoss);

    if (isNaN(dist) || dist <= 0 || isNaN(gainVal) || gainVal < 0 || isNaN(lossVal) || lossVal < 0) {
      alert("Please provide valid segment parameters. Distance must be positive.");
      return;
    }

    const nRow: ManualSegment = {
      name: newSegName.trim() || `Segment ${segments.length + 1}`,
      distanceKm: dist,
      gainMeters: gainVal,
      lossMeters: lossVal,
      surface: newSegSurface,
      technicality: newSegTech
    };

    setSegments([...segments, nRow]);
    setNewSegName('');
    setNewSegDist('1.0');
    setNewSegGain('50');
    setNewSegLoss('10');
  };

  const handleRemoveSegment = (index: number) => {
    const updated = segments.filter((_, i) => i !== index);
    setSegments(updated);
  };

  // Export Contents
  const handleCopy = () => {
    if (!res) return;
    let exportText = `Track.Lab Trail & Elevation Metrics Report\n--------------------------------------\n`;
    if (activeTab === 'grade') {
      exportText += `Grade Calculations:\n- Gain: ${elevationGain} m\n- Distance: ${horizontalDistance} m\n- Grade %: ${res.gradePercent.toFixed(1)}%\n- Equivalent Flat Distance: ${res.flatEquivalentKm.toFixed(2)} km\n`;
    } else if (activeTab === 'vertical_metrics') {
      exportText += `Vertical Stats:\n- Ascent Gain: ${totalGain} m\n- Distance: ${distanceKm} km\n- Climb Ascent Rate: ${res.verticalSpeedHr.toFixed(0)} m/hr\n- Climb VAM: ${res.vam.toFixed(0)} VAM\n- Ascent per Km: ${res.elevPerKm.toFixed(0)} m/km\n`;
    } else if (activeTab === 'hill_repeats') {
      exportText += `Hill Repeats:\n- Reps: ${hillReps}, Gain Per Rep: ${gainPerRep} m\n- Total Accumulation Gain: ${res.hillVolume} m\n- Work Time: ${Math.floor(res.totalWorkTimeSec/60)}m ${res.totalWorkTimeSec%60}s\n- Total Repeat Session duration: ${Math.floor(res.totalDurationSec/60)}m ${res.totalDurationSec%60}s\n`;
    } else if (activeTab === 'segment_builder') {
      exportText += `Manual Elevation Segment Table:\n`;
      res.segmentProfile.segments.forEach(s => {
        exportText += `- ${s.name}: ${s.distanceKm}km, +${s.gainMeters}m, -${s.lossMeters}m (${s.difficulty})\n`;
      });
      exportText += `Cumulative Totals: ${res.segmentProfile.totalDistanceKm.toFixed(2)} km, +${res.segmentProfile.totalGainMeters}m, -${res.segmentProfile.totalLossMeters}m\n`;
    } else {
      exportText += `Trail Segment Difficulty:\n- Score: ${res.difficultyScore.toFixed(0)} (${res.difficultyCategory})\n- Description: ${res.difficultyDesc}\n`;
    }
    
    exportText += `\nDisclaimer: Terrain estimates only. Raw mechanical output calculations. Standard physiological responses vary.`;
    navigator.clipboard.writeText(exportText);
    alert("Copied to clipboard!");
  };

  const handleExportJSON = () => {
    if (!res) return;
    const exportData = {
      module: "Trail & Elevation Lab",
      categorySelected: activeTab,
      timestamp: new Date().toISOString(),
      inputsOrdered: {
        grade: { horizontalDistance, elevationGain },
        vertical: { totalGain, durationMins, distanceKm },
        repeats: { hillReps, gainPerRep, workSeconds, recSeconds, restPolicy },
        segments: segments,
        difficulty: { diffDist, diffGain, diffSurface, diffTech }
      },
      outcomes: {
        calculatedGradePct: res.gradePercent,
        vam: res.vam,
        verticalSpeedPerHour: res.verticalSpeedHr,
        climbDensityPct: res.climbDensity,
        hillRepVolumeGain: res.hillVolume
      },
      disclaimer: "Manual estimate only. Track.Lab provides mechanical indicators from user inputs."
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "tracklab_trail_elevation_export.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const activeMethodMeta = useMemo(() => {
    const tabToId: Record<string, string> = {
      grade: 'grade_pct',
      vertical_metrics: 'vertical_speed',
      hill_repeats: 'hill_repeat_totals',
      segment_builder: 'manual_elevation_profile',
      trail_difficulty: 'segment_difficulty'
    };
    return methodRegistry.find(m => m.id === tabToId[activeTab]) || {
      name: "Elevation Metrics",
      formulaDisplay: "Geometric and physical climbing ratios.",
      precision: "mathematical",
      limitations: ["Ratios demonstrate aggregate slopes but cannot account for specific micro-terrain geometry."]
    };
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <LabPageHeader 
        title="TRAIL & ELEVATION LAB" 
        subtitle="Surgical gradient analyses, vertical speed, hill repeat volumes, and manual segmented elevation profile building tools." 
      />

      {/* Primary Actions bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-50 border-2 border-border-heavy p-4 rounded-xl shadow-[1px_1px_0px_rgba(23,23,23,1)]">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={isAdvanced ? "primary" : "outline"} 
            onClick={() => setIsAdvanced(true)}
            className="text-xs uppercase tracking-wider font-extrabold"
          >
            Advanced Terrain Analysis
          </Button>
          <Button 
            variant={!isAdvanced ? "primary" : "outline"} 
            onClick={() => setIsAdvanced(false)}
            className="text-xs uppercase tracking-wider font-extrabold"
          >
            Quick Metrics Panel
          </Button>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleReset} variant="outline" className="flex items-center text-xs h-9 py-1 px-3">
            <RefreshCw className="h-3 w-3 mr-1" /> Reset Calculator
          </Button>
          <Button onClick={handleCopy} variant="outline" className="flex items-center text-xs h-9 py-1 px-3" disabled={!!validationError}>
            <Copy className="h-3 w-3 mr-1" /> Copy Out
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
              <span className="font-bold text-destructive">Improper Parameter Entry Detected</span>
            </div>
            <p className="text-sm font-medium text-foreground">{validationError}</p>
          </CardContent>
        </Card>
      )}

      {/* UI splits */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Category Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-2 border-border-heavy rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
            <CardHeader className="bg-zinc-50 border-b-2 border-border-heavy py-3">
              <CardTitle className="text-sm font-black uppercase tracking-wider">Metrics Modules</CardTitle>
            </CardHeader>
            <CardContent className="p-2 flex flex-col gap-1">
              <button
                onClick={() => { setActiveTab('grade'); setIsAdvanced(true); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${activeTab === 'grade' ? 'bg-primary text-primary-foreground font-black shadow-[1px_1px_0px_rgba(23,23,23,1)]' : 'hover:bg-zinc-100 text-foreground'}`}
              >
                <span>📐 Grade & Slopes</span>
                {res && <span className="text-[10px] uppercase font-mono">{res.gradePercent.toFixed(1)}%</span>}
              </button>
              <button
                onClick={() => { setActiveTab('vertical_metrics'); setIsAdvanced(true); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${activeTab === 'vertical_metrics' ? 'bg-primary text-primary-foreground font-black shadow-[1px_1px_0px_rgba(23,23,23,1)]' : 'hover:bg-zinc-100 text-foreground'}`}
              >
                <span>⏱️ Ascent Kinetics (VAM)</span>
                {res && <span className="text-[10px] uppercase font-mono">{res.vam.toFixed(0)} VAM</span>}
              </button>
              <button
                onClick={() => { setActiveTab('hill_repeats'); setIsAdvanced(true); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${activeTab === 'hill_repeats' ? 'bg-primary text-primary-foreground font-black shadow-[1px_1px_0px_rgba(23,23,23,1)]' : 'hover:bg-zinc-100 text-foreground'}`}
              >
                <span>⛰️ Hill Repeat Volumes</span>
                {res && <span className="text-[10px] uppercase font-mono">+{res.hillVolume}m</span>}
              </button>
              <button
                onClick={() => { setActiveTab('segment_builder'); setIsAdvanced(true); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between ${activeTab === 'segment_builder' ? 'bg-primary text-primary-foreground font-black shadow-[1px_1px_0px_rgba(23,23,23,1)]' : 'hover:bg-zinc-100 text-foreground'}`}
              >
                <span>📈 Elevation Profile builder</span>
                <span className="text-[10px] uppercase bg-black/10 px-1.5 rounded font-mono">{segments.length} rows</span>
              </button>
              <button
                onClick={() => { setActiveTab('trail_difficulty'); setIsAdvanced(true); }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-between border-t border-dashed border-border-heavy mt-2 ${activeTab === 'trail_difficulty' ? 'bg-zinc-900 text-white font-black shadow-[1px_1px_0px_rgba(23,23,23,1)]' : 'hover:bg-zinc-100 text-foreground'}`}
              >
                <span className="flex items-center text-primary dark:text-foreground">💎 Difficulty Assessor</span>
                {res && <span className="text-[10px] uppercase font-mono text-zinc-400">{res.difficultyCategory}</span>}
              </button>
            </CardContent>
          </Card>

          {/* Form parameters inputs per active module tab */}
          <Card className="border-2 border-border-heavy rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
            <CardHeader className="bg-zinc-50 border-b-2 border-border-heavy py-3">
              <CardTitle className="text-sm font-black uppercase tracking-wider">Parameters Input</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              
              {activeTab === 'grade' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="horizontalDistance">Horizontal Flight Distance (m)</Label>
                    <Input id="horizontalDistance" type="number" value={horizontalDistance} onChange={e => setHorizontalDistance(e.target.value)} required />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="elevationGain">Elevation Accumulation Gain (m)</Label>
                    <Input id="elevationGain" type="number" value={elevationGain} onChange={e => setElevationGain(e.target.value)} required />
                  </div>
                </div>
              )}

              {activeTab === 'vertical_metrics' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="totalGain">Gain (m)</Label>
                      <Input id="totalGain" type="number" value={totalGain} onChange={e => setTotalGain(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="distanceKm">Distance (km)</Label>
                      <Input id="distanceKm" type="number" step="0.1" value={distanceKm} onChange={e => setDistanceKm(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="durationMins">Performance Duration (minutes)</Label>
                    <Input id="durationMins" type="number" value={durationMins} onChange={e => setDurationMins(e.target.value)} required />
                  </div>
                </div>
              )}

              {activeTab === 'hill_repeats' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="hillReps">Hill Repeats Count</Label>
                      <Input id="hillReps" type="number" value={hillReps} onChange={e => setHillReps(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="gainPerRep">Gain per Rep (m)</Label>
                      <Input id="gainPerRep" type="number" value={gainPerRep} onChange={e => setGainPerRep(e.target.value)} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="workSeconds">Work Duration (sec)</Label>
                      <Input id="workSeconds" type="number" value={workSeconds} onChange={e => setWorkSeconds(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="recSeconds">Recovery Rest (sec)</Label>
                      <Input id="recSeconds" type="number" value={recSeconds} onChange={e => setRecSeconds(e.target.value)} required />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="restPolicy">Rest Sequence Policy</Label>
                    <Select id="restPolicy" value={restPolicy} onChange={e => setRestPolicy(e.target.value as any)}>
                      <option value="between">Recovery interval ONLY between reps (reps - 1)</option>
                      <option value="after">Recovery interval after every single rep (reps)</option>
                    </Select>
                  </div>
                </div>
              )}

              {activeTab === 'segment_builder' && (
                <form onSubmit={handleAddSegment} className="space-y-3">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase border-b pb-1">Append Custom Segment Row:</div>
                  <div className="space-y-1">
                    <Label htmlFor="newSegName">Segment Name</Label>
                    <Input id="newSegName" type="text" placeholder="e.g. Steep Ridge" value={newSegName} onChange={e => setNewSegName(e.target.value)} />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="newSegDist">Dist (km)</Label>
                      <Input id="newSegDist" type="number" step="0.1" value={newSegDist} onChange={e => setNewSegDist(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="newSegGain">Gain (+m)</Label>
                      <Input id="newSegGain" type="number" value={newSegGain} onChange={e => setNewSegGain(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="newSegLoss">Loss (-m)</Label>
                      <Input id="newSegLoss" type="number" value={newSegLoss} onChange={e => setNewSegLoss(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="newSegSurface">Surface</Label>
                      <Select id="newSegSurface" value={newSegSurface} onChange={e => setNewSegSurface(e.target.value)}>
                        <option value="road">Road</option>
                        <option value="gravel">Gravel</option>
                        <option value="trail">Trail</option>
                        <option value="grass">Grass</option>
                        <option value="mud">Mud</option>
                        <option value="sand">Sand</option>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="newSegTech">Technicality</Label>
                      <Select id="newSegTech" value={newSegTech} onChange={e => setNewSegTech(e.target.value as any)}>
                        <option value="low">Low (flat/dry)</option>
                        <option value="medium">Medium (some roots)</option>
                        <option value="high">High (scree/loose)</option>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full mt-2 font-bold"><Plus className="h-4 w-4 mr-1" /> Append Segment row</Button>
                </form>
              )}

              {activeTab === 'trail_difficulty' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="diffDist">Distance (km)</Label>
                      <Input id="diffDist" type="number" step="0.1" value={diffDist} onChange={e => setDiffDist(e.target.value)} required />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="diffGain">Gain (m)</Label>
                      <Input id="diffGain" type="number" value={diffGain} onChange={e => setDiffGain(e.target.value)} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label htmlFor="diffSurface">Surface</Label>
                      <Select id="diffSurface" value={diffSurface} onChange={e => setDiffSurface(e.target.value)}>
                        <option value="road">Asphalt / Road</option>
                        <option value="gravel">Loose Gravel</option>
                        <option value="trail">Rough Dirt Trail</option>
                        <option value="mud">Wet Mud</option>
                        <option value="sand">Loose Sand</option>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="diffTech">Footing technicality</Label>
                      <Select id="diffTech" value={diffTech} onChange={e => setDiffTech(e.target.value as any)}>
                        <option value="low">Low Technicality</option>
                        <option value="medium">Medium Technicality</option>
                        <option value="high">High Technicality</option>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* Outcomes viewports */}
        <div className="lg:col-span-2 space-y-6">
          {!isAdvanced ? (
            /* Quick Metrics Summary */
            <Card className="border-2 border-border-heavy rounded-xl shadow-[4px_4px_0px_rgba(23,23,23,1)] overflow-hidden">
              <div className="bg-zinc-900 border-b-2 border-border-heavy px-6 py-3">
                <h3 className="text-xs font-black uppercase text-white tracking-widest">COHERENT GEOMETRIC TERRAIN OUTCOMES</h3>
              </div>
              <CardContent className="p-6 space-y-6">
                {res ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border-2 border-border-heavy rounded-xl bg-zinc-50 font-mono space-y-1">
                      <div className="text-[10px] text-muted-foreground uppercase font-sans font-extrabold tracking-widest">Calculated Grade</div>
                      <div className="text-xl font-black text-foreground">{res.gradePercent.toFixed(1)}% ({res.elevPerKm.toFixed(0)} m/km)</div>
                      <div className="text-xs text-muted-foreground font-sans">For distance of {horizontalDistance} meters</div>
                    </div>

                    <div className="p-4 border-2 border-border-heavy rounded-xl bg-zinc-50 font-mono space-y-1">
                      <div className="text-[10px] text-muted-foreground uppercase font-sans font-extrabold tracking-widest">Vertical rate</div>
                      <div className="text-xl font-black text-foreground">{res.verticalSpeedHr.toFixed(0)} m/hr</div>
                      <div className="text-xs text-muted-foreground font-sans">{res.vam.toFixed(0)} meters VAM climbing rate</div>
                    </div>

                    <div className="p-4 border-2 border-border-heavy rounded-xl bg-zinc-50 font-mono space-y-1">
                      <div className="text-[10px] text-muted-foreground uppercase font-sans font-extrabold tracking-widest">Hill Repeat Volume</div>
                      <div className="text-xl font-black text-foreground">+{res.hillVolume}m cumulative</div>
                      <div className="text-xs text-muted-foreground font-sans">Accumulated over {hillReps} reps</div>
                    </div>

                    <div className="p-4 border-2 border-border-heavy rounded-xl bg-zinc-50 font-mono space-y-1">
                      <div className="text-[10px] text-muted-foreground uppercase font-sans font-extrabold tracking-widest">Flat equivalence</div>
                      <div className="text-xl font-black text-zinc-800">{res.flatEquivalentKm.toFixed(2)} km-eq</div>
                      <div className="text-xs text-muted-foreground font-sans">Using metabolic conversion multiplier</div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm font-semibold text-muted-foreground italic">Provide correct input parameters on the left to evaluate terrain metrics.</p>
                )}

                <div className="pt-4 border-t border-zinc-200">
                  <div className="text-xs uppercase tracking-wider font-extrabold text-muted-foreground mb-2">Cross-Module Integration References:</div>
                  <ul className="text-xs space-y-1 text-foreground list-disc list-inside">
                    <li><span className="font-bold text-primary">Cross-Link:</span> Map these grade slope scenarios to adjusted running paces in our <a href="/pace" className="font-bold underline text-primary">Pace Lab</a>.</li>
                    <li>Port hill repeat volumes directly to structural workout logs in our <a href="/workout" className="font-bold underline text-primary">Workout Lab Page</a>.</li>
                    <li>Incorporate elevation climb sums into your training stress calculations inside our <a href="/load" className="font-bold underline text-primary">Load Lab</a>.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Advanced Mode displays */
            <div className="space-y-6">
              
              <Card className="border-2 border-border-heavy rounded-xl shadow-[4px_4px_0px_rgba(23,23,23,1)]">
                <CardHeader className="bg-primary text-primary-foreground border-b-2 border-border-heavy">
                  <CardTitle className="text-base font-black uppercase tracking-wider flex items-center justify-between">
                    <span>{activeMethodMeta.name}</span>
                    <span className="bg-black/25 text-white font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded border border-white/20">
                      {activeMethodMeta.precision?.replace('_', ' ') || "mathematical"}
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  
                  {res ? (
                    <div className="space-y-6">
                      
                      {activeTab === 'grade' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-zinc-50 border-2 border-border-heavy p-4 rounded-xl font-mono text-center">
                              <div className="text-xs font-sans font-bold text-muted-foreground uppercase">Calculated Grade Slope</div>
                              <div className="text-3xl font-black text-foreground mt-1">{res.gradePercent.toFixed(1)} %</div>
                              <div className="text-xs text-muted-foreground font-sans mt-1">Grade % = Gain / Dist × 100</div>
                            </div>
                            <div className="bg-zinc-50 border-2 border-border-heavy p-4 rounded-xl font-mono text-center">
                              <div className="text-xs font-sans font-bold text-muted-foreground uppercase">Equivalent Flat Distance</div>
                              <div className="text-3xl font-black text-foreground mt-1">{res.flatEquivalentKm.toFixed(2)} km</div>
                              <div className="text-[10px] text-muted-foreground font-sans mt-0.5">Metabolic compensation coefficient</div>
                            </div>
                          </div>

                          <div className="p-4 bg-zinc-50 border-l-4 border-zinc-900 rounded-lg text-xs font-sans leading-relaxed text-zinc-700">
                            <strong>Slope Formula Note:</strong> {res.flatEquivalentNote}
                          </div>
                        </div>
                      )}

                      {activeTab === 'vertical_metrics' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center font-mono">
                            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                              <div className="text-[10px] text-muted-foreground font-sans">Vertical speed (hr)</div>
                              <div className="font-extrabold text-foreground text-sm mt-0.5">+{res.verticalSpeedHr.toFixed(0)} m/h</div>
                            </div>
                            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                              <div className="text-[10px] text-muted-foreground font-sans">VAM Ascending Rate</div>
                              <div className="font-extrabold text-foreground text-sm mt-0.5">{res.vam.toFixed(0)} VAM</div>
                            </div>
                            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                              <div className="text-[10px] text-muted-foreground font-sans">Density (Per km)</div>
                              <div className="font-extrabold text-foreground text-sm mt-0.5">{res.elevPerKm.toFixed(0)} m/km</div>
                            </div>
                            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
                              <div className="text-[10px] text-muted-foreground font-sans">Density (Per mile)</div>
                              <div className="font-extrabold text-foreground text-sm mt-0.5">{res.elevPerMile.toFixed(0)} m/mi</div>
                            </div>
                          </div>

                          <div className="p-4 border-2 border-border-heavy bg-zinc-50 rounded-xl space-y-1 text-xs">
                            <h4 className="font-bold text-foreground uppercase tracking-wider text-[10px]">Ascent Rate Physiological Note:</h4>
                            <p className="text-muted-foreground leading-normal mt-0.5">Vertical Speed tracks climb velocity ignoring horizontal vector. VAM (Velocità Ascensionale Media) is highly dependent on gradient slope percentages—steeper grades usually maximize the pure vertical ascent velocity mechanical yield.</p>
                          </div>
                        </div>
                      )}

                      {activeTab === 'hill_repeats' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-zinc-50 border-2 border-border-heavy p-4 rounded-xl font-mono text-center">
                              <div className="text-xs font-sans font-bold text-muted-foreground uppercase">Accumulative Climb Volume</div>
                              <div className="text-2xl font-black text-foreground mt-1">+{res.hillVolume} meters</div>
                              <div className="text-xs text-muted-foreground font-sans mt-1">Total uphill metric gain</div>
                            </div>
                            <div className="bg-zinc-50 border-2 border-border-heavy p-4 rounded-xl font-mono text-center">
                              <div className="text-xs font-sans font-bold text-muted-foreground uppercase">Sum Work Time</div>
                              <div className="text-2xl font-black text-foreground mt-1">
                                {Math.floor(res.totalWorkTimeSec / 60)}:{(res.totalWorkTimeSec % 60).toString().padStart(2, '0')}
                              </div>
                              <div className="text-xs text-muted-foreground font-sans mt-1">Active effort timer</div>
                            </div>
                            <div className="bg-zinc-50 border-2 border-border-heavy p-4 rounded-xl font-mono text-center">
                              <div className="text-xs font-sans font-bold text-muted-foreground uppercase">Interval Block Sum</div>
                              <div className="text-2xl font-black text-foreground mt-1">
                                {Math.floor(res.totalDurationSec / 60)}:{(res.totalDurationSec % 60).toString().padStart(2, '0')}
                              </div>
                              <div className="text-xs text-muted-foreground font-sans mt-1">Includes recovery rest periods</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 'segment_builder' && (
                        <div className="space-y-6">
                          
                          {/* Segment rows container table */}
                          <div className="border-2 border-border-heavy rounded-xl overflow-hidden shadow-[1px_1px_0px_rgba(23,23,23,1)] bg-white text-xs">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="bg-zinc-900 text-white font-extrabold uppercase text-[10px] tracking-wider border-b-2 border-border-heavy">
                                  <th className="p-3">Segment Item</th>
                                  <th className="p-3">Dist (km)</th>
                                  <th className="p-3">Gain (+m)</th>
                                  <th className="p-3">Loss (-m)</th>
                                  <th className="p-3">Grade %</th>
                                  <th className="p-3">Difficulty</th>
                                  <th className="p-3 text-center">Action</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y border-t border-border-light font-mono text-foreground">
                                {res.segmentProfile.segments.map((row, idx) => (
                                  <tr key={row.id} className={idx % 2 === 0 ? "bg-zinc-50/50" : "bg-white"}>
                                    <td className="p-3 font-bold font-sans">{row.name}</td>
                                    <td className="p-3">{row.distanceKm.toFixed(2)} km</td>
                                    <td className="p-3 text-emerald-700">+{row.gainMeters} m</td>
                                    <td className="p-3 text-rose-700">-{row.lossMeters} m</td>
                                    <td className="p-3">{row.averageGrade.toFixed(1)}%</td>
                                    <td className="p-3 font-sans font-semibold">{row.difficulty}</td>
                                    <td className="p-3 text-center">
                                      <button 
                                        type="button" 
                                        onClick={() => handleRemoveSegment(row.id)} 
                                        className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                                {res.segmentProfile.segments.length === 0 && (
                                  <tr>
                                    <td colSpan={7} className="p-6 text-center text-muted-foreground italic font-sans">No segments defined. Append rows using the tool on the left.</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>

                          {/* Cumulatives panel */}
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center font-mono">
                            <div className="p-3 bg-zinc-50 border-2 border-zinc-950 rounded-xl">
                              <div className="text-[9px] text-muted-foreground font-sans uppercase">Total Distance</div>
                              <div className="font-extrabold text-foreground text-sm mt-0.5">{res.segmentProfile.totalDistanceKm.toFixed(2)} km</div>
                            </div>
                            <div className="p-3 bg-zinc-50 border-2 border-zinc-950 rounded-xl">
                              <div className="text-[9px] text-muted-foreground font-sans uppercase">Total ascent</div>
                              <div className="font-extrabold text-foreground text-sm mt-0.5 text-emerald-700">+{res.segmentProfile.totalGainMeters} m</div>
                            </div>
                            <div className="p-3 bg-zinc-50 border-2 border-zinc-950 rounded-xl">
                              <div className="text-[9px] text-muted-foreground font-sans uppercase">Total descent</div>
                              <div className="font-extrabold text-foreground text-sm mt-0.5 text-rose-700">-{res.segmentProfile.totalLossMeters} m</div>
                            </div>
                            <div className="p-3 bg-zinc-50 border-2 border-zinc-950 rounded-xl">
                              <div className="text-[9px] text-muted-foreground font-sans uppercase">Average Grade</div>
                              <div className="font-extrabold text-foreground text-sm mt-0.5">{res.segmentProfile.averageGradePercent.toFixed(1)}%</div>
                            </div>
                          </div>

                          {/* Elevation Area Chart */}
                          {res.segmentProfile.segments.length > 0 && (
                            <div className="border-2 border-border-heavy rounded-xl p-4 bg-white shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                              <div className="text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-3 flex items-center justify-between">
                                <span>📈 Cumulative Trace Elevation Profile Chart (m)</span>
                                <span className="text-[9px] font-mono">Distance in km</span>
                              </div>
                              <div className="h-60 w-full font-mono text-xs">
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart data={res.segmentProfile.elevationChartPoints}>
                                    <defs>
                                      <linearGradient id="colorElev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#18181b" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#18181b" stopOpacity={0}/>
                                      </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="distance" type="number" domain={['auto', 'auto']} />
                                    <YAxis tickFormatter={(v: any) => `${v}m`} />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="elevation" stroke="#18181b" fillOpacity={1} fill="url(#colorElev)" />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          )}

                        </div>
                      )}

                      {activeTab === 'trail_difficulty' && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-zinc-50 border-2 border-border-heavy p-4 rounded-xl font-mono text-center">
                              <div className="text-xs font-sans font-bold text-muted-foreground uppercase">Biomechanical Intensity Score</div>
                              <div className="text-3xl font-black text-foreground mt-1.5">{res.difficultyScore.toFixed(0)}</div>
                              <div className="text-xs text-muted-foreground font-sans mt-0.5">Normalized index</div>
                            </div>
                            <div className="bg-zinc-50 border-2 border-border-heavy p-4 rounded-xl font-mono text-center">
                              <div className="text-xs font-sans font-bold text-muted-foreground uppercase">Assigned Grade Symbol</div>
                              <div className="text-2xl font-black text-primary uppercase mt-2">{res.difficultyCategory}</div>
                              <div className="text-[10px] text-muted-foreground font-sans mt-1">Rule-based category</div>
                            </div>
                          </div>

                          <div className="p-4 border-2 border-border-heavy bg-zinc-50 rounded-xl space-y-1 font-sans text-xs text-zinc-700">
                            <strong>Terrain Ground Analysis Note:</strong>
                            <p className="text-muted-foreground mt-1">{res.difficultyDesc}</p>
                          </div>
                        </div>
                      )}

                      {/* Trace formulas */}
                      <div className="p-4 border-2 border-border-heavy rounded-xl space-y-2 font-mono text-xs text-left bg-zinc-50">
                        <div>
                          <span className="font-bold text-muted-foreground uppercase">Equation formula trace:</span>
                          <div className="bg-white border rounded p-2 text-foreground font-sans text-[11px] mt-1 break-all">
                            {activeMethodMeta.formulaDisplay}
                          </div>
                        </div>
                        <div className="pt-2 border-t border-dashed border-zinc-200 text-slate-500 font-sans text-[10px] leading-relaxed">
                          Under no circumstances represents medical advice, physical training prescriptions, athletic capability diagnostic markers, orthopedic risk prognoses, or guaranteed climb velocities in race situations.
                        </div>
                      </div>

                    </div>
                  ) : (
                    <p className="text-center font-mono italic text-sm text-zinc-400">Provide input parameters on the left to review metrics.</p>
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

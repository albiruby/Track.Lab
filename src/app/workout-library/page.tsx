'use client';

import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input, Label, Button, Select, ValidationMessage } from '@/components/ui/Forms';
import { LabPageHeader } from '@/components/layout/LabPageHeader';
import { workoutTemplates, raceDistances, workoutSafetyRules } from '@/data';
import { 
  parseDurationToSeconds, 
  formatSecondsToTimeString, 
  formatPace, 
  safeNumber 
} from '@/lib/formatters/time';
import { 
  AlertCircle, 
  SlidersHorizontal, 
  Search, 
  ArrowLeftRight, 
  Code, 
  ExternalLink, 
  Copy, 
  RotateCcw, 
  BookOpen, 
  ShieldAlert, 
  Check,
  FileSpreadsheet
} from 'lucide-react';
import Link from 'next/link';

function isDistanceRepTemplate(mainSet: any): boolean {
  return mainSet && mainSet.type === 'distance_reps';
}

function calculateWorkout(template: typeof workoutTemplates[number], paceSec: number, warmupMin: number, cooldownMin: number) {
  const profile = (template as any).calculationProfile;
  if (!profile || profile.calculationMode === "static_only" || !profile.canCalculateSession) {
    return null;
  }

  const reps = profile.reps || 1;
  const mode = profile.calculationMode;

  let singleRepDurationSeconds = 0;
  let singleRepDistanceKm = 0;
  
  if (mode === "duration_reps" || mode === "continuous") {
    singleRepDurationSeconds = profile.repDurationSeconds || 0;
    if (paceSec > 0) {
      singleRepDistanceKm = singleRepDurationSeconds / paceSec;
    }
  } else if (mode === "distance_reps" || mode === "continuous_distance") {
    singleRepDistanceKm = profile.repDistanceKm || 0;
    if (paceSec > 0) {
      singleRepDurationSeconds = singleRepDistanceKm * paceSec;
    }
  }

  const workTime = reps * singleRepDurationSeconds;
  const workDist = reps * singleRepDistanceKm * 1000; // in meters

  // Rest calculation
  let restTimeMin = 0;
  let restTimeMax = 0;
  
  if (reps > 1) {
    const recoveryMultiplier = (profile.restPolicy === "after_every_rep") ? reps : (reps - 1);
    
    const minRec = typeof profile.recoveryMinSeconds === "number" ? profile.recoveryMinSeconds : 0;
    const maxRec = typeof profile.recoveryMaxSeconds === "number" ? profile.recoveryMaxSeconds : minRec;
    
    restTimeMin = recoveryMultiplier * minRec;
    restTimeMax = recoveryMultiplier * maxRec;
  }

  const warmTime = warmupMin * 60;
  const coolTime = cooldownMin * 60;

  const totalTimeMin = workTime + restTimeMin + warmTime + coolTime;
  const totalTimeMax = workTime + restTimeMax + warmTime + coolTime;

  return {
    calculationMode: mode,
    reps,
    singleRepDurationSeconds,
    singleRepDistanceKm,
    workTime,
    workDist, // meters
    restTimeMin,
    restTimeMax,
    totalTimeMin,
    totalTimeMax,
    isRange: restTimeMin !== restTimeMax,
    targetRepTime: singleRepDurationSeconds // keep for compatibility
  };
}

export default function WorkoutLibraryPage() {
  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [goalFilter, setGoalFilter] = useState<string>('all');
  const [scenarioFilter, setScenarioFilter] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [intensityFilter, setIntensityFilter] = useState<string>('all');

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  
  // Custom execution configs
  const [paceInput, setPaceInput] = useState('5:00');
  const [warmupInput, setWarmupInput] = useState('15');
  const [cooldownInput, setCooldownInput] = useState('10');
  const [weeklyMileageInput, setWeeklyMileageInput] = useState('50');

  // Copy status text helper
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // Template Comparison State
  const [compTemplateIdA, setCompTemplateIdA] = useState<string>('');
  const [compTemplateIdB, setCompTemplateIdB] = useState<string>('');
  const [isComparing, setIsComparing] = useState(false);

  const selectedTemplate = useMemo(() => {
    return workoutTemplates.find(t => t.id === selectedTemplateId);
  }, [selectedTemplateId]);

  const [displayLimit, setDisplayLimit] = useState(24);

  // Compute uniquely occurring categories
  const uniqueIntensities = useMemo(() => {
    const list = new Set<string>();
    workoutTemplates.forEach((t: any) => {
      if (t.mainSet?.intensity) list.add(t.mainSet.intensity);
    });
    return Array.from(list).sort();
  }, []);

  const uniqueGoals = useMemo(() => {
    const goals = new Set<string>();
    workoutTemplates.forEach((t: any) => t.goalDistances?.forEach((g: string) => goals.add(g)));
    return Array.from(goals).sort();
  }, []);

  const uniqueScenarios = useMemo(() => {
    const scenarios = new Set<string>();
    workoutTemplates.forEach((t: any) => t.scenario && scenarios.add(t.scenario));
    return Array.from(scenarios).sort();
  }, []);

  const uniqueFormats = useMemo(() => {
    const formats = new Set<string>();
    workoutTemplates.forEach((t: any) => t.format && formats.add(t.format));
    return Array.from(formats).sort();
  }, []);

  // Filter & Search Execution
  const filteredTemplates = useMemo(() => {
    return workoutTemplates.filter(t => {
      const temp = t as any;
      const matchesSearch = searchQuery === '' || temp.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (temp.id && temp.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (temp.formulaNotes && temp.formulaNotes.some((n: string) => n.toLowerCase().includes(searchQuery.toLowerCase())));

      const matchesGoal = goalFilter === 'all' || (temp.goalDistances && (temp.goalDistances as string[]).includes(goalFilter));
      const matchesScenario = scenarioFilter === 'all' || (temp.scenario === scenarioFilter);
      const matchesFormat = formatFilter === 'all' || (temp.format === formatFilter);
      const matchesIntensity = intensityFilter === 'all' || (temp.mainSet?.intensity === intensityFilter);

      return matchesSearch && matchesGoal && matchesScenario && matchesFormat && matchesIntensity;
    });
  }, [searchQuery, goalFilter, scenarioFilter, formatFilter, intensityFilter]);

  const visibleTemplates = useMemo(() => {
    return filteredTemplates.slice(0, displayLimit);
  }, [filteredTemplates, displayLimit]);

  // Pacing seconds per km source of truth
  const pSec = useMemo(() => {
    return paceInput ? parseDurationToSeconds(paceInput) : 0;
  }, [paceInput]);

  // Single Template Projection
  const calcResult = useMemo(() => {
    if (!selectedTemplate) return null;
    if (!pSec || pSec <= 0) return null;

    return calculateWorkout(
      selectedTemplate, 
      pSec, 
      parseFloat(warmupInput) || 0, 
      parseFloat(cooldownInput) || 0
    );
  }, [selectedTemplate, pSec, warmupInput, cooldownInput]);

  // Specific safety rule triggers (Static only)
  const activeSafetyFlags = useMemo(() => {
    if (!selectedTemplate || !('safetyRuleIds' in selectedTemplate)) return [];
    
    const flags: any[] = [];
    const wd = parseFloat(weeklyMileageInput);
    const ruleIds = selectedTemplate.safetyRuleIds as unknown as string[];
    
    ruleIds.forEach(id => {
      const rule = workoutSafetyRules.find(r => r.id === id);
      if (!rule) return;

      if (id === 'fast_volume_gt_15_percent') {
        if (wd > 0 && calcResult && (calcResult.workDist / 1000) / wd > 0.15) {
          flags.push(rule);
        }
      } else if (id === 'long_run_ratio_gt_35') {
         const totalDistKm = calcResult ? ((calcResult.workDist / 1000) + ((parseFloat(warmupInput) || 0) / 6) + ((parseFloat(cooldownInput) || 0) / 6)) : 0;
         if (wd > 0 && totalDistKm > 0 && totalDistKm / wd > 0.35) {
            flags.push(rule);
         }
      } else if (id === 'threshold_volume_gt_20_percent') {
         if (wd > 0 && calcResult && (calcResult.workDist / 1000) / wd > 0.20) {
            flags.push(rule);
         }
      } else {
        flags.push(rule);
      }
    });
    return flags;
  }, [selectedTemplate, calcResult, weeklyMileageInput, warmupInput, cooldownInput]);

  // Double Template Comparer Routine
  const comparisonData = useMemo(() => {
    if (!isComparing || !compTemplateIdA || !compTemplateIdB) return null;
    const tA = workoutTemplates.find(t => t.id === compTemplateIdA);
    const tB = workoutTemplates.find(t => t.id === compTemplateIdB);
    if (!tA || !tB) return null;

    const pSec = parseDurationToSeconds(paceInput) || 300; // default 5:00
    const wu = parseFloat(warmupInput) || 0;
    const cd = parseFloat(cooldownInput) || 0;

    const resA = calculateWorkout(tA, pSec, wu, cd);
    const resB = calculateWorkout(tB, pSec, wu, cd);

    if (!resA || !resB) {
      return {
        templateA: tA,
        templateB: tB,
        canCompare: false
      };
    }

    return {
      templateA: tA,
      templateB: tB,
      canCompare: true,
      resA,
      resB,
      deltaDuration: resA.totalTimeMin - resB.totalTimeMin,
      deltaDistanceKm: (resA.workDist - resB.workDist) / 1000
    };
  }, [isComparing, compTemplateIdA, compTemplateIdB, paceInput, warmupInput, cooldownInput]);

  // Copy Summary Handler
  const handleCopySummary = () => {
    if (!selectedTemplate || !calcResult) return;
    const repTimeStr = calcResult.targetRepTime > 0 ? formatSecondsToTimeString(Math.round(calcResult.targetRepTime)) : '--:--';
    const totalTimeStr = calcResult.isRange 
      ? `${formatSecondsToTimeString(calcResult.totalTimeMin)}–${formatSecondsToTimeString(calcResult.totalTimeMax)}`
      : formatSecondsToTimeString(calcResult.totalTimeMin);
      
    const summaryText = 
      `Workout: ${selectedTemplate.name}\n` +
      `Category: ${selectedTemplate.scenario} | Difficulty: ${selectedTemplate.difficulty}\n` +
      `Single Rep Duration: ${repTimeStr}\n` +
      `Estimated Session Work Distance: ${(calcResult.workDist/1000).toFixed(2)} km\n` +
      `Calculated Session Duration: ${totalTimeStr}`;
    
    navigator.clipboard.writeText(summaryText);
    setCopyStatus('Summary copied!');
    setTimeout(() => setCopyStatus(null), 2000);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setGoalFilter('all');
    setScenarioFilter('all');
    setFormatFilter('all');
    setIntensityFilter('all');
    setIsComparing(false);
  };  return (
    <div className="space-y-6 text-[#111827]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <LabPageHeader 
            title="Workout Library" 
            subtitle="Review static running protocol templates, verify safety compliance metrics, and calculate manual duration projections." 
          />
        </div>
        <div className="flex gap-2 shrink-0 self-end md:self-auto mb-6">
          <Link href="/workout" className="inline-flex h-10 items-center justify-center rounded-lg text-xs font-bold uppercase tracking-wider transition-all px-4 bg-[#0b2f4a] text-white border border-[#0b2f4a] hover:bg-[#0f6fae] shadow-sm">
            🛠️ Workout Lab
          </Link>
          <Link href="/calendar" className="inline-flex h-10 items-center justify-center rounded-lg text-xs font-bold uppercase tracking-wider transition-all px-4 border border-[#d8ddd8] bg-white hover:bg-[#f3f4f1] text-[#374151] shadow-xs">
            📅 Preview Week
          </Link>
        </div>
      </div>

      {/* Dynamic Filter Layout */}
      {!selectedTemplate && !isComparing && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* FILTER PANEL */}
          <div className="lg:col-span-4 space-y-4">
            <Card>
              <CardHeader className="flex flex-row justify-between items-center py-3">
                <CardTitle className="uppercase text-xs flex items-center gap-2">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#0f6fae]" /> SEARCH & FILTER
                </CardTitle>
                <button onClick={handleResetFilters} className="text-[10px] font-bold uppercase text-[#8b9490] hover:text-[#0b2f4a] transition-colors cursor-pointer">
                  Reset
                </button>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                {/* Keyword Search */}
                <div className="space-y-1">
                  <Label>Keyword Query</Label>
                  <div className="relative">
                    <Input 
                      type="text" 
                      placeholder="e.g. recovery, threshold..." 
                      value={searchQuery} 
                      onChange={e => { setSearchQuery(e.target.value); setDisplayLimit(24); }}
                      className="pl-10"
                    />
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Target Distance Goal */}
                <div className="space-y-1">
                  <Label>Goal Distance tag</Label>
                  <Select value={goalFilter} onChange={e => { setGoalFilter(e.target.value); setDisplayLimit(24); }}>
                    <option value="all">All Goal Distances</option>
                    {uniqueGoals.map(g => (
                      <option key={g} value={g}>{g.replace('_', ' ').toUpperCase()}</option>
                    ))}
                  </Select>
                </div>

                {/* Scenario Type */}
                <div className="space-y-1">
                  <Label>System Scenario</Label>
                  <Select value={scenarioFilter} onChange={e => { setScenarioFilter(e.target.value); setDisplayLimit(24); }}>
                    <option value="all">All Scenarios</option>
                    {uniqueScenarios.map(s => (
                      <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
                    ))}
                  </Select>
                </div>

                {/* Format (e.g. time vs distance) */}
                <div className="space-y-1">
                  <Label>Structural format</Label>
                  <Select value={formatFilter} onChange={e => { setFormatFilter(e.target.value); setDisplayLimit(24); }}>
                    <option value="all">All Formats</option>
                    {uniqueFormats.map(f => (
                      <option key={f} value={f}>{f.replace('_', ' ').toUpperCase()}</option>
                    ))}
                  </Select>
                </div>

                {/* Intensity Target (Z1, Threshold, etc.) */}
                <div className="space-y-1">
                  <Label>Intensity Target</Label>
                  <Select value={intensityFilter} onChange={e => { setIntensityFilter(e.target.value); setDisplayLimit(24); }}>
                    <option value="all">All Intensities</option>
                    {uniqueIntensities.map(i => (
                      <option key={i} value={i}>{i.toUpperCase()}</option>
                    ))}
                  </Select>
                </div>

                {/* COMPARE SIDEBAR TRIGGER */}
                <div className="pt-4 border-t border-dashed border-[#d8ddd8] space-y-3">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-[#374151] block">PROTOCOL DELTA COMPARER</span>
                  <div className="grid grid-cols-1 gap-2">
                    <Select value={compTemplateIdA} onChange={e => setCompTemplateIdA(e.target.value)}>
                      <option value="">Choose Protocol A...</option>
                      {workoutTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </Select>
                    <Select value={compTemplateIdB} onChange={e => setCompTemplateIdB(e.target.value)}>
                      <option value="">Choose Protocol B...</option>
                      {workoutTemplates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </Select>
                    <Button 
                      type="button" 
                      onClick={() => setIsComparing(true)}
                      disabled={!compTemplateIdA || !compTemplateIdB}
                      variant="outline"
                      className="w-full text-xs font-bold"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 mr-2" /> Match Deltas
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* TEMPLATES LIST COLUMN */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex justify-between items-center px-2">
              <span className="text-[11px] font-mono font-bold text-muted-foreground uppercase tracking-widest">
                Showing {filteredTemplates.length} of {workoutTemplates.length} static templates
              </span>
              <span className="px-2.5 py-1 bg-[#f3f4f1] border border-[#d8ddd8] text-[9px] font-bold text-[#6b7280] rounded-full uppercase">
                🔐 REGISTRY METHOD SPECIFICATION
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visibleTemplates.map(template => {
                const isDistanceReps = 'mainSet' in template && template.mainSet && 'reps' in (template.mainSet as any);
                return (
                  <motion.div 
                    layout
                    key={template.id} 
                    className="bg-white border border-[#d8ddd8] rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.01)] transition-all flex flex-col hover:border-[#bfc8c0] hover:shadow-xs group"
                  >
                    <div className="bg-[#f3f4f1]/30 p-4 border-b border-[#d8ddd8] flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-sans font-bold text-sm text-[#0b2f4a] leading-tight group-hover:text-[#0f6fae] transition-colors">{template.name}</h4>
                        <span className="text-[9px] font-mono font-bold uppercase text-[#0b2f4a] bg-[#e6f1f8] border border-[#0b2f4a]/10 px-1.5 py-0.5 rounded block mt-1.5 w-max">
                          {('difficulty' in template ? template.difficulty.replace('_', ' ') : 'Easy')} LEVEL
                        </span>
                      </div>
                      <span className="text-[9px] font-mono leading-none font-bold uppercase text-[#6b7280] shrink-0 border border-[#d8ddd8] px-1.5 py-1 rounded bg-white">
                        {template.format}
                      </span>
                    </div>

                    <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest block mb-1">Workout Structure:</span>
                        {isDistanceReps ? (
                          <div className="p-2.5 bg-[#f3f4f1]/30 rounded border border-[#d8ddd8] text-xs font-mono font-bold text-[#374151]">
                            {('mainSet' in template ? (template.mainSet as any).reps : '')} × {('mainSet' in template && 'distanceMeters' in (template.mainSet as any)) ? `${(template.mainSet as any).distanceMeters}m` : ('mainSet' in template ? `${(template.mainSet as any).durationMinutes} min` : '')} @ {('mainSet' in template ? (template.mainSet as any).intensity : '')}
                          </div>
                        ) : ('mainSet' in template) && template.mainSet ? (
                          <div className="p-2.5 bg-[#f3f4f1]/30 rounded border border-[#d8ddd8] text-xs font-mono font-bold text-[#374151]">
                            {'distanceMeters' in (template.mainSet as any) ? `${(template.mainSet as any).distanceMeters}m` : `${(template.mainSet as any).durationMinutes} min`} @ {(template.mainSet as any).intensity}
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-xs italic">Structured custom protocol outlines.</div>
                        )}
                        <p className="text-[10px] text-muted-foreground font-semibold leading-normal">
                          Useful For: {('goalDistances' in template ? (template.goalDistances as unknown as string[]).map(g => g.replace('_', ' ')).join(', ') : 'any')}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#d8ddd8]/50 flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedTemplateId(template.id)}
                          className="w-full text-xs font-bold h-9 border-[#d8ddd8]"
                        >
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {filteredTemplates.length === 0 && (
                <div className="col-span-full py-16 text-center text-zinc-500 font-bold border border-dashed border-[#d8ddd8] bg-white rounded-xl">
                  No static protocol templates found matching selected filters. Try broadening inputs.
                </div>
              )}
            </div>

            {filteredTemplates.length > displayLimit && (
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={() => setDisplayLimit(prev => prev + 24)}
                  variant="outline"
                  className="px-8 border-[#d8ddd8] font-bold uppercase text-xs"
                >
                  Load More Templates ({filteredTemplates.length - displayLimit} remaining)
                </Button>
              </div>
            )}
          </div>

        </div>
      )}

      {/* SINGLE TEMPLATE CALCULATION VIEW */}
      {selectedTemplate && (
        <div className="space-y-6">
          <Button variant="outline" onClick={() => { setSelectedTemplateId(null); setCopyStatus(null); }} className="text-xs">
            ← Back to Archive Gallery
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* CONFIG PANEL */}
            <div className="lg:col-span-5">
              <Card>
                <CardHeader className="space-y-1">
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 bg-[#0b2f4a] text-white rounded text-[8px] font-bold uppercase tracking-widest">
                      Static Protocol
                    </span>
                    <span className="px-2 py-0.5 bg-[#e6f1f8] text-[#0b2f4a] border border-[#0b2f4a]/10 rounded text-[8px] font-bold uppercase tracking-widest">
                      Manual Input Workspace
                    </span>
                  </div>
                  <CardTitle className="text-xl font-bold text-[#0b2f4a] leading-tight pt-1">
                    {selectedTemplate.name}
                  </CardTitle>
                  <CardDescription className="capitalize">
                    Scenario: {('category' in selectedTemplate ? (selectedTemplate as any).category : '')} • Type: {('workoutType' in selectedTemplate ? (selectedTemplate as any).workoutType : '')} • Level: {('level' in selectedTemplate ? (selectedTemplate as any).level : '')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">

                  {/* Purpose & Audience details */}
                  {('purpose' in selectedTemplate) && (selectedTemplate as any).purpose && (
                    <div className="text-xs text-[#374151] bg-[#f3f4f1]/40 p-3 rounded-lg border border-[#d8ddd8]">
                      <strong className="block text-[9px] font-sans text-zinc-500 uppercase tracking-widest mb-1 font-bold">Workout Purpose:</strong>
                      {(selectedTemplate as any).purpose}
                    </div>
                  )}

                  {/* Guidelines & Advice details */}
                  {((selectedTemplate as any).bestUsedFor || (selectedTemplate as any).notIdealFor) && (
                    <div className="grid grid-cols-2 gap-3 text-[10px] leading-normal font-sans">
                      {(selectedTemplate as any).bestUsedFor && (
                        <div className="bg-[#1f8a5b]/5 p-2.5 rounded border border-[#1f8a5b]/10 text-[#1f8a5b]">
                          <strong className="block text-[8px] uppercase tracking-wider text-[#1f8a5b] font-bold">Best Used For:</strong>
                          {(selectedTemplate as any).bestUsedFor}
                        </div>
                      )}
                      {(selectedTemplate as any).notIdealFor && (
                        <div className="bg-[#b91c1c]/5 p-2.5 rounded border border-[#b91c1c]/10 text-[#b91c1c]">
                          <strong className="block text-[8px] uppercase tracking-wider text-[#b91c1c] font-bold">Not Ideal For:</strong>
                          {(selectedTemplate as any).notIdealFor}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Formulation Outline Box */}
                  <div className="p-3 bg-[#f3f4f1]/30 border border-[#d8ddd8] rounded text-[10px] font-mono leading-relaxed space-y-1">
                    <span className="block uppercase text-[8px] text-[#6b7280] font-sans font-bold mb-1">Sequence Trace Bounds:</span>
                    <div>Warmup Stage: {(selectedTemplate as any).warmup || 'Include optional warm up limits'}</div>
                    {('rawMainSetString' in selectedTemplate) && (selectedTemplate as any).rawMainSetString && (
                      <div className="text-[#0f6fae] font-mono font-bold uppercase bg-white px-2 py-1.5 border rounded border-[#d8ddd8] my-1.5 leading-snug">
                        Main set: {(selectedTemplate as any).rawMainSetString}
                      </div>
                    )}
                    <div>Recovery Stroll: {(selectedTemplate as any).recovery || 'None'}</div>
                    <div>Cooldown Stage: {(selectedTemplate as any).cooldown || 'Include optional recovery limits'}</div>
                  </div>

                  {/* Miscellaneous details */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {((selectedTemplate as any).surface || []).map((s: string) => (
                      <span key={s} className="px-2 py-0.5 bg-[#f3f4f1] text-[#374151] rounded text-[9px] font-bold border border-[#d8ddd8]">
                        🏞️ {s.toUpperCase()}
                      </span>
                    ))}
                    <span className="px-2 py-0.5 bg-[#e6f1f8] text-[#0b2f4a] rounded text-[9px] font-bold border border-[#0b2f4a]/10 uppercase">
                      🎯 CONFIDENCE: {(selectedTemplate as any).confidenceLabel}
                    </span>
                  </div>

                  {/* Parameters Form */}
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <Label>Expected Rep Target Pace (MM:SS/km)</Label>
                      <Input type="text" placeholder="5:00" value={paceInput} onChange={e => setPaceInput(e.target.value)} />
                      {paceInput && parseDurationToSeconds(paceInput) === null && (
                        <ValidationMessage message="Invalid format. Use MM:SS or H:MM:SS (e.g. 5:00)" />
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>Warmup (min)</Label>
                        <Input type="number" min="0" value={warmupInput} onChange={e => setWarmupInput(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label>Cooldown (min)</Label>
                        <Input type="number" min="0" value={cooldownInput} onChange={e => setCooldownInput(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label>Weekly Cumulative Mileage (optional km/mile)</Label>
                      <Input type="number" placeholder="50" value={weeklyMileageInput} onChange={e => setWeeklyMileageInput(e.target.value)} />
                      <p className="text-[10px] text-muted-foreground leading-normal">Required for safety volume checks.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* RESULTS PANEL */}
            <div className="lg:col-span-7 space-y-6">
              {calcResult ? (
                <div className="border border-[#d8ddd8] bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] overflow-hidden">
                  <div className="bg-[#0b2f4a] text-white p-4">
                    <span className="font-sans font-bold text-xs uppercase tracking-widest text-[#e6f1f8]">Calculated Outputs</span>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-[#f3f4f1]/30 border border-[#d8ddd8] rounded-lg text-center">
                        <span className="block text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Calculated Session Time</span>
                        <strong className="font-sans font-bold text-2xl text-[#0b2f4a]">
                          {calcResult.isRange 
                            ? `${formatSecondsToTimeString(calcResult.totalTimeMin)}–${formatSecondsToTimeString(calcResult.totalTimeMax)}`
                            : formatSecondsToTimeString(calcResult.totalTimeMin)}
                        </strong>
                      </div>
                      <div className="p-4 bg-[#f3f4f1]/30 border border-[#d8ddd8] rounded-lg text-center">
                        <span className="block text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Single Rep Limit</span>
                        <strong className="font-sans font-bold text-2xl text-[#0b2f4a]">
                          {calcResult.targetRepTime > 0 ? formatSecondsToTimeString(Math.round(calcResult.targetRepTime)) : '--:--'}
                        </strong>
                      </div>
                      <div className="p-4 bg-[#f3f4f1]/30 border border-[#d8ddd8] rounded-lg text-center">
                        <span className="block text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-1">Active Paced Distance</span>
                        <strong className="font-sans font-bold text-2xl text-[#0b2f4a]">
                          {calcResult.workDist > 0 ? `${(calcResult.workDist/1000).toFixed(2)} km` : '--'}
                        </strong>
                      </div>
                      <div className="p-4 bg-[#f3f4f1]/30 border border-[#d8ddd8] rounded-lg text-center">
                        <span className="block text-[10px] uppercase font-bold tracking-wider text-[#374151] mb-1">Paced work : rest time</span>
                        <strong className="font-mono text-xs font-bold text-[#374151] leading-none block pt-1.5">
                          {formatSecondsToTimeString(Math.round(calcResult.workTime))} / {
                            calcResult.isRange 
                              ? `${formatSecondsToTimeString(Math.round(calcResult.restTimeMin))}–${formatSecondsToTimeString(Math.round(calcResult.restTimeMax))}`
                              : formatSecondsToTimeString(Math.round(calcResult.restTimeMin))
                          }
                        </strong>
                      </div>
                    </div>

                    {/* Safety compliance alerts (Static Rules Only) */}
                    {activeSafetyFlags.length > 0 && (
                      <div className="bg-[#b91c1c]/5 border border-[#b91c1c]/20 text-[#b91c1c] p-4 flex gap-3 rounded-xl">
                        <AlertCircle className="w-5 h-5 shrink-0 text-[#b91c1c]" />
                        <div className="space-y-1 text-[#111827] leading-normal text-xs">
                          <p className="font-bold uppercase tracking-widest text-[9px] text-[#b91c1c]">RULE-BASED SAFETY EXCEEDED</p>
                          {activeSafetyFlags.map(rule => (
                            <div key={rule.id} className="flex flex-col mb-1 pt-1.5 border-t border-[#b91c1c]/10">
                              <strong className="text-[#0b2f4a] tracking-wide font-bold">{rule.name}</strong>
                              <span className="text-[#374151] text-[11px] font-normal">{rule.message}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Explanation details and traceability */}
                    <div className="p-4 bg-[#f3f4f1]/30 border border-[#d8ddd8] rounded-xl text-[10px] font-mono text-zinc-700 leading-relaxed space-y-3">
                      <div>
                        <strong className="text-foreground uppercase text-[8px] font-sans block mb-1">Calculation Trace Logs:</strong>
                        <ul className="list-disc pl-4 space-y-1">
                          <li>Pace input translated: {pSec} seconds per km</li>
                          {calcResult.calculationMode === "duration_reps" && (
                            <>
                              <li>Rep duration defined in template: {formatSecondsToTimeString(calcResult.singleRepDurationSeconds)} ({calcResult.singleRepDurationSeconds} sec)</li>
                              <li>Single rep distance mapped: {calcResult.singleRepDurationSeconds}s / {pSec}s/km = {calcResult.singleRepDistanceKm.toFixed(2)} km</li>
                              <li>Total work duration: {calcResult.reps} × {formatSecondsToTimeString(calcResult.singleRepDurationSeconds)} = {formatSecondsToTimeString(calcResult.workTime)}</li>
                              <li>Active work distance: {calcResult.reps} × {calcResult.singleRepDistanceKm.toFixed(2)} km = {(calcResult.workDist/1000).toFixed(2)} km</li>
                            </>
                          )}
                          {calcResult.calculationMode === "distance_reps" && (
                            <>
                              <li>Rep distance defined in template: {calcResult.singleRepDistanceKm.toFixed(2)} km</li>
                              <li>Single rep duration mapped: {calcResult.singleRepDistanceKm.toFixed(2)} km × {pSec}s/km = {formatSecondsToTimeString(calcResult.singleRepDurationSeconds)}</li>
                              <li>Total work duration: {calcResult.reps} × {formatSecondsToTimeString(calcResult.singleRepDurationSeconds)} = {formatSecondsToTimeString(calcResult.workTime)}</li>
                              <li>Active work distance: {calcResult.reps} × {calcResult.singleRepDistanceKm.toFixed(2)} km = {(calcResult.workDist/1000).toFixed(2)} km</li>
                            </>
                          )}
                          {calcResult.calculationMode === "continuous" && (
                            <>
                              <li>Continuous duration defined in template: {formatSecondsToTimeString(calcResult.singleRepDurationSeconds)}</li>
                              <li>Mapped continuous distance: {calcResult.singleRepDurationSeconds}s / {pSec}s/km = {calcResult.singleRepDistanceKm.toFixed(2)} km</li>
                            </>
                          )}
                          {calcResult.calculationMode === "continuous_distance" && (
                            <>
                              <li>Continuous distance defined in template: {calcResult.singleRepDistanceKm.toFixed(2)} km</li>
                              <li>Mapped continuous duration: {calcResult.singleRepDistanceKm.toFixed(2)} km × {pSec}s/km = {formatSecondsToTimeString(calcResult.singleRepDurationSeconds)}</li>
                            </>
                          )}
                          {calcResult.reps > 1 && (
                            <li>
                              Rest duration: {calcResult.reps - 1} recoveries × {
                                calcResult.isRange 
                                  ? `${formatSecondsToTimeString(calcResult.restTimeMin / (calcResult.reps - 1))}–${formatSecondsToTimeString(calcResult.restTimeMax / (calcResult.reps - 1))}`
                                  : formatSecondsToTimeString(calcResult.restTimeMin / (calcResult.reps - 1))
                              } = {
                                calcResult.isRange
                                  ? `${formatSecondsToTimeString(calcResult.restTimeMin)}–${formatSecondsToTimeString(calcResult.restTimeMax)}`
                                  : formatSecondsToTimeString(calcResult.restTimeMin)
                              }
                            </li>
                          )}
                          <li>Warmup stage: {warmupInput} min ({parseFloat(warmupInput) * 60} seconds)</li>
                          <li>Cooldown stage: {cooldownInput} min ({parseFloat(cooldownInput) * 60} seconds)</li>
                          <li className="font-bold text-[#0b2f4a]">
                            Session Total Time: {
                              calcResult.isRange 
                                ? `${formatSecondsToTimeString(calcResult.totalTimeMin)}–${formatSecondsToTimeString(calcResult.totalTimeMax)}`
                                : formatSecondsToTimeString(calcResult.totalTimeMin)
                            }
                          </li>
                        </ul>
                      </div>
                      
                      {parseFloat(weeklyMileageInput) > 0 && (
                        <div>
                          <strong className="text-foreground uppercase text-[8px] font-sans block mb-1">Mileage Context Info:</strong>
                          <p>
                            Weekly mileage input: {weeklyMileageInput} km. Active run represents <span className="font-bold">
                              {((calcResult.workDist / 1000) / parseFloat(weeklyMileageInput) * 100).toFixed(1)}%
                            </span> of weekly volume.
                          </p>
                        </div>
                      )}

                      <p><strong className="text-foreground uppercase text-[8px] font-sans block">Axioms &amp; Limitations:</strong> Mathematical projections. Does not represent environmental wind friction resistance, gradient changes, or biomechanical stride variations.</p>
                      <p><strong className="text-foreground uppercase text-[8px] font-sans block">Confidence label:</strong> Estimate</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button variant="secondary" onClick={handleCopySummary} className="flex-1 text-xs">
                        <Copy className="w-4 h-4 mr-2" /> {copyStatus || 'Copy Metrics'}
                      </Button>
                      <Link 
                        href={`/workout?template=${selectedTemplate.id}&warmup=${warmupInput}&cooldown=${cooldownInput}`}
                        className="flex-1 px-4 py-2 bg-[#0b2f4a] text-white border border-[#0b2f4a] rounded-lg text-xs font-bold uppercase text-center flex items-center justify-center hover:bg-[#0f6fae] shadow-sm transition-all"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" /> Load in Workout Lab
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 border border-dashed border-[#d8ddd8] rounded-xl text-center bg-white flex flex-col items-center justify-center min-h-[300px] space-y-3">
                  <ShieldAlert className="w-10 h-10 text-[#b91c1c] stroke-1" />
                  <span className="font-bold text-sm uppercase tracking-widest text-[#0b2f4a]">STATIONARY REPLICAS NOT COMPILEABLE</span>
                  <p className="text-xs text-muted-foreground max-w-sm leading-normal">
                    This template contains static structural bounds. Enter complete reps, warmup, cooldown, and target paces to calculate or explore structural metrics.
                  </p>
                  <Link 
                    href={`/workout?template=${selectedTemplate.id}&warmup=${warmupInput}&cooldown=${cooldownInput}`}
                    className="inline-flex h-10 items-center justify-center rounded-lg text-xs font-bold uppercase tracking-wider transition-all px-4 bg-[#0b2f4a] text-white border border-[#0b2f4a] hover:bg-[#0f6fae] shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4 mr-2 inline" /> Open in Workout Lab
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* DOUBLE TEMPLATE COMPARER SCREEN */}
      {isComparing && (
        <div className="space-y-6">
          <Button variant="outline" onClick={() => setIsComparing(false)} className="text-xs">
            ← Close Comparison Layout
          </Button>

          {comparisonData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              
              <Card className="border border-[#d8ddd8] shadow-[0_2px_8px_rgba(0,0,0,0.01)] bg-white">
                <CardHeader className="bg-[#0b2f4a] text-white">
                  <CardTitle className="uppercase text-xs text-[#e6f1f8] tracking-widest">Protocol Comparison Deltas</CardTitle>
                </CardHeader>
                <div className="p-6 space-y-4 font-mono text-xs leading-relaxed text-[#374151]">
                  <div className="flex justify-between items-center border-b border-[#e9ece8] pb-2">
                    <span className="text-[#6b7280]">Protocol A label</span>
                    <span className="text-[#0b2f4a] font-bold uppercase">{comparisonData.templateA.name}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-[#e9ece8] pb-2">
                    <span className="text-[#6b7280]">Protocol B label</span>
                    <span className="text-[#0b2f4a] font-bold uppercase">{comparisonData.templateB.name}</span>
                  </div>

                  {!comparisonData.canCompare ? (
                    <div className="p-4 border border-dashed border-[#b91c1c]/20 text-[#b91c1c] bg-[#b91c1c]/5 text-center rounded-xl">
                      <span className="font-bold block uppercase text-xs">Cannot calculate comparison</span>
                      <p className="text-[10px] text-[#374151] mt-1 font-normal">One or both templates are qualitative/static and cannot be computed.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 pt-2">
                      <div className="p-3 bg-[#f3f4f1]/30 border border-[#d8ddd8] rounded-xl">
                        <span className="text-[9px] uppercase tracking-wider text-[#bfc8c0]">Duration Delta</span>
                        <div className="text-sm font-bold text-[#0b2f4a] mt-1 font-sans">
                          {comparisonData.deltaDuration === 0 ? 'Equal Session Times' : `${formatSecondsToTimeString(Math.abs(comparisonData.deltaDuration!))} ${comparisonData.deltaDuration! < 0 ? 'shorter A' : 'shorter B'}`}
                        </div>
                      </div>
                      <div className="p-3 bg-[#f3f4f1]/30 border border-[#d8ddd8] rounded-xl">
                        <span className="text-[9px] uppercase tracking-wider text-[#bfc8c0]">Distance Delta</span>
                        <div className="text-sm font-bold text-[#0b2f4a] mt-1 font-sans">
                          {comparisonData.deltaDistanceKm === 0 ? 'Equal Paced Volume' : `${Math.abs(comparisonData.deltaDistanceKm!).toFixed(2)} km ${comparisonData.deltaDistanceKm! < 0 ? 'smaller A' : 'smaller B'}`}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <div className="space-y-4">
                <div className="p-4 border border-[#d8ddd8] bg-[#f3f4f1]/30 rounded-xl text-[10px] font-mono leading-relaxed text-[#374151]">
                  <span className="text-[#0b2f4a] uppercase tracking-wider block mb-1 font-sans text-[9px] font-bold">Calculated Basis:</span>
                  <div>Pacing Basis used for match: {paceInput} per kilometer</div>
                  <div>Planned Warmup Minutes: {warmupInput}m</div>
                  <div>Planned Cooldown Minutes: {cooldownInput}m</div>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

    </div>
  );
}

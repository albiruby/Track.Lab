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
  let workDist = 0;
  let workTime = 0;
  let restTime = 0;
  let targetRepTime = 0;

  const mSet = 'mainSet' in template ? (template as any).mainSet : null;

  if (mSet) {
    if (mSet.type === 'distance_reps') {
      const reps = mSet.reps || 1;
      const dist = mSet.distanceMeters || 0;
      workDist = reps * dist;
      targetRepTime = (dist / 1000) * paceSec;
      workTime = targetRepTime * reps;
      let rSec = mSet.rest?.durationSeconds || (mSet.rest?.durationMinutes ? mSet.rest.durationMinutes * 60 : 0);
      if (mSet.rest?.rule === 'equal_work_time') {
         rSec = targetRepTime;
      }
      restTime = Math.max(0, reps - 1) * rSec;
    } else if (mSet.type === 'time_reps') {
      const reps = mSet.reps || 1;
      const dur = mSet.durationMinutes ? mSet.durationMinutes * 60 : (mSet.durationSeconds || 0);
      workTime = reps * dur;
      workDist = (workTime / paceSec) * 1000;
      targetRepTime = dur;
      let rSec = mSet.rest?.durationSeconds || (mSet.rest?.durationMinutes ? mSet.rest.durationMinutes * 60 : 0);
      if (mSet.rest?.rule === 'equal_work_time') {
         rSec = targetRepTime;
      }
      restTime = Math.max(0, reps - 1) * rSec;
    } else if (mSet.type === 'continuous_distance') {
      workDist = mSet.distanceMeters || 0;
      workTime = (workDist / 1000) * paceSec;
    } else if (mSet.type === 'continuous') {
      workTime = (mSet.durationMinutes || 0) * 60;
      if (paceSec > 0) workDist = (workTime / paceSec) * 1000;
    } else if (mSet.type === 'alternating_time') {
      const reps = mSet.reps || 1;
      const onTime = (mSet.onMinutes || 0) * 60;
      const offTime = (mSet.offMinutes || 0) * 60;
      workTime = reps * onTime;
      restTime = reps * offTime; 
      if (paceSec > 0) workDist = (workTime / paceSec) * 1000;
    }
  }

  const warmTime = warmupMin * 60;
  const coolTime = cooldownMin * 60;
  
  return {
    workDist,
    workTime,
    restTime,
    targetRepTime,
    totalTime: workTime + restTime + warmTime + coolTime
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

  // Single Template Projection
  const calcResult = useMemo(() => {
    if (!selectedTemplate) return null;
    const pSec = paceInput ? parseDurationToSeconds(paceInput) : 0;
    if (!pSec || pSec <= 0) return null;

    return calculateWorkout(
      selectedTemplate, 
      pSec, 
      parseFloat(warmupInput) || 0, 
      parseFloat(cooldownInput) || 0
    );
  }, [selectedTemplate, paceInput, warmupInput, cooldownInput]);

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

    return {
      templateA: tA,
      templateB: tB,
      resA,
      resB,
      deltaDuration: resA.totalTime - resB.totalTime,
      deltaDistanceKm: (resA.workDist - resB.workDist) / 1000
    };
  }, [isComparing, compTemplateIdA, compTemplateIdB, paceInput, warmupInput, cooldownInput]);

  // Copy Summary Handler
  const handleCopySummary = () => {
    if (!selectedTemplate || !calcResult) return;
    const summaryText = 
      `Workout: ${selectedTemplate.name}\n` +
      `Category: ${selectedTemplate.scenario} | Difficulty: ${selectedTemplate.difficulty}\n` +
      `Target Rep Time: ${formatSecondsToTimeString(Math.round(calcResult.targetRepTime))}\n` +
      `Estimated Session Work Distance: ${(calcResult.workDist/1000).toFixed(2)} km\n` +
      `Calculated Session Duration: ${formatSecondsToTimeString(calcResult.totalTime)}`;
    
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
  };

  return (
    <div className="space-y-6">
      {/* Header bar and routing shortcuts */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="font-display font-black text-3xl uppercase tracking-tight text-foreground">SESSION ARCHIVE</h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Review static running protocol templates and calculate manual duration projections.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/workout" className="px-4 py-2 bg-primary text-primary-foreground border-2 border-border-heavy rounded-lg text-xs font-bold uppercase shadow-[1.5px_1.5px_0px_rgba(23,23,23,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
            🛠️ GO TO WORKOUT LAB
          </Link>
          <Link href="/calendar" className="px-4 py-2 bg-white text-foreground border-2 border-border-heavy rounded-lg text-xs font-bold uppercase shadow-[1.5px_1.5px_0px_rgba(23,23,23,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
            📅 PREVIEW WEEK
          </Link>
        </div>
      </div>

      {/* Dynamic Filter Layout */}
      {!selectedTemplate && !isComparing && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* FILTER PANEL */}
          <div className="lg:col-span-4 p-6 border-2 border-border-heavy bg-card rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)] space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <span className="font-display font-black text-xs uppercase tracking-widest text-zinc-700 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-primary" /> SEARCH & FILTER
              </span>
              <button onClick={handleResetFilters} className="text-[10px] font-black uppercase text-muted-foreground hover:text-foreground">
                Reset
              </button>
            </div>

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
                <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-muted-foreground" />
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
            <div className="pt-4 border-t-2 border-dashed border-border-heavy mt-4 space-y-4">
              <span className="font-display font-black text-[10px] tracking-widest uppercase text-zinc-600 block">PROTOCOL COMPARER</span>
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
                  <ArrowLeftRight className="w-4 h-4 mr-2" /> Match Delas
                </Button>
              </div>
            </div>

          </div>

          {/* TEMPLATES LIST COLUMN */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex justify-between items-center px-2">
              <span className="text-[11px] font-mono font-black text-muted-foreground uppercase tracking-widest">
                Showing {filteredTemplates.length} of {workoutTemplates.length} static templates
              </span>
              <span className="px-2.5 py-1 bg-neutral-100 border-2 border-border text-[9px] font-bold text-zinc-650 rounded-full">
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
                    className="border-2 border-border-heavy bg-white rounded-xl shadow-[2.5px_2.5px_0px_rgba(23,23,23,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[5px_5px_0px_rgba(23,23,23,1)] transition-all flex flex-col overflow-hidden"
                  >
                    <div className="bg-muted p-4 border-b-2 border-border-heavy flex justify-between items-start gap-2">
                      <div>
                        <h4 className="font-display font-black text-sm uppercase text-foreground leading-tight">{template.name}</h4>
                        <span className="text-[9px] font-mono font-bold uppercase text-primary-foreground bg-primary border px-1.5 py-0.5 rounded block mt-1.5 w-max">
                          {('difficulty' in template ? template.difficulty.replace('_', ' ') : 'Easy')} LEVEL
                        </span>
                      </div>
                      <span className="text-[9px] font-mono leading-none font-bold uppercase text-muted-foreground shrink-0 border border-border px-1.5 py-1 rounded bg-white">
                        {template.format}
                      </span>
                    </div>

                    <div className="p-4 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase tracking-widest block mb-1">Workout Structure Bounds:</span>
                        {isDistanceReps ? (
                          <div className="p-2.5 bg-neutral-50 rounded border text-xs font-mono font-bold text-zinc-700">
                            {('mainSet' in template ? (template.mainSet as any).reps : '')} × {('mainSet' in template && 'distanceMeters' in (template.mainSet as any)) ? `${(template.mainSet as any).distanceMeters}m` : ('mainSet' in template ? `${(template.mainSet as any).durationMinutes} min` : '')} @ {('mainSet' in template ? (template.mainSet as any).intensity : '')}
                          </div>
                        ) : ('mainSet' in template) && template.mainSet ? (
                          <div className="p-2.5 bg-neutral-50 rounded border text-xs font-mono font-bold text-zinc-700">
                            {'distanceMeters' in (template.mainSet as any) ? `${(template.mainSet as any).distanceMeters}m` : `${(template.mainSet as any).durationMinutes} min`} @ {(template.mainSet as any).intensity}
                          </div>
                        ) : (
                          <div className="text-muted-foreground text-xs italic">Structured custom protocol outlines.</div>
                        )}
                        <p className="text-[10px] text-muted-foreground font-semibold leading-normal">
                          Goal Scenarios: {('goalDistances' in template ? (template.goalDistances as unknown as string[]).map(g => g.replace('_', ' ')).join(', ') : 'any')}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-neutral-100 flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedTemplateId(template.id)}
                          className="w-full text-xs font-black h-10 border-2"
                        >
                          Use Template
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
              {filteredTemplates.length === 0 && (
                <div className="col-span-full py-16 text-center text-zinc-500 font-bold border-2 border-dashed border-border bg-card rounded-xl">
                  No static protocol templates found matching selected filters. Try broadening inputs.
                </div>
              )}
            </div>

            {filteredTemplates.length > displayLimit && (
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={() => setDisplayLimit(prev => prev + 24)}
                  variant="outline"
                  className="px-8 border-2 font-black uppercase text-xs"
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
            <div className="lg:col-span-5 p-6 border-2 border-border-heavy bg-white rounded-xl shadow-[4px_4px_0px_rgba(23,23,23,1)] space-y-4">
              <div>
                <span className="px-2 py-0.5 bg-neutral-900 text-white rounded text-[8px] font-bold uppercase tracking-widest mr-2 inline-block">
                  STATIC PROTOCOL
                </span>
                <span className="px-2 py-0.5 bg-primary text-primary-foreground rounded text-[8px] font-bold uppercase tracking-widest inline-block">
                  MANUAL INPUT REQUIRED
                </span>
                <h3 className="font-display font-black text-xl text-zinc-800 uppercase mt-2">{selectedTemplate.name}</h3>
                <p className="text-xs font-bold text-muted-foreground capitalize mt-0.5">
                  Scenario: {('category' in selectedTemplate ? (selectedTemplate as any).category : '')} • Type: {('workoutType' in selectedTemplate ? (selectedTemplate as any).workoutType : '')} • Level: {('level' in selectedTemplate ? (selectedTemplate as any).level : '')}
                </p>
              </div>

              {/* Purpose & Audience details */}
              {('purpose' in selectedTemplate) && (selectedTemplate as any).purpose && (
                <div className="text-xs text-zinc-650 bg-neutral-50 p-3 rounded-lg border border-border">
                  <strong className="block text-[9px] font-sans text-zinc-500 uppercase tracking-widest mb-1 font-bold">Workout Purpose:</strong>
                  {(selectedTemplate as any).purpose}
                </div>
              )}

              {/* Guidelines & Advice details */}
              {((selectedTemplate as any).bestUsedFor || (selectedTemplate as any).notIdealFor) && (
                <div className="grid grid-cols-2 gap-3 text-[10px] leading-normal font-sans">
                  {(selectedTemplate as any).bestUsedFor && (
                    <div className="bg-emerald-50/50 p-2.5 rounded border border-emerald-100 text-emerald-950">
                      <strong className="block text-[8px] uppercase tracking-wider text-emerald-800 font-bold">Best Used For:</strong>
                      {(selectedTemplate as any).bestUsedFor}
                    </div>
                  )}
                  {(selectedTemplate as any).notIdealFor && (
                    <div className="bg-red-50/50 p-2.5 rounded border border-red-150 text-red-950">
                      <strong className="block text-[8px] uppercase tracking-wider text-red-800 font-bold">Not Ideal For:</strong>
                      {(selectedTemplate as any).notIdealFor}
                    </div>
                  )}
                </div>
              )}

              {/* Formulation Outline Box */}
              <div className="p-3 bg-neutral-50 border-2 border-border-heavy rounded text-[10px] font-mono font-bold leading-relaxed space-y-1">
                <span className="block uppercase text-[8px] text-muted-foreground font-sans">Sequence trace bounds:</span>
                <div>Warmup Stage: {(selectedTemplate as any).warmup || 'Include optional warm up limits'}</div>
                {('rawMainSetString' in selectedTemplate) && (selectedTemplate as any).rawMainSetString && (
                  <div className="text-primary font-black uppercase bg-white px-2 py-1.5 border rounded border-border my-1.5 leading-snug">
                    Main set: {(selectedTemplate as any).rawMainSetString}
                  </div>
                )}
                <div>Recovery Stroll: {(selectedTemplate as any).recovery || 'None'}</div>
                <div>Cooldown Stage: {(selectedTemplate as any).cooldown || 'Include optional recovery limits'}</div>
              </div>

              {/* Miscellaneous details */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {((selectedTemplate as any).surface || []).map((s: string) => (
                  <span key={s} className="px-2 py-0.5 bg-neutral-100 text-zinc-600 rounded text-[9px] font-bold border border-neutral-200">
                    🏞️ {s.toUpperCase()}
                  </span>
                ))}
                <span className="px-2 py-0.5 bg-neutral-150 text-zinc-600 rounded text-[9px] font-bold border border-neutral-200 uppercase">
                  🎯 CONFIDENCE: {(selectedTemplate as any).confidenceLabel}
                </span>
              </div>

              {/* Parameters Form */}
              <div className="space-y-4 pt-2">
                <div className="space-y-1">
                  <Label>Expected Rep Target Pace (MM:SS/km)</Label>
                  <Input type="text" placeholder="5:00" value={paceInput} onChange={e => setPaceInput(e.target.value)} />
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
            </div>

            {/* RESULTS PANEL */}
            <div className="lg:col-span-7 space-y-6">
              {calcResult ? (
                <div className="border-2 border-border-heavy bg-white rounded-xl shadow-[4px_4px_0px_rgba(23,23,23,1)] overflow-hidden">
                  <div className="bg-neutral-900 text-white p-4 border-b-2 border-border-heavy">
                    <span className="font-display font-black text-xs uppercase tracking-widest text-indigo-400">PROJECTED METRIC OUTPUTS</span>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-muted border-2 border-border-heavy rounded-lg text-center shadow-sm">
                        <span className="block text-[10px] uppercase font-black tracking-wider text-muted-foreground mb-1">Calculated Session Time</span>
                        <strong className="font-display font-black text-3xl text-foreground">{formatSecondsToTimeString(calcResult.totalTime)}</strong>
                      </div>
                      <div className="p-4 bg-muted border-2 border-border-heavy rounded-lg text-center shadow-sm">
                        <span className="block text-[10px] uppercase font-black tracking-wider text-muted-foreground mb-1">Single Rep Limit</span>
                        <strong className="font-display font-black text-2xl text-foreground">{calcResult.targetRepTime > 0 ? formatSecondsToTimeString(Math.round(calcResult.targetRepTime)) : '--:--'}</strong>
                      </div>
                      <div className="p-4 bg-muted border-2 border-border-heavy rounded-lg text-center shadow-sm">
                        <span className="block text-[10px] uppercase font-black tracking-wider text-muted-foreground mb-1">Active Paced Distance</span>
                        <strong className="font-display font-black text-2xl text-foreground">{calcResult.workDist > 0 ? `${(calcResult.workDist/1000).toFixed(2)} km` : '--'}</strong>
                      </div>
                      <div className="p-4 bg-muted border-2 border-border-heavy rounded-lg text-center shadow-sm">
                        <span className="block text-[10px] uppercase font-black tracking-wider text-muted-foreground mb-1">Paced work : rest time</span>
                        <strong className="font-mono text-sm font-bold text-zinc-700 leading-none">
                          {formatSecondsToTimeString(Math.round(calcResult.workTime))} / {formatSecondsToTimeString(Math.round(calcResult.restTime))}
                        </strong>
                      </div>
                    </div>

                    {/* Safety compliance alerts (Static Rules Only) */}
                    {activeSafetyFlags.length > 0 && (
                      <div className="bg-white border-2 border-destructive text-destructive p-4 flex gap-3 rounded-lg shadow-[2.5px_2.5px_0px_rgba(232,76,61,1)]">
                        <AlertCircle className="w-5 h-5 shrink-0 text-destructive" />
                        <div className="space-y-1 text-foreground leading-normal text-xs">
                          <p className="font-bold uppercase tracking-widest text-[9px] text-destructive">RULE-BASED SAFETY EXCEEDED</p>
                          {activeSafetyFlags.map(rule => (
                            <div key={rule.id} className="flex flex-col mb-1 pt-1 border-t border-red-50">
                              <strong className="text-foreground tracking-wide">{rule.name}</strong>
                              <span className="text-zinc-550 text-[11px]">{rule.message}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Explanation details and traceability */}
                    <div className="p-4 bg-zinc-50 border border-zinc-200 rounded text-[10px] font-mono text-zinc-650 leading-relaxed space-y-3">
                      <p><strong className="text-foreground uppercase text-[8px] font-sans block">Formula Method used:</strong> Static structure layout + multiplier durations.</p>
                      <p><strong className="text-foreground uppercase text-[8px] font-sans block">Trace inputs used:</strong> Base Pace: {paceInput}, Warmup {warmupInput}m, Cooldown {cooldownInput}m</p>
                      <p><strong className="text-foreground uppercase text-[8px] font-sans block">Axioms &amp; Limitations:</strong> Mathematical projections. Does not represent environmental wind friction resistance, gradient changes, or biomechanical stride variations.</p>
                      <p><strong className="text-foreground uppercase text-[8px] font-sans block">Confidence label:</strong> Estimate</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button variant="secondary" onClick={handleCopySummary} className="flex-1 text-xs">
                        <Copy className="w-4 h-4 mr-2" /> {copyStatus || 'Copy Metrics'}
                      </Button>
                      <Link 
                        href={`/workout?template=${selectedTemplate.id}&warmup=${warmupInput}&cooldown=${cooldownInput}`}
                        className="flex-1 px-4 py-2 bg-primary text-primary-foreground border-2 border-border-heavy rounded-lg text-xs font-bold uppercase text-center flex items-center justify-center shadow-[1.5px_1.5px_0px_rgba(23,23,23,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" /> Load in Workout Lab
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 border-2 border-dashed border-border-heavy rounded-xl text-center bg-card flex flex-col items-center justify-center min-h-[300px]">
                  <SlidersHorizontal className="w-12 h-12 text-muted-foreground stroke-1 mb-3" />
                  <span className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Waiting for valid inputs</span>
                  <p className="text-[11px] text-zinc-500 max-w-xs mt-1 leading-normal">Provide a valid rep cadence pace (e.g. 5:00) to trace total duration sums inside the deterministic formula engine.</p>
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
              
              <Card className="border-2 border-border-heavy shadow-[4px_4px_0px_rgba(23,23,23,1)] bg-white">
                <CardHeader className="bg-neutral-900 text-white border-b-2 border-border-heavy">
                  <span className="font-display font-black text-xs uppercase tracking-widest text-indigo-400">PROTOCOL COMPARISON DELTAS</span>
                </CardHeader>
                <div className="p-6 space-y-4 font-mono font-bold text-xs leading-relaxed text-zinc-805">
                  <div className="flex justify-between items-center border-b pb-2">
                    <span>Protocol A Label</span>
                    <span className="text-primary uppercase">{comparisonData.templateA.name}</span>
                  </div>
                  <div className="flex justify-between items-center border-b pb-2">
                    <span>Protocol B Label</span>
                    <span className="text-primary uppercase">{comparisonData.templateB.name}</span>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="p-3 bg-muted border rounded">
                      <span>DURATION DELTA</span>
                      <div className="text-sm font-black text-zinc-850 mt-1">
                        {comparisonData.deltaDuration === 0 ? 'Equal Session Times' : `${formatSecondsToTimeString(Math.abs(comparisonData.deltaDuration))} ${comparisonData.deltaDuration < 0 ? 'shorter A' : 'shorter B'}`}
                      </div>
                    </div>
                    <div className="p-3 bg-muted border rounded">
                      <span>DISTANCE DELTA</span>
                      <div className="text-sm font-black text-zinc-850 mt-1">
                        {comparisonData.deltaDistanceKm === 0 ? 'Equal Paced Volume' : `${Math.abs(comparisonData.deltaDistanceKm).toFixed(2)} km ${comparisonData.deltaDistanceKm < 0 ? 'smaller in A' : 'smaller in B'}`}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="space-y-4">
                <div className="p-4 border border-zinc-200 bg-zinc-50 rounded text-[10px] font-mono leading-relaxed font-bold">
                  <span className="text-foreground uppercase tracking-wider block mb-1 font-sans text-[9px]">Calculated Basis:</span>
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

'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input, Label, Button, Select, ValidationMessage } from '@/components/ui/Forms';
import { LabPageHeader } from '@/components/layout/LabPageHeader';
import { workoutTemplates, raceDistances, workoutSafetyRules } from '@/data';
import { parseDurationToSeconds, formatSecondsToTimeString, formatPace , safeNumber } from '@/lib/formatters/time';
import { AlertCircle } from 'lucide-react';

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
  const [goalFilter, setGoalFilter] = useState<string>('all');
  const [scenarioFilter, setScenarioFilter] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');

  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  
  const [paceInput, setPaceInput] = useState('');
  const [warmupInput, setWarmupInput] = useState('15');
  const [cooldownInput, setCooldownInput] = useState('10');
  
  const [weeklyMileageInput, setWeeklyMileageInput] = useState('');
  
  const selectedTemplate = useMemo(() => workoutTemplates.find(t => t.id === selectedTemplateId), [selectedTemplateId]);

  const filteredTemplates = useMemo(() => {
    return workoutTemplates.filter(t => {
      const matchGoal = goalFilter === 'all' || ('goalDistances' in t && (t.goalDistances as unknown as string[]).includes(goalFilter));
      const matchScenario = scenarioFilter === 'all' || ('scenario' in t && t.scenario === scenarioFilter);
      const matchFormat = formatFilter === 'all' || ('format' in t && t.format === formatFilter);
      return matchGoal && matchScenario && matchFormat;
    });
  }, [goalFilter, scenarioFilter, formatFilter]);

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

  let calcResult = null;
  const parsedSecs = paceInput ? parseDurationToSeconds(paceInput) : 0;
  const pSec = parsedSecs === null ? 0 : parsedSecs;
  if (selectedTemplate && pSec > 0) {
    calcResult = calculateWorkout(
      selectedTemplate, 
      pSec, 
      parseFloat(warmupInput) || 0, 
      parseFloat(cooldownInput) || 0
    );
  }

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
         // rough total dist estimate
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

  return (
    <div className="space-y-6">
      <LabPageHeader title="SESSION ARCHIVE" subtitle="View and calculate static structured interval templates." />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-card border-2 border-border-heavy rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
        <div className="space-y-2 z-10">
          <Label>Goal Distance</Label>
          <Select value={goalFilter} onChange={e => setGoalFilter(e.target.value)}>
            <option value="all">All Distances</option>
            {uniqueGoals.map(g => <option key={g} value={g}>{g.replace('_', ' ').toUpperCase()}</option>)}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Scenario</Label>
          <Select value={scenarioFilter} onChange={e => setScenarioFilter(e.target.value)}>
            <option value="all">All Scenarios</option>
            {uniqueScenarios.map(s => <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>)}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Format</Label>
          <Select value={formatFilter} onChange={e => setFormatFilter(e.target.value)}>
            <option value="all">All Formats</option>
            {uniqueFormats.map(f => <option key={f} value={f}>{f.replace('_', ' ').toUpperCase()}</option>)}
          </Select>
        </div>
      </div>

      {selectedTemplate ? (
        <div className="space-y-6">
          <Button variant="secondary" onClick={() => setSelectedTemplateId(null)}>← Back to Library</Button>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-display font-black uppercase tracking-tight">{selectedTemplate.name}</CardTitle>
                <CardDescription className="capitalize font-bold text-xs tracking-widest text-primary">
                  {('scenario' in selectedTemplate ? selectedTemplate.scenario.replace('_', ' ') : '')} • {('difficulty' in selectedTemplate ? selectedTemplate.difficulty.replace('_', ' ') : '')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-white border-2 border-border-heavy rounded-lg text-xs font-mono font-bold space-y-2 text-foreground shadow-[inset_1px_1px_0px_rgba(0,0,0,0.1)]">
                  <div className="tracking-widest uppercase text-[10px] mb-2 text-muted-foreground font-sans">Structure Trace</div>
                  {('warmup' in selectedTemplate) && selectedTemplate.warmup && <div>WARMUP STAGE = TRUE</div>}
                  {('mainSet' in selectedTemplate) && selectedTemplate.mainSet && (
                    <div className="text-primary">MAIN_STAGE: {('reps' in selectedTemplate.mainSet) ? `${selectedTemplate.mainSet.reps}x ` : ''} {('distanceMeters' in selectedTemplate.mainSet) ? `${selectedTemplate.mainSet.distanceMeters}m` : (('durationMinutes' in selectedTemplate.mainSet) ? `${selectedTemplate.mainSet.durationMinutes}m` : '')} @ {('intensity' in selectedTemplate.mainSet) ? (selectedTemplate.mainSet as any).intensity : ''}</div>
                  )}
                  {('cooldown' in selectedTemplate) && selectedTemplate.cooldown && <div>COOLDOWN STAGE = TRUE</div>}
                </div>
                
                <div className="space-y-4 pt-4 border-t border-zinc-800">
                  <div className="space-y-2">
                    <Label htmlFor="pace">Target Rep Pace (mm:ss/km)</Label>
                    <Input id="pace" placeholder="e.g. 05:00" value={paceInput} onChange={e => setPaceInput(e.target.value)} />
                    <p className="text-xs text-zinc-500">Provide an estimated pace to calculate total duration.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="wu">Warm-up (min)</Label>
                      <Input id="wu" type="number" value={warmupInput} onChange={e => setWarmupInput(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cd">Cool-down (min)</Label>
                      <Input id="cd" type="number" value={cooldownInput} onChange={e => setCooldownInput(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wd">Weekly Mileage (optional)</Label>
                    <Input id="wd" type="number" placeholder="e.g. 50" value={weeklyMileageInput} onChange={e => setWeeklyMileageInput(e.target.value)} />
                    <p className="text-xs text-zinc-500">Used for volume and safety threshold verification.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {calcResult ? (
              <div className="border-2 border-border-heavy bg-white rounded-xl shadow-[4px_4px_0px_rgba(23,23,23,1)] h-max flex flex-col overflow-hidden">
                <div className="bg-accent text-accent-foreground px-6 py-4 border-b-2 border-border-heavy">
                  <h3 className="font-bold uppercase tracking-wider text-sm">PROJECTION OUTPUT</h3>
                </div>
                <div className="p-6 space-y-4 flex flex-col flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-card p-4 border-2 border-border-heavy rounded-lg shadow-[inset_1px_1px_0px_rgba(0,0,0,0.05)] text-center">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Total Time</div>
                      <div className="font-display font-black text-3xl text-foreground">{formatSecondsToTimeString(calcResult.totalTime)}</div>
                    </div>
                    <div className="bg-card p-4 border-2 border-border-heavy rounded-lg shadow-[inset_1px_1px_0px_rgba(0,0,0,0.05)] text-center">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Rep Time</div>
                      <div className="font-display font-black text-2xl text-foreground mt-1">{calcResult.targetRepTime > 0 ? formatSecondsToTimeString(Math.round(calcResult.targetRepTime)) : '--:--'}</div>
                    </div>
                    <div className="bg-card p-4 border-2 border-border-heavy rounded-lg shadow-[inset_1px_1px_0px_rgba(0,0,0,0.05)] text-center">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Work Distance</div>
                      <div className="font-display font-black text-2xl text-foreground mt-1">{calcResult.workDist > 0 ? `${(calcResult.workDist/1000).toFixed(2)} km` : '--'}</div>
                    </div>
                    <div className="bg-card p-4 border-2 border-border-heavy rounded-lg shadow-[inset_1px_1px_0px_rgba(0,0,0,0.05)] text-center">
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-1">Work:Rest Time</div>
                      <div className="font-mono text-sm font-bold text-muted-foreground mt-2">
                        {formatSecondsToTimeString(Math.round(calcResult.workTime))} / {formatSecondsToTimeString(Math.round(calcResult.restTime))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-[10px] text-muted-foreground mt-4 pt-4 border-t-2 border-border-heavy space-y-3 font-medium">
                    <div className="space-y-2 mb-4 bg-muted p-4 border-2 border-border-heavy rounded-lg">
                       <p><strong className="text-foreground uppercase tracking-widest mb-1 block">Input Used:</strong> Target {paceInput}, Warmup {warmupInput}m, Cooldown {cooldownInput}m</p>
                       <p><strong className="text-foreground uppercase tracking-widest mb-1 block">Source:</strong> {selectedTemplate.name} Structure</p>
                       <p><strong className="text-foreground uppercase tracking-widest mb-1 block">Formula (Time):</strong> Work Time + Rest Time + Warmup + Cooldown</p>
                       <p><strong className="text-foreground uppercase tracking-widest mb-1 block">Limitation:</strong> Mathematical projection only. Does not factor in fatigue profiles, weather, or terrain.</p>
                       <p><strong className="text-foreground uppercase tracking-widest mb-1 block">Confidence Label:</strong> Estimate</p>
                    </div>

                    {activeSafetyFlags.length > 0 && (
                      <div className="bg-white border-2 border-destructive text-destructive p-4 flex gap-3 rounded-lg shadow-[2px_2px_0px_rgba(232,76,61,1)]">
                        <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                        <div className="space-y-1 w-full text-foreground">
                          <p className="font-bold uppercase tracking-widest text-[10px] mb-1 text-destructive">SYS_WARN: Volume Exceeded</p>
                          {activeSafetyFlags.map(rule => (
                            <div key={rule.id} className="flex flex-col mb-1.5">
                              <strong className="text-[10px]">{rule.name}</strong>
                              <span className="text-[10px]">{rule.message}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {activeSafetyFlags.length === 0 && !weeklyMileageInput && ('safetyRuleIds' in selectedTemplate) && (selectedTemplate.safetyRuleIds as unknown as string[])?.some(id => id.includes('volume') || id.includes('ratio')) && (
                      <div className="bg-card border-2 border-border-heavy text-muted-foreground p-3 rounded-lg font-bold">
                        <p className="text-[10px] uppercase tracking-widest text-center">Provide weekly mileage to verify safe volume ratios for this template.</p>
                      </div>
                    )}
                  </div>
                  <Button variant="outline" className="w-full mt-auto" onClick={() => {
                    navigator.clipboard.writeText(`Workout: ${selectedTemplate.name}\nTotal Time: ${formatSecondsToTimeString(calcResult.totalTime)}\nTarget Rep Time: ${formatSecondsToTimeString(Math.round(calcResult.targetRepTime))}`);
                    alert('Copied to clipboard');
                  }}>Copy Summary</Button>
                </div>
              </div>
            ) : (
              <Card className="h-max">
                <CardContent className="p-6 text-center space-y-2">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Waiting for valid input</p>
                  <p className="text-xs text-zinc-500">Provide a &quot;Target Rep Pace&quot; to calculate workout duration mathematically. No AI estimation occurs without valid user input.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <Card key={template.id} className="flex flex-col hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
              <CardHeader>
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="capitalize">
                  {('scenario' in template ? template.scenario.replace('_', ' ') : '')} • {('difficulty' in template ? template.difficulty.replace('_', ' ') : '')}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="space-y-4 text-sm font-medium">
                  <div>
                    <span className="text-muted-foreground font-bold tracking-widest uppercase text-[10px] pb-1.5 block">Main Set Summary:</span>
                    {('reps' in (('mainSet' in template ? template.mainSet : {}) || {})) ? (
                      <div className="border-2 border-border-heavy bg-card p-3 rounded-lg text-foreground font-mono font-bold text-xs shadow-[inset_1px_1px_0px_rgba(0,0,0,0.05)]">
                        {('mainSet' in template ? (template.mainSet as any).reps : '')} × {('mainSet' in template && 'distanceMeters' in (template.mainSet as any)) ? `${(template.mainSet as any).distanceMeters}m` : ('mainSet' in template ? `${(template.mainSet as any).durationMinutes} min` : '')} @ {('mainSet' in template ? (template.mainSet as any).intensity : '')}
                      </div>
                    ) : ('mainSet' in template) && template.mainSet ? (
                      <div className="border-2 border-border-heavy bg-card p-3 rounded-lg text-foreground font-mono font-bold text-xs shadow-[inset_1px_1px_0px_rgba(0,0,0,0.05)]">
                        {'distanceMeters' in (template.mainSet as any) ? `${(template.mainSet as any).distanceMeters}m` : `${(template.mainSet as any).durationMinutes} min`} @ {(template.mainSet as any).intensity}
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-xs italic">Complex structured workout.</div>
                    )}
                  </div>
                </div>
              </CardContent>
              <div className="p-6 pt-0 mt-auto">
                <Button variant="outline" className="w-full bg-white font-bold" onClick={() => setSelectedTemplateId(template.id)}>
                  SELECT TEMPLATE
                </Button>
              </div>
            </Card>
          ))}
          {filteredTemplates.length === 0 && (
            <div className="col-span-full py-12 text-center text-zinc-500">
              No matching templates found. Try adjusting filters.
            </div>
          )}
        </div>
      )}
    </div>
  );
}


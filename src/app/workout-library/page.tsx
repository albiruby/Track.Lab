'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input, Label, Button, Select } from '@/components/ui/Forms';
import { workoutTemplates, raceDistances, workoutSafetyRules } from '@/data';
import { parseTimeStringToSeconds, formatSecondsToTimeString, formatPace } from '@/lib/formatters/time';
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
      const rSec = mSet.rest?.durationSeconds || (mSet.rest?.durationMinutes ? mSet.rest.durationMinutes * 60 : 0);
      restTime = Math.max(0, reps - 1) * rSec;
    } else if (mSet.type === 'time_reps') {
      const reps = mSet.reps || 1;
      const dur = mSet.durationMinutes ? mSet.durationMinutes * 60 : (mSet.durationSeconds || 0);
      workTime = reps * dur;
      workDist = (workTime / paceSec) * 1000;
      targetRepTime = dur;
      const rSec = mSet.rest?.durationSeconds || (mSet.rest?.durationMinutes ? mSet.rest.durationMinutes * 60 : 0);
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
  if (selectedTemplate && paceInput) {
    const pSec = parseTimeStringToSeconds(paceInput);
    if (pSec > 0) {
      calcResult = calculateWorkout(
        selectedTemplate, 
        pSec, 
        parseFloat(warmupInput) || 0, 
        parseFloat(cooldownInput) || 0
      );
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Workout Library</h1>
        <p className="text-zinc-600 dark:text-zinc-400">View and calculate static structured interval templates.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
        <div className="space-y-2">
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
                <CardTitle>{selectedTemplate.name}</CardTitle>
                <CardDescription className="capitalize">
                  {('scenario' in selectedTemplate ? selectedTemplate.scenario.replace('_', ' ') : '')} • {('difficulty' in selectedTemplate ? selectedTemplate.difficulty.replace('_', ' ') : '')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg text-sm font-mono space-y-2">
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider text-xs">Structure</div>
                  {('warmup' in selectedTemplate) && selectedTemplate.warmup && <div>Warmup included.</div>}
                  {('mainSet' in selectedTemplate) && selectedTemplate.mainSet && (
                    <div>Main: {('reps' in selectedTemplate.mainSet) ? `${selectedTemplate.mainSet.reps}x ` : ''} {('distanceMeters' in selectedTemplate.mainSet) ? `${selectedTemplate.mainSet.distanceMeters}m` : (('durationMinutes' in selectedTemplate.mainSet) ? `${selectedTemplate.mainSet.durationMinutes}m` : '')} @ {('intensity' in selectedTemplate.mainSet) ? (selectedTemplate.mainSet as any).intensity : ''}</div>
                  )}
                  {('cooldown' in selectedTemplate) && selectedTemplate.cooldown && <div>Cooldown included.</div>}
                </div>
                
                <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
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
                </div>
              </CardContent>
            </Card>

            {calcResult && (
              <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-900/10">
                <CardHeader>
                  <CardTitle className="text-green-900 dark:text-green-100">Workout Projection</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Total Time</div>
                      <div className="font-mono text-xl text-zinc-900 dark:text-zinc-100">{formatSecondsToTimeString(calcResult.totalTime)}</div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Rep Time</div>
                      <div className="font-mono text-xl text-zinc-900 dark:text-zinc-100">{calcResult.targetRepTime > 0 ? formatSecondsToTimeString(Math.round(calcResult.targetRepTime)) : '--:--'}</div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Work Distance</div>
                      <div className="font-mono text-xl text-zinc-900 dark:text-zinc-100">{calcResult.workDist > 0 ? `${(calcResult.workDist/1000).toFixed(2)} km` : '--'}</div>
                    </div>
                    <div className="bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                      <div className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mb-1">Work:Rest Time</div>
                      <div className="font-mono text-sm text-zinc-900 dark:text-zinc-100">
                        {formatSecondsToTimeString(Math.round(calcResult.workTime))} / {formatSecondsToTimeString(Math.round(calcResult.restTime))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-zinc-500 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
                    <p><strong>Note:</strong> Mathematical projection only. Does not factor in fatigue profiles, weather, or terrain.</p>
                    
                    {('safetyRuleIds' in selectedTemplate) && (selectedTemplate.safetyRuleIds as unknown as string[])?.length > 0 && (
                      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 p-3 rounded-lg flex gap-3">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <div className="space-y-1 w-full">
                          <p className="font-semibold uppercase tracking-wider text-[10px] mb-1 opacity-80">Safety & Planning Flags</p>
                          {(selectedTemplate.safetyRuleIds as unknown as string[]).map(ruleId => {
                            const rule = workoutSafetyRules.find(r => r.id === ruleId);
                            return rule ? (
                              <div key={ruleId} className="flex flex-col">
                                <strong className="text-xs font-semibold">{rule.name}</strong>
                                <span className="text-xs opacity-90">{rule.message}</span>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button variant="secondary" className="w-full" onClick={() => {
                    navigator.clipboard.writeText(`Workout: ${selectedTemplate.name}\nTotal Time: ${formatSecondsToTimeString(calcResult.totalTime)}\nTarget Rep Time: ${formatSecondsToTimeString(Math.round(calcResult.targetRepTime))}`);
                    alert('Copied to clipboard');
                  }}>Copy Summary</Button>
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
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="text-zinc-500 font-medium pb-1 block">Main Set Summary:</span>
                    {('reps' in (('mainSet' in template ? template.mainSet : {}) || {})) ? (
                      <div className="bg-zinc-100 dark:bg-zinc-800/50 p-2 rounded text-zinc-900 dark:text-zinc-100 font-mono text-xs">
                        {('mainSet' in template ? (template.mainSet as any).reps : '')} × {('mainSet' in template && 'distanceMeters' in (template.mainSet as any)) ? `${(template.mainSet as any).distanceMeters}m` : ('mainSet' in template ? `${(template.mainSet as any).durationMinutes} min` : '')} @ {('mainSet' in template ? (template.mainSet as any).intensity : '')}
                      </div>
                    ) : ('mainSet' in template) && template.mainSet ? (
                      <div className="bg-zinc-100 dark:bg-zinc-800/50 p-2 rounded text-zinc-900 dark:text-zinc-100 font-mono text-xs">
                        {'distanceMeters' in (template.mainSet as any) ? `${(template.mainSet as any).distanceMeters}m` : `${(template.mainSet as any).durationMinutes} min`} @ {(template.mainSet as any).intensity}
                      </div>
                    ) : (
                      <div className="text-zinc-500 text-xs italic">Complex structured workout.</div>
                    )}
                  </div>
                </div>
              </CardContent>
              <div className="p-6 pt-0 mt-auto">
                <Button variant="secondary" className="w-full" onClick={() => setSelectedTemplateId(template.id)}>
                  Select Template
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


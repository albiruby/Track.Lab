'use client';

import { useState } from 'react';
import { Input, Label, Select } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { CalculatorPageShell } from '@/components/calculator/CalculatorPageShell';
import { ManualInputPanel } from '@/components/calculator/ManualInputPanel';
import { ExportPanel, ResultActionRow } from '@/components/calculator/CalculatorSystem';
import { resultToText } from '@/lib/export/manualExport';
import { CalculatorResult } from '@/types';
import { calculateTrackInterval, calculateLadder } from '@/lib/calculators_pack/track';
import { parseDurationToSeconds, formatSecondsToTimeString, safeNumber, formatPace } from '@/lib/formatters/time';
import Link from 'next/link';

export default function TrackLabPage() {
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick');
  
  const [calcType, setCalcType] = useState('interval'); // split, interval, ladder
  
  const [reps, setReps] = useState('6');
  const [repDist, setRepDist] = useState('400');
  const [pace, setPace] = useState('4:00');
  const [rest, setRest] = useState('1:30');
  const [ladderDistances, setLadderDistances] = useState('200, 400, 600, 800, 600, 400, 200');
  
  const [result, setResult] = useState<CalculatorResult<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setReps('6'); setRepDist('400'); setPace('4:00'); setRest('1:30');
    setLadderDistances('200, 400, 600, 800, 600, 400, 200');
    setResult(null); setError(null);
  };
  
  const handleTabChange = (t: string) => { setCalcType(t); setResult(null); setError(null); };

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const pSecs = parseDurationToSeconds(pace);
    if (pSecs === null || pSecs <= 0) return setError('Invalid pace.');

    let res: CalculatorResult<any> | null = null;
    
    if (calcType === 'split') {
       const standardDists = [100, 200, 300, 400, 600, 800, 1000, 1200, 1500, 1600, 3000];
       const splits = standardDists.map(d => ({
         dist: d,
         time: (d / 1000) * pSecs
       }));
       
       res = {
         result: (
           <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
             <table className="w-full text-left text-sm border-collapse">
               <thead>
                 <tr className="border-b-2 border-border-heavy">
                   <th className="py-2 px-1 text-xs uppercase tracking-wider text-muted-foreground">Distance</th>
                   <th className="py-2 px-1 text-xs uppercase tracking-wider text-muted-foreground text-right">Time</th>
                 </tr>
               </thead>
               <tbody>
                 {splits.map((s, i) => (
                   <tr key={i} className="border-b border-border hover:bg-muted/50 transition-colors">
                     <td className="py-2 px-1 font-bold">{s.dist} m</td>
                     <td className="py-2 px-1 font-mono font-bold text-right text-primary">
                       {formatSecondsToTimeString(s.time)}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
             <div className="mt-4 flex gap-2">
               <ResultActionRow 
                actions={[
                  { label: "Use in Workout Lab", href: "/workout" }
                ]} 
              />
             </div>
           </div>
         ),
         methodSelected: 'Track Pace Table',
         confidenceLabel: 'Exact',
         formulaUsed: 'Time = (Distance / 1000) × Pace',
         inputUsed: { pace },
         limitations: 'Mathematical exact outputs. Ignores acceleration curve of actual track running.'
       };
    } else if (calcType === 'interval') {
       const r = safeNumber(reps);
       const d = safeNumber(repDist);
       const restSecs = parseDurationToSeconds(rest) || 0;
       
       if (!r || !d) return setError('Invalid rep/distance inputs.');
       
       const intRes = calculateTrackInterval(r, d, pSecs, restSecs);
       if (!intRes) return setError('Calculation failed.');
       
       res = {
         result: (
           <div className="flex flex-col gap-3">
             <div className="flex justify-between p-3 border-2 border-border-heavy bg-primary rounded-lg text-primary-foreground shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                <span className="font-bold text-xs uppercase tracking-wider text-primary-foreground/80 mt-1">Rep Time</span>
                <span className="font-mono font-bold text-2xl">{formatSecondsToTimeString(intRes.repTimeSecs)}</span>
             </div>
             
             <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col p-3 border-2 border-border-heavy bg-card rounded-lg">
                   <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Total Work</span>
                   <span className="font-mono font-bold">{intRes.totalWorkMeters} m</span>
                   <span className="font-mono text-xs text-muted-foreground">{formatSecondsToTimeString(intRes.totalWorkSecs)}</span>
                </div>
                <div className="flex flex-col p-3 border-2 border-border-heavy bg-card rounded-lg">
                   <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Total Rest</span>
                   <span className="font-mono font-bold">{formatSecondsToTimeString(intRes.totalRestSecs)}</span>
                   <span className="font-mono text-xs text-muted-foreground">{intRes.workRestRatio > 0 ? `1:${(1/intRes.workRestRatio).toFixed(1)} ratio` : 'no rest'}</span>
                </div>
             </div>
             
             <div className="flex justify-between p-3 border-2 border-border-heavy bg-card rounded-lg">
                <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground mt-0.5">Session Total</span>
                <span className="font-mono font-bold">{formatSecondsToTimeString(intRes.totalSessionSecs)}</span>
             </div>
           </div>
         ),
         methodSelected: 'Interval Builder',
         confidenceLabel: 'Exact',
         formulaUsed: 'Rep Time = Distance × Pace',
         inputUsed: { reps: r.toString(), distance: d + 'm', pace, rest },
         limitations: 'Ignores acceleration/deceleration.'
       };
    } else if (calcType === 'ladder') {
       const distArr = ladderDistances.split(',').map(s => safeNumber(s.trim())).filter(n => n !== null && n > 0) as number[];
       const restSecs = parseDurationToSeconds(rest) || 0;
       
       if (!distArr.length) return setError('Invalid ladder distances.');
       
       const ladRes = calculateLadder(distArr, pSecs, restSecs);
       if (!ladRes) return setError('Calculation failed.');
       
       res = {
         result: (
           <div className="flex flex-col gap-4">
             <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col p-2 border-2 border-border-heavy bg-card rounded-lg text-center gap-1">
                   <span className="font-bold text-[9px] uppercase tracking-wider text-muted-foreground">Work Dist</span>
                   <span className="font-mono text-sm font-bold">{ladRes.totalWorkMeters}m</span>
                </div>
                <div className="flex flex-col p-2 border-2 border-border-heavy bg-card rounded-lg text-center gap-1">
                   <span className="font-bold text-[9px] uppercase tracking-wider text-muted-foreground">Work Time</span>
                   <span className="font-mono text-sm font-bold">{formatSecondsToTimeString(ladRes.totalWorkSecs)}</span>
                </div>
                <div className="flex flex-col p-2 border-2 border-border-heavy bg-primary text-primary-foreground rounded-lg text-center gap-1">
                   <span className="font-bold text-[9px] uppercase tracking-wider text-primary-foreground/80">Total Time</span>
                   <span className="font-mono text-sm font-bold">{formatSecondsToTimeString(ladRes.totalSessionSecs)}</span>
                </div>
             </div>
             
             <div className="max-h-[300px] overflow-y-auto mt-2">
                <table className="w-full text-left text-sm border-collapse">
                   <thead>
                     <tr className="border-b-2 border-border-heavy">
                       <th className="py-2 px-1 text-[10px] uppercase tracking-wider text-muted-foreground">Rep</th>
                       <th className="py-2 px-1 text-[10px] uppercase tracking-wider text-muted-foreground text-right">Time</th>
                     </tr>
                   </thead>
                   <tbody>
                     {ladRes.reps.map((r, i) => (
                       <tr key={i} className="border-b border-border hover:bg-muted/50 transition-colors">
                         <td className="py-2 px-1 font-bold text-xs">{r.distanceMeters} m</td>
                         <td className="py-2 px-1 font-mono font-bold text-right text-xs text-primary">
                           {formatSecondsToTimeString(r.timeSecs)}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                </table>
             </div>
           </div>
         ),
         methodSelected: 'Ladder/Pyramid Calculator',
         confidenceLabel: 'Exact',
         formulaUsed: 'Rep Time = Distance × Pace',
         inputUsed: { distances: ladderDistances, pace, rest },
         limitations: 'Ignores acceleration/deceleration.'
       };
    }
    
    if (res) setResult(res);
  };

  return (
    <CalculatorPageShell title="Track Lab" subtitle="Calculate track lap splits, intervals, ladders, and pyramids.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <ManualInputPanel mode={mode} setMode={setMode} supportsAdvanced={true} onCalculate={handleCalculate} onReset={handleReset} error={error}>
          <div className="mb-4">
             <Label htmlFor="calcType">Calculator Type</Label>
             <Select id="calcType" value={calcType} onChange={e => handleTabChange(e.target.value)}>
                <option value="split">Track Pace Table</option>
                <option value="interval">Interval Set Builder</option>
                <option value="ladder">Ladder/Pyramid Calculator</option>
             </Select>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={calcType === 'ladder' ? 'sm:col-span-2' : ''}>
              <Label htmlFor="pace">Target Pace ( /km)</Label>
              <Input id="pace" type="text" placeholder="4:00" value={pace} onChange={e => setPace(e.target.value)} required />
            </div>
            
            {calcType === 'interval' && (
              <>
                <div><Label htmlFor="reps">Number of Reps</Label><Input id="reps" type="number" value={reps} onChange={e => setReps(e.target.value)} required /></div>
                <div><Label htmlFor="repDist">Rep Distance (m)</Label><Input id="repDist" type="number" value={repDist} onChange={e => setRepDist(e.target.value)} required /></div>
              </>
            )}
            
            {calcType === 'ladder' && (
              <div className="sm:col-span-2">
                <Label htmlFor="ladderDistances">Distances (m, comma separated)</Label>
                <Input id="ladderDistances" type="text" placeholder="200, 400, 600, 800, 600..." value={ladderDistances} onChange={e => setLadderDistances(e.target.value)} required />
              </div>
            )}
            
            {(calcType === 'interval' || calcType === 'ladder') && (
              <div>
                <Label htmlFor="rest">Rest Interval (MM:SS)</Label>
                <Input id="rest" type="text" placeholder="1:30" value={rest} onChange={e => setRest(e.target.value)} />
              </div>
            )}
          </div>
        </ManualInputPanel>

        <div className="h-full flex flex-col gap-6">
          {result ? (
            <>
              <ResultCard result={result} />
              <ExportPanel textToCopy={resultToText(result, "Track Lab Result")} />
            </>
          ) : (
            <div className="p-6 border-2 border-dashed border-border-heavy bg-card rounded-xl text-center flex flex-col items-center justify-center h-full min-h-[200px]">
              <span className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Awaiting Input</span>
              <span className="text-[10px] font-bold text-muted-foreground mt-2">Visualization appears after calculation.</span>
            </div>
          )}
        </div>
      </div>
    </CalculatorPageShell>
  );
}

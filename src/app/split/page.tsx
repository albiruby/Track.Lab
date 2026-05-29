'use client';

import { useState } from 'react';
import { Input, Label, Select } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { CalculatorPageShell } from '@/components/calculator/CalculatorPageShell';
import { ManualInputPanel } from '@/components/calculator/ManualInputPanel';
import { ExportPanel } from '@/components/calculator/CalculatorSystem';
import { resultToText } from '@/lib/export/manualExport';
import { CalculatorResult } from '@/types';
import { calculateSplits, generateNegativeSplits, generateProgressiveSplits, compareSplits } from '@/lib/calculators_pack/split';
import { parseDurationToSeconds, formatSecondsToTimeString, safeNumber, formatPace } from '@/lib/formatters/time';
import Link from 'next/link';

export default function SplitLabPage() {
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick');
  
  const [calcType, setCalcType] = useState('even'); // even, negative, progressive, compare, band
  
  const [distance, setDistance] = useState('5');
  const [timeStr, setTimeStr] = useState('25:00');
  const [segmentDist, setSegmentDist] = useState('1');
  const [splitRatio, setSplitRatio] = useState('51'); // e.g. 51 for 51/49
  const [startSlower, setStartSlower] = useState('5'); // % slower
  const [finishFaster, setFinishFaster] = useState('5'); // % faster
  const [targetPaceStr, setTargetPaceStr] = useState('5:00');
  const [actualSplits, setActualSplits] = useState('5:10, 5:05, 5:00, 4:55, 4:50');
  
  const [result, setResult] = useState<CalculatorResult<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setDistance('5'); setTimeStr('25:00'); setSegmentDist('1');
    setSplitRatio('51'); setStartSlower('5'); setFinishFaster('5');
    setTargetPaceStr('5:00'); setActualSplits('5:10, 5:05, 5:00, 4:55, 4:50');
    setResult(null); setError(null);
  };
  
  const handleTabChange = (t: string) => { setCalcType(t); setResult(null); setError(null); };

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    let res: CalculatorResult<any> | null = null;

    if (calcType === 'even' || calcType === 'band') {
       const d = safeNumber(distance);
       const secs = parseDurationToSeconds(timeStr);
       const seg = safeNumber(segmentDist);
       if (!d || !secs || !seg) return setError('Invalid inputs.');
       
       const paceSecs = secs / d;
       const splits = calculateSplits(d, paceSecs, seg);
       if (!splits.length) return setError('Could not calculate splits.');
       
       res = {
         result: (
           <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
             <table className="w-full text-left text-sm border-collapse">
               <thead>
                 <tr className="border-b-2 border-border-heavy">
                   <th className="py-2 px-1 text-xs uppercase tracking-wider text-muted-foreground w-1/3">Segment</th>
                   <th className="py-2 px-1 text-xs uppercase tracking-wider text-muted-foreground w-1/3">Split time</th>
                   <th className="py-2 px-1 text-xs uppercase tracking-wider text-muted-foreground text-right w-1/3">Cumulative</th>
                 </tr>
               </thead>
               <tbody>
                 {splits.map((s, i) => (
                   <tr key={i} className="border-b border-border hover:bg-muted/50 transition-colors">
                     <td className="py-2 px-1 font-bold">{i + 1} ({s.distance.toFixed(2)} km)</td>
                     <td className="py-2 px-1 font-mono">{formatSecondsToTimeString(s.time)}</td>
                     <td className="py-2 px-1 font-mono font-bold text-right text-primary">{formatSecondsToTimeString(s.time * (i+1))}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
             <div className="mt-4 flex gap-2">
               <Link href="/pace" className="text-xs text-primary font-bold hover:underline">→ Calculate base pace</Link>
             </div>
           </div>
         ),
         methodSelected: calcType === 'band' ? 'Race Pace Band' : 'Even Split',
         confidenceLabel: 'Exact',
         formulaUsed: 'Time = Distance × Pace',
         inputUsed: { distance: d + ' km', time: timeStr, segment: seg + ' km' },
         limitations: 'Assumes perfectly even pacing without terrain or fatigue adjustments.'
       };
    } else if (calcType === 'negative') {
       const d = safeNumber(distance);
       const secs = parseDurationToSeconds(timeStr);
       const ratio = safeNumber(splitRatio);
       if (!d || !secs || !ratio) return setError('Invalid inputs.');
       
       const ns = generateNegativeSplits(d, secs, ratio);
       if (!ns) return setError('Calculation failed.');
       
       res = {
         result: (
           <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 border-2 border-border-heavy rounded-xl flex flex-col items-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">First Half Pace</span>
                    <span className="font-mono text-2xl font-bold">{formatPace(ns.firstHalfPace)}</span>
                    <span className="text-xs text-muted-foreground mt-1">{formatSecondsToTimeString(ns.firstHalfTime)}</span>
                 </div>
                 <div className="p-4 border-2 border-border-heavy rounded-xl flex flex-col items-center bg-primary text-primary-foreground">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/80">Second Half Pace</span>
                    <span className="font-mono text-2xl font-bold">{formatPace(ns.secondHalfPace)}</span>
                    <span className="text-xs mt-1 text-primary-foreground/80">{formatSecondsToTimeString(ns.secondHalfTime)}</span>
                 </div>
              </div>
              <p className="text-xs text-muted-foreground text-center font-bold">Scenario calculation, not training advice.</p>
           </div>
         ),
         methodSelected: 'Negative Split',
         confidenceLabel: 'Scenario',
         formulaUsed: `First Half = Target * (${ratio}/100)`,
         inputUsed: { distance: d + ' km', time: timeStr, ratio: splitRatio + '/' + (100-ratio) },
         limitations: 'Simple mathematical split, real racing involves fluid pacing'
       };
    } else if (calcType === 'progressive') {
       const d = safeNumber(distance);
       const secs = parseDurationToSeconds(timeStr);
       const ss = safeNumber(startSlower);
       const ff = safeNumber(finishFaster);
       const seg = safeNumber(segmentDist);
       if (!d || !secs || ss === null || ff === null || !seg) return setError('Invalid inputs.');
       
       const ps = generateProgressiveSplits(d, secs, ss, ff, seg);
       if (!ps.length) return setError('Calculation failed.');
       
       res = {
         result: (
           <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto">
             <table className="w-full text-left text-sm border-collapse">
               <thead>
                 <tr className="border-b-2 border-border-heavy">
                   <th className="py-2 px-1 text-xs uppercase tracking-wider text-muted-foreground w-1/4">Segment</th>
                   <th className="py-2 px-1 text-xs uppercase tracking-wider text-muted-foreground w-1/4">Pace</th>
                   <th className="py-2 px-1 text-xs uppercase tracking-wider text-muted-foreground w-1/4">Split</th>
                   <th className="py-2 px-1 text-xs uppercase tracking-wider text-muted-foreground text-right w-1/4">Sum</th>
                 </tr>
               </thead>
               <tbody>
                 {ps.map((s, i) => (
                   <tr key={i} className="border-b border-border hover:bg-muted/50 transition-colors">
                     <td className="py-2 px-1 font-bold">{s.distance.toFixed(1)}</td>
                     <td className="py-2 px-1 font-mono text-xs">{formatPace(s.pace)}</td>
                     <td className="py-2 px-1 font-mono text-xs">{formatSecondsToTimeString(s.time)}</td>
                     <td className="py-2 px-1 font-mono font-bold text-right text-primary text-xs flex justify-end">
                       {formatSecondsToTimeString(ps.slice(0, i+1).reduce((acc, curr) => acc + curr.time, 0))}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         ),
         methodSelected: 'Progressive Split',
         confidenceLabel: 'Scenario',
         formulaUsed: 'Linear segment pace interpolation',
         inputUsed: { distance: d + ' km', time: timeStr, start: ss + '% slower', finish: ff + '% faster' },
         limitations: 'Calculates mathematically exact segments, pacing naturally varies.'
       };
    } else if (calcType === 'compare') {
       const tp = parseDurationToSeconds(targetPaceStr);
       const seg = safeNumber(segmentDist);
       if (!tp || !seg) return setError('Invalid target inputs.');
       
       const actualSecs = actualSplits.split(',').map(s => parseDurationToSeconds(s.trim())).filter(s => s !== null && s > 0) as number[];
       if (!actualSecs.length) return setError('Invalid actual splits.');
       
       const cmp = compareSplits(tp, actualSecs, seg);
       if (!cmp) return setError('Calculation failed.');
       
       res = {
         result: (
           <div className="flex flex-col gap-4">
             <div className={`p-6 border-2 border-border-heavy rounded-xl flex flex-col items-center ${cmp.isPositiveSplit ? 'bg-destructive/10' : 'bg-primary'}`}>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${cmp.isPositiveSplit ? 'text-destructive' : 'text-primary-foreground/80'} mb-1`}>
                  Total Delta
                </span>
                <span className={`font-display text-5xl font-black ${cmp.isPositiveSplit ? 'text-destructive' : 'text-primary-foreground'}`}>
                  {cmp.isPositiveSplit ? '+' : ''}{formatSecondsToTimeString(cmp.totalDelta)}
                </span>
             </div>
             
             <table className="w-full text-left text-sm border-collapse mt-2">
               <thead>
                 <tr className="border-b-2 border-border-heavy">
                   <th className="py-2 px-1 text-xs uppercase tracking-wider text-muted-foreground w-1/3">Segment</th>
                   <th className="py-2 px-1 text-xs uppercase tracking-wider text-muted-foreground w-1/3">Actual</th>
                   <th className="py-2 px-1 text-xs uppercase tracking-wider text-muted-foreground text-right w-1/3">Delta</th>
                 </tr>
               </thead>
               <tbody>
                 {actualSecs.map((s, i) => (
                   <tr key={i} className="border-b border-border hover:bg-muted/50 transition-colors">
                     <td className="py-2 px-1 font-bold">{i + 1}</td>
                     <td className="py-2 px-1 font-mono text-xs">{formatSecondsToTimeString(s)}</td>
                     <td className={`py-2 px-1 font-mono font-bold text-right text-xs ${cmp.deltas[i] > 0 ? 'text-destructive' : 'text-primary'}`}>
                       {cmp.deltas[i] > 0 ? '+' : ''}{formatSecondsToTimeString(cmp.deltas[i])}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         ),
         methodSelected: 'Split Comparison',
         confidenceLabel: 'Exact',
         formulaUsed: 'Delta = Actual - Target',
         inputUsed: { TargetPace: targetPaceStr, Segment: segmentDist + ' km' },
         limitations: 'Calculates mathematically exact segments, pacing naturally varies.'
       };
    }
    
    if (res) setResult(res);
  };

  return (
    <CalculatorPageShell title="Split Lab" subtitle="Build race intervals, pace bands, and analyze split strategies.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <ManualInputPanel mode={mode} setMode={setMode} supportsAdvanced={true} onCalculate={handleCalculate} onReset={handleReset} error={error}>
          <div className="mb-4">
             <Label htmlFor="calcType">Strategy Type</Label>
             <Select id="calcType" value={calcType} onChange={e => handleTabChange(e.target.value)}>
                <option value="even">Even Split Generator</option>
                <option value="band">Race Pace Band</option>
                <option value="negative">Negative Split Table</option>
                <option value="progressive">Progressive Split Table</option>
                <option value="compare">Target vs Actual Splitting</option>
             </Select>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {(calcType !== 'compare') && (
               <>
                 <div><Label htmlFor="distance">Race Distance (km)</Label><Input id="distance" type="number" step="0.1" value={distance} onChange={e => setDistance(e.target.value)} required /></div>
                 <div><Label htmlFor="timeStr">Target Time (MM:SS)</Label><Input id="timeStr" type="text" placeholder="25:00" value={timeStr} onChange={e => setTimeStr(e.target.value)} required /></div>
               </>
             )}
             
             {(calcType === 'even' || calcType === 'band' || calcType === 'progressive' || calcType === 'compare') && (
               <div><Label htmlFor="segmentDist">Segment km</Label><Input id="segmentDist" type="number" step="1" value={segmentDist} onChange={e => setSegmentDist(e.target.value)} required /></div>
             )}
             
             {calcType === 'negative' && (
               <div><Label htmlFor="splitRatio">First Half %</Label><Input id="splitRatio" type="number" step="0.1" max="99" min="1" value={splitRatio} onChange={e => setSplitRatio(e.target.value)} required /></div>
             )}
             
             {calcType === 'progressive' && (
               <>
                 <div><Label htmlFor="startSlower">Start % Slower</Label><Input id="startSlower" type="number" step="1" value={startSlower} onChange={e => setStartSlower(e.target.value)} required /></div>
                 <div><Label htmlFor="finishFaster">Finish % Faster</Label><Input id="finishFaster" type="number" step="1" value={finishFaster} onChange={e => setFinishFaster(e.target.value)} required /></div>
               </>
             )}
             
             {calcType === 'compare' && (
               <>
                 <div><Label htmlFor="targetPaceStr">Target Pace</Label><Input id="targetPaceStr" type="text" placeholder="5:00" value={targetPaceStr} onChange={e => setTargetPaceStr(e.target.value)} required /></div>
                 <div className="sm:col-span-2"><Label htmlFor="actualSplits">Actual Segment Times (comma separated)</Label><Input id="actualSplits" type="text" placeholder="5:00, 4:55, 5:10" value={actualSplits} onChange={e => setActualSplits(e.target.value)} required /></div>
               </>
             )}
          </div>
        </ManualInputPanel>

        <div className="h-full flex flex-col gap-6">
          {result ? (
            <>
              <ResultCard result={result} />
              <ExportPanel textToCopy={resultToText(result, "Split Lab Result")} />
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

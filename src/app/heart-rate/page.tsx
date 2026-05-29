'use client';

import { useState } from 'react';
import { Input, Label, Select } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { safeNumber, parseDurationToSeconds, formatSecondsToTimeString, formatPace } from '@/lib/formatters/time';
import { CalculatorPageShell } from '@/components/calculator/CalculatorPageShell';
import { ManualInputPanel } from '@/components/calculator/ManualInputPanel';
import { ExportPanel } from '@/components/calculator/CalculatorSystem';
import { resultToText } from '@/lib/export/manualExport';
import { CalculatorResult } from '@/types';
import Link from 'next/link';

export default function HeartRateLabPage() {
  const [calcType, setCalcType] = useState('max'); // max, zones, drift, recovery

  // HRmax states
  const [age, setAge] = useState('30');
  const [measuredMax, setMeasuredMax] = useState('');
  
  // Zones states (quick/advanced)
  const [modeZones, setModeZones] = useState<'quick' | 'advanced'>('quick');
  const [hrMaxTarget, setHrMaxTarget] = useState('190');
  const [hrRest, setHrRest] = useState('60');
  const [lthr, setLthr] = useState('');
  
  // Drift states
  const [hr1, setHr1] = useState('140');
  const [hr2, setHr2] = useState('145');
  const [pace1, setPace1] = useState('');
  const [pace2, setPace2] = useState('');
  
  // Recovery
  const [peakHr, setPeakHr] = useState('180');
  const [rec1Hr, setRec1Hr] = useState('150');
  const [rec2Hr, setRec2Hr] = useState('');

  const [result, setResult] = useState<CalculatorResult<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setAge('30'); setMeasuredMax('');
    setHrMaxTarget('190'); setHrRest('60'); setLthr('');
    setHr1('140'); setHr2('145'); setPace1(''); setPace2('');
    setPeakHr('180'); setRec1Hr('150'); setRec2Hr('');
    setResult(null); setError(null);
  };
  
  const handleTabChange = (t: string) => { setCalcType(t); setResult(null); setError(null); };

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    let res: CalculatorResult<any> | null = null;
    
    if (calcType === 'max') {
        const a = safeNumber(age);
        if (!a || a <= 0) return setError('Invalid age.');
        
        const fox = 220 - a;
        const tanaka = Math.round(208 - 0.7 * a);
        const gellish = Math.round(206.9 - 0.67 * a);
        const gulati = Math.round(206 - 0.88 * a);
        const nes = Math.round(211 - 0.64 * a);
        
        let methods = [
            { name: 'HUNT/Nes', val: nes, desc: 'Robust modern estimate' },
            { name: 'Tanaka', val: tanaka, desc: 'Widely accepted modern formula' },
            { name: 'Gellish', val: gellish, desc: 'Broad population estimate' },
            { name: 'Gulati', val: gulati, desc: 'Often referenced for women' },
            { name: 'Fox', val: fox, desc: 'Legacy formula (220-age)' }
        ];
        
        const hasMeasured = safeNumber(measuredMax);
        
        res = {
            result: (
               <div className="flex flex-col gap-3">
                 {hasMeasured ? (
                   <div className="flex justify-between items-center p-3 border-2 border-border-heavy bg-primary text-primary-foreground rounded-lg shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                       <div className="flex flex-col">
                           <span className="font-bold text-xs uppercase tracking-wider text-primary-foreground/80">User Measured</span>
                           <span className="text-[10px] opacity-80">True max if measured correctly</span>
                       </div>
                       <span className="font-mono font-bold text-2xl">{hasMeasured} <span className="text-sm">bpm</span></span>
                   </div>
                 ) : null}
                 <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold mt-2">Age-Based Estimates</p>
                 <div className="flex flex-col border-2 border-border-heavy rounded-lg overflow-hidden bg-card shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                   {methods.map((m, i) => (
                     <div key={i} className="flex justify-between items-center p-2 border-b-2 border-border-heavy last:border-0 hover:bg-muted/50 transition-colors">
                         <div className="flex flex-col">
                             <span className="font-bold text-sm">{m.name}</span>
                         </div>
                         <span className="font-mono font-bold text-foreground">{m.val} bpm</span>
                     </div>
                   ))}
                 </div>
                 
                 <div className="mt-4 flex gap-2">
                    <Link href="/zone" className="text-[10px] text-primary font-bold hover:underline">→ Build zone table (Zone Lab)</Link>
                 </div>
               </div>
            ),
            methodSelected: 'HRmax Comparison',
            confidenceLabel: hasMeasured ? 'Measured (Best)' : 'Estimate',
            formulaUsed: 'Multiple demographic formulas',
            inputUsed: { Age: age.toString(), Measured: measuredMax || 'None' },
            limitations: 'Measured > test > estimate. Population averages lose individual accuracy.'
        };
    } else if (calcType === 'zones') {
        const max = safeNumber(hrMaxTarget) || 0;
        const rest = safeNumber(hrRest) || 0;
        const lthrVal = safeNumber(lthr) || 0;
        const a = safeNumber(age) || 30;
        
        if (!max && !lthrVal && !rest) return setError('Please provide HR limits to calculate zones.');
        if (max > 0 && rest > 0 && max <= rest) return setError('Max HR must be greater than Rest HR.');
        
        const hrr = (max > 0 && rest > 0) ? (max - rest) : null;
        const maf = 180 - a;
        
        res = {
            result: (
               <div className="flex flex-col gap-4">
                 {(max > 0) && (
                    <div className="flex flex-col md:flex-row gap-2 border-2 border-border-heavy p-3 rounded-lg bg-card shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                       <div className="flex flex-col flex-1">
                          <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Standard 5-Zone (%HRmax)</span>
                          <span className="text-xs bg-muted px-1.5 py-0.5 rounded mt-1 mb-1 font-mono">{Math.round(max * 0.5)}-{Math.round(max * 0.6)} • {Math.round(max * 0.6)}-{Math.round(max * 0.7)} • {Math.round(max * 0.7)}-{Math.round(max * 0.8)} • {Math.round(max * 0.8)}-{Math.round(max * 0.9)} • {Math.round(max * 0.9)}+</span>
                       </div>
                    </div>
                 )}
                 {(max > 0 && rest > 0 && hrr) && (
                    <div className="flex flex-col md:flex-row gap-2 border-2 border-border-heavy p-3 rounded-lg bg-card shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                       <div className="flex flex-col flex-1">
                          <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Heart Rate Reserve (HRR)</span>
                          <span className="font-mono text-sm mt-1">{hrr} bpm delta</span>
                          <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded mt-1 mb-1 font-mono">
                            Z1: {Math.round(rest + hrr*0.5)}-{Math.round(rest + hrr*0.6)} | Z2: {Math.round(rest + hrr*0.6)}-{Math.round(rest + hrr*0.7)}
                          </span>
                       </div>
                    </div>
                 )}
                 {modeZones === 'advanced' && (
                   <>
                     {(lthrVal > 0) && (
                        <div className="flex flex-col md:flex-row gap-2 border-2 border-border-heavy p-3 rounded-lg bg-card shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                           <div className="flex flex-col flex-1">
                              <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">LTHR Zone 2 (Friel)</span>
                              <span className="font-mono text-sm mt-1">{Math.round(lthrVal * 0.85)} - {Math.round(lthrVal * 0.89)} bpm</span>
                           </div>
                        </div>
                     )}
                     <div className="flex flex-col md:flex-row gap-2 border-2 border-border-heavy p-3 rounded-lg bg-card shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                        <div className="flex flex-col flex-1">
                           <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">MAF 180 Aerobic Ceiling</span>
                           <span className="font-mono text-sm mt-1">~{maf} bpm (Age {a})</span>
                        </div>
                     </div>
                   </>
                 )}
                 <div className="mt-2 flex gap-2">
                    <Link href="/zone" className="text-[10px] text-primary font-bold hover:underline">→ Build zone table (Zone Lab)</Link>
                 </div>
               </div>
            ),
            methodSelected: 'Quick HR Scans',
            confidenceLabel: 'Estimate',
            formulaUsed: 'Standard HR multiplier and Karvonen formulas',
            inputUsed: { HRmax: max.toString(), RHR: rest.toString(), LTHR: lthr, Age: a.toString() },
            limitations: 'Calculates mathematically exact ranges; physiological borders naturally vary.'
        };
    } else if (calcType === 'drift') {
       const h1 = safeNumber(hr1);
       const h2 = safeNumber(hr2);
       if (!h1 || !h2) return setError('Invalid HR inputs.');
       
       const dPct = ((h2 - h1) / h1) * 100;
       
       let decoupling: number | null = null;
       const p1 = parseDurationToSeconds(pace1) || 0;
       const p2 = parseDurationToSeconds(pace2) || 0;
       
       if (p1 > 0 && p2 > 0) {
         const spd1 = 3600 / p1;
         const spd2 = 3600 / p2;
         const ef1 = spd1 / h1;
         const ef2 = spd2 / h2;
         decoupling = ((ef1 - ef2) / ef1) * 100;
       }
       
       res = {
            result: (
               <div className="flex flex-col gap-4">
                 <div className="flex flex-col gap-1 border-2 border-border-heavy p-4 rounded-xl bg-card shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                    <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">HR Drift</span>
                    <div className="flex items-end gap-2">
                       <span className={`font-mono text-3xl font-black ${dPct > 0 ? 'text-destructive' : 'text-primary'}`}>
                          {dPct > 0 ? '+' : ''}{dPct.toFixed(1)}%
                       </span>
                    </div>
                    {dPct > 5 && <span className="text-[10px] font-bold text-destructive">Drift &gt; 5% suggests fatigue or cardiac drift.</span>}
                 </div>
                 
                 {decoupling !== null && (
                    <div className="flex flex-col gap-1 border-2 border-border-heavy p-4 rounded-xl bg-primary text-primary-foreground shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                       <span className="font-bold text-xs uppercase tracking-wider text-primary-foreground/80">Aerobic Decoupling</span>
                       <div className="flex items-end gap-2">
                          <span className="font-mono text-3xl font-black">
                             {decoupling > 0 ? '+' : ''}{decoupling.toFixed(1)}%
                          </span>
                       </div>
                       <span className="text-[10px] font-bold text-primary-foreground/80">Pace-to-HR Efficiency Change</span>
                    </div>
                 )}
                 <div className="mt-2 flex gap-2">
                    <Link href="/rpe" className="text-[10px] text-primary font-bold hover:underline">→ Compare with perceived effort (RPE Lab)</Link>
                 </div>
               </div>
            ),
            methodSelected: 'Cardiac Drift',
            confidenceLabel: 'Estimate',
            formulaUsed: 'Drift = (HR2 - HR1) / HR1',
            inputUsed: { HR1: h1.toString(), HR2: h2.toString() },
            limitations: 'Input-based durability estimate, not diagnosis. Ignores heat/terrain.'
       };
    } else if (calcType === 'recovery') {
       const p = safeNumber(peakHr);
       const r1 = safeNumber(rec1Hr);
       const r2 = safeNumber(rec2Hr);
       if (!p || !r1) return setError('Peak HR and 1-min Recovery are required.');
       
       const rec1 = p - r1;
       const rec2 = r2 ? p - r2 : null;
       
       res = {
            result: (
               <div className="flex flex-col gap-4">
                 <div className="flex flex-col gap-1 border-2 border-border-heavy p-4 rounded-xl bg-card shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                    <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">1-Minute Recovery</span>
                    <div className="flex items-end gap-2">
                       <span className={`font-mono text-3xl font-black text-primary`}>
                          {rec1} <span className="text-sm font-bold opacity-80 uppercase">bpm drop</span>
                       </span>
                    </div>
                    {rec1 < 12 ? (
                       <span className="text-[10px] font-bold text-destructive">Drop &lt; 12 bpm. Monitoring recommended.</span>
                    ) : (
                       <span className="text-[10px] font-bold text-emerald-600">Healthy immediate recovery phase.</span>
                    )}
                 </div>
                 
                 {rec2 !== null && (
                    <div className="flex flex-col gap-1 border-2 border-border-heavy p-4 rounded-xl bg-card shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                       <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">2-Minute Recovery</span>
                       <div className="flex items-end gap-2">
                          <span className={`font-mono text-3xl font-black text-primary`}>
                             {rec2} <span className="text-sm font-bold opacity-80 uppercase">bpm drop</span>
                          </span>
                       </div>
                       {rec2 > 22 && <span className="text-[10px] font-bold text-emerald-600">Excellent clearance phase.</span>}
                    </div>
                 )}
               </div>
            ),
            methodSelected: 'HR Recovery',
            confidenceLabel: 'Measured',
            formulaUsed: 'Recovery = Peak - Recovery BPM',
            inputUsed: { Peak: peakHr, '1-Min': rec1Hr },
            limitations: 'Self-check only. Not medical advice. Not diagnosis.'
       };
    }
    
    if (res) setResult(res);
  };

  return (
    <CalculatorPageShell title="Heart Rate Lab" subtitle="Calculate maximum heart rate, preliminary zones, drift, and recovery patterns.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <ManualInputPanel
          mode={calcType === 'zones' ? modeZones : 'quick'}
          setMode={setModeZones}
          supportsAdvanced={calcType === 'zones'}
          onCalculate={handleCalculate}
          onReset={handleReset}
          error={error}
        >
          <div className="mb-4">
             <Label htmlFor="calcType">Calculator Type</Label>
             <Select id="calcType" value={calcType} onChange={e => handleTabChange(e.target.value)}>
                <option value="max">HRmax / Demographic Estimates</option>
                <option value="zones">Quick HR Zone Scans</option>
                <option value="drift">Cardiac Drift / Aerobic Decoupling</option>
                <option value="recovery">HR Recovery</option>
             </Select>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {calcType === 'max' && (
              <>
                <div className="sm:col-span-2">
                    <Label htmlFor="age">Age</Label>
                    <Input id="age" type="number" min="10" max="110" value={age} onChange={e => setAge(e.target.value)} required />
                </div>
                <div className="sm:col-span-2">
                    <Label htmlFor="measuredMax">Measured Max HR (optional)</Label>
                    <Input id="measuredMax" type="number" min="100" max="250" placeholder="e.g. 192" value={measuredMax} onChange={e => setMeasuredMax(e.target.value)} />
                </div>
              </>
            )}
            
            {calcType === 'zones' && (
              <>
                 <div className="sm:col-span-2"><Label htmlFor="ageZ">Age (for MAF)</Label><Input id="ageZ" type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
                 <div><Label htmlFor="hrMaxTarget">Max HR (bpm)</Label><Input id="hrMaxTarget" type="number" value={hrMaxTarget} onChange={e => setHrMaxTarget(e.target.value)} /></div>
                 <div><Label htmlFor="hrRest">Resting HR (bpm)</Label><Input id="hrRest" type="number" value={hrRest} onChange={e => setHrRest(e.target.value)} /></div>
                 {modeZones === 'advanced' && (
                   <div className="sm:col-span-2"><Label htmlFor="lthr">Lactate Threshold HR (optional)</Label><Input id="lthr" type="number" value={lthr} onChange={e => setLthr(e.target.value)} /></div>
                 )}
              </>
            )}
            
            {calcType === 'drift' && (
              <>
                 <div><Label htmlFor="hr1">First half HR Avg</Label><Input id="hr1" type="number" value={hr1} onChange={e => setHr1(e.target.value)} required/></div>
                 <div><Label htmlFor="hr2">Second half HR Avg</Label><Input id="hr2" type="number" value={hr2} onChange={e => setHr2(e.target.value)} required/></div>
                 
                 <div className="sm:col-span-2 text-xs text-muted-foreground font-bold mt-2">Optional (for Aerobic Decoupling)</div>
                 <div><Label htmlFor="pace1">First half Pace (MM:SS)</Label><Input id="pace1" type="text" placeholder="5:30" value={pace1} onChange={e => setPace1(e.target.value)} /></div>
                 <div><Label htmlFor="pace2">Second half Pace (MM:SS)</Label><Input id="pace2" type="text" placeholder="5:45" value={pace2} onChange={e => setPace2(e.target.value)} /></div>
              </>
            )}
            
            {calcType === 'recovery' && (
              <>
                 <div className="sm:col-span-2"><Label htmlFor="peakHr">Peak HR (End of interval)</Label><Input id="peakHr" type="number" value={peakHr} onChange={e => setPeakHr(e.target.value)} required/></div>
                 <div><Label htmlFor="rec1Hr">HR after 1 minute</Label><Input id="rec1Hr" type="number" value={rec1Hr} onChange={e => setRec1Hr(e.target.value)} required/></div>
                 <div><Label htmlFor="rec2Hr">HR after 2 minutes</Label><Input id="rec2Hr" type="number" value={rec2Hr} onChange={e => setRec2Hr(e.target.value)} /></div>
              </>
            )}
            
          </div>
        </ManualInputPanel>

        <div className="flex flex-col gap-4 h-full">
          {result ? (
            <>
              <ResultCard result={result} />
              <ExportPanel textToCopy={resultToText(result, "Heart Rate Lab Result")} />
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

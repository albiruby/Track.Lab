'use client';

import { useState } from 'react';
import { Input, Label, Select } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { safeNumber } from '@/lib/formatters/time';
import { CalculatorPageShell } from '@/components/calculator/CalculatorPageShell';
import { ManualInputPanel } from '@/components/calculator/ManualInputPanel';
import { ExportPanel, ResultActionRow } from '@/components/calculator/CalculatorSystem';
import { resultToText } from '@/lib/export/manualExport';
import { CalculatorResult } from '@/types';
import { classifyRPE10, classifyBorg620, calculateSessionRPELoad, mapRpeToZone, calculateRpeDrift, plannedVsActualRpe, multiDayRpeTrend } from '@/lib/calculators_pack/rpe';
import Link from 'next/link';

export default function RpeLabPage() {
  const [calcType, setCalcType] = useState('rpe10'); // rpe10, rpe20, load, diff, drift, trend, zone

  const [rpe, setRpe] = useState('4');
  const [borg, setBorg] = useState('13');
  const [duration, setDuration] = useState('60');
  
  const [planned, setPlanned] = useState('5');
  const [actual, setActual] = useState('7');

  const [hr1, setHr1] = useState('4');
  const [hr2, setHr2] = useState('6');
  
  const [r1, setR1] = useState(''); const [r2, setR2] = useState('');
  const [r3, setR3] = useState(''); const [r4, setR4] = useState('');
  const [r5, setR5] = useState(''); const [r6, setR6] = useState('');
  const [r7, setR7] = useState('');

  const [result, setResult] = useState<CalculatorResult<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setRpe('4'); setBorg('13'); setDuration('60');
    setPlanned('5'); setActual('7');
    setHr1('4'); setHr2('6');
    setR1(''); setR2(''); setR3(''); setR4(''); setR5(''); setR6(''); setR7('');
    setResult(null); setError(null);
  };
  
  const handleTabChange = (t: string) => { setCalcType(t); setResult(null); setError(null); };

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    let res: CalculatorResult<any> | null = null;
    
    if (calcType === 'rpe10') {
        const r = safeNumber(rpe);
        if (r === null || r < 0 || r > 10) return setError('Invalid RPE. Must be 0-10.');
        
        const cls = classifyRPE10(r);
        
        res = {
            result: (
               <div className="flex flex-col gap-4">
                 <div className="flex flex-col gap-1 border-2 border-border-heavy p-4 rounded-xl bg-card shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                    <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Category</span>
                    <span className="font-black text-3xl text-primary">{cls}</span>
                 </div>
               </div>
            ),
            methodSelected: 'RPE 1-10 Classification',
            confidenceLabel: 'Qualitative',
            formulaUsed: 'Subjective numerical scale mapping',
            inputUsed: { RPE: r.toString() },
            limitations: 'Highly subjective. Affected by external stress and fatigue.'
        };
    } else if (calcType === 'rpe20') {
        const r = safeNumber(borg);
        if (r === null || r < 6 || r > 20) return setError('Invalid Borg. Must be 6-20.');
        
        const cls = classifyBorg620(r);
        
        res = {
            result: (
               <div className="flex flex-col gap-4">
                 <div className="flex flex-col gap-1 border-2 border-border-heavy p-4 rounded-xl bg-card shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                    <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Category</span>
                    <span className="font-black text-3xl text-primary">{cls}</span>
                 </div>
               </div>
            ),
            methodSelected: 'Borg 6-20 Classification',
            confidenceLabel: 'Qualitative',
            formulaUsed: 'Subjective numerical scale mapping',
            inputUsed: { Borg: r.toString() },
            limitations: 'Highly subjective. Affected by external stress and fatigue.'
        };
    } else if (calcType === 'load') {
        const r = safeNumber(rpe);
        const d = safeNumber(duration);
        if (r === null || r < 0 || r > 10) return setError('Invalid RPE.');
        if (d === null || d <= 0) return setError('Invalid duration.');
        
        const load = calculateSessionRPELoad(d, r);
        
        res = {
            result: (
               <div className="flex flex-col gap-4">
                 <div className="flex flex-col gap-1 border-2 border-border-heavy p-4 rounded-xl bg-primary text-primary-foreground shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                    <span className="font-bold text-xs uppercase tracking-wider text-primary-foreground/80">Session RPE Load</span>
                    <span className="font-black text-4xl">{Math.round(load)}</span>
                 </div>
                 <div className="mt-2 flex gap-2">
                    <ResultActionRow 
                      actions={[
                        { label: "Load Lab", href: "/load" }
                      ]} 
                    />
                 </div>
               </div>
            ),
            methodSelected: 'Session RPE Load',
            confidenceLabel: 'Qualitative',
            formulaUsed: 'sRPE Load = Duration × RPE',
            inputUsed: { RPE: r.toString(), 'Duration (min)': d.toString() },
            limitations: 'Not equivalent to mechanical load (TSS/TRIMP), purely subjective internal load.'
        };
    } else if (calcType === 'diff') {
        const p = safeNumber(planned);
        const a = safeNumber(actual);
        if (p === null || a === null) return setError('Invalid RPE inputs.');
        
        const diff = plannedVsActualRpe(p, a);
        
        res = {
            result: (
               <div className="flex flex-col gap-4">
                 <div className="flex flex-col gap-1 border-2 border-border-heavy p-4 rounded-xl bg-card shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                    <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">RPE Delta</span>
                    <span className={`font-black text-4xl ${diff > 0 ? 'text-destructive' : 'text-primary'}`}>
                        {diff > 0 ? '+' : ''}{diff}
                    </span>
                    <span className="text-[10px] font-bold mt-2 text-muted-foreground">
                        {diff > 0 ? 'Actual effort exceeded planned effort.' : diff < 0 ? 'Actual effort under-shot planned effort.' : 'Effort matched plan.'}
                    </span>
                 </div>
               </div>
            ),
            methodSelected: 'Planned vs Actual',
            confidenceLabel: 'Qualitative',
            formulaUsed: 'Delta = Actual - Planned',
            inputUsed: { Planned: p.toString(), Actual: a.toString() },
            limitations: 'Subjective delta.'
        };
    } else if (calcType === 'drift') {
        const h1 = safeNumber(hr1);
        const h2 = safeNumber(hr2);
        if (h1 === null || h2 === null) return setError('Invalid RPE inputs.');
        
        const drift = calculateRpeDrift(h1, h2);
        
        res = {
            result: (
               <div className="flex flex-col gap-4">
                 <div className="flex flex-col gap-1 border-2 border-border-heavy p-4 rounded-xl bg-card shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                    <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">RPE Drift</span>
                    <span className={`font-black text-4xl ${drift > 0 ? 'text-destructive' : 'text-primary'}`}>
                        {drift > 0 ? '+' : ''}{drift}
                    </span>
                 </div>
               </div>
            ),
            methodSelected: 'RPE Drift',
            confidenceLabel: 'Qualitative',
            formulaUsed: 'Drift = Second Half RPE - First Half RPE',
            inputUsed: { HR1: h1.toString(), HR2: h2.toString() },
            limitations: 'Subjective input over time can be inaccurate due to fatigue biasing.'
        };
    } else if (calcType === 'zone') {
        const r = safeNumber(rpe);
        if (r === null || r < 0 || r > 10) return setError('Invalid RPE. Must be 0-10.');
        
        const zoneMap = mapRpeToZone(r);
        
        res = {
            result: (
               <div className="flex flex-col gap-4">
                 <div className="flex flex-col gap-1 border-2 border-border-heavy p-4 rounded-xl bg-card shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                    <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Likely Zone</span>
                    <span className="font-black text-2xl text-primary">{zoneMap}</span>
                 </div>
                 <div className="mt-2 flex gap-2">
                    <ResultActionRow 
                      actions={[
                        { label: "Zone Lab", href: "/zone" }
                      ]} 
                    />
                 </div>
               </div>
            ),
            methodSelected: 'RPE to Zone Mapping',
            confidenceLabel: 'Qualitative',
            formulaUsed: 'Standard RPE/Zone translation table',
            inputUsed: { RPE: r.toString() },
            limitations: 'Subjective effort mapping, not a physiological measurement.'
        };
    } else if (calcType === 'trend') {
        const arr = [r1, r2, r3, r4, r5, r6, r7].map(v => safeNumber(v)).filter(n => n !== null) as number[];
        if (!arr.length) return setError('Enter at least one valid RPE.');
        
        const t = multiDayRpeTrend(arr);
        
        res = {
            result: (
               <div className="flex flex-col gap-4">
                 <div className="grid grid-cols-2 gap-2">
                     <div className="flex flex-col gap-1 border-2 border-border-heavy p-3 rounded-lg bg-card">
                        <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Average RPE</span>
                        <span className="font-mono text-xl font-bold">{t.average.toFixed(1)}</span>
                     </div>
                     <div className="flex flex-col gap-1 border-2 border-border-heavy p-3 rounded-lg bg-card text-destructive">
                        <span className="font-bold text-[10px] uppercase tracking-wider text-destructive/80">Max RPE</span>
                        <span className="font-mono text-xl font-bold">{t.highest.toFixed(1)}</span>
                     </div>
                 </div>
                 
                 <div className="flex flex-col gap-1 border-2 border-border-heavy p-3 rounded-lg bg-card">
                    <span className="font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Short-term Trend</span>
                    <span className="font-bold text-sm">{t.trend}</span>
                 </div>
                 
                 {arr.length > 0 && (
                     <div className="flex items-end gap-1 h-20 mt-2">
                         {arr.map((val, idx) => (
                             <div key={idx} className="flex-1 bg-primary border border-border-heavy flex items-end justify-center rounded-t-sm" style={{height: `${(val/10)*100}%`}}>
                                <span className="text-[8px] font-bold text-white mb-1">{val}</span>
                             </div>
                         ))}
                     </div>
                 )}
               </div>
            ),
            methodSelected: 'Multi-Day Trend',
            confidenceLabel: 'Qualitative',
            formulaUsed: 'Mathematical average and diffs on qualitative data',
            inputUsed: { DaysCount: arr.length.toString() },
            limitations: 'Small sample size calculations.'
        };
    }
    
    if (res) setResult(res);
  };

  return (
    <CalculatorPageShell title="RPE Lab" subtitle="Calculate internal load using the Rate of Perceived Exertion (RPE) scale.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <ManualInputPanel
          mode={'quick'}
          setMode={()=>{}}
          supportsAdvanced={false}
          onCalculate={handleCalculate}
          onReset={handleReset}
          error={error}
        >
          <div className="mb-4">
             <Label htmlFor="calcType">Calculator Type</Label>
             <Select id="calcType" value={calcType} onChange={e => handleTabChange(e.target.value)}>
                <option value="rpe10">RPE 1-10 Classification</option>
                <option value="rpe20">Borg 6-20 Classification</option>
                <option value="load">Session RPE Load</option>
                <option value="diff">Planned vs Actual Delta</option>
                <option value="drift">RPE Drift</option>
                <option value="trend">Weekly Trend Analysis</option>
                <option value="zone">RPE to Zone Mapping</option>
             </Select>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {(calcType === 'rpe10' || calcType === 'load' || calcType === 'zone') && (
                 <div className="sm:col-span-2">
                    <Label htmlFor="rpe">Subjective Effort (1-10)</Label>
                    <Input id="rpe" type="number" step="0.5" min="0" max="10" value={rpe} onChange={e => setRpe(e.target.value)} required />
                 </div>
            )}
            
            {(calcType === 'load') && (
                 <div className="sm:col-span-2">
                    <Label htmlFor="duration">Session Duration (min)</Label>
                    <Input id="duration" type="number" value={duration} onChange={e => setDuration(e.target.value)} required />
                 </div>
            )}
            
            {calcType === 'rpe20' && (
                 <div className="sm:col-span-2">
                    <Label htmlFor="borg">Borg Score (6-20)</Label>
                    <Input id="borg" type="number" min="6" max="20" value={borg} onChange={e => setBorg(e.target.value)} required />
                 </div>
            )}
            
            {calcType === 'diff' && (
              <>
                 <div><Label htmlFor="planned">Planned RPE (1-10)</Label><Input id="planned" type="number" step="0.5" min="0" max="10" value={planned} onChange={e => setPlanned(e.target.value)} required /></div>
                 <div><Label htmlFor="actual">Actual RPE (1-10)</Label><Input id="actual" type="number" step="0.5" min="0" max="10" value={actual} onChange={e => setActual(e.target.value)} required /></div>
              </>
            )}
            
            {calcType === 'drift' && (
              <>
                 <div><Label htmlFor="hr1">First Half RPE (1-10)</Label><Input id="hr1" type="number" step="0.5" min="0" max="10" value={hr1} onChange={e => setHr1(e.target.value)} required /></div>
                 <div><Label htmlFor="hr2">Second Half RPE (1-10)</Label><Input id="hr2" type="number" step="0.5" min="0" max="10" value={hr2} onChange={e => setHr2(e.target.value)} required /></div>
              </>
            )}
            
            {calcType === 'trend' && (
              <div className="sm:col-span-2 grid grid-cols-7 gap-1">
                 <div className="flex flex-col items-center"><Label className="text-[10px]">D1</Label><Input type="number" className="p-1 h-8 text-center" min="0" max="10" value={r1} onChange={e => setR1(e.target.value)} /></div>
                 <div className="flex flex-col items-center"><Label className="text-[10px]">D2</Label><Input type="number" className="p-1 h-8 text-center" min="0" max="10" value={r2} onChange={e => setR2(e.target.value)} /></div>
                 <div className="flex flex-col items-center"><Label className="text-[10px]">D3</Label><Input type="number" className="p-1 h-8 text-center" min="0" max="10" value={r3} onChange={e => setR3(e.target.value)} /></div>
                 <div className="flex flex-col items-center"><Label className="text-[10px]">D4</Label><Input type="number" className="p-1 h-8 text-center" min="0" max="10" value={r4} onChange={e => setR4(e.target.value)} /></div>
                 <div className="flex flex-col items-center"><Label className="text-[10px]">D5</Label><Input type="number" className="p-1 h-8 text-center" min="0" max="10" value={r5} onChange={e => setR5(e.target.value)} /></div>
                 <div className="flex flex-col items-center"><Label className="text-[10px]">D6</Label><Input type="number" className="p-1 h-8 text-center" min="0" max="10" value={r6} onChange={e => setR6(e.target.value)} /></div>
                 <div className="flex flex-col items-center"><Label className="text-[10px]">D7</Label><Input type="number" className="p-1 h-8 text-center" min="0" max="10" value={r7} onChange={e => setR7(e.target.value)} /></div>
              </div>
            )}
            
          </div>
        </ManualInputPanel>

        <div className="flex flex-col gap-4 h-full">
          {result ? (
            <>
              <ResultCard result={result} />
              <ExportPanel textToCopy={resultToText(result, "RPE Lab Result")} />
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

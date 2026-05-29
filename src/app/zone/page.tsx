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
import { hrZoneModels } from '@/data_pack/hrZoneModels';
import { zoneFromHrmax, zoneFromKarvonen, zoneFromLthr } from '@/lib/calculators_pack/heartRate';
import { classifyIntensityDistribution, calculateTimeInZoneDistribution } from '@/lib/calculators_pack/zone';
import { mapRpeToZone } from '@/lib/calculators_pack/rpe';
import Link from 'next/link';

export default function ZoneLabPage() {
  const [calcType, setCalcType] = useState('hr'); // hr, pace, power, rpe, time, dist, compare

  // HR inputs
  const [hrMethod, setHrMethod] = useState<string>(hrZoneModels[0].id);
  const [maxHr, setMaxHr] = useState('190');
  const [restHr, setRestHr] = useState('60');
  const [lthr, setLthr] = useState('170');
  
  // Pace inputs
  const [thresholdPace, setThresholdPace] = useState('4:30');
  
  // Power inputs
  const [cp, setCp] = useState('300');
  const [weight, setWeight] = useState('70');
  
  // RPE inputs
  const [rpeScale, setRpeScale] = useState('10');
  
  // Time/Dist inputs
  const [z1, setZ1] = useState('30');
  const [z2, setZ2] = useState('40');
  const [z3, setZ3] = useState('20');
  const [z4, setZ4] = useState('10');
  const [z5, setZ5] = useState('0');
  
  const [low, setLow] = useState('80');
  const [mod, setMod] = useState('10');
  const [high, setHigh] = useState('10');

  const [result, setResult] = useState<CalculatorResult<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setMaxHr('190'); setRestHr('60'); setLthr('170');
    setThresholdPace('4:30'); setCp('300'); setWeight('70');
    setZ1('30'); setZ2('40'); setZ3('20'); setZ4('10'); setZ5('0');
    setLow('80'); setMod('10'); setHigh('10');
    setResult(null); setError(null);
  };
  
  const handleTabChange = (t: string) => { setCalcType(t); setResult(null); setError(null); };

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    let res: CalculatorResult<any> | null = null;
    
    if (calcType === 'hr') {
        const mMax = safeNumber(maxHr) || 0;
        const mRest = safeNumber(restHr) || 0;
        const mLthr = safeNumber(lthr) || 0;
        
        const selectedModel = hrZoneModels.find(m => m.id === hrMethod) || hrZoneModels[0];
        
        interface Z { name: string; min: number; max: number | null; }
        let zones: Z[] = [];
        
        try {
            const basis = (selectedModel as any).basis;
            if (basis === 'hrmax' && 'zones' in selectedModel) {
                if (!mMax) throw new Error('HRmax required.');
                // @ts-ignore
                zones = selectedModel.zones.map(z => ({ name: z.name, ...zoneFromHrmax(mMax, z.minPct, z.maxPct ? z.maxPct : null) }));
            } else if (basis === 'hrr' && 'zones' in selectedModel) {
                if (!mMax || !mRest) throw new Error('HRmax and RHR required.');
                // @ts-ignore
                zones = selectedModel.zones.map(z => ({ name: z.name, ...zoneFromKarvonen(mMax, mRest, z.minPct, z.maxPct ? z.maxPct : null) }));
            } else if (basis === 'lthr' && 'zones' in selectedModel) {
                if (!mLthr) throw new Error('LTHR required.');
                // @ts-ignore
                zones = selectedModel.zones.map(z => ({ name: z.name, ...zoneFromLthr(mLthr, z.minPct, z.maxPct ? z.maxPct : null) }));
            }
        } catch(err: any) {
            return setError(err.message || 'Calculation error.');
        }
        
        res = {
            result: (
               <div className="flex flex-col pt-2">
                 {zones.map((z, i) => {
                   return (
                   <div key={i} className="mb-4">
                     <div className="flex justify-between mb-1 text-sm font-bold uppercase tracking-wider">
                       <span>{z.name}</span>
                       <span className="font-mono text-primary">{z.min} - {z.max || 'Max'} bpm</span>
                     </div>
                   </div>
                 )})}
                 <div className="mt-4 flex gap-2">
                    <Link href="/heart-rate" className="text-[10px] text-primary font-bold hover:underline">→ Need to calculate HRmax? (Heart Rate Lab)</Link>
                 </div>
               </div>
            ),
            methodSelected: selectedModel.name,
            confidenceLabel: 'Mathematical Model',
            formulaUsed: (selectedModel as any).basis,
            inputUsed: { HRmax: mMax.toString(), RHR: mRest.toString(), LTHR: mLthr.toString() },
            limitations: 'Zones are generalized estimates, actual physiological borders vary per individual.'
        };
    } else if (calcType === 'pace') {
        const tpSecs = parseDurationToSeconds(thresholdPace);
        if (!tpSecs || tpSecs <= 0) return setError('Invalid threshold pace.');
        
        // simple threshold pace zones
        const pZones = [
            { n: 'Recovery', min: tpSecs * 1.25, max: tpSecs * 1.35 },
            { n: 'Easy/Long', min: tpSecs * 1.14, max: tpSecs * 1.25 },
            { n: 'Steady', min: tpSecs * 1.05, max: tpSecs * 1.14 },
            { n: 'Tempo', min: tpSecs * 1.00, max: tpSecs * 1.05 },
            { n: 'Threshold', min: tpSecs * 0.95, max: tpSecs * 1.00 },
            { n: 'Intervals', min: tpSecs * 0.85, max: tpSecs * 0.95 },
            { n: 'Repetition', min: tpSecs * 0.70, max: tpSecs * 0.85 }
        ];
        
        res = {
            result: (
               <div className="flex flex-col pt-2">
                 {pZones.map((z, i) => (
                   <div key={i} className="mb-4">
                     <div className="flex justify-between mb-1 text-sm font-bold uppercase tracking-wider">
                       <span>{z.n}</span>
                       <span className="font-mono text-primary">{formatSecondsToTimeString(z.min)} - {formatSecondsToTimeString(z.max)}</span>
                     </div>
                   </div>
                 ))}
               </div>
            ),
            methodSelected: 'Threshold-Pace Zones',
            confidenceLabel: 'Estimate',
            formulaUsed: 'Pace zones derived from threshold pace anchors.',
            inputUsed: { ThresholdPace: thresholdPace },
            limitations: 'Calculates mathematically exact segments, pacing boundaries naturally fluctuate.'
        };
    } else if (calcType === 'power') {
        const c = safeNumber(cp);
        const w = safeNumber(weight);
        if (!c || c <= 0) return setError('Invalid Critical Power.');
        
        const pZones = [
            { n: 'Z1 Active Recovery', pMin: 0, pMax: Math.round(c * 0.55) },
            { n: 'Z2 Endurance', pMin: Math.round(c * 0.55), pMax: Math.round(c * 0.75) },
            { n: 'Z3 Tempo', pMin: Math.round(c * 0.75), pMax: Math.round(c * 0.90) },
            { n: 'Z4 Threshold', pMin: Math.round(c * 0.90), pMax: Math.round(c * 1.05) },
            { n: 'Z5 VO2 Max', pMin: Math.round(c * 1.05), pMax: Math.round(c * 1.20) },
            { n: 'Z6 Anaerobic', pMin: Math.round(c * 1.20), pMax: 'Max' }
        ];
        
        res = {
            result: (
               <div className="flex flex-col pt-2">
                 {pZones.map((z, i) => (
                   <div key={i} className="mb-4">
                     <div className="flex justify-between mb-1 text-sm font-bold uppercase tracking-wider">
                       <span>{z.n}</span>
                       <span className="font-mono text-primary">{z.pMin} - {z.pMax} W</span>
                     </div>
                     {(w && w > 0 && z.pMax !== 'Max') ? (
                         <div className="text-[10px] text-muted-foreground font-mono">{(z.pMin / w).toFixed(1)} - {((z.pMax as number) / w).toFixed(1)} W/kg</div>
                     ) : null}
                   </div>
                 ))}
               </div>
            ),
            methodSelected: 'Critical Power Zones',
            confidenceLabel: 'Estimate',
            formulaUsed: 'Zone boundaries anchored on CP.',
            inputUsed: { CriticalPower: cp, Weight: weight || 'None' },
            limitations: 'Requires user-provided running power data. Stryd/Garmin zones may differ.'
        };
    } else if (calcType === 'rpe') {
        let maxR = rpeScale === '10' ? 10 : 20;
        let zones = [];
        if (rpeScale === '10') {
           zones = [
               { n: 'Zone 1 (Recovery)', r: '1-2' },
               { n: 'Zone 2 (Endurance)', r: '3-4' },
               { n: 'Zone 3 (Tempo)', r: '5-6' },
               { n: 'Zone 4 (Threshold)', r: '7-8' },
               { n: 'Zone 5 (Anaerobic)', r: '9-10' }
           ];
        } else {
           zones = [
               { n: 'Zone 1 (Recovery)', r: '6-9' },
               { n: 'Zone 2 (Endurance)', r: '10-12' },
               { n: 'Zone 3 (Tempo)', r: '13-14' },
               { n: 'Zone 4 (Threshold)', r: '15-16' },
               { n: 'Zone 5 (Anaerobic)', r: '17-20' }
           ];
        }
        
        res = {
            result: (
               <div className="flex flex-col pt-2">
                 {zones.map((z, i) => (
                     <div key={i} className="flex justify-between items-center p-2 mb-2 border-b-2 border-border-heavy">
                         <span className="font-bold text-sm uppercase tracking-wider">{z.n}</span>
                         <span className="font-mono text-primary font-bold">{z.r}</span>
                     </div>
                 ))}
                 <div className="mt-4 flex gap-2">
                    <Link href="/rpe" className="text-[10px] text-primary font-bold hover:underline">→ Go to RPE Lab for session load</Link>
                 </div>
               </div>
            ),
            methodSelected: rpeScale === '10' ? 'RPE 1-10 Zones' : 'Borg 6-20 Zones',
            confidenceLabel: 'Qualitative',
            formulaUsed: 'Standard subjective scale mapping',
            inputUsed: { Scale: rpeScale === '10' ? '1-10' : '6-20' },
            limitations: 'Subjective mapping; not a measurable physiological limit.'
        };
    } else if (calcType === 'dist') {
        const l = safeNumber(low) || 0;
        const m = safeNumber(mod) || 0;
        const h = safeNumber(high) || 0;
        
        if (l+m+h <= 0) return setError('Total time must be greater than zero.');
        
        const times = [l, m, h];
        const pcts = calculateTimeInZoneDistribution(times);
        const classification = classifyIntensityDistribution(pcts[0], pcts[1], pcts[2]);
        
        res = {
            result: (
               <div className="flex flex-col gap-4">
                 <div className="flex flex-col gap-1 border-2 border-border-heavy p-4 rounded-xl bg-card">
                    <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground">Classification</span>
                    <span className="font-black text-2xl text-primary">{classification}</span>
                    <span className="text-[10px] font-bold mt-2 opacity-80">
                        {classification === 'Threshold-Heavy (Caution)' ? 'Threshold-heavy training can increase fatigue risk over time.' : 'Rule-based categorization of time.'}
                    </span>
                 </div>
                 
                 <div className="flex h-12 w-full rounded-lg overflow-hidden border-2 border-border-heavy">
                     {pcts[0] > 0 && <div className="bg-emerald-500 h-full flex items-center justify-center font-bold text-xs text-white" style={{width: `${pcts[0]}%`}}>{Math.round(pcts[0])}%</div>}
                     {pcts[1] > 0 && <div className="bg-amber-500 h-full flex items-center justify-center font-bold text-xs text-white" style={{width: `${pcts[1]}%`}}>{Math.round(pcts[1])}%</div>}
                     {pcts[2] > 0 && <div className="bg-red-500 h-full flex items-center justify-center font-bold text-xs text-white" style={{width: `${pcts[2]}%`}}>{Math.round(pcts[2])}%</div>}
                 </div>
                 <div className="flex justify-between px-2 text-[10px] font-bold uppercase text-muted-foreground mt-[-10px]">
                     <span>Low (Z1-Z2)</span>
                     <span>Moderate (Z3-Z4)</span>
                     <span>High (Z5+)</span>
                 </div>
                 
               </div>
            ),
            methodSelected: 'Training Distribution',
            confidenceLabel: 'Exact',
            formulaUsed: 'Distribution and rule-based classification',
            inputUsed: { Low: low, Mod: mod, High: high },
            limitations: 'Calculates purely off time duration; assumes accurate subjective reporting.'
        };
    } else if (calcType === 'time') {
        const times = [safeNumber(z1)||0, safeNumber(z2)||0, safeNumber(z3)||0, safeNumber(z4)||0, safeNumber(z5)||0];
        const tot = times.reduce((a,b) => a+b, 0);
        if (tot <= 0) return setError('Total time must be greater than zero.');
        
        const pcts = calculateTimeInZoneDistribution(times);
        
        res = {
            result: (
               <div className="flex flex-col gap-4">
                 <div className="flex h-12 w-full rounded-lg overflow-hidden border-2 border-border-heavy shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                     {pcts.map((p, i) => (
                         p > 0 ? (
                           <div key={i} className={`h-full flex flex-col items-center justify-center font-bold text-[10px] border-r border-black/20 ${i===0?'bg-slate-200':i===1?'bg-emerald-400':i===2?'bg-yellow-400':i===3?'bg-orange-500':'bg-red-500 text-white'}`} style={{width: `${p}%`}}>
                               <span>Z{i+1}</span>
                           </div>
                         ) : null
                     ))}
                 </div>
                 <table className="w-full text-left text-sm border-collapse mt-4 border border-border">
                    <thead className="bg-muted">
                        <tr>
                            <th className="p-2 uppercase text-[10px] tracking-wider text-muted-foreground font-bold">Zone</th>
                            <th className="p-2 uppercase text-[10px] tracking-wider text-muted-foreground font-bold">Duration</th>
                            <th className="p-2 uppercase text-[10px] tracking-wider text-muted-foreground font-bold">% Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pcts.map((p, i) => (
                            <tr key={i} className="border-t border-border">
                                <td className="p-2 font-bold text-xs">Zone {i+1}</td>
                                <td className="p-2 font-mono text-xs">{times[i]} min</td>
                                <td className="p-2 font-mono text-primary font-bold">{p.toFixed(1)}%</td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
                 
                 <div className="grid grid-cols-3 gap-2 mt-2">
                     <div className="bg-card border-2 border-border-heavy p-2 flex flex-col items-center rounded-lg">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Low (Z1-Z2)</span>
                        <span className="font-mono text-sm font-bold">{(pcts[0]+pcts[1]).toFixed(1)}%</span>
                     </div>
                     <div className="bg-card border-2 border-border-heavy p-2 flex flex-col items-center rounded-lg">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">Mod (Z3-Z4)</span>
                        <span className="font-mono text-sm font-bold">{(pcts[2]+pcts[3]).toFixed(1)}%</span>
                     </div>
                     <div className="bg-card border-2 border-border-heavy p-2 flex flex-col items-center rounded-lg">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">High (Z5+)</span>
                        <span className="font-mono text-sm font-bold">{(pcts[4]).toFixed(1)}%</span>
                     </div>
                 </div>
               </div>
            ),
            methodSelected: 'Time-in-Zone',
            confidenceLabel: 'Exact',
            formulaUsed: 'Zone % = Zone Time / Total Time × 100',
            inputUsed: { Z1: z1, Z2: z2, Z3: z3, Z4: z4, Z5: z5 },
            limitations: 'Averages hide interval distribution nuance within zones.'
        }
    }
    
    if (res) setResult(res);
  };

  return (
    <CalculatorPageShell title="Zone Lab" subtitle="Unified training zone definitions and intensity distribution checkers.">
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
             <Label htmlFor="calcType">Zone System / Module</Label>
             <Select id="calcType" value={calcType} onChange={e => handleTabChange(e.target.value)}>
                <option value="hr">HR Zone Builder</option>
                <option value="pace">Pace Zone Builder</option>
                <option value="power">Power Zone Builder</option>
                <option value="rpe">RPE Zone Builder</option>
                <option value="time">Time-in-Zone Distribution</option>
                <option value="dist">80/20 / Polarized Checker</option>
             </Select>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {calcType === 'hr' && (
              <>
                 <div className="sm:col-span-2">
                    <Label htmlFor="hrMethod">Model</Label>
                    <Select id="hrMethod" value={hrMethod} onChange={e => setHrMethod(e.target.value)}>
                       {hrZoneModels.map(m => (
                          <option key={m.id} value={m.id}>{m.name}</option>
                       ))}
                    </Select>
                 </div>
                 <div><Label htmlFor="maxHr">Max HR (bpm)</Label><Input id="maxHr" type="number" min="100" max="250" value={maxHr} onChange={e => setMaxHr(e.target.value)} /></div>
                 <div><Label htmlFor="restHr">Resting HR (bpm)</Label><Input id="restHr" type="number" min="20" max="150" value={restHr} onChange={e => setRestHr(e.target.value)} /></div>
                 <div className="sm:col-span-2"><Label htmlFor="lthr">Lactate Threshold HR (bpm)</Label><Input id="lthr" type="number" min="100" max="220" value={lthr} onChange={e => setLthr(e.target.value)} /></div>
              </>
            )}
            
            {calcType === 'pace' && (
              <>
                 <div className="sm:col-span-2"><Label htmlFor="tp">Threshold Pace (MM:SS)</Label><Input id="tp" type="text" placeholder="4:30" value={thresholdPace} onChange={e => setThresholdPace(e.target.value)} required /></div>
              </>
            )}
            
            {calcType === 'power' && (
              <>
                 <div><Label htmlFor="cp">Critical Power (W)</Label><Input id="cp" type="number" value={cp} onChange={e => setCp(e.target.value)} required /></div>
                 <div><Label htmlFor="weight">Weight (kg) - optional</Label><Input id="weight" type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
              </>
            )}
            
            {calcType === 'rpe' && (
              <div className="sm:col-span-2">
                 <Label htmlFor="rpeScale">RPE Scale</Label>
                 <Select id="rpeScale" value={rpeScale} onChange={e => setRpeScale(e.target.value)}>
                    <option value="10">1-10 Scale</option>
                    <option value="20">Borg 6-20 Scale</option>
                 </Select>
              </div>
            )}
            
            {calcType === 'dist' && (
              <>
                 <div><Label htmlFor="low">Low Intensity Time (min)</Label><Input id="low" type="number" value={low} onChange={e => setLow(e.target.value)} required /></div>
                 <div><Label htmlFor="mod">Moderate Intensity Time (min)</Label><Input id="mod" type="number" value={mod} onChange={e => setMod(e.target.value)} required /></div>
                 <div><Label htmlFor="high">High Intensity Time (min)</Label><Input id="high" type="number" value={high} onChange={e => setHigh(e.target.value)} required /></div>
              </>
            )}
            
            {calcType === 'time' && (
              <>
                 <div><Label htmlFor="z1">Zone 1 Time (min)</Label><Input id="z1" type="number" value={z1} onChange={e => setZ1(e.target.value)} /></div>
                 <div><Label htmlFor="z2">Zone 2 Time (min)</Label><Input id="z2" type="number" value={z2} onChange={e => setZ2(e.target.value)} /></div>
                 <div><Label htmlFor="z3">Zone 3 Time (min)</Label><Input id="z3" type="number" value={z3} onChange={e => setZ3(e.target.value)} /></div>
                 <div><Label htmlFor="z4">Zone 4 Time (min)</Label><Input id="z4" type="number" value={z4} onChange={e => setZ4(e.target.value)} /></div>
                 <div><Label htmlFor="z5">Zone 5+ Time (min)</Label><Input id="z5" type="number" value={z5} onChange={e => setZ5(e.target.value)} /></div>
              </>
            )}
            
          </div>
        </ManualInputPanel>

        <div className="flex flex-col gap-4 h-full">
          {result ? (
            <>
              <ResultCard result={result} />
              <ExportPanel textToCopy={resultToText(result, "Zone Lab Result")} />
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

'use client';

import { useState } from 'react';
import { Input, Label } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { acwr as calcAcwr, monotony as calcMonotony, strain as calcStrain } from '@/lib/calculators';
import { methodRegistry } from '@/data';
import { CalculatorResult } from '@/types';
import { CalculatorPageShell } from '@/components/calculator/CalculatorPageShell';
import { ManualInputPanel } from '@/components/calculator/ManualInputPanel';

export default function LoadLabPage() {
  const [error, setError] = useState<string | null>(null);
  
  const [modeSrpe, setModeSrpe] = useState<'quick'|'advanced'>('quick');
  const [sRpeDuration, setSRpeDuration] = useState('60');
  const [sRpeVal, setSRpeVal] = useState('5');
  const [sRpeResult, setSRpeResult] = useState<CalculatorResult<string> | null>(null);

  const [modeAcwr, setModeAcwr] = useState<'quick'|'advanced'>('quick');
  const [acute, setAcute] = useState('500');
  const [chronic, setChronic] = useState('450');
  const [acwrResult, setAcwrResult] = useState<CalculatorResult<string> | null>(null);

  const [modeDist, setModeDist] = useState<'quick'|'advanced'>('quick');
  const [weeklyDistances, setWeeklyDistances] = useState('10, 0, 12, 8, 0, 20, 0');
  const [longRunDist, setLongRunDist] = useState('20');
  const [weeklyDistResult, setWeeklyDistResult] = useState<CalculatorResult<any> | null>(null);

  const [modeMon, setModeMon] = useState<'quick'|'advanced'>('quick');
  const [dailyLoads, setDailyLoads] = useState('50, 100, 0, 120, 0, 80, 150');
  const [monotonyResult, setMonotonyResult] = useState<CalculatorResult<any> | null>(null);


  const handleResetSrpe = () => { setSRpeDuration('60'); setSRpeVal('5'); setSRpeResult(null); };
  const handleResetAcwr = () => { setAcute('500'); setChronic('450'); setAcwrResult(null); };
  const handleResetDist = () => { setWeeklyDistances('10, 0, 12, 8, 0, 20, 0'); setLongRunDist('20'); setWeeklyDistResult(null); };
  const handleResetMon = () => { setDailyLoads('50, 100, 0, 120, 0, 80, 150'); setMonotonyResult(null); };

  const handleSRpe = (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    const dur = parseFloat(sRpeDuration);
    const rpe = parseFloat(sRpeVal);
    if (!isNaN(dur) && !isNaN(rpe)) {
      const load = dur * rpe;
      const meta = methodRegistry.find(m => m.id === 'srpe_load')!;
      setSRpeResult({
        result: load.toString(),
        inputUsed: { 'Duration (min)': dur, 'RPE': rpe },
        methodSelected: meta.name,
        formulaUsed: meta.formulaDisplay,
        limitations: Array.isArray(meta.limitations) ? meta.limitations.join(' ') : String(meta.limitations || ''),
        confidenceLabel: meta.precision?.replace('_', ' ') || 'Estimate'
      });
    }
  };

  const handleWeeklyDist = (e?: React.FormEvent) => {
    if(e) e.preventDefault();
    const dists = weeklyDistances.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    const lrDist = parseFloat(longRunDist);
    if (dists.length > 0) {
      const total = dists.reduce((a, b) => a + b, 0);
      const meta = methodRegistry.find(m => m.id === 'weekly_mileage')!;
      let lrRatio = 0;
      if (!isNaN(lrDist) && total > 0) {
        lrRatio = lrDist / total;
      }
      setWeeklyDistResult({
        result: (
          <div className="w-full space-y-4">
             <div className="flex justify-between items-center bg-card p-6 border-2 border-border-heavy rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
               <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Weekly Total</span>
                  <span className="text-3xl font-display font-black text-foreground">{total} units</span>
               </div>
             </div>
             {lrRatio > 0 && (
               <div className="flex justify-between items-center bg-card p-6 border-2 border-border-heavy rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                 <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Long Run Ratio</span>
                    <span className="text-2xl font-mono font-bold text-foreground">{(lrRatio * 100).toFixed(1)}%</span>
                 </div>
               </div>
             )}
          </div>
        ),
        inputUsed: { 'Daily Distances': dists.join(', ') },
        methodSelected: meta?.name || 'Weekly Distance',
        formulaUsed: meta?.formulaDisplay || 'Weekly Distance = sum(daily distances)',
        limitations: Array.isArray(meta?.limitations) ? meta.limitations.join(' ') : String(meta?.limitations || ''),
        confidenceLabel: meta?.precision?.replace('_', ' ') || 'Exact'
      });
    }
  };

  const handleAcwr = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const a = parseFloat(acute);
    const c = parseFloat(chronic);
    if (!isNaN(a) && !isNaN(c) && c > 0) {
      const res = calcAcwr(a, c).toFixed(2);
      const meta = methodRegistry.find(m => m.id === 'acwr')!;
      setAcwrResult({
        result: res,
        inputUsed: { 'Acute Load': a, 'Chronic Load': c },
        methodSelected: meta.name,
        formulaUsed: meta.formulaDisplay,
        limitations: Array.isArray(meta.limitations) ? meta.limitations.join(' ') : String(meta.limitations || ''),
        confidenceLabel: meta.precision?.replace('_', ' ') || 'Estimate'
      });
    }
  };

  const handleMonotony = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const loads = dailyLoads.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));
    if (loads.length >= 2) {
      try {
        const mon = calcMonotony(loads);
        const totalLoad = loads.reduce((acc, curr) => acc + curr, 0);
        const str = calcStrain(totalLoad, mon);
        
        const meta = methodRegistry.find(m => m.id === 'monotony')!;

        setMonotonyResult({
          result: (
            <div className="w-full space-y-4">
              <div className="flex flex-col items-center p-6 bg-card border-2 border-border-heavy rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                <span className="text-muted-foreground text-[10px] mb-1 tracking-widest block uppercase font-bold">Training Monotony</span>
                <span className="font-display text-5xl font-black text-foreground">{mon.toFixed(2)}</span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground border border-border px-2 py-1 bg-muted rounded mt-3">High (&gt; 2.0) = risk</span>
              </div>
              <div className="flex flex-col items-center p-6 bg-card border-2 border-border-heavy rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                <span className="text-muted-foreground text-[10px] mb-1 tracking-widest block uppercase font-bold">Training Strain</span>
                <span className="font-mono text-3xl font-black text-foreground">{Math.round(str)}</span>
              </div>
            </div>
          ),
          inputUsed: { 'Daily Loads': loads.join(', ') },
          methodSelected: meta.name,
          formulaUsed: meta.formulaDisplay,
          limitations: Array.isArray(meta.limitations) ? meta.limitations.join(' ') : String(meta.limitations || ''),
          confidenceLabel: meta.precision?.replace('_', ' ') || 'Estimate'
        });
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  return (
    <CalculatorPageShell title="Load Dynamics" subtitle="Calculate Training Load metrics such as ACWR, Monotony, and Strain.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        <div className="space-y-10 flex flex-col h-full">
          <div>
            <ManualInputPanel
              mode={modeSrpe} setMode={setModeSrpe} supportsAdvanced={false}
              onCalculate={handleSRpe} onReset={handleResetSrpe} error={error}
            >
              <div className="text-xl font-display font-black tracking-tight mb-2 uppercase">Session RPE</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sRpeDuration">Duration (min)</Label>
                  <Input id="sRpeDuration" type="number" step="0.1" value={sRpeDuration} onChange={e => setSRpeDuration(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="sRpeVal">Session RPE (1-10)</Label>
                  <Input id="sRpeVal" type="number" step="0.1" value={sRpeVal} onChange={e => setSRpeVal(e.target.value)} required />
                </div>
              </div>
            </ManualInputPanel>
            
            {sRpeResult && <div className="mt-4"><ResultCard result={sRpeResult} /></div>}
          </div>

          <div>
             <ManualInputPanel
              mode={modeAcwr} setMode={setModeAcwr} supportsAdvanced={false}
              onCalculate={handleAcwr} onReset={handleResetAcwr} error={error}
            >
              <div className="text-xl font-display font-black tracking-tight mb-2 uppercase">ACWR (Acute:Chronic Workload)</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="acute">Acute Load (1-wk)</Label>
                  <Input id="acute" type="number" step="0.1" value={acute} onChange={e => setAcute(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="chronic">Chronic Load (4-wk)</Label>
                  <Input id="chronic" type="number" step="0.1" value={chronic} onChange={e => setChronic(e.target.value)} required />
                </div>
              </div>
            </ManualInputPanel>

            {acwrResult && <div className="mt-4"><ResultCard result={acwrResult} /></div>}
          </div>
        </div>

        <div className="space-y-10 flex flex-col h-full">
          <div>
            <ManualInputPanel
              mode={modeDist} setMode={setModeDist} supportsAdvanced={false}
              onCalculate={handleWeeklyDist} onReset={handleResetDist} error={error}
            >
              <div className="text-xl font-display font-black tracking-tight mb-2 uppercase">Weekly Metrics</div>
              <div>
                <Label htmlFor="weeklyDistances">Daily Distances (comma separated)</Label>
                <Input id="weeklyDistances" value={weeklyDistances} onChange={e => setWeeklyDistances(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="longRunDist">Long Run Distance</Label>
                <Input id="longRunDist" type="number" step="0.1" value={longRunDist} onChange={e => setLongRunDist(e.target.value)} required />
              </div>
            </ManualInputPanel>
            
            {weeklyDistResult && <div className="mt-4"><ResultCard result={weeklyDistResult} /></div>}
          </div>

          <div>
            <ManualInputPanel
              mode={modeMon} setMode={setModeMon} supportsAdvanced={false}
              onCalculate={handleMonotony} onReset={handleResetMon} error={error}
            >
              <div className="text-xl font-display font-black tracking-tight mb-2 uppercase">Monotony & Strain</div>
              <div>
                <Label htmlFor="dailyLoads">Daily Loads (comma separated)</Label>
                <Input id="dailyLoads" value={dailyLoads} onChange={e => setDailyLoads(e.target.value)} required />
                <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2 border border-border p-2 bg-muted rounded">Example: 7 days of sRPE</div>
              </div>
            </ManualInputPanel>
            
            {monotonyResult && <div className="mt-4"><ResultCard result={monotonyResult} /></div>}
          </div>
        </div>
      </div>
    </CalculatorPageShell>
  );
}


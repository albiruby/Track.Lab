'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input, Label, Button, ValidationMessage } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { LabPageHeader } from '@/components/layout/LabPageHeader';
import { acwr as calcAcwr, monotony as calcMonotony, strain as calcStrain } from '@/lib/calculators';
import { methodRegistry } from '@/data';
import { CalculatorResult } from '@/types';

export default function LoadLabPage() {
  const [error, setError] = useState<string | null>(null);
  const [acute, setAcute] = useState('500');
  const [chronic, setChronic] = useState('450');
  const [acwrResult, setAcwrResult] = useState<CalculatorResult<string> | null>(null);

  const [sRpeDuration, setSRpeDuration] = useState('60');
  const [sRpeVal, setSRpeVal] = useState('5');
  const [sRpeResult, setSRpeResult] = useState<CalculatorResult<string> | null>(null);

  const [weeklyDistances, setWeeklyDistances] = useState('10, 0, 12, 8, 0, 20, 0');
  const [longRunDist, setLongRunDist] = useState('20');
  const [weeklyDistResult, setWeeklyDistResult] = useState<CalculatorResult<any> | null>(null);

  const handleSRpe = (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleWeeklyDist = (e: React.FormEvent) => {
    e.preventDefault();
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
            <div className="flex justify-between items-center bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-lg">
              <span className="text-sm font-semibold uppercase text-zinc-500">Weekly Total</span>
              <span className="text-xl font-bold font-mono">{total} units</span>
            </div>
            {lrRatio > 0 && (
              <div className="flex justify-between items-center bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-lg">
                <span className="text-sm font-semibold uppercase text-zinc-500">Long Run Ratio</span>
                <span className="text-xl font-bold font-mono">{(lrRatio * 100).toFixed(1)}%</span>
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

  const [dailyLoads, setDailyLoads] = useState('50, 100, 0, 120, 0, 80, 150');
  const [monotonyResult, setMonotonyResult] = useState<CalculatorResult<any> | null>(null);

  const handleReset = () => { window.location.reload(); };

  const handleAcwr = (e: React.FormEvent) => {
    e.preventDefault();
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

  const handleMonotony = (e: React.FormEvent) => {
    e.preventDefault();
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
              <div className="flex flex-col items-center p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg">
                <span className="text-zinc-500 text-sm mb-1 block uppercase font-semibold">Training Monotony</span>
                <span className="font-mono text-3xl font-bold text-zinc-900 dark:text-zinc-100">{mon.toFixed(2)}</span>
                <span className="text-xs text-zinc-400 block mt-1">High (&gt; 2.0) indicates lack of variation (risk).</span>
              </div>
              <div className="flex flex-col items-center p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg">
                <span className="text-zinc-500 text-sm mb-1 block uppercase font-semibold">Training Strain</span>
                <span className="font-mono text-xl font-bold text-zinc-900 dark:text-zinc-100">{Math.round(str)}</span>
                <span className="text-xs text-zinc-400 block mt-1">Total Load × Monotony</span>
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
    <div className="space-y-6">
      <LabPageHeader title="LOAD DYNAMICS" subtitle="Calculate Training Load metrics such as ACWR, Monotony, and Strain." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-6 flex flex-col h-full">
          <Card>
            <CardHeader>
              <CardTitle>SESSION RPE (sRPE)</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSRpe} className="space-y-4" noValidate>
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
                <ValidationMessage message={error} />
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 ">COMPUTE sRPE LOAD</Button>
                  <Button type="button" variant="outline" onClick={handleReset} className="flex-1">Reset</Button>
                </div>
              </form>
            </CardContent>
          </Card>
          {sRpeResult && <ResultCard result={sRpeResult} />}

          <Card>
            <CardHeader>
              <CardTitle>Acwr (Acute:chronic Workload)</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAcwr} className="space-y-4" noValidate>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="acute">Acute Load (1-week)</Label>
                    <Input id="acute" type="number" step="0.1" value={acute} onChange={e => setAcute(e.target.value)} required />
                  </div>
                  <div>
                    <Label htmlFor="chronic">Chronic Load (4-week avg)</Label>
                    <Input id="chronic" type="number" step="0.1" value={chronic} onChange={e => setChronic(e.target.value)} required />
                  </div>
                </div>
                <ValidationMessage message={error} />
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 ">Calculate</Button>
                  <Button type="button" variant="outline" onClick={handleReset} className="flex-1">Reset</Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {acwrResult && (
            <div className="h-full">
              <ResultCard result={acwrResult} />
            </div>
          )}
        </div>

        <div className="space-y-6 flex flex-col h-full">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWeeklyDist} className="space-y-4" noValidate>
                <div>
                  <Label htmlFor="weeklyDistances">Daily Distances (comma separated)</Label>
                  <Input id="weeklyDistances" value={weeklyDistances} onChange={e => setWeeklyDistances(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="longRunDist">Long Run Distance</Label>
                  <Input id="longRunDist" type="number" step="0.1" value={longRunDist} onChange={e => setLongRunDist(e.target.value)} required />
                </div>
                <ValidationMessage message={error} />
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 ">Calculate</Button>
                  <Button type="button" variant="outline" onClick={handleReset} className="flex-1">Reset</Button>
                </div>
              </form>
            </CardContent>
          </Card>
          {weeklyDistResult && <ResultCard result={{...weeklyDistResult, result: (
            <div className="w-full space-y-4 text-xs font-mono">
              <div className="flex justify-between items-center bg-zinc-950/80 p-4 border border-zinc-800 rounded-none">
                <span className="text-[10px] uppercase text-zinc-500 tracking-widest">Weekly Total</span>
                <span className="text-xl font-bold text-cyan-400">{weeklyDistances.split(',').reduce((a,b)=>a+parseFloat(b),0)} units</span>
              </div>
            </div>
          )}} />}

          <Card>
            <CardHeader>
              <CardTitle>Monotony & Strain</CardTitle>
              <CardDescription>Monotony = mean / standard deviation of daily load</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMonotony} className="space-y-4" noValidate>
                <div>
                  <Label htmlFor="dailyLoads">Daily Loads (comma separated)</Label>
                  <Input id="dailyLoads" value={dailyLoads} onChange={e => setDailyLoads(e.target.value)} required />
                  <div className="text-xs text-zinc-500 mt-1">Example: 7 days of sRPE (duration × RPE)</div>
                </div>
                <ValidationMessage message={error} />
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 ">Calculate</Button>
                  <Button type="button" variant="outline" onClick={handleReset} className="flex-1">Reset</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {monotonyResult && (
            <div className="h-full">
              <ResultCard result={{...monotonyResult, result: (
                <div className="w-full space-y-4">
                  <div className="flex flex-col items-center p-4 bg-zinc-950/80 border border-zinc-800 rounded-none">
                    <span className="text-zinc-500 text-[10px] mb-1 tracking-widest block uppercase font-mono">Training Monotony</span>
                    <span className="font-mono text-3xl font-bold text-cyan-400">
                      {calcMonotony(dailyLoads.split(',').map(s=>parseFloat(s)).filter(n=>!isNaN(n))).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-zinc-950/80 border border-zinc-800 rounded-none">
                    <span className="text-zinc-500 text-[10px] mb-1 tracking-widest block uppercase font-mono">Training Strain</span>
                    <span className="font-mono text-xl font-bold text-cyan-400">
                      {Math.round(calcStrain(dailyLoads.split(',').map(s=>parseFloat(s)).filter(n=>!isNaN(n)).reduce((a,b)=>a+b,0), calcMonotony(dailyLoads.split(',').map(s=>parseFloat(s)).filter(n=>!isNaN(n)))))}
                    </span>
                  </div>
                </div>
              )}} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input, Label, Button } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { acwr as calcAcwr, monotony as calcMonotony, strain as calcStrain } from '@/lib/calculators';
import { methodRegistry } from '@/data';
import { CalculatorResult } from '@/types';

export default function LoadLabPage() {
  const [acute, setAcute] = useState('500');
  const [chronic, setChronic] = useState('450');
  const [acwrResult, setAcwrResult] = useState<CalculatorResult<string> | null>(null);

  const [dailyLoads, setDailyLoads] = useState('50, 100, 0, 120, 0, 80, 150');
  const [monotonyResult, setMonotonyResult] = useState<CalculatorResult<any> | null>(null);

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
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Load Lab</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Calculate Training Load metrics such as ACWR, Monotony, and Strain.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ACWR (Acute:Chronic Workload)</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAcwr} className="space-y-4">
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
                <Button type="submit" className="w-full">Calculate ACWR</Button>
              </form>
            </CardContent>
          </Card>
          
          {acwrResult && (
            <ResultCard result={acwrResult} />
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monotony & Strain</CardTitle>
              <CardDescription>Monotony = mean / standard deviation of daily load</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMonotony} className="space-y-4">
                <div>
                  <Label htmlFor="dailyLoads">Daily Loads (comma separated)</Label>
                  <Input id="dailyLoads" value={dailyLoads} onChange={e => setDailyLoads(e.target.value)} required />
                  <div className="text-xs text-zinc-500 mt-1">Example: 7 days of sRPE (duration × RPE)</div>
                </div>
                <Button type="submit" className="w-full">Calculate Monotony & Strain</Button>
              </form>
            </CardContent>
          </Card>

          {monotonyResult && (
            <ResultCard result={monotonyResult} />
          )}
        </div>
      </div>
    </div>
  );
}

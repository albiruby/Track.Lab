'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input, Label, Button } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { acwr as calcAcwr, monotony as calcMonotony, strain as calcStrain } from '@/lib/calculators_pack/load';

export default function LoadLabPage() {
  const [acute, setAcute] = useState('500');
  const [chronic, setChronic] = useState('450');
  const [acwrResult, setAcwrResult] = useState<{result: string, label: string} | null>(null);

  const [dailyLoads, setDailyLoads] = useState('50, 100, 0, 120, 0, 80, 150');
  const [monotonyResult, setMonotonyResult] = useState<any>(null);

  const handleAcwr = (e: React.FormEvent) => {
    e.preventDefault();
    const a = parseFloat(acute);
    const c = parseFloat(chronic);
    if (!isNaN(a) && !isNaN(c) && c > 0) {
      const res = calcAcwr(a, c).toFixed(2);
      setAcwrResult({ result: res, label: 'Acute:Chronic Workload Ratio' });
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
        
        setMonotonyResult({
          monotony: mon.toFixed(2),
          strain: Math.round(str)
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
            <Card>
              <CardContent className="pt-6 flex flex-col items-center">
                <span className="text-zinc-500 mb-1">{acwrResult.label}</span>
                <span className="font-mono text-3xl font-bold text-zinc-900 dark:text-zinc-100">{acwrResult.result}</span>
                <span className="text-xs text-zinc-400 mt-2">Optimal range ~ 0.8 - 1.3</span>
              </CardContent>
            </Card>
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
            <Card>
              <CardContent className="pt-6 flex flex-col gap-4 items-center">
                <div className="text-center w-full bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-lg">
                  <span className="text-zinc-500 text-sm mb-1 block">Training Monotony</span>
                  <span className="font-mono text-2xl font-bold text-zinc-900 dark:text-zinc-100">{monotonyResult.monotony}</span>
                  <span className="text-xs text-zinc-400 block mt-1">High (&gt; 2.0) indicates lack of variation (risk).</span>
                </div>
                <div className="text-center w-full bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-lg">
                  <span className="text-zinc-500 text-sm mb-1 block">Training Strain</span>
                  <span className="font-mono text-xl font-bold text-zinc-900 dark:text-zinc-100">{monotonyResult.strain}</span>
                  <span className="text-xs text-zinc-400 block mt-1">Total Load × Monotony</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

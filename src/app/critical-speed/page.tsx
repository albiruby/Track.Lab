'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input, Label, Button, Select } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { twoPointCriticalSpeed, paceSecondsPerKmFromSpeedMetersPerSecond, timeToExhaustionAboveCs } from '@/lib/calculators';
import { formatPace, formatSecondsToTimeString, parseTimeStringToSeconds } from '@/lib/formatters/time';
import { methodRegistry } from '@/data';
import { CalculatorResult } from '@/types';

export default function CriticalSpeedPage() {
  const [d1, setD1] = useState('1200');
  const [t1, setT1] = useState('04:00');
  const [d2, setD2] = useState('3000');
  const [t2, setT2] = useState('11:00');
  
  const [csResult, setCsResult] = useState<CalculatorResult<any> | null>(null);

  const [csInput, setCsInput] = useState('');
  const [dPrimeInput, setDPrimeInput] = useState('');
  const [targetPace, setTargetPace] = useState('');
  const [tteResult, setTteResult] = useState<CalculatorResult<any> | null>(null);

  const calculateTte = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cs = parseFloat(csInput);
      const dp = parseFloat(dPrimeInput);
      const pacing = parseTimeStringToSeconds(targetPace);

      if (cs > 0 && dp > 0 && pacing > 0) {
        const targetSpeedMetersPerSecond = 1000 / pacing;
        
        if (targetSpeedMetersPerSecond <= cs) {
           throw new Error("Target speed must be strictly above CS for D-prime depletion.");
        }

        const tTteStr = timeToExhaustionAboveCs(dp, targetSpeedMetersPerSecond, cs);
        
        setTteResult({
          result: (
            <div className="space-y-4 w-full">
              <div className="flex justify-between items-center bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-lg">
                <span className="text-sm font-semibold uppercase text-zinc-500">Max Time</span>
                <span className="text-xl font-bold font-mono">{formatSecondsToTimeString(Math.round(tTteStr))}</span>
              </div>
            </div>
          ),
          inputUsed: { 'CS (m/s)': cs, 'D-Prime (m)': dp, 'Target Pace': targetPace },
          methodSelected: 'Time to Exhaustion',
          formulaUsed: 'TTE = D-Prime / (Target Speed - CS)',
          confidenceLabel: 'mathematical',
          limitations: 'Assumes continuous effort. Highly susceptible to pacing variation and fatigue state.'
        });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const calculate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const d1m = parseFloat(d1);
      const d2m = parseFloat(d2);
      const t1s = parseTimeStringToSeconds(t1);
      const t2s = parseTimeStringToSeconds(t2);

      if (d1m > 0 && d2m > 0 && t1s > 0 && t2s > 0) {
        const { csMetersPerSecond, dPrimeMeters } = twoPointCriticalSpeed(d1m, t1s, d2m, t2s);
        const csPace = formatPace(1000 / csMetersPerSecond);
        
        const methodMeta = methodRegistry.find((m) => m.id === 'cs_two_point')!;
        
        setCsResult({
          result: (
            <div className="space-y-4 w-full">
              <div className="flex justify-between items-center bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-lg">
                <span className="text-sm font-semibold uppercase text-zinc-500">Critical Speed (CS)</span>
                <span className="text-xl font-bold font-mono">{csPace}</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-lg">
                <span className="text-sm font-semibold uppercase text-zinc-500">D-Prime (D&apos;)</span>
                <span className="text-xl font-bold font-mono">{dPrimeMeters.toFixed(1)} m</span>
              </div>
            </div>
          ),
          inputUsed: { 'D1 (m)': d1m, 'T1': t1, 'D2 (m)': d2m, 'T2': t2 },
          methodSelected: methodMeta.name,
          formulaUsed: methodMeta.formulaDisplay,
          confidenceLabel: methodMeta.precision?.replace('_', ' ') || 'field test',
          limitations: Array.isArray(methodMeta.limitations) ? methodMeta.limitations.join(' ') : String(methodMeta.limitations || '')
        });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Critical Speed Lab</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Calculate your anaerobic threshold and D-prime using time trial results.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>2-Point CS Calculator</CardTitle>
            <CardDescription>Enter two maximal efforts of different durations (e.g. 3-4 min vs 10-15 min).</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={calculate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="d1">Trial 1 Distance (m)</Label>
                  <Input id="d1" type="number" step="any" value={d1} onChange={e => setD1(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="t1">Trial 1 Time (mm:ss)</Label>
                  <Input id="t1" type="text" placeholder="hh:mm:ss" value={t1} onChange={e => setT1(e.target.value)} required />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="d2">Trial 2 Distance (m)</Label>
                  <Input id="d2" type="number" step="any" value={d2} onChange={e => setD2(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="t2">Trial 2 Time (mm:ss)</Label>
                  <Input id="t2" type="text" placeholder="hh:mm:ss" value={t2} onChange={e => setT2(e.target.value)} required />
                </div>
              </div>

              <Button type="submit" className="w-full">Calculate</Button>
            </form>
          </CardContent>
        </Card>

        {csResult && (
          <ResultCard result={csResult} />
        )}

        <Card>
          <CardHeader>
            <CardTitle>Time to Exhaustion (Above CS)</CardTitle>
            <CardDescription>Calculate maximum sustainable time at a specific pace above your Critical Speed.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={calculateTte} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="csInput">Critical Speed (m/s)</Label>
                  <Input id="csInput" type="number" step="any" value={csInput} onChange={e => setCsInput(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dPrimeInput">D-Prime (m)</Label>
                  <Input id="dPrimeInput" type="number" step="any" value={dPrimeInput} onChange={e => setDPrimeInput(e.target.value)} required />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="targetPace">Target Pace (mm:ss/km)</Label>
                <Input id="targetPace" type="text" placeholder="04:00" value={targetPace} onChange={e => setTargetPace(e.target.value)} required />
              </div>

              <Button type="submit" className="w-full">Calculate TTE</Button>
            </form>
          </CardContent>
        </Card>

        {tteResult && (
          <ResultCard result={tteResult} />
        )}
      </div>
    </div>
  );
}

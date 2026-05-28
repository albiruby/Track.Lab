'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input, Label, Button } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { LabPageHeader } from '@/components/layout/LabPageHeader';

export default function RecoveryCheckLab() {
  const [sleepStart, setSleepStart] = useState('22:00');
  const [sleepEnd, setSleepEnd] = useState('06:00');
  const [baseRhr, setBaseRhr] = useState('');
  const [todayRhr, setTodayRhr] = useState('');
  const [baseHrv, setBaseHrv] = useState('');
  const [todayHrv, setTodayHrv] = useState('');
  const [baseW, setBaseW] = useState('');
  const [todayW, setTodayW] = useState('');
  const [sessionDur, setSessionDur] = useState('');
  const [sessionRpe, setSessionRpe] = useState('');
  const [result, setResult] = useState<any | null>(null);

  const calculateSleepDuration = (start: string, end: string) => {
    if (!start || !end) return null;
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return null;
    
    let t1 = h1 * 60 + m1;
    let t2 = h2 * 60 + m2;
    if (t2 < t1) t2 += 24 * 60; // crossed midnight

    const diff = t2 - t1;
    const hrs = Math.floor(diff / 60);
    const mins = diff % 60;
    return `${hrs}h ${mins}m`;
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    
    let stats = [];
    
    const sleepDur = calculateSleepDuration(sleepStart, sleepEnd);
    if (sleepDur) {
      stats.push(`Sleep Duration: ${sleepDur}`);
    }

    const bRhr = parseFloat(baseRhr);
    const tRhr = parseFloat(todayRhr);
    if (!isNaN(bRhr) && !isNaN(tRhr)) {
      const delta = tRhr - bRhr;
      stats.push(`RHR Delta: ${delta > 0 ? '+' : ''}${delta.toFixed(1)} bpm`);
    }

    const bHrv = parseFloat(baseHrv);
    const tHrv = parseFloat(todayHrv);
    if (!isNaN(bHrv) && !isNaN(tHrv) && bHrv > 0) {
      const delta = ((tHrv - bHrv) / bHrv) * 100;
      stats.push(`HRV Change: ${delta > 0 ? '+' : ''}${delta.toFixed(1)}%`);
    }

    const bW = parseFloat(baseW);
    const tW = parseFloat(todayW);
    if (!isNaN(bW) && !isNaN(tW) && bW > 0) {
      const delta = ((tW - bW) / bW) * 100;
      stats.push(`Body Mass Change: ${delta > 0 ? '+' : ''}${delta.toFixed(2)}%`);
    }

    const dur = parseFloat(sessionDur);
    const rpe = parseFloat(sessionRpe);
    if (!isNaN(dur) && !isNaN(rpe) && dur > 0) {
      stats.push(`sRPE Load: ${(dur * rpe).toFixed(0)}`);
    }

    if (stats.length === 0) return;

    setResult({
      result: stats.join('\n'),
      methodSelected: 'Recovery Delta Math',
      confidenceLabel: 'exact calculation',
      formulaUsed: 'Delta = Today - Baseline | % = Delta / Baseline * 100',
      inputUsed: { checked: stats.length + ' metrics' },
      limitations: 'Self-check only. Not medical advice. Not diagnosis. Not injury prediction.'
    });
  };

  return (
    <div className="space-y-6">
      <LabPageHeader title="RECOVERY CHECK LAB" subtitle="Evaluate basic readiness metric deltas (RHR, HRV, mass, sleep)." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Calculate Deltas</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCalculate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Sleep Start</Label>
                  <Input type="time" value={sleepStart} onChange={e => setSleepStart(e.target.value)} />
                </div>
                <div>
                  <Label>Sleep End</Label>
                  <Input type="time" value={sleepEnd} onChange={e => setSleepEnd(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Baseline RHR (bpm)</Label>
                  <Input type="number" value={baseRhr} onChange={e => setBaseRhr(e.target.value)} />
                </div>
                <div>
                  <Label>Today RHR</Label>
                  <Input type="number" value={todayRhr} onChange={e => setTodayRhr(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Baseline HRV (ms)</Label>
                  <Input type="number" value={baseHrv} onChange={e => setBaseHrv(e.target.value)} />
                </div>
                <div>
                  <Label>Today HRV</Label>
                  <Input type="number" value={todayHrv} onChange={e => setTodayHrv(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Baseline Weight (kg)</Label>
                  <Input type="number" step="0.1" value={baseW} onChange={e => setBaseW(e.target.value)} />
                </div>
                <div>
                  <Label>Today Weight</Label>
                  <Input type="number" step="0.1" value={todayW} onChange={e => setTodayW(e.target.value)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <div>
                  <Label>Session Duration (min)</Label>
                  <Input type="number" value={sessionDur} onChange={e => setSessionDur(e.target.value)} />
                </div>
                <div>
                  <Label>Session RPE (1-10)</Label>
                  <Input type="number" max="10" min="1" value={sessionRpe} onChange={e => setSessionRpe(e.target.value)} />
                </div>
              </div>

              <Button type="submit" className="w-full mt-4">Calculate</Button>
            </form>
          </CardContent>
        </Card>

        <div className="h-full">
          {result && (
            <ResultCard result={result} />
          )}
        </div>
      </div>
    </div>
  );
}

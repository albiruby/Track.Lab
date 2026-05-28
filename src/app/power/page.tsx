'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input, Label, Button } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { LabPageHeader } from '@/components/layout/LabPageHeader';

export default function PowerLab() {
  const [power, setPower] = useState('300');
  const [weight, setWeight] = useState('70');
  const [hr, setHr] = useState('');
  const [speed, setSpeed] = useState('');
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');
  const [result, setResult] = useState<any | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseFloat(power);
    const w = parseFloat(weight);
    
    if (isNaN(p) || p <= 0 || isNaN(w) || w <= 0) return;

    let stats = [
      `Power to Weight: ${(p / w).toFixed(2)} W/kg`
    ];

    const heartRate = parseFloat(hr);
    if (!isNaN(heartRate) && heartRate > 0) {
      stats.push(`Power-to-HR Efficiency (EF): ${(p / heartRate).toFixed(2)} W/bpm`);
    }

    const spdKmh = parseFloat(speed);
    if (!isNaN(spdKmh) && spdKmh > 0) {
      const spdMs = (spdKmh * 1000) / 3600;
      stats.push(`Speed-to-Power Efficiency: ${(spdMs / (p / w)).toFixed(3)} (m/s) per W/kg`);
    }

    const firstHalf = parseFloat(p1);
    const secondHalf = parseFloat(p2);
    if (!isNaN(firstHalf) && !isNaN(secondHalf) && firstHalf > 0) {
      const drift = ((secondHalf - firstHalf) / firstHalf) * 100;
      stats.push(`Power Drift: ${drift > 0 ? '+' : ''}${drift.toFixed(2)}%`);
    }

    setResult({
      result: stats.join('\n'),
      methodSelected: 'Running Power Math',
      confidenceLabel: 'exact calculation',
      formulaUsed: 'W/kg = P/W | EF = P/HR | Drift = (P2-P1)/P1*100',
      inputUsed: { power: p + ' W', weight: w + ' kg' },
      limitations: 'Requires user-provided running power data. Track.Lab does not generate power data.'
    });
  };

  return (
    <div className="space-y-6">
      <LabPageHeader title="POWER LAB" subtitle="Running power metrics, efficiency, and W/kg." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Calculate Power Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCalculate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="power">Average Power (W)</Label>
                  <Input 
                    id="power" type="number" required
                    value={power} onChange={e => setPower(e.target.value)} 
                  />
                </div>
                <div>
                  <Label htmlFor="weight">Body Weight (kg)</Label>
                  <Input 
                    id="weight" type="number" required
                    value={weight} onChange={e => setWeight(e.target.value)} 
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="hr">Average HR (bpm, optional)</Label>
                <Input 
                  id="hr" type="number"
                  value={hr} onChange={e => setHr(e.target.value)} 
                />
              </div>

              <div>
                <Label htmlFor="speed">Average Speed (km/h, optional)</Label>
                <Input 
                  id="speed" type="number" step="0.1"
                  value={speed} onChange={e => setSpeed(e.target.value)} 
                />
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <Label>Power Drift (optional)</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Input 
                    placeholder="First half avg power" type="number"
                    value={p1} onChange={e => setP1(e.target.value)} 
                  />
                  <Input 
                    placeholder="Second half avg power" type="number"
                    value={p2} onChange={e => setP2(e.target.value)} 
                  />
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

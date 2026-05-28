'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input, Label, Button } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { LabPageHeader } from '@/components/layout/LabPageHeader';

export default function TrailElevationLab() {
  const [distance, setDistance] = useState('5');
  const [gain, setGain] = useState('200');
  const [duration, setDuration] = useState('30');
  const [reps, setReps] = useState('');
  const [repGain, setRepGain] = useState('');
  const [result, setResult] = useState<any | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const d = parseFloat(distance);
    const g = parseFloat(gain);
    const dur = parseFloat(duration);

    if (isNaN(d) || d <= 0 || isNaN(g) || g < 0) return;

    const grade = (g / (d * 1000)) * 100;
    const gainPerKm = g / d;
    
    let stats = [
      `Avg Grade: ${grade.toFixed(1)}%`,
      `Gain: ${gainPerKm.toFixed(0)} m/km`
    ];

    if (!isNaN(dur) && dur > 0) {
      const vertSpeed = g / (dur / 60); // m/hr
      stats.push(`Vertical Speed: ${vertSpeed.toFixed(0)} m/hr`);
    }

    const r = parseInt(reps);
    const rg = parseFloat(repGain);
    if (!isNaN(r) && !isNaN(rg) && r > 0 && rg > 0) {
      stats.push(`Hill Repeat Total Gain: ${r * rg} m`);
    }

    setResult({
      result: stats.join('\n'),
      methodSelected: 'Basic Trail & Elevation Math',
      confidenceLabel: 'exact',
      formulaUsed: 'Grade = (Gain / Distance) * 100 | Vert Speed = Gain / Hours',
      inputUsed: { distance: d + ' km', gain: g + ' m' },
      limitations: 'Terrain estimate only. Actual effort depends on surface, technicality, descent, weather, and skill.'
    });
  };

  return (
    <div className="space-y-6">
      <LabPageHeader title="TRAIL ELEVATION METRICS" subtitle="Calculate grade, elevation gain per km, and vertical speed." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Calculate Terrain Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCalculate} className="space-y-4">
              <div>
                <Label htmlFor="distance">Distance (km)</Label>
                <Input 
                  id="distance" type="number" step="0.1" required
                  value={distance} onChange={e => setDistance(e.target.value)} 
                />
              </div>

              <div>
                <Label htmlFor="gain">Total Elevation Gain (m)</Label>
                <Input 
                  id="gain" type="number" required
                  value={gain} onChange={e => setGain(e.target.value)} 
                />
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes, optional)</Label>
                <Input 
                  id="duration" type="number" step="1"
                  value={duration} onChange={e => setDuration(e.target.value)} 
                />
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <Label>Hill Repeats (optional)</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <Input 
                    placeholder="Reps" type="number"
                    value={reps} onChange={e => setReps(e.target.value)} 
                  />
                  <Input 
                    placeholder="Gain/rep (m)" type="number"
                    value={repGain} onChange={e => setRepGain(e.target.value)} 
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

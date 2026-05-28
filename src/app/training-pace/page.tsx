'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input, Label, Button, Select } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { paceSecondsPerKm } from '@/lib/calculators_pack/pace';
import { formatPace, parseTimeStringToSeconds } from '@/lib/formatters/time';
import { riegelPredictTime } from '@/lib/calculators_pack/racePrediction';

export default function TrainingPaceLab() {
  const [distance, setDistance] = useState('10');
  const [timeStr, setTimeStr] = useState('50:00');
  const [result, setResult] = useState<any | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const d = parseFloat(distance);
    const secs = parseTimeStringToSeconds(timeStr);
    
    if (isNaN(d) || d <= 0 || isNaN(secs) || secs <= 0) return;

    // Estimate threshold pace as roughly 10k to 15k pace
    // Let's use Riegel to find equivalent 10km pace as a generic "Threshold" anchor
    // If the input is exactly 10k, it uses it. Otherwise predicts it.
    const expected10kSeconds = d === 10 ? secs : riegelPredictTime(secs, d * 1000, 10000, 1.06);
    const thresholdSecsPerKm = expected10kSeconds / 10;
    
    // Derived simple offsets
    const paces = [
      { name: "Recovery", pace: thresholdSecsPerKm * 1.30 },
      { name: "Easy", pace: thresholdSecsPerKm * 1.20 },
      { name: "Long Run", pace: thresholdSecsPerKm * 1.15 },
      { name: "Steady", pace: thresholdSecsPerKm * 1.08 },
      { name: "Marathon (Est)", pace: thresholdSecsPerKm * 1.05 },
      { name: "Threshold", pace: thresholdSecsPerKm },
      { name: "Interval", pace: thresholdSecsPerKm * 0.94 },
      { name: "Repetition", pace: thresholdSecsPerKm * 0.88 },
    ];

    const outStrings = paces.map(p => `${p.name}: ${formatPace(p.pace)} /km`);

    setResult({
      result: outStrings.join('\n'),
      methodSelected: 'Race-Derived Generic Pace Zones',
      confidenceLabel: 'estimate',
      formulaUsed: 'Threshold anchored to ~10K pace, with fixed percentage multipliers.',
      inputUsed: { distance: d + ' km', time: timeStr },
      limitations: 'Goal-based pace may be too aggressive if current fitness is lower. These are mathematical approximations.'
    });
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Training Pace Lab
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl text-lg">
          Determine optimal paces for different types of training runs based on current fitness.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Calculate Training Paces</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCalculate} className="space-y-4">
              <div>
                <Label htmlFor="distance">Recent Race Distance (km)</Label>
                <Input 
                  id="distance" type="number" step="0.1" required
                  value={distance} onChange={e => setDistance(e.target.value)} 
                />
              </div>

              <div>
                <Label htmlFor="timeStr">Recent Race Time (HH:MM:SS or MM:SS)</Label>
                <Input 
                  id="timeStr" type="text" required
                  placeholder="50:00"
                  pattern="^(\d{1,2}:)?([0-5]?\d):([0-5]?\d)$"
                  value={timeStr} onChange={e => setTimeStr(e.target.value)} 
                />
              </div>

              <Button type="submit" className="w-full">Calculate Paces</Button>
            </form>
          </CardContent>
        </Card>

        <div>
          {result && (
            <ResultCard result={result} />
          )}
        </div>
      </div>
    </div>
  );
}

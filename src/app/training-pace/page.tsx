'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input, Label, Button, Select, ValidationMessage } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { LabPageHeader } from '@/components/layout/LabPageHeader';
import { paceSecondsPerKm } from '@/lib/calculators_pack/pace';
import { formatPace, parseDurationToSeconds , safeNumber } from '@/lib/formatters/time';
import { riegelPredictTime } from '@/lib/calculators_pack/racePrediction';

export default function TrainingPaceLab() {
  const [distance, setDistance] = useState('10');
  const [timeStr, setTimeStr] = useState('50:00');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const handleReset = () => {
    setDistance('10');
    setTimeStr('50:00');
    setResult(null);
    setError(null);
  };
  
  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const d = safeNumber(distance);
    const secs = parseDurationToSeconds(timeStr);
    
    if (d === null || d <= 0) return setError('Please enter a valid distance.');
    if (secs === null || secs <= 0) return setError('Please enter a valid time (MM:SS or HH:MM:SS).');

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

    const maxPace = Math.max(...paces.map(p => p.pace));
    const minPace = Math.min(...paces.map(p => p.pace));
    
    // Reverse it so fast is at top or bottom? Usually fast at top (small pace)
    
    const outTable = (
      <div className="flex flex-col pt-2 w-full gap-5">
        {paces.map((p, i) => {
          // Calculate reverse width (faster pace = wider bar, or slower pace = wider bar?)
          // Longer the pace (more seconds), the slower it is.
          // Let's make faster paces have smaller widths, or longer widths. 
          // 100% width = Recovery
          const widthPct = Math.min(100, (p.pace / paces[0].pace) * 100);
          
          return (
          <div key={i} className="flex flex-col gap-1.5 w-full">
            <div className="flex justify-between items-baseline">
              <span className="font-bold tracking-wider text-sm uppercase">{p.name}</span>
              <span className="font-mono text-primary font-bold">{formatPace(p.pace)}</span>
            </div>
            <div className="w-full h-8 bg-neutral-200 border-2 border-border-heavy rounded-lg overflow-hidden flex items-stretch">
               <div className="bg-primary/90 border-r-2 border-border-heavy" style={{ width: `${widthPct}%` }} />
            </div>
          </div>
          );
        })}
      </div>
    );

    setResult({
      result: outTable,
      methodSelected: 'Race-Derived Generic Pace Zones',
      confidenceLabel: 'estimate',
      formulaUsed: 'Threshold anchored to ~10K pace, with fixed percentage multipliers.',
      inputUsed: { distance: d + ' km', time: timeStr },
      limitations: 'Goal-based pace may be too aggressive if current fitness is lower. These are mathematical approximations.'
    });
  };

  return (
    <div className="space-y-6 pb-10">
      <LabPageHeader title="Training Pace Lab" subtitle="Determine optimal paces for different types of training runs based on current fitness." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Recent Race</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCalculate} className="space-y-4" noValidate>
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
                 
                  value={timeStr} onChange={e => setTimeStr(e.target.value)} 
                />
              </div>

              <ValidationMessage message={error} />
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 ">Calculate</Button>
                  <Button type="button" variant="outline" onClick={handleReset} className="flex-1">Reset</Button>
                </div>
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

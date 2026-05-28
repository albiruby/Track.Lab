'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Label, Button } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { calculateRiegelPrediction } from '@/lib/calculators';
import { formatSecondsToTimeString, parseTimeStringToSeconds } from '@/lib/formatters/time';

export default function RaceLabPage() {
  const [d1, setD1] = useState('5');
  const [t1, setT1] = useState('20:00');
  const [d2, setD2] = useState('10');
  const [result, setResult] = useState<ReturnType<typeof calculateRiegelPrediction> | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const d1v = parseFloat(d1);
    const d2v = parseFloat(d2);
    const t1v = parseTimeStringToSeconds(t1);
    
    if (!isNaN(d1v) && d1v > 0 && !isNaN(d2v) && d2v > 0 && t1v > 0) {
      setResult(calculateRiegelPrediction(d1v, t1v, d2v));
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Race Lab</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Predict race finish times using Peter Riegel&apos;s formula.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Riegel Predictor</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCalculate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="d1">Recent Distance (km)</Label>
                    <Input 
                      id="d1" 
                      type="number" 
                      step="0.01" 
                      min="0.1" 
                      value={d1} 
                      onChange={(e) => setD1(e.target.value)} 
                      required 
                      autoComplete="off"
                    />
                  </div>
                  <div>
                    <Label htmlFor="t1">Recent Time</Label>
                    <Input 
                      id="t1" 
                      type="text" 
                      pattern="^(\\d{1,2}:)?([0-5]?\\d):([0-5]?\\d)$"
                      placeholder="HH:MM:SS"
                      value={t1} 
                      onChange={(e) => setT1(e.target.value)} 
                      required 
                      autoComplete="off"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="d2">Target Distance (km)</Label>
                  <Input 
                    id="d2" 
                    type="number" 
                    step="0.01" 
                    min="0.1" 
                    value={d2} 
                    onChange={(e) => setD2(e.target.value)} 
                    required 
                    autoComplete="off"
                  />
                  <div className="mt-2 text-xs text-zinc-500">
                    Common: 5K = 5, 10K = 10, Half Marathon = 21.1, Marathon = 42.2
                  </div>
                </div>
                <Button type="submit" className="w-full">Predict Target Time</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          {result && (
            <ResultCard 
              result={{
                ...result,
                result: formatSecondsToTimeString(result.result)
              }} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

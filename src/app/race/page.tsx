'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Label, Button } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { LabPageHeader } from '@/components/layout/LabPageHeader';
import { calculateRiegelPrediction } from '@/lib/calculators';
import { formatSecondsToTimeString, parseTimeStringToSeconds } from '@/lib/formatters/time';

export default function RaceLabPage() {
  const [d1, setD1] = useState('5');
  const [t1, setT1] = useState('20:00');
  const [d2, setD2] = useState('10');
  const [exponent, setExponent] = useState('1.06');
  const [result, setResult] = useState<ReturnType<typeof calculateRiegelPrediction> | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const d1v = parseFloat(d1);
    const d2v = parseFloat(d2);
    const t1v = parseTimeStringToSeconds(t1);
    const expv = parseFloat(exponent);
    
    if (!isNaN(d1v) && d1v > 0 && !isNaN(d2v) && d2v > 0 && t1v > 0 && !isNaN(expv) && expv > 0) {
      setResult(calculateRiegelPrediction(d1v, t1v, d2v, expv));
    }
  };

  return (
    <div className="space-y-6">
      <LabPageHeader title="RACE PROJECTION" subtitle="Predict race finish times using Peter Riegel's formula." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-6 flex flex-col h-full">
          <Card>
            <CardHeader>
              <CardTitle>RIEGEL PREDICTOR</CardTitle>
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
                <div>
                  <Label htmlFor="exponent">Fatigue Factor (Exponent)</Label>
                  <Input 
                    id="exponent" 
                    type="number" 
                    step="0.01" 
                    min="1.0" 
                    value={exponent} 
                    onChange={(e) => setExponent(e.target.value)} 
                    required 
                    autoComplete="off"
                  />
                  <div className="mt-2 text-xs text-zinc-500">
                    Default 1.06. Use 1.05 for elites, 1.07+ for novices or trails.
                  </div>
                </div>
                <Button type="submit" className="w-full mt-4">COMPUTE MATRIX</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="h-full">
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

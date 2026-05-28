'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Label, Button } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { LabPageHeader } from '@/components/layout/LabPageHeader';
import { calculateIntervalWorkout } from '@/lib/calculators';
import { formatSecondsToTimeString, parseTimeStringToSeconds } from '@/lib/formatters/time';

export default function WorkoutLabPage() {
  const [reps, setReps] = useState('6');
  const [distance, setDistance] = useState('0.8');
  const [pace, setPace] = useState('3:45');
  const [rest, setRest] = useState('1:30');
  const [result, setResult] = useState<ReturnType<typeof calculateIntervalWorkout> | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const r = parseInt(reps);
    const d = parseFloat(distance);
    const p = parseTimeStringToSeconds(pace);
    const restSecs = parseTimeStringToSeconds(rest);

    if (!isNaN(r) && r > 0 && !isNaN(d) && d > 0 && p > 0 && restSecs >= 0) {
      setResult(calculateIntervalWorkout(r, d, p, restSecs));
    }
  };

  return (
    <div className="space-y-6">
      <LabPageHeader title="SESSION KINEMATICS" subtitle="Calculate session volume and duration for structured interval workouts." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-6 flex flex-col h-full">
          <Card>
            <CardHeader>
              <CardTitle>INTERVAL SESSION MATH</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCalculate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reps">Number of Reps</Label>
                    <Input 
                      id="reps" 
                      type="number" 
                      min="1" 
                      value={reps} 
                      onChange={(e) => setReps(e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="distance">Dist. per Rep (km)</Label>
                    <Input 
                      id="distance" 
                      type="number" 
                      step="0.01" 
                      min="0.01" 
                      value={distance} 
                      onChange={(e) => setDistance(e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="pace">Pace per Rep ( /km)</Label>
                    <Input 
                      id="pace" 
                      type="text" 
                      pattern="^(\\d{1,2}:)?([0-5]?\\d):([0-5]?\\d)$"
                      placeholder="MM:SS"
                      value={pace} 
                      onChange={(e) => setPace(e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="rest">Rest Duration</Label>
                    <Input 
                      id="rest" 
                      type="text" 
                      pattern="^(\\d{1,2}:)?([0-5]?\\d):([0-5]?\\d)$"
                      placeholder="MM:SS"
                      value={rest} 
                      onChange={(e) => setRest(e.target.value)} 
                      required 
                    />
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
                result: (
                  <div className="w-full space-y-3 text-xs font-mono uppercase tracking-widest text-zinc-500">
                    <div className="flex justify-between border-b border-zinc-800 pb-2">
                      <span>Rep Time</span>
                      <span className="text-cyan-400">{formatSecondsToTimeString(result.result.repTimeSeconds)}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800 pb-2">
                      <span>Total Work Time</span>
                      <span className="text-cyan-400">{formatSecondsToTimeString(result.result.totalWorkSeconds)}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800 pb-2">
                      <span>Total Rest Time</span>
                      <span className="text-cyan-400">{formatSecondsToTimeString(result.result.totalRestSeconds)}</span>
                    </div>
                    <div className="flex justify-between border-b border-zinc-800 pb-2">
                      <span>Rep Volume (km)</span>
                      <span className="text-cyan-400">{result.result.sessionDistanceKm.toFixed(2)} km</span>
                    </div>
                    <div className="flex justify-between pt-2">
                      <span className="text-zinc-300">Total Time</span>
                      <span className="font-bold text-cyan-400 text-lg shadow-cyan-400/20 drop-shadow-md">{formatSecondsToTimeString(result.result.totalSessionSeconds)}</span>
                    </div>
                  </div>
                )
              }} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

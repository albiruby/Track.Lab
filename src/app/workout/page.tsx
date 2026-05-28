'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Label, Button, ValidationMessage } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { LabPageHeader } from '@/components/layout/LabPageHeader';
import { calculateIntervalWorkout } from '@/lib/calculators';
import { formatSecondsToTimeString, parseDurationToSeconds , safeNumber } from '@/lib/formatters/time';

export default function WorkoutLabPage() {
  const [reps, setReps] = useState('6');
  const [distance, setDistance] = useState('0.8');
  const [pace, setPace] = useState('3:45');
  const [rest, setRest] = useState('1:30');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReturnType<typeof calculateIntervalWorkout> | null>(null);

  const handleReset = () => {
    setReps('6');
    setDistance('0.8');
    setPace('3:45');
    setRest('1:30');
    setResult(null);
    setError(null);
  };
  
  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    const r = safeNumber(reps);
    const d = safeNumber(distance);
    const p = parseDurationToSeconds(pace);
    const restSecs = parseDurationToSeconds(rest);

    if (r === null || r <= 0) return setError('Invalid reps number.');
    if (d === null || d <= 0) return setError('Invalid distance per rep.');
    if (p === null || p <= 0) return setError('Invalid pace format.');
    if (restSecs === null || restSecs < 0) return setError('Invalid rest format.');

    setResult(calculateIntervalWorkout(r, d, p, restSecs));
  };

  return (
    <div className="space-y-6 pb-10">
      <LabPageHeader title="Workout Math Lab" subtitle="Calculate session volume and duration for structured interval workouts." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-6 flex flex-col h-full">
          <Card>
            <CardHeader>
              <CardTitle>Interval Session Math</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCalculate} className="space-y-4" noValidate>
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
                     
                      placeholder="MM:SS"
                      value={rest} 
                      onChange={(e) => setRest(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <ValidationMessage message={error} />
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 ">Calculate</Button>
                  <Button type="button" variant="outline" onClick={handleReset} className="flex-1">Reset</Button>
                </div>
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
                  <div className="flex flex-col p-2 space-y-1">
                    <div className="flex justify-between p-2 border-b border-border">
                      <span className="font-medium text-sm">Rep Time</span>
                      <span className="font-mono text-primary">{formatSecondsToTimeString(result.result.repTimeSeconds)}</span>
                    </div>
                    <div className="flex justify-between p-2 border-b border-border">
                      <span className="font-medium text-sm">Total Work Time</span>
                      <span className="font-mono text-primary">{formatSecondsToTimeString(result.result.totalWorkSeconds)}</span>
                    </div>
                    <div className="flex justify-between p-2 border-b border-border">
                      <span className="font-medium text-sm">Total Rest Time</span>
                      <span className="font-mono text-primary">{formatSecondsToTimeString(result.result.totalRestSeconds)}</span>
                    </div>
                    <div className="flex justify-between p-2 border-b border-border">
                      <span className="font-medium text-sm">Rep Volume</span>
                      <span className="font-mono text-primary">{result.result.sessionDistanceKm.toFixed(2)} km</span>
                    </div>
                    <div className="flex justify-between p-2">
                      <span className="font-bold text-sm">Total Time</span>
                      <span className="font-bold font-mono text-primary text-xl drop-shadow-sm">{formatSecondsToTimeString(result.result.totalSessionSeconds)}</span>
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

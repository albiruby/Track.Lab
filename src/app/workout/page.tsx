'use client';

import { useState } from 'react';
import { Input, Label } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { calculateIntervalWorkout } from '@/lib/calculators';
import { formatSecondsToTimeString, parseDurationToSeconds , safeNumber } from '@/lib/formatters/time';
import { CalculatorPageShell } from '@/components/calculator/CalculatorPageShell';
import { ManualInputPanel } from '@/components/calculator/ManualInputPanel';
import { ExportPanel } from '@/components/calculator/CalculatorSystem';
import { resultToText } from '@/lib/export/manualExport';

export default function WorkoutLabPage() {
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick');
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
  
  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
    <CalculatorPageShell title="Workout Math Lab" subtitle="Calculate session volume and duration for structured interval workouts.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <ManualInputPanel
          mode={mode}
          setMode={setMode}
          supportsAdvanced={false}
          onCalculate={handleCalculate}
          onReset={handleReset}
          error={error}
        >
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
        </ManualInputPanel>

        <div className="h-full flex flex-col gap-6">
          {result ? (
            <>
              <ResultCard 
                result={{
                  ...result,
                  result: (
                    <div className="flex flex-col gap-3">
                      <div className="flex justify-between p-3 border-2 border-border-heavy bg-white rounded-lg shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                        <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground mt-0.5">Rep Time</span>
                        <span className="font-mono font-bold text-primary-foreground bg-primary px-2 py-0.5 rounded text-sm">{formatSecondsToTimeString(result.result.repTimeSeconds)}</span>
                      </div>
                      <div className="flex justify-between p-3 border-2 border-border-heavy bg-white rounded-lg shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                        <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground mt-0.5">Total Work Time</span>
                        <span className="font-mono font-bold text-foreground text-sm">{formatSecondsToTimeString(result.result.totalWorkSeconds)}</span>
                      </div>
                      <div className="flex justify-between p-3 border-2 border-border-heavy bg-white rounded-lg shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                        <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground mt-0.5">Total Rest Time</span>
                        <span className="font-mono font-bold text-foreground text-sm">{formatSecondsToTimeString(result.result.totalRestSeconds)}</span>
                      </div>
                      <div className="flex justify-between p-3 border-2 border-border-heavy bg-white rounded-lg shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                        <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground mt-0.5">Rep Volume</span>
                        <span className="font-mono font-bold text-foreground text-sm">{result.result.sessionDistanceKm.toFixed(2)} km</span>
                      </div>
                      <div className="flex flex-col items-center mt-2 p-5 border-2 border-border-heavy bg-card rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                        <span className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Total Session Time</span>
                        <span className="font-display font-black text-4xl text-foreground">{formatSecondsToTimeString(result.result.totalSessionSeconds)}</span>
                      </div>
                    </div>
                  )
                }} 
              />
              <ExportPanel textToCopy={resultToText(result, "Workout Math Result")} />
            </>
          ) : (
             <div className="p-6 border-2 border-dashed border-border-heavy bg-card rounded-xl text-center flex flex-col items-center justify-center h-full min-h-[200px]">
              <span className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Awaiting Input</span>
            </div>
          )}
        </div>
      </div>
    </CalculatorPageShell>
  );
}


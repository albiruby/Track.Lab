'use client';

import { useState } from 'react';
import { Input, Label } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { paceSecondsPerKm } from '@/lib/calculators_pack/pace';
import { formatPace, parseDurationToSeconds , safeNumber } from '@/lib/formatters/time';
import { riegelPredictTime } from '@/lib/calculators_pack/racePrediction';
import { CalculatorPageShell } from '@/components/calculator/CalculatorPageShell';
import { ManualInputPanel } from '@/components/calculator/ManualInputPanel';
import { ExportPanel } from '@/components/calculator/CalculatorSystem';
import { resultToText } from '@/lib/export/manualExport';

export default function TrainingPaceLab() {
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick');
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
  
  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    const d = safeNumber(distance);
    const secs = parseDurationToSeconds(timeStr);
    
    if (d === null || d <= 0) return setError('Please enter a valid distance.');
    if (secs === null || secs <= 0) return setError('Please enter a valid time (MM:SS or HH:MM:SS).');

    // Estimate threshold pace as roughly 10k to 15k pace
    // Let's use Riegel to find equivalent 10km pace as a generic "Threshold" anchor
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

    const outTable = (
      <div className="flex flex-col pt-2 w-full gap-5">
        {paces.map((p, i) => {
          const widthPct = Math.min(100, (p.pace / paces[0].pace) * 100);
          return (
          <div key={i} className="flex flex-col gap-1.5 w-full">
            <div className="flex justify-between items-baseline">
               <span className="font-bold tracking-wider text-sm uppercase">{p.name}</span>
               <span className="font-mono text-primary font-bold">{formatPace(p.pace)}</span>
            </div>
            <div className="w-full h-8 bg-neutral-200 border-2 border-border-heavy rounded-lg overflow-hidden flex items-stretch shadow-[inset_1px_1px_0px_rgba(0,0,0,0.1)]">
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
      confidenceLabel: 'Estimate',
      formulaUsed: 'Threshold anchored to ~10K pace, with fixed percentage multipliers.',
      inputUsed: { distance: d + ' km', time: timeStr },
      limitations: 'Goal-based pace may be too aggressive if current fitness is lower. These are mathematical approximations.'
    });
  };

  return (
    <CalculatorPageShell title="Training Pace Lab" subtitle="Determine optimal paces for different types of training runs based on current fitness.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <ManualInputPanel
          mode={mode}
          setMode={setMode}
          supportsAdvanced={false}
          onCalculate={handleCalculate}
          onReset={handleReset}
          error={error}
        >
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
        </ManualInputPanel>

        <div className="h-full flex flex-col gap-6">
          {result ? (
            <>
              <ResultCard result={result} />
              <ExportPanel textToCopy={resultToText(result, "Training Pace Result")} />
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


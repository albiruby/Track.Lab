'use client';

import { useState } from 'react';
import { Input, Label } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { CalculatorPageShell } from '@/components/calculator/CalculatorPageShell';
import { ManualInputPanel } from '@/components/calculator/ManualInputPanel';
import { ExportPanel } from '@/components/calculator/CalculatorSystem';
import { resultToText } from '@/lib/export/manualExport';
import { CalculatorResult } from '@/types';
import { calculateFuelingCheckpoints } from '@/lib/calculators';
import { safeNumber, parseDurationToSeconds, formatSecondsToTimeString } from '@/lib/formatters/time';

export default function RaceDayLabPage() {
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick');
  const [raceStart, setRaceStart] = useState('07:00');
  const [warmupOffset, setWarmupOffset] = useState('45');
  const [duration, setDuration] = useState('2:00:00');
  const [gelInterval, setGelInterval] = useState('30:00');
  const [fluidInterval, setFluidInterval] = useState('15:00');
  
  const [result, setResult] = useState<CalculatorResult<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setRaceStart('07:00');
    setWarmupOffset('45');
    setDuration('2:00:00');
    setGelInterval('30:00');
    setFluidInterval('15:00');
    setResult(null);
    setError(null);
  };

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const [hrs, mins] = raceStart.split(':').map(Number);
    if (isNaN(hrs) || isNaN(mins)) return setError('Invalid race start time');
    const startMins = hrs * 60 + mins;
    const warmupMins = safeNumber(warmupOffset);
    if (warmupMins === null) return setError('Invalid warm-up offset');

    const warmupStartMins = startMins - warmupMins;
    const wpHrs = Math.floor(warmupStartMins / 60);
    const wpMins = warmupStartMins % 60;
    const warmupTimeString = `${String(wpHrs).padStart(2, '0')}:${String(wpMins).padStart(2, '0')}`;

    const durSecs = parseDurationToSeconds(duration);
    const gelSecs = parseDurationToSeconds(gelInterval);
    const fluidSecs = parseDurationToSeconds(fluidInterval);

    if (durSecs === null || durSecs <= 0) return setError('Invalid duration');
    
    const gels = gelSecs ? calculateFuelingCheckpoints(durSecs, gelSecs) : 0;
    const drinks = fluidSecs ? calculateFuelingCheckpoints(durSecs, fluidSecs) : 0;

    setResult({
      result: (
        <div className="flex flex-col gap-3">
          <div className="flex justify-between p-3 border-2 border-border-heavy bg-white rounded-lg shadow-[1px_1px_0px_rgba(23,23,23,1)]">
             <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground mt-0.5">Warm-up Start</span>
             <span className="font-mono font-bold text-foreground text-sm">{warmupTimeString}</span>
          </div>
          <div className="flex justify-between p-3 border-2 border-border-heavy bg-white rounded-lg shadow-[1px_1px_0px_rgba(23,23,23,1)]">
             <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground mt-0.5">Gel Checkpoints</span>
             <span className="font-mono font-bold text-foreground text-sm">{gels}</span>
          </div>
          <div className="flex justify-between p-3 border-2 border-border-heavy bg-white rounded-lg shadow-[1px_1px_0px_rgba(23,23,23,1)]">
             <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground mt-0.5">Fluid Checkpoints</span>
             <span className="font-mono font-bold text-foreground text-sm">{drinks}</span>
          </div>
        </div>
      ),
      methodSelected: 'Race Timeline & Logistics',
      confidenceLabel: 'Exact',
      formulaUsed: 'Offsets and modular division of intervals',
      inputUsed: { start: raceStart, duration },
      limitations: 'Does not account for transition times, aid station spacing, or varying consumption rates.'
    });
  };

  return (
    <CalculatorPageShell title="Race Day Lab" subtitle="Build manual race timeline and fueling checkpoints.">
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
              <Label htmlFor="raceStart">Start (HH:MM)</Label>
              <Input id="raceStart" type="text" placeholder="07:00" value={raceStart} onChange={e => setRaceStart(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="warmupOffset">Warm-up Offset (min)</Label>
              <Input id="warmupOffset" type="number" value={warmupOffset} onChange={e => setWarmupOffset(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="duration">Target Finish Time</Label>
              <Input id="duration" type="text" placeholder="2:00:00" value={duration} onChange={e => setDuration(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="gelInterval">Gel Interval (MM:SS)</Label>
              <Input id="gelInterval" type="text" placeholder="30:00" value={gelInterval} onChange={e => setGelInterval(e.target.value)} />
            </div>
            <div>
               <Label htmlFor="fluidInterval">Fluid Interval (MM:SS)</Label>
               <Input id="fluidInterval" type="text" placeholder="15:00" value={fluidInterval} onChange={e => setFluidInterval(e.target.value)} />
            </div>
          </div>
        </ManualInputPanel>

        <div className="h-full flex flex-col gap-6">
          {result ? (
            <>
              <ResultCard result={result} />
              <ExportPanel textToCopy={resultToText(result, "Race Day Lab Result")} />
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

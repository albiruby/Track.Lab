'use client';

import { useState } from 'react';
import { Input, Label } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { calculatePace } from '@/lib/calculators';
import { formatPace, parseDurationToSeconds, safeNumber } from '@/lib/formatters/time';
import { CalculatorPageShell } from '@/components/calculator/CalculatorPageShell';
import { ManualInputPanel } from '@/components/calculator/ManualInputPanel';
import { ExportPanel } from '@/components/calculator/CalculatorSystem';
import { resultToText } from '@/lib/export/manualExport';

export default function PaceLabPage() {
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick');
  const [distance, setDistance] = useState('5');
  const [timeStr, setTimeStr] = useState('25:00');
  const [result, setResult] = useState<ReturnType<typeof calculatePace> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    const d = safeNumber(distance);
    const secs = parseDurationToSeconds(timeStr);
    
    if (d === null || d <= 0) {
      setError('Please enter a valid positive distance.');
      return;
    }
    if (secs === null || secs <= 0) {
      setError('Please enter a valid duration (MM:SS or HH:MM:SS).');
      return;
    }
    
    setResult(calculatePace(d, secs));
  };

  const handleReset = () => {
    setDistance('5');
    setTimeStr('25:00');
    setResult(null);
    setError(null);
  };

  return (
    <CalculatorPageShell title="Pace Lab" subtitle="Calculate running pace strictly from distance and time.">
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
            <Label htmlFor="distance">Distance in km</Label>
            <Input 
              id="distance" 
              type="number" 
              step="0.01" 
              min="0.1" 
              value={distance} 
              onChange={(e) => setDistance(e.target.value)} 
              required 
            />
          </div>
          <div>
            <Label htmlFor="timeStr">Time (HH:MM:SS or MM:SS)</Label>
            <Input 
              id="timeStr" 
              type="text" 
              placeholder="e.g. 25:00, 1:45:00"
              title="Format: MM:SS or HH:MM:SS"
              value={timeStr} 
              onChange={(e) => setTimeStr(e.target.value)} 
              required 
            />
          </div>
        </ManualInputPanel>

        <div className="h-full flex flex-col gap-6">
          {result ? (
            <>
              <ResultCard 
                result={{
                  ...result,
                  result: (
                    <div className="flex flex-col items-center p-6 bg-primary border-2 border-border-heavy rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                      <span className="text-primary-foreground text-[10px] font-bold uppercase tracking-widest mb-1">Target Pace</span>
                      <span className="font-display text-5xl md:text-6xl font-bold tracking-tighter text-primary-foreground">{formatPace(result.result)}</span>
                    </div>
                  )
                }} 
              />
              <ExportPanel textToCopy={resultToText(result, "Pace Lab Result")} />
            </>
          ) : (
            <div className="p-6 border-2 border-dashed border-border-heavy bg-card rounded-xl text-center flex flex-col items-center justify-center h-full min-h-[200px]">
              <span className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Awaiting Input</span>
              <span className="text-xs font-medium text-muted-foreground mt-2">Formula trace and export options will appear after a valid calculation.</span>
            </div>
          )}
        </div>
      </div>
    </CalculatorPageShell>
  );
}


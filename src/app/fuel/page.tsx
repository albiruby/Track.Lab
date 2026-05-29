'use client';

import { useState } from 'react';
import { Input, Label } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { calculateFuel } from '@/lib/calculators';
import { parseDurationToSeconds , safeNumber } from '@/lib/formatters/time';
import { CalculatorPageShell } from '@/components/calculator/CalculatorPageShell';
import { ManualInputPanel } from '@/components/calculator/ManualInputPanel';
import { ExportPanel } from '@/components/calculator/CalculatorSystem';
import { resultToText } from '@/lib/export/manualExport';

export default function FuelLabPage() {
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick');
  const [duration, setDuration] = useState('2:30:00');
  const [carbRate, setCarbRate] = useState('60');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReturnType<typeof calculateFuel> | null>(null);

  const handleReset = () => { 
    setDuration('2:30:00');
    setCarbRate('60');
    setResult(null);
    setError(null);
  };
  
  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const rawDur = parseDurationToSeconds(duration);
    if (rawDur === null || rawDur <= 0 || isNaN(parseInt(carbRate))) return setError('Invalid input');
    
    const durationHours = rawDur / 3600;
    const rate = parseInt(carbRate);

    if (durationHours > 0 && rate > 0) {
      setResult(calculateFuel(durationHours, rate));
    }
  };

  return (
    <CalculatorPageShell title="Fuel & Hydration" subtitle="Calculate endogenous carbohydrate requirements for long efforts.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <ManualInputPanel
          mode={mode}
          setMode={setMode}
          supportsAdvanced={false}
          onCalculate={handleCalculate}
          onReset={handleReset}
          error={error}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Session Duration</Label>
              <Input 
                id="duration" 
                type="text" 
                placeholder="HH:MM:SS"
                value={duration} 
                onChange={(e) => setDuration(e.target.value)} 
                required 
              />
            </div>
            <div>
              <Label htmlFor="carbRate">Target Carbs/hr (g)</Label>
              <Input 
                id="carbRate" 
                type="number" 
                min="10" 
                max="120" 
                value={carbRate} 
                onChange={(e) => setCarbRate(e.target.value)} 
                required 
              />
            </div>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-4 bg-muted p-3 rounded-lg border border-border">NOTE: Scientific consensus suggests 30-60g/hr for efforts ~2hrs, and up to 90-120g/hr for efforts &gt; 3hrs.</div>
        </ManualInputPanel>

        <div className="h-full flex flex-col gap-6">
          {result ? (
            <>
              <ResultCard 
                result={{
                  ...result,
                  result: (
                    <div className="w-full space-y-4">
                      <div className="flex flex-col items-center p-6 bg-primary border-2 border-border-heavy rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                        <span className="text-primary-foreground text-[10px] font-bold uppercase tracking-widest mb-1">Total Session Carbs</span>
                        <span className="font-display text-5xl md:text-6xl font-bold tracking-tighter text-primary-foreground">{result.result.totalCarbs}g</span>
                      </div>
                      
                      <div className="space-y-3 pt-2">
                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Equivalents (approximate)</div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="p-4 border-2 border-border-heavy bg-card rounded-xl text-center shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                            <div className="font-display text-2xl font-bold tracking-tight mb-0.5">{result.result.gelsAt20g}</div>
                            <div className="text-muted-foreground tracking-widest text-[9px] font-bold uppercase">Gels (20g ea)</div>
                          </div>
                          <div className="p-4 border-2 border-border-heavy bg-card rounded-xl text-center shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                            <div className="font-display text-2xl font-bold tracking-tight mb-0.5">{result.result.gelsAt30g}</div>
                            <div className="text-muted-foreground tracking-widest text-[9px] font-bold uppercase">Gels (30g ea)</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                }} 
              />
              <ExportPanel textToCopy={resultToText(result, "Fuel Math Result")} />
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


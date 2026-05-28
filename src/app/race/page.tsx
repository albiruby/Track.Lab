'use client';

import { useState } from 'react';
import { Input, Label } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { calculateRiegelPrediction } from '@/lib/calculators';
import { formatSecondsToTimeString, parseDurationToSeconds , safeNumber } from '@/lib/formatters/time';
import { CalculatorPageShell } from '@/components/calculator/CalculatorPageShell';
import { ManualInputPanel } from '@/components/calculator/ManualInputPanel';
import { ExportPanel } from '@/components/calculator/CalculatorSystem';
import { resultToText } from '@/lib/export/manualExport';

export default function RaceLabPage() {
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick');
  const [d1, setD1] = useState('5');
  const [t1, setT1] = useState('20:00');
  const [d2, setD2] = useState('10');
  const [exponent, setExponent] = useState('1.06');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ReturnType<typeof calculateRiegelPrediction> | null>(null);

  const handleReset = () => {
    setD1('5');
    setT1('20:00');
    setD2('10');
    setExponent('1.06');
    setResult(null);
    setError(null);
  };
  
  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    
    const d1v = safeNumber(d1);
    const d2v = safeNumber(d2);
    const t1v = parseDurationToSeconds(t1);
    const expv = mode === 'advanced' ? safeNumber(exponent) : 1.06;
    
    if (d1v === null || d1v <= 0) return setError('Invalid recent distance.');
    if (d2v === null || d2v <= 0) return setError('Invalid target distance.');
    if (t1v === null || t1v <= 0) return setError('Invalid recent time format.');
    if (expv === null || expv <= 0) return setError('Invalid fatigue exponent.');
    
    setResult(calculateRiegelPrediction(d1v, t1v, d2v, expv));
  };

  return (
    <CalculatorPageShell title="Race Lab" subtitle="Predict race finish times using Peter Riegel's formula.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <ManualInputPanel 
          mode={mode} 
          setMode={setMode} 
          supportsAdvanced={true} 
          onCalculate={handleCalculate} 
          onReset={handleReset} 
          error={error}
        >
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
            <div className="mt-2 text-xs font-bold uppercase tracking-widest text-muted-foreground bg-muted p-2 rounded border border-border">
              Common: 5K=5, 10K=10, HM=21.1, M=42.2
            </div>
          </div>
          {mode === 'advanced' && (
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
              <div className="mt-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Default 1.06. Use 1.05 for elites, 1.07+ for novices/trails.
              </div>
            </div>
          )}
        </ManualInputPanel>

        <div className="h-full flex flex-col gap-6">
          {result ? (
            <>
              <ResultCard 
                result={{
                  ...result,
                  result: (
                    <div className="flex flex-col items-center p-6 bg-primary border-2 border-border-heavy rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                      <span className="text-primary-foreground text-[10px] font-bold uppercase tracking-widest mb-1">Predicted Time</span>
                      <span className="font-display text-5xl md:text-6xl font-bold tracking-tighter text-primary-foreground">{formatSecondsToTimeString(result.result)}</span>
                    </div>
                  )
                }} 
              />
              <ExportPanel textToCopy={resultToText(result, "Race Predictor Result")} />
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


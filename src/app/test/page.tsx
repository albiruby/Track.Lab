'use client';

import { useState } from 'react';
import { Input, Label } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { CalculatorPageShell } from '@/components/calculator/CalculatorPageShell';
import { ManualInputPanel } from '@/components/calculator/ManualInputPanel';
import { ExportPanel } from '@/components/calculator/CalculatorSystem';
import { resultToText } from '@/lib/export/manualExport';
import { CalculatorResult } from '@/types';
import { calculateCooperVo2, estimateLthr } from '@/lib/calculators';
import { safeNumber } from '@/lib/formatters/time';

export default function TestLabPage() {
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick');
  const [cooperDist, setCooperDist] = useState('2800');
  
  const [result, setResult] = useState<CalculatorResult<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setCooperDist('2800');
    setResult(null);
    setError(null);
  };

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const dist = safeNumber(cooperDist);
    if (dist === null || dist <= 504.9) return setError('Invalid distance (too short for Cooper estimation).');
    
    const vo2 = calculateCooperVo2(dist);

    setResult({
      result: (
        <div className="flex flex-col items-center p-6 bg-card border-2 border-border-heavy rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
           <span className="text-muted-foreground text-[10px] mb-1 tracking-widest block uppercase font-bold">Estimated VO2max</span>
           <span className="font-display text-6xl font-black text-foreground">{vo2.toFixed(1)}</span>
           <span className="text-xs font-mono font-medium text-muted-foreground mt-2 inline-block">mL/kg/min</span>
           <div className="mt-4 p-3 bg-muted border border-border rounded text-[10px] uppercase font-bold tracking-widest text-muted-foreground w-full text-center">
             Field tests require caution. Not medical testing.
           </div>
        </div>
      ),
      methodSelected: 'Cooper 12-Minute Test',
      confidenceLabel: 'Field-Test Estimate',
      formulaUsed: 'VO2max = (Distance_m - 504.9) / 44.73',
      inputUsed: { 'Cooper 12-Min Distance': dist + ' m' },
      limitations: 'Assumes maximal effort and pacing. Underestimates VO2 max in poorly paced or unmotivated trials.'
    });
  };

  return (
    <CalculatorPageShell title="Test Lab" subtitle="Calculate field-test outputs and confidence labels.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <ManualInputPanel
          mode={mode}
          setMode={setMode}
          supportsAdvanced={false}
          onCalculate={handleCalculate}
          onReset={handleReset}
          error={error}
        >
          <div className="text-xl font-display font-black tracking-tight mb-2 uppercase">Cooper 12-min Run</div>
          <div>
            <Label htmlFor="cooperDist">Distance covered in 12 mins (meters)</Label>
            <Input id="cooperDist" type="number" step="1" value={cooperDist} onChange={e => setCooperDist(e.target.value)} required />
          </div>
        </ManualInputPanel>

        <div className="h-full flex flex-col gap-6">
          {result ? (
            <>
              <ResultCard result={result} />
              <ExportPanel textToCopy={resultToText(result, "Test Lab Result")} />
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

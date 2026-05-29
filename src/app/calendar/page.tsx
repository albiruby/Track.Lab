'use client';

import { useState } from 'react';
import { Input, Label } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { CalculatorPageShell } from '@/components/calculator/CalculatorPageShell';
import { ManualInputPanel } from '@/components/calculator/ManualInputPanel';
import { ExportPanel } from '@/components/calculator/CalculatorSystem';
import { resultToText } from '@/lib/export/manualExport';
import { CalculatorResult } from '@/types';
import { analyzeWeeklyCalendar } from '@/lib/calculators';

export default function CalendarLabPage() {
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick');
  const [distances, setDistances] = useState('5, 0, 8, 0, 10, 0, 15');
  
  const [result, setResult] = useState<CalculatorResult<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setDistances('5, 0, 8, 0, 10, 0, 15');
    setResult(null);
    setError(null);
  };

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const distArray = distances.split(',').map(s => parseFloat(s.trim()));
    if (distArray.some(isNaN) || distArray.length === 0) return setError('Please enter valid comma-separated distances.');

    const res = analyzeWeeklyCalendar(distArray);

    setResult({
      result: (
        <div className="flex flex-col gap-3">
          <div className="flex justify-between p-3 border-2 border-border-heavy bg-white rounded-lg shadow-[1px_1px_0px_rgba(23,23,23,1)]">
             <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground mt-0.5">Weekly Volume</span>
             <span className="font-mono font-bold text-foreground text-sm">{res.weeklyDistance}</span>
          </div>
          <div className="flex justify-between p-3 border-2 border-border-heavy bg-white rounded-lg shadow-[1px_1px_0px_rgba(23,23,23,1)]">
             <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground mt-0.5">Long Run</span>
             <span className="font-mono font-bold text-foreground text-sm">{res.maxLongRun}</span>
          </div>
          <div className="flex justify-between p-3 border-2 border-border-heavy bg-white rounded-lg shadow-[1px_1px_0px_rgba(23,23,23,1)]">
             <span className="font-bold text-xs uppercase tracking-wider text-muted-foreground mt-0.5">Long Run Ratio</span>
             <span className="font-mono font-bold text-foreground text-sm">{(res.longRunRatio * 100).toFixed(1)}%</span>
          </div>
        </div>
      ),
      methodSelected: 'Weekly Calendar Scan',
      confidenceLabel: 'Rule-Based',
      formulaUsed: 'Sum and ratio analysis',
      inputUsed: { distances },
      limitations: 'Does not account for non-running stress or intensity.'
    });
  };

  return (
    <CalculatorPageShell title="Calendar Lab" subtitle="Preview manual weekly structure and ratios.">
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
            <Label htmlFor="distances">Daily Distances (comma separated)</Label>
            <Input id="distances" type="text" value={distances} onChange={e => setDistances(e.target.value)} required />
          </div>
        </ManualInputPanel>

        <div className="h-full flex flex-col gap-6">
          {result ? (
            <>
              <ResultCard result={result} />
              <ExportPanel textToCopy={resultToText(result, "Calendar Lab Result")} />
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

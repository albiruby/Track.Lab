'use client';

import { useState } from 'react';
import { Input, Label, Select } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { CalculatorPageShell } from '@/components/calculator/CalculatorPageShell';
import { ManualInputPanel } from '@/components/calculator/ManualInputPanel';
import { ExportPanel } from '@/components/calculator/CalculatorSystem';
import { resultToText } from '@/lib/export/manualExport';
import { CalculatorResult } from '@/types';
import { convertKmToMile, convertMileToKm } from '@/lib/calculators';
import { safeNumber } from '@/lib/formatters/time';

export default function ConversionLabPage() {
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick');
  const [val, setVal] = useState('10');
  const [convType, setConvType] = useState('km-mile');
  
  const [result, setResult] = useState<CalculatorResult<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setVal('10');
    setConvType('km-mile');
    setResult(null);
    setError(null);
  };

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    const v = safeNumber(val);
    if (v === null) return setError('Invalid value.');

    let resVal = 0;
    let label = '';
    
    if (convType === 'km-mile') {
      resVal = convertKmToMile(v); label = 'Miles';
    } else if (convType === 'mile-km') {
      resVal = convertMileToKm(v); label = 'Kilometers';
    }

    setResult({
      result: (
        <div className="flex flex-col items-center p-6 bg-card border-2 border-border-heavy rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
           <span className="text-muted-foreground text-[10px] mb-1 tracking-widest block uppercase font-bold">{label}</span>
           <span className="font-display text-5xl font-black text-foreground">{resVal.toFixed(4)}</span>
        </div>
      ),
      methodSelected: 'Unit Conversion',
      confidenceLabel: 'Exact',
      formulaUsed: 'Standard conversion factor',
      inputUsed: { value: val, conversion: convType },
      limitations: 'Limited to specified precision.'
    });
  };

  return (
    <CalculatorPageShell title="Conversion Lab" subtitle="Convert running and sport-science units.">
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
            <Label htmlFor="convType">Conversion</Label>
            <Select id="convType" value={convType} onChange={e => setConvType(e.target.value)}>
              <option value="km-mile">Kilometers to Miles</option>
              <option value="mile-km">Miles to Kilometers</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="val">Value</Label>
            <Input id="val" type="number" step="any" value={val} onChange={e => setVal(e.target.value)} required />
          </div>
        </ManualInputPanel>

        <div className="h-full flex flex-col gap-6">
          {result ? (
            <>
              <ResultCard result={result} />
              <ExportPanel textToCopy={resultToText(result, "Conversion Lab Result")} />
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

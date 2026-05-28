'use client';

import { useState } from 'react';
import { Input, Label, Select } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { safeNumber } from '@/lib/formatters/time';
import { calculateHrMax, calculateKarvonenZones } from '@/lib/calculators';
import { HR_MAX_METHODS } from '@/data';
import { CalculatorPageShell } from '@/components/calculator/CalculatorPageShell';
import { ManualInputPanel } from '@/components/calculator/ManualInputPanel';
import { ExportPanel } from '@/components/calculator/CalculatorSystem';
import { resultToText } from '@/lib/export/manualExport';

export default function HeartRateLabPage() {
  const [modeMax, setModeMax] = useState<'quick' | 'advanced'>('quick');
  const [age, setAge] = useState('30');
  const [hrMaxMethod, setHrMaxMethod] = useState('tanaka');
  const [hrMaxResult, setHrMaxResult] = useState<ReturnType<typeof calculateHrMax> | null>(null);
  const [errorMax, setErrorMax] = useState<string | null>(null);

  const [modeZones, setModeZones] = useState<'quick' | 'advanced'>('quick');
  const [hrMaxTarget, setHrMaxTarget] = useState('190');
  const [hrRest, setHrRest] = useState('60');
  const [zonesResult, setZonesResult] = useState<ReturnType<typeof calculateKarvonenZones> | null>(null);
  const [errorZones, setErrorZones] = useState<string | null>(null);

  const handleResetMax = () => {
    setAge('30');
    setHrMaxMethod('tanaka');
    setHrMaxResult(null);
    setErrorMax(null);
  }

  const handleResetZones = () => {
    setHrMaxTarget('190');
    setHrRest('60');
    setZonesResult(null);
    setErrorZones(null);
  }

  const handleMaxCalc = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMax(null);
    const a = safeNumber(age);
    if (a === null || a <= 0 || a > 120) return setErrorMax('Please enter a valid age (1-120).');
    
    const res = calculateHrMax(a, hrMaxMethod);
    setHrMaxResult(res);
    setHrMaxTarget(res.result.toString());
  };

  const handleZonesCalc = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorZones(null);
    const max = safeNumber(hrMaxTarget);
    const rest = safeNumber(hrRest);
    
    if (max === null || max <= 0) return setErrorZones('Invalid Max HR');
    if (rest === null || rest <= 0) return setErrorZones('Invalid Rest HR');
    if (max <= rest) return setErrorZones('Max HR must be greater than Rest HR');

    setZonesResult(calculateKarvonenZones(max, rest));
  };

  return (
    <CalculatorPageShell title="Heart Rate Lab" subtitle="Calculate Maximum Heart Rate estimates & Training Zones based on physiology.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pb-8 border-b-2 border-border-heavy">
        <ManualInputPanel
          mode={modeMax}
          setMode={setModeMax}
          supportsAdvanced={false}
          onCalculate={handleMaxCalc}
          onReset={handleResetMax}
          error={errorMax}
        >
          <div className="text-xl font-display font-black tracking-tight mb-2 uppercase">1. Max HR Estimator</div>
          <div>
            <Label htmlFor="age">Age</Label>
            <Input 
              id="age" 
              type="number" 
              min="10" 
              max="110" 
              value={age} 
              onChange={(e) => setAge(e.target.value)} 
              required 
            />
          </div>
          <div>
            <Label htmlFor="method">Estimation Formula</Label>
            <Select id="method" value={hrMaxMethod} onChange={(e) => setHrMaxMethod(e.target.value)}>
              {HR_MAX_METHODS.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </Select>
          </div>
        </ManualInputPanel>
        
        <div className="flex flex-col gap-4 h-full">
          {hrMaxResult ? (
            <>
              <ResultCard result={{...hrMaxResult, result: `${hrMaxResult.result} bpm`}} />
            </>
          ) : (
            <div className="p-6 border-2 border-dashed border-border-heavy bg-card rounded-xl text-center flex flex-col items-center justify-center h-full min-h-[200px]">
              <span className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Awaiting Input</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start pt-4">
        <ManualInputPanel
          mode={modeZones}
          setMode={setModeZones}
          supportsAdvanced={false}
          onCalculate={handleZonesCalc}
          onReset={handleResetZones}
          error={errorZones}
        >
          <div className="text-xl font-display font-black tracking-tight mb-2 uppercase">2. Karvonen target zones</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hrMaxTarget">Max HR (bpm)</Label>
              <Input 
                id="hrMaxTarget" 
                type="number" 
                min="100" 
                max="250" 
                value={hrMaxTarget} 
                onChange={(e) => setHrMaxTarget(e.target.value)} 
                required 
              />
            </div>
            <div>
              <Label htmlFor="hrRest">Resting HR (bpm)</Label>
              <Input 
                id="hrRest" 
                type="number" 
                min="30" 
                max="150" 
                value={hrRest} 
                onChange={(e) => setHrRest(e.target.value)} 
                required 
              />
            </div>
          </div>
        </ManualInputPanel>

        <div className="flex flex-col gap-4 h-full">
          {zonesResult ? (
            <>
              <ResultCard result={{
                ...zonesResult,
                result: (
                  <div className="flex flex-col pt-2">
                    {zonesResult.result.map((z, i) => {
                      const maxPct = z.intensity.includes('-') ? parseFloat(z.intensity.split('-')[1]) : 100;
                      return (
                      <div key={i} className="mb-4">
                        <div className="flex justify-between mb-1 text-sm font-bold uppercase tracking-wider">
                          <span>{z.name} <span className="text-muted-foreground ml-1">({z.intensity})</span></span>
                          <span className="font-mono text-primary">~{z.bpm} bpm</span>
                        </div>
                        <div className="w-full bg-neutral-200 h-6 rounded-md overflow-hidden border-2 border-border-heavy relative shadow-[inset_1px_1px_0px_rgba(0,0,0,0.1)]">
                          <div className="absolute top-0 bottom-0 bg-primary border-r-2 border-border-heavy opacity-90" style={{ left: 0, width: `${maxPct}%` }}></div>
                        </div>
                      </div>
                    )})}
                  </div>
                )
              }} />
              <ExportPanel textToCopy={resultToText(zonesResult, "HR Zones Result")} />
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


'use client';

import { useState } from 'react';
import { Input, Label, Select } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { hrZoneModels } from '@/data_pack/hrZoneModels';
import { zoneFromHrmax, zoneFromKarvonen, zoneFromLthr } from '@/lib/calculators_pack/heartRate';
import { CalculatorPageShell } from '@/components/calculator/CalculatorPageShell';
import { ManualInputPanel } from '@/components/calculator/ManualInputPanel';

export default function ZoneLab() {
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick');
  const [methodId, setMethodId] = useState<string>(hrZoneModels[0].id);
  const [maxHr, setMaxHr] = useState('190');
  const [restHr, setRestHr] = useState('60');
  const [lthr, setLthr] = useState('170');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  const selectedModel = hrZoneModels.find(m => m.id === methodId) || hrZoneModels[0];

  const handleReset = () => {
    setMaxHr('190');
    setRestHr('60');
    setLthr('170');
    setResult(null);
    setError(null);
  };

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    if (!('zones' in selectedModel) || !selectedModel.zones) return;
    const zones = selectedModel.zones as unknown as Array<any>;

    try {
      let resZones: React.ReactNode[] = [];
      let inputUsed = {};
      
      if (selectedModel.basis === 'hrmax') {
        const m = parseInt(maxHr);
        if (isNaN(m) || m <= 0) return setError('Invalid Max HR');
        resZones = zones.map((z, i) => {
          const res = zoneFromHrmax(m, z.minPct, z.maxPct);
          return (
             <div key={i} className="mb-4">
               <div className="flex justify-between mb-1 text-sm font-bold uppercase tracking-wider">
                 <span>{z.zone} <span className="text-muted-foreground ml-1">({z.name})</span></span>
                 <span className="font-mono text-primary">{res.min}{res.max ? ' - ' + res.max : '+'} bpm</span>
               </div>
               <div className="w-full bg-neutral-200 h-6 rounded-md overflow-hidden border-2 border-border-heavy relative shadow-[inset_1px_1px_0px_rgba(0,0,0,0.1)]">
                 <div className="absolute top-0 bottom-0 bg-primary border-r-2 border-border-heavy" style={{ left: 0, width: `${(z.maxPct || 1.0) * 100}%` }}></div>
               </div>
             </div>
          );
        });
        inputUsed = { HRmax: m };
      } else if (selectedModel.basis === 'hrr') {
        const m = parseInt(maxHr);
        const r = parseInt(restHr);
        if (isNaN(m) || isNaN(r) || m <= 0 || r <= 0 || r >= m) return setError('Invalid HR metrics');
        resZones = zones.map((z, i) => {
          const res = zoneFromKarvonen(m, r, z.minPct, z.maxPct);
          const maxPct = z.maxPct || 1.0;
          return (
             <div key={i} className="mb-4">
               <div className="flex justify-between mb-1 text-sm font-bold uppercase tracking-wider">
                 <span>{z.zone} <span className="text-muted-foreground ml-1">({z.name})</span></span>
                 <span className="font-mono text-primary">{res.min}{res.max ? ' - ' + res.max : '+'} bpm</span>
               </div>
               <div className="w-full bg-neutral-200 h-6 rounded-md overflow-hidden border-2 border-border-heavy relative shadow-[inset_1px_1px_0px_rgba(0,0,0,0.1)]">
                 <div className="absolute top-0 bottom-0 bg-primary border-r-2 border-border-heavy opacity-90" style={{ left: 0, width: `${maxPct * 100}%` }}></div>
               </div>
             </div>
          );
        });
        inputUsed = { HRmax: m, RHR: r };
      } else if (selectedModel.basis === 'lthr') {
        const l = parseInt(lthr);
        if (isNaN(l) || l <= 0) return setError('Invalid LTHR');
        resZones = zones.map((z, i) => {
          const res = zoneFromLthr(l, z.minPct, z.maxPct);
          const maxPct = z.maxPct || 1.1; 
          const fillWidth = Math.min(100, maxPct * 100);
          return (
             <div key={i} className="mb-4">
               <div className="flex justify-between mb-1 text-sm font-bold uppercase tracking-wider">
                 <span>{z.zone} <span className="text-muted-foreground ml-1">({z.name})</span></span>
                 <span className="font-mono text-primary">{res.min}{res.max ? ' - ' + res.max : '+'} bpm</span>
               </div>
               <div className="w-full bg-neutral-200 h-6 rounded-md overflow-hidden border-2 border-border-heavy relative shadow-[inset_1px_1px_0px_rgba(0,0,0,0.1)]">
                 <div className="absolute top-0 bottom-0 bg-primary border-r-2 border-border-heavy opacity-90" style={{ left: 0, width: `${(fillWidth / 1.1)}%` }}></div>
               </div>
             </div>
          );
        });
        inputUsed = { LTHR: l };
      }

      setResult({
        result: <div className="flex flex-col p-2">{resZones}</div>,
        methodSelected: selectedModel.name,
        confidenceLabel: selectedModel.precision,
        formulaUsed: selectedModel.formulaDisplay,
        inputUsed,
        limitations: (selectedModel as any).limitations?.join(' ')
      });
    } catch (err) {
      setError('Calculation failed. Check inputs.');
    }
  };

  return (
    <CalculatorPageShell title="Zone Lab" subtitle="Configure physiological training zones based on deterministic models.">
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
            <Label htmlFor="method">Zone Model</Label>
            <Select id="method" value={methodId} onChange={e => setMethodId(e.target.value)}>
              {hrZoneModels.filter(m => 'zones' in m).map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(selectedModel as any).requiredInputs?.includes('maxHeartRate') && (
              <div>
                <Label htmlFor="maxHr">Max HR (bpm)</Label>
                <Input 
                  id="maxHr" type="number" required
                  value={maxHr} onChange={e => setMaxHr(e.target.value)} 
                />
              </div>
            )}

            {(selectedModel as any).requiredInputs?.includes('restingHeartRate') && (
              <div>
                <Label htmlFor="restHr">Resting HR (bpm)</Label>
                <Input 
                  id="restHr" type="number" required
                  value={restHr} onChange={e => setRestHr(e.target.value)} 
                />
              </div>
            )}

            {(selectedModel as any).requiredInputs?.includes('lactateThresholdHeartRate') && (
              <div>
                <Label htmlFor="lthr">Lactate Threshold HR (bpm)</Label>
                <Input 
                  id="lthr" type="number" required
                  value={lthr} onChange={e => setLthr(e.target.value)} 
                />
              </div>
            )}
          </div>
        </ManualInputPanel>

        <div className="h-full flex flex-col gap-6">
          {result ? (
            <ResultCard result={result} />
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


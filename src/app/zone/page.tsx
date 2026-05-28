'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input, Label, Button, Select, ValidationMessage } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { LabPageHeader } from '@/components/layout/LabPageHeader';
import { hrZoneModels } from '@/data_pack/hrZoneModels';
import { zoneFromHrmax, zoneFromKarvonen, zoneFromLthr } from '@/lib/calculators_pack/heartRate';

export default function ZoneLab() {
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

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
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
          const r = zoneFromHrmax(m, z.minPct, z.maxPct);
          return (
            <div key={i} className="flex justify-between p-2 border-b last:border-0 border-border">
              <span className="font-medium">{z.zone} ({z.name})</span>
              <span className="font-mono text-primary">{r.min}{r.max ? ' - ' + r.max : '+'} bpm</span>
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
          return (
            <div key={i} className="flex justify-between p-2 border-b last:border-0 border-border">
              <span className="font-medium">{z.zone} ({z.name})</span>
              <span className="font-mono text-primary">{res.min}{res.max ? ' - ' + res.max : '+'} bpm</span>
            </div>
          );
        });
        inputUsed = { HRmax: m, RHR: r };
      } else if (selectedModel.basis === 'lthr') {
        const l = parseInt(lthr);
        if (isNaN(l) || l <= 0) return setError('Invalid LTHR');
        resZones = zones.map((z, i) => {
          const res = zoneFromLthr(l, z.minPct, z.maxPct);
          return (
            <div key={i} className="flex justify-between p-2 border-b last:border-0 border-border">
              <span className="font-medium">{z.zone} ({z.name})</span>
              <span className="font-mono text-primary">{res.min}{res.max ? ' - ' + res.max : '+'} bpm</span>
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
    <div className="space-y-6 pb-10">
      <LabPageHeader title="Zone Lab" subtitle="Configure physiological training zones based on deterministic models." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Model Parameters</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCalculate} className="space-y-4" noValidate>
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

              <ValidationMessage message={error} />
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 ">Calculate</Button>
                  <Button type="button" variant="outline" onClick={handleReset} className="flex-1">Reset</Button>
                </div>
            </form>
          </CardContent>
        </Card>

        <div className="h-full">
          {result && (
            <ResultCard result={result} />
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Input, Label, Button, Select } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { hrZoneModels } from '@/data_pack/hrZoneModels';
import { zoneFromHrmax, zoneFromKarvonen, zoneFromLthr } from '@/lib/calculators_pack/heartRate';

export default function ZoneLab() {
  const [methodId, setMethodId] = useState<string>(hrZoneModels[0].id);
  const [maxHr, setMaxHr] = useState('190');
  const [restHr, setRestHr] = useState('60');
  const [lthr, setLthr] = useState('170');
  const [result, setResult] = useState<any | null>(null);

  const selectedModel = hrZoneModels.find(m => m.id === methodId) || hrZoneModels[0];

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!('zones' in selectedModel) || !selectedModel.zones) return;
    const zones = selectedModel.zones as unknown as Array<any>;

    try {
      if (selectedModel.basis === 'hrmax') {
        const m = parseInt(maxHr);
        if (isNaN(m) || m <= 0) return;
        const resZones = zones.map(z => {
          const r = zoneFromHrmax(m, z.minPct, z.maxPct);
          return `${z.zone} (${z.name}): ${r.min}${r.max ? ' - ' + r.max : '+'} bpm`;
        });
        setResult({
          result: resZones.join('\n'),
          methodSelected: selectedModel.name,
          confidenceLabel: selectedModel.precision,
          formulaUsed: selectedModel.formulaDisplay,
          inputUsed: { HRmax: m },
          limitations: (selectedModel as any).limitations?.join(' ')
        });
      } else if (selectedModel.basis === 'hrr') {
        const m = parseInt(maxHr);
        const r = parseInt(restHr);
        if (isNaN(m) || isNaN(r) || m <= 0 || r <= 0 || r >= m) return;
        const resZones = zones.map(z => {
          const res = zoneFromKarvonen(m, r, z.minPct, z.maxPct);
          return `${z.zone} (${z.name}): ${res.min}${res.max ? ' - ' + res.max : '+'} bpm`;
        });
        setResult({
          result: resZones.join('\n'),
          methodSelected: selectedModel.name,
          confidenceLabel: selectedModel.precision,
          formulaUsed: selectedModel.formulaDisplay,
          inputUsed: { HRmax: m, RHR: r },
          limitations: (selectedModel as any).limitations?.join(' ')
        });
      } else if (selectedModel.basis === 'lthr') {
        const l = parseInt(lthr);
        if (isNaN(l) || l <= 0) return;
        const resZones = zones.map(z => {
          const res = zoneFromLthr(l, z.minPct, z.maxPct);
          return `${z.zone} (${z.name}): ${res.min}${res.max ? ' - ' + res.max : '+'} bpm`;
        });
        setResult({
          result: resZones.join('\n'),
          methodSelected: selectedModel.name,
          confidenceLabel: selectedModel.precision,
          formulaUsed: selectedModel.formulaDisplay,
          inputUsed: { LTHR: l },
          limitations: (selectedModel as any).limitations?.join(' ')
        });
      }
    } catch (err) {
      // safe fallback
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Zone Lab
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl text-lg">
          Training zones calculator based on HR.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Calculate Zones</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCalculate} className="space-y-4">
              <div>
                <Label htmlFor="method">Zone Model</Label>
                <Select id="method" value={methodId} onChange={e => setMethodId(e.target.value)}>
                  {hrZoneModels.filter(m => 'zones' in m).map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </Select>
              </div>

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

              <Button type="submit" className="w-full">Calculate Zones</Button>
            </form>
          </CardContent>
        </Card>

        <div>
          {result && (
            <ResultCard result={result} />
          )}
        </div>
      </div>
    </div>
  );
}

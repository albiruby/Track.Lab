'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Label, Button, Select } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { calculateHrMax, calculateKarvonenZones } from '@/lib/calculators';
import { HR_MAX_METHODS, METHOD_KARVONEN } from '@/data';

export default function HeartRateLabPage() {
  const [age, setAge] = useState('30');
  const [hrMaxMethod, setHrMaxMethod] = useState('tanaka');
  const [hrMaxResult, setHrMaxResult] = useState<ReturnType<typeof calculateHrMax> | null>(null);

  const [hrMaxTarget, setHrMaxTarget] = useState('190');
  const [hrRest, setHrRest] = useState('60');
  const [zonesResult, setZonesResult] = useState<ReturnType<typeof calculateKarvonenZones> | null>(null);

  const handleMaxCalc = (e: React.FormEvent) => {
    e.preventDefault();
    const a = parseInt(age);
    if (!isNaN(a) && a > 0 && a < 120) {
      const res = calculateHrMax(a, hrMaxMethod);
      setHrMaxResult(res);
      setHrMaxTarget(res.result.toString());
    }
  };

  const handleZonesCalc = (e: React.FormEvent) => {
    e.preventDefault();
    const max = parseInt(hrMaxTarget);
    const rest = parseInt(hrRest);
    if (!isNaN(max) && !isNaN(rest) && max > rest) {
      setZonesResult(calculateKarvonenZones(max, rest));
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Heart Rate Lab</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Calculate Maximum Heart Rate estimates & Training Zones based on physiology.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maximum Heart Rate (HRmax)</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMaxCalc} className="space-y-4">
                <div className="space-y-4">
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
                </div>
                <Button type="submit" className="w-full">Estimate HRmax</Button>
              </form>
            </CardContent>
          </Card>
          
          {hrMaxResult && (
            <ResultCard result={{...hrMaxResult, result: `${hrMaxResult.result} bpm`}} />
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Karvonen Target Zones (HRR)</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleZonesCalc} className="space-y-4">
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
                <Button type="submit" className="w-full">Calculate Zones</Button>
              </form>
            </CardContent>
          </Card>

          {zonesResult && (
            <ResultCard result={{
              ...zonesResult,
              result: (
                <div className="w-full space-y-2 text-sm">
                  {zonesResult.result.map((z, i) => (
                    <div key={i} className="flex justify-between items-center py-2 px-3 bg-zinc-100 dark:bg-zinc-800/50 rounded-md">
                      <span className="font-medium">{z.name} ({z.intensity})</span>
                      <span className="font-mono text-zinc-900 dark:text-zinc-100">~{z.bpm} bpm</span>
                    </div>
                  ))}
                </div>
              )
            }} />
          )}
        </div>
      </div>
    </div>
  );
}

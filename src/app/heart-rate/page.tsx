'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Label, Button, Select, ValidationMessage } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { LabPageHeader } from '@/components/layout/LabPageHeader';
import { safeNumber } from '@/lib/formatters/time';
import { calculateHrMax, calculateKarvonenZones } from '@/lib/calculators';
import { HR_MAX_METHODS, METHOD_KARVONEN } from '@/data';

export default function HeartRateLabPage() {
  const [age, setAge] = useState('30');
  const [hrMaxMethod, setHrMaxMethod] = useState('tanaka');
  const [hrMaxResult, setHrMaxResult] = useState<ReturnType<typeof calculateHrMax> | null>(null);
  const [errorMax, setErrorMax] = useState<string | null>(null);

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

  const handleMaxCalc = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMax(null);
    const a = safeNumber(age);
    if (a === null || a <= 0 || a > 120) return setErrorMax('Please enter a valid age (1-120).');
    
    const res = calculateHrMax(a, hrMaxMethod);
    setHrMaxResult(res);
    setHrMaxTarget(res.result.toString());
  };

  const handleZonesCalc = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorZones(null);
    const max = safeNumber(hrMaxTarget);
    const rest = safeNumber(hrRest);
    
    if (max === null || max <= 0) return setErrorZones('Invalid Max HR');
    if (rest === null || rest <= 0) return setErrorZones('Invalid Rest HR');
    if (max <= rest) return setErrorZones('Max HR must be greater than Rest HR');

    setZonesResult(calculateKarvonenZones(max, rest));
  };

  return (
    <div className="space-y-6 pb-10">
      <LabPageHeader title="Heart Rate Lab" subtitle="Calculate Maximum Heart Rate estimates & Training Zones based on physiology." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-6 flex flex-col h-full">
          <Card>
            <CardHeader>
              <CardTitle>Maximum Heart Rate (HRmax)</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMaxCalc} className="space-y-4" noValidate>
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
                <ValidationMessage message={errorMax} />
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">Calculate</Button>
                  <Button type="button" variant="outline" onClick={handleResetMax} className="flex-1">Reset</Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {hrMaxResult && (
            <div className="h-full mt-6">
              <ResultCard result={{...hrMaxResult, result: `${hrMaxResult.result} bpm`}} />
            </div>
          )}
        </div>

        <div className="space-y-6 flex flex-col h-full">
          <Card>
            <CardHeader>
              <CardTitle>Karvonen Target Zones (HRR)</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleZonesCalc} className="space-y-4" noValidate>
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
                <ValidationMessage message={errorZones} />
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1">Calculate</Button>
                  <Button type="button" variant="outline" onClick={handleResetZones} className="flex-1">Reset</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {zonesResult && (
            <div className="h-full mt-6">
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
                        <div className="w-full bg-neutral-200 h-6 rounded-md overflow-hidden border-2 border-border-heavy relative">
                          <div className="absolute top-0 bottom-0 bg-primary border-r-2 border-border-heavy opacity-90" style={{ left: 0, width: `${maxPct}%` }}></div>
                        </div>
                      </div>
                    )})}
                  </div>
                )
              }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

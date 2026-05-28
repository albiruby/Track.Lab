'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input, Label, Button, Select, ValidationMessage } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { LabPageHeader } from '@/components/layout/LabPageHeader';
import { cadence, strideLengthMeters, stepCount } from '@/lib/calculators';
import { methodRegistry } from '@/data';
import { CalculatorResult } from '@/types';
import { parseDurationToSeconds , safeNumber } from '@/lib/formatters/time';

export default function BiomechanicsPage() {
  const [error, setError] = useState<string | null>(null);
  const [speed, setSpeed] = useState('200'); // m/min
  const [cadenceVal, setCadenceVal] = useState('170');
  const [strideResult, setStrideResult] = useState<CalculatorResult<string> | null>(null);

  const [steps, setSteps] = useState('1700');
  const [cadenceDuration, setCadenceDuration] = useState('10');
  const [cadenceResult, setCadenceResult] = useState<CalculatorResult<string> | null>(null);

  const [stepCadence, setStepCadence] = useState('170');
  const [stepDuration, setStepDuration] = useState('60');
  const [stepCountResult, setStepCountResult] = useState<CalculatorResult<string> | null>(null);

  const handleReset = () => { window.location.reload(); };

  const calculateStride = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const spd = parseFloat(speed);
      const cad = parseFloat(cadenceVal);

      if (spd > 0 && cad > 0) {
        const stride = strideLengthMeters(spd, cad);
        const methodMeta = methodRegistry.find((m) => m.id === 'stride_length')!;

        setStrideResult({
          result: `${stride.toFixed(2)} m`,
          inputUsed: { 'Speed (m/min)': spd, 'Cadence (spm)': cad },
          methodSelected: methodMeta.name,
          formulaUsed: methodMeta.formulaDisplay,
          confidenceLabel: methodMeta.precision?.replace('_', ' ') || 'mathematical',
          limitations: Array.isArray(methodMeta.limitations) ? methodMeta.limitations.join(' ') : String(methodMeta.limitations || '')
        });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const calculateCadence = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const stp = parseFloat(steps);
      const dur = parseFloat(cadenceDuration);

      if (stp > 0 && dur > 0) {
        const cad = cadence(stp, dur);
        const methodMeta = methodRegistry.find((m) => m.id === 'cadence') || {
           name: 'Cadence',
           formulaDisplay: 'cadence = steps / durationMinutes',
           precision: 'mathematical',
           limitations: []
        };

        setCadenceResult({
          result: `${Math.round(cad)} spm`,
          inputUsed: { 'Steps': stp, 'Duration (min)': dur },
          methodSelected: methodMeta.name,
          formulaUsed: methodMeta.formulaDisplay,
          confidenceLabel: methodMeta.precision?.replace('_', ' ') || 'mathematical',
          limitations: Array.isArray(methodMeta.limitations) ? methodMeta.limitations.join(' ') : String(methodMeta.limitations || '')
        });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const calculateStepCount = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const cad = parseFloat(stepCadence);
      const dur = parseFloat(stepDuration);

      if (cad > 0 && dur > 0) {
        const stp = stepCount(cad, dur);
        const methodMeta = methodRegistry.find((m) => m.id === 'step_count') || {
           name: 'Step Count',
           formulaDisplay: 'steps = cadence * durationMinutes',
           precision: 'mathematical',
           limitations: []
        };

        setStepCountResult({
          result: `${Math.round(stp)} steps`,
          inputUsed: { 'Cadence (spm)': cad, 'Duration (min)': dur },
          methodSelected: methodMeta.name,
          formulaUsed: methodMeta.formulaDisplay,
          confidenceLabel: methodMeta.precision?.replace('_', ' ') || 'mathematical',
          limitations: Array.isArray(methodMeta.limitations) ? methodMeta.limitations.join(' ') : String(methodMeta.limitations || '')
        });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <LabPageHeader title="BIOMECHANICS" subtitle="Calculate cadence and stride length relationships." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Stride Length Calculator</CardTitle>
            <CardDescription>Calculate stride length from running speed and cadence.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={calculateStride} className="space-y-4" noValidate>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="speed">Speed (m/min)</Label>
                  <Input id="speed" type="number" step="any" value={speed} onChange={e => setSpeed(e.target.value)} required />
                  <div className="text-xs text-zinc-500 mt-1">E.g., 5:00/km = 200 m/min</div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cadenceVal">Cadence (spm)</Label>
                  <Input id="cadenceVal" type="number" step="any" value={cadenceVal} onChange={e => setCadenceVal(e.target.value)} required />
                </div>
              </div>
              <ValidationMessage message={error} />
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 ">Calculate</Button>
                  <Button type="button" variant="outline" onClick={handleReset} className="flex-1">Reset</Button>
                </div>
            </form>
          </CardContent>
        </Card>

        {strideResult && (
          <div className="h-full"><ResultCard result={strideResult} /></div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Cadence Calculator</CardTitle>
            <CardDescription>Calculate cadence (steps per minute) from total steps taken.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={calculateCadence} className="space-y-4" noValidate>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="steps">Total Steps</Label>
                  <Input id="steps" type="number" step="any" value={steps} onChange={e => setSteps(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cadenceDuration">Duration (min)</Label>
                  <Input id="cadenceDuration" type="number" step="any" value={cadenceDuration} onChange={e => setCadenceDuration(e.target.value)} required />
                </div>
              </div>
              <ValidationMessage message={error} />
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 ">Calculate</Button>
                  <Button type="button" variant="outline" onClick={handleReset} className="flex-1">Reset</Button>
                </div>
            </form>
          </CardContent>
        </Card>

        {cadenceResult && (
          <div className="h-full"><ResultCard result={cadenceResult} /></div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Step Count Calculator</CardTitle>
            <CardDescription>Calculate total steps taken from cadence and duration.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={calculateStepCount} className="space-y-4" noValidate>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stepCadence">Cadence (spm)</Label>
                  <Input id="stepCadence" type="number" step="any" value={stepCadence} onChange={e => setStepCadence(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stepDuration">Duration (min)</Label>
                  <Input id="stepDuration" type="number" step="any" value={stepDuration} onChange={e => setStepDuration(e.target.value)} required />
                </div>
              </div>
              <ValidationMessage message={error} />
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 ">Calculate</Button>
                  <Button type="button" variant="outline" onClick={handleReset} className="flex-1">Reset</Button>
                </div>
            </form>
          </CardContent>
        </Card>

        {stepCountResult && (
          <div className="h-full"><ResultCard result={stepCountResult} /></div>
        )}
      </div>
    </div>
  );
}

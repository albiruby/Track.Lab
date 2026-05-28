'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input, Label, Button, Select } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { cooper12MinuteVo2, acsmRunningVo2, metFromVo2, caloriesFromMet } from '@/lib/calculators';
import { methodRegistry } from '@/data';
import { CalculatorResult } from '@/types';

export default function Vo2Page() {
  const [cooperDist, setCooperDist] = useState('2800');
  const [cooperResult, setCooperResult] = useState<CalculatorResult<string> | null>(null);

  const [acsmSpeed, setAcsmSpeed] = useState('200'); // m/min
  const [acsmGrade, setAcsmGrade] = useState('0'); // %
  const [acsmMass, setAcsmMass] = useState('70'); // kg
  const [acsmDuration, setAcsmDuration] = useState('60'); // min
  const [acsmResult, setAcsmResult] = useState<CalculatorResult<any> | null>(null);

  const calculateCooper = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dist = parseFloat(cooperDist);
      if (dist > 0) {
        const vo2 = cooper12MinuteVo2(dist);
        const methodMeta = methodRegistry.find((m) => m.id === 'cooper_12min')!;

        setCooperResult({
          result: vo2.toFixed(1) + ' ml/kg/min',
          inputUsed: { 'Distance (m)': dist },
          methodSelected: methodMeta.name,
          formulaUsed: methodMeta.formulaDisplay,
          confidenceLabel: 'estimated VO2max, not lab-measured',
          limitations: 'Indirect estimate. ' + (Array.isArray(methodMeta.limitations) ? methodMeta.limitations.join(' ') : String(methodMeta.limitations || ''))
        });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const calculateAcsm = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const speed = parseFloat(acsmSpeed);
      const grade = parseFloat(acsmGrade);
      const mass = parseFloat(acsmMass);
      const dur = parseFloat(acsmDuration);

      if (speed > 0 && grade >= 0 && mass > 0 && dur > 0) {
        const vo2 = acsmRunningVo2(speed, grade / 100);
        const met = metFromVo2(vo2);
        const kcals = caloriesFromMet(met, mass, dur);
        
        const methodMeta = methodRegistry.find((m) => m.id === 'acsm_running_vo2')!;

        setAcsmResult({
          result: (
            <div className="space-y-4 w-full">
              <div className="flex justify-between items-center bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-lg">
                <span className="text-sm font-semibold uppercase text-zinc-500">Running VO2</span>
                <span className="text-xl font-bold font-mono">{vo2.toFixed(1)} ml/kg/min</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-lg">
                <span className="text-sm font-semibold uppercase text-zinc-500">METs Equivalent</span>
                <span className="text-xl font-bold font-mono">{met.toFixed(1)}</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20">
                <span className="text-sm font-semibold uppercase text-emerald-600 dark:text-emerald-400">Calories</span>
                <span className="text-xl font-bold font-mono text-emerald-700 dark:text-emerald-300">{kcals.toFixed(0)} kcal</span>
              </div>
            </div>
          ),
          inputUsed: { 'Speed': speed, 'Grade': grade, 'Mass (kg)': mass, 'Duration (min)': dur },
          methodSelected: methodMeta.name,
          formulaUsed: 'VO2 + MET = VO2/3.5 + kcal = METs x 3.5 x Mass / 200 x Time',
          confidenceLabel: 'indirect estimate',
          limitations: 'Estimated VO2max, not lab-measured. Requires valid input.'
        });
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">VO2 & Metabolic Lab</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Estimate VO2max, METs, and caloric expenditure.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cooper 12-Minute Test</CardTitle>
              <CardDescription>Estimate VO2max from the distance covered in 12 minutes.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={calculateCooper} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cooperDist">Distance covered in 12 minutes (meters)</Label>
                  <Input id="cooperDist" type="number" step="any" value={cooperDist} onChange={e => setCooperDist(e.target.value)} required />
                </div>
                <Button type="submit" className="w-full">Calculate VO2max</Button>
              </form>
            </CardContent>
          </Card>

          {cooperResult && (
            <ResultCard result={cooperResult} />
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ACSM Running Equation & METs</CardTitle>
              <CardDescription>Estimate VO2 and METs required for a given speed and gradient.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={calculateAcsm} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="acsmSpeed">Speed (m/min)</Label>
                    <Input id="acsmSpeed" type="number" step="any" value={acsmSpeed} onChange={e => setAcsmSpeed(e.target.value)} required />
                    <div className="text-xs text-zinc-500 mt-1">E.g., 5:00/km = 200 m/min</div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="acsmGrade">Treadmill Grade (%)</Label>
                    <Input id="acsmGrade" type="number" step="any" value={acsmGrade} onChange={e => setAcsmGrade(e.target.value)} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="acsmMass">Body Mass (kg)</Label>
                    <Input id="acsmMass" type="number" step="any" value={acsmMass} onChange={e => setAcsmMass(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="acsmDuration">Duration (min)</Label>
                    <Input id="acsmDuration" type="number" step="any" value={acsmDuration} onChange={e => setAcsmDuration(e.target.value)} required />
                  </div>
                </div>
                <Button type="submit" className="w-full">Calculate VO2 & METs</Button>
              </form>
            </CardContent>
          </Card>

          {acsmResult && (
            <ResultCard result={acsmResult} />
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input, Label, Button, Select, ValidationMessage } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { LabPageHeader } from '@/components/layout/LabPageHeader';
import { cooper12MinuteVo2, acsmRunningVo2, metFromVo2, caloriesFromMet } from '@/lib/calculators';
import { methodRegistry } from '@/data';
import { CalculatorResult } from '@/types';

export default function Vo2Page() {
  const [cooperDist, setCooperDist] = useState('2800');
  const [cooperResult, setCooperResult] = useState<CalculatorResult<string> | null>(null);
  const [errorCooper, setErrorCooper] = useState<string | null>(null);

  const [acsmSpeed, setAcsmSpeed] = useState('200'); // m/min
  const [acsmGrade, setAcsmGrade] = useState('0'); // %
  const [acsmMass, setAcsmMass] = useState('70'); // kg
  const [acsmDuration, setAcsmDuration] = useState('60'); // min
  const [acsmResult, setAcsmResult] = useState<CalculatorResult<any> | null>(null);
  const [errorAcsm, setErrorAcsm] = useState<string | null>(null);

  const handleResetCooper = () => {
    setCooperDist('2800');
    setCooperResult(null);
    setErrorCooper(null);
  };

  const handleResetAcsm = () => {
    setAcsmSpeed('200');
    setAcsmGrade('0');
    setAcsmMass('70');
    setAcsmDuration('60');
    setAcsmResult(null);
    setErrorAcsm(null);
  };

  const calculateCooper = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorCooper(null);
    try {
      const dist = parseFloat(cooperDist);
      if (isNaN(dist) || dist <= 0) return setErrorCooper('Invalid distance.');
      
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
    } catch (err: any) {
      setErrorCooper(err.message);
    }
  };

  const calculateAcsm = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorAcsm(null);
    try {
      const speed = parseFloat(acsmSpeed);
      const grade = parseFloat(acsmGrade);
      const mass = parseFloat(acsmMass);
      const dur = parseFloat(acsmDuration);

      if (isNaN(speed) || speed <= 0) return setErrorAcsm('Invalid speed.');
      if (isNaN(grade) || grade < 0) return setErrorAcsm('Invalid grade.');
      if (isNaN(mass) || mass <= 0) return setErrorAcsm('Invalid mass.');
      if (isNaN(dur) || dur <= 0) return setErrorAcsm('Invalid duration.');

      const vo2 = acsmRunningVo2(speed, grade / 100);
      const met = metFromVo2(vo2);
      const kcals = caloriesFromMet(met, mass, dur);
      
      const methodMeta = methodRegistry.find((m) => m.id === 'acsm_running_vo2')!;

      setAcsmResult({
        result: (
          <div className="flex flex-col p-2 space-y-1">
            <div className="flex justify-between p-2 border-b border-border">
              <span className="font-medium text-sm">Running VO2</span>
              <span className="font-mono text-primary">{vo2.toFixed(1)} ml/kg/min</span>
            </div>
            <div className="flex justify-between p-2 border-b border-border">
              <span className="font-medium text-sm">METs Equivalent</span>
              <span className="font-mono text-primary">{met.toFixed(1)}</span>
            </div>
            <div className="flex justify-between p-2">
              <span className="font-medium text-sm">Calories</span>
              <span className="font-mono text-primary">{kcals.toFixed(0)} kcal</span>
            </div>
          </div>
        ),
        inputUsed: { 'Speed': speed, 'Grade': grade, 'Mass (kg)': mass, 'Duration (min)': dur },
        methodSelected: methodMeta.name,
        formulaUsed: 'VO2 + MET = VO2/3.5 + kcal = METs x 3.5 x Mass / 200 x Time',
        confidenceLabel: 'indirect estimate',
        limitations: 'Estimated VO2max, not lab-measured. Requires valid input.'
      });
    } catch (err: any) {
      setErrorAcsm(err.message);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <LabPageHeader title="VO2 & Metabolic Lab" subtitle="Estimate VO2max, METs, and caloric expenditure." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-6 flex flex-col h-full">
          <Card>
            <CardHeader>
              <CardTitle>Cooper 12-minute Test</CardTitle>
              <CardDescription>Estimate VO2max from the distance covered in 12 minutes.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={calculateCooper} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="cooperDist">Distance covered in 12 minutes (meters)</Label>
                  <Input id="cooperDist" type="number" step="any" value={cooperDist} onChange={e => setCooperDist(e.target.value)} required />
                </div>
                <ValidationMessage message={errorCooper} />
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 ">Calculate</Button>
                  <Button type="button" variant="outline" onClick={handleResetCooper} className="flex-1">Reset</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {cooperResult && (
            <div className="h-full">
              <ResultCard result={cooperResult} />
            </div>
          )}
        </div>

        <div className="space-y-6 flex flex-col h-full">
          <Card>
            <CardHeader>
              <CardTitle>Acsm Running Equation & Mets</CardTitle>
              <CardDescription>Estimate VO2 and METs required for a given speed and gradient.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={calculateAcsm} className="space-y-4" noValidate>
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
                <ValidationMessage message={errorAcsm} />
                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="flex-1 ">Calculate</Button>
                  <Button type="button" variant="outline" onClick={handleResetAcsm} className="flex-1">Reset</Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {acsmResult && (
            <div className="h-full">
              <ResultCard result={acsmResult} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input, Label, Button, Select } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { gradePercent, elevationPerKm, verticalSpeedMetersPerHour } from '@/lib/calculators';
import { methodRegistry } from '@/data';
import { CalculatorResult } from '@/types';
import { WarningNote } from '@/components/ui/Note';

export default function EnvironmentPage() {
  const [elevationGain, setElevationGain] = useState('500');
  const [distance, setDistance] = useState('10000');
  const [gradeResult, setGradeResult] = useState<CalculatorResult<string> | null>(null);

  const [vGain, setVGain] = useState('1000');
  const [vDuration, setVDuration] = useState('2.5');
  const [vSpeedResult, setVSpeedResult] = useState<CalculatorResult<string> | null>(null);

  const calculateGrade = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const gain = parseFloat(elevationGain);
      const dist = parseFloat(distance);

      if (gain >= 0 && dist > 0) {
        const grade = gradePercent(gain, dist);
        const elevKm = elevationPerKm(gain, dist / 1000);
        const methodMeta = methodRegistry.find((m) => m.id === 'grade_pct')!;

        setGradeResult({
          result: (
            <div className="space-y-4 w-full">
              <div className="flex justify-between items-center bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-lg">
                <span className="text-sm font-semibold uppercase text-zinc-500">Average Grade</span>
                <span className="text-xl font-bold font-mono">{grade.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between items-center bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-lg">
                <span className="text-sm font-semibold uppercase text-zinc-500">Elevation Per Km</span>
                <span className="text-xl font-bold font-mono">{elevKm.toFixed(0)} m/km</span>
              </div>
            </div>
          ) as any,
          inputUsed: { 'Gain (m)': gain, 'Distance (m)': dist },
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

  const calculateVSpeed = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const gain = parseFloat(vGain);
      const dur = parseFloat(vDuration);

      if (gain >= 0 && dur > 0) {
        const vSpeed = verticalSpeedMetersPerHour(gain, dur);
        const methodMeta = methodRegistry.find((m) => m.id === 'vertical_speed')!;

        setVSpeedResult({
          result: `${vSpeed.toFixed(0)} m/hr`,
          inputUsed: { 'Gain (m)': gain, 'Duration (hours)': dur },
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
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Environment & Elevation Lab</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Calculate gradients, elevation metrics, and review environmental adjustments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Average Grade Calculator</CardTitle>
              <CardDescription>Calculate average slope percentage and elevation per km.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={calculateGrade} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="elevationGain">Elevation Gain (m)</Label>
                    <Input id="elevationGain" type="number" step="any" value={elevationGain} onChange={e => setElevationGain(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="distance">Horizontal Distance (m)</Label>
                    <Input id="distance" type="number" step="any" value={distance} onChange={e => setDistance(e.target.value)} required />
                  </div>
                </div>
                <Button type="submit" className="w-full">Calculate Grade Analysis</Button>
              </form>
            </CardContent>
          </Card>

          {gradeResult && <ResultCard result={gradeResult} />}
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vertical Speed Calculator</CardTitle>
              <CardDescription>Calculate your ascending rate (VAM) in meters per hour.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={calculateVSpeed} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vGain">Elevation Gain (m)</Label>
                    <Input id="vGain" type="number" step="any" value={vGain} onChange={e => setVGain(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vDuration">Duration (hours)</Label>
                    <Input id="vDuration" type="number" step="any" value={vDuration} onChange={e => setVDuration(e.target.value)} required />
                  </div>
                </div>
                <Button type="submit" className="w-full">Calculate Vertical Speed</Button>
              </form>
            </CardContent>
          </Card>

          {vSpeedResult && <ResultCard result={vSpeedResult} />}

          <Card>
            <CardHeader>
              <CardTitle>Environmental Condition Factors</CardTitle>
              <CardDescription>Estimate only. Modifiers for extreme conditions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <WarningNote>
                <strong>Heat & Humidity:</strong> Significant adjustments to pace and perceived effort are required when temperature exceeds 15°C (60°F) or dew point is high. Standard pace calculators do not account for heat stress.
              </WarningNote>
              <WarningNote>
                <strong>Altitude:</strong> Aerobic capacity decreases linearly above ~600m (2000ft). Expect slower times and higher heart rates for the same effort.
              </WarningNote>
              <WarningNote className="border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 text-red-900 dark:text-red-200">
                <strong>Important:</strong> These are mathematical estimates only. Actual performance depends on individual response, acclimatization, terrain, wind, hydration, and conditions.
              </WarningNote>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

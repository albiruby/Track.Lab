'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input, Label, Button, Select } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { LabPageHeader } from '@/components/layout/LabPageHeader';
import { formatPace, parseTimeStringToSeconds } from '@/lib/formatters/time';

export default function TreadmillLab() {
  const [inputType, setInputType] = useState('speed_kmh');
  const [inputValue, setInputValue] = useState('12');
  const [incline, setIncline] = useState('1');
  const [result, setResult] = useState<any | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    
    let speedKmh = 0;
    
    if (inputType === 'speed_kmh') {
      speedKmh = parseFloat(inputValue);
    } else if (inputType === 'speed_mph') {
      speedKmh = parseFloat(inputValue) * 1.609344;
    } else if (inputType === 'pace_km') {
      const secs = parseTimeStringToSeconds(inputValue);
      if (secs > 0) speedKmh = 3600 / secs;
    }

    const inc = parseFloat(incline) || 0;

    if (isNaN(speedKmh) || speedKmh <= 0) return;

    const speedMph = speedKmh * 0.621371;
    const paceKmhSecs = 3600 / speedKmh;
    const paceMphSecs = 3600 / speedMph;

    // ACSM running VO2: speed in m/min, grade as decimal
    const speedMMin = (speedKmh * 1000) / 60;
    const gradeDecimal = inc / 100;
    const vo2 = (0.2 * speedMMin) + (0.9 * speedMMin * gradeDecimal) + 3.5;
    const met = vo2 / 3.5;

    let stats = [
      `Speed: ${speedKmh.toFixed(1)} km/h (${speedMph.toFixed(1)} mph)`,
      `Pace: ${formatPace(paceKmhSecs)} /km (${formatPace(paceMphSecs)} /mi)`,
      `Incline: ${inc}%`
    ];

    if (speedKmh >= 8) { // generally only valid for running speeds
      stats.push(`Est. VO2 Demand: ${vo2.toFixed(1)} ml/kg/min`);
      stats.push(`Est. METs: ${met.toFixed(1)}`);
    }

    setResult({
      result: stats.join('\n'),
      methodSelected: 'Treadmill Conversions + ACSM',
      confidenceLabel: 'exact/estimate',
      formulaUsed: 'Speed=D/T | VO2 = 0.2*S + 0.9*S*G + 3.5',
      inputUsed: { input: inputValue, incline: inc + '%' },
      limitations: 'ACSM equation valid for steady state running (typically 8+ km/h).'
    });
  };

  return (
    <div className="space-y-6">
      <LabPageHeader title="TREADMILL DYNAMICS" subtitle="Conversions for speed, pace, and estimated oxygen demand based on incline." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Calculate Treadmill Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCalculate} className="space-y-4">
              <div>
                <Label htmlFor="inputType">Input Type</Label>
                <Select id="inputType" value={inputType} onChange={e => setInputType(e.target.value)}>
                  <option value="speed_kmh">Speed (km/h)</option>
                  <option value="speed_mph">Speed (mph)</option>
                  <option value="pace_km">Pace (min/km, e.g. 5:00)</option>
                </Select>
              </div>

              <div>
                <Label htmlFor="inputValue">Value</Label>
                <Input 
                  id="inputValue" required
                  value={inputValue} onChange={e => setInputValue(e.target.value)} 
                />
              </div>

              <div>
                <Label htmlFor="incline">Incline (%)</Label>
                <Input 
                  id="incline" type="number" step="0.5" required
                  value={incline} onChange={e => setIncline(e.target.value)} 
                />
              </div>

              <Button type="submit" className="w-full mt-4">Calculate</Button>
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

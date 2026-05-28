'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Label, Button, ValidationMessage } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { LabPageHeader } from '@/components/layout/LabPageHeader';
import { calculatePace } from '@/lib/calculators';
import { formatPace, parseDurationToSeconds, safeNumber } from '@/lib/formatters/time';

export default function PaceLabPage() {
  const [distance, setDistance] = useState('5');
  const [timeStr, setTimeStr] = useState('25:00');
  const [result, setResult] = useState<ReturnType<typeof calculatePace> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const d = safeNumber(distance);
    const secs = parseDurationToSeconds(timeStr);
    
    if (d === null || d <= 0) {
      setError('Please enter a valid positive distance.');
      return;
    }
    if (secs === null || secs <= 0) {
      setError('Please enter a valid duration (MM:SS or HH:MM:SS).');
      return;
    }
    
    setResult(calculatePace(d, secs));
  };

  const handleReset = () => {
    setDistance('5');
    setTimeStr('25:00');
    setResult(null);
    setError(null);
  };

  return (
    <div className="space-y-6">
      <LabPageHeader title="Pace Lab" subtitle="Calculate running pace strictly from distance and time." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <div className="space-y-6 flex flex-col h-full">
          <Card>
            <CardHeader>
              <CardTitle>Distance & Time To Pace</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCalculate} className="space-y-4" noValidate>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="distance">Distance in km</Label>
                    <Input 
                      id="distance" 
                      type="number" 
                      step="0.01" 
                      min="0.1" 
                      value={distance} 
                      onChange={(e) => setDistance(e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="timeStr">Time (HH:MM:SS or MM:SS)</Label>
                    <Input 
                      id="timeStr" 
                      type="text" 
                      placeholder="e.g. 25:00, 1:45:00"
                      title="Format: MM:SS or HH:MM:SS"
                      value={timeStr} 
                      onChange={(e) => setTimeStr(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <ValidationMessage message={error} />
                <div className="flex gap-3 pt-2">
                  <Button type="submit" className="flex-1">Calculate</Button>
                  <Button type="button" variant="outline" onClick={handleReset} className="flex-1">Reset</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="h-full">
          {result && (
            <ResultCard 
              result={{
                ...result,
                result: formatPace(result.result)
              }} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

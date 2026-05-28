'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Label, Button } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { LabPageHeader } from '@/components/layout/LabPageHeader';
import { calculatePace } from '@/lib/calculators';
import { formatPace, parseTimeStringToSeconds } from '@/lib/formatters/time';

export default function PaceLabPage() {
  const [distance, setDistance] = useState('5');
  const [timeStr, setTimeStr] = useState('25:00');
  const [result, setResult] = useState<ReturnType<typeof calculatePace> | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const d = parseFloat(distance);
    const secs = parseTimeStringToSeconds(timeStr);
    if (!isNaN(d) && d > 0 && secs > 0) {
      setResult(calculatePace(d, secs));
    }
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
              <form onSubmit={handleCalculate} className="space-y-4">
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
                      pattern="^(\\d{1,2}:)?([0-5]?\\d):([0-5]?\\d)$"
                      placeholder="e.g. 25:00, 1:45:00"
                      title="Format: MM:SS or HH:MM:SS"
                      value={timeStr} 
                      onChange={(e) => setTimeStr(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full mt-4">Calculate</Button>
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

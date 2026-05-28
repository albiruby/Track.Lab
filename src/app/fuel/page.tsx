'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Label, Button } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { calculateFuel } from '@/lib/calculators/fuel';
import { parseTimeStringToSeconds } from '@/lib/formatters/time';

export default function FuelLabPage() {
  const [duration, setDuration] = useState('2:30:00');
  const [carbRate, setCarbRate] = useState('60');
  const [result, setResult] = useState<ReturnType<typeof calculateFuel> | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const durationHours = parseTimeStringToSeconds(duration) / 3600;
    const rate = parseInt(carbRate);

    if (durationHours > 0 && !isNaN(rate) && rate > 0) {
      setResult(calculateFuel(durationHours, rate));
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Fuel & Hydration Lab</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Calculate endogenous carbohydrate requirements for long efforts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Carb Requirement</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCalculate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Session Duration</Label>
                    <Input 
                      id="duration" 
                      type="text" 
                      pattern="^(\\d{1,2}:)?([0-5]?\\d):([0-5]?\\d)$"
                      placeholder="HH:MM:SS"
                      value={duration} 
                      onChange={(e) => setDuration(e.target.value)} 
                      required 
                    />
                  </div>
                  <div>
                    <Label htmlFor="carbRate">Target Carbs/hr (g)</Label>
                    <Input 
                      id="carbRate" 
                      type="number" 
                      min="10" 
                      max="120" 
                      value={carbRate} 
                      onChange={(e) => setCarbRate(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <div className="text-xs text-zinc-500 mb-2">Note: Scientific consensus recommends 30-60g/hr for efforts ~2hrs, and up to 90-120g/hr for efforts &gt; 3hrs.</div>
                <Button type="submit" className="w-full">Calculate Fuel</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div>
          {result && (
            <ResultCard 
              result={{
                ...result,
                result: (
                  <div className="w-full space-y-4">
                    <div className="flex flex-col items-center p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-lg">
                      <span className="text-zinc-500 text-sm mb-1 uppercase tracking-wider font-semibold">Total Session Carbs</span>
                      <span className="font-mono text-3xl font-bold text-zinc-900 dark:text-zinc-100">{result.result.totalCarbs}g</span>
                    </div>
                    
                    <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                      <div className="text-sm font-medium">Equivalents (approximate)</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-md">
                          <div className="font-mono text-xl mb-1 text-zinc-900 dark:text-zinc-100">{result.result.gelsAt20g}</div>
                          <div className="text-zinc-500 text-xs">Standard Gels (20g ea)</div>
                        </div>
                        <div className="p-3 border border-zinc-200 dark:border-zinc-800 rounded-md">
                          <div className="font-mono text-xl mb-1 text-zinc-900 dark:text-zinc-100">{result.result.gelsAt30g}</div>
                          <div className="text-zinc-500 text-xs">Premium Gels (30g ea)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              }} 
            />
          )}
        </div>
      </div>
    </div>
  );
}

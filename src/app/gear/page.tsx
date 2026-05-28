'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input, Label, Button } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import { LabPageHeader } from '@/components/layout/LabPageHeader';

export default function GearLab() {
  const [shoePrice, setShoePrice] = useState('150');
  const [currentMileage, setCurrentMileage] = useState('200');
  const [maxMileage, setMaxMileage] = useState('600');
  const [raceDist, setRaceDist] = useState('');
  
  const [gelPrice, setGelPrice] = useState('');
  const [gelCount, setGelCount] = useState('');
  const [mixPrice, setMixPrice] = useState('');
  const [mixServings, setMixServings] = useState('');
  
  const [result, setResult] = useState<any | null>(null);

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    
    let stats = [];

    const sp = parseFloat(shoePrice);
    const cm = parseFloat(currentMileage);
    const mm = parseFloat(maxMileage);

    if (!isNaN(cm) && !isNaN(mm) && mm > 0 && cm >= 0) {
      const remaining = mm - cm;
      stats.push(`Remaining Est. Shoe Life: ${remaining.toFixed(0)} km (${((remaining / mm) * 100).toFixed(0)}%)`);
      
      if (!isNaN(sp) && sp > 0) {
        const cpk = sp / mm;
        stats.push(`Shoe Cost/km (projected): $${cpk.toFixed(2)} /km`);
      }
      
      const rd = parseFloat(raceDist);
      if (!isNaN(rd) && rd > 0) {
        stats.push(`Shoe mileage after race: ${(cm + rd).toFixed(0)} km (Remaining: ${(remaining - rd).toFixed(0)} km)`);
      }
    }

    const gp = parseFloat(gelPrice);
    const gc = parseFloat(gelCount);
    if (!isNaN(gp) && !isNaN(gc) && gp > 0 && gc > 0) {
      stats.push(`Fueling Cost (Gels): $${(gp * gc).toFixed(2)}`);
    }

    const mp = parseFloat(mixPrice);
    const ms = parseFloat(mixServings);
    if (!isNaN(mp) && !isNaN(ms) && ms > 0 && mp > 0) {
      stats.push(`Mix Serving Cost: $${(mp / ms).toFixed(2)} /serving`);
    }

    if (stats.length === 0) return;

    setResult({
      result: stats.join('\n'),
      methodSelected: 'Gear & Expense Math',
      confidenceLabel: 'exact calculation',
      formulaUsed: 'Remaining = Max - Current | Cost/km = Price / Max',
      inputUsed: { records: stats.length },
      limitations: 'Calculations are mathematical only. Does not account for variable foam degradation or sales.'
    });
  };

  return (
    <div className="space-y-6">
      <LabPageHeader title="Gear Lab" subtitle="Shoe life, gear cost, and fueling expense tracking estimates." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card>
          <CardHeader>
            <CardTitle>Calculate Expenses & Wear</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCalculate} className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold text-sm">Shoe Wear & Tear</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Shoe Price ($)</Label>
                    <Input type="number" step="0.01" value={shoePrice} onChange={e => setShoePrice(e.target.value)} />
                  </div>
                  <div>
                    <Label>Est. Max Mileage (km)</Label>
                    <Input type="number" value={maxMileage} onChange={e => setMaxMileage(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Current Mileage (km)</Label>
                    <Input type="number" value={currentMileage} onChange={e => setCurrentMileage(e.target.value)} />
                  </div>
                  <div>
                    <Label>Upcoming Race (km)</Label>
                    <Input type="number" value={raceDist} onChange={e => setRaceDist(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2">
                <h3 className="font-semibold text-sm">Fueling Economics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Gel Price ($)</Label>
                    <Input type="number" step="0.01" value={gelPrice} onChange={e => setGelPrice(e.target.value)} />
                  </div>
                  <div>
                    <Label>Gels Needed (qty)</Label>
                    <Input type="number" value={gelCount} onChange={e => setGelCount(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label>Drink Mix Price ($)</Label>
                    <Input type="number" step="0.01" value={mixPrice} onChange={e => setMixPrice(e.target.value)} />
                  </div>
                  <div>
                    <Label>Total Servings</Label>
                    <Input type="number" value={mixServings} onChange={e => setMixServings(e.target.value)} />
                  </div>
                </div>
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

'use client';

import { useState } from 'react';
import { Input, Label, Select } from '@/components/ui/Forms';
import { ResultCard } from '@/components/ui/ResultCard';
import {
  paceSecondsPerKm,
  timeFromDistanceAndPace,
  distanceFromTimeAndPace,
  speedKmhFromPace,
  paceFromSpeedKmh,
  calculateStopAdjustedPace,
  calculateRunWalkBlendedPace,
  paceDriftPercent
} from '@/lib/calculators_pack/pace';
import { formatPace, parseDurationToSeconds, safeNumber, formatSecondsToTimeString } from '@/lib/formatters/time';
import { convertKmToMile } from '@/lib/calculators_pack/conversion';
import { CalculatorPageShell } from '@/components/calculator/CalculatorPageShell';
import { ManualInputPanel } from '@/components/calculator/ManualInputPanel';
import { ExportPanel } from '@/components/calculator/CalculatorSystem';
import { resultToText } from '@/lib/export/manualExport';
import { CalculatorResult } from '@/types';
import Link from 'next/link';

export default function PaceLabPage() {
  const [mode, setMode] = useState<'quick' | 'advanced'>('quick');
  
  const [calcType, setCalcType] = useState('pace'); // pace, time, dist, speed, moving, blended, drift
  
  // Inputs
  const [distance, setDistance] = useState('5');
  const [timeStr, setTimeStr] = useState('25:00');
  const [paceStr, setPaceStr] = useState('5:00');
  const [speedKmh, setSpeedKmh] = useState('12');
  
  // Advanced Inputs
  const [movingTime, setMovingTime] = useState('25:00');
  const [stopTime, setStopTime] = useState('2:00');
  const [runPace, setRunPace] = useState('5:00');
  const [walkPace, setWalkPace] = useState('10:00');
  const [runDur, setRunDur] = useState('5:00');
  const [walkDur, setWalkDur] = useState('1:00');
  const [firstHalfPace, setFirstHalfPace] = useState('5:00');
  const [secondHalfPace, setSecondHalfPace] = useState('4:45');
  
  const [result, setResult] = useState<CalculatorResult<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    let res: CalculatorResult<any> | null = null;
    
    if (calcType === 'pace') {
      const d = safeNumber(distance);
      const secs = parseDurationToSeconds(timeStr);
      if (d === null || d <= 0) return setError('Please enter a valid positive distance.');
      if (secs === null || secs <= 0) return setError('Please enter a valid duration.');
      const p = paceSecondsPerKm(d * 1000, secs);
      const spd = speedKmhFromPace(p);
      res = {
        result: { val: formatPace(p), spd, p },
        methodSelected: 'Pace from Distance + Time',
        confidenceLabel: 'Exact',
        formulaUsed: 'Pace = Time / Distance',
        inputUsed: { Distance: distance, Time: timeStr },
        limitations: 'Calculated perfectly mathematically.'
      };
    } else if (calcType === 'time') {
      const d = safeNumber(distance);
      const p = parseDurationToSeconds(paceStr);
      if (d === null || d <= 0) return setError('Invalid distance.');
      if (p === null || p <= 0) return setError('Invalid pace.');
      const secs = timeFromDistanceAndPace(d * 1000, p);
      res = {
        result: { val: formatSecondsToTimeString(secs), type: 'time' },
        methodSelected: 'Time from Distance + Pace',
        confidenceLabel: 'Exact',
        formulaUsed: 'Time = Distance × Pace',
        inputUsed: { Distance: distance, Pace: paceStr },
        limitations: 'Calculated perfectly mathematically.'
      };
    } else if (calcType === 'dist') {
      const secs = parseDurationToSeconds(timeStr);
      const p = parseDurationToSeconds(paceStr);
      if (secs === null || secs <= 0) return setError('Invalid time.');
      if (p === null || p <= 0) return setError('Invalid pace.');
      const d = distanceFromTimeAndPace(secs, p) / 1000;
      res = {
        result: { val: d.toFixed(3) + ' km', type: 'dist' },
        methodSelected: 'Distance from Time + Pace',
        confidenceLabel: 'Exact',
        formulaUsed: 'Distance = Time / Pace',
        inputUsed: { Time: timeStr, Pace: paceStr },
        limitations: 'Calculated perfectly mathematically.'
      };
    } else if (calcType === 'speed') {
      const spd = safeNumber(speedKmh);
      if (spd === null || spd <= 0) return setError('Invalid speed.');
      const p = paceFromSpeedKmh(spd);
      res = {
        result: { val: formatPace(p), type: 'speed' },
        methodSelected: 'Pace from Speed',
        confidenceLabel: 'Exact',
        formulaUsed: 'Pace = 3600 / speedKmh',
        inputUsed: { 'Speed (km/h)': speedKmh },
        limitations: 'Calculated perfectly mathematically.'
      };
    } else if (calcType === 'moving') {
      const d = safeNumber(distance);
      const mt = parseDurationToSeconds(movingTime);
      const st = parseDurationToSeconds(stopTime);
      if (!d || !mt || st === null) return setError('Invalid inputs.');
      const adj = calculateStopAdjustedPace(d, mt, st);
      res = {
        result: { val: formatPace(adj.elapsedPace), moving: formatPace(adj.movingPace), type: 'moving' },
        methodSelected: 'Stop-Time Adjustment',
        confidenceLabel: 'Exact',
        formulaUsed: 'Elapsed Pace = (Moving Time + Stop Time) / Distance',
        inputUsed: { Distance: distance, MovingTime: movingTime, StopTime: stopTime },
        limitations: 'Does not account for lost rhythm from stopping.'
      };
    } else if (calcType === 'blended') {
      const rp = parseDurationToSeconds(runPace);
      const wp = parseDurationToSeconds(walkPace);
      const rd = parseDurationToSeconds(runDur);
      const wd = parseDurationToSeconds(walkDur);
      if (!rp || !wp || !rd || wd === null) return setError('Invalid inputs.');
      const bp = calculateRunWalkBlendedPace(rp, wp, rd, wd);
      res = {
        result: { val: formatPace(bp), type: 'blended' },
        methodSelected: 'Run/Walk Blended Pace',
        confidenceLabel: 'Exact',
        formulaUsed: 'Blended Pace = Cycle Time / Total Distance in Cycle',
        inputUsed: { RunPace: runPace, WalkPace: walkPace, RunDur: runDur, WalkDur: walkDur },
        limitations: 'Does not account for acceleration/deceleration between walking and running.'
      };
    } else if (calcType === 'drift') {
      const fhp = parseDurationToSeconds(firstHalfPace);
      const shp = parseDurationToSeconds(secondHalfPace);
      if (!fhp || !shp) return setError('Invalid inputs.');
      const drift = paceDriftPercent(fhp, shp);
      res = {
        result: { val: drift > 0 ? `+${drift}% (Slowed)` : `${drift}% (Sped Up)`, type: 'drift' },
        methodSelected: 'Pace Drift',
        confidenceLabel: 'Exact',
        formulaUsed: 'Drift = ((Late Pace - Early Pace) / Early Pace) * 100',
        inputUsed: { FirstHalf: firstHalfPace, SecondHalf: secondHalfPace },
        limitations: 'Only compares early vs late average.'
      };
    }
    
    if (res) {
       setResult({
        ...res,
        result: (
          <div className="flex flex-col gap-4">
             <div className="flex flex-col items-center p-6 bg-primary border-2 border-border-heavy rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
                <span className="text-primary-foreground/80 text-[10px] font-bold uppercase tracking-widest mb-1">
                  {res.result.type === 'time' ? 'Time' :
                   res.result.type === 'dist' ? 'Distance' :
                   res.result.type === 'drift' ? 'Pace Drift' :
                   res.result.type === 'moving' ? 'Elapsed Pace' : 'Pace'}
                </span>
                <span className="font-display text-5xl md:text-6xl font-bold tracking-tighter text-primary-foreground">{res.result.val}</span>
             </div>
             
             {res.result.type === 'moving' && res.result.moving && (
                <div className="flex justify-between items-center p-3 border-2 border-border-heavy bg-card rounded-lg">
                  <span className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Moving Pace</span>
                  <span className="text-lg font-mono font-bold">{res.result.moving}</span>
                </div>
             )}
             
             {res.result.spd && (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="flex flex-col items-center p-3 border-2 border-border-heavy bg-card rounded-lg">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Speed (km/h)</span>
                    <span className="text-lg font-mono font-bold">{res.result.spd.toFixed(1)}</span>
                  </div>
                  <div className="flex flex-col items-center p-3 border-2 border-border-heavy bg-card rounded-lg">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest">Pace (min/mi)</span>
                    <span className="text-lg font-mono font-bold">{formatPace(res.result.p * 1.60934)}</span>
                  </div>
                </div>
             )}
             
             <div className="flex gap-2">
               <Link href="/split" className="text-xs text-primary font-bold hover:underline">→ Build a split table</Link>
               <Link href="/track" className="text-xs text-primary font-bold hover:underline">→ Convert to track splits</Link>
             </div>
          </div>
        )
      });
    }
  };

  const handleReset = () => {
    setDistance('5'); setTimeStr('25:00'); setPaceStr('5:00'); setSpeedKmh('12');
    setMovingTime('25:00'); setStopTime('2:00');
    setRunPace('5:00'); setWalkPace('10:00'); setRunDur('5:00'); setWalkDur('1:00');
    setFirstHalfPace('5:00'); setSecondHalfPace('4:45');
    setResult(null); setError(null);
  };

  const handleTabChange = (t: string) => { setCalcType(t); setResult(null); setError(null); };

  return (
    <CalculatorPageShell title="Pace Lab" subtitle="Calculate pace, time, speed, distance, and advanced pacing adjustments.">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <ManualInputPanel 
          mode={mode} 
          setMode={setMode} 
          supportsAdvanced={true} 
          onCalculate={handleCalculate} 
          onReset={handleReset} 
          error={error}
        >
          <div className="mb-4">
             <Label htmlFor="calcType">Calculation Type</Label>
             <Select id="calcType" value={calcType} onChange={e => handleTabChange(e.target.value)}>
                <option value="pace">Calculate Pace (Dist + Time)</option>
                <option value="time">Calculate Time (Dist + Pace)</option>
                <option value="dist">Calculate Distance (Time + Pace)</option>
                <option value="speed">Pace ↔ Speed Converter</option>
                {mode === 'advanced' && (
                  <>
                    <option value="moving">Stop-Time Adjustment (Elapsed Pace)</option>
                    <option value="blended">Run/Walk Blended Pace</option>
                    <option value="drift">Pace Drift</option>
                  </>
                )}
             </Select>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(calcType === 'pace' || calcType === 'time' || calcType === 'moving') && (
              <div>
                <Label htmlFor="distance">Distance in km</Label>
                <Input id="distance" type="number" step="0.01" min="0.1" value={distance} onChange={e => setDistance(e.target.value)} required />
              </div>
            )}
            {(calcType === 'pace' || calcType === 'dist') && (
              <div>
                <Label htmlFor="timeStr">Time (MM:SS)</Label>
                <Input id="timeStr" type="text" placeholder="25:00" value={timeStr} onChange={e => setTimeStr(e.target.value)} required />
              </div>
            )}
            {(calcType === 'time' || calcType === 'dist') && (
              <div>
                <Label htmlFor="paceStr">Pace (MM:SS)</Label>
                <Input id="paceStr" type="text" placeholder="5:00" value={paceStr} onChange={e => setPaceStr(e.target.value)} required />
              </div>
            )}
            {calcType === 'speed' && (
              <div>
                <Label htmlFor="speedKmh">Speed (km/h)</Label>
                <Input id="speedKmh" type="number" step="0.1" value={speedKmh} onChange={e => setSpeedKmh(e.target.value)} required />
              </div>
            )}
            
            {calcType === 'moving' && (
               <>
                 <div><Label htmlFor="movingTime">Moving Time</Label><Input id="movingTime" type="text" value={movingTime} onChange={e => setMovingTime(e.target.value)} /></div>
                 <div><Label htmlFor="stopTime">Stop Time</Label><Input id="stopTime" type="text" value={stopTime} onChange={e => setStopTime(e.target.value)} /></div>
               </>
            )}
            {calcType === 'blended' && (
               <>
                 <div><Label htmlFor="runPace">Run Pace</Label><Input id="runPace" type="text" value={runPace} onChange={e => setRunPace(e.target.value)} /></div>
                 <div><Label htmlFor="walkPace">Walk Pace</Label><Input id="walkPace" type="text" value={walkPace} onChange={e => setWalkPace(e.target.value)} /></div>
                 <div><Label htmlFor="runDur">Run Duration</Label><Input id="runDur" type="text" value={runDur} onChange={e => setRunDur(e.target.value)} /></div>
                 <div><Label htmlFor="walkDur">Walk Duration</Label><Input id="walkDur" type="text" value={walkDur} onChange={e => setWalkDur(e.target.value)} /></div>
               </>
            )}
            {calcType === 'drift' && (
               <>
                 <div><Label htmlFor="firstHalfPace">First Half Pace</Label><Input id="firstHalfPace" type="text" value={firstHalfPace} onChange={e => setFirstHalfPace(e.target.value)} /></div>
                 <div><Label htmlFor="secondHalfPace">Second Half Pace</Label><Input id="secondHalfPace" type="text" value={secondHalfPace} onChange={e => setSecondHalfPace(e.target.value)} /></div>
               </>
            )}
          </div>
        </ManualInputPanel>

        <div className="h-full flex flex-col gap-6">
          {result ? (
            <>
              <ResultCard result={result} />
              <ExportPanel textToCopy={resultToText(result, "Pace Lab Result")} />
            </>
          ) : (
            <div className="p-6 border-2 border-dashed border-border-heavy bg-card rounded-xl text-center flex flex-col items-center justify-center h-full min-h-[200px]">
              <span className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Awaiting Input</span>
              <span className="text-[10px] font-bold text-muted-foreground mt-2">Visualization appears after calculation.</span>
            </div>
          )}
        </div>
      </div>
    </CalculatorPageShell>
  );
}


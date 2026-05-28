import { CalculatorResult } from '@/types';
import { METHOD_220_AGE, METHOD_TANAKA, METHOD_GELLISH, METHOD_GULATI, METHOD_KARVONEN } from '@/data/calculators';

import { hrmax } from '@/lib/calculators_pack/heartRate';

export function calculateHrMax(age: number, methodId: string): CalculatorResult<number> {
  let result = 0;
  let method = METHOD_220_AGE;

  switch (methodId) {
    case 'tanaka':
      method = METHOD_TANAKA;
      result = Math.round(hrmax.tanaka(age));
      break;
    case 'gellish':
      method = METHOD_GELLISH;
      result = Math.round(hrmax.gellish(age));
      break;
    case 'gulati':
      method = METHOD_GULATI;
      result = Math.round(hrmax.gulati(age));
      break;
    case '220_age':
    default:
      method = METHOD_220_AGE;
      result = Math.round(hrmax.fox(age));
      break;
  }

  return {
    inputUsed: { Age: age },
    methodSelected: method.name,
    formulaUsed: method.formulaDisplay,
    result,
    limitations: method.limitations,
    confidenceLabel: method.precisionLabel
  };
}

import { zoneFromKarvonen } from '@/lib/calculators_pack/heartRate';

export interface ZoneTarget {
  name: string;
  intensity: string;
  bpm: number;
}

export function calculateKarvonenZones(hrMax: number, hrRest: number): CalculatorResult<ZoneTarget[]> {
  const zones: ZoneTarget[] = [
    { name: 'Zone 1 (Recovery)', intensity: '50-60%', bpm: zoneFromKarvonen(hrMax, hrRest, 0.55).min },
    { name: 'Zone 2 (Aerobic Base)', intensity: '60-70%', bpm: zoneFromKarvonen(hrMax, hrRest, 0.65).min },
    { name: 'Zone 3 (Tempo)', intensity: '70-80%', bpm: zoneFromKarvonen(hrMax, hrRest, 0.75).min },
    { name: 'Zone 4 (Lactate Threshold)', intensity: '80-90%', bpm: zoneFromKarvonen(hrMax, hrRest, 0.85).min },
    { name: 'Zone 5 (Anaerobic)', intensity: '90-100%', bpm: zoneFromKarvonen(hrMax, hrRest, 0.95).min }
  ];

  return {
    inputUsed: { 'Max HR': hrMax, 'Resting HR': hrRest },
    methodSelected: METHOD_KARVONEN.name,
    formulaUsed: METHOD_KARVONEN.formulaDisplay,
    result: zones,
    limitations: METHOD_KARVONEN.limitations,
    confidenceLabel: METHOD_KARVONEN.precisionLabel
  };
}

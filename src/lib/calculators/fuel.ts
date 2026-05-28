import { CalculatorResult } from '@/types';
import { METHOD_FUELING } from '@/data/calculators';
import { totalCarbs as calcTotalCarbs, gelCount } from '@/lib/calculators_pack/fueling';

export interface FuelResult {
  totalCarbs: number;
  gelsAt30g: number;
  gelsAt20g: number;
}

export function calculateFuel(durationHours: number, targetCarbsPerHour: number): CalculatorResult<FuelResult> {
  const tCarbs = Math.round(calcTotalCarbs(durationHours, targetCarbsPerHour));
  
  return {
    inputUsed: { 'Duration (hrs)': durationHours, 'Target g/hr': targetCarbsPerHour },
    methodSelected: METHOD_FUELING.name,
    formulaUsed: METHOD_FUELING.formulaDisplay,
    result: {
      totalCarbs: tCarbs,
      gelsAt30g: Math.ceil(gelCount(tCarbs, 30)),
      gelsAt20g: Math.ceil(gelCount(tCarbs, 20))
    },
    limitations: METHOD_FUELING.limitations,
    confidenceLabel: METHOD_FUELING.precisionLabel
  };
}

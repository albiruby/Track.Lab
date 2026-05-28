export interface BaseCalculatorProps {
  title?: string;
  description?: string;
}

export interface CalculatorMetadata {
  id: string;
  name: string;
  requiredInputs: string[];
  formulaDisplay: string;
  limitations: string;
  sourceNote: string;
  precisionLabel: 'Estimate' | 'Field-Test' | 'Measured' | 'Custom';
}

export interface CalculatorResult<T> {
  inputUsed: Record<string, string | number>;
  methodSelected: string;
  formulaUsed: string;
  result: T;
  limitations: string;
  confidenceLabel: string;
}

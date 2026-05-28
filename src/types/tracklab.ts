export type ConfidenceLabel = 'exact' | 'estimate' | 'field-test' | 'manual' | 'qualitative';

export type InputMode = 'quick' | 'advanced';

export type CalculationStatus = 'idle' | 'incomplete' | 'invalid' | 'valid' | 'error';

export type ExportFormat = 'txt' | 'csv' | 'json' | 'print';

export type ScenarioType = 'conservative' | 'realistic' | 'aggressive' | 'custom';

export interface TrackLabInputField {
  id: string;
  label: string;
  type: string; // 'text', 'number', 'select', etc.
  unit?: string;
  value: string | number;
  required: boolean;
  helperText?: string;
  validationRules?: string[];
  placeholder?: string;
}

export type TrackLabValidationResult = 'valid' | 'errors' | 'missingInputs';

export interface FormulaTrace {
  methodId: string;
  methodName: string;
  formulaText: string;
  inputsUsed: Record<string, string | number>;
  steps?: string[];
  output: string | number | React.ReactNode;
  outputUnit?: string;
  limitation?: string;
  confidenceLabel: ConfidenceLabel | string;
}

export interface CalculationResult<T = any> {
  status: CalculationStatus;
  primaryMetrics?: Record<string, any>;
  secondaryMetrics?: Record<string, any>;
  tables?: any[];
  charts?: any[];
  formulaTrace?: FormulaTrace;
  warnings?: string[];
  exportText?: string;
  result?: T; // For compatibility
}

export interface TrackLabModule {
  id: string;
  label: string;
  route: string;
  category: string;
  description: string;
  status: 'active' | 'development' | 'planned';
  supportedModes?: InputMode[];
  supportedExports?: ExportFormat[];
}

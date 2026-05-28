export type PrecisionLabel = "mathematical" | "estimate" | "field_estimate" | "field_test" | "measured_or_custom" | "estimate_personalized" | "custom" | "custom_estimate" | "qualitative";

export type FormulaMethod = {
  id: string;
  category?: string;
  name: string;
  requiredInputs: readonly string[];
  formulaDisplay: string;
  precision?: PrecisionLabel | string;
  limitations?: readonly string[];
};

export type CalculationResult<T = unknown> = {
  ok: boolean;
  methodId: string;
  inputUsed: Record<string, unknown>;
  result?: T;
  formulaDisplay: string;
  precision: string;
  warnings: string[];
  errors: string[];
};

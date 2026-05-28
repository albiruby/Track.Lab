export function safeMetric(value: any): number | null {
  if (typeof value === 'number' && isFinite(value) && !isNaN(value)) {
    return value;
  }
  return null;
}

export function preventNaN(value: any, fallback: any = null): any {
  if (typeof value === 'number' && isNaN(value)) {
    return fallback;
  }
  return value;
}

export function preventInfinity(value: any, fallback: any = null): any {
  if (typeof value === 'number' && !isFinite(value) && !isNaN(value)) {
    return fallback;
  }
  return value;
}

export function assertRequiredInputs(inputs: Record<string, any>): string[] {
  const missing: string[] = [];
  for (const [key, val] of Object.entries(inputs)) {
    if (val === null || val === undefined || val === '') {
      missing.push(key);
    }
  }
  return missing;
}

export function buildMissingDataMessage(missingInputs: string[]): string {
  if (missingInputs.length === 0) return '';
  return `Missing required fields: ${missingInputs.join(', ')}`;
}

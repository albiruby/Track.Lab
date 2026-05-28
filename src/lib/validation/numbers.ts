export function parsePositiveNumber(value: string): number | null {
  if (!value || typeof value !== 'string') return null;
  const num = Number(value.trim());
  if (!isFinite(num) || isNaN(num) || num <= 0) return null;
  return num;
}

export function parseNonNegativeNumber(value: string): number | null {
  if (!value || typeof value !== 'string') return null;
  const num = Number(value.trim());
  if (!isFinite(num) || isNaN(num) || num < 0) return null;
  return num;
}

export function parsePercentage(value: string): number | null {
  if (!value || typeof value !== 'string') return null;
  let str = value.trim();
  if (str.endsWith('%')) {
    str = str.slice(0, -1);
  }
  const num = Number(str);
  if (!isFinite(num) || isNaN(num)) return null;
  return num;
}

export function isFinitePositiveNumber(value: any): boolean {
  return typeof value === 'number' && isFinite(value) && !isNaN(value) && value > 0;
}

export function clampNumber(value: number, min: number, max: number): number {
  if (isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}

export function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

export function resultToText(result: any, title?: string): string {
  const parts = [];
  if (title) parts.push(`--- ${title} ---`);
  
  if (result.methodSelected) parts.push(`Method: ${result.methodSelected}`);
  if (result.formulaUsed) parts.push(`Formula: ${result.formulaUsed}`);
  
  if (result.inputUsed) {
    parts.push(`Inputs:`);
    for (const [k, v] of Object.entries(result.inputUsed)) {
      parts.push(`  ${k}: ${v}`);
    }
  }

  if (result.confidenceLabel) parts.push(`Confidence: ${result.confidenceLabel}`);
  if (result.limitations) parts.push(`Note: ${result.limitations}`);
  
  return parts.join('\n');
}

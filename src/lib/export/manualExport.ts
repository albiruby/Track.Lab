'use client';

export interface TrackLabExportObject {
  appName: string; // "Track.Lab"
  moduleName: string;
  route: string;
  calculationType: string;
  timestamp?: string;
  inputUsed: Record<string, any>;
  primaryResults: Record<string, any>;
  secondaryResults?: Record<string, any>;
  tables?: Array<Record<string, any>>;
  chartsDataReference?: any;
  formulaTrace?: string;
  limitation?: string;
  confidenceLabel?: string;
  noStoragePolicy?: string;
}

const NO_STORAGE_NOTE = "Track.Lab does not store this result. Export is manual and user-triggered.";

export function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    return navigator.clipboard.writeText(text)
      .then(() => true)
      .catch(() => false);
  }
  return Promise.resolve(false);
}

export function resultToText(result: any, title?: string): string {
  if (!result) return '';
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

export function generateTXTString(obj: TrackLabExportObject): string {
  const ts = obj.timestamp || new Date().toISOString();
  const parts: string[] = [
    `==================================================`,
    `               TRACK.LAB EXPORT REPORT            `,
    `==================================================`,
    `Application:   ${obj.appName || 'Track.Lab'}`,
    `Module:        ${obj.moduleName}`,
    `System Route:  ${obj.route}`,
    `Calculation:   ${obj.calculationType}`,
    `Generated:     ${ts}`,
    `Policy:        ${obj.noStoragePolicy || NO_STORAGE_NOTE}`,
    `==================================================\n`,
    `1. INPUT METRICS ENTERED:`,
  ];

  for (const [key, value] of Object.entries(obj.inputUsed)) {
    if (value !== undefined && value !== null) {
      parts.push(`   - ${key}: ${value}`);
    }
  }

  parts.push(`\n2. CALCULATION RESULTS:`);
  for (const [key, value] of Object.entries(obj.primaryResults)) {
    if (value !== undefined && value !== null) {
      parts.push(`   * ${key}: ${value}`);
    }
  }

  if (obj.secondaryResults && Object.keys(obj.secondaryResults).length > 0) {
    parts.push(`\n3. ADDITIONAL INDICES:`);
    for (const [key, value] of Object.entries(obj.secondaryResults)) {
      if (value !== undefined && value !== null) {
        parts.push(`   - ${key}: ${value}`);
      }
    }
  }

  if (obj.tables && obj.tables.length > 0) {
    parts.push(`\n4. TABULAR DATA RECORDS:`);
    // Determine the columns of the table
    const headers = Object.keys(obj.tables[0]);
    parts.push(`   ` + headers.join(' | '));
    parts.push(`   ` + headers.map(() => '---').join('-|-'));
    obj.tables.forEach((row, i) => {
      const rowVals = headers.map(h => String(row[h] ?? ''));
      parts.push(`   ` + rowVals.join(' | '));
    });
  }

  parts.push(`\n==================================================`);
  parts.push(`5. MATHEMATICAL METADATA`);
  parts.push(`==================================================`);
  parts.push(`Confidence Level: ${obj.confidenceLabel || 'Estimate'}`);
  parts.push(`Formula Trace:    ${obj.formulaTrace || 'Trace is standard deterministic formula.'}`);
  if (obj.limitation) {
    parts.push(`Limitations:      ${obj.limitation}`);
  }
  parts.push(`==================================================`);
  parts.push(`Disclaimer: This is math-derived. Not medical or coaching advice.`);
  parts.push(`==================================================`);
  
  return parts.join('\n');
}

export function generateCSVString(obj: TrackLabExportObject): string {
  const parts: string[] = [];
  
  // App metadata block at the top
  parts.push(`"Track.Lab Export Report"`);
  parts.push(`"Module","${obj.moduleName}"`);
  parts.push(`"Timestamp","${obj.timestamp || new Date().toISOString()}"`);
  parts.push(`"NoStoragePolicy","${obj.noStoragePolicy || NO_STORAGE_NOTE}"`);
  parts.push(``);

  // Inputs
  parts.push(`"--- Inputs ---"`);
  parts.push(`"Parameter","Value"`);
  for (const [k, v] of Object.entries(obj.inputUsed)) {
    parts.push(`"${k}","${String(v).replace(/"/g, '""')}"`);
  }
  parts.push(``);

  // Primary Results
  parts.push(`"--- Calculation Results ---"`);
  parts.push(`"Metric","Value"`);
  for (const [k, v] of Object.entries(obj.primaryResults)) {
    parts.push(`"${k}","${String(v).replace(/"/g, '""')}"`);
  }
  
  if (obj.secondaryResults && Object.keys(obj.secondaryResults).length > 0) {
    parts.push(``);
    parts.push(`"--- Secondary Results ---"`);
    for (const [k, v] of Object.entries(obj.secondaryResults)) {
      parts.push(`"${k}","${String(v).replace(/"/g, '""')}"`);
    }
  }

  // Tables
  if (obj.tables && obj.tables.length > 0) {
    parts.push(``);
    parts.push(`"--- Tabular Calculated Rows ---"`);
    const headers = Object.keys(obj.tables[0]);
    parts.push(headers.map(h => `"${h}"`).join(','));
    obj.tables.forEach(row => {
      const line = headers.map(h => {
        const cell = String(row[h] ?? '');
        return `"${cell.replace(/"/g, '""')}"`;
      }).join(',');
      parts.push(line);
    });
  }

  parts.push(``);
  parts.push(`"--- Scientific Metadata ---"`);
  parts.push(`"Confidence Label","${obj.confidenceLabel || 'Estimate'}"`);
  parts.push(`"Formula Display","${(obj.formulaTrace || '').replace(/"/g, '""')}"`);
  if (obj.limitation) {
    parts.push(`"Limitations","${obj.limitation.replace(/"/g, '""')}"`);
  }

  return parts.join('\n');
}

export function generateJSONString(obj: TrackLabExportObject): string {
  const exportSafeObj = {
    appName: obj.appName || "Track.Lab",
    moduleName: obj.moduleName,
    route: obj.route,
    calculationType: obj.calculationType,
    timestamp: obj.timestamp || new Date().toISOString(),
    inputUsed: obj.inputUsed,
    primaryResults: obj.primaryResults,
    secondaryResults: obj.secondaryResults || null,
    tables: obj.tables || null,
    chartsDataReference: obj.chartsDataReference || null,
    formulaTrace: obj.formulaTrace || null,
    limitation: obj.limitation || null,
    confidenceLabel: obj.confidenceLabel || 'Estimate',
    noStoragePolicy: obj.noStoragePolicy || NO_STORAGE_NOTE,
    disclaimer: "Mathematical formulation output. Not diagnostic or clinical."
  };

  return JSON.stringify(exportSafeObj, null, 2);
}

export function triggerDownload(filename: string, content: string, mimeType: string = 'text/plain') {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generatePrintHTML(obj: TrackLabExportObject): string {
  const ts = obj.timestamp || new Date().toISOString();
  
  const inputRows = Object.entries(obj.inputUsed)
    .map(([k, v]) => `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; background: #fafafa;">${k}</td><td style="padding: 8px; border: 1px solid #ddd; font-family: monospace;">${v}</td></tr>`)
    .join('');

  const primaryRows = Object.entries(obj.primaryResults)
    .map(([k, v]) => `<tr><td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; color: #111;">${k}</td><td style="padding: 8px; border: 1px solid #ddd; font-family: monospace; font-weight: bold; color: #059669;">${v}</td></tr>`)
    .join('');

  let tableBlock = '';
  if (obj.tables && obj.tables.length > 0) {
    const headers = Object.keys(obj.tables[0]);
    const ths = headers.map(h => `<th style="padding: 8px; border: 1px solid #ddd; background: #eaeaea; text-align: left; font-size: 11px;">${h}</th>`).join('');
    const trs = obj.tables.map(row => {
      const tds = headers.map(h => `<td style="padding: 8px; border: 1px solid #ddd; font-size: 11px; font-family: monospace;">${row[h] ?? ''}</td>`).join('');
      return `<tr>${tds}</tr>`;
    }).join('');
    tableBlock = `
      <h3 style="border-bottom: 2px solid #222; padding-bottom: 4px; margin-top: 24px; font-size: 14px;">Calculated Data Table</h3>
      <table style="width: 100%; border-collapse: collapse; margin-top: 8px;">
        <thead><tr>${ths}</tr></thead>
        <tbody>${trs}</tbody>
      </table>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Track.Lab - ${obj.moduleName} Report</title>
      <style>
        body { font-family: sans-serif; color: #222; margin: 30px; line-height: 1.5; }
        .header { border-bottom: 3px double #222; padding-bottom: 15px; margin-bottom: 30px; }
        .meta { font-size: 12px; color: #555; margin-bottom: 20px; }
        h1 { margin: 0; font-size: 24px; text-transform: uppercase; tracking: tight; }
        h2 { font-size: 16px; text-transform: uppercase; margin-top: 20px; border-bottom: 1px solid #aaa; padding-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        td, th { text-align: left; vertical-align: top; }
        .policy { font-size: 11px; color: #666; font-style: italic; background: #eee; padding: 10px; border-left: 4px solid #222; margin-top: 20px; }
        .metadata-section { font-size: 12px; font-family: monospace; background: #fefefe; padding: 10px; border: 1px solid #ccc; margin-top: 20px; }
        @media print {
          body { margin: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Track.Lab Run Formula Export</h1>
        <div class="meta">
          <strong>Module:</strong> ${obj.moduleName} (${obj.route})<br/>
          <strong>Calculation Type:</strong> ${obj.calculationType}<br/>
          <strong>Export Timestamp:</strong> ${ts}
        </div>
      </div>
      
      <h2>1. Inputs Provided</h2>
      <table style="border: 1px solid #ddd;">
        <tbody>${inputRows}</tbody>
      </table>

      <h2>2. Outputs / Physical Balances</h2>
      <table style="border: 1px solid #ddd;">
        <tbody>${primaryRows}</tbody>
      </table>

      ${tableBlock}

      <h2>3. Method Trace & Verification</h2>
      <div class="metadata-section">
        <strong>Formula Displayed:</strong> ${obj.formulaTrace || 'N/A'}<br/><br/>
        <strong>Confidence Label:</strong> ${obj.confidenceLabel || 'N/A'}<br/><br/>
        <strong>Limitations:</strong> ${obj.limitation || 'N/A'}
      </div>

      <div class="policy">
        <strong>No Storage Policy:</strong> ${obj.noStoragePolicy || NO_STORAGE_NOTE}
      </div>

      <div style="font-size: 10px; color: #777; margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px; text-align: center;">
        Track.Lab Running Architecture &copy; ${new Date().getFullYear()} - Scientific Computation Export
      </div>
    </body>
    </html>
  `;
}

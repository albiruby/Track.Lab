import React from 'react';
import { ShieldCheck, FunctionSquare, Database, AlertCircle, Copy, Download, Printer } from 'lucide-react';
import { ConfidenceLabel } from '@/types/tracklab';

export function QuickAdvancedToggle({ mode, setMode }: { mode: 'quick' | 'advanced', setMode: (m: 'quick' | 'advanced') => void }) {
  return (
    <div className="flex bg-muted/50 p-1 rounded-lg border-2 border-border-heavy w-fit">
      <button 
        type="button"
        onClick={() => setMode('quick')}
        className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${mode === 'quick' ? 'bg-white shadow-[1px_1px_0px_rgba(23,23,23,1)] text-foreground border-2 border-border-heavy' : 'text-muted-foreground hover:text-foreground border-2 border-transparent'}`}
      >
        Quick Mode
      </button>
      <button 
        type="button"
        onClick={() => setMode('advanced')}
        className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all ${mode === 'advanced' ? 'bg-white shadow-[1px_1px_0px_rgba(23,23,23,1)] text-foreground border-2 border-border-heavy' : 'text-muted-foreground hover:text-foreground border-2 border-transparent'}`}
      >
        Advanced Mode
      </button>
    </div>
  );
}

export function ConfidenceBadge({ label }: { label: ConfidenceLabel | string }) {
  const normalized = label.toLowerCase();
  let bg = 'bg-muted border-border-heavy text-muted-foreground';
  if (normalized.includes('exact')) bg = 'bg-emerald-100 border-emerald-300 text-emerald-800';
  else if (normalized.includes('estimate')) bg = 'bg-blue-100 border-blue-300 text-blue-800';
  else if (normalized.includes('field')) bg = 'bg-amber-100 border-amber-300 text-amber-800';
  else if (normalized.includes('manual')) bg = 'bg-neutral-100 border-neutral-300 text-neutral-800';

  return (
    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-widest border-2 shadow-[1px_1px_0px_rgba(23,23,23,0.1)] ${bg}`}>
      {label}
    </span>
  );
}

export function MissingDataGate({ missingFields }: { missingFields: string[] }) {
  if (!missingFields || missingFields.length === 0) return null;
  return (
    <div className="p-6 border-2 border-dashed border-border-heavy bg-card rounded-xl text-center space-y-2">
      <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Need More Input</h3>
      <p className="text-xs font-medium text-muted-foreground">Please fill out: {missingFields.join(', ')}</p>
    </div>
  );
}

export function ValidationMessage({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="p-3 bg-red-50 border-2 border-destructive rounded-lg text-destructive text-xs font-bold uppercase tracking-wide flex items-center gap-2 shadow-[2px_2px_0px_rgba(232,76,61,1)] mt-2">
      <AlertCircle className="w-4 h-4" />
      {message}
    </div>
  );
}

export function NoStorageNotice() {
  return (
    <div className="flex gap-2 p-3 bg-muted/50 border-2 border-border-heavy rounded-lg text-muted-foreground text-[10px] font-bold uppercase tracking-widest mt-6 items-start">
      <Database className="w-4 h-4 mt-0.5 text-foreground shrink-0" />
      <span className="leading-tight">Track.Lab does not store your inputs or results. Calculations run in your browser from manual input. Export manually if you want to keep a result.</span>
    </div>
  );
}

export function ExportPanel({ onCopy, textToCopy }: { onCopy?: () => void, textToCopy?: string }) {
  const handleCopy = () => {
    if (textToCopy) navigator.clipboard.writeText(textToCopy);
    if (onCopy) onCopy();
  };

  return (
    <div className="flex gap-2 pt-4 border-t-2 border-border-heavy mt-6">
      <button onClick={handleCopy} className="flex-1 py-2 px-4 bg-white border-2 border-border-heavy rounded-lg shadow-[2px_2px_0px_rgba(23,23,23,1)] text-xs font-bold uppercase tracking-wider hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(23,23,23,1)] transition-all flex justify-center items-center gap-2">
        <Copy className="w-4 h-4" /> Copy Result
      </button>
      <button onClick={() => window.print()} className="flex-1 py-2 px-4 bg-white border-2 border-border-heavy rounded-lg shadow-[2px_2px_0px_rgba(23,23,23,1)] text-xs font-bold uppercase tracking-wider hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_rgba(23,23,23,1)] transition-all flex justify-center items-center gap-2">
        <Printer className="w-4 h-4" /> Print
      </button>
    </div>
  );
}

export function FormulaTracePanel({ trace }: { trace: any }) {
  if (!trace) return null;
  return (
    <div className="mt-8 border-2 border-border-heavy bg-white rounded-xl shadow-[4px_4px_0px_rgba(23,23,23,1)] overflow-hidden flex flex-col">
      <div className="bg-accent text-accent-foreground px-6 py-4 border-b-2 border-border-heavy flex justify-between items-center">
        <h3 className="font-bold uppercase tracking-wider text-sm flex items-center gap-2">
          <FunctionSquare className="w-4 h-4" /> Formula Trace
        </h3>
        <ConfidenceBadge label={trace.confidenceLabel} />
      </div>
      <div className="p-6 space-y-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Method</span>
          <span className="font-display font-bold text-foreground">{trace.methodName}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Formula</span>
          <span className="font-mono text-xs font-semibold bg-muted py-1.5 px-2 w-full block rounded border-2 border-border-heavy">{trace.formulaText}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1 block">Inputs</span>
          <span className="font-mono text-xs font-semibold">{Object.entries(trace.inputsUsed || {}).map(([k, v]) => `${k}=${v}`).join(' ')}</span>
        </div>
        {trace.limitation && (
          <div className="p-3 bg-red-50 border-2 border-destructive rounded-lg text-destructive text-[10px] font-bold uppercase tracking-wide flex items-start gap-2 shadow-[2px_2px_0px_rgba(232,76,61,1)]">
             <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
             <span className="leading-tight">{trace.limitation}</span>
          </div>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { ShieldCheck, FunctionSquare, Database, AlertCircle, Copy, Download, Printer } from 'lucide-react';
import { ConfidenceLabel } from '@/types/tracklab';
import Link from 'next/link';

interface ResultAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

export function ResultActionRow({ actions }: { actions: ResultAction[] }) {
  if (!actions || actions.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-dashed border-[#d8ddd8]">
      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mr-1.5">Actions:</span>
      {actions.map((act, idx) => {
        const btnClasses = "px-3 py-1 bg-[#e6f1f8]/60 hover:bg-[#e6f1f8] border border-[#0f6fae]/25 hover:border-[#0f6fae]/40 rounded-md text-[11px] font-bold uppercase tracking-wider text-[#0f6fae] hover:text-[#0b2f4a] transition-all flex items-center gap-1 cursor-pointer";
        if (act.href) {
          return (
            <Link key={idx} href={act.href} className={btnClasses}>
              {act.label}
            </Link>
          );
        }
        return (
          <button key={idx} type="button" onClick={act.onClick} className={btnClasses}>
            {act.label}
          </button>
        );
      })}
    </div>
  );
}

export function QuickAdvancedToggle({ mode, setMode }: { mode: 'quick' | 'advanced', setMode: (m: 'quick' | 'advanced') => void }) {
  return (
    <div className="flex bg-[#f3f4f1] p-1 rounded-lg border border-[#d8ddd8] w-fit">
      <button 
        type="button"
        onClick={() => setMode('quick')}
        className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${mode === 'quick' ? 'bg-white shadow-xs text-[#0b2f4a] border border-[#d8ddd8]' : 'text-muted-foreground hover:text-[#0b2f4a] border border-transparent'}`}
      >
        Quick Mode
      </button>
      <button 
        type="button"
        onClick={() => setMode('advanced')}
        className={`px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer ${mode === 'advanced' ? 'bg-white shadow-xs text-[#0b2f4a] border border-[#d8ddd8]' : 'text-muted-foreground hover:text-[#0b2f4a] border border-transparent'}`}
      >
        Advanced Mode
      </button>
    </div>
  );
}

export function ConfidenceBadge({ label }: { label: ConfidenceLabel | string }) {
  const normalized = label.toLowerCase();
  let bg = 'bg-[#f3f4f1] border-[#d8ddd8] text-[#6b7280]';
  if (normalized.includes('exact')) bg = 'bg-[#1f8a5b]/5 border-[#1f8a5b]/10 text-[#1f8a5b]';
  else if (normalized.includes('estimate')) bg = 'bg-[#e6f1f8] border-[#0f6fae]/10 text-[#0b2f4a]';
  else if (normalized.includes('field')) bg = 'bg-amber-500/5 border-amber-500/10 text-amber-700';
  else if (normalized.includes('manual')) bg = 'bg-neutral-100 border-neutral-200 text-neutral-700';

  return (
    <span className={`px-2.5 py-0.75 rounded text-[9px] uppercase font-bold tracking-widest border ${bg}`}>
      {label}
    </span>
  );
}

export function MissingDataGate({ missingFields }: { missingFields: string[] }) {
  if (!missingFields || missingFields.length === 0) return null;
  return (
    <div className="p-6 border border-dashed border-[#d8ddd8] bg-white rounded-xl text-center space-y-2">
      <h3 className="font-bold text-xs uppercase tracking-wider text-[#0b2f4a]">Need More Input</h3>
      <p className="text-xs font-normal text-muted-foreground">Please fill out: {missingFields.join(', ')}</p>
    </div>
  );
}

export function ValidationMessage({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <div className="p-3 bg-red-50/80 border border-red-200 rounded-lg text-destructive text-xs font-bold uppercase tracking-wide flex items-center gap-2 mt-2">
      <AlertCircle className="w-4 h-4 shrink-0 text-destructive" />
      <span>{message}</span>
    </div>
  );
}

export function NoStorageNotice() {
  return (
    <div className="flex gap-2 p-3 bg-[#f3f4f1]/50 border border-[#d8ddd8] rounded-xl text-[#374151] text-[10px] font-bold uppercase tracking-widest mt-6 items-start">
      <Database className="w-4 h-4 mt-0.5 text-[#0f6fae] shrink-0" />
      <span className="leading-tight font-normal">Track.Lab does not store your inputs or results. Calculations run in your browser from manual input. Export manually if you want to keep a result.</span>
    </div>
  );
}

interface ExportPanelProps {
  onCopy?: () => void;
  textToCopy?: string;
  onReset?: () => void;
  filenamePrefix?: string;
}

export function ExportPanel({ onCopy, textToCopy, onReset, filenamePrefix = 'tracklab_report' }: ExportPanelProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    if (onCopy) onCopy();
  };

  const downloadTxt = () => {
    if (!textToCopy) return;
    const blob = new Blob([textToCopy], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filenamePrefix}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="border border-[#d8ddd8] bg-white rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-6">
      <div className="space-y-1">
        <h4 className="text-[10px] uppercase tracking-wider font-bold text-[#0b2f4a]">Verification &amp; Export Center</h4>
        <p className="text-xs text-muted-foreground font-normal">Extract mathematical report structures or reset active console variables.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button 
          onClick={handleCopy} 
          disabled={!textToCopy}
          className="px-3.5 py-1.5 bg-[#f3f4f1]/50 hover:bg-[#e9ece8] border border-[#d8ddd8] rounded-lg text-[11px] font-bold uppercase tracking-wider text-[#374151] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
        >
          <Copy className="w-3.5 h-3.5 text-[#0f6fae]" /> 
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
        <button 
          onClick={downloadTxt} 
          disabled={!textToCopy}
          className="px-3.5 py-1.5 bg-[#f3f4f1]/50 hover:bg-[#e9ece8] border border-[#d8ddd8] rounded-lg text-[11px] font-bold uppercase tracking-wider text-[#374151] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
        >
          <Download className="w-3.5 h-3.5 text-[#0f6fae]" /> 
          <span>Export TXT</span>
        </button>
        <button 
          onClick={() => window.print()} 
          className="px-3.5 py-1.5 bg-[#f3f4f1]/50 hover:bg-[#e9ece8] border border-[#d8ddd8] rounded-lg text-[11px] font-bold uppercase tracking-wider text-[#374151] transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5 text-[#0f6fae]" /> 
          <span>Print</span>
        </button>
        {onReset && (
          <button 
            onClick={onReset} 
            className="px-3.5 py-1.5 bg-[#b91c1c]/5 hover:bg-[#b91c1c]/10 border border-[#b91c1c]/20 rounded-lg text-[11px] font-bold uppercase tracking-wider text-[#b91c1c] transition-all flex items-center gap-1.5 cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

export function FormulaTracePanel({ trace }: { trace: any }) {
  if (!trace) return null;
  return (
    <div className="mt-8 border border-[#d8ddd8] bg-white rounded-xl overflow-hidden flex flex-col shadow-xs">
      <div className="bg-[#f3f4f1]/40 text-[#0b2f4a] px-6 py-3.5 border-b border-[#d8ddd8] flex justify-between items-center">
        <h3 className="font-sans font-bold uppercase tracking-wider text-xs flex items-center gap-2">
          <FunctionSquare className="w-4 h-4 text-[#0f6fae]" /> Formula Trace
        </h3>
        <ConfidenceBadge label={trace.confidenceLabel} />
      </div>
      <div className="p-6 space-y-4 text-xs">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-1 block">Method Specification</span>
          <span className="font-sans font-bold text-[#0b2f4a]">{trace.methodName}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-1 block">Evaluated Formula</span>
          <span className="font-mono text-xs font-semibold bg-[#f3f4f1]/40 py-2 px-3 w-full block rounded-lg border border-[#d8ddd8] leading-relaxed text-[#111827]">{trace.formulaText}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#6b7280] mb-1 block">Input Variables Mapping</span>
          <span className="font-mono text-xs font-semibold text-[#374151] bg-[#f3f4f1]/10 px-2 py-1 rounded border border-[#d8ddd8]/50 block w-max mt-1">{Object.entries(trace.inputsUsed || {}).map(([k, v]) => `${k}=${v}`).join('  ')}</span>
        </div>
        {trace.limitation && (
          <div className="p-3 bg-[#b91c1c]/5 border border-[#b91c1c]/10 rounded-lg text-[#b91c1c] text-xs font-normal flex items-start gap-2 mt-2">
             <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-[#b91c1c]" />
             <span className="leading-tight">{trace.limitation}</span>
          </div>
        )}
      </div>
    </div>
  );
}

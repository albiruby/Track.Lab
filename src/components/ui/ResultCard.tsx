import { CalculatorResult } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { WarningNote } from './Note';
import { Check, Copy, ExternalLink, Info } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export function ResultCard<T extends string | number | React.ReactNode>({ result }: { result: CalculatorResult<T> }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (typeof result.result === 'string' || typeof result.result === 'number') {
      navigator.clipboard.writeText(String(result.result));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="h-full flex flex-col relative transition-all duration-300 rounded-xl overflow-hidden shadow-[4px_4px_0px_rgba(23,23,23,1)] border-2 border-border-heavy bg-white">
      <div className="px-6 py-4 border-b-2 border-border-heavy bg-accent text-accent-foreground flex items-center justify-between">
        <h3 className="font-bold uppercase tracking-wider text-sm">Results</h3>
        <div className="text-[10px] font-bold uppercase tracking-widest text-accent-foreground bg-white/20 px-3 py-1 rounded-full border border-white/30">
           {result.methodSelected}
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex flex-col flex-1 mb-6">
          {typeof result.result === 'string' || typeof result.result === 'number' ? (
            <div className="text-4xl md:text-5xl font-display font-bold tracking-tighter text-foreground drop-shadow-sm flex items-center">
              {result.result}
            </div>
          ) : (
            <div className="text-sm font-medium border-2 border-border-heavy rounded-lg overflow-hidden bg-background">
              {result.result}
            </div>
          )}
        </div>
        
        <div className="space-y-4 pt-6 border-t-2 border-border-heavy mt-auto">
          <div className="flex justify-between items-center text-xs text-muted-foreground font-bold uppercase tracking-wider">
            <span>Formula Details</span>
            <span className="text-[10px] text-primary-foreground bg-primary px-3 py-1 rounded-full border-2 border-border-heavy shadow-[1px_1px_0px_rgba(23,23,23,1)]">
              {result.confidenceLabel}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 bg-background p-4 rounded-lg border-2 border-border-heavy">
            <div>
              <div className="text-muted-foreground mb-1 text-[10px] uppercase font-bold tracking-wider">Computation</div>
              <div className="font-mono text-xs font-semibold text-foreground break-all select-all">
                {result.formulaUsed}
              </div>
            </div>
            <div className="border-t-2 border-border-heavy/20 pt-3">
              <div className="text-muted-foreground mb-1 text-[10px] uppercase font-bold tracking-wider">Variables</div>
              <div className="font-mono text-xs font-semibold text-foreground">
                {Object.entries(result.inputUsed).map(([k, v]) => `${k}:${v}`).join(' ')}
              </div>
            </div>
          </div>
          
          <div className="pt-2">
             <Link href={`/formulas?search=${encodeURIComponent(result.methodSelected)}`} className="text-xs font-bold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 w-fit">
               <ExternalLink className="w-3.5 h-3.5" />
               View in Formula Library
             </Link>
          </div>
        </div>

        {result.limitations && (
          <div className="mt-4 p-4 rounded-xl border-2 border-destructive bg-white text-destructive font-semibold text-xs flex gap-3 items-start shadow-[2px_2px_0px_rgba(232,76,61,1)]">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{result.limitations}</span>
          </div>
        )}
      </div>

      {(typeof result.result === 'string' || typeof result.result === 'number') && (
        <button 
          onClick={handleCopy}
          className="absolute top-[80px] right-6 p-2 rounded-lg text-foreground hover:bg-neutral-100 transition-colors z-10 border-2 border-transparent hover:border-border-heavy"
          title="Copy result"
        >
          {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
        </button>
      )}
    </div>
  );
}

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
    <div className="h-full flex flex-col relative transition-all duration-300 rounded-xl overflow-hidden border border-[#d8ddd8] bg-white shadow-sm">
      <div className="px-6 py-3.5 border-b border-[#d8ddd8] bg-[#f3f4f1]/40 text-[#0b2f4a] flex items-center justify-between">
        <h3 className="font-sans font-bold uppercase tracking-wider text-xs">Calculated Outputs</h3>
        <div className="text-[10px] font-bold uppercase tracking-normal text-[#0f6fae] bg-[#e6f1f8] px-3 py-1 rounded-md border border-[#0f6fae]/20">
           {result.methodSelected}
        </div>
      </div>
      
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex flex-col flex-1 mb-4">
          {typeof result.result === 'string' || typeof result.result === 'number' ? (
            <div className="text-3xl md:text-4xl font-sans font-bold tracking-tight text-[#0b2f4a] flex items-center">
              {result.result}
            </div>
          ) : (
            <div className="text-sm font-normal border border-[#d8ddd8] rounded-lg overflow-hidden bg-white">
              {result.result}
            </div>
          )}
        </div>
        
        <div className="space-y-4 pt-4 border-t border-[#d8ddd8] mt-auto">
          <div className="flex justify-between items-center text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
            <span>Formula Details &amp; Confidence</span>
            <span className="text-[10px] text-[#0f6fae] bg-[#e6f1f8] px-2.5 py-0.75 rounded border border-[#0f6fae]/20 font-bold uppercase">
              {result.confidenceLabel}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 bg-[#f3f4f1]/50 p-4 rounded-lg border border-[#d8ddd8]">
            <div>
              <div className="text-muted-foreground mb-1 text-[10px] uppercase font-bold tracking-wider">Computation Formula</div>
              <div className="font-mono text-[11px] font-medium text-foreground break-all select-all leading-relaxed">
                {result.formulaUsed}
              </div>
            </div>
            <div className="border-t border-[#d8ddd8] pt-2">
              <div className="text-muted-foreground mb-1 text-[10px] uppercase font-bold tracking-wider">Variables Mapping</div>
              <div className="font-mono text-[11px] font-medium text-[#111827]">
                {Object.entries(result.inputUsed).map(([k, v]) => `${k}:${v}`).join('  ')}
              </div>
            </div>
          </div>
          
          <div className="pt-2">
             <Link href={`/formulas?search=${encodeURIComponent(result.methodSelected)}`} className="text-[11px] font-bold uppercase tracking-wider text-[#0f6fae] hover:text-[#0b2f4a] transition-all flex items-center gap-1.5 w-fit">
               <ExternalLink className="w-3.5 h-3.5" />
               View in Formula Registry
             </Link>
          </div>
        </div>

        {result.limitations && (
          <div className="mt-4 p-4 rounded-lg border border-yellow-200 bg-yellow-50/50 text-[#b7791f] font-normal text-xs flex gap-3 items-start">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#b7791f]" />
            <span className="leading-relaxed">{result.limitations}</span>
          </div>
        )}
      </div>

      {(typeof result.result === 'string' || typeof result.result === 'number') && (
        <button 
          onClick={handleCopy}
          className="absolute top-16 right-6 p-2 rounded-lg text-muted-foreground hover:bg-[#f3f4f1] transition-colors z-10 border border-transparent hover:border-[#d8ddd8]"
          title="Copy exact result"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}

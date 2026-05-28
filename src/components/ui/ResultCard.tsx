import { CalculatorResult } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { WarningNote } from './Note';
import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

export function ResultCard<T extends string | number | React.ReactNode>({ result }: { result: CalculatorResult<T> }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    // Only copy string/number results
    if (typeof result.result === 'string' || typeof result.result === 'number') {
      navigator.clipboard.writeText(String(result.result));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className="bg-zinc-950/60 border border-zinc-800 relative shadow-[0_0_30px_rgba(34,211,238,0.03)] backdrop-blur-md h-full">
      <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0 bg-zinc-900/40">
        <div className="space-y-1 pr-6 w-full">
          <div className="flex items-center justify-between">
            <CardTitle className="text-zinc-400">COMPUTED OUTPUT</CardTitle>
            <div className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 bg-zinc-900 px-2 py-1 border border-zinc-800">
               Model: {result.methodSelected}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 flex flex-col p-6">
        <div className="flex flex-col">
          <div className="text-3xl md:text-4xl font-mono tracking-tight text-cyan-400 break-words whitespace-pre-wrap leading-relaxed shadow-cyan-400/20 drop-shadow-md">
            {result.result}
          </div>
        </div>
        
        <div className="space-y-4 pt-6 border-t border-zinc-800 text-xs">
          <div className="text-zinc-500 font-mono uppercase tracking-widest mb-3 text-[10px] flex justify-between items-center">
            <span>Formula Trace</span>
            <div className="flex gap-2">
               <span className="text-cyan-600 bg-cyan-950/30 px-2 py-0.5 border border-cyan-900/50">{result.confidenceLabel}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-zinc-950/80 p-4 border border-zinc-800/50">
            <div>
              <div className="text-zinc-600 mb-1 font-mono uppercase tracking-widest text-[9px]">Method Definition</div>
              <div className="font-mono text-zinc-300 break-all">
                {result.formulaUsed}
              </div>
            </div>
            <div>
              <div className="text-zinc-600 mb-1 font-mono uppercase tracking-widest text-[9px]">Input State</div>
              <div className="text-zinc-400 font-mono">
                {Object.entries(result.inputUsed).map(([k, v]) => `${k}: ${v}`).join(' | ')}
              </div>
            </div>
          </div>
          
          <div className="pt-2">
             <Link href={`/formulas?search=${encodeURIComponent(result.methodSelected)}`} className="text-[10px] text-zinc-500 hover:text-cyan-400 font-mono tracking-widest uppercase transition-colors inline-block border-b border-transparent hover:border-cyan-400 pb-0.5">
               [ VIEW REGISTRY ENTRY ]
             </Link>
          </div>
        </div>

        {result.limitations && (
          <div className="mt-4 p-3 border border-orange-900/30 bg-orange-950/10 text-orange-500/80 text-xs font-mono">
            <span className="uppercase tracking-widest text-[10px] font-bold mr-2 text-orange-600">SYS_NOTE:</span>
            {result.limitations}
          </div>
        )}
      </CardContent>

      {(typeof result.result === 'string' || typeof result.result === 'number') && (
        <button 
          onClick={handleCopy}
          className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-cyan-400 transition-colors bg-zinc-950 border border-zinc-800 z-10"
          title="Copy result"
        >
          {copied ? <Check className="w-3 h-3 text-cyan-400" /> : <Copy className="w-3 h-3" />}
        </button>
      )}
    </Card>
  );
}

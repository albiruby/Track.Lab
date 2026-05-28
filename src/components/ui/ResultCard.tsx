import { CalculatorResult } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { WarningNote } from './Note';
import { Check, Copy, ExternalLink, Info } from 'lucide-react';
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
    <Card className="h-full flex flex-col relative transition-all duration-300">
      <CardHeader className="pb-4 bg-muted/20">
        <div className="flex items-center justify-between">
          <CardTitle className="text-muted-foreground uppercase text-xs tracking-wider">Results</CardTitle>
          <div className="text-[10px] tracking-wide text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md">
             {result.methodSelected}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6 flex-1 flex flex-col p-6">
        <div className="flex flex-col flex-1">
          {typeof result.result === 'string' || typeof result.result === 'number' ? (
            <div className="text-3xl md:text-4xl font-semibold tracking-tight text-primary drop-shadow-sm min-h-[60px] flex items-center">
              {result.result}
            </div>
          ) : (
            <div className="text-sm border rounded-md overflow-hidden bg-background">
              {result.result}
            </div>
          )}
        </div>
        
        <div className="space-y-4 pt-6 border-t border-border mt-auto">
          <div className="flex justify-between items-center text-xs text-muted-foreground">
            <span className="font-medium tracking-wide">Formula Used</span>
            <span className="text-[10px] text-primary/80 bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">{result.confidenceLabel}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg text-sm border border-border/50">
            <div>
              <div className="text-muted-foreground mb-1 text-[10px] uppercase font-semibold">Method</div>
              <div className="font-mono text-xs text-foreground/80 break-all select-all">
                {result.formulaUsed}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground mb-1 text-[10px] uppercase font-semibold">Inputs</div>
              <div className="font-mono text-xs text-foreground/80">
                {Object.entries(result.inputUsed).map(([k, v]) => `${k}: ${v}`).join(' | ')}
              </div>
            </div>
          </div>
          
          <div className="pt-2">
             <Link href={`/formulas?search=${encodeURIComponent(result.methodSelected)}`} className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 w-fit">
               <ExternalLink className="w-3 h-3" />
               View in Formula Library
             </Link>
          </div>
        </div>

        {result.limitations && (
          <div className="mt-4 p-3 rounded-lg border border-orange-500/20 bg-orange-500/5 text-orange-500/90 text-xs flex gap-2 items-start">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{result.limitations}</span>
          </div>
        )}
      </CardContent>

      {(typeof result.result === 'string' || typeof result.result === 'number') && (
        <button 
          onClick={handleCopy}
          className="absolute top-4 right-4 p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors z-10"
          title="Copy result"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
        </button>
      )}
    </Card>
  );
}

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
    <Card className="bg-zinc-50 dark:bg-zinc-950/50 border-2 border-zinc-200 dark:border-zinc-800 relative shadow-none">
      <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
        <div className="space-y-1 pr-6">
          <CardTitle>Calculation Result</CardTitle>
          <div className="flex items-center gap-2 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider flex-wrap">
            <span className="px-2 py-0.5 rounded-sm bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {result.confidenceLabel}
            </span>
            <span className="opacity-70 tracking-normal capitalize">via {result.methodSelected}</span>
            <Link href={`/formulas?search=${encodeURIComponent(result.methodSelected)}`} className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 tracking-normal capitalize">
              View Formula Details →
            </Link>
          </div>
        </div>
        {(typeof result.result === 'string' || typeof result.result === 'number') && (
          <button 
            onClick={handleCopy}
            className="p-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors absolute top-4 right-4"
            title="Copy result"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>
        )}
      </CardHeader>
      <CardContent className="space-y-6 flex flex-col">
        <div className="flex flex-col">
          <div className="text-4xl md:text-5xl font-mono font-medium tracking-tight text-zinc-900 dark:text-zinc-50 break-words">
            {result.result}
          </div>
        </div>
        
        <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800 text-sm border-dashed">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-zinc-500 mb-1 text-xs font-semibold uppercase tracking-wider">Formula Used</div>
              <div className="font-mono text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 px-3 py-2 rounded break-all text-xs">
                {result.formulaUsed}
              </div>
            </div>
            <div>
              <div className="text-zinc-500 mb-1 text-xs font-semibold uppercase tracking-wider">Input Constraints</div>
              <div className="text-zinc-700 dark:text-zinc-300 text-xs mt-2">
                {Object.entries(result.inputUsed).map(([k, v]) => `${k}: ${v}`).join(', ')}
              </div>
            </div>
          </div>
        </div>

        {result.limitations && (
          <WarningNote className="mt-2 text-xs">
            {result.limitations}
          </WarningNote>
        )}
      </CardContent>
    </Card>
  );
}

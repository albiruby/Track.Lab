'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { methodRegistry } from '@/data';

export default function FormulaLibraryPage() {
  return (
    <div className="space-y-6 flex flex-col">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Formula Library</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Reference index of all integrated equations and logic rules.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
        {methodRegistry.map(method => (
          <Card key={method.id} className="flex flex-col h-full">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 mb-2 truncate bg-zinc-100 dark:bg-zinc-800 self-start px-2 py-0.5 rounded">
                Cat: {method.category.replace('_', ' ')}
              </div>
              <CardTitle className="text-lg leading-tight">{method.name}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 flex-1 flex flex-col gap-4">
              <div className="text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded font-mono break-words flex-1 content-center items-center text-center">
                {method.formulaDisplay}
              </div>
              
              <div className="space-y-3">
                {method.requiredInputs?.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-zinc-500 uppercase">Required Inputs: </span>
                    <span className="text-sm text-zinc-900 dark:text-zinc-200 font-mono text-xs">{method.requiredInputs.join(', ')}</span>
                  </div>
                )}
                
                {method.limitations?.length > 0 && (
                  <div>
                    <span className="text-xs font-semibold text-zinc-500 uppercase">Limitations: </span>
                    <ul className="text-xs text-zinc-600 dark:text-zinc-400 list-disc list-inside mt-1 space-y-1">
                      {(method.limitations as readonly string[]).map((lim: string, idx: number) => (
                        <li key={idx} className="leading-snug">{lim}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="pt-2 flex justify-between items-center text-xs text-zinc-400">
                <span className="font-mono">{method.id}</span>
                <span className="capitalize">{method.precision?.replace('_', ' ')}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

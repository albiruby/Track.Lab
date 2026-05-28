import React from 'react';
import { QuickAdvancedToggle, ValidationMessage } from './CalculatorSystem';
import { Button } from '@/components/ui/Forms';

interface ManualInputPanelProps {

  mode: 'quick' | 'advanced';
  setMode: (mode: 'quick' | 'advanced') => void;
  supportsAdvanced?: boolean;
  children: React.ReactNode; 
  onCalculate: (e: React.FormEvent) => void;
  onReset: () => void;
  error?: string | null;
}

export function ManualInputPanel({ 
  mode, setMode, supportsAdvanced, children, onCalculate, onReset, error 
}: ManualInputPanelProps) {
  return (
    <div className="bg-white border-2 border-border-heavy rounded-xl shadow-[4px_4px_0px_rgba(23,23,23,1)] overflow-hidden flex flex-col h-max">
      <div className="bg-accent px-6 py-4 border-b-2 border-border-heavy flex justify-between items-center">
        <h3 className="font-bold uppercase tracking-wider text-sm">Manual Input</h3>
        {supportsAdvanced && (
           <QuickAdvancedToggle mode={mode} setMode={setMode} />
        )}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onCalculate(e); }} noValidate className="p-6 space-y-6 flex flex-col flex-1">
        <div className="space-y-4">
          {children}
        </div>
        <ValidationMessage message={error} />
        <div className="flex gap-4 pt-4 border-t-2 border-border-heavy mt-auto">
          <Button type="button" variant="outline" className="w-1/3 border-2 font-bold uppercase tracking-wider" onClick={onReset}>
            Reset
          </Button>
          <Button type="submit" className="w-2/3 border-2 font-bold uppercase tracking-wider shadow-[2px_2px_0px_rgba(23,23,23,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
            Calculate
          </Button>
        </div>
      </form>
    </div>
  );
}

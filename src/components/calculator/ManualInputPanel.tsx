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
    <div className="bg-white border border-[#d8ddd8] rounded-xl overflow-hidden flex flex-col h-max shadow-sm">
      <div className="bg-[#f3f4f1]/40 text-[#0b2f4a] px-6 py-3.5 border-b border-[#d8ddd8] flex justify-between items-center">
        <h3 className="font-sans font-bold uppercase tracking-wider text-xs">Manual Input</h3>
        {supportsAdvanced && (
           <QuickAdvancedToggle mode={mode} setMode={setMode} />
        )}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onCalculate(e); }} noValidate className="p-6 space-y-5 flex flex-col flex-1">
        <div className="space-y-4">
          {children}
        </div>
        <ValidationMessage message={error} />
        <div className="flex gap-3 pt-4 border-t border-[#d8ddd8] mt-auto">
          <Button type="button" variant="outline" className="w-1/3" onClick={onReset}>
            Reset
          </Button>
          <Button type="submit" variant="primary" className="w-2/3">
            Calculate
          </Button>
        </div>
      </form>
    </div>
  );
}

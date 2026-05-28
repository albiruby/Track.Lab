import React from 'react';
import { LabPageHeader } from '@/components/layout/LabPageHeader';
import { NoStorageNotice } from './CalculatorSystem';

interface CalculatorPageShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function CalculatorPageShell({ title, subtitle, children }: CalculatorPageShellProps) {
  return (
    <div className="space-y-6 pb-16">
      <LabPageHeader title={title} subtitle={subtitle} />
      <div className="max-w-6xl mx-auto space-y-8">
        {children}
        <NoStorageNotice />
      </div>
    </div>
  );
}

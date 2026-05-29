import { Calculator, FunctionSquare } from "lucide-react";

export function LabPageHeader({ title, subtitle }: { title: string, subtitle: string }) {
  return (
    <div className="mb-8 space-y-4 brutalist-panel-heavy bg-card p-6 md:p-8">
      <div className="space-y-2">
        <h1 className="text-3xl md:text-5xl font-display font-bold uppercase tracking-tight text-foreground pt-1 pb-1 leading-tight">
          {title}
        </h1>
        <p className="text-muted-foreground font-medium max-w-3xl leading-relaxed">
          {subtitle}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 pt-4 border-t-2 border-border-heavy">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-foreground bg-primary px-3 py-1.5 rounded-md border-2 border-border-heavy">
          <Calculator className="w-4 h-4" />
          <span>Manual Input</span>
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground bg-white px-3 py-1.5 rounded-md border-2 border-border-heavy">
          <FunctionSquare className="w-4 h-4 text-foreground" />
          <span>Formula Driven</span>
        </div>
      </div>
    </div>
  );
}

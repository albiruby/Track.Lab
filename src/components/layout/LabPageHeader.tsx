import { Calculator, FunctionSquare } from "lucide-react";

export function LabPageHeader({ title, subtitle }: { title: string, subtitle: string }) {
  return (
    <div className="mb-8 space-y-4">
      <div className="space-y-1.5">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        <p className="text-muted-foreground text-sm max-w-3xl leading-relaxed">
          {subtitle}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-md border border-border/50">
          <Calculator className="w-3.5 h-3.5" />
          <span>Manual Input</span>
        </div>
        <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-md border border-border/50">
          <FunctionSquare className="w-3.5 h-3.5" />
          <span>Formula Shown</span>
        </div>
      </div>
    </div>
  );
}

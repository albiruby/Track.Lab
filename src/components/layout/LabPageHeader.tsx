import { Calculator, FunctionSquare } from "lucide-react";

export function LabPageHeader({ title, subtitle }: { title: string, subtitle: string }) {
  return (
    <div className="mb-8 space-y-4 brutalist-panel-heavy bg-card p-6 md:p-8">
      <div className="space-y-3">
        <h1 className="text-3xl md:text-5xl font-display font-black uppercase tracking-tight text-foreground py-1 leading-[1.125]">
          {title}
        </h1>
        <p className="text-muted-foreground font-semibold max-w-3xl leading-relaxed text-xs md:text-sm">
          {subtitle}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 pt-4 border-t-2 border-border-heavy">
        <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-foreground bg-primary px-2.5 py-1.5 rounded-md border-2 border-border-heavy shadow-[1.5px_1.5px_0px_rgba(23,23,23,1)]">
          <Calculator className="w-3.5 h-3.5" />
          <span>Manual Input API</span>
        </div>
        <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground bg-white px-2.5 py-1.5 rounded-md border-2 border-border-heavy">
          <FunctionSquare className="w-3.5 h-3.5 text-foreground" />
          <span>Formula Driven Engine</span>
        </div>
      </div>
    </div>
  );
}

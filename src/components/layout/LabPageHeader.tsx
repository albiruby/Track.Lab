import { Calculator, FunctionSquare, Database } from "lucide-react";

export function LabPageHeader({ title, subtitle }: { title: string, subtitle: string }) {
  const isLibrary = title.toLowerCase().includes("library") || title.toLowerCase().includes("registry") || title.toLowerCase().includes("database");
  const isTest = title.toLowerCase().includes("test") || title.toLowerCase().includes("protocol");
  const category = isLibrary 
    ? "PROTOCOL & CATALOG REGISTRY" 
    : isTest 
      ? "LAB MEASUREMENT & TEST METRIC" 
      : "CALCULATION WORKSPACE ENGINE";

  return (
    <div className="mb-6 p-6 md:p-8 bg-white border border-[#d8ddd8] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.01)] relative overflow-hidden">
      <div className="space-y-2">
        <div className="text-[10px] font-mono text-medium tracking-wider text-[#0f6fae] uppercase flex items-center gap-1.5">
          <span>TRACK.LAB</span>
          <span className="text-[#bfc8c0]">/</span>
          <span>{category}</span>
          <span className="text-[#bfc8c0]">/</span>
          <span className="text-muted-foreground font-semibold">{title.toUpperCase()}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-sans font-bold tracking-tight text-[#0b2f4a] leading-tight pt-1">
          {title}
        </h1>
        <p className="text-secondary-text font-normal max-w-3xl leading-relaxed text-xs md:text-sm text-[#374151]">
          {subtitle}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 pt-4 mt-4 border-t border-[#d8ddd8]">
        <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#0b2f4a] bg-[#f3f4f1] px-2.5 py-1 rounded border border-[#d8ddd8]">
          <Calculator className="w-3.5 h-3.5 text-[#0f6fae]" />
          <span>Manual Input API</span>
        </div>
        <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#0b2f4a] bg-[#f3f4f1] px-2.5 py-1 rounded border border-[#d8ddd8]">
          <FunctionSquare className="w-3.5 h-3.5 text-[#0f6fae]" />
          <span>Formula Driven</span>
        </div>
        <div className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#6b7280] bg-[#f3f4f1] px-2.5 py-1 rounded border border-[#d8ddd8] border-dashed">
          <Database className="w-3.5 h-3.5 text-[#6b7280]" />
          <span>No Stored Data</span>
        </div>
      </div>
    </div>
  );
}

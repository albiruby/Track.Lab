'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Select, Label } from '@/components/ui/Forms';
import { methodRegistry } from '@/data';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { LabPageHeader } from '@/components/layout/LabPageHeader';

const implementedIds = new Set([
  'fox_220_age', 'tanaka_208_07_age', 'gellish_2069_067_age', 'gulati_206_088_age',
  'five_zone_karvonen_hrr', 'five_zone_hrmax_standard', 'lthr_8020_five_zone', 'maf_180',
  'manual_hrmax', 'custom_hr_zones', 'race_derived_generic', 'manual_pace_zones', 'threshold_based', 'critical_speed_based',
  'riegel_106', 'goal_pace', 'riegel_custom_exponent', 'multi_race_fit',
  'cs_two_point', 'cs_three_point', 'manual_cs',
  'cooper_12min', 'acsm_running_vo2', 'met_from_vo2', 'calories_met', 
  'weekly_mileage', 'weekly_duration', 'long_run_ratio', 'srpe_load', 'monotony', 'strain', 'acwr', 'progression_rate', 'intensity_distribution',
  'carb_total', 'gel_count', 'fluid_total', 'bottle_count', 'sodium_total', 'sweat_rate',
  'cadence', 'step_count', 'stride_length', 'speed_from_cadence_stride',
  'pace_to_kmh', 'kmh_to_pace', 'acsm_treadmill_vo2',
  'grade_pct', 'elevation_per_km', 'vertical_speed', 'hill_repeat_volume',
  'watts_per_kg', 'power_efficiency', 'power_drift', 'critical_power_zone',
  'sleep_duration', 'rhr_delta', 'hrv_delta_pct', 'body_mass_delta_pct', 'session_rpe_recovery',
  'shoe_remaining_km', 'shoe_cost_per_km', 'fuel_cost'
]);

const metadataOnlyIds = new Set([
  'heat_adjustment_note', 'altitude_adjustment_note', 'wind_note'
]);

const categoryToRoute: Record<string, string> = {
  'heart_rate_max': '/heart-rate',
  'heart_rate_zone': '/heart-rate',
  'pace_zone': '/pace',
  'race_prediction': '/race',
  'training_pace': '/pace',
  'critical_speed': '/critical-speed',
  'vo2_metabolic': '/vo2',
  'workout': '/workout-library',
  'load': '/load',
  'fuel_hydration': '/fuel',
  'environment': '/environment',
  'treadmill': '/vo2',
  'biomechanics': '/biomechanics',
};

function FormulaLibraryInner({ searchParam }: { searchParam: string }) {
  const [search, setSearch] = useState(searchParam);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [confidenceFilter, setConfidenceFilter] = useState('all');
  const [inputFilter, setInputFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const categories = useMemo(() => Array.from(new Set(methodRegistry.map(m => m.category))).sort(), []);
  
  const precisionLabels = useMemo(() => {
    return Array.from(new Set(methodRegistry.map(m => m.precision).filter(Boolean))).sort();
  }, []);

  const requiredInputsList = useMemo(() => {
    const inputs = new Set<string>();
    methodRegistry.forEach(m => m.requiredInputs?.forEach(i => inputs.add(i)));
    return Array.from(inputs).sort();
  }, []);

  const filteredMethods = useMemo(() => {
    return methodRegistry.filter(m => {
      const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.id.toLowerCase().includes(search.toLowerCase());
      const matchCategory = categoryFilter === 'all' || m.category === categoryFilter;
      const matchConfidence = confidenceFilter === 'all' || m.precision === confidenceFilter;
      const matchInput = inputFilter === 'all' || (m.requiredInputs as readonly string[])?.includes(inputFilter as string);
      
      let status = 'unavailable';
      if (implementedIds.has(m.id)) status = 'implemented';
      else if (metadataOnlyIds.has(m.id) || m.precision === 'qualitative' || m.formulaDisplay.includes('Qualitative')) status = 'metadata_only';

      const matchStatus = statusFilter === 'all' || status === statusFilter;
      
      return matchSearch && matchCategory && matchConfidence && matchInput && matchStatus;
    });
  }, [search, categoryFilter, confidenceFilter, inputFilter, statusFilter]);

  const getStatus = (m: any) => {
    if (implementedIds.has(m.id)) return { label: 'Implemented', col: 'text-cyan-400 bg-cyan-950/30 border-cyan-500/50' };
    if (metadataOnlyIds.has(m.id) || m.precision === 'qualitative' || m.formulaDisplay.includes('Qualitative')) return { label: 'Metadata Only', col: 'text-amber-500 bg-amber-950/30 border-amber-500/50' };
    return { label: 'Unavailable: Function missing', col: 'text-zinc-500 bg-zinc-900/50 border-zinc-800' };
  };

  return (
    <div className="space-y-6 flex flex-col">
      <LabPageHeader title="Formula Library" subtitle="Reference index of all integrated equations and logic rules." />
      <div className="text-[10px] font-mono tracking-widest text-zinc-500 mb-2 border border-zinc-800/80 bg-zinc-950/50 p-2 uppercase">SYS_NOTE: If a formula is &quot;Unavailable&quot;, no stored data or formula is shown in active calculators.</div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 bg-zinc-950/80 border border-zinc-800 rounded-none">
        <div className="space-y-2">
          <Label>Search Method</Label>
          <Input type="text" placeholder="Search name or ID..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c.replace(/_+/g, ' ').toUpperCase()}</option>)}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Confidence</Label>
          <Select value={confidenceFilter} onChange={e => setConfidenceFilter(e.target.value)}>
            <option value="all">All Labels</option>
            {precisionLabels.map((c: any) => <option key={c} value={c}>{c.replace(/_+/g, ' ')}</option>)}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Required Input</Label>
          <Select value={inputFilter} onChange={e => setInputFilter(e.target.value)}>
            <option value="all">All Inputs</option>
            {requiredInputsList.map((i: any) => <option key={i} value={i}>{i}</option>)}
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="implemented">Implemented</option>
            <option value="metadata_only">Metadata Only</option>
            <option value="unavailable">Unavailable</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
        {filteredMethods.map(method => {
          const st = getStatus(method);
          const route = categoryToRoute[method.category || ''];
          return (
          <Card key={method.id} className="flex flex-col h-full hover:border-cyan-500/50 transition-colors">
            <CardHeader className="pb-3 border-b border-zinc-800">
              <div className="flex justify-between items-start gap-2 mb-2">
                <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 truncate bg-zinc-900 px-2 py-0.5 rounded-none border border-zinc-800">
                  {method.category.replace(/_+/g, ' ')}
                </div>
                <div className={`text-[10px] font-mono uppercase tracking-widest items-center px-2 py-0.5 border rounded-none ${st.col}`}>
                  {st.label}
                </div>
              </div>
              <CardTitle className="text-lg leading-tight uppercase font-mono">{method.name}</CardTitle>
              {route && (
                <Link href={route} className="text-xs text-cyan-500 hover:text-cyan-400 hover:underline inline-block mt-1 uppercase tracking-widest font-mono">INIT CALCULATOR PROCEDURE →</Link>
              )}
            </CardHeader>
            <CardContent className="pt-4 flex-1 flex flex-col gap-4">
              <div className="text-sm bg-zinc-950/80 border border-zinc-800 p-3 rounded-none font-mono break-words text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.2)]">
                {method.formulaDisplay}
              </div>
              
              <div className="space-y-3">
                {method.requiredInputs?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-1 font-mono">REQUIRED VARS</span>
                    <div className="flex flex-wrap gap-1">
                      {method.requiredInputs.map((req: string) => (
                        <span key={req} className="text-[10px] text-zinc-400 border border-zinc-800 bg-zinc-950 px-1.5 py-0.5 rounded-none font-mono uppercase tracking-wider">{req}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {method.limitations?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest block mb-1 font-mono">CONSTRAINTS</span>
                    <ul className="text-[10px] text-zinc-500 list-disc list-inside space-y-1 font-mono uppercase tracking-wide">
                      {(method.limitations as readonly string[]).map((lim: string, idx: number) => (
                        <li key={idx} className="leading-snug">{lim}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="pt-2 flex justify-between items-center text-[10px] text-zinc-600 mt-auto border-t border-zinc-800 pt-3 uppercase tracking-widest font-mono">
                <span className="opacity-70 text-zinc-500">SYS_ID: {method.id}</span>
                <span className="font-semibold text-cyan-700">{method.precision?.replace(/_+/g, ' ')}</span>
              </div>
            </CardContent>
          </Card>
        )})}
        {filteredMethods.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-500 border border-dashed border-zinc-800 bg-zinc-950/30 font-mono tracking-widest uppercase">
            ERR: NO MATCHING PROCEDURES FOUND
          </div>
        )}
      </div>
    </div>
  );
}

export default function FormulaLibraryPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-zinc-500 font-mono">Loading Formula Library...</div>}>
      <FormulaLibraryWithKey />
    </Suspense>
  );
}

function FormulaLibraryWithKey() {
  const searchParams = useSearchParams();
  const searchParam = searchParams.get('search') || '';
  return <FormulaLibraryInner key={searchParam} searchParam={searchParam} />;
}

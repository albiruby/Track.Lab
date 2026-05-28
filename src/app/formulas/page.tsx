'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input, Select, Label } from '@/components/ui/Forms';
import { methodRegistry } from '@/data';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

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
    if (implementedIds.has(m.id)) return { label: 'Implemented', col: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200' };
    if (metadataOnlyIds.has(m.id) || m.precision === 'qualitative' || m.formulaDisplay.includes('Qualitative')) return { label: 'Metadata Only', col: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200' };
    return { label: 'Unavailable: Function missing', col: 'text-zinc-500 bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700' };
  };

  return (
    <div className="space-y-6 flex flex-col">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Formula Library</h1>
        <p className="text-zinc-600 dark:text-zinc-400">Reference index of all integrated equations and logic rules.</p>
        <p className="text-xs text-zinc-500 italic block mt-1">If a formula is &quot;Unavailable&quot;, no stored data or formula is shown in active calculators.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl">
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
          <Card key={method.id} className="flex flex-col h-full hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors">
            <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex justify-between items-start gap-2 mb-2">
                <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 truncate bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                  {method.category.replace(/_+/g, ' ')}
                </div>
                <div className={`text-[10px] items-center px-2 py-0.5 rounded border ${st.col}`}>
                  {st.label}
                </div>
              </div>
              <CardTitle className="text-lg leading-tight">{method.name}</CardTitle>
              {route && (
                <Link href={route} className="text-xs text-blue-600 hover:underline inline-block mt-1">Go to Calculator →</Link>
              )}
            </CardHeader>
            <CardContent className="pt-4 flex-1 flex flex-col gap-4">
              <div className="text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded font-mono break-words">
                {method.formulaDisplay}
              </div>
              
              <div className="space-y-3">
                {method.requiredInputs?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Required Inputs</span>
                    <div className="flex flex-wrap gap-1">
                      {method.requiredInputs.map((req: string) => (
                        <span key={req} className="text-[10px] text-zinc-600 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-mono">{req}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {method.limitations?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block mb-1">Limitations / Assumptions</span>
                    <ul className="text-xs text-zinc-600 dark:text-zinc-400 list-disc list-inside space-y-1">
                      {(method.limitations as readonly string[]).map((lim: string, idx: number) => (
                        <li key={idx} className="leading-snug">{lim}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="pt-2 flex justify-between items-center text-[10px] text-zinc-400 mt-auto border-t border-zinc-50 dark:border-zinc-800/50 pt-3 uppercase tracking-wider">
                <span className="font-mono lowercase opacity-70">id: {method.id}</span>
                <span className="font-semibold text-zinc-500">{method.precision?.replace(/_+/g, ' ')}</span>
              </div>
            </CardContent>
          </Card>
        )})}
        {filteredMethods.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-500 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl">
            No formulas match your search or filters.
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

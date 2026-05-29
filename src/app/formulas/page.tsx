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
  'equivalent_performance_table', 'abc_goal_builder', 'distance_similarity_confidence', 'conservative_start_scenario',
  'manual_base_pace_training', 'pace_category_conversion_table',
  'cs_two_point', 'cs_three_point', 'manual_cs', 'above_cs_tools', 'cs_based_zones', 'cs_vs_race_comparison',
  'cooper_12min', 'acsm_running_vo2', 'met_from_vo2', 'calories_met', 
  'weekly_mileage', 'weekly_duration', 'long_run_ratio', 'srpe_load', 'monotony', 'strain', 'acwr', 'progression_rate', 'intensity_distribution',
  'carb_total', 'gel_count', 'fluid_total', 'bottle_count', 'sodium_total', 'sweat_rate',
  'cadence', 'step_count', 'stride_length', 'speed_from_cadence_stride',
  'pace_to_kmh', 'kmh_to_pace', 'acsm_treadmill_vo2',
  'grade_pct', 'elevation_per_km', 'vertical_speed', 'hill_repeat_volume',
  'watts_per_kg', 'power_efficiency', 'power_drift', 'critical_power_zone',
  'sleep_duration', 'rhr_delta', 'hrv_delta_pct', 'body_mass_delta_pct', 'session_rpe_recovery',
  'shoe_remaining_km', 'shoe_cost_per_km', 'fuel_cost',
  'even_split', 'srpe_load_new', 'rpe_classification', 'track_interval', 'race_timeline', 'logistics_checkpoints', 'unit_conversion', 'weekly_calendar_analysis',
  'pace_from_distance_time', 'time_from_distance_pace', 'distance_from_time_pace', 'speed_from_pace', 'pace_from_speed', 'min_km_to_min_mile', 'min_mile_to_min_km', 'elapsed_moving_pace', 'run_walk_blended_pace', 'pace_drift',
  'even_split_table', 'negative_split_table', 'progressive_split_table', 'race_pace_band', 'split_comparison',
  'track_pace_table', 'interval_builder', 'ladder_calculator', 'pyramid_calculator',
  'nes_211_064_age', 'hr_reserve', 'hr_drift', 'aerobic_decoupling', 'hr_recovery',
  'three_zone_polarized', 'seven_zone_advanced_hr', 'time_in_zone_distribution', 'intensity_distribution', 'zone_comparison',
  'borg_6_20', 'rpe_to_zone_mapping', 'rpe_drift', 'planned_vs_actual_rpe', 'multi_day_rpe_trend'
]);

const metadataOnlyIds = new Set([
  'heat_adjustment_note', 'altitude_adjustment_note', 'wind_note'
]);

const categoryToRoute: Record<string, string> = {
  'heart_rate_max': '/heart-rate',
  'heart_rate_zone': '/zone',
  'heart_rate': '/heart-rate',
  'zone': '/zone',
  'pace_zone': '/zone',
  'race_prediction': '/race',
  'training_pace': '/pace',
  'critical_speed': '/critical-speed',
  'vo2_metabolic': '/vo2',
  'workout': '/workout',
  'load': '/load',
  'fuel_hydration': '/fuel',
  'environment': '/environment',
  'treadmill': '/vo2',
  'biomechanics': '/biomechanics',
  'split': '/split',
  'rpe': '/rpe',
  'track': '/track',
  'race_day': '/race',
  'conversion': '/conversion',
  'calendar': '/calendar'
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
    if (implementedIds.has(m.id)) return { label: 'Implemented', col: 'text-primary bg-primary/10 border-primary' };
    if (metadataOnlyIds.has(m.id) || m.precision === 'qualitative' || m.formulaDisplay.includes('Qualitative')) return { label: 'Metadata Only', col: 'text-amber-600 bg-amber-100 border-amber-600' };
    return { label: 'Unavailable: Function missing', col: 'text-muted-foreground bg-muted border-border-heavy' };
  };

  return (
    <div className="space-y-6 flex flex-col">
      <LabPageHeader title="Formula Library" subtitle="Reference index of all integrated equations and logic rules." />
      <div className="text-[10px] font-bold tracking-widest text-muted-foreground mb-4 border-2 border-border-heavy bg-white p-3 uppercase rounded-lg shadow-[1px_1px_0px_rgba(23,23,23,1)]">NOTE: If a formula is &quot;Unavailable&quot;, no stored data or formula is shown in active calculators.</div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 p-6 bg-card border-2 border-border-heavy rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)]">
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
          <div key={method.id} className="flex flex-col h-full bg-white border-2 border-border-heavy rounded-xl shadow-[2px_2px_0px_rgba(23,23,23,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all overflow-hidden group">
            <div className="p-4 border-b-2 border-border-heavy bg-card">
              <div className="flex justify-between items-start gap-2 mb-3">
                <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground truncate border-2 border-border-heavy bg-white px-2 py-0.5 rounded shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                  {method.category.replace(/_+/g, ' ')}
                </div>
                <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border-2 rounded shadow-[1px_1px_0px_rgba(23,23,23,1)] ${st.col}`}>
                  {st.label}
                </div>
              </div>
              <h3 className="text-xl font-display font-bold uppercase tracking-tight text-foreground">{method.name}</h3>
              {route && (
                <Link href={route} className="text-[10px] font-bold text-primary hover:text-foreground transition-colors mt-2 uppercase tracking-widest flex items-center gap-1 group-hover:underline">OPEN CALCULATOR EXPLORER →</Link>
              )}
            </div>
            <div className="p-4 flex-1 flex flex-col gap-4">
              <div className="text-sm border-2 border-border-heavy bg-card p-3 rounded-lg font-mono font-bold break-words text-foreground shadow-[inset_1px_1px_0px_rgba(0,0,0,0.1)]">
                {method.formulaDisplay}
              </div>
              
              <div className="space-y-3">
                {method.requiredInputs?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold tracking-widest uppercase block mb-1 text-muted-foreground">REQUIRED VARS</span>
                    <div className="flex flex-wrap gap-1.5">
                      {method.requiredInputs.map((req: string) => (
                        <span key={req} className="text-[10px] font-bold uppercase tracking-widest text-foreground bg-muted px-2 py-0.5 rounded shadow-[1px_1px_0px_rgba(23,23,23,0.1)] border border-border">{req}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {method.limitations?.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold tracking-widest uppercase block mb-1 text-muted-foreground">CONSTRAINTS</span>
                    <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1 font-medium leading-relaxed">
                      {(method.limitations as readonly string[]).map((lim: string, idx: number) => (
                        <li key={idx} className="leading-snug">{lim}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="pt-2 flex justify-between items-center text-[10px] text-muted-foreground mt-auto border-t-2 border-border-heavy pt-3 uppercase font-bold tracking-widest">
                <span>SYS_ID: {method.id}</span>
                <span className="text-primary">{method.precision?.replace(/_+/g, ' ')}</span>
              </div>
            </div>
          </div>
        )})}
        {filteredMethods.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground border-2 border-dashed border-border-heavy bg-card rounded-xl font-bold tracking-widest uppercase shadow-[inset_2px_2px_0px_rgba(0,0,0,0.05)]">
            NO MATCHING PROCEDURES FOUND
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

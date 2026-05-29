'use client';

import { useState, useMemo, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
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
  'borg_6_20', 'rpe_to_zone_mapping', 'rpe_drift', 'planned_vs_actual_rpe', 'multi_day_rpe_trend',
  'cooper_12min_vo2', 'one_five_mile_vo2', 'rockport_vo2', 'acsm_walking_vo2', 'manual_device_vo2', 'manual_lab_vo2',
  'vo2_reserve', 'pct_vo2_max', 'grade_impact_vo2', 'speed_to_vo2_table',
  'calories_per_session', 'calories_per_km', 'calories_per_hour', 'energy_cost_per_km', 'weekly_energy_manual',
  'cooper_12min_test', 'one_mile_test', 'three_k_test', 'five_k_test', 'twenty_min_threshold_test', 'thirty_min_lthr_test',
  'two_point_cs_test', 'three_point_cs_test', 'hr_recovery_test', 'sweat_rate_test', 'treadmill_calibration_test',
  'cadence_test', 'stride_length_test', 'easy_run_drift_test',
  'interval_set_calculator', 'total_work_distance', 'total_work_time', 'total_rest_time', 'session_duration', 'work_rest_ratio', 'workout_density', 'hard_easy_distribution', 'session_rpe_load', 'run_walk_workout', 'fartlek_totals', 'hill_repeat_totals', 'tempo_run_calculator', 'threshold_block_calculator', 'cruise_interval_calculator', 'progression_run_calculator', 'ladder_workout_calculator', 'pyramid_workout_calculator', 'workout_comparison', 'block_based_builder',
  'weekly_mileage_sum', 'weekly_duration_sum', 'hard_easy_spacing_checker', 'intensity_distribution_preview', 'build_week_progression', 'deload_week_ratio', 'taper_reduction_ratio', 'manual_weekly_planner_impact', 'consecutive_hard_day_caution', 'rest_day_count', 'hard_day_count', 'easy_day_count',
  'static_template_browser', 'template_filter_purpose', 'template_filter_distance', 'template_filter_duration', 'template_filter_surface', 'template_filter_intensity', 'template_to_workout_lab', 'template_comparison', 'export_template',
  'heat_index_estimate', 'dew_point_category', 'heat_stress_category', 'heat_pace_scenario', 'heat_hydration_scenario', 'heat_sodium_scenario', 'altitude_category', 'altitude_vo2_reduction', 'wind_chill_estimate', 'wind_effect_classification', 'aqi_category', 'surface_effort_note', 'environmental_condition_summary',
  'elevation_per_mile', 'vam', 'climb_density', 'descent_density', 'gain_loss_ratio', 'net_elevation', 'hill_repeat_time', 'segment_grade', 'segment_difficulty', 'manual_elevation_profile', 'equivalent_flat_distance',
  'kmh_to_mph', 'mph_to_kmh', 'incline_to_grade', 'acsm_treadmill_running_vo2', 'acsm_treadmill_walking_vo2', 'speed_incline_matrix', 'treadmill_calibration_error', 'treadmill_segment_profile', 'road_vs_treadmill_note'
]);

const metadataOnlyIds = new Set([
  'heat_adjustment_note', 'altitude_adjustment_note', 'wind_note',
  'balke_vo2', 'beep_test_vo2', 'uth_sorensen_vo2', 'gross_vs_net_calories', 'fuel_demand_estimate', 'long_run_fueling_test'
]);

const routeList = [
  { label: 'All Modules', value: 'all' },
  { label: 'Pace Lab', value: '/pace' },
  { label: 'Split Lab', value: '/split' },
  { label: 'Heart Rate Lab', value: '/heart-rate' },
  { label: 'Zone Lab', value: '/zone' },
  { label: 'RPE Lab', value: '/rpe' },
  { label: 'Race Lab', value: '/race' },
  { label: 'Training Pace Lab', value: '/training-pace' },
  { label: 'Critical Speed Lab', value: '/critical-speed' },
  { label: 'VO2 & Metabolic Lab', value: '/vo2' },
  { label: 'Workout Lab', value: '/workout' },
  { label: 'Workout Library', value: '/workout-library' },
  { label: 'Test Lab', value: '/test' },
  { label: 'Load Lab', value: '/load' },
  { label: 'Fuel & Hydration Lab', value: '/fuel' },
  { label: 'Environment Lab', value: '/environment' },
  { label: 'Trail & Elevation Lab', value: '/trail-elevation' },
  { label: 'Treadmill Lab', value: '/treadmill' },
  { label: 'Track Lab', value: '/track' },
  { label: 'Biomechanics Lab', value: '/biomechanics' },
  { label: 'Power Lab', value: '/power' },
  { label: 'Recovery Check Lab', value: '/recovery' },
  { label: 'Gear Lab', value: '/gear' },
  { label: 'Race Day Lab', value: '/race-day' },
  { label: 'Conversion Lab', value: '/conversion' },
  { label: 'Calendar Lab', value: '/calendar' }
];

const friendlyCategoryToRoute: Record<string, string> = {
  'Pace': '/pace',
  'Split': '/split',
  'Heart Rate': '/heart-rate',
  'Zone': '/zone',
  'RPE': '/rpe',
  'Race': '/race',
  'Training Pace': '/training-pace',
  'Critical Speed': '/critical-speed',
  'VO2': '/vo2',
  'Metabolic': '/vo2',
  'Workout': '/workout',
  'Workout Library': '/workout-library',
  'Test': '/test',
  'Load': '/load',
  'Fuel': '/fuel',
  'Hydration': '/fuel',
  'Sodium': '/fuel',
  'Sweat Rate': '/fuel',
  'Environment': '/environment',
  'Trail & Elevation': '/trail-elevation',
  'Treadmill': '/treadmill',
  'Track': '/track',
  'Biomechanics': '/biomechanics',
  'Power': '/power',
  'Recovery': '/recovery',
  'Gear': '/gear',
  'Race Day': '/race-day',
  'Conversion': '/conversion',
  'Calendar': '/calendar'
};

const formulaCategoriesList = [
  'Pace',
  'Split',
  'Heart Rate',
  'Zone',
  'RPE',
  'Race',
  'Training Pace',
  'Critical Speed',
  'VO2',
  'Metabolic',
  'Workout',
  'Workout Library',
  'Test',
  'Load',
  'Fuel',
  'Hydration',
  'Sodium',
  'Sweat Rate',
  'Environment',
  'Trail & Elevation',
  'Treadmill',
  'Track',
  'Biomechanics',
  'Power',
  'Recovery',
  'Gear',
  'Race Day',
  'Conversion',
  'Calendar'
];

function getFriendlyCategory(m: { id: string; category: string; name: string }): string {
  const cat = m.category;
  if (cat === 'fuel_hydration' || cat === 'fuel') {
    const nameLower = m.name.toLowerCase();
    const idLower = m.id.toLowerCase();
    if (idLower.includes('sodium') || nameLower.includes('sodium')) return 'Sodium';
    if (idLower.includes('sweat') || nameLower.includes('sweat')) return 'Sweat Rate';
    if (idLower.includes('fluid') || nameLower.includes('fluid') || idLower.includes('bottle') || nameLower.includes('bottle')) return 'Hydration';
    return 'Fuel';
  }
  if (cat === 'vo2_metabolic') {
    const idLower = m.id.toLowerCase();
    const nameLower = m.name.toLowerCase();
    if (idLower.includes('calorie') || nameLower.includes('calorie') || idLower.includes('met') || nameLower.includes('met') || idLower.includes('energy') || nameLower.includes('energy')) {
      return 'Metabolic';
    }
    return 'VO2';
  }
  if (cat === 'pace_zone' && m.id.includes('training')) {
    return 'Training Pace';
  }

  const categoryMap: Record<string, string> = {
    'heart_rate_max': 'Heart Rate',
    'heart_rate': 'Heart Rate',
    'heart_rate_zone': 'Zone',
    'pace_zone': 'Zone',
    'zone': 'Zone',
    'rpe': 'RPE',
    'race_prediction': 'Race',
    'race': 'Race',
    'training_pace': 'Training Pace',
    'critical_speed': 'Critical Speed',
    'vo2': 'VO2',
    'metabolic': 'Metabolic',
    'workout': 'Workout',
    'workout_library': 'Workout Library',
    'test': 'Test',
    'field_test': 'Test',
    'load': 'Load',
    'fuel': 'Fuel',
    'hydration': 'Hydration',
    'sodium': 'Sodium',
    'sweat_rate': 'Sweat Rate',
    'environment': 'Environment',
    'trail_elevation': 'Trail & Elevation',
    'elevation_grade': 'Trail & Elevation',
    'treadmill': 'Treadmill',
    'track': 'Track',
    'biomechanics': 'Biomechanics',
    'power': 'Power',
    'recovery': 'Recovery',
    'gear': 'Gear',
    'race_day': 'Race Day',
    'conversion': 'Conversion',
    'calendar': 'Calendar'
  };

  return categoryMap[cat] || cat.replace(/_+/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function getNormalizedConfidence(m: any): 'exact' | 'estimate' | 'field_test' | 'manual' | 'qualitative' {
  const prec = (m.precision || '').toLowerCase();
  if (prec === 'mathematical' || prec === 'exact') return 'exact';
  if (prec.includes('estimate') || prec.includes('empirical')) return 'estimate';
  if (prec === 'field_test' || m.id.includes('test')) return 'field_test';
  if (prec === 'custom' || prec === 'measured_or_custom' || prec === 'manual') return 'manual';
  return 'qualitative';
}

function getConfidenceDisplay(m: any): string {
  const norm = getNormalizedConfidence(m);
  if (norm === 'exact') return 'Exact';
  if (norm === 'estimate') return 'Estimate';
  if (norm === 'field_test') return 'Field Test';
  if (norm === 'manual') return 'Manual';
  return 'Qualitative';
}

function getImplementationStatus(m: any): 'implemented' | 'planned' | 'reference-only' | 'metadata-only' {
  if (implementedIds.has(m.id)) return 'implemented';
  if (metadataOnlyIds.has(m.id)) return 'metadata-only';
  if (m.precision === 'qualitative' || m.formulaDisplay?.toLowerCase().includes('qualitative') || m.formulaDisplay?.toLowerCase().includes('reference')) {
    return 'reference-only';
  }
  return 'planned';
}

function FormulaLibraryInner({ searchParam }: { searchParam: string }) {
  const [search, setSearch] = useState(searchParam);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [confidenceFilter, setConfidenceFilter] = useState('all');
  const [exactVsEstimateFilter, setExactVsEstimateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [inputFilter, setInputFilter] = useState('all');
  const [fieldTestOnly, setFieldTestOnly] = useState(false);

  const categories = useMemo(() => {
    return formulaCategoriesList;
  }, []);

  const requiredInputsList = useMemo(() => {
    const inputs = new Set<string>();
    methodRegistry.forEach(m => m.requiredInputs?.forEach((i: string) => inputs.add(i)));
    return Array.from(inputs).sort();
  }, []);

  const filteredMethods = useMemo(() => {
    return methodRegistry.filter(m => {
      const friendlyCat = getFriendlyCategory(m);
      const isImp = getImplementationStatus(m);
      const mRoute = friendlyCategoryToRoute[friendlyCat] || '/';
      const normConf = getNormalizedConfidence(m);

      const searchLower = search.toLowerCase();
      const matchSearch = m.name.toLowerCase().includes(searchLower) ||
                          m.id.toLowerCase().includes(searchLower) ||
                          m.formulaDisplay.toLowerCase().includes(searchLower) ||
                          m.requiredInputs?.some((inp: string) => inp.toLowerCase().includes(searchLower)) ||
                          friendlyCat.toLowerCase().includes(searchLower);

      const matchCategory = categoryFilter === 'all' || friendlyCat === categoryFilter;
      const matchModule = moduleFilter === 'all' || mRoute === moduleFilter;
      const matchConfidence = confidenceFilter === 'all' || normConf === confidenceFilter;

      let matchExactVsEstimate = true;
      if (exactVsEstimateFilter === 'exact') matchExactVsEstimate = (normConf === 'exact');
      if (exactVsEstimateFilter === 'estimate') matchExactVsEstimate = (normConf === 'estimate');

      const matchStatus = statusFilter === 'all' || isImp === statusFilter;
      const matchInput = inputFilter === 'all' || (m.requiredInputs as readonly string[])?.includes(inputFilter as string);
      const matchFieldTest = !fieldTestOnly || (normConf === 'field_test');

      return matchSearch && matchCategory && matchModule && matchConfidence && matchExactVsEstimate && matchStatus && matchInput && matchFieldTest;
    });
  }, [search, categoryFilter, moduleFilter, confidenceFilter, exactVsEstimateFilter, statusFilter, inputFilter, fieldTestOnly]);

  const getStatusBadge = (m: any) => {
    const status = getImplementationStatus(m);
    if (status === 'implemented') {
      return { label: 'Implemented', col: 'text-emerald-700 bg-emerald-50 border-emerald-300' };
    }
    if (status === 'metadata-only') {
      return { label: 'Metadata Only', col: 'text-amber-700 bg-amber-50 border-amber-300' };
    }
    if (status === 'reference-only') {
      return { label: 'Reference Only', col: 'text-purple-700 bg-purple-50 border-purple-300' };
    }
    return { label: 'Planned / Doc', col: 'text-blue-700 bg-blue-50 border-blue-350' };
  };

  return (
    <div className="space-y-6 flex flex-col">
      <LabPageHeader title="Formula Library" subtitle="Formula Registry & scientific proof-of-concept repository." />
      
      <div className="text-[10px] sm:text-xs font-bold leading-normal text-muted-foreground border-2 border-border-heavy bg-card p-4 uppercase rounded-xl shadow-[3px_3px_0px_rgba(23,23,23,1)]">
        <strong>Track.Lab Permanent Principles:</strong> Every athletic calculator is built strictly on verified deterministic biomechanic, cardiovascular, and pacing equations. We never display AI predictions or magic training estimates. What you see is mathematically traceable.
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6 bg-card border-2 border-border-heavy rounded-xl shadow-[3px_3px_0px_rgba(23,23,23,1)]">
        <div className="space-y-2">
          <Label htmlFor="search-input">Search Method (Name, Formula, Var)</Label>
          <Input id="search-input" type="text" placeholder="e.g. Riegel, HRmax, age..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-select">Formula Category</Label>
          <Select id="category-select" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="module-select">Target Lab Module</Label>
          <Select id="module-select" value={moduleFilter} onChange={e => setModuleFilter(e.target.value)}>
            {routeList.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confidence-select">Confidence Level</Label>
          <Select id="confidence-select" value={confidenceFilter} onChange={e => setConfidenceFilter(e.target.value)}>
            <option value="all">All Levels</option>
            <option value="exact">Exact (Biomechanical/Math)</option>
            <option value="estimate">Estimate (Empirical Scales)</option>
            <option value="field_test">Field Test Protocols</option>
            <option value="manual">Manual/User Inputs</option>
            <option value="qualitative">Qualitative Rules</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="exact-select">Exact vs Estimate</Label>
          <Select id="exact-select" value={exactVsEstimateFilter} onChange={e => setExactVsEstimateFilter(e.target.value)}>
            <option value="all">All Precision Types</option>
            <option value="exact">Exact Formula Only</option>
            <option value="estimate">Estimate Formula Only</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status-select">Registry Status</Label>
          <Select id="status-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            <option value="implemented">Implemented</option>
            <option value="planned">Planned / Documentation</option>
            <option value="reference-only">Reference Only</option>
            <option value="metadata-only">Metadata Only</option>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="input-select">Filter by Input Var</Label>
          <Select id="input-select" value={inputFilter} onChange={e => setInputFilter(e.target.value)}>
            <option value="all">All Variables</option>
            {requiredInputsList.map((i: any) => <option key={i} value={i}>{i}</option>)}
          </Select>
        </div>

        <div className="flex flex-col justify-end pb-1">
          <label className="flex items-center gap-3 p-3 border-2 border-border-heavy rounded-lg bg-white select-none cursor-pointer hover:bg-neutral-50 active:bg-neutral-100 transition-colors">
            <input type="checkbox" checked={fieldTestOnly} onChange={e => setFieldTestOnly(e.target.checked)} className="w-4 h-4 rounded text-primary accent-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-foreground">Field-Test Protocols Only</span>
          </label>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-muted-foreground border-b-2 border-border-heavy pb-2">
        <span>METHODS IN REGISTRY: {methodRegistry.length}</span>
        <span className="text-primary">MATCHED: {filteredMethods.length}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
        {filteredMethods.map((method, idx) => {
          const st = getStatusBadge(method);
          const friendlyCat = getFriendlyCategory(method);
          const route = friendlyCategoryToRoute[friendlyCat];
          const hasExport = methodRegistry.some(m => m.id === method.id) && getImplementationStatus(method) === 'implemented';
          
          const baseKey = `${method.id}__${method.route ?? "no-route"}__${method.category ?? "no-category"}`;
          const fallbackKey = `${baseKey}__${idx}`;
          
          return (
            <div key={fallbackKey} className="flex flex-col h-full bg-white border-2 border-border-heavy rounded-xl shadow-[3px_3px_0px_rgba(23,23,23,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all overflow-hidden group">
              <div className="p-4 border-b-2 border-border-heavy bg-card shrink-0">
                <div className="flex justify-between items-start gap-2 mb-3">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground truncate border-2 border-border-heavy bg-white px-2 py-0.5 rounded shadow-[1px_1px_0px_rgba(23,23,23,1)]">
                    {friendlyCat}
                  </div>
                  <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border-2 rounded shadow-[1px_1px_0px_rgba(23,23,23,1)] ${st.col}`}>
                    {st.label}
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-display font-black uppercase tracking-tight text-foreground line-clamp-1">{method.name}</h3>
                
                {route && (
                  <Link href={route} className="text-[10px] font-bold text-primary hover:text-foreground transition-colors mt-2 uppercase tracking-widest flex items-center gap-1 group-hover:underline">
                    OPEN LAB MODULE →
                  </Link>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col gap-4">
                <div className="text-xs border-2 border-border-heavy bg-card p-3 rounded-lg font-mono font-bold break-all text-neutral-800 shadow-[inset_1px_1px_0px_rgba(0,0,0,0.1)]">
                  {method.formulaDisplay}
                </div>
                
                <div className="space-y-3 flex-1">
                  {method.requiredInputs && method.requiredInputs.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold tracking-widest uppercase block mb-1 text-muted-foreground">REQUIRED INPUT VARIABLES</span>
                      <div className="flex flex-wrap gap-1">
                        {method.requiredInputs.map((req: string) => (
                          <span key={req} className="text-[9px] font-bold uppercase tracking-widest text-neutral-700 bg-neutral-100 px-1.5 py-0.5 rounded border border-border">
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {method.limitations && method.limitations.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold tracking-widest uppercase block mb-1 text-muted-foreground">SCIENTIFIC LIMITATIONS</span>
                      <ul className="text-[11px] text-muted-foreground list-disc list-inside space-y-1 font-semibold leading-relaxed">
                        {(method.limitations as readonly string[]).map((lim: string, idx: number) => (
                          <li key={idx} className="leading-snug">{lim}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="pt-3 border-t-2 border-border-heavy flex flex-col gap-2 shrink-0">
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                    <span>Export Support</span>
                    <span className={hasExport ? "text-emerald-600" : "text-muted-foreground"}>
                      {hasExport ? "MANUAL EXPORT SAVES NO DATA" : "NOT APPLICABLE"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-neutral-500 mt-1 uppercase font-bold tracking-widest">
                    <span>SYS_ID: {method.id}</span>
                    <span className="text-primary font-black bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                      {getConfidenceDisplay(method)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredMethods.length === 0 && (
          <div className="col-span-full py-16 text-center text-muted-foreground border-2 border-dashed border-border-heavy bg-card rounded-xl font-bold tracking-widest uppercase shadow-[inset_2px_2px_0px_rgba(0,0,0,0.05)]">
            NO MATCHING SCIENTIFIC METHODS FOUND IN REGISTRY
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

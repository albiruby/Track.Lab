import { CalculatorMetadata } from '@/types';

export const METHOD_220_AGE: CalculatorMetadata = {
  id: '220_age',
  name: '220 - Age (Fox & Haskell)',
  requiredInputs: ['age'],
  formulaDisplay: 'HRmax = 220 - Age',
  limitations: 'Highest error margin (±10-12 bpm). Tends to underestimate HRmax for older adults and overestimate for younger adults.',
  sourceNote: 'Fox et al., 1971',
  precisionLabel: 'Estimate'
};

export const METHOD_TANAKA: CalculatorMetadata = {
  id: 'tanaka',
  name: 'Tanaka Formula',
  requiredInputs: ['age'],
  formulaDisplay: 'HRmax = 208 - (0.7 × Age)',
  limitations: 'General population estimate (±7-10 bpm). More robust for older populations than 220-Age.',
  sourceNote: 'Tanaka et al., 2001',
  precisionLabel: 'Estimate'
};

export const METHOD_GELLISH: CalculatorMetadata = {
  id: 'gellish',
  name: 'Gellish Formula',
  requiredInputs: ['age'],
  formulaDisplay: 'HRmax = 207 - (0.7 × Age)',
  limitations: 'Designed specifically for active individuals and athletes.',
  sourceNote: 'Gellish et al., 2007',
  precisionLabel: 'Estimate'
};

export const METHOD_GULATI: CalculatorMetadata = {
  id: 'gulati',
  name: 'Gulati (Women)',
  requiredInputs: ['age'],
  formulaDisplay: 'HRmax = 206 - (0.88 × Age)',
  limitations: 'Specific population formula for asymptomatic women only.',
  sourceNote: 'Gulati et al., 2010',
  precisionLabel: 'Estimate'
};

export const HR_MAX_METHODS = [
  METHOD_220_AGE, METHOD_TANAKA, METHOD_GELLISH, METHOD_GULATI
];

export const METHOD_KARVONEN: CalculatorMetadata = {
  id: 'karvonen',
  name: 'Karvonen Method (HRR)',
  requiredInputs: ['hrMax', 'hrRest'],
  formulaDisplay: 'Target HR = ((HRmax - HRrest) × %Intensity) + HRrest',
  limitations: 'Requires accurate measured HRmax and True Resting HR for validity. If HRmax is estimated, zones are inherently inaccurate.',
  sourceNote: 'Karvonen et al., 1957',
  precisionLabel: 'Custom'
};

export const METHOD_PACE_STD: CalculatorMetadata = {
  id: 'pace_std',
  name: 'Standard Speed-Distance-Time',
  requiredInputs: ['distance_km', 'time_seconds'],
  formulaDisplay: 'Pace = Time / Distance',
  limitations: 'Assumes perfectly uniform pacing and zero stops. Does not account for elevation or terrain variation.',
  sourceNote: 'Physics',
  precisionLabel: 'Measured'
};

export const METHOD_RIEGEL: CalculatorMetadata = {
  id: 'riegel',
  name: 'Riegel Race Predictor',
  requiredInputs: ['t1', 'd1', 'd2'],
  formulaDisplay: 'T2 = T1 × (D2 / D1)^1.06',
  limitations: 'Only works if D2 is between 0.5× and 2× of D1. Rapidly loses accuracy if D1 is a 5K and D2 is a Marathon. Does not account for muscle fatigue limiters.',
  sourceNote: 'Peter Riegel, 1977',
  precisionLabel: 'Estimate'
};

export const METHOD_WORKOUT: CalculatorMetadata = {
  id: 'workout',
  name: 'Interval Session Calculator',
  requiredInputs: ['reps', 'distance', 'pace', 'rest'],
  formulaDisplay: 'Total Time = (Reps × Rep Time) + ((Reps - 1) × Rest time)',
  limitations: 'Assumes exact execution of target intervals and strictly timed rest.',
  sourceNote: 'Standard Arithmetic',
  precisionLabel: 'Custom'
};

export const METHOD_FUELING: CalculatorMetadata = {
  id: 'fueling',
  name: 'Endurance Carb Calculator',
  requiredInputs: ['duration', 'carb_rate'],
  formulaDisplay: 'Total Carbs = Duration (hrs) × Carb Rate (g/hr)',
  limitations: 'Stomach absorption maxes out around 90-120g/hr (with multiple transport carbs). High rates require gut training.',
  sourceNote: 'Sports Nutrition Consensus',
  precisionLabel: 'Estimate'
};

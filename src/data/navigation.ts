import { 
  Zap, Timer, HeartPulse, Medal,
  Gauge, Beaker, ClipboardList, BookOpen, Weight, 
  Droplet, CloudFog, Footprints, 
  Sigma, ArrowLeftRight, Calendar
} from 'lucide-react';

export const LAB_ROUTES = [
  {
    id: 'quick-lab',
    name: 'Quick Lab',
    label: 'Quick Lab',
    href: '/',
    category: 'Practical Tools',
    description: 'The front door to 27 modules. Search, filter, and dive into formula-based running calculations.',
    status: 'implemented',
    icon: Zap,
    tags: ['Home', 'Center', 'Launcher'],
    shortSummary: 'Formula-based running calculation launcher'
  },
  {
    id: 'pace-lab',
    name: 'Pace Lab',
    label: 'Pace Lab',
    href: '/pace',
    category: 'Pace & Race',
    description: 'Calculate and convert pace, time, running speed, and splits.',
    status: 'implemented',
    icon: Timer,
    tags: ['Pacing', 'Speed', 'Basic'],
    shortSummary: 'Standard pace, speed and time calculator'
  },
  {
    id: 'split-lab',
    name: 'Split Lab',
    label: 'Split Lab',
    href: '/split',
    category: 'Pace & Race',
    description: 'Build race, lap, and customizable interval splits tables.',
    status: 'implemented',
    icon: Zap,
    tags: ['Table', 'Intervals', 'Race'],
    shortSummary: 'Custom split tables builder'
  },
  {
    id: 'heart-rate-lab',
    name: 'Heart Rate Lab',
    label: 'Heart Rate Lab',
    href: '/heart-rate',
    category: 'Intensity',
    description: 'Compare age-based HRmax estimation methods with measured tests and configure Karvonen reserves.',
    status: 'implemented',
    icon: HeartPulse,
    tags: ['HRmax', 'Reserve', 'Cardio'],
    shortSummary: 'HRmax formulas and Karvonen heart rate reserves'
  },
  {
    id: 'zone-lab',
    name: 'Zone Lab',
    label: 'Zone Lab',
    href: '/zone',
    category: 'Intensity',
    description: 'Configure standard and advanced HR, pace, power, and RPE-based training zones.',
    status: 'implemented',
    icon: HeartPulse,
    tags: ['Zones', 'Threshold', 'Limits'],
    shortSummary: 'Multi-variable heart rate, pace, power zone models'
  },
  {
    id: 'rpe-lab',
    name: 'RPE Lab',
    label: 'RPE Lab',
    href: '/rpe',
    category: 'Intensity',
    description: 'Rate of Perceived Exertion conversion, perceived load tracking, and daily trend tools.',
    status: 'implemented',
    icon: Gauge,
    tags: ['Effort', 'Load', 'Psychological'],
    shortSummary: 'Subjective rate of perceived exertion mapping'
  },
  {
    id: 'race-lab',
    name: 'Race Lab',
    label: 'Race Lab',
    href: '/race',
    category: 'Pace & Race',
    description: 'Estimate race outcomes, Riegel exponent controls, multi-distance fits, and split cards.',
    status: 'implemented',
    icon: Medal,
    tags: ['Riegel', 'Prediction', 'Pace Band'],
    shortSummary: 'Race prediction equations and goal analysis'
  },
  {
    id: 'training-pace',
    name: 'Training Pace Lab',
    label: 'Training Pace Lab',
    href: '/training-pace',
    category: 'Pace & Race',
    description: 'Formulate physiological pacing ranges for easy, recovery, tempo, and speed thresholds.',
    status: 'implemented',
    icon: Timer,
    tags: ['Pacing', 'Intensity', 'Aerobic'],
    shortSummary: 'Aesthetic training pace range calculators'
  },
  {
    id: 'critical-speed',
    name: 'Critical Speed Lab',
    label: 'Critical Speed Lab',
    href: '/critical-speed',
    category: 'Intensity',
    description: 'Calculate 2-point and 3-point critical speed profiles, anaerobic capacity (D′), and paces.',
    status: 'implemented',
    icon: Gauge,
    tags: ['Anaerobic', 'Capacity', 'Field Test'],
    shortSummary: 'Critical Speed (CS) and D′ athletic profiling'
  },
  {
    id: 'vo2-lab',
    name: 'VO2 & Metabolic Lab',
    label: 'VO2 & Metabolic Lab',
    href: '/vo2',
    category: 'Intensity',
    description: 'Estimate VO2max, Metabolic Equivalents (METs), oxygen cost, and gross session calories.',
    status: 'implemented',
    icon: Beaker,
    tags: ['Metabolic', 'Calories', 'VO2max'],
    shortSummary: 'Oxygen kinetics and respiratory metric modeling'
  },
  {
    id: 'workout-lab',
    name: 'Workout Lab',
    label: 'Workout Lab',
    href: '/workout',
    category: 'Workout & Load',
    description: 'Calculate explicit interval work-to-rest durations, split times, densities, and ratios.',
    status: 'implemented',
    icon: ClipboardList,
    tags: ['Intervals', 'Workout', 'Planning'],
    shortSummary: 'Anatomy of interval, tempo and custom workouts'
  },
  {
    id: 'workout-library',
    name: 'Workout Library',
    label: 'Workout Library',
    href: '/workout-library',
    category: 'Workout & Load',
    description: 'Browse, filter, and inspect static structural athletic workout templates.',
    status: 'implemented',
    icon: BookOpen,
    tags: ['Database', 'Templates', 'Reference'],
    shortSummary: 'Curated library of textbook sport-science workout sets'
  },
  {
    id: 'test-lab',
    name: 'Test Lab',
    label: 'Test Lab',
    href: '/test',
    category: 'Practical Tools',
    description: 'Structure athletic field-tests (Cooper, LTHR, Sweat Rate) with systematic confidence scoring.',
    status: 'implemented',
    icon: Beaker,
    tags: ['Testing', 'Diagnostics', 'Confidence'],
    shortSummary: 'Field-test protocol manager and evaluation indicators'
  },
  {
    id: 'load-lab',
    name: 'Load Lab',
    label: 'Load Lab',
    href: '/load',
    category: 'Workout & Load',
    description: 'Track acute-to-chronic workload ratio (ACWR), progression rate, monotony, and strain indices.',
    status: 'implemented',
    icon: Weight,
    tags: ['ACWR', 'Load', 'Fatigue'],
    shortSummary: 'Physiological chronic load tracking mathematics'
  },
  {
    id: 'fuel-lab',
    name: 'Fuel & Hydration Lab',
    label: 'Fuel & Hydration Lab',
    href: '/fuel',
    category: 'Fuel & Environment',
    description: 'Calculate carb rates, sweat-derived fluid requirements, sodium loss, and gear setups.',
    status: 'implemented',
    icon: Droplet,
    tags: ['Fueling', 'Sweat', 'Sodium'],
    shortSummary: 'Mathematical carbohydrate, water, and electrolyte needs'
  },
  {
    id: 'environment-lab',
    name: 'Environment Lab',
    label: 'Environment Lab',
    href: '/environment',
    category: 'Fuel & Environment',
    description: 'Analyze Heat Index, Altitudinal VO2 reduction, air quality effects, and pacing offsets.',
    status: 'implemented',
    icon: CloudFog,
    tags: ['Heat', 'Altitude', 'Weather'],
    shortSummary: 'Environmental correction factors and heat stress indexes'
  },
  {
    id: 'trail-elevation',
    name: 'Trail & Elevation Lab',
    label: 'Trail & Elevation Lab',
    href: '/trail-elevation',
    category: 'Practical Tools',
    description: 'Calculate vertical ascent speed (VAM), grade percentage, and flat-equivalent distances.',
    status: 'implemented',
    icon: Footprints,
    tags: ['Elevation', 'Grade', 'Climbing'],
    shortSummary: 'Climbing speed, incline grades, and trail coefficients'
  },
  {
    id: 'treadmill-lab',
    name: 'Treadmill Lab',
    label: 'Treadmill Lab',
    href: '/treadmill',
    category: 'Mechanics & Gear',
    description: 'Convert speed, incline, ACSM VO2 equivalents, and calibration metrics.',
    status: 'implemented',
    icon: Footprints,
    tags: ['Incline', 'Treadmill', 'Speed'],
    shortSummary: 'Indoor conveyor belt speed, slope, and oxygen costs'
  },
  {
    id: 'track-lab',
    name: 'Track Lab',
    label: 'Track Lab',
    href: '/track',
    category: 'Mechanics & Gear',
    description: 'Calculate track lap durations (400m, 200m) for complex speed workouts.',
    status: 'implemented',
    icon: Footprints,
    tags: ['Laps', 'Track', 'Speedwork'],
    shortSummary: 'Standard track segment split timers and target intervals'
  },
  {
    id: 'biomechanics-lab',
    name: 'Biomechanics Lab',
    label: 'Biomechanics Lab',
    href: '/biomechanics',
    category: 'Mechanics & Gear',
    description: 'Calculate cadence, step totals, stride length, and velocity balances.',
    status: 'implemented',
    icon: Footprints,
    tags: ['Cadence', 'Stride', 'Ground Time'],
    shortSummary: 'Kinematic step, speed, and stride length calculators'
  },
  {
    id: 'power-lab',
    name: 'Power Lab',
    label: 'Power Lab',
    href: '/power',
    category: 'Intensity',
    description: 'Analyze running power metrics, watts/kg ratio, critical power limits, and metabolic values.',
    status: 'implemented',
    icon: Zap,
    tags: ['Power', 'Watts', 'Efficiency'],
    shortSummary: 'Work-rate metrics and metabolic running power'
  },
  {
    id: 'recovery-lab',
    name: 'Recovery Check Lab',
    label: 'Recovery Check Lab',
    href: '/recovery',
    category: 'Workout & Load',
    description: 'Inspect sleep quality, wake schedules, baseline cardiovascular Indices, and physical balance metrics.',
    status: 'implemented',
    icon: HeartPulse,
    tags: ['RHR', 'HRV', 'Rest'],
    shortSummary: 'Manual recovery check panel and cardiovascular offsets'
  },
  {
    id: 'gear-lab',
    name: 'Gear Lab',
    label: 'Gear Lab',
    href: '/gear',
    category: 'Mechanics & Gear',
    description: 'Estimate running shoe wear rates, distance limits, and amortized gear costs.',
    status: 'implemented',
    icon: ClipboardList,
    tags: ['Shoes', 'Mileage', 'Budget'],
    shortSummary: 'Equipment wear and tear amortization logs'
  },
  {
    id: 'race-day',
    name: 'Race Day Lab',
    label: 'Race Day Lab',
    href: '/race-day',
    category: 'Pace & Race',
    description: 'Construct custom race-day timelines, warming offsets, packing checklists, and post-race notes.',
    status: 'implemented',
    icon: Timer,
    tags: ['Timeline', 'Checklist', 'Logistics'],
    shortSummary: 'Strategic preparation event-scheduler and checks'
  },
  {
    id: 'conversion-lab',
    name: 'Conversion Lab',
    label: 'Conversion Lab',
    href: '/conversion',
    category: 'Practical Tools',
    description: 'Convert distance, speed, weight, volume, pace, and heat units.',
    status: 'implemented',
    icon: ArrowLeftRight,
    tags: ['Imperial', 'Metric', 'Units'],
    shortSummary: 'Scientific running unit converter utility'
  },
  {
    id: 'calendar-lab',
    name: 'Calendar Lab',
    label: 'Calendar Lab',
    href: '/calendar',
    category: 'Workout & Load',
    description: 'Plan weekly training load progressions, Rest days, hard-day checkers, and tapering scales.',
    status: 'implemented',
    icon: Calendar,
    tags: ['Calendar', 'Schedule', 'Microcycle'],
    shortSummary: 'Weekly volume structure and spacing check simulator'
  },
  {
    id: 'formulas',
    name: 'Formula Library',
    label: 'Formula Library',
    href: '/formulas',
    category: 'Reference',
    description: 'Inspect mathematical equations, constraints, and statistical labels of all modules.',
    status: 'implemented',
    icon: Sigma,
    tags: ['Equations', 'Science', 'Logic Name'],
    shortSummary: 'Central public method registry index'
  }
];

export function validateNavigationRoutes() {
  const hrefs = LAB_ROUTES.map(r => r.href);
  const duplicates = hrefs.filter((item, index) => hrefs.indexOf(item) !== index);
  return {
    isValid: duplicates.length === 0,
    duplicates
  };
}

export function validateNavigationUniqueness() {
  const ids = LAB_ROUTES.map(r => r.id);
  const duplicates = ids.filter((item, index) => ids.indexOf(item) !== index);
  return {
    isValid: duplicates.length === 0,
    duplicates
  };
}

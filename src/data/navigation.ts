import { 
  Zap, Timer, HeartPulse, Medal,
  Gauge, Beaker, ClipboardList, BookOpen, Weight, 
  Droplet, CloudFog, Footprints, 
  Sigma
} from 'lucide-react';

export const LAB_ROUTES = [
  { name: 'Quick Lab', href: '/', icon: Zap },
  { name: 'Pace Lab', href: '/pace', icon: Timer },
  { name: 'Heart Rate Lab', href: '/heart-rate', icon: HeartPulse },
  { name: 'Race Lab', href: '/race', icon: Medal },
  { name: 'Critical Speed Lab', href: '/critical-speed', icon: Gauge },
  { name: 'VO2 & Metabolic Lab', href: '/vo2', icon: Beaker },
  { name: 'Workout Lab', href: '/workout', icon: ClipboardList },
  { name: 'Workout Library', href: '/workout-library', icon: BookOpen },
  { name: 'Load Lab', href: '/load', icon: Weight },
  { name: 'Fuel & Hydration Lab', href: '/fuel', icon: Droplet },
  { name: 'Environment Lab', href: '/environment', icon: CloudFog },
  { name: 'Biomechanics Lab', href: '/biomechanics', icon: Footprints },
  { name: 'Formula Library', href: '/formulas', icon: Sigma },
];

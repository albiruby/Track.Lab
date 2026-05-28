import { 
  Zap, Timer, HeartPulse, Activity, Medal, Target, 
  Gauge, Beaker, ClipboardList, BookOpen, Weight, 
  Droplet, CloudFog, Mountain, RotateCw, Footprints, 
  Battery, Heart, Shirt, Sigma
} from 'lucide-react';

export const LAB_ROUTES = [
  { name: 'Quick Lab', href: '/', icon: Zap },
  { name: 'Pace Lab', href: '/pace', icon: Timer },
  { name: 'Heart Rate Lab', href: '/heart-rate', icon: HeartPulse },
  { name: 'Zone Lab', href: '/zone', icon: Activity },
  { name: 'Race Lab', href: '/race', icon: Medal },
  { name: 'Training Pace Lab', href: '/training-pace', icon: Target },
  { name: 'Critical Speed Lab', href: '/critical-speed', icon: Gauge },
  { name: 'VO2 & Metabolic Lab', href: '/vo2', icon: Beaker },
  { name: 'Workout Lab', href: '/workout', icon: ClipboardList },
  { name: 'Workout Library', href: '/workout-library', icon: BookOpen },
  { name: 'Load Lab', href: '/load', icon: Weight },
  { name: 'Fuel & Hydration Lab', href: '/fuel', icon: Droplet },
  { name: 'Environment Lab', href: '/environment', icon: CloudFog },
  { name: 'Trail & Elevation Lab', href: '/elevation', icon: Mountain },
  { name: 'Treadmill Lab', href: '/treadmill', icon: RotateCw },
  { name: 'Biomechanics Lab', href: '/biomechanics', icon: Footprints },
  { name: 'Power Lab', href: '/power', icon: Battery },
  { name: 'Recovery Check Lab', href: '/recovery', icon: Heart },
  { name: 'Gear Lab', href: '/gear', icon: Shirt },
  { name: 'Formula Library', href: '/formulas', icon: Sigma },
];

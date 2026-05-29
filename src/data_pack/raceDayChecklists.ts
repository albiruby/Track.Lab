// Race Day templates, checklist components, and logistics constants.

export interface KitItemTemplate {
  id: string;
  name: string;
  category: "apparel" | "electronics" | "nutrition" | "safety" | "weather_specific";
  weatherTags: string[];
  raceTypes: string[];
}

export const raceKitItemTemplates: KitItemTemplate[] = [
  { id: "singlet", name: "Primary racing singlet / top", category: "apparel", weatherTags: ["all", "hot", "cold", "rainy"], raceTypes: ["road", "track", "trail"] },
  { id: "shorts", name: "Racing shorts or compression tights", category: "apparel", weatherTags: ["all", "hot", "cold", "rainy"], raceTypes: ["road", "track", "trail"] },
  { id: "shoes", name: "Fitted carbon-plated or trail race shoes", category: "apparel", weatherTags: ["all", "hot", "cold", "rainy"], raceTypes: ["road", "track", "trail"] },
  { id: "socks", name: "Blister-free synthetic athletic socks", category: "apparel", weatherTags: ["all", "hot", "cold", "rainy"], raceTypes: ["road", "track", "trail"] },
  { id: "bib", name: "Timing chip and bib (with pins/toggle belt)", category: "safety", weatherTags: ["all", "hot", "cold", "rainy"], raceTypes: ["road", "track", "trail"] },
  { id: "watch", name: "GPS watch (100% battery, cold offset)", category: "electronics", weatherTags: ["all", "hot", "cold", "rainy"], raceTypes: ["road", "track", "trail"] },
  { id: "lubricant", name: "Anti-chafing balm / skin lubricant", category: "safety", weatherTags: ["all", "hot", "cold", "rainy"], raceTypes: ["road", "track", "trail"] },
  { id: "gels", name: "Energy gel inventory + race packing pouch/belt", category: "nutrition", weatherTags: ["all", "hot", "cold", "rainy"], raceTypes: ["road", "track", "trail"] },
  
  // Weather-specific
  { id: "cap", name: "Sun-blocking running cap or visor", category: "weather_specific", weatherTags: ["hot", "rainy"], raceTypes: ["road", "trail"] },
  { id: "sunglasses", name: "UV protection athletic sunglasses", category: "weather_specific", weatherTags: ["hot"], raceTypes: ["road", "trail"] },
  { id: "water_flask", name: "Extra hand-held hydration flask / soft bottle", category: "weather_specific", weatherTags: ["hot"], raceTypes: ["road", "trail"] },
  { id: "electrolytes", name: "Electrolyte capsule / tablet supply", category: "weather_specific", weatherTags: ["hot"], raceTypes: ["road", "trail"] },
  { id: "sunscreen", name: "Broad-spectrum waterproof SPF 50 sunscreen", category: "weather_specific", weatherTags: ["hot"], raceTypes: ["road", "track", "trail"] },
  
  { id: "arm_sleeves", name: "Sleeves or thermal arm warming gear", category: "weather_specific", weatherTags: ["cold"], raceTypes: ["road", "track", "trail"] },
  { id: "gloves", name: "Lightweight running gloves", category: "weather_specific", weatherTags: ["cold"], raceTypes: ["road", "track", "trail"] },
  { id: "ear_warmer", name: "Thermal headband or ear cover", category: "weather_specific", weatherTags: ["cold"], raceTypes: ["road", "trail"] },
  { id: "throwaways", name: "Discardable old sweater for warm-up corral holding", category: "weather_specific", weatherTags: ["cold"], raceTypes: ["road", "trail"] },
  
  { id: "zip_lock", name: "Waterproof resealable bags (for race cards/pacing)", category: "weather_specific", weatherTags: ["rainy"], raceTypes: ["road", "trail"] },
  { id: "dry_layer", name: "Full set of warm, dry clothes to leave in gear drop bag", category: "weather_specific", weatherTags: ["rainy", "cold"], raceTypes: ["road", "track", "trail"] },
  
  // Trail-specific
  { id: "trail_shoes", name: "Lugged high-grip dedicated trail running shoes", category: "weather_specific", weatherTags: ["all", "hot", "cold", "rainy"], raceTypes: ["trail"] },
  { id: "whistle", name: "Emergency whistle (race mandated checklist)", category: "safety", weatherTags: ["all"], raceTypes: ["trail"] },
  { id: "collapsible_cup", name: "Reusable collapsible silicone cup for hydration fluids", category: "nutrition", weatherTags: ["all"], raceTypes: ["trail"] },
  { id: "vest", name: "Multi-pocket trail vest with bladder or flasks (500mL+ capacity)", category: "apparel", weatherTags: ["all"], raceTypes: ["trail"] }
];

export const raceDayMethodDefinitions = [
  {
    id: "pre_race_timeline",
    category: "race_day",
    name: "Pre-Race Timing Logistics",
    formulaDisplay: "Event Time = Start Time - Offset",
    requiredInputs: ["raceStartTime", "wakeOffset", "mealOffset", "hydrationOffset", "warmupOffset"],
    precision: "mathematical",
    limitations: ["Rely on user-provided offsets. Zero buffer factored automatically."]
  },
  {
    id: "checkpoint_fueling_timeline",
    category: "race_day",
    name: "Fueling and Hydration Checkpoints",
    formulaDisplay: "Time Markers = k × Interval for k=1,2,... inside race duration",
    requiredInputs: ["raceDurationMinutes", "gelInterval", "fluidInterval", "sodiumInterval"],
    precision: "mathematical",
    limitations: ["Assumes exact interval consumption. Does not factor stomach distress."]
  },
  {
    id: "abc_goals_generator",
    category: "race_day",
    name: "ABC Race Goals Planner",
    formulaDisplay: "A = B × (1 - Aggressive%), B = Target, C = B × (1 + Conservative%)",
    requiredInputs: ["baseTargetSeconds", "distanceKm", "aggressivePct", "conservativePct"],
    precision: "mathematical",
    limitations: ["Broad time percentages. Does not model specific fatigue or altitude curves."]
  },
  {
    id: "race_splits_builder",
    category: "race_day",
    name: "Race Splits Segment Builder",
    formulaDisplay: "Split Time = Segment Distance × Average Target Pace",
    requiredInputs: ["distanceKm", "targetTimeSeconds", "segmentKm"],
    precision: "mathematical",
    limitations: ["Applies average pace evenly. No elevation or fatigue pacing modeled."]
  }
];

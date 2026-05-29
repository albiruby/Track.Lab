// Recovery Check data lists and scale descriptors.
// Track.Lab manual mechanical metrics.

export interface ScaleDescriptor {
  score: number;
  label: string;
  description: string;
}

export const fatigueScale: ScaleDescriptor[] = [
  { score: 1, label: "Deeply Rested", description: "Fully charged, high muscle bounce, eager to train." },
  { score: 2, label: "Rested", description: "Standard fresh state, no heavy physical fatigue." },
  { score: 3, label: "Normal Balance", description: "Baseline light fatigue from everyday life and light schedules." },
  { score: 4, label: "Slightly Tired", description: "Cumulative training load starting to make limbs feel heavy." },
  { score: 5, label: "Moderate Fatigue", description: "Underlying muscular lethargy, requiring longer warm-up." },
  { score: 6, label: "Heavy Fatigue", description: "Substantial physical tired state, low mechanical bounce." },
  { score: 7, label: "Intense Strain", description: "Clear mechanical lag, elevated heart rate in simple activities." },
  { score: 8, label: "Muted Response", description: "Cardiovascular and nervous response indicators are noticeably suppressed." },
  { score: 9, label: "Borderline Overload", description: "Strong signals of systemic stress. High caution." },
  { score: 10, label: "Severe Exhaustion", description: "Profond physical depletion. Complete passive rest required." }
];

export const sorenessScale: ScaleDescriptor[] = [
  { score: 1, label: "Pristine", description: "Zero mechanical tightness, joints are fully lubricated and ready." },
  { score: 2, label: "Fresh", description: "Trace awareness of previous work but completely loose." },
  { score: 3, label: "Light Tension", description: "Normal mild tension in target muscles, dissipates on movement." },
  { score: 4, label: "Mild Soreness", description: "Noticeable muscular feedback when compressed or stretched." },
  { score: 5, label: "Moderate Soreness", description: "Clear muscle soreness across primary muscle groups." },
  { score: 6, label: "Substantial Soreness", description: "Stiffness affects gait symmetry during first few steps." },
  { score: 7, label: "Heavy Soreness", description: "Pronounced local tightness. Range of motion is mildly restricted." },
  { score: 8, label: "Extreme Tightness", description: "Muscular pain restricts joint angles. High injury hazard warning." },
  { score: 9, label: "Functional Cast", description: "Limb is structurally guarded from full extension due to pain." },
  { score: 10, label: "Severe Soreness / Pain", description: "Acute distress. Do not attempt training." }
];

export const recoveryRuleDefinitions = [
  {
    id: "sleep_debt_analysis",
    category: "recovery",
    name: "Sleep Debt Analysis",
    formulaDisplay: "Debt = Target Hours - Actual Hours",
    requiredInputs: ["targetHours", "actualHours"],
    precision: "quantitative",
    limitations: ["Self-reported actual sleep timing only."]
  },
  {
    id: "physical_self_status",
    category: "recovery",
    name: "Physical Self-Status Check",
    formulaDisplay: "Deterministic scale lookups for Fatigue and Soreness",
    requiredInputs: ["fatigueScore", "sorenessScore"],
    precision: "qualitative",
    limitations: ["Rely on subjective user ratings (1-10 dials)."]
  },
  {
    id: "readiness_red_flags",
    category: "recovery",
    name: "Safety Rule Red Flags",
    formulaDisplay: "Logical OR of crucial warning symptoms",
    requiredInputs: ["illness", "pain", "dizziness", "chestSymptoms", "abnormalDiscomfort"],
    precision: "qualitative",
    limitations: ["Requires honest user disclosure of active symptoms."]
  },
  {
    id: "load_recovery_balance",
    category: "recovery",
    name: "Load-Recovery Balance",
    formulaDisplay: "Condition-based lookup mapping recovery status to training density guidelines",
    requiredInputs: ["previousLoad", "recoveryCategory"],
    precision: "qualitative",
    limitations: ["Guideline suggestions only, does not replace professional guidance."]
  }
];

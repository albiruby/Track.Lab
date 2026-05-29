import workoutTemplatesJson from "../data_json/workoutTemplates.json";
import fieldTestProtocolsJson from "../data_json/fieldTestProtocols.json";
import formulaMethodRegistryJson from "../data_json/formulaMethodRegistry.json";

// Types
export interface InputFieldDefinition {
  key: string;
  label: string;
  unit?: string;
  validation?: string;
  default?: number | string;
}

export interface TrackLabFieldTestProtocol {
  id: string;
  name: string;
  purpose: string;
  testType: string;
  bestUsedFor: string[];
  notIdealFor: string[];
  requiredInputs: InputFieldDefinition[];
  optionalInputs: InputFieldDefinition[];
  protocolSteps: string[];
  warmupSuggestion: string;
  testExecution: string;
  outputCalculations: string[];
  formulaHooks: string[];
  safetyNotes: string[];
  confidenceLabel: string;
  limitation: string;
  relatedModules: string[];
  
  // Legacy fields for backward compatibility if needed
  category: string;
  durationText: string;
  intensityLabel: string;
  instructions: string[];
  equipmentNeeded: string[];
  safetyNote: string;
}

export interface TrackLabWorkoutTemplate {
  id: string;
  name: string;
  category: string;
  workoutType: string;
  level: string;
  raceDistanceTags: string[];
  surface: string[];
  purpose: string;
  bestUsedFor: string;
  notIdealFor: string;
  requiredUserInputs: string[];
  optionalUserInputs: string[];
  warmup: string;
  mainSet: any; // String in raw, but mapped to structural object for backward compatibility
  rawMainSetString: string; // Keeps the original string
  recovery: string;
  cooldown: string;
  durationRangeMinutes: [number, number];
  distanceRangeKm: [number, number];
  intensityTarget: string;
  formulaHooks: string[];
  safetyFlags: string[];
  limitation: string;
  confidenceLabel: string;
  rawConfidenceLabel: string; // Normalization: high -> display as Manual or Qualitative, preserving raw
  relatedModules: string[];
  
  // Backward compatibility fields
  difficulty: "easy" | "moderate" | "hard" | string;
  scenario: string;
  format: string;
  goalDistances: string[];
}

export interface TrackLabFormulaMethod {
  id: string;
  name: string;
  category: string;
  route: string;
  formulaDisplay: string;
  requiredInputs: string[];
  optionalInputs: string[];
  outputUnits: string[];
  confidenceLabel: string; // display normalized
  rawConfidenceLabel: string; // raw
  limitation: string;
  sourceNote: string;
  implementationStatus: string;
  relatedModules: string[];
  
  // Legacy / existing compatibility
  precision: string;
  limitations: string[];
}

// 1. Adapter for Workout Templates
export function getAdaptedWorkoutTemplates(): TrackLabWorkoutTemplate[] {
  const rawWorkouts = (workoutTemplatesJson as any).workouts || [];
  
  return rawWorkouts.map((w: any) => {
    // Normalization of confidence labels
    // high -> Manual or Qualitative, raw -> high
    let confidenceDisp = "Qualitative / Manual";
    if (w.confidenceLabel === "high") {
       confidenceDisp = "Manual Structure Profile";
    } else if (w.confidenceLabel === "moderate") {
       confidenceDisp = "Empirical Estimate";
    } else if (w.confidenceLabel === "low") {
       confidenceDisp = "Speculative Model";
    }
    
    // Duration and distance ranges average estimation
    const durMin = w.durationRangeMinutes ? (w.durationRangeMinutes[0] + w.durationRangeMinutes[1]) / 2 : 30;
    const distKm = w.distanceRangeKm ? (w.distanceRangeKm[0] + w.distanceRangeKm[1]) / 2 : 5;
    
    // MainSet mapping: continuous/interval checks to support old calculateWorkout
    const isInterval = w.workoutType === "intervals" || w.workoutType === "repeats" || 
                       w.name.toLowerCase().includes("interval") || w.name.toLowerCase().includes("rep");
    
    const structMainSet = {
      type: isInterval ? "time_reps" : "continuous",
      durationMinutes: durMin,
      distanceMeters: distKm * 1000,
      intensity: w.intensityTarget || "easy",
      reps: isInterval ? 6 : 1,
      rest: {
        durationSeconds: 120,
        rule: "between reps"
      }
    };
    
    return {
      id: w.id,
      name: w.name,
      category: w.category,
      workoutType: w.workoutType,
      level: w.level,
      raceDistanceTags: w.raceDistanceTags || [],
      surface: w.surface || [],
      purpose: w.purpose || "Static template protocol for running forms.",
      bestUsedFor: w.bestUsedFor || "",
      notIdealFor: w.notIdealFor || "",
      requiredUserInputs: w.requiredUserInputs || [],
      optionalUserInputs: w.optionalUserInputs || [],
      warmup: w.warmup || "3-8 min jog",
      mainSet: structMainSet,
      rawMainSetString: w.mainSet || "",
      recovery: w.recovery || "",
      cooldown: w.cooldown || "3-8 min walk",
      durationRangeMinutes: w.durationRangeMinutes || [15, 45],
      distanceRangeKm: w.distanceRangeKm || [2, 8],
      intensityTarget: w.intensityTarget || "",
      formulaHooks: w.formulaHooks || [],
      safetyFlags: w.safetyFlags || [],
      limitation: w.limitation || "Static structure target.",
      confidenceLabel: confidenceDisp,
      rawConfidenceLabel: w.confidenceLabel || "high",
      relatedModules: w.relatedModules || [],
      
      formulaNotes: [
        w.purpose || "",
        w.mainSet || "",
        w.category || "",
        w.intensityTarget || "",
        w.limitation || "",
        ...(w.formulaHooks || [])
      ],
      difficulty: w.level === "beginner" ? "easy" : w.level === "advanced" ? "hard" : "moderate",
      scenario: (w.category || "").toLowerCase().replace(/\s+/g, "_"),
      format: w.workoutType === "continuous" ? "time" : "intervals",
      goalDistances: (w.raceDistanceTags || []).map((t: string) => t.toLowerCase())
    };
  });
}

// 2. Adapter for Field Test Protocols
export function getAdaptedFieldTestProtocols(): TrackLabFieldTestProtocol[] {
  const rawProtocols = (fieldTestProtocolsJson as any).protocols || [];
  
  return rawProtocols.map((p: any) => {
    // Normalization: moderate -> Field-Test Estimate, raw -> moderate
    let confidenceDisp = p.confidenceLabel || "Field-Test Estimate";
    if (p.confidenceLabel === "moderate") {
      confidenceDisp = "Field Test Estimate";
    } else if (p.confidenceLabel === "high") {
      confidenceDisp = "Direct Metric Audit";
    }
    
    return {
      id: p.id,
      name: p.name,
      purpose: p.purpose || "",
      testType: p.testType || "",
      bestUsedFor: p.bestUsedFor || [],
      notIdealFor: p.notIdealFor || [],
      requiredInputs: p.requiredInputs || [],
      optionalInputs: p.optionalInputs || [],
      protocolSteps: p.protocolSteps || [],
      warmupSuggestion: p.warmupSuggestion || "",
      testExecution: p.testExecution || "",
      outputCalculations: p.outputCalculations || [],
      formulaHooks: p.formulaHooks || [],
      safetyNotes: p.safetyNotes || [],
      confidenceLabel: confidenceDisp,
      limitation: p.limitation || "",
      relatedModules: p.relatedModules || [],
      
      // Legacy compatibility
      category: p.testType ? p.testType.replace(/_+/g, " ").toUpperCase() : "FIELD TEST",
      durationText: p.testExecution || "Execution protocol",
      intensityLabel: "Self-regulated stress boundaries.",
      instructions: p.protocolSteps || [],
      equipmentNeeded: ["Accurate timekeeping or GPS sensor."],
      safetyNote: (p.safetyNotes || []).join(" ") || "Practice self-protective safety caps."
    };
  });
}

// Helper to sanitize name for deduplication
function getNormalizeNameKey(n: string): string {
  return n.toLowerCase()
    .replace(/\+/g, "and")
    .replace(/&/g, "and")
    .replace(/vs/g, "and")
    .replace(/[^a-z0-0]/g, "")
    .trim();
}

// 3. Adapter for Formula Method Registry
export function getAdaptedMethodRegistry(existingRegistry: any[]): TrackLabFormulaMethod[] {
  const rawMethods = (formulaMethodRegistryJson as any).methods || [];
  
  // Map clean existing methods
  const cleanExistingMap = new Map<string, any>();
  existingRegistry.forEach((m: any) => {
    const key = getNormalizeNameKey(m.name);
    cleanExistingMap.set(key, m);
  });
  
  const merged: TrackLabFormulaMethod[] = [];
  const processedExistingKeys = new Set<string>();
  
  rawMethods.forEach((m: any) => {
    const jsonKey = getNormalizeNameKey(m.methodName);
    const existing = cleanExistingMap.get(jsonKey);
    
    // Normalization of confidence labels
    // Formula -> Exact for conversions, Estimate for predictions
    let confidenceDisp = "Estimate";
    if (m.confidenceLabel === "Formula") {
       const isPaceSpeedDirect = m.category?.toLowerCase().includes("pace") || m.category?.toLowerCase().includes("speed") || m.category?.toLowerCase().includes("conversion");
       confidenceDisp = isPaceSpeedDirect ? "Exact" : "Estimate";
    } else {
       confidenceDisp = m.confidenceLabel || "Estimate";
    }
    
    // Status mapping: preserve implemented from our explicit implementedIds if matching existing
    let isImplemented = "planned";
    
    if (existing) {
      processedExistingKeys.add(jsonKey);
      isImplemented = "implemented"; // since existing registry items are mostly implemented or clearly tagged
    }
    
    const mapped: TrackLabFormulaMethod = {
      id: existing ? existing.id : m.methodId,
      name: existing ? existing.name : m.methodName,
      category: m.category || (existing ? existing.category : "General"),
      route: m.route || (existing && existing.route ? existing.route : "/pace"),
      formulaDisplay: m.formulaDisplay || (existing ? existing.formulaDisplay : ""),
      requiredInputs: m.requiredInputs || (existing ? existing.requiredInputs : []),
      optionalInputs: m.optionalInputs || [],
      outputUnits: m.outputUnits || [],
      confidenceLabel: confidenceDisp,
      rawConfidenceLabel: m.confidenceLabel || "Formula",
      limitation: m.limitation || (existing && existing.limitations ? existing.limitations.join(" ") : ""),
      sourceNote: m.sourceNote || "",
      implementationStatus: isImplemented,
      relatedModules: m.relatedModules || [],
      
      // Compatibility to fit existing codebase queries
      precision: existing ? existing.precision : (m.confidenceLabel === "Formula" ? "mathematical" : "estimate"),
      limitations: m.limitation ? [m.limitation] : (existing ? existing.limitations || [] : [])
    };
    
    merged.push(mapped);
  });
  
  // Add all remaining existing elements that did not match any JSON entries
  existingRegistry.forEach((m: any) => {
    const key = getNormalizeNameKey(m.name);
    if (!processedExistingKeys.has(key)) {
       merged.push({
         id: m.id,
         name: m.name,
         category: m.category || "General",
         route: m.route || "/pace",
         formulaDisplay: m.formulaDisplay || "",
         requiredInputs: m.requiredInputs || [],
         optionalInputs: [],
         outputUnits: [],
         confidenceLabel: m.precision === "mathematical" ? "Exact" : "Estimate",
         rawConfidenceLabel: "Formula",
         limitation: m.limitations ? m.limitations.join(" ") : "",
         sourceNote: "Legacy registered arithmetic rule.",
         implementationStatus: "implemented",
         relatedModules: [],
         precision: m.precision || "estimate",
         limitations: m.limitations || []
       });
    }
  });
  
  return merged;
}

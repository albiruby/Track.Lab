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
export function getNormalizeNameKey(n: string): string {
  return (n || "").toLowerCase()
    .replace(/\+/g, "and")
    .replace(/&/g, "and")
    .replace(/vs/g, "and")
    .replace(/[^a-z0-0]/g, "")
    .trim();
}

// 3. Adapter for Formula Method Registry
export function getRouteSpecificId(id: string, category: string, route: string, name: string): string {
  const finalId = id || "";
  if (finalId === "intensity_distribution") {
    const catLower = (category || "").toLowerCase();
    const routeLower = (route || "").toLowerCase();
    const nameLower = (name || "").toLowerCase();
    if (catLower.includes("zone") || routeLower.includes("zone") || nameLower.includes("80/20") || nameLower.includes("polarized") || nameLower.includes("pyramidal")) {
      return "intensity_distribution__zone";
    }
    if (catLower.includes("calendar") || routeLower.includes("calendar")) {
      return "intensity_distribution__calendar";
    }
    return "intensity_distribution__load";
  }
  if (finalId === "long_run_ratio") {
    const catLower = (category || "").toLowerCase();
    const routeLower = (route || "").toLowerCase();
    if (catLower.includes("calendar") || routeLower.includes("calendar")) {
      return "long_run_ratio__calendar";
    }
    return "long_run_ratio__load";
  }
  return finalId;
}

export function getAdaptedMethodRegistry(existingRegistry: any[]): TrackLabFormulaMethod[] {
  const rawMethods = (formulaMethodRegistryJson as any).methods || [];
  const uniqueMap = new Map<string, TrackLabFormulaMethod>();

  // Helper to normalize any incoming item into standard TrackLabFormulaMethod
  function normalizeToMethod(m: any, isFromTypeScript: boolean): TrackLabFormulaMethod {
    const rawId = m.id || m.methodId || "";
    const rawName = m.name || m.methodName || "";
    const rawCategory = m.category || "General";
    const rawRoute = m.route || "/pace";
    
    // Resolve route-specific IDs for known duplicate fields
    const id = getRouteSpecificId(rawId, rawCategory, rawRoute, rawName);
    
    const formulaDisplay = m.formulaDisplay || "";
    const requiredInputs = m.requiredInputs || [];
    const optionalInputs = m.optionalInputs || [];
    const outputUnits = m.outputUnits || [];
    const sourceNote = m.sourceNote || "";
    
    // Limitation string merging
    let limitationStr = m.limitation || "";
    if (!limitationStr && m.limitations && m.limitations.length > 0) {
      limitationStr = m.limitations.join(" ");
    }
    const limitations = m.limitations || (m.limitation ? [m.limitation] : []);

    // Normalization of confidence labels
    let confidenceDisp = m.confidenceLabel || "Estimate";
    if (confidenceDisp === "Formula") {
      const isPaceSpeedDirect = rawCategory.toLowerCase().includes("pace") || rawCategory.toLowerCase().includes("speed") || rawCategory.toLowerCase().includes("conversion");
      confidenceDisp = isPaceSpeedDirect ? "Exact" : "Estimate";
    } else if (confidenceDisp === "moderate") {
      confidenceDisp = "Field Test Estimate";
    } else if (confidenceDisp === "high") {
      confidenceDisp = "Direct Metric Audit";
    }

    // Status mapping: default is planned, but existing ts methods are implemented
    let implementationStatus = m.implementationStatus || "planned";
    if (isFromTypeScript) {
      implementationStatus = "implemented";
    } else if (implementationStatus === "readyForImplementation") {
      implementationStatus = "ready";
    }

    return {
      id,
      name: rawName,
      category: rawCategory,
      route: rawRoute,
      formulaDisplay,
      requiredInputs: [...requiredInputs],
      optionalInputs: [...optionalInputs],
      outputUnits: [...outputUnits],
      confidenceLabel: confidenceDisp,
      rawConfidenceLabel: m.confidenceLabel || "Formula",
      limitation: limitationStr,
      sourceNote,
      implementationStatus,
      relatedModules: m.relatedModules ? [...m.relatedModules] : [],
      precision: m.precision || (m.confidenceLabel === "Formula" ? "mathematical" : "estimate"),
      limitations: [...limitations]
    };
  }

  // 1. Process TypeScript methods
  existingRegistry.forEach((m: any) => {
    if (!m) return;
    const norm = normalizeToMethod(m, true);
    if (uniqueMap.has(norm.id)) {
      const existing = uniqueMap.get(norm.id)!;
      uniqueMap.set(norm.id, mergeTwoMethods(existing, norm));
    } else {
      uniqueMap.set(norm.id, norm);
    }
  });

  // 2. Process JSON methods
  rawMethods.forEach((m: any) => {
    if (!m) return;
    // Map JSON methods, which are not from TS but have rich metadata
    const norm = normalizeToMethod(m, false);
    
    // We can match by name key as well, but matching by ID is most robust
    if (uniqueMap.has(norm.id)) {
      const existing = uniqueMap.get(norm.id)!;
      uniqueMap.set(norm.id, mergeTwoMethods(existing, norm));
    } else {
      // Find by normalized name to see if we can pair
      const matchedByName = Array.from(uniqueMap.values()).find(
        (existing) => getNormalizeNameKey(existing.name) === getNormalizeNameKey(norm.name)
      );
      if (matchedByName) {
        uniqueMap.set(matchedByName.id, mergeTwoMethods(matchedByName, norm));
      } else {
        uniqueMap.set(norm.id, norm);
      }
    }
  });

  function mergeTwoMethods(a: TrackLabFormulaMethod, b: TrackLabFormulaMethod): TrackLabFormulaMethod {
    const aImp = a.implementationStatus === "implemented";
    const bImp = b.implementationStatus === "implemented";
    
    const primary = (aImp && !bImp) ? a : ((bImp && !aImp) ? b : a);
    const secondary = primary === a ? b : a;
    
    const relatedModules = Array.from(new Set([...(primary.relatedModules || []), ...(secondary.relatedModules || [])]));
    const requiredInputs = Array.from(new Set([...(primary.requiredInputs || []), ...(secondary.requiredInputs || [])]));
    const optionalInputs = Array.from(new Set([...(primary.optionalInputs || []), ...(secondary.optionalInputs || [])]));
    const outputUnits = Array.from(new Set([...(primary.outputUnits || []), ...(secondary.outputUnits || [])]));
    
    const mergedLimitations = Array.from(new Set([...(primary.limitations || []), ...(secondary.limitations || [])]));
    const limitation = mergedLimitations.join(" ");

    let finalRoute = primary.route || secondary.route || "/pace";
    let finalCategory = primary.category || secondary.category || "General";
    
    // Conversions normalization
    if (["min_km_to_min_mile", "min_mile_to_min_km", "kmh_to_mph", "mph_to_kmh"].includes(primary.id)) {
      finalRoute = "/conversion";
      finalCategory = "Conversion";
      if (!relatedModules.includes("/conversion")) relatedModules.push("/conversion");
      if (!relatedModules.includes("/pace")) relatedModules.push("/pace");
      if (!relatedModules.includes("/treadmill")) relatedModules.push("/treadmill");
    }

    return {
      id: primary.id,
      name: primary.name || secondary.name,
      category: finalCategory,
      route: finalRoute,
      formulaDisplay: primary.formulaDisplay || secondary.formulaDisplay,
      requiredInputs,
      optionalInputs,
      outputUnits,
      confidenceLabel: primary.confidenceLabel || secondary.confidenceLabel || "Estimate",
      rawConfidenceLabel: primary.rawConfidenceLabel || secondary.rawConfidenceLabel || "Formula",
      limitation,
      sourceNote: primary.sourceNote || secondary.sourceNote,
      implementationStatus: (aImp || bImp) ? "implemented" : (primary.implementationStatus === "ready" || secondary.implementationStatus === "ready" ? "ready" : primary.implementationStatus),
      relatedModules,
      precision: primary.precision || secondary.precision,
      limitations: mergedLimitations
    };
  }

  // 3. Final Validation check: verify ID uniqueness
  const finalRegistry = Array.from(uniqueMap.values());
  const checkedIds = new Set<string>();
  finalRegistry.forEach(m => {
    if (checkedIds.has(m.id)) {
      console.warn(`[Track.Lab Unique Error] Found leftover duplicate ID during merge: ${m.id}`);
    }
    checkedIds.add(m.id);
  });

  return finalRegistry;
}

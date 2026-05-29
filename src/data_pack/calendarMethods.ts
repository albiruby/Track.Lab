export const calendarMethods = [
  {
    "id": "weekly_mileage_sum",
    "category": "calendar",
    "name": "Weekly Mileage Sum",
    "requiredInputs": ["dailyDistances"],
    "formulaDisplay": "Weekly Distance = Sum(dailyDistances)",
    "precision": "mathematical",
    "limitations": ["Reflects raw running volume. Cumulative biological stress depends on session paces, temperature, and shoes."],
    "confidenceLabel": "exact mathematical product",
    "implementationStatus": "implemented"
  },
  {
    "id": "weekly_duration_sum",
    "category": "calendar",
    "name": "Weekly Duration Sum",
    "requiredInputs": ["dailyDurations"],
    "formulaDisplay": "Weekly Duration = Sum(dailyDurations)",
    "precision": "mathematical",
    "limitations": ["Tracks time on feet. Does not capture strength sessions, sleep debt, or active daily step counts."],
    "confidenceLabel": "exact mathematical product",
    "implementationStatus": "implemented"
  },
  {
    "id": "long_run_ratio",
    "category": "calendar",
    "name": "Long Run Ratio",
    "requiredInputs": ["longRunDistance", "weeklyDistance"],
    "formulaDisplay": "Long Run Ratio = (Long Run / Weekly Distance) × 100",
    "precision": "mathematical",
    "limitations": ["General heuristic (ideal < 30-35%). Higher ratios can be safe in specialized ultra-marathon programs with low density."],
    "confidenceLabel": "heuristic proportion ratio",
    "implementationStatus": "implemented"
  },
  {
    "id": "hard_easy_spacing_checker",
    "category": "calendar",
    "name": "Hard/Easy Spacing Checker",
    "requiredInputs": ["days"],
    "formulaDisplay": "Heuristic validation checks: spacing, load density, consecutive hard sessions",
    "precision": "rule_based",
    "limitations": ["Applies general coaching recovery heuristics. Individual regeneration rates deviate by sleep, age, and genetics."],
    "confidenceLabel": "coaching logic rule-based engine",
    "implementationStatus": "implemented"
  },
  {
    "id": "intensity_distribution_preview",
    "category": "calendar",
    "name": "Intensity Distribution Preview",
    "requiredInputs": ["easyMinutes", "moderateMinutes", "hardMinutes"],
    "formulaDisplay": "Each Category % = Minutes / Total Minutes × 100",
    "precision": "mathematical",
    "limitations": ["Relies on plan intent. High heat or elevation can migrate intended easy minutes into high-intensity cardiac load."],
    "confidenceLabel": "structural distribution",
    "implementationStatus": "implemented"
  },
  {
    "id": "build_week_progression",
    "category": "calendar",
    "name": "Build Week Progression",
    "requiredInputs": ["previousWeek", "currentWeek"],
    "formulaDisplay": "Progression = (Current - Previous) / Previous × 100",
    "precision": "mathematical",
    "limitations": ["Heuristic comparison (often < 10%). Does not represent changes in training surface, vertical gain, or run-walk ratio."],
    "confidenceLabel": "acute load change",
    "implementationStatus": "implemented"
  },
  {
    "id": "deload_week_ratio",
    "category": "calendar",
    "name": "Deload Week Ratio",
    "requiredInputs": ["currentWeek", "previousWeek"],
    "formulaDisplay": "Deload % = (Previous - Current) / Previous × 100",
    "precision": "mathematical",
    "limitations": ["A mathematical reduction. Active regeneration also demands proportional reductions in intensity and sleep recovery."],
    "confidenceLabel": "acute rest index",
    "implementationStatus": "implemented"
  },
  {
    "id": "taper_reduction_ratio",
    "category": "calendar",
    "name": "Taper Reduction",
    "requiredInputs": ["peakWeek", "taperWeek"],
    "formulaDisplay": "Taper % = (Peak - Taper) / Peak × 100",
    "precision": "mathematical",
    "limitations": ["A quantitative volume guide. Symmetrical reductions in muscle tension must be balanced by intensity spacing to maintain fitness."],
    "confidenceLabel": "sharpening projection",
    "implementationStatus": "implemented"
  },
  {
    "id": "manual_weekly_planner_impact",
    "category": "calendar",
    "name": "Manual Weekly Planner Impact",
    "requiredInputs": ["dailyValues"],
    "formulaDisplay": "Direct summary metrics: Weekly volume, long ride ratio, hard efforts, rest days",
    "precision": "mathematical",
    "limitations": ["Static analysis of inputs only. Does not record metabolic history or physical adaptation fatigue profiles."],
    "confidenceLabel": "weekly session summary",
    "implementationStatus": "implemented"
  },
  {
    "id": "consecutive_hard_day_caution",
    "category": "calendar",
    "name": "Consecutive Hard Day Spacing Caution",
    "requiredInputs": ["days"],
    "formulaDisplay": "If Day(i) = hard AND Day(i+1) = hard THEN trigger caution",
    "precision": "rule_based",
    "limitations": ["Does not account for seasoned athletes executing specific block-periodization sets or double-threshold days."],
    "confidenceLabel": "coaching rule-based caution",
    "implementationStatus": "implemented"
  },
  {
    "id": "rest_day_count",
    "category": "calendar",
    "name": "Rest Day Count",
    "requiredInputs": ["days"],
    "formulaDisplay": "Count(days where intensity = rest)",
    "precision": "mathematical",
    "limitations": ["Registers rest on calendar. Active daily stress, hydration, and workplace physical demand alter true rest efficacy."],
    "confidenceLabel": "exact count",
    "implementationStatus": "implemented"
  },
  {
    "id": "hard_day_count",
    "category": "calendar",
    "name": "Hard Day Count",
    "requiredInputs": ["days"],
    "formulaDisplay": "Count(days where intensity = hard / threshold)",
    "precision": "mathematical",
    "limitations": ["Does not record absolute time spent above anaerobic thresholds, only that a session occurred."],
    "confidenceLabel": "exact count",
    "implementationStatus": "implemented"
  },
  {
    "id": "easy_day_count",
    "category": "calendar",
    "name": "Easy Day Count",
    "requiredInputs": ["days"],
    "formulaDisplay": "Count(days where intensity = easy / recovery)",
    "precision": "mathematical",
    "limitations": ["Easy running can drift into moderate stress if pace is not tightly governed by constant HR check."],
    "confidenceLabel": "exact count",
    "implementationStatus": "implemented"
  }
];

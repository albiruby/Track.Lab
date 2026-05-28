# File Map

## src/data
- `methodRegistry.ts`: central list of available calculator methods.
- `raceDistances.ts`: standard race distances from track to ultra.
- `unitConversions.ts`: unit conversion constants.
- `hrmaxMethods.ts`: age-predicted and manual HRmax methods.
- `hrZoneModels.ts`: HRmax, Karvonen, LTHR, MAF, custom zone models.
- `paceZoneModels.ts`: pace-zone metadata.
- `racePredictors.ts`: race prediction methods.
- `criticalSpeedMethods.ts`: CS and D-prime method metadata.
- `vo2Methods.ts`: VO2/MET/metabolic methods.
- `workoutTemplates.ts`: static workout templates.
- `workoutSafetyRules.ts`: deterministic warning rules.
- `loadMethods.ts`: training load methods.
- `fuelingHydrationRules.ts`: fueling, fluid, sodium, sweat rate methods.
- `environmentRules.ts`: heat, altitude, wind metadata.
- `trailElevationRules.ts`: grade/elevation/vertical speed formulas.
- `treadmillRules.ts`: treadmill speed/pace/incline metadata.
- `biomechanicsMethods.ts`: cadence/stride/step formulas.
- `powerMethods.ts`: W/kg and power efficiency formulas.
- `recoveryChecks.ts`: self-check calculators.
- `gearCalculators.ts`: shoe/fueling cost calculators.
- `validationRules.ts`: global input validation rules.
- `uiCopy.ts`: product copy and disclaimers.
- `sourceNotes.ts`: source notes and implementation notes.

## src/lib/calculators
Starter TypeScript calculator engine. Expand these files as UI modules grow.

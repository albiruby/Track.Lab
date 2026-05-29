Track.Lab has received a static datasource upgrade pack for Phase 13, items 1, 2, and 5 only.

The files have been manually copied into:

src/data_json/workoutTemplates.json
src/data_json/fieldTestProtocols.json
src/data_json/formulaMethodRegistry.json

Goal:
Integrate these static JSON datasource files into the existing Track.Lab app safely, without changing calculator math and without breaking the existing 27-module architecture.

This implementation focuses only on:
1. Workout Library datasource upgrade
2. Field Test Protocols datasource upgrade
5. Formula / Method Registry datasource upgrade

Do not implement Race Day Checklist, Gear Checklist, UI Copy, Validation Rules, or Safety Flags JSON in this phase unless they already exist and are necessary for compatibility.

==================================================
NON-NEGOTIABLE TRACK.LAB RULES
==================================================

Track.Lab must remain:
- frontend-only
- manual input only
- formula-based
- deterministic
- static datasource-based
- no AI
- no Gemini runtime feature
- no database
- no auth
- no backend API
- no saved history
- no cloud sync
- no device sync
- no fake athlete data
- no fake metrics
- no automatic coaching
- no “recommended workout today”
- no stored user input
- no stored calculation result

JSON files are static content only:
- templates
- protocol metadata
- formula/method metadata
- labels
- descriptions
- limitations
- formula display text

Calculator math execution must stay in TypeScript calculator engines.

==================================================
A. AUDIT CURRENT DATA ARCHITECTURE
==================================================

Inspect existing files:

src/data_pack/workoutTemplates.ts
src/data_pack/fieldTestProtocols.ts
src/data_pack/methodRegistry.ts
src/data_pack/index.ts
src/data_pack/tracklabStaticDataSource.ts
src/app/workout-library/page.tsx
src/app/test/page.tsx
src/app/formulas/page.tsx
src/app/page.tsx

Also inspect the new JSON files:

src/data_json/workoutTemplates.json
src/data_json/fieldTestProtocols.json
src/data_json/formulaMethodRegistry.json

Determine current canonical imports.

Important:
Do not let UI pages import JSON directly in many places. Create TypeScript adapters inside src/data_pack and keep UI imports stable.

==================================================
B. CREATE JSON TYPES AND ADAPTERS
==================================================

Create or update:

src/data_pack/jsonSchemas.ts
src/data_pack/jsonAdapters.ts

or equivalent.

Define strict TypeScript types for:

TrackLabWorkoutTemplate
TrackLabFieldTestProtocol
TrackLabFormulaMethod

Workout Template fields expected:
- id
- name
- category
- workoutType
- level
- raceDistanceTags
- surface
- purpose
- bestUsedFor
- notIdealFor
- requiredUserInputs
- optionalUserInputs
- warmup
- mainSet
- recovery
- cooldown
- durationRangeMinutes
- distanceRangeKm
- intensityTarget
- formulaHooks
- safetyFlags
- limitation
- confidenceLabel
- relatedModules

Field Test Protocol fields expected:
- id
- name
- purpose
- testType
- bestUsedFor
- notIdealFor
- requiredInputs
- optionalInputs
- protocolSteps
- warmupSuggestion
- testExecution
- outputCalculations
- formulaHooks
- safetyNotes
- confidenceLabel
- limitation
- relatedModules

Formula Method fields expected:
- methodId
- methodName
- category
- route
- formulaDisplay
- requiredInputs
- optionalInputs
- outputUnits
- confidenceLabel
- limitation
- sourceNote
- implementationStatus
- relatedModules

Rules:
- Empty optionalInputs arrays are valid.
- Do not treat optionalInputs: [] as missing.
- Preserve unknown extra fields if needed, but do not break strict known fields.
- Normalize confidence labels for display without destroying original raw labels.

Recommended normalization:
- workout confidenceLabel "high" → display as "Manual" or "Qualitative", preserve rawConfidenceLabel: "high".
- field protocol confidenceLabel "moderate" → display as "Field Test" or "Estimate", preserve rawConfidenceLabel: "moderate".
- formula registry confidenceLabel "Formula" → display as "Exact" for direct conversions or "Estimate" where method category implies prediction; preserve rawConfidenceLabel: "Formula".

Do not mutate the original JSON files at runtime.

==================================================
C. WORKOUT LIBRARY INTEGRATION
==================================================

Integrate src/data_json/workoutTemplates.json into Workout Library.

Expected count:
- 1315 workouts.

Tasks:
1. Create canonical export:
   src/data_pack/workoutTemplates.ts should export the JSON-backed templates or merge safely with existing templates.
2. Avoid duplicate IDs.
3. If existing TS templates overlap with JSON templates, prefer JSON v2 entries or clearly merge without duplicates.
4. Update /workout-library to support the larger dataset.
5. Do not render all details at once if it hurts performance.
6. Use efficient filtering/search.

Workout Library UI requirements:
- Search by name, category, purpose, tags, surface, level, workout type.
- Filter by category.
- Filter by level.
- Filter by surface.
- Filter by race distance tag.
- Filter by workoutType.
- Filter by safetyFlags.
- Template detail view must show:
  - purpose
  - bestUsedFor
  - notIdealFor
  - warmup
  - mainSet
  - recovery
  - cooldown
  - duration range
  - distance range
  - intensity target
  - formula hooks
  - safety flags
  - limitation
  - related modules
- Export selected template works.
- Compare two templates still works if previously implemented.

Rules:
- Do not create personalized workout recommendations.
- Do not add “best workout for you”.
- Do not auto-select workouts for users.
- Templates are static protocols only.
- Results still require manual inputs before calculations.

Quick Lab:
- If showing template count, use static datasource count only, e.g. “1315 static workout templates”.
- Do not show fake usage metrics.

==================================================
D. FIELD TEST PROTOCOL INTEGRATION
==================================================

Integrate src/data_json/fieldTestProtocols.json into Test Lab.

Expected count:
- 15 field test protocols.

Tasks:
1. Create canonical export:
   src/data_pack/fieldTestProtocols.ts
2. Update /test page protocol selector and detail cards.
3. Ensure calculators remain deterministic and formula-based.
4. Protocols are instructional static protocols, not medical testing.

Test Lab UI requirements:
- Search/filter protocols by name, testType, related module.
- Protocol detail must show:
  - purpose
  - bestUsedFor
  - notIdealFor
  - requiredInputs
  - optionalInputs
  - protocolSteps
  - warmupSuggestion
  - testExecution
  - outputCalculations
  - formulaHooks
  - safetyNotes
  - confidenceLabel
  - limitation
  - relatedModules
- Cross-link related modules if safely available.
- Export selected protocol works.

Rules:
- No medical diagnosis.
- No lab-grade claim unless explicitly saying “not lab-measured”.
- No “safe to perform” guarantee.
- Use safety wording already present in JSON.

==================================================
E. FORMULA METHOD REGISTRY INTEGRATION
==================================================

Integrate src/data_json/formulaMethodRegistry.json into Formula Library.

Expected count:
- 110 methods.

Tasks:
1. Create or update canonical method registry adapter:
   src/data_pack/methodRegistry.ts
2. Merge with existing registry if needed.
3. Avoid duplicate methodId.
4. If an existing method is more complete than JSON, preserve the existing richer version.
5. If JSON contains a method not in the current registry, add it through adapter.
6. Do not overwrite implemented statuses incorrectly.

Important:
JSON may use implementationStatus: "readyForImplementation".
Map this safely:
- If the method is already implemented in current Track.Lab, display as implemented.
- If not implemented, display as planned or ready.
- Do not mark unimplemented methods as implemented only because JSON says readyForImplementation.

Formula Library UI requirements:
- Search by method name, formula, route, input, category.
- Filter by category.
- Filter by route/module.
- Filter by confidence label.
- Filter by implementation status.
- Show raw source note if available.
- Show related modules.
- Route links must work or be safely disabled if route does not exist.

Rules:
- Do not invent formulas.
- Do not execute formula strings.
- Formula strings are display-only.
- Calculator functions remain in TypeScript.

==================================================
F. PERFORMANCE SAFETY FOR LARGE STATIC JSON
==================================================

Workout library has 1315 templates.

Make sure:
- initial render is not overloaded.
- filtering is memoized where appropriate.
- detail view renders only selected template details.
- no giant page crash.
- no expensive recalculation every keystroke beyond reasonable filtering.
- no server/backend required.

Use standard React/Next.js client-side static import or adapter pattern appropriate to current app.

Do not add database or API route just to handle the dataset.

==================================================
G. CONTENT QUALITY / ANTI-GIMMICK SCAN
==================================================

Search the imported content and UI for unsafe words:
- AI coach
- automatic prescription
- guaranteed improvement
- injury prediction
- medical diagnosis
- saved history
- database dependency
- fake metrics
- recommended for you
- best workout for you
- auto-coach

Allowed phrases if negating:
- No AI coach
- no database dependency
- no fake metrics
- not medical diagnosis

If unsafe phrasing appears in user-facing UI, rewrite display mapping or labels to safe wording.

==================================================
H. VALIDATION AND BUILD
==================================================

Run:
- npm run lint
- npm run build

If available:
- npm run typecheck

Test:
1. Quick Lab still shows exactly 27 modules.
2. Workout Library loads 1315 templates.
3. Search “800” returns 800m templates.
4. Search “threshold” returns threshold-related templates.
5. Category filters work.
6. Level filters work.
7. Surface filters work.
8. Race distance filters work.
9. Template detail opens without crash.
10. Export selected workout works.
11. Test Lab loads 15 protocols.
12. Cooper protocol appears.
13. Sweat Rate protocol appears.
14. Export selected protocol works.
15. Formula Library loads 110 JSON methods plus any existing canonical methods without broken duplicates.
16. Search “Riegel” returns Riegel method if present.
17. Search “Pace from Distance and Time” returns method.
18. No route breaks.
19. No fake data appears.
20. No AI/database/auth dependency added.

==================================================
I. RETURN IMPLEMENTATION REPORT
==================================================

Return report:
1. Files changed.
2. JSON adapter files created/updated.
3. Workout templates loaded count.
4. Field test protocols loaded count.
5. Formula methods loaded count.
6. Merge/duplicate handling summary.
7. UI updates to Workout Library.
8. UI updates to Test Lab.
9. UI updates to Formula Library.
10. Performance handling for 1315 templates.
11. Anti-gimmick scan result.
12. Test results.
13. Build/lint/typecheck status.
14. Confirmation:
   - no AI
   - no database
   - no auth
   - no backend API
   - no saved user data
   - formula execution remains TypeScript
   - JSON is static datasource only

# Google AI Studio Master Prompt for Track.Lab

Build Track.Lab as a deterministic, frontend-only running calculator website using Next.js, TypeScript, and Tailwind CSS.

Core rules:
- No database.
- No authentication.
- No AI features.
- No AI coach.
- No generated insight.
- No fake data.
- No mock dashboard.
- No placeholder feature.
- No hidden formula.
- No output without valid user input.
- No medical, injury, or performance guarantee claims.

Use the provided `src/data` folder as static datasource metadata. Use the provided `src/lib/calculators` folder as the starting calculator engine. Do not use eval() to execute formulas from JSON. Formulas in data files are display text only; actual math must be written as typed TypeScript functions.

Build the UI modules:
1. Pace Lab
2. Heart Rate Lab
3. Zone Lab
4. Race Lab
5. Training Pace Lab
6. Critical Speed Lab
7. VO2 & Metabolic Lab
8. Workout Lab
9. Workout Library
10. Load Lab
11. Fuel & Hydration Lab
12. Environment Lab
13. Trail & Elevation Lab
14. Treadmill Lab
15. Biomechanics Lab
16. Power Lab
17. Recovery Check Lab
18. Gear Lab
19. Export Lab
20. Formula Library

Every calculator screen must include:
- input validation
- method selector when multiple methods exist
- required input display
- result card
- formula display
- limitation/warning box
- confidence label: mathematical / estimate / field-test / measured / custom
- copy result button

Workout Library rules:
- Use static workout templates only.
- Do not generate workouts with AI.
- Let user select goal distance, scenario, and template.
- Calculate target pace, rep time, total work distance, rest duration, session duration, intensity distribution, and warnings from user input.

Deployment target:
- GitHub -> Vercel
- No database
- No backend storage
- localStorage is optional only for local preferences or temporary saved results

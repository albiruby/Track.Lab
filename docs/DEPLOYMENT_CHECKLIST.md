# Track.Lab Pre-Deployment Verification Checklist

Follow this checklist before tags, staging, or production deployment:

## 1. Local Testing & Quality Assurance Logs
- [ ] **Lint Verification**: Execute `npm run lint` and verify there are zero warnings or errors.
- [ ] **Build Compilation**: Run `npm run build` to confirm static HTML bundling and App Router static export/building succeed without warnings or module resolution issues.
- [ ] **Type Safety Verification**: Perform any active TypeScript checks configured in the environment (`npm run typecheck` or similar).

## 2. Comprehensive Route Verification (All 27 Modules)
Confirm that each of the following 27 routes compiles and renders physically within the browser under `/src/app` correctly:
1. `/` — Quick Lab Homepage Launcher
2. `/pace` — Pace Lab
3. `/split` — Split Lab
4. `/heart-rate` — Heart Rate Lab
5. `/zone` — Zone Lab
6. `/rpe` — RPE Lab
7. `/race` — Race Lab
8. `/training-pace` — Training Pace Lab
9. `/critical-speed` — Critical Speed Lab
10. `/vo2` — VO2 & Metabolic Lab
11. `/workout` — Workout Lab
12. `/workout-library` — Workout Library
13. `/test` — Test Lab
14. `/load` — Load Lab
15. `/fuel` — Fuel & Hydration Lab
16. `/environment` — Environment Lab
17. `/trail-elevation` — Trail & Elevation Lab
18. `/treadmill` — Treadmill Lab
19. `/track` — Track Lab
20. `/biomechanics` — Biomechanics Lab
21. `/power` — Power Lab
22. `/recovery` — Recovery Check Lab
23. `/gear` — Gear Lab
24. `/race-day` — Race Day Lab
25. `/conversion` — Conversion Lab
26. `/calendar` — Calendar Lab
27. `/formulas` — Formula Library

## 3. Physical State & Zero Persistence Policies
- [ ] **No Environmental Dependencies**: Verify that the application is fully operational without requiring `.env` files or public client keys.
- [ ] **No Stored State**: Ensure no cookies, headers, or localStorage keys store database tracking records.
- [ ] **Zero Database, Auth, or AI Imports**: Verify that neither `@google/genai`, `firebase`, `supabase`, `prisma` nor any authorization packages are imported or active.
- [ ] **No Fake Data or Simulated Telemetry**: Verify that there are zero un-calculated mock visual indicators or simulated athlete telemetry feeds.
- [ ] **Manual Export Only Enforcement**: Check that the manual copy, text, CSV, or printing downloads work correctly in-browser. Correct wording is explicitly used: *"Track.Lab does not store this result. Export is manual and user-triggered."*

## 4. Platform Hosting Configuration
- [ ] **Vercel Root Directory**: Confirm that build root directory matches standard Next.js App Router rules.
- [ ] **Production URL Checks**: Inspect routing after initial platform launch, and confirm that there are zero dead navigation sidebar links relative to standard module navigation.

# Track.Lab - Deployment Checklist

Track.Lab is intentionally designed as a frontend-only, deterministic calculator suite. 
It requires no database, no authentication, no AI integrations, and no backend API.

## Pre-deployment checks
- [ ] Ensure all 20 modules appear in the navigation bar.
- [ ] Confirm no `.env` variables contain sensitive data (none are needed).
- [ ] Confirm static data lives entirely within `src/data_pack`.
- [ ] Verify there is no placeholder, mock data, or fake analytics being rendered.

## Local Test Steps
1. Run `npm install`
2. Run `npm run lint` and ensure no warnings or errors.
3. Run `npm run build` to confirm Next.js static optimizations complete successfully.
4. Run `npm run start` and navigate manually through calculations to confirm behavior.

## Deployment to Vercel (or similar)
1. Import the repository into your deployment platform.
2. Ensure the Framework Preset is set to **Next.js**.
3. No environment variables need to be provided.
4. Leave Build Command (`npm run build`) and Install Command (`npm install`) as default.

Track.Lab uses purely static mathematical operations with TypeScript math functions. It is highly cacheable and scales without any infrastructure considerations beyond Next.js hosting.

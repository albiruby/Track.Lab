# Track.Lab Implementation Guide

## Option A: TypeScript constants, recommended

Copy these folders into your Next.js app:

```text
src/data
src/lib/calculators
```

Then import where needed:

```ts
import { methodRegistry, raceDistances, workoutTemplates } from "@/data";
import { paceSecondsPerKm, riegelPredictTime } from "@/lib/calculators";
```

## Option B: JSON static fetch

Copy `public/data` into your Next.js app and fetch files like:

```ts
const res = await fetch("/data/method-registry.json");
const methods = await res.json();
```

This is still not a database. It is static data served with the app.

## Key UI behavior

If a method requires input that is missing, show incomplete state. Do not calculate. Example:

```text
Input incomplete. This method requires maxHeartRate and restingHeartRate.
```

## Formula safety

Do not run this:

```ts
// Forbidden
const result = eval(method.formulaDisplay)
```

Do this instead:

```ts
// Correct
const result = zoneFromKarvonen(maxHr, restingHr, 0.6, 0.7)
```

# Track.Lab Data Source Pack v1

This pack contains static data sources and starter calculator engine files for Track.Lab.

Core product rules:
- No database
- No authentication
- No AI
- No fake data
- No hidden formula
- No output without valid user input

## Recommended usage in Next.js

Place `src/data` and `src/lib/calculators` directly into your Next.js project.
Use the TypeScript files as the primary source. JSON mirrors are available under `public/data` if you prefer static fetch.

## Architecture

```text
Static datasource metadata
  -> calculator engine functions
  -> UI form and result cards
```

Never execute formulas from JSON with `eval()`. The JSON stores formula display text and metadata only. Actual math lives in TypeScript functions.

## Data folders

- `src/data`: TypeScript constants for methods, zones, templates, validation, UI copy, and source notes.
- `src/lib/calculators`: deterministic TypeScript math functions.
- `public/data`: JSON copies for static fetch or manual import.
- `docs`: Google AI Studio prompt and implementation guide.

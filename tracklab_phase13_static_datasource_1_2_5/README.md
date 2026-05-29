# Track.Lab Phase 13 Static Datasource Pack — Items 1, 2, and 5

This package contains only the datasource upgrades you selected:

1. **Workout Library** — `1315` static workout templates.
2. **Field Test Protocols** — `15` protocol entries.
5. **Formula / Method Registry** — `110` method metadata entries.

## What to copy into your project

Copy this folder into your Track.Lab project:

```text
src/data_json/
```

It contains:

```text
src/data_json/workoutTemplates.json
src/data_json/fieldTestProtocols.json
src/data_json/formulaMethodRegistry.json
```

The other folders are supporting files only:

```text
validation_reports/
review_checklists/
summaries/
docs/
```

## Important architecture rules

- These JSON files are **static datasource content only**.
- They are **not a database**.
- They must not store user inputs or calculated results.
- Calculator formulas and math execution must stay in TypeScript calculator engines.
- UI pages should import data through canonical TypeScript adapters, not by scattering direct JSON imports everywhere.

## Recommended implementation flow

1. Copy `src/data_json/` into the Track.Lab project root.
2. Run the implementation prompt from:

```text
docs/IMPLEMENTATION_PROMPT.md
```

3. Run:

```bash
npm run lint
npm run build
npm run typecheck
```

## Notes

The Formula Method Registry validation report may flag empty `optionalInputs` arrays as missing. Treat empty arrays as valid optional inputs if the field exists. Do not mark methods invalid only because optional inputs are empty.

# Quick Implementation Prompt

Paste the full prompt in `IMPLEMENTATION_PROMPT.md` into Google AI Studio after copying `src/data_json/` into the Track.Lab project.

Minimum instruction:

Integrate these static datasource files safely:
- src/data_json/workoutTemplates.json
- src/data_json/fieldTestProtocols.json
- src/data_json/formulaMethodRegistry.json

Create TypeScript adapters inside src/data_pack, keep UI imports canonical, update Workout Library, Test Lab, and Formula Library, preserve all 27 modules, keep calculator math in TypeScript, and run lint/build/typecheck. No AI, no database, no auth, no backend, no saved user data.

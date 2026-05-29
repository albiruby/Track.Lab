# Manual File Placement Map

Place the files like this inside your Track.Lab project:

```text
<TRACKLAB_PROJECT_ROOT>/
└── src/
    └── data_json/
        ├── workoutTemplates.json
        ├── fieldTestProtocols.json
        └── formulaMethodRegistry.json
```

Keep supporting files outside `src` unless you want them as docs:

```text
validation_reports/
review_checklists/
summaries/
```

Do not replace calculator engine files with JSON. JSON is static metadata/content only.

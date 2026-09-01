# Integrated Team + V7 Build

This build uses the latest team GitHub frontend/backend integration as the base and adds the V7 quantitative engine.

- Team frontend live API integration and UI changes are preserved.
- V7 forecast/Monte Carlo/decision/optimization modules are included.
- V7 real-data pipeline, processed market snapshots, model artifacts, validation tests, and provenance docs are included.
- Shared backend files were merged so team routes remain available alongside V7 `/pre-mc`, `/decision-engine`, and `/quant` routes.
- `frontend/src/services/api.js` retains the team's request/fallback behavior and exposes V7 quantitative endpoints.
- Legacy backend CSV consumers remain compatible while the primary V7 engine uses `data/processed/` real-data artifacts.

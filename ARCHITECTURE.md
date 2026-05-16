# Architecture

## Current deliverable (static public demo)

- `web/index.html` hosts a static SPA shell.
- `web/src/app.js` manages data load, filter state, rendering, upload/mapping flow, chart/table toggles, and exports.
- `web/src/lib/analytics.js` computes KPIs and exhibit datasets from filtered records.
- `web/src/lib/normalize.js` canonicalizes enum-like values from uploaded spreadsheets.
- `web/src/lib/pptExport.js` builds the 11-slide client-side deck with PptxGenJS.
- `web/public/sample/snapshot.json` provides bundled synthetic portfolio data for immediate analysis.

## Deferred components (future PRs)

- Backend API services (`api/`)
- Infrastructure as code (`infrastructure/`)
- Dockerized stack and connectors

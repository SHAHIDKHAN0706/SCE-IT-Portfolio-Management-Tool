# SCE IT Portfolio Management Tool

A React 18 + Vite single-page app and FastAPI backend for managing the SCE IT portfolio:
filter by portfolio / value stream / funding / driver / BCR / recommendation, run a
**prioritization engine** that detects overlapping projects and interdependencies, and
generate an executive PowerPoint on demand.

> 🚧 Scaffold in progress — see [`SCE_IT_Portfolio_Tool_BUILD_PROMPT.md`](./SCE_IT_Portfolio_Tool_BUILD_PROMPT.md)
> for the full specification. The initial implementation is being delivered via an
> automated coding-agent PR.

## Quickstart (after scaffold lands)

```bash
# Web
cd web && npm install && npm run dev

# API (optional, for live PPM connectors + server-side PPT)
cd api && pip install -e . && uvicorn src.main:app --reload

# Full stack
docker compose up
```

## Status

| Surface | Status |
|---|---|
| Repo scaffold | ⏳ initial PR |
| React web app (5 views) | ⏳ initial PR |
| Prioritization engine | ⏳ initial PR |
| Client-side PPTX export | ⏳ initial PR |
| FastAPI + connectors (UMT360, Daptiv) | ⏳ initial PR |
| Server-side PPTX + scheduled job | ⏳ initial PR |

See the build prompt for the full functional, UI/UX, integration, and acceptance
criteria.

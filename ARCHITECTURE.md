# Architecture

## Frontend

- React 18 + Vite SPA (`web/`)
- Reusable UI primitives under `web/src/components/ui/`
- Shared filtering and analytics views wired from canonical initiative model
- Prioritization engine in `web/src/lib/prioritization/`

## Backend

- FastAPI service (`api/src/main.py`)
- Adapter interface (`PortfolioDataAdapter`) with pluggable implementations
- Stub adapters for UMT360 and Daptiv
- Prioritization mirror implementation in Python for parity

## Prioritization formula

Each initiative is scored 0–100 by normalized factor weights:

- `bcr`
- `driverUrgency`
- `fundingPressure`
- `strategicAlignment`
- `timeToGoLive`
- `capitalEfficiency`
- `recommendationSignal`

`score = 100 * Σ(weight_i * normalized_factor_i)`

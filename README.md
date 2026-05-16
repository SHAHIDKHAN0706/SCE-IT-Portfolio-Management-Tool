# SCE IT Portfolio Management Tool

React 18 + Vite web app and FastAPI backend for SCE IT portfolio analytics and prioritization.

## Quickstart

```bash
# web
cd web
npm install
npm run dev

# api
cd ../api
pip install -e .[test]
uvicorn src.main:app --reload
```

## Full stack (docker)

```bash
docker compose up
```

- Web: http://localhost:5173
- API docs: http://localhost:8000/docs

## Screenshots

- `docs/assets/overview.png` (placeholder)
- `docs/assets/prioritization.png` (placeholder)
- `docs/assets/deck-thumbnail.png` (placeholder)

## Deploy

- Build web: `cd web && npm run build`
- Run API: `cd api && uvicorn src.main:app --host 0.0.0.0 --port 8000`
- Use Dockerfiles for containerized deploys.

## References

- [Build prompt](./SCE_IT_Portfolio_Tool_BUILD_PROMPT.md)
- [Architecture](./ARCHITECTURE.md)
- [Prioritization](./docs/prioritization.md)

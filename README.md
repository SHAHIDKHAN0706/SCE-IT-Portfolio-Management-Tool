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

### Public demo — GitHub Pages (web only)

The web app is a static SPA that loads `public/sample/snapshot.json` as seed
data, so it can be hosted on GitHub Pages with no backend.

A workflow at `.github/workflows/deploy-pages.yml` builds `web/` and publishes
`web/dist` to Pages on every push to `main`. To enable:

1. In repo **Settings → Pages**, set **Source** to **GitHub Actions**.
2. Push to `main` (or run the workflow manually via the Actions tab).
3. The site will be available at
   `https://shahidkhan0706.github.io/SCE-IT-Portfolio-Management-Tool/`.

Vite's `base` is set to `/SCE-IT-Portfolio-Management-Tool/` in
`web/vite.config.ts` so asset and router paths resolve correctly under the
project Pages URL. Override with `VITE_BASE=/` to host at the domain root
(e.g. a custom domain or user/organization Pages site).

### Full stack (manual / container hosts)

- Build web: `cd web && npm run build`
- Run API: `cd api && uvicorn src.main:app --host 0.0.0.0 --port 8000`
- Use `Dockerfile.web` / `Dockerfile.api` for containerized deploys (e.g.
  Render, Railway, Fly.io, Azure Container Apps, AWS App Runner, Cloud Run).
  Point the web build at the public API URL by wiring a build-time env var
  when/if the frontend gains runtime API calls.

## References

- [Build prompt](./SCE_IT_Portfolio_Tool_BUILD_PROMPT.md)
- [Architecture](./ARCHITECTURE.md)
- [Prioritization](./docs/prioritization.md)

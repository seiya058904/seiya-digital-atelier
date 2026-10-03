# Seiya Digital Atelier

Personal digital atelier for projects, experiments, design, and ideas.

## Run locally

This is a self-contained static export. It does not use `npm run dev` or a
bundler; serve the project directory directly with any static HTTP server:

```text
cd "D:\xia zai\AI project\Archived Project\seiya-digital-atelier"
python server.py
```

Then open `http://127.0.0.1:8787/`.

The page routes are `http://127.0.0.1:8787/work`, `http://127.0.0.1:8787/about`, and `http://127.0.0.1:8787/contact`.

## Verify and publish

From the repository root, run `node --test test/work-card-guard.test.cjs test/route-links.test.cjs test/cms-compat.test.cjs test/page-metadata.test.cjs`. For startup checks,
run `node scripts/verify-startup.cjs` with Playwright available on `NODE_PATH`.
Set `QA_BASE_URL=https://seiya058904.github.io/seiya-digital-atelier/` to verify
the published routes. GitHub Pages deploys the static files from `main`; after a
push, verify its deployment commit and the four live routes. No npm build is needed.

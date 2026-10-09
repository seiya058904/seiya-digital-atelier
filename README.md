<div align="center">

# Seiya Digital Atelier

**A personal studio on the web — work, ideas and experiments in one place.**

An editorial space for selected projects, creative exploration and a deliberately minimal personal web presence.

[**Visit the atelier ↗**](https://seiya058904.github.io/seiya-digital-atelier/) · [Work](https://seiya058904.github.io/seiya-digital-atelier/work) · [About](https://seiya058904.github.io/seiya-digital-atelier/about) · [Contact](https://seiya058904.github.io/seiya-digital-atelier/contact)

![Site](https://img.shields.io/badge/site-static%20export-64748b?style=flat-square) ![Hosting](https://img.shields.io/badge/host-GitHub%20Pages-222?style=flat-square)

</div>

## ✦ Explore the space

| Page | Purpose |
| --- | --- |
| **Home** | Introduction and project identity |
| **Work** | Selected works and creative experiments |
| **About** | Context, interests and personal direction |
| **Contact** | Ways to connect |

This repository is a **self-contained static export**. Its route entries are committed as HTML files, with specific compatibility scripts to preserve the generated site's navigation. It is **not** a React source project or a Vite app requiring a bundler.

## 🚀 Run locally

Python is sufficient for the repository's route-aware local server:

```powershell
# Run these commands from the Git repository root
python server.py
```

Open `http://127.0.0.1:8787/`; the same local server resolves `/work`, `/about` and `/contact`. To use a different port:

```powershell
python server.py 8788
```

There is no `npm run dev`, package installation or build step. The server maps the committed static route files to clean URLs.

## 🧩 Repository anatomy

```text
index.html          Home
work/index.html     Selected work
about/index.html    About
contact/index.html  Contact
assets/             Original exported assets
source/             Retained reference / recovery source
server.py           Route-aware local server
route-links.js      Static route compatibility
work-cms-compat.js  Work / CMS compatibility
work-card-guard.js  Work-card behavior protection
test/               Node regression checks
```

The exported assets and recovery material are part of the project history. Avoid casually regenerating the export or replacing it with a different framework; preservation and targeted corrections are deliberate design constraints.

## ✅ Verify before publishing

```powershell
node --test test/work-card-guard.test.cjs test/route-links.test.cjs test/cms-compat.test.cjs test/page-metadata.test.cjs
```

Optional browser/startup verification:

```powershell
node scripts/verify-startup.cjs
```

The browser check requires Playwright to be available through the repository's documented environment, including `NODE_PATH` when necessary. GitHub Pages publishes the committed static files from `main`; confirm the actual deployed commit and live route behavior after any authorized push.

See [`AGENTS.md`](AGENTS.md) for preservation rules, tests and deployment constraints. This README does not claim a project-wide open-source license that has not been declared.

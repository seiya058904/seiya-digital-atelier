# Agent Guide

## Project structure

This is a self-contained static Framer export; there is no `package.json` or bundler. The page entries are `index.html`, `work/index.html`, `about/index.html`, and `contact/index.html`. Runtime compatibility and routing fixes live in `route-links.js`, `work-cms-compat.js`, `work-card-guard.js`, and `c-append-blocks.js`. `assets/` contains the checked-in export resources, `source/` contains reference/recovered source material, and `test/` contains Node tests. `server.py` is the repository’s route-aware local server.

## Development and verification

Run the local site with:

```powershell
python server.py
```

It serves `http://127.0.0.1:8787/` and maps `/work`, `/about`, and `/contact` to their entry files. For a port override use `python server.py 8788`. Run the available automated tests with:

```powershell
node --test test/work-card-guard.test.cjs test/route-assets.test.cjs test/route-links.test.cjs test/cms-compat.test.cjs test/page-metadata.test.cjs
```

There are no repository-defined install, build, lint, or type-check commands.

## Browser Testing

For changes affecting web UI, routing, interaction, responsiveness, or runtime behavior, perform real browser verification before declaring completion.

Use the most appropriate tool:

- **Browser plugin** — preferred for routine localhost checks, navigation, visual inspection, and exploratory testing.
- **Playwright** — use for repeatable E2E flows, regression tests, assertions, and important user paths.
- **Chrome plugin** — use when the real Chrome profile, cookies, sessions, extensions, or logged-in state are required.
- **Chrome DevTools** — use for console, network, rendering, memory, scrolling, or performance diagnosis.
- **Computer Use** — use only when native OS interaction is required.

Prefer real user flows over injected state, modified storage, hidden routes, or DOM manipulation.

When relevant, verify the affected flow, routing/refresh behavior, representative desktop and mobile sizes, console errors, failed resources, and the deployed site when localhost may differ from production.

A successful build or passing unit tests do not prove browser behavior is correct.

If a bug is found, reproduce it, fix the root cause, and rerun the failing path. Add a Playwright regression test when recurrence would be costly.

Keep testing proportional to risk; do not run every browser tool unnecessarily.

Never claim browser verification passed unless the required flow was actually executed successfully.

Pure documentation or Git-rule changes do not need browser testing.

## Implementation rules

Preserve the static export and existing asset layout. `route-links.js` and related compatibility scripts handle the `/seiya-digital-atelier` GitHub Pages prefix and hydrated Framer/CMS resources; test path changes against both local-root and Pages-prefixed URLs. Keep work-card disabling narrow to the destinations covered by `work-card-guard.js` and its tests. Do not add dependencies or rewrite generated HTML/assets for unrelated changes.

## Git workflow

Recent history uses concise conventional-style subjects such as `fix: ...` and `docs: ...`; use the same style. Inspect `git status`, branch/upstream, worktrees, and recent history before substantial work. Stage explicit files only, run `git diff --check` and inspect the staged diff before committing. Preserve unrelated or uncertain user changes. Never use reset/restore/clean or force-push to manufacture a clean tree. A task is fully closed only when its changes are committed, integrated into the real default branch, pushed, and local default HEAD equals `origin/<default>` with ahead/behind `0 0` and no staged, unstaged, or untracked files.

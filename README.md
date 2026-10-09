<h1 align="center">✦ Seiya — Digital Atelier</h1>

<p align="center">
  <strong>A personal studio for work in progress and ideas made visible.</strong>
</p>

<p align="center">
  An understated editorial portfolio for software, interactive experiments,<br>
  visual studies, and the practice of learning through making.
</p>

<p align="center">
  <a href="https://seiya058904.github.io/seiya-digital-atelier/"><strong>↗ Visit the Atelier</strong></a>
  &nbsp;·&nbsp;
  <a href="#four-pages-one-studio">✦ Explore</a>
  &nbsp;·&nbsp;
  <a href="https://seiya058904.github.io/seiya-digital-atelier/work/">🗂️ Selected Work</a>
  &nbsp;·&nbsp;
  <a href="#a-preserved-static-website">⚙️ Architecture</a>
  &nbsp;·&nbsp;
  <a href="#run-it-locally">🛠️ Development</a>
</p>

<p align="center">
  <sub>EDITORIAL PORTFOLIO &nbsp;·&nbsp; FOUR PUBLIC PAGES &nbsp;·&nbsp; STATIC FRAMER EXPORT &nbsp;·&nbsp; NO BUILD STEP</sub>
</p>

---

> **A place for the work, without turning the work into a dashboard.**
>
> The Atelier brings a selection of digital projects and personal direction into a smaller, quieter web presence. It is a studio entrance—not a collection of unrelated landing-page templates or a full CMS product.

<a id="four-pages-one-studio"></a>
## ✦ Four Pages. One Studio.

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>01 / Home</h3>
      <p><sub>IDENTITY · FIRST IMPRESSION</sub></p>
      <p>A concise introduction to the digital atelier and the kind of work it brings together.</p>
      <p><strong><a href="https://seiya058904.github.io/seiya-digital-atelier/">Enter the studio ↗</a></strong></p>
    </td>
    <td width="50%" valign="top">
      <h3>02 / Work</h3>
      <p><sub>SELECTED PROJECTS · EXPERIMENTS</sub></p>
      <p>An editorial index of software, web experiences, and visual work—both completed pieces and ongoing explorations.</p>
      <p><strong><a href="https://seiya058904.github.io/seiya-digital-atelier/work/">Explore the work ↗</a></strong></p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>03 / About</h3>
      <p><sub>CURIOSITY · CODE · DESIGN</sub></p>
      <p>A little context about the interests and ongoing practice behind the portfolio.</p>
      <p><strong><a href="https://seiya058904.github.io/seiya-digital-atelier/about/">Read the story ↗</a></strong></p>
    </td>
    <td width="50%" valign="top">
      <h3>04 / Contact</h3>
      <p><sub>QUESTIONS · IDEAS · CONVERSATION</sub></p>
      <p>A dedicated place to find ways to connect about the work and what comes next.</p>
      <p><strong><a href="https://seiya058904.github.io/seiya-digital-atelier/contact/">Get in touch ↗</a></strong></p>
    </td>
  </tr>
</table>

## 🧩 Work With Its Own Identity

The Atelier acts as a curated doorway, not a replacement for the repositories where projects are built and maintained. Selected outbound links in the exported interface lead to independent work such as [Hardware Monitoring](https://github.com/seiya058904/Hardware-Monitoring), [Seiya Digital Journal](https://seiya058904.github.io/seiya-digital-journal/), and [INSTANCE](https://seiya058904.github.io/INSTANCE/).

> [!NOTE]
> **Some original Framer work-card destinations are intentionally non-navigable.** Their detailed destination pages were not part of this preserved four-page export. Compatibility guards prevent those placeholder routes from becoming broken links; a visible project card is not a promise that a local detail page exists.

<a id="a-preserved-static-website"></a>
## ⚙️ A Preserved Static Website

This repository contains a **self-contained static Framer export**. Its four pages and their images, fonts, scripts, and compatibility files are checked into Git. It does **not** contain a React source application, a `package.json`, or an npm/Vite build workflow.

<table>
  <tr>
    <td width="50%" valign="top">
      <h3>📄 Real Static Pages</h3>
      <p>Committed `index.html` files provide the Home, Work, About, and Contact entries. GitHub Pages serves the checked-in export beneath the <code>/seiya-digital-atelier/</code> prefix.</p>
    </td>
    <td width="50%" valign="top">
      <h3>🧭 Route-Aware Navigation</h3>
      <p>Compatibility code keeps internal navigation working at the local root and under the GitHub Pages subpath, including Framer-generated links.</p>
    </td>
  </tr>
  <tr>
    <td width="50%" valign="top">
      <h3>🗃️ Preserved Assets</h3>
      <p>The exported media and retained source/reference files support the site's original presentation and make targeted restoration possible.</p>
    </td>
    <td width="50%" valign="top">
      <h3>🛡️ Guarded Interactions</h3>
      <p>Work/CMS compatibility and specific link guards preserve what is available without inventing missing project pages or enabling unrelated template destinations.</p>
    </td>
  </tr>
</table>

### Why the Compatibility Files Exist

Framer-generated navigation and CMS content can expect behaviors that a plain static host does not implement. This export handles those narrow differences in dedicated scripts instead of replacing the site with a new framework.

<p align="center"><code>STATIC PAGE → ROUTE COMPATIBILITY → LOCAL ASSETS → RENDERED STUDIO</code></p>

<a id="run-it-locally"></a>
## 🚀 Run It Locally

A small, route-aware **Python HTTP server** is included. From the Git repository root:

```powershell
python server.py
```

Open **http://127.0.0.1:8787/**. The same server resolves `/work`, `/about`, and `/contact`, and supports the exported site's local CMS compatibility behavior.

To choose another port:

```powershell
python server.py 8788
```

**No installation or frontend compilation is required** to preview the committed export. Use a web server instead of assuming that double-clicking individual HTML files reproduces all routes and asset requests.

<details>
<summary><strong>🛠️ Expand file map, verification &amp; preservation rules</strong></summary>

### Repository map

| Path | Purpose |
| --- | --- |
| [`index.html`](index.html) | Home page entry |
| [`work/index.html`](work/index.html) | Work index |
| [`about/index.html`](about/index.html) | About page |
| [`contact/index.html`](contact/index.html) | Contact page |
| [`assets/`](assets/) | Exported fonts, media, and runtime resources |
| [`source/`](source/) | Retained reference and recovered source material |
| [`server.py`](server.py) | Local routing and asset-serving compatibility |
| [`route-links.js`](route-links.js) | Root and GitHub Pages route normalization |
| [`work-cms-compat.js`](work-cms-compat.js) | Byte-range compatibility for local Framer CMS content |
| [`work-card-guard.js`](work-card-guard.js) | Explicitly disabled unavailable Work destinations |
| [`c-append-blocks.js`](c-append-blocks.js) | Compatibility for dynamically mounted Framer content |
| [`test/`](test/) | Regression tests for links, metadata, cards, and CMS behavior |

### Regression checks

These use Node's built-in test runner; there is no repository-defined build, lint, or installation command.

```powershell
node --test test/work-card-guard.test.cjs test/route-links.test.cjs test/cms-compat.test.cjs test/page-metadata.test.cjs
```

An optional browser/startup check is also present:

```powershell
node scripts/verify-startup.cjs
```

The browser check requires an available Playwright/Chromium environment and exercises both narrow and desktop views. Do not describe it as passing unless it has actually been run against the intended version.

### Preservation boundary

Keep the exported HTML, assets, Framer/CMS compatibility, and retained reference material intact unless a scoped change explicitly requires otherwise. Verify root and Pages-prefixed routes after navigation changes, and do not replace the export with an invented build system.

Read [`AGENTS.md`](AGENTS.md) for current repository conventions and test expectations.

</details>

## 📜 Rights & Source Notes

The repository does **not** declare a project-wide open-source license. Public availability of a preserved export does not itself grant permission to copy, modify, or redistribute its source, third-party media, fonts, or framework assets. Check the rights applicable to each asset before reuse.

---

<p align="center">
  <sub>SELECTED WORK. QUIET EXPLORATION. A STUDIO STILL IN PROGRESS.</sub><br>
  <sub>Seiya Digital Atelier · A small place on the web for making.</sub>
</p>

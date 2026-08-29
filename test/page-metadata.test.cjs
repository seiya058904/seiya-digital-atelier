const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');

const PAGES = {
  'index.html': {
    title: 'Seiya — Digital Atelier',
    canonical: 'https://seiya058904.github.io/seiya-digital-atelier/',
  },
  'work/index.html': {
    title: 'Work — Seiya Digital Atelier',
    canonical: 'https://seiya058904.github.io/seiya-digital-atelier/work/',
  },
  'about/index.html': {
    title: 'About — Seiya Digital Atelier',
    canonical: 'https://seiya058904.github.io/seiya-digital-atelier/about/',
  },
  'contact/index.html': {
    title: 'Contact — Seiya Digital Atelier',
    canonical: 'https://seiya058904.github.io/seiya-digital-atelier/contact/',
  },
};

const TEMPLATE_RESIDUE = [
  'Pulma', 'Irise Studio', 'Rosyid Qoim', 'Rosvid Qoim', 'qoim_h', 'qoim.h',
  'cal.com', 'framer.link', 'fpr=rosyid', 'irise.studio', 'rosyidqoim@gmail.com',
  'Creative Agency Template', 'Book a Call', 'Use for Free', 'X (Twitter)',
  'Made in Framer', 'Explore Mores', 'Web Decks Created', 'TRUSTED BY MANY',
];

test('every page entry carries personal, page-specific metadata', () => {
  for (const [file, expected] of Object.entries(PAGES)) {
    const html = fs.readFileSync(file, 'utf8');
    const head = html.slice(0, html.indexOf('</head>'));
    assert.ok(head.includes(`<title>${expected.title}</title>`), `${file} title`);
    assert.ok(head.includes(`rel="canonical" href="${expected.canonical}"`), `${file} canonical`);
    assert.ok(head.includes(`property="og:url" content="${expected.canonical}"`), `${file} og:url`);
    assert.ok(head.includes(`property="og:title" content="${expected.title}"`), `${file} og:title`);
    assert.ok(head.includes(`name="twitter:title" content="${expected.title}"`), `${file} twitter:title`);
    const description = head.match(/<meta name="description" content="([^"]*)"/);
    assert.ok(description && description[1].length > 40, `${file} description`);
    assert.ok(!/creative agenc/i.test(description[1]), `${file} description is template text`);
  }
});

test('raw HTML of every page entry is free of template identity and stale destinations', () => {
  for (const file of Object.keys(PAGES)) {
    const html = fs.readFileSync(file, 'utf8');
    const withoutScripts = html.replace(/<script\b[\s\S]*?<\/script>/g, ' ');
    // user-visible text and URL-bearing attributes only; Framer internal
    // layer names in data-framer-name attributes are not user-facing.
    const visibleText = withoutScripts.replace(/<[^>]+>/g, ' ');
    const urlAttrs = [...withoutScripts.matchAll(/(?:href|src|srcset|content)="([^"]*)"/g)].map((m) => m[1]).join(' ');
    for (const residue of TEMPLATE_RESIDUE) {
      assert.ok(!visibleText.includes(residue), `${file} visible text still contains ${residue}`);
      assert.ok(!urlAttrs.includes(residue), `${file} URL attribute still contains ${residue}`);
    }
  }
});

test('runtime hydration modules are free of stale personal/template destinations', () => {
  const base = 'assets/main/framerusercontent.com/sites/hIdrDQgPXvkQavctGDYT2/';
  const modules = [
    'script_main.DKBLZ27L.mjs',
    'shared-lib.BwxxUnaM.mjs',
    'BeGdglP9ONFGrp64ZAVgYMyvX5O4CfgohmQFpj6GBV0.DHZ6EPI0.mjs',
    'HGyMz7l0pfDnDfC07YOKKEEK_NLUtFk3mJsFRT_9JmQ.CMKP9VEe.mjs',
    'D3pBue8rjSUsmkKxkqlszUgYNMf9HDYG4odAnqDJJ5Q.BUoPxjnS.mjs',
  ];
  const stale = ['cal.com', 'framer.link', 'rosyidqoim', 'irise.studio', 'qoim_h', 'qoim.h', 'fpr=rosyid', 'TRUSTED BY MANY', 'Web Decks Created'];
  for (const module of modules) {
    const src = fs.readFileSync(base + module, 'utf8');
    for (const residue of stale) {
      assert.ok(!src.includes(residue), `${module} still contains ${residue}`);
    }
  }
});

// Semantic residue classes: fabricated people/clients, fake metrics, agency
// pricing/engagement language, and template legal pages. Kept specific so
// legitimate personal-site wording is never blocked.
const FABRICATION_RESIDUE = {
  'fake client/company': ['Vireon Labs', 'Northlane Studio', 'Nova Studio', 'Meridian Health', 'Solvian Tech', 'Brightform Co.', 'NexaTech'],
  'fake team member or testimonial persona': ['Noah Carter', 'Lucas Reed', 'Samantha', 'Ethan Walker', 'Olivia Bennett', 'Founder at', 'A small team, working with focus and care.', 'Our Team'],
  'unsupported metric or achievement': ['+200', 'Web Decks Created', 'On-time delivery', 'Returning clients', 'Completed projects', 'Faster launch', 'Trusted by many', 'Trusted by teams'],
  'agency pricing / engagement language': ['monthly engagement', 'billed', 'yearly commitment', 'non-refundable', 'Flexible engagement', 'monthly plan', 'pricing work', 'request revisions'],
  'template legal page text': ['Terms of Service', 'Privacy Policy', 'Scope of Services', 'Payment Terms', 'Last updated at'],
  'template footer label': ['Made in'],
  'agency tone placeholder': ['Tell us about your project'],
  'template identity / CTA': ['Pulma', 'Irise Studio', 'Rosyid', 'Book a Call', 'Use for Free', 'Explore Mores'],
};

test('search index only indexes real routes with truthful content', () => {
  const path = 'assets/main/framerusercontent.com/sites/hIdrDQgPXvkQavctGDYT2/searchIndex-p6aWceYkpyqP.json';
  const index = JSON.parse(fs.readFileSync(path, 'utf8'));
  // only routes that actually exist and are publicly reachable may be indexed
  const allowedRoutes = ['/', '/work', '/about', '/contact'];
  for (const route of Object.keys(index)) {
    assert.ok(allowedRoutes.includes(route), `search index indexes non-existent route ${route}`);
  }
  for (const [route, entry] of Object.entries(index)) {
    const fields = ['title', 'description', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p'];
    const content = fields.map((f) => Array.isArray(entry[f]) ? entry[f].join(' ') : entry[f] ?? '').join(' ');
    for (const [category, phrases] of Object.entries(FABRICATION_RESIDUE)) {
      for (const phrase of phrases) {
        assert.ok(!content.includes(phrase), `search index ${route} contains ${category}: ${phrase}`);
      }
    }
  }
});

test('raw page text of every entry is free of fabricated content classes', () => {
  for (const file of Object.keys(PAGES)) {
    const html = fs.readFileSync(file, 'utf8')
      .replace(/<script\b[\s\S]*?<\/script>/g, ' ')
      .replace(/<style\b[\s\S]*?<\/style>/g, ' ');
    const visibleText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    for (const [category, phrases] of Object.entries(FABRICATION_RESIDUE)) {
      for (const phrase of phrases) {
        assert.ok(!visibleText.includes(phrase), `${file} visible text contains ${category}: ${phrase}`);
      }
    }
  }
});

test('asset references in page HTML and per-page modules are prefix-safe', () => {
  // srcset candidates and hydration data must use page-relative paths so the
  // browser never requests unprefixed /assets/... on GitHub Pages.
  for (const file of Object.keys(PAGES)) {
    const html = fs.readFileSync(file, 'utf8');
    const srcsets = [...html.matchAll(/(?:src|srcset|imagesrcset)="([^"]*)"/g)].map((m) => m[1]);
    for (const value of srcsets) {
      assert.ok(!/(?:^|[\s,])\/assets\//.test(value), `${file} srcset contains an absolute /assets/ candidate`);
    }
    const handover = html.match(/<script type="framer\/handover"[^>]*>([\s\S]*?)<\/script>/);
    if (handover) {
      assert.ok(!handover[1].includes('"/assets/main/'), `${file} handover data contains absolute /assets/main/ paths`);
    }
  }
  const base = 'assets/main/framerusercontent.com/sites/hIdrDQgPXvkQavctGDYT2/';
  const perPageModules = [
    '5Be2aL3z8dyEFRv_th7XZxGK8Sv-RbSd9MIId_8rhb4.B6FlxEEx.mjs',
    'HGyMz7l0pfDnDfC07YOKKEEK_NLUtFk3mJsFRT_9JmQ.CMKP9VEe.mjs',
  ];
  // the shared Lenis module injects its stylesheet link at runtime; its href
  // must compute the project prefix instead of using an absolute path
  const lenis = fs.readFileSync(base + 'Lenis.CyUs5A_2.mjs', 'utf8');
  assert.ok(!lenis.includes('href:`/assets/main/'), 'Lenis module injects an absolute stylesheet href');
  assert.ok(lenis.includes('seiya-digital-atelier'), 'Lenis module lost its prefix computation');
  for (const module of perPageModules) {
    const src = fs.readFileSync(base + module, 'utf8');
    assert.ok(!src.includes("url('/assets/main/"), `${module} contains an absolute CSS mask url`);
  }
});

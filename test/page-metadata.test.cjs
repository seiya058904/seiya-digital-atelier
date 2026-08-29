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

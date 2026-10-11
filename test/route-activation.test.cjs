// AT-01 regression: link activation must respect unmodified primary-button
// clicks and keyboard Enter only; right/middle buttons and modifier clicks
// belong to the browser. Events are dispatched to the real registered handlers.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');

class Element {
  constructor(attributes = {}) { this.attributes = { ...attributes }; this.dataset = {}; }
  getAttribute(name) { return this.attributes[name] ?? null; }
  setAttribute(name, value) { this.attributes[name] = String(value); }
  removeAttribute(name) { delete this.attributes[name]; }
  querySelectorAll() { return []; }
  closest(selector) { return this; } // events target the anchor itself
}

const load = (environment) => {
  const listeners = {};
  const document = {
    baseURI: environment.baseURI,
    documentElement: new Element(),
    addEventListener(type, handler) { (listeners[type] = listeners[type] || []).push(handler); },
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    createElement: () => new Element(),
    head: new Element(),
  };
  const assigned = [];
  const context = {
    document,
    location: environment.location,
    window: { location: { assign: (url) => assigned.push(url) }, sessionStorage: { setItem() {} } },
    globalThis: {},
    Element,
    HTMLLinkElement: Element,
    HTMLAnchorElement: Element,
    MutationObserver: class { observe() {} },
    URL,
    FormData: class {},
  };
  vm.runInNewContext(fs.readFileSync('route-links.js', 'utf8'), context);
  return {
    api: context.globalThis.SeiyaRouteLinks,
    assigned,
    dispatch(type, event) {
      event.type = type;
      event.preventDefault = event.preventDefault || (() => { event.defaultPrevented = true; });
      event.stopImmediatePropagation = event.stopImmediatePropagation || (() => { event.immediateStopped = true; });
      (listeners[type] || []).forEach((handler) => handler(event));
    },
  };
};

const pagesEnv = () => ({
  baseURI: 'https://seiya058904.github.io/seiya-digital-atelier/',
  location: { hostname: 'seiya058904.github.io', pathname: '/seiya-digital-atelier/', href: 'https://seiya058904.github.io/seiya-digital-atelier/', origin: 'https://seiya058904.github.io' },
});

const anchor = (href, label = 'Work', attributes = {}) => {
  const link = new Element({ href, ...attributes });
  link.textContent = '';
  Object.defineProperty(link, 'textContent', { value: label });
  return link;
};

const activation = (link, overrides = {}) => ({
  target: link, button: 0, detail: 1, ctrlKey: false, metaKey: false, shiftKey: false, altKey: false, key: '', ...overrides,
});

test('plain left click and keyboard Enter still navigate exactly once', () => {
  const env = pagesEnv();
  const home = load(env);
  const homeLink = anchor('/#hero', 'Home');
  home.dispatch('click', activation(homeLink));
  home.dispatch('keydown', activation(homeLink, { key: 'Enter', button: 0, detail: 0 }));
  assert.deepEqual(home.assigned, ['/seiya-digital-atelier/#hero', '/seiya-digital-atelier/#hero']);

  const work = load(pagesEnv());
  work.dispatch('click', activation(anchor('/work/')));
  assert.deepEqual(work.assigned, ['/seiya-digital-atelier/work/']);
});

test('right and middle pointerdown never navigate the current tab', () => {
  const env = pagesEnv();
  const app = load(env);
  const homeLink = anchor('/#hero', 'Home');
  app.dispatch('pointerdown', { target: homeLink, button: 2, pointerType: 'mouse' });
  app.dispatch('pointerdown', { target: homeLink, button: 1, pointerType: 'mouse' });
  assert.deepEqual(app.assigned, [], 'pointerdown with non-primary buttons must not assign');

  const work = load(pagesEnv());
  work.dispatch('pointerdown', { target: anchor('/work/'), button: 2 });
  work.dispatch('pointerdown', { target: anchor('/work/'), button: 1 });
  assert.deepEqual(work.assigned, []);
});

test('modifier clicks keep native browser semantics (no current-tab navigation)', () => {
  for (const modifiers of [
    { ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true },
  ]) {
    const env = pagesEnv();
    const app = load(env);
    app.dispatch('click', activation(anchor('/#hero', 'Home'), modifiers));
    app.dispatch('click', activation(anchor('/work/'), modifiers));
    app.dispatch('keydown', activation(anchor('/#hero', 'Home'), { ...modifiers, key: 'Enter' }));
    assert.deepEqual(app.assigned, [], `modifiers ${JSON.stringify(modifiers)} must stay native`);
  }
});

test('middle-button auxclick does not navigate the current tab', () => {
  const env = pagesEnv();
  const app = load(env);
  app.dispatch('auxclick', activation(anchor('/about/'), { button: 1 }));
  app.dispatch('auxclick', activation(anchor('/#hero', 'Home'), { button: 1 }));
  assert.deepEqual(app.assigned, []);
});

test('pointerdown press without a completed click never navigates', () => {
  const env = pagesEnv();
  const app = load(env);
  app.dispatch('pointerdown', { target: anchor('/#hero', 'Home'), button: 0, pointerType: 'mouse' });
  assert.deepEqual(app.assigned, [], 'left-button pointerdown alone must not assign before the click completes');
});

test('external links and dangerous protocols stay blocked on plain clicks', () => {
  const env = pagesEnv();
  const app = load(env);
  const external = anchor('https://example.com/x');
  const event = activation(external);
  app.dispatch('click', event);
  assert.equal(event.defaultPrevented, true, 'plain click on external link must be prevented');
  assert.equal(app.assigned.length, 0);
});

// AT-01 round 2: anchors carrying native special navigation semantics
// (non-default target, download attribute) belong to the browser — the
// capture-phase takeover must never force them into current-tab navigation.
const activationRoutes = [
  ['/#hero', 'Home', '/seiya-digital-atelier/#hero'],
  ['/work/', 'Work', '/seiya-digital-atelier/work/'],
  ['/about/', 'About', '/seiya-digital-atelier/about/'],
  ['/contact/', 'Contact', '/seiya-digital-atelier/contact/'],
];

test('plain and explicit _self activations navigate every route in the current tab', () => {
  for (const [href, label, expected] of activationRoutes) {
    for (const attributes of [{}, { target: '_self' }]) {
      const app = load(pagesEnv());
      const event = activation(anchor(href, label, attributes));
      app.dispatch('click', event);
      assert.deepEqual(app.assigned, [expected], `${href} ${JSON.stringify(attributes)} must assign ${expected}`);
      assert.equal(event.defaultPrevented, true, `${href} ${JSON.stringify(attributes)} is a custom takeover`);
    }
  }
});

test('non-default targets keep native semantics on every route (no takeover)', () => {
  for (const [href, label] of activationRoutes) {
    for (const target of ['_blank', '_parent', '_top', 'framer-canvas']) {
      const app = load(pagesEnv());
      const event = activation(anchor(href, label, { target }));
      app.dispatch('click', event);
      assert.deepEqual(app.assigned, [], `target=${target} on ${href} must not navigate the current tab`);
      assert.ok(event.defaultPrevented !== true, `target=${target} on ${href} must keep the native default action`);
    }
  }
});

test('download attribute presence (empty or named) keeps native semantics', () => {
  for (const [href, label] of activationRoutes) {
    for (const download of ['', 'portfolio-2026.pdf']) {
      const app = load(pagesEnv());
      const event = activation(anchor(href, label, { download }));
      app.dispatch('click', event);
      assert.deepEqual(app.assigned, [], `download=${JSON.stringify(download)} on ${href} must not navigate the current tab`);
      assert.ok(event.defaultPrevented !== true, `download=${JSON.stringify(download)} on ${href} must keep the native default action`);
    }
  }
  // keyboard Enter on a download link also stays native
  const app = load(pagesEnv());
  const event = activation(anchor('/work/', 'Work', { download: '' }), { key: 'Enter', button: 0, detail: 0 });
  app.dispatch('keydown', event);
  assert.deepEqual(app.assigned, [], 'Enter on a download link must not navigate the current tab');
  assert.ok(event.defaultPrevented !== true, 'Enter on a download link must keep the native default action');
});

test('external links stay blocked regardless of target or download attributes', () => {
  for (const attributes of [{ target: '_blank' }, { download: '' }]) {
    const app = load(pagesEnv());
    const event = activation(anchor('https://example.com/x', 'Work', attributes));
    app.dispatch('click', event);
    assert.equal(event.defaultPrevented, true, `external link ${JSON.stringify(attributes)} must stay blocked`);
    assert.deepEqual(app.assigned, [], `external link ${JSON.stringify(attributes)} must not navigate`);
  }
});

test('an activation already consumed by another handler is never preempted (F-4)', () => {
  const env = pagesEnv();
  const app = load(env);
  // another capture-phase handler legitimately consumed these events first
  const consume = (event) => { event.preventDefault = () => { event.defaultPrevented = true; }; event.preventDefault(); };
  const homeClick = activation(anchor('/#hero', 'Home'));
  consume(homeClick);
  app.dispatch('click', homeClick);
  const workClick = activation(anchor('/work/'));
  consume(workClick);
  app.dispatch('click', workClick);
  assert.deepEqual(app.assigned, [], 'prevented clicks must not trigger custom navigation');

  const enterKey = activation(anchor('/#hero', 'Home'), { key: 'Enter', button: 0, detail: 0 });
  consume(enterKey);
  app.dispatch('keydown', enterKey);
  assert.deepEqual(app.assigned, [], 'prevented Enter keydown must not trigger custom navigation');

  // an unconsumed event still navigates (control)
  app.dispatch('click', activation(anchor('/#hero', 'Home')));
  assert.deepEqual(app.assigned, ['/seiya-digital-atelier/#hero'], 'unconsumed clicks still navigate');
});

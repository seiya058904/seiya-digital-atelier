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
  closest() { return null; }
}
class HTMLLinkElement extends Element {}
class HTMLAnchorElement extends Element {}

const load = (environment) => {
  const listeners = {};
  const document = {
    baseURI: environment.baseURI,
    documentElement: new Element(),
    addEventListener(type) { listeners[type] = (listeners[type] || 0) + 1; },
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    createElement: () => new Element(),
    head: new Element(),
  };
  const context = {
    document,
    location: environment.location,
    window: { location: { assign() {} }, sessionStorage: { setItem() {} } },
    globalThis: {},
    Element,
    HTMLLinkElement,
    HTMLAnchorElement,
    MutationObserver: class { observe() {} },
    URL,
    FormData: class {},
  };
  vm.runInNewContext(fs.readFileSync('route-links.js', 'utf8'), context);
  return context.globalThis.SeiyaRouteLinks;
};

test('routeTarget maps routes under both localhost and the GitHub Pages prefix', () => {
  const api = load({
    baseURI: 'https://seiya058904.github.io/seiya-digital-atelier/work/',
    location: { hostname: 'seiya058904.github.io', pathname: '/seiya-digital-atelier/work/', href: 'https://seiya058904.github.io/seiya-digital-atelier/work/', origin: 'https://seiya058904.github.io' },
  });
  const prefix = '/seiya-digital-atelier';
  assert.equal(api.routeTarget('/work'), `${prefix}/work/`);
  assert.equal(api.routeTarget('/work/'), `${prefix}/work/`);
  assert.equal(api.routeTarget('./about'), `${prefix}/about/`);
  assert.equal(api.routeTarget('../contact/'), `${prefix}/contact/`);
  assert.equal(api.routeTarget('/#hero'), `${prefix}/#hero`);
  assert.equal(api.routeTarget('./#hero'), `${prefix}/#hero`);
  assert.equal(api.routeTarget('/'), `${prefix}/#hero`);
  assert.equal(api.routeTarget('/work/nadina'), null);
  assert.equal(api.routeTarget('https://example.com/x'), null);
});

test('sitePath prefixes absolute paths only, and never double-prefixes', () => {
  const api = load({
    baseURI: 'https://seiya058904.github.io/seiya-digital-atelier/',
    location: { hostname: 'seiya058904.github.io', pathname: '/seiya-digital-atelier/', href: 'https://seiya058904.github.io/seiya-digital-atelier/', origin: 'https://seiya058904.github.io' },
  });
  assert.equal(api.sitePath('/work/'), '/seiya-digital-atelier/work/');
  assert.equal(api.sitePath('/seiya-digital-atelier/work/'), '/seiya-digital-atelier/work/');
  assert.equal(api.sitePath('work/'), '/seiya-digital-atelier/work/');
});

test('localhost keeps unprefixed routes', () => {
  const api = load({
    baseURI: 'http://127.0.0.1:8787/',
    location: { hostname: '127.0.0.1', pathname: '/', href: 'http://127.0.0.1:8787/', origin: 'http://127.0.0.1:8787' },
  });
  assert.equal(api.sitePath('/work/'), '/work/');
  assert.equal(api.routeTarget('/work'), '/work/');
  // without prefix signals (localhost root), prefixed paths are left alone
  assert.equal(api.normalizePath('/seiya-digital-atelier/work/'), '/seiya-digital-atelier/work');
});

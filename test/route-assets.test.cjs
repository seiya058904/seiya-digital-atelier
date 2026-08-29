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

test('prefixes every srcset candidate and hydrated stylesheet asset', () => {
  const image = new Element({ srcset: '/assets/one.webp 512w,/assets/two.webp 1024w, /assets/three.webp 2048w' });
  const stylesheet = new HTMLLinkElement({ href: '/assets/main/unpkg.com/lenis@1.3.23/dist/lenis.css' });
  const document = {
    baseURI: 'https://seiya058904.github.io/seiya-digital-atelier/work/',
    documentElement: new Element(),
    addEventListener() {},
    querySelector() { return null; },
    getElementById() { return null; },
    querySelectorAll(selector) {
      return selector === '[src], [srcset], [poster], link[href]' ? [image, stylesheet] : [];
    },
  };
  class MutationObserver { constructor() {} observe() {} }
  vm.runInNewContext(fs.readFileSync('route-links.js', 'utf8'), {
    document,
    location: { hostname: 'seiya058904.github.io', pathname: '/seiya-digital-atelier/work/', href: document.baseURI, origin: 'https://seiya058904.github.io' },
    window: { location: { assign() {} }, sessionStorage: { setItem() {} } },
    globalThis: {},
    Element,
    HTMLLinkElement,
    MutationObserver,
    URL,
    FormData,
  });
  assert.equal(image.getAttribute('srcset'), '/seiya-digital-atelier/assets/one.webp 512w,/seiya-digital-atelier/assets/two.webp 1024w, /seiya-digital-atelier/assets/three.webp 2048w');
  assert.equal(stylesheet.getAttribute('href'), '/seiya-digital-atelier/assets/main/unpkg.com/lenis@1.3.23/dist/lenis.css');
});

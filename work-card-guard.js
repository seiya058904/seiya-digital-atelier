(() => {
  const slugs = new Set(['nadina', 'halo-form', 'verdan-core', 'arcwell', 'lumen-grid', 'nova-atlas']);
  const getWorkCardSlug = (value, base = globalThis.document?.baseURI || globalThis.location?.href) => {
    if (!value || !base) return null;
    let url;
    try {
      url = new URL(value, base);
    } catch {
      return null;
    }
    if (globalThis.location?.origin && url.origin !== globalThis.location.origin) return null;
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts[0] === 'seiya-digital-atelier') parts.shift();
    const slug = parts.at(-1)?.toLowerCase();
    if (!slugs.has(slug)) return null;
    const workPath = parts.length === 2 && parts[0] === 'work';
    const doubledWorkPath = parts.length === 3 && parts[0] === 'work' && parts[1] === 'work';
    const sourcePath = parts.length === 3 && parts[0] === 'source' && parts[1] === 'works';
    return workPath || doubledWorkPath || sourcePath ? slug : null;
  };
  const disable = (link) => {
    if (!(link instanceof HTMLAnchorElement) || !getWorkCardSlug(link.getAttribute('href'))) return;
    link.removeAttribute('href');
    link.removeAttribute('target');
    link.removeAttribute('rel');
    link.dataset.navigationDisabled = 'true';
  };
  const process = (root = document) => {
    if (root instanceof HTMLAnchorElement) disable(root);
    root.querySelectorAll?.('a[href]').forEach(disable);
    root.querySelectorAll?.('*').forEach((node) => {
      if (node.shadowRoot) process(node.shadowRoot);
    });
  };
  const block = (event) => {
    if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) return;
    if (!event.composedPath().some((node) => node instanceof Element && node.dataset.navigationDisabled === 'true')) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  };
  const install = () => {
    process();
    ['pointerdown', 'pointerup', 'click', 'auxclick', 'keydown'].forEach((type) => document.addEventListener(type, block, true));
    new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes') process(mutation.target);
        mutation.addedNodes.forEach(process);
      });
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['href', 'target', 'rel'],
      childList: true,
      subtree: true,
    });
  };
  globalThis.SeiyaWorkCardGuard = { getWorkCardSlug, process };
  if (globalThis.document) {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
    else install();
  }
  if (typeof module !== 'undefined') module.exports = { getWorkCardSlug };
})();

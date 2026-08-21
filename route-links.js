(() => {
  const isExternal = (value) => {
    if (!value || /^(data:|blob:|javascript:|#)/i.test(value)) return false;
    if (/^(mailto:|tel:|sms:|discord:|intent:)/i.test(value)) return true;
    try {
      const url = new URL(value, document.baseURI || location.href);
      return /^https?:$/i.test(url.protocol) && url.origin !== location.origin;
    } catch {
      return false;
    }
  };
  const disable = (root = document) => {
    root.querySelectorAll?.('a[href], area[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!isExternal(href)) return;
      link.dataset.externalUrl = href;
      link.removeAttribute('href');
      link.removeAttribute('target');
    });
  };
  const block = (event) => {
    if (event.type === 'keydown' && event.key !== 'Enter') return;
    const link = event.target instanceof Element
      ? event.target.closest('a[href], area[href]')
      : null;
    if (link && isExternal(link.getAttribute('href'))) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };
  document.addEventListener('click', block, true);
  document.addEventListener('auxclick', block, true);
  document.addEventListener('keydown', block, true);
  const returnHome = (event) => {
    if (event.type === 'keydown' && event.key !== 'Enter') return;
    const link = event.target instanceof Element
      ? event.target.closest('a[href]')
      : null;
    if (!link || link.textContent.trim() !== 'Seiya') return;
    const url = new URL(link.getAttribute('href'), document.baseURI || location.href);
    if (url.hash !== '#hero') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.assign('/?from=route-logo#hero');
  };
  document.addEventListener('pointerdown', returnHome, true);
  document.addEventListener('pointerup', returnHome, true);
  document.addEventListener('click', returnHome, true);
  document.addEventListener('keydown', returnHome, true);
  disable();
  new MutationObserver(() => disable()).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['href', 'target'],
    childList: true,
    subtree: true,
  });
})();

(() => {
  const projectPrefix = location.hostname === 'seiya058904.github.io'
    || location.pathname === '/seiya-digital-atelier'
    || location.pathname.startsWith('/seiya-digital-atelier/')
    ? '/seiya-digital-atelier'
    : '';
  const sitePath = (path) => {
    if (!projectPrefix) return path;
    if (path === projectPrefix || path.startsWith(`${projectPrefix}/`)) return path;
    return `${projectPrefix}${path.startsWith('/') ? path : `/${path}`}`;
  };
  const routes = Object.freeze({
    home: sitePath('/#hero'),
    work: sitePath('/work/'),
    about: sitePath('/about/'),
    contact: sitePath('/contact/'),
  });
  const routePath = () => {
    const path = location.pathname.replace(/\/+$/, '') || '/';
    return projectPrefix && (path === projectPrefix || path.startsWith(`${projectPrefix}/`))
      ? path.slice(projectPrefix.length) || '/'
      : path;
  };
  const currentRoute = routePath;
  const normalizePath = (value) => {
    const path = new URL(value, document.baseURI || location.href).pathname.replace(/\/+$/, '') || '/';
    return projectPrefix && (path === projectPrefix || path.startsWith(`${projectPrefix}/`))
      ? path.slice(projectPrefix.length) || '/'
      : path;
  };
  const routeTarget = (value) => {
    const raw = String(value || '').trim();
    const rawPath = raw.split('#')[0];
    const withoutHash = rawPath.replace(/\/+$/, '');
    const hash = raw.includes('#') ? raw.slice(raw.indexOf('#')) : '';
    const isRelativeHome = !rawPath || /^(?:\.\.\/|\.\/)+$/.test(rawPath) || rawPath === '..' || rawPath === '.';
    if (hash === '#hero' && isRelativeHome) return routes.home;
    if (isRelativeHome) return null;
    const token = withoutHash.replace(/^(?:\.\.\/|\.\/|\/)+/, '').replace(/\/+$/, '');
    if (token === 'work') return routes.work;
    if (token === 'about') return routes.about;
    if (token === 'contact') return routes.contact;
    try {
      const path = normalizePath(raw);
      return path === '/' ? routes.home
        : path === '/work' ? routes.work
        : path === '/about' ? routes.about
        : path === '/contact' ? routes.contact
        : null;
    } catch {
      return null;
    }
  };
  const normalizeSiteLinks = () => {
    document.querySelectorAll('a[href], area[href]').forEach((link) => {
      const target = routeTarget(link.getAttribute('href'));
      if (target && link.getAttribute('href') !== target) link.setAttribute('href', target);
    });
  };
  const isExternal = (value) => {
    if (!value || /^(data:|blob:|javascript:|#|mailto:|tel:|sms:)/i.test(value)) return false;
    if (/^(discord:|intent:)/i.test(value)) return true;
    try {
      const url = new URL(value, document.baseURI || location.href);
      return /^https?:$/i.test(url.protocol) && url.origin !== location.origin;
    } catch {
      return false;
    }
  };
  const disable = (root = document) => {
    root.querySelectorAll?.('a[href], area[href]').forEach((link) => {
      if (link.dataset.allowExternal === 'true') return;
      const href = link.getAttribute('href');
      if (!isExternal(href)) return;
      link.dataset.externalUrl = href;
      link.removeAttribute('href');
      link.removeAttribute('target');
    });
  };
  const disableProjectCardLinks = () => globalThis.SeiyaWorkCardGuard?.process();
  // Footer link lists are re-bound at hydration from Framer's embedded CMS
  // data, so their destinations cannot be fixed in the raw HTML alone. Labels
  // are already personal in the raw HTML; re-point destinations by exact label.
  const footerTargets = () => {
    const targets = new Map([
      ['GitHub', 'https://github.com/seiya058904/seiya-digital-atelier'],
      ['Email', 'mailto:sunmengsaiyi@gmail.com'],
      ['Get in Touch', 'mailto:sunmengsaiyi@gmail.com'],
      ['View Projects', routes.work],
      ['Visual Archive', routes.work],
      ['Explorations', routes.about],
      ['How I Build', routes.about],
      ['Questions', routes.contact],
      // the two legal links are CMS-driven: Framer re-renders their labels and
      // destinations from the embedded collection after hydration
      ['Privacy Policy', 'https://github.com/seiya058904/seiya-digital-atelier'],
      ['Terms of Service', 'mailto:sunmengsaiyi@gmail.com'],
    ]);
    const relabel = new Map([
      ['Privacy Policy', 'GitHub'],
      ['Terms of Service', 'Email'],
    ]);
    document.querySelectorAll('footer a').forEach((link) => {
      if (link.dataset.navigationDisabled === 'true') return;
      const label = link.textContent.trim();
      let target = null;
      let isConfigured = false;
      for (const [key, value] of targets) {
        // hover variants render the label text twice inside one anchor
        if (label === key || label === key + key || (key === 'View Projects' && label.startsWith(key))) {
          target = value;
          isConfigured = key !== 'View Projects';
          break;
        }
      }
      if (!target && label === 'Seiya') {
        const href = link.getAttribute('href') || '';
        target = href.includes('#hero') ? null : routes.about;
      }
      if (!target) return;
      if (link.getAttribute('href') !== target) link.setAttribute('href', target);
      if (isConfigured) link.dataset.allowExternal = 'true';
      const nextLabel = relabel.get(label);
      if (nextLabel) {
        const rich = link.querySelector('p, [data-framer-component-type="RichTextContainer"]');
        if (rich) rich.textContent = nextLabel;
        else link.textContent = nextLabel;
      }
    });
  };
  const goHome = (event) => {
    event.preventDefault();
    event.stopImmediatePropagation();
    try { sessionStorage.setItem('seiya-home-transition', '1'); } catch {}
    window.location.assign(routes.home);
  };
  const isHomeLink = (link) => link.textContent.trim() === 'Home' || routeTarget(link.getAttribute('href')) === routes.home;

  // Single capture-phase dispatcher for every light-DOM navigation concern:
  // home/logo navigation, internal route normalization, and external blocking.
  const handleActivation = (event) => {
    if (event.type === 'keydown' && event.key !== 'Enter') return;
    const link = event.target instanceof Element ? event.target.closest('a[href], area[href]') : null;
    if (!link || link.dataset.navigationDisabled === 'true') return;
    if (link.dataset.allowExternal === 'true') return;
    const href = link.getAttribute('href');
    if (event.type !== 'auxclick' && isHomeLink(link)) {
      goHome(event);
      return;
    }
    const path = normalizePath(href);
    if (['/work', '/about', '/contact'].includes(path)) {
      event.preventDefault();
      event.stopImmediatePropagation();
      window.location.assign(sitePath(`${path}/`));
      return;
    }
    if (isExternal(href)) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };
  const handlePointerDown = (event) => {
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link || link.dataset.navigationDisabled === 'true' || link.dataset.allowExternal === 'true') return;
    if (isHomeLink(link)) goHome(event);
  };
  document.addEventListener('pointerdown', handlePointerDown, true);
  document.addEventListener('click', handleActivation, true);
  document.addEventListener('auxclick', handleActivation, true);
  document.addEventListener('keydown', handleActivation, true);
  const openContactDraft = (event) => {
    if (currentRoute() !== '/contact' || !(event.target instanceof HTMLFormElement)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const data = new FormData(event.target);
    const body = ['Name', 'Email', 'Phone Number', 'Message']
      .map((field) => `${field}: ${data.get(field) || ''}`)
      .join('\n');
    const subject = encodeURIComponent('Website inquiry');
    window.location.href = `mailto:sunmengsaiyi@gmail.com?subject=${subject}&body=${encodeURIComponent(body)}`;
  };
  document.addEventListener('submit', openContactDraft, true);
  const applyAboutChanges = () => {
    if (currentRoute() !== '/about') return;
    if (document.getElementById('route-about-customizations')) return;
    const style = document.createElement('style');
    style.id = 'route-about-customizations';
    style.textContent = `
      [data-framer-name="Team"] { display: none !important; }
      @media (min-width: 810px) {
        [data-framer-name="Image Container"]:has(img[src*="aLIllYwlY5spWoij2YX9pjFYfqk_8318d33ca2.webp"]) {
          width: 80% !important;
          margin-inline: auto !important;
        }
      }
    `;
    document.head.append(style);
  };
  const applyWorkChanges = () => {
    if (currentRoute() !== '/work') return;
    const filters = document.querySelector('[data-framer-name="Header"] .framer-pxadms');
    if (!filters || filters.dataset.routeFilterHidden) return;
    const labels = ['All', 'Framer Dev', 'Product Design', 'Branding Design', 'Web Dev'];
    if (labels.every((label) => filters.textContent.includes(label))) {
      filters.dataset.routeFilterHidden = 'true';
      filters.style.display = 'none';
    }
  };
  // Hydration re-renders the page-level CTAs from Framer module data and can
  // reset their destinations; bind the two known CTA labels explicitly.
  const MAILTO = 'mailto:sunmengsaiyi@gmail.com';
  const bindCtas = () => {
    document.querySelectorAll('a').forEach((link) => {
      if (link.dataset.navigationDisabled === 'true' || link.closest('footer')) return;
      const label = link.textContent.trim();
      if (label.startsWith('View Projects')) {
        if (link.getAttribute('href') !== routes.work) link.setAttribute('href', routes.work);
        link.removeAttribute('data-external-url');
        return;
      }
      if (label.startsWith('Get in Touch') || label === 'Email Us' || label === 'Email UsEmail Us') {
        if (link.getAttribute('href') !== MAILTO) link.setAttribute('href', MAILTO);
        link.dataset.allowExternal = 'true';
        link.removeAttribute('data-external-url');
      }
    });
  };
  // Framer renders its FAQ accordions as focusable plain divs with no button
  // semantics and no keyboard activation (its tap handler listens for pointer
  // events). Enhance only those: a focusable div carrying both a question and
  // an answer — this excludes the hidden Work filter chips, which are short.
  const isFaqControl = (node) => {
    if (node.tagName !== 'DIV' || node.getAttribute('tabindex') !== '0') return false;
    return node.getBoundingClientRect().height >= 40 && node.textContent.trim().length > 40;
  };
  const syncFaqExpanded = (node) => {
    node.setAttribute('aria-expanded', node.getBoundingClientRect().height > 70 ? 'true' : 'false');
  };
  const applyFaqAccessibility = () => {
    document.querySelectorAll('div[tabindex="0"]').forEach((node) => {
      if (node.dataset.seiyaFaqControl === 'true' || !isFaqControl(node)) return;
      node.dataset.seiyaFaqControl = 'true';
      node.setAttribute('role', 'button');
      syncFaqExpanded(node);
      node.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        const rect = node.getBoundingClientRect();
        const options = {
          bubbles: true, cancelable: true, pointerId: 1, pointerType: 'mouse', isPrimary: true,
          clientX: rect.left + rect.width / 2, clientY: rect.top + rect.height / 2,
        };
        // Framer's tap detection responds to a pointerdown/pointerup pair,
        // not to synthetic clicks.
        node.dispatchEvent(new PointerEvent('pointerdown', options));
        node.dispatchEvent(new PointerEvent('pointerup', options));
        setTimeout(() => syncFaqExpanded(node), 450);
      });
      node.addEventListener('pointerup', () => {
        // the answer animates open/closed after the tap; sync once settled
        setTimeout(() => syncFaqExpanded(node), 450);
      });
    });
  };
  // The Framer runtime re-creates its "Made in Framer" badge after hydration;
  // the raw HTML removal cannot reach the injected copy.
  const removeFramerBadge = () => {
    document.getElementById('__framer-badge-container')?.remove();
  };
  const updateRoute = () => {
    normalizeSiteLinks();
    footerTargets();
    bindCtas();
    applyAboutChanges();
    applyWorkChanges();
    applyFaqAccessibility();
    removeFramerBadge();
    disable();
    disableProjectCardLinks();
  };
  const normalizeProjectAsset = (node) => {
    if (!projectPrefix) return;
    if (!(node instanceof Element)) return;
    for (const attribute of ['src', 'poster']) {
      const value = node.getAttribute(attribute);
      if (value?.startsWith('/assets/')) node.setAttribute(attribute, `${projectPrefix}${value}`);
    }
    const srcset = node.getAttribute('srcset');
    if (srcset) {
      const next = srcset.replace(/(^|[\s,])(\/assets\/)/g, `$1${projectPrefix}$2`);
      if (next !== srcset) node.setAttribute('srcset', next);
    }
    if (node instanceof HTMLLinkElement) {
      const href = node.getAttribute('href');
      if (href?.startsWith('/assets/')) node.setAttribute('href', `${projectPrefix}${href}`);
    }
  };
  const normalizeProjectAssets = (root = document) => {
    normalizeProjectAsset(root);
    root.querySelectorAll?.('[src], [srcset], [poster], link[href]').forEach(normalizeProjectAsset);
  };
  updateRoute();
  normalizeProjectAssets();
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes') normalizeProjectAsset(mutation.target);
      else mutation.addedNodes.forEach(normalizeProjectAssets);
    }
    updateRoute();
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['href', 'target', 'rel', 'src', 'srcset', 'poster'],
    childList: true,
    subtree: true,
  });
  globalThis.SeiyaRouteLinks = Object.freeze({ sitePath, routeTarget, normalizePath, isExternal, disable, routes });
  if (typeof module !== 'undefined') module.exports = { routeTarget, normalizePath, sitePath };
})();

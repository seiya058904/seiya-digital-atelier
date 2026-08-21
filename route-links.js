(() => {
  const projectPrefix = location.pathname === '/seiya-digital-atelier'
    || location.pathname.startsWith('/seiya-digital-atelier/')
    ? '/seiya-digital-atelier'
    : '';
  const workCacheVersion = '?v=e39bb71';
  const sitePath = (path) => {
    if (!projectPrefix) return path;
    const current = location.pathname.slice(projectPrefix.length);
    const base = current && current !== '/' ? '../' : './';
    return `${base}${path === '/' ? '' : path.slice(1)}`;
  };
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
  const routeInternalNavigation = (event) => {
    if (event.type === 'keydown' && event.key !== 'Enter') return;
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link || link.dataset.navigationDisabled === 'true') return;
    const path = normalizePath(link.getAttribute('href'));
    if (!['/work', '/about', '/contact'].includes(path)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const target = `${sitePath(`${path}/`)}${path === '/work' ? workCacheVersion : ''}`;
    window.location.assign(target);
  };
  document.addEventListener('click', routeInternalNavigation, true);
  document.addEventListener('auxclick', routeInternalNavigation, true);
  document.addEventListener('keydown', routeInternalNavigation, true);
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
      if (link.dataset.allowExternal === 'true') return;
      const href = link.getAttribute('href');
      if (!isExternal(href)) return;
      link.dataset.externalUrl = href;
      link.removeAttribute('href');
      link.removeAttribute('target');
    });
  };
  const isProjectCardNavigation = (value) => {
    if (!value) return false;
    try {
      const path = normalizePath(value);
      return /^\/work\/(nadina|halo-form|verdan-core|arcwell|lumen-grid|nova-atlas)$/i.test(path);
    } catch {
      return false;
    }
  };
  const disableProjectCardLinks = () => {
    document.querySelectorAll('a[href]').forEach((link) => {
      if (!isProjectCardNavigation(link.getAttribute('href'))) return;
      link.removeAttribute('href');
      link.removeAttribute('target');
      link.dataset.navigationDisabled = 'true';
    });
  };
  const blockProjectCardNavigation = (event) => {
    if (event.type === 'keydown' && !['Enter', ' '].includes(event.key)) return;
    const target = event.composedPath().find((node) =>
      node instanceof Element && node.dataset.navigationDisabled === 'true'
    );
    if (!target) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  };
  const redirectConfiguredLink = (event) => {
    if (event.type === 'keydown' && event.key !== 'Enter') return;
    const link = event.target instanceof Element
      ? event.target.closest('a[data-allow-external="true"]')
      : null;
    if (!link) return;
    const target = {
      GitHub: 'https://github.com/seiya058904/seiya-digital-atelier',
      Email: 'mailto:sunmengsaiyi@gmail.com',
    }[link.textContent.trim()];
    if (!target) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.assign(target);
  };
  const block = (event) => {
    if (event.type === 'keydown' && event.key !== 'Enter') return;
    const link = event.target instanceof Element
      ? event.target.closest('a[href], area[href]')
      : null;
    if (link?.dataset.allowExternal === 'true') return;
    if (link && isExternal(link.getAttribute('href'))) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };
  document.addEventListener('click', block, true);
  document.addEventListener('auxclick', block, true);
  document.addEventListener('keydown', block, true);
  document.addEventListener('click', blockProjectCardNavigation, true);
  document.addEventListener('auxclick', blockProjectCardNavigation, true);
  document.addEventListener('keydown', blockProjectCardNavigation, true);
  document.addEventListener('click', redirectConfiguredLink, true);
  document.addEventListener('auxclick', redirectConfiguredLink, true);
  document.addEventListener('keydown', redirectConfiguredLink, true);
  const returnHome = (event) => {
    if (event.type === 'keydown' && event.key !== 'Enter') return;
    const link = event.target instanceof Element
      ? event.target.closest('a[href]')
      : null;
    if (!link) return;
    if (link.textContent.trim() === 'Home') {
      event.preventDefault();
      event.stopImmediatePropagation();
      try { sessionStorage.setItem('seiya-home-transition', '1'); } catch {}
      window.location.assign(sitePath('/?from=route-home#hero'));
      return;
    }
    if (link.textContent.trim() !== 'Seiya') return;
    const url = new URL(link.getAttribute('href'), document.baseURI || location.href);
    if (url.hash !== '#hero') return;
    event.preventDefault();
    event.stopImmediatePropagation();
    try { sessionStorage.setItem('seiya-home-transition', '1'); } catch {}
    window.location.assign(sitePath('/?from=route-logo#hero'));
  };
  const installHomeGuards = () => {
    document.querySelectorAll('a[href]').forEach((link) => {
      const label = link.textContent.trim();
      const isHome = label === 'Home';
      const isLogo = label === 'Seiya' && new URL(link.getAttribute('href'), document.baseURI).hash === '#hero';
      if ((!isHome && !isLogo) || link.dataset.homeGuardInstalled === 'true') return;
      const target = isHome ? sitePath('/?from=route-home#hero') : sitePath('/?from=route-logo#hero');
      const forceNavigation = (event) => {
        if (event.type === 'keydown' && event.key !== 'Enter') return;
        event.preventDefault();
        event.stopImmediatePropagation();
        try { sessionStorage.setItem('seiya-home-transition', '1'); } catch {}
        window.location.assign(target);
      };
      link.addEventListener('pointerdown', forceNavigation, true);
      link.addEventListener('click', forceNavigation, true);
      link.addEventListener('keydown', forceNavigation, true);
      link.dataset.homeGuardInstalled = 'true';
    });
  };
  const leafNodes = (root) => [...root.querySelectorAll('*')]
    .filter((node) => node.children.length === 0 && node.textContent.trim());
  const replaceFooterText = (root, replacements) => {
    const map = new Map(replacements);
    leafNodes(root).forEach((node) => {
      const next = map.get(node.textContent.trim());
      if (next !== undefined) node.textContent = next;
    });
  };
  const normalizeFooter = () => {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const text = footer.textContent || '';
    const hasOldLayout = /Pulma|About Us|X \(Twitter\)|Linkedin|Instagram|Threads|Legal|Email Us/.test(text);
    const hasPrivacyLabels = /Privacy Policy|Terms of Service/.test(text);
    const hasTargetLabels = /GitHub|Email/.test(text);
    if (!hasOldLayout && !hasPrivacyLabels && !hasTargetLabels) return;
    const replacements = [
      ['Privacy Policy', 'GitHub'],
      ['Terms of Service', 'Email'],
    ];
    if (hasOldLayout) replacements.unshift(
      ['Pulma', 'Seiya'],
      ['clarity.', 'curiosity.'],
      ['Share your goals, and we’ll help shape the direction and guide your project forward with clarity and care.', 'Projects, ideas, experiments, and everything still in progress. This space will keep changing as I build and learn.'],
      ['Book a Call', 'View Projects'],
      ['Email Us', 'Get in Touch'],
      ['Work', 'Projects'],
      ['About Us', 'About Me'],
      ['Connect', 'Explore'],
      ['X (Twitter)', 'Visual Archive'],
      ['Linkedin', 'Explorations'],
      ['Instagram', 'How I Build'],
      ['Threads', 'Questions'],
      ['Legal', 'Connect'],
      ['©Irise Studio 2026. All rights reserved.', '© Seiya 2026. All rights reserved.'],
      ['Made in', 'Built with care'],
      ['Framer', 'Seiya'],
      ['Rosyid Qoim', 'Seiya'],
      ['Rosvid Qoim', 'Seiya'],
    );
    replaceFooterText(footer, replacements);
    const footerLinks = [...footer.querySelectorAll('a')];
    const paths = new Map([
      ['Home', sitePath('/?from=route-home#hero')],
      ['Projects', sitePath('/work/')],
      ['About Me', sitePath('/about/')],
      ['Contact', sitePath('/contact/')],
      ['GitHub', 'https://github.com/seiya058904/seiya-digital-atelier'],
      ['Email', 'mailto:sunmengsaiyi@gmail.com'],
    ]);
    footerLinks.forEach((link) => {
      const path = paths.get(link.textContent.trim());
      if (!path) return;
      if (link.getAttribute('href') !== path) link.setAttribute('href', path);
      if (/^(GitHub|Email)$/.test(link.textContent.trim())) link.dataset.allowExternal = 'true';
    });
  };
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
  document.addEventListener('pointerdown', returnHome, true);
  document.addEventListener('pointerup', returnHome, true);
  document.addEventListener('click', returnHome, true);
  document.addEventListener('keydown', returnHome, true);
  document.addEventListener('submit', openContactDraft, true);
  const updateRoute = () => {
    normalizeFooter();
    applyAboutChanges();
    applyWorkChanges();
    disable();
    disableProjectCardLinks();
    installHomeGuards();
  };
  updateRoute();
  new MutationObserver(updateRoute).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['href', 'target'],
    childList: true,
    subtree: true,
  });
})();

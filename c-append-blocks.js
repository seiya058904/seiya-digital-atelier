(async () => {
  'use strict';

  const projectPrefix = location.pathname === '/seiya-digital-atelier'
    || location.pathname.startsWith('/seiya-digital-atelier/')
    ? '/seiya-digital-atelier'
    : '';
  const repositoryPrefix = '/seiya-digital-atelier';
  const sitePath = (path) => {
    if (!projectPrefix) return path;
    if (path === projectPrefix || path.startsWith(`${projectPrefix}/`)) return path;
    return `${projectPrefix}${path.startsWith('/') ? path : `/${path}`}`;
  };

  const isExternalNavigation = (value) => {
    if (!value || /^(data:|blob:|javascript:|#)/i.test(value)) return false;
    if (/^(mailto:|tel:|sms:|discord:|intent:)/i.test(value)) return true;
    try {
      const url = new URL(value, document.baseURI || location.href);
      return /^https?:$/i.test(url.protocol) && url.origin !== location.origin;
    } catch {
      return false;
    }
  };
  const disableExternalLinks = (root = document) => {
    if (!root?.querySelectorAll) return;
    root.querySelectorAll('a[href], area[href]').forEach((link) => {
      if (link.dataset.allowExternal === 'true') return;
      const href = link.getAttribute('href');
      if (!isExternalNavigation(href)) return;
      link.dataset.externalUrl = href;
      link.removeAttribute('href');
      link.removeAttribute('target');
    });
    root.querySelectorAll('*').forEach((node) => {
      if (node.shadowRoot) disableExternalLinks(node.shadowRoot);
    });
  };
  const restoreSelectedWorkLinks = (root = document) => {
    if (!root?.querySelectorAll) return;
    const allowed = new Set([
      'https://github.com/seiya058904/Hardware-Monitoring',
      'https://seiya058904.github.io/seiya-digital-journal/',
      'https://seiya058904.github.io/INSTANCE/',
    ]);
    root.querySelectorAll('a[data-external-url]').forEach((link) => {
      const url = link.dataset.externalUrl;
      if (!allowed.has(url)) return;
      if (link.getAttribute('href') !== url) link.setAttribute('href', url);
      link.dataset.allowExternal = 'true';
    });
    root.querySelectorAll('*').forEach((node) => {
      if (node.shadowRoot) restoreSelectedWorkLinks(node.shadowRoot);
    });
  };
  const blockExternalNavigation = (event) => {
    if (event.type === 'keydown' && event.key !== 'Enter') return;
    const target = event.target instanceof Element
      ? event.target.closest('a[href], area[href]')
      : null;
    if (target?.dataset.allowExternal === 'true') return;
    if (!target || !isExternalNavigation(target.getAttribute('href'))) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  };
  const isProjectCardNavigation = (value) => {
    if (!value) return false;
    try {
      const path = new URL(value, document.baseURI || location.href).pathname
        .replace(projectPrefix, '').replace(/\/$/, '') || '/';
      return /^\/work\/(nadina|halo-form|verdan-core|arcwell|lumen-grid|nova-atlas)$/i.test(path)
        || /^\/source\/works(?:\/|$)/i.test(path);
    } catch {
      return false;
    }
  };
  const disableProjectCardLinks = (root = document) => {
    if (!root?.querySelectorAll) return;
    root.querySelectorAll('a[href]').forEach((link) => {
      if (!isProjectCardNavigation(link.getAttribute('href'))) return;
      link.removeAttribute('href');
      link.removeAttribute('target');
      link.removeAttribute('rel');
      link.dataset.navigationDisabled = 'true';
    });
    root.querySelectorAll('*').forEach((node) => {
      if (node.shadowRoot) disableProjectCardLinks(node.shadowRoot);
    });
  };
  const applyFooterTargets = () => {
    document.querySelectorAll('footer a').forEach((link) => {
      const label = link.textContent.trim();
      if (label === 'GitHub') {
        link.href = 'https://github.com/seiya058904/seiya-digital-atelier';
        link.dataset.allowExternal = 'true';
      }
      if (label === 'Email') {
        link.href = 'mailto:sunmengsaiyi@gmail.com';
        link.dataset.allowExternal = 'true';
      }
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
  document.addEventListener('click', blockExternalNavigation, true);
  document.addEventListener('auxclick', blockExternalNavigation, true);
  document.addEventListener('keydown', blockExternalNavigation, true);
  document.addEventListener('pointerdown', blockProjectCardNavigation, true);
  document.addEventListener('pointerup', blockProjectCardNavigation, true);
  document.addEventListener('click', blockProjectCardNavigation, true);
  document.addEventListener('auxclick', blockProjectCardNavigation, true);
  document.addEventListener('keydown', blockProjectCardNavigation, true);
  document.addEventListener('click', redirectConfiguredLink, true);
  document.addEventListener('auxclick', redirectConfiguredLink, true);
  document.addEventListener('keydown', redirectConfiguredLink, true);
  disableExternalLinks();
  restoreSelectedWorkLinks();
  disableProjectCardLinks();
  applyFooterTargets();
  new MutationObserver(() => {
    restoreSelectedWorkLinks();
    disableExternalLinks();
  }).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['href', 'target'],
    childList: true,
    subtree: true,
  });
  new MutationObserver(() => disableProjectCardLinks()).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['href', 'target'],
    childList: true,
    subtree: true,
  });
  new MutationObserver(() => applyFooterTargets()).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  const originalFetch = window.fetch.bind(window);
  const finishHomeTransition = () => {
    document.documentElement.classList.remove('seiya-home-pending');
    try { sessionStorage.removeItem('seiya-home-transition'); } catch {}
  };
  const sourceRoot = (key) => {
    const host = document.createElement('div');
    host.dataset.cSource = key;
    host.className = `c-source-host c-source-host-${key}`;
    host.style.display = 'block';
    const root = host.attachShadow({ mode: 'open' });
    return { host, root };
  };
  const specialUrl = (value) => /^(data:|blob:|mailto:|javascript:|#)/i.test(value);
  const localUrl = (value, base) => {
    const isRootPath = value.startsWith('/');
    const documentBase = document.baseURI || location.href;
    const pageBase = new URL('.', documentBase).pathname.replace(/\/$/, '');
    if (isRootPath && pageBase && (value === pageBase || value.startsWith(`${pageBase}/`))) return value;
    const normalizedValue = isRootPath && (value === repositoryPrefix || value.startsWith(`${repositoryPrefix}/`))
      ? value.slice(repositoryPrefix.length) || '/'
      : value;
    const candidate = isRootPath ? `.${normalizedValue}` : normalizedValue;
    const url = new URL(candidate, isRootPath ? documentBase : base);
    return `${url.pathname}${url.search}${url.hash}`;
  };
  const resolveUrl = (value, basePath, sourceHost) => {
    if (!value || specialUrl(value)) return value;
    const mapped = value
      .replaceAll('http://localhost:8776/_assets', sitePath('/assets/mirror-b'))
      .replaceAll('http://localhost:8775/_assets', sitePath('/assets/main'))
      .replaceAll('http://localhost:8776', sitePath('/assets/mirror-b'))
      .replaceAll('http://localhost:8775', sitePath('/assets/main'))
      .replaceAll('/assets/mirror-b/_assets', sitePath('/assets/mirror-b'))
      .replaceAll('/assets/main/_assets', sitePath('/assets/main'));
    if (/^https?:\/\//i.test(mapped)) {
      try {
        const url = new URL(mapped);
        return url.origin === location.origin ? `${url.pathname}${url.search}` : mapped;
      } catch {
        return mapped;
      }
    }
    try {
      const base = basePath && basePath !== '/'
        ? new URL(`${basePath.replace(/\/$/, '')}/`, document.baseURI || location.href)
        : (document.baseURI || location.href);
      return localUrl(mapped, base);
    } catch {
      return sourceHost ? `${sourceHost}/${mapped}` : mapped;
    }
  };
  const reviseG5ImageUrl = (value) => value.includes('G5V2BfFS1k2hTxiBqkphqzLkVNc') && !value.includes('asset-rev=')
    ? `${value}${value.includes('?') ? '&' : '?'}asset-rev=20260821-2`
    : value;
  const normalizeRepositoryPaths = (root = document) => {
    root.querySelectorAll?.('[src], [srcset], [poster]').forEach((element) => {
      for (const attribute of ['src', 'poster']) {
        const value = element.getAttribute(attribute);
        if (!value) continue;
        const next = projectPrefix
          ? (value.startsWith('/assets/') ? `${projectPrefix}${value}` : value)
          : value.startsWith(`${repositoryPrefix}/`) ? value.slice(repositoryPrefix.length) : value;
        if (next !== value) element.setAttribute(attribute, next);
      }
      const value = element.getAttribute('srcset');
      if (!value) return;
      const next = value.split(',').map((item) => {
        const [url, ...descriptor] = item.trim().split(/\s+/);
        const normalized = projectPrefix
          ? (url.startsWith('/assets/') ? `${projectPrefix}${url}` : url)
          : url.startsWith(`${repositoryPrefix}/`) ? url.slice(repositoryPrefix.length) : url;
        return [normalized, ...descriptor].join(' ');
      }).join(',');
      if (next !== value) element.setAttribute('srcset', next);
    });
  };
  const normalizeSiteLinks = (root = document) => {
    root.querySelectorAll?.('a[href], area[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || /^(https?:|mailto:|tel:|sms:|#|javascript:|data:|blob:)/i.test(href)) return;
      let path;
      try { path = new URL(href, document.baseURI || location.href).pathname; } catch { return; }
      const normalized = path.replace(projectPrefix, '').replace(/\/+$/, '') || '/';
      if (!['/', '/work', '/about', '/contact'].includes(normalized)) return;
      const suffix = href.includes('#') ? href.slice(href.indexOf('#')) : '';
      const target = normalized === '/' ? `/${suffix}` : `${normalized}/${suffix}`.replace(/\/\/$/, '/');
      const next = sitePath(target);
      if (href !== next) link.setAttribute('href', next);
    });
  };
  const routeInternalNavigation = (event) => {
    if (event.type === 'keydown' && event.key !== 'Enter') return;
    const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
    if (!link || link.dataset.navigationDisabled === 'true') return;
    let path;
    try { path = new URL(link.getAttribute('href'), document.baseURI || location.href).pathname; } catch { return; }
    const normalized = path.replace(projectPrefix, '').replace(/\/+$/, '') || '/';
    if (!['/work', '/about', '/contact'].includes(normalized)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.location.assign(sitePath(`${normalized}/`));
  };
  document.addEventListener('click', routeInternalNavigation, true);
  document.addEventListener('auxclick', routeInternalNavigation, true);
  document.addEventListener('keydown', routeInternalNavigation, true);
  const rewriteCss = (css, basePath) => css.replace(/url\(\s*(["']?)([^"')]+)\1\s*\)/gi, (match, quote, value) => {
    if (specialUrl(value)) return match;
    return `url("${resolveUrl(value, basePath)}")`;
  });
  const rewriteMedia = (root, basePath) => {
    root.querySelectorAll('[src], [srcset], [poster], [style], [href]').forEach((element) => {
      for (const attribute of ['src', 'poster', 'href']) {
        const value = element.getAttribute(attribute);
        if (value) element.setAttribute(attribute, reviseG5ImageUrl(resolveUrl(value, basePath)));
      }
      const style = element.getAttribute('style');
      if (style) element.setAttribute('style', rewriteCss(style, basePath));
      const srcset = element.getAttribute('srcset');
      if (srcset) {
        element.setAttribute('srcset', srcset.split(',').map((item) => {
          const [url, ...descriptor] = item.trim().split(/\s+/);
          return [reviseG5ImageUrl(resolveUrl(url, basePath)), ...descriptor].join(' ');
        }).join(', '));
      }
    });
  };
  const fetchSource = async (url) => {
    const response = await originalFetch(url);
    if (!response.ok) throw new Error(`Unable to load ${url} (${response.status})`);
    const documentSource = new DOMParser().parseFromString(await response.text(), 'text/html');
    const basePath = url.slice(0, url.lastIndexOf('/')) || '/';
    rewriteMedia(documentSource, basePath);
    return { document: documentSource, basePath };
  };
  const sourceStyles = async (source) => {
    const styles = [...source.document.head.querySelectorAll('style')]
      .map((node) => rewriteCss(node.textContent || '', source.basePath));
    for (const link of source.document.head.querySelectorAll('link[rel="stylesheet"]')) {
      const href = link.getAttribute('href');
      if (!href || /^https?:\/\//i.test(href)) continue;
      const response = await originalFetch(resolveUrl(href, source.basePath));
      if (response.ok) styles.push(rewriteCss(await response.text(), source.basePath));
    }
    return styles.join('\n');
  };
  const scopedShadowCss = (css) => css
    .replace(/(^|[{},]\s*)html\s*,\s*body\s*,\s*#main(?=\s*[{,])/gm, '$1:host')
    .replace(/(^|[{},]\s*)html\s+body(?=\s*[{,])/gm, '$1:host')
    .replace(/(^|[{},]\s*):root\s+body(?=\s*[{,])/gm, '$1:host')
    .replace(/(^|[{},]\s*)html(?=\s*[{,])/gm, '$1:host')
    .replace(/(^|[{},]\s*)body(?=\s*[{,])/gm, '$1:host')
    .replace(/(^|[{},]\s*)#main(?=\s*[{,])/gm, '$1:host')
    .replace(/(^|[{},]\s*):root(?=\s*[{,])/gm, '$1:host');
  const appendStyle = (root, css) => {
    const style = document.createElement('style');
    style.textContent = css;
    root.append(style);
  };
  const stablePlacements = [];
  const placeStableBlocks = () => {
    stablePlacements.forEach(({ node, selector }) => {
      const anchor = document.querySelector(`[data-framer-root] ${selector}`);
      if (!anchor || anchor.parentNode.contains(node)) return;
      anchor.parentNode.insertBefore(node, anchor);
    });
  };
  const insertBefore = (node, anchor) => {
    if (anchor?.closest?.('[data-framer-root]')) {
      const main = document.querySelector('#main');
      let mount = main?.querySelector(':scope > [data-c-stable-mount]');
      if (!mount && main) {
        mount = document.createElement('div');
        mount.dataset.cStableMount = 'true';
        main.append(mount);
      }
      if (mount) {
        mount.append(node);
        const selector = anchor.matches('main[data-framer-name="Main"]')
          ? 'main[data-framer-name="Main"]'
          : 'section[data-framer-name="How it Works"]';
        stablePlacements.push({ node, selector });
        return;
      }
    }
    const parent = anchor?.parentNode || document.body;
    parent.insertBefore(node, anchor || null);
  };
  const waitForMirrorARuntime = async () => {
    const main = document.querySelector('#main');
    const initialRoot = main?.children[1] || main?.firstElementChild;
    for (let attempt = 0; attempt < 120; attempt += 1) {
      if (main?.children[1] && main.children[1] !== initialRoot) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    for (let frame = 0; frame < 3; frame += 1) await new Promise((resolve) => requestAnimationFrame(resolve));
  };
  const removeNamed = (name, predicate = () => true) => {
    document.querySelectorAll(`[data-framer-name="${name}"]`).forEach((node) => {
      if (predicate(node)) node.remove();
    });
  };
  const removeCBlocks = () => {
    document.querySelectorAll('[data-c-source]').forEach((node) => node.remove());
    removeNamed('Services', (node) => /Our Services|What I Build|__C_REMOVED_SERVICES__/.test(node.textContent || ''));
    removeNamed('Testimonials');
    removeNamed('Pricing');
  };
  const cMotionCss = `
    :host{display:block;width:100%;box-sizing:border-box;overflow:visible;overflow-anchor:none}
    :host(.c-source-host-c-selected-work),:host(.c-source-host-personal-integrations){background:#fffcf5}
    :host(.c-source-host-ticker){margin-bottom:clamp(48px,6vw,80px)}
    .c-source-section{position:relative;width:100%;box-sizing:border-box;padding-top:0}
    .c-source-section[data-c-section-label="Selected Work"] .section-heading{width:100%;align-items:center;justify-content:center}
    .c-source-section[data-c-section-label="Selected Work"] .section-heading h2{font-size:clamp(3.4rem,6vw,6rem);line-height:.96;text-align:center}
    .c-source-section[data-c-section-label="Visual Archive"],.c-source-section[data-c-section-label="A Few Signals"],.c-source-section[data-c-section-label="What I Build"],.c-source-section[data-c-section-label="My Toolkit"]{padding-top:56px}
    .c-source-section-label{position:absolute;top:0;left:50%;z-index:5;box-sizing:border-box;width:max-content;margin:0;padding:6px 12px;border-radius:8px;background:#fff4d6;color:#171512;font:500 14px/20px Inter,Arial,sans-serif;letter-spacing:-.01em;text-align:center;transform:translateX(-50%)}
    [data-framer-appear-id]{will-change:opacity,transform}
    @media (max-width:809.98px){:host(.c-source-host-ticker){margin-bottom:32px}.c-source-section[data-c-section-label="Visual Archive"],.c-source-section[data-c-section-label="A Few Signals"],.c-source-section[data-c-section-label="What I Build"],.c-source-section[data-c-section-label="My Toolkit"]{padding-top:56px}.c-source-section-label{font-size:13px;line-height:19px}}
  `;
  const createSectionLabel = (text) => {
    const label = document.createElement('div');
    label.className = 'c-source-section-label';
    label.dataset.cSectionLabel = text;
    label.textContent = text;
    return label;
  };
  const createSectionMount = (labelText, node) => {
    const mount = document.createElement('div');
    mount.className = 'c-source-section';
    if (labelText) {
      mount.dataset.cSectionLabel = labelText;
      mount.append(createSectionLabel(labelText));
    }
    mount.append(node);
    return mount;
  };
  const positionSectionLabel = (mount) => {
    const label = mount.querySelector(':scope > .c-source-section-label');
    const source = label ? mount.children[1] : mount.firstElementChild;
    const heading = source?.querySelector('h1,h2,h3,h4,h5,h6');
    if (!label || !source || !heading) return;
    const top = Math.max(0, heading.getBoundingClientRect().top - mount.getBoundingClientRect().top - label.offsetHeight - 24);
    label.style.top = `${top}px`;
  };
  const observeSectionLabel = (mount) => {
    const source = mount.children[1] || mount.firstElementChild;
    if (!source) return;
    const refresh = () => {
      positionSectionLabel(mount);
      requestAnimationFrame(() => requestAnimationFrame(() => positionSectionLabel(mount)));
    };
    refresh();
    document.fonts?.ready.then(refresh);
    setTimeout(refresh, 2000);
    setTimeout(refresh, 5000);
    source.querySelectorAll('img').forEach((image) => {
      if (!image.complete) image.addEventListener('load', refresh, { once: true });
    });
    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(() => positionSectionLabel(mount));
      observer.observe(source);
    }
  };
  const readAppearData = (source) => {
    const node = source.document.querySelector('#__framer__appearAnimationsContent');
    try { return node ? JSON.parse(node.textContent || '{}') : {}; } catch { return {}; }
  };
  const readBreakpoints = (source) => {
    const node = source.document.querySelector('#__framer__breakpoints');
    try { return node ? JSON.parse(node.textContent || '[]') : []; } catch { return []; }
  };
  const pickAppearConfig = (data, id, breakpoints) => {
    const variants = data[id];
    if (!variants) return null;
    const active = breakpoints.find(({ mediaQuery, hash }) => mediaQuery && hash && window.matchMedia(mediaQuery).matches && variants[hash]);
    return variants[active?.hash] || variants.default || Object.values(variants)[0] || null;
  };
  const transformFor = (state, template) => {
    const parts = [];
    if (template?.includes('translateX(-50%)')) parts.push('translateX(-50%)');
    const x = Number(state.x || 0);
    const y = Number(state.y || 0);
    if (x || y) parts.push(`translate3d(${x}px, ${y}px, 0)`);
    if (state.rotate) parts.push(`rotate(${state.rotate}deg)`);
    if (state.rotateX) parts.push(`rotateX(${state.rotateX}deg)`);
    if (state.rotateY) parts.push(`rotateY(${state.rotateY}deg)`);
    if (state.skewX) parts.push(`skewX(${state.skewX}deg)`);
    if (state.skewY) parts.push(`skewY(${state.skewY}deg)`);
    if (state.scale !== undefined && state.scale !== 1) parts.push(`scale(${state.scale})`);
    return parts.join(' ') || 'none';
  };
  const cubicBezier = (ease) => Array.isArray(ease) && ease.length === 4 ? `cubic-bezier(${ease.join(',')})` : 'linear';
  const bindAppearMotion = (root, source) => {
    const data = readAppearData(source);
    const breakpoints = readBreakpoints(source);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const observed = [];
    root.querySelectorAll('[data-framer-appear-id]').forEach((element) => {
      const id = element.getAttribute('data-framer-appear-id');
      const config = pickAppearConfig(data, id, breakpoints);
      if (!config?.initial || !config?.animate) return;
      const initial = config.initial;
      const animate = config.animate;
      const transition = animate.transition || {};
      const template = config.transformTemplate || '';
      const duration = Math.max(0, Number(transition.duration || 0) * 1000);
      const delay = Math.max(0, Number(transition.delay || 0) * 1000);
      const ease = cubicBezier(transition.ease);
      element.style.opacity = reduced ? String(animate.opacity ?? 1) : String(initial.opacity ?? 1);
      element.style.transform = reduced ? transformFor(animate, template) : transformFor(initial, template);
      if (reduced) return;
      const reveal = () => {
        element.style.transition = `opacity ${duration}ms ${ease} ${delay}ms, transform ${duration}ms ${ease} ${delay}ms`;
        requestAnimationFrame(() => {
          element.style.opacity = String(animate.opacity ?? 1);
          element.style.transform = transformFor(animate, template);
        });
      };
      observed.push({ element, reveal });
    });
    if (reduced || !observed.length) return;
    const io = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const item = observed.find((candidate) => candidate.element === entry.target);
      item?.reveal();
      io.unobserve(entry.target);
    }), { threshold: 0.12 });
    observed.forEach(({ element }) => io.observe(element));
  };
  const sourceMotionUrl = './assets/mirror-b/framerusercontent.com/sites/3HnHGLCqBcGKlQPcog6Adx/motion.B0GxTDjL.mjs';
  const readNumber = (element, property, fallback) => {
    const value = Number.parseFloat(getComputedStyle(element)[property]);
    return Number.isFinite(value) ? value : fallback;
  };
  const animateSourceValue = (motion, element, property, from, to, unit = '', write = (value) => { element.style[property] = `${value}${unit}`; }) => {
    if (!element || from === to) return { cancel() {}, finished: Promise.resolve() };
    if (!motion?.A) {
      write(to);
      return { cancel() {}, finished: Promise.resolve() };
    }
    const generator = motion.A({ keyframes: [from, to], damping: 60, mass: 1, stiffness: 500, velocity: 0 });
    let frame = 0;
    let start;
    let resolveFinished;
    const finished = new Promise((resolve) => { resolveFinished = resolve; });
    const tick = (time) => {
      start ??= time;
      const state = generator.next(time - start);
      write(state.value);
      if (state.done) {
        resolveFinished();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return {
      cancel() { cancelAnimationFrame(frame); resolveFinished(); },
      finished,
    };
  };
  const sourceScaleValue = (element, fallback) => {
    const match = (element.style.transform || '').match(/scale\(\s*(-?(?:\d+(?:\.\d+)?|\.\d+))\s*\)/);
    const value = match ? Number.parseFloat(match[1]) : fallback;
    return Number.isFinite(value) ? value : fallback;
  };
  const sourceTransformWithScale = (transform, scale) => {
    const value = transform || 'none';
    return /scale\(/.test(value) ? value.replace(/scale\(\s*-?(?:\d+(?:\.\d+)?|\.\d+)\s*\)/, `scale(${scale})`) : `${value} scale(${scale})`;
  };
  const animateSourceTransformScale = (motion, element, from, to, baseTransform) => animateSourceValue(
    motion,
    element,
    'transform',
    from,
    to,
    '',
    (value) => { element.style.transform = sourceTransformWithScale(baseTransform, value); },
  );
  const sourceTransformStateValue = (element, fallback) => {
    const transform = getComputedStyle(element).transform;
    if (transform === 'none') return fallback;
    const values = transform.startsWith('matrix3d(')
      ? transform.slice(9, -1).split(',').map(Number)
      : transform.startsWith('matrix(') ? transform.slice(7, -1).split(',').map(Number) : [];
    const scale = Number(values[0]);
    const y = transform.startsWith('matrix3d(') ? Number(values[13]) : Number(values[5]);
    return { y: Number.isFinite(y) ? y : fallback.y, scale: Number.isFinite(scale) ? scale : fallback.scale };
  };
  const sourceTransformStateCss = (element, state) => {
    const y = Number(state.y || 0);
    const halfHeight = element.offsetHeight / 2;
    const yPart = Math.abs(y + halfHeight) < 0.5 ? 'translateY(-50%)' : y ? `translateY(${y}px)` : '';
    const scalePart = state.scale !== 1 ? `scale(${state.scale})` : '';
    return [yPart, scalePart].filter(Boolean).join(' ') || 'none';
  };
  const animateSourceTransformState = (motion, element, from, to) => {
    if (!element || (from.y === to.y && from.scale === to.scale)) return { cancel() {}, finished: Promise.resolve() };
    if (!motion?.A) {
      element.style.transform = sourceTransformStateCss(element, to);
      return { cancel() {}, finished: Promise.resolve() };
    }
    const generator = motion.A({ keyframes: [0, 1], damping: 60, mass: 1, stiffness: 500, velocity: 0 });
    let frame = 0;
    let start;
    let resolveFinished;
    const finished = new Promise((resolve) => { resolveFinished = resolve; });
    const tick = (time) => {
      start ??= time;
      const state = generator.next(time - start);
      const progress = Number.isFinite(state.value) ? state.value : 1;
      element.style.transform = sourceTransformStateCss(element, {
        y: from.y + (to.y - from.y) * progress,
        scale: from.scale + (to.scale - from.scale) * progress,
      });
      if (state.done) {
        element.style.transform = sourceTransformStateCss(element, to);
        resolveFinished();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return { cancel() { cancelAnimationFrame(frame); resolveFinished(); }, finished };
  };
  const sourceNumberPattern = /-?(?:\d+(?:\.\d+)?|\.\d+)/g;
  const animateSourceBoxShadow = (motion, element, from, to) => {
    if (!element || from === to) return { cancel() {}, finished: Promise.resolve() };
    const fromNumbers = (from.match(sourceNumberPattern) || []).map(Number);
    const toNumbers = (to.match(sourceNumberPattern) || []).map(Number);
    if (!motion?.A || fromNumbers.length !== toNumbers.length) {
      element.style.boxShadow = to;
      return { cancel() {}, finished: Promise.resolve() };
    }
    const generator = motion.A({ keyframes: [0, 1], damping: 60, mass: 1, stiffness: 500, velocity: 0 });
    let frame = 0;
    let start;
    let resolveFinished;
    const finished = new Promise((resolve) => { resolveFinished = resolve; });
    const tick = (time) => {
      start ??= time;
      const state = generator.next(time - start);
      const progress = Number.isFinite(state.value) ? state.value : 1;
      let index = 0;
      element.style.boxShadow = from.replace(sourceNumberPattern, () => {
        const current = index++;
        return String(fromNumbers[current] + (toNumbers[current] - fromNumbers[current]) * progress);
      });
      if (state.done) {
        element.style.boxShadow = to;
        resolveFinished();
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return {
      cancel() { cancelAnimationFrame(frame); resolveFinished(); },
      finished,
    };
  };
  const sourceStatsShadow = '0px 0.7226247621292714px 0.7226247621292714px -0.8333333333333333px rgba(0, 0, 0, 0.075), 0px 2.7462399638921484px 2.7462399638921484px -1.6666666666666665px rgba(0, 0, 0, 0.075), 0px 12px 12px -2.5px rgba(0, 0, 0, 0.075)';
  const sourceStatsShadowTransparent = '0px 0.7226247621292714px 0.7226247621292714px -0.8333333333333333px rgba(0, 0, 0, 0), 0px 2.7462399638921484px 2.7462399638921484px -1.6666666666666665px rgba(0, 0, 0, 0), 0px 12px 12px -2.5px rgba(0, 0, 0, 0)';
  const sourceServicesShadow = '0px 0.6021873017743928px 0.6021873017743928px -0.8333333333333333px rgba(0, 0, 0, 0.05), 0px 2.288533303243457px 2.288533303243457px -1.6666666666666665px rgba(0, 0, 0, 0.05), 0px 10px 10px -2.5px rgba(0, 0, 0, 0.05)';
  const mirrorBIconPaths = {
    Medal: 'M216,96A88,88,0,1,0,72,163.83V240a8,8,0,0,0,11.58,7.16L128,225l44.43,22.21A8.07,8.07,0,0,0,176,248a8,8,0,0,0,8-8V163.83A87.85,87.85,0,0,0,216,96ZM56,96a72,72,0,1,1,72,72A72.08,72.08,0,0,1,56,96ZM168,227.06l-36.43-18.21a8,8,0,0,0-7.16,0L88,227.06V174.37a87.89,87.89,0,0,0,80,0ZM128,152A56,56,0,1,0,72,96,56.06,56.06,0,0,0,128,152Zm0-96A40,40,0,1,1,88,96,40,40,0,0,1,128,56Z',
    ArrowUpRight: 'M200,64V168a8,8,0,0,1-16,0V83.31L69.66,197.66a8,8,0,0,1-11.32-11.32L172.69,72H88a8,8,0,0,1,0-16H192A8,8,0,0,1,200,64Z',
    Quotes: 'M100,56H40A16,16,0,0,0,24,72v64a16,16,0,0,0,16,16h60v8a32,32,0,0,1-32,32,8,8,0,0,0,0,16,48.05,48.05,0,0,0,48-48V72A16,16,0,0,0,100,56Zm0,80H40V72h60ZM216,56H156a16,16,0,0,0-16,16v64a16,16,0,0,0,16,16h60v8a32,32,0,0,1-32,32,8,8,0,0,0,0,16,48.05,48.05,0,0,0,48-48V72A16,16,0,0,0,216,56Zm0,80H156V72h60Z',
    CheckCircle: 'M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm45.66,85.66-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,1,1,11.32-11.32L112,148.69l50.34-50.35a8,8,0,0,1,11.32,11.32Z',
    RocketLaunch: 'M101.85,191.14C97.34,201,82.29,224,40,224a8,8,0,0,1-8-8c0-42.29,23-57.34,32.86-61.85a8,8,0,0,1,6.64,14.56c-6.43,2.93-20.62,12.36-23.12,38.91,26.55-2.5,36-16.69,38.91-23.12a8,8,0,1,1,14.56,6.64Zm122-144a16,16,0,0,0-15-15c-12.58-.75-44.73.4-71.4,27.07h0L88,108.7A8,8,0,0,1,76.67,97.39l26.56-26.57A4,4,0,0,0,100.41,64H74.35A15.9,15.9,0,0,0,63,68.68L28.7,103a16,16,0,0,0,9.07,27.16l38.47,5.37,44.21,44.21,5.37,38.49a15.94,15.94,0,0,0,10.78,12.92,16.11,16.11,0,0,0,5.1.83A15.91,15.91,0,0,0,153,227.3L187.32,193A16,16,0,0,0,192,181.65V155.59a4,4,0,0,0-6.83-2.82l-26.57,26.56a8,8,0,0,1-11.71-.42,8.2,8.2,0,0,1,.6-11.1l49.27-49.27h0C223.45,91.86,224.6,59.71,223.85,47.12Z',
    SmileySticker: 'M128,24a104,104,0,1,0,30.57,203.43,7.9,7.9,0,0,0,3.3-2l63.57-63.57a8,8,0,0,0,2-3.31A104.09,104.09,0,0,0,128,24ZM92,96a12,12,0,1,1-12,12A12,12,0,0,1,92,96Zm82.92,60c-10.29,17.79-27.39,28-46.92,28s-36.63-10.2-46.92-28a8,8,0,1,1,13.84-8c7.47,12.91,19.21,20,33.08,20s25.61-7.1,33.08-20a8,8,0,1,1,13.84,8ZM164,120a12,12,0,1,1,12-12A12,12,0,0,1,164,120Z',
    ScanSmiley: 'M224,40V76a8,8,0,0,1-16,0V48H180a8,8,0,0,1,0-16h36A8,8,0,0,1,224,40Zm-8,132a8,8,0,0,0-8,8v28H180a8,8,0,0,0,0,16h36a8,8,0,0,0,8-8V180A8,8,0,0,0,216,172ZM76,208H48V180a8,8,0,0,0-16,0v36a8,8,0,0,0,8,8H76a8,8,0,0,0,0-16ZM40,84a8,8,0,0,0,8-8V48H76a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8V76A8,8,0,0,0,40,84Zm88,116a72,72,0,1,1,72-72A72.08,72.08,0,0,1,128,200Zm56-72a56,56,0,1,0-56,56A56.06,56.06,0,0,0,184,128Zm-68-12a12,12,0,1,0-12,12A12,12,0,0,0,116,116Zm36-12a12,12,0,1,0,12,12A12,12,0,0,0,152,104Zm-5.29,42c-3.81,3.37-12,6-18.71,6s-14.9-2.63-18.71-6a8,8,0,1,0-10.58,12c7.83,6.91,20.35,10,29.29,10s21.46-3.09,29.29-10a8,8,0,1,0-10.58-12Z',
    FramerLogo: 'M208,104V40a8,8,0,0,0-8-8H56a8,8,0,0,0-5.31,14L107,96H56a8,8,0,0,0-8,8v64a8,8,0,0,0,2.34,5.66l72,72A8,8,0,0,0,136,240V176h64a8,8,0,0,0,5.31-14L149,112h51A8,8,0,0,0,208,104Zm-29,56H128a8,8,0,0,0-8,8v52.69l-56-56V112h61Zm13-64H131L77,48H192Z',
    Desktop: 'M208,40H48A24,24,0,0,0,24,64V176a24,24,0,0,0,24,24h72v16H96a8,8,0,0,0,0,16h64a8,8,0,0,0,0-16H136V200h72a24,24,0,0,0,24-24V64A24,24,0,0,0,208,40ZM48,56H208a8,8,0,0,1,8,8v80H40V64A8,8,0,0,1,48,56ZM208,184H48a8,8,0,0,1-8-8V160H216v16A8,8,0,0,1,208,184Z',
  };
  const createMirrorBIcon = (name, color) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.classList.add('c-source-icon');
    svg.setAttribute('viewBox', '0 0 256 256');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('fill', 'currentColor');
    svg.style.cssText = `display:block;width:100%;height:100%;color:${color};overflow:visible`;
    svg.innerHTML = `<path d="${mirrorBIconPaths[name]}"></path>`;
    return svg;
  };
  const setMirrorBIcon = (svg, name, color) => {
    if (!svg) return;
    svg.classList.add('c-source-icon');
    svg.setAttribute('viewBox', '0 0 256 256');
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.setAttribute('fill', 'currentColor');
    svg.style.cssText = `display:block;width:100%;height:100%;color:${color};overflow:visible`;
    svg.innerHTML = `<path d="${mirrorBIconPaths[name]}"></path>`;
  };
  const hydrateMirrorBIcons = (root) => {
    const inject = (scope, selector, name, color) => scope.querySelectorAll(selector).forEach((container) => {
      if (!container.querySelector('svg.c-source-icon')) container.append(createMirrorBIcon(name, color));
    });
    inject(root, '.framer-bhscdb-container', 'Medal', 'rgb(239, 206, 3)');
    inject(root, '.framer-1msge6l-container', 'ArrowUpRight', '#fff');
    inject(root, '.framer-iw58xp-container', 'Quotes', 'rgb(113, 118, 127)');
    inject(root, '.framer-1po50yc-container', 'SmileySticker', 'rgb(239, 206, 3)');
    inject(root, '.framer-i2bj4l-container', 'RocketLaunch', 'rgb(0, 192, 71)');
    inject(root, '.framer-qltoi2-container', 'CheckCircle', 'rgb(116, 48, 247)');
    root.querySelectorAll('.framer-3IeYm').forEach((card) => {
      const text = card.textContent || '';
      const icon = text.includes('Systems & AI') ? ['ScanSmiley', 'rgb(239, 206, 3)']
        : text.includes('Web & Interactive') ? ['FramerLogo', 'rgb(116, 48, 247)']
          : text.includes('Visual Design') ? ['Desktop', 'rgb(0, 192, 71)'] : null;
      if (!icon) return;
      const containers = [...card.querySelectorAll('.framer-ecvo9g-container, .framer-f48hok-container')];
      const original = containers[0]?.querySelector('svg') || containers[0]?.appendChild(createMirrorBIcon(icon[0], icon[1]));
      const arrow = containers[1]?.querySelector('svg') || containers[1]?.appendChild(createMirrorBIcon('ArrowUpRight', icon[1]));
      setMirrorBIcon(original, icon[0], icon[1]);
      setMirrorBIcon(arrow, 'ArrowUpRight', icon[1]);
      if (original) {
        original.dataset.cServiceIcon = 'original';
        original.style.opacity = '1';
      }
      if (arrow) {
        arrow.dataset.cServiceIcon = 'arrow';
        arrow.style.opacity = '0';
      }
      if (containers[1]) {
        containers[1].dataset.cServiceIconContainer = 'arrow';
        containers[1].style.transform = 'rotate(45deg)';
      }
    });
  };
  const sourceShadowValue = (element, fallback) => {
    const value = getComputedStyle(element).boxShadow;
    return value === 'none' ? fallback : value;
  };
  const sourceTopOffset = (card, element) => {
    const style = getComputedStyle(element);
    if (style.top !== 'auto') {
      const value = Number.parseFloat(style.top);
      if (Number.isFinite(value)) return style.top.endsWith('%') ? card.clientHeight * value / 100 : value;
    }
    return element.offsetTop;
  };
  const sourceBottomOffset = (card, element) => card.clientHeight - sourceTopOffset(card, element) - element.offsetHeight;
  const sourceHorizontalOffset = (card, element) => {
    const style = getComputedStyle(element);
    if (style.left !== 'auto') {
      const value = Number.parseFloat(style.left);
      if (Number.isFinite(value)) return style.left.endsWith('%') ? card.clientWidth * value / 100 : value;
    }
    return element.offsetLeft;
  };
  const bindMirrorBHover = async (root) => {
    let motion = null;
    try { motion = await import(sourceMotionUrl); motion.v?.(); motion.t?.(); } catch (error) { console.warn('[C source integration] Mirror B motion module unavailable', error); }
    const bind = (card, specs) => {
      let active = false;
      let runs = [];
      let base = [];
      let stackRuns = [];
      let stackItems = [];
      let stackContainers = [];
      const resetStack = () => {
        stackRuns.forEach((run) => run.cancel());
        stackRuns = [];
        stackItems.forEach(({ element, translate }) => { element.style.translate = translate; });
        stackContainers.forEach(({ element, justifyContent }) => { element.style.justifyContent = justifyContent; });
        stackItems = [];
        stackContainers = [];
      };
      const captureServiceStack = () => {
        if (!card.getBoundingClientRect().height || !window.matchMedia('(min-width:810px)').matches) return [];
        return [...card.querySelectorAll('.framer-xt4b0a, .framer-bj2grg')].map((element) => {
          const box = element.getBoundingClientRect();
          return {
            element,
            children: [...element.children],
            positions: [...element.children].map((child) => child.getBoundingClientRect().top - box.top),
            justifyContent: element.style.justifyContent,
          };
        });
      };
      const animateServiceStack = (before, justifyContent, keepJustify) => {
        const nextRuns = [];
        stackContainers = before.map(({ element, justifyContent: previous }) => ({ element, justifyContent: previous }));
        stackItems = [];
        before.forEach(({ element, children, positions }) => {
          element.style.justifyContent = justifyContent;
          const box = element.getBoundingClientRect();
          children.forEach((child, index) => {
            const target = child.getBoundingClientRect().top - box.top;
            const delta = positions[index] - target;
            const translate = child.style.translate;
            stackItems.push({ element: child, translate });
            if (!delta) return;
            child.style.translate = `0px ${delta}px`;
            nextRuns.push(animateSourceValue(motion, child, 'translate', delta, 0, '', (value) => {
              child.style.translate = `0px ${value}px`;
            }));
          });
          if (!keepJustify) element.style.justifyContent = '';
        });
        return nextRuns;
      };
      const stop = () => { runs.forEach((run) => run.cancel()); runs = []; resetStack(); };
      const resolveValue = (spec, name, element) => typeof spec[name] === 'function' ? spec[name](card, element) : spec[name];
      const readValue = (spec, element, inactive) => {
        if (spec.read) return spec.read(card, element);
        if (spec.kind === 'boxShadow') return sourceShadowValue(element, inactive);
        if (spec.kind === 'transformState') return sourceTransformStateValue(element, inactive);
        if (spec.kind === 'transformScale') return sourceScaleValue(element, inactive);
        return readNumber(element, spec.property, inactive);
      };
      const animateSpec = (entry, from, to) => entry.kind === 'boxShadow'
        ? animateSourceBoxShadow(motion, entry.element, from, to)
        : entry.kind === 'transformState'
          ? animateSourceTransformState(motion, entry.element, from, to)
        : entry.kind === 'transformScale'
          ? animateSourceTransformScale(motion, entry.element, from, to, entry.baseTransform)
        : animateSourceValue(motion, entry.element, entry.property, from, to, entry.unit);
      const setState = (next) => {
        if (active === next) return;
        active = next;
        stop();
        if (next) {
          const stackBefore = captureServiceStack();
          base = specs.map(({ selector, property, active: target, inactive, unit, persistent }) => {
            const element = card.querySelector(selector);
            const spec = specs.find((item) => item.selector === selector && item.property === property);
            const resolvedInactive = element ? resolveValue(spec, 'inactive', element) : inactive;
            const resolvedActive = element ? resolveValue(spec, 'active', element) : target;
            return { ...spec, element, active: resolvedActive, inactive: resolvedInactive, persistent, baseTransform: spec.kind === 'transformScale' ? element?.style.transform : '', from: element ? readValue(spec, element, resolvedInactive) : resolvedInactive };
          });
          if (card.matches('.framer-oEH5A.framer-v-1hs4vxi')) {
            card.querySelector('.framer-1w3pwdg')?.style.setProperty('top', 'unset');
            card.querySelector('.framer-1ov2omu')?.style.setProperty('left', '49%');
          }
          card.classList.add('hover');
          stackRuns = animateServiceStack(stackBefore, 'flex-end', false);
          const iconRuns = card.matches('.framer-3IeYm') ? [
            ['original', 0],
            ['arrow', 1],
          ].flatMap(([name, target]) => {
            const icon = card.querySelector(`svg[data-c-service-icon="${name}"]`);
            return icon ? [animateSourceValue(motion, icon, 'opacity', readNumber(icon, 'opacity', name === 'original' ? 1 : 0), target)] : [];
          }).concat((() => {
            const container = card.querySelector('[data-c-service-icon-container="arrow"]');
            return container ? [animateSourceValue(motion, container, 'transform', 45, 0, 'deg', (value) => { container.style.transform = `rotate(${value}deg)`; })] : [];
          })()) : [];
          runs = base.filter(({ element }) => element).map((entry) => animateSpec(entry, entry.from, entry.active)).concat(iconRuns);
          return;
        }
        const leaving = base;
        const stackBefore = captureServiceStack();
        if (card.matches('.framer-oEH5A.framer-v-1hs4vxi')) {
          card.querySelector('.framer-1w3pwdg')?.style.setProperty('top', '');
          card.querySelector('.framer-1ov2omu')?.style.setProperty('left', '');
        }
        card.classList.add('hover');
        stackRuns = animateServiceStack(stackBefore, 'flex-start', true);
        const iconRuns = card.matches('.framer-3IeYm') ? [
          ['original', 1],
          ['arrow', 0],
        ].flatMap(([name, target]) => {
          const icon = card.querySelector(`svg[data-c-service-icon="${name}"]`);
          return icon ? [animateSourceValue(motion, icon, 'opacity', readNumber(icon, 'opacity', name === 'original' ? 0 : 1), target)] : [];
        }).concat((() => {
          const container = card.querySelector('[data-c-service-icon-container="arrow"]');
          return container ? [animateSourceValue(motion, container, 'transform', 0, 45, 'deg', (value) => { container.style.transform = `rotate(${value}deg)`; })] : [];
        })()) : [];
        runs = leaving.filter(({ element }) => element).map((entry) => animateSpec(entry, entry.active, entry.inactive)).concat(iconRuns);
        Promise.all([...runs, ...stackRuns].map(({ finished }) => finished)).then(() => {
          if (active) return;
          card.classList.remove('hover');
          leaving.forEach(({ element, property, inactive, unit, persistent }) => {
            if (!element) return;
            const entry = leaving.find((candidate) => candidate.element === element && candidate.property === property);
            if (entry?.kind === 'transformState') {
              element.style.transform = sourceTransformStateCss(element, entry.inactive);
            } else if (entry?.kind === 'transformScale') {
              element.style.transform = sourceTransformWithScale(entry.baseTransform, inactive);
            } else {
              element.style[property] = persistent ? `${inactive}${unit || ''}` : '';
            }
          });
          resetStack();
          runs = [];
        });
      };
      card.addEventListener('pointerenter', () => setState(true));
      card.addEventListener('pointerleave', () => setState(false));
      card.addEventListener('focusin', () => setState(true));
      card.addEventListener('focusout', (event) => { if (!card.contains(event.relatedTarget)) setState(false); });
    };
    root.querySelectorAll('.framer-Ly7Id').forEach((card) => bind(card, [
      { selector: '.framer-14y7qqx', property: 'top', active: 0, inactive: -13, unit: 'px' },
      { selector: '.framer-14y7qqx', property: 'right', active: 0, inactive: -17, unit: 'px' },
      { selector: '.framer-14y7qqx', property: 'bottom', active: 0, inactive: -13, unit: 'px' },
      { selector: '.framer-14y7qqx', property: 'left', active: 0, inactive: -17, unit: 'px' },
    ]));
    root.querySelectorAll('.framer-wBvhL.framer-v-1ra528h').forEach((card) => bind(card, [
      { selector: '.framer-13mpb10', property: 'top', active: 81, inactive: 194, unit: 'px', persistent: true },
      { selector: '.framer-m3lsnc', property: 'opacity', active: 1, inactive: 0, persistent: true },
      { selector: '.framer-111eslg', property: 'opacity', active: 1, inactive: 0, persistent: true },
      { selector: '.framer-111eslg', property: 'top', active: 20, inactive: 24, unit: 'px', persistent: true },
    ]));
    root.querySelectorAll('.framer-oEH5A.framer-v-1hs4vxi').forEach((card) => bind(card, [
      { selector: '.framer-1w3pwdg', property: 'bottom', active: 125, inactive: (owner, element) => sourceBottomOffset(owner, element), unit: 'px', read: (owner, element) => sourceBottomOffset(owner, element) },
      { selector: '.framer-1w3pwdg', property: 'transform', kind: 'transformState', active: { y: 0, scale: 1 }, inactive: (owner, element) => sourceTransformStateValue(element, { y: -element.offsetHeight / 2, scale: .9 }), persistent: true },
      { selector: '.framer-7trp33', property: 'transform', kind: 'transformState', active: (owner, element) => ({ y: -element.offsetHeight / 2, scale: 1 }), inactive: (owner, element) => sourceTransformStateValue(element, { y: -element.offsetHeight / 2, scale: .95 }), persistent: true },
      { selector: '.framer-7trp33', property: 'boxShadow', kind: 'boxShadow', active: sourceStatsShadowTransparent, inactive: sourceStatsShadow, persistent: true },
      { selector: '.framer-110g1to', property: 'top', active: 125, inactive: (owner, element) => sourceTopOffset(owner, element), unit: 'px', read: (owner, element) => sourceTopOffset(owner, element) },
      { selector: '.framer-110g1to', property: 'transform', kind: 'transformState', active: { y: 0, scale: 1 }, inactive: (owner, element) => sourceTransformStateValue(element, { y: -element.offsetHeight / 2, scale: 1 }), persistent: true },
      { selector: '.framer-110g1to', property: 'boxShadow', kind: 'boxShadow', active: sourceStatsShadowTransparent, inactive: sourceStatsShadow, persistent: true },
      { selector: '.framer-1ov2omu', property: 'top', active: -20, inactive: (owner, element) => sourceTopOffset(owner, element), unit: 'px', read: (owner, element) => sourceTopOffset(owner, element) },
      { selector: '.framer-1ov2omu', property: 'left', active: (owner) => owner.clientWidth * .49, inactive: (owner, element) => sourceHorizontalOffset(owner, element), unit: 'px', read: (owner, element) => sourceHorizontalOffset(owner, element) },
      { selector: '.framer-1ov2omu', property: 'opacity', active: 1, inactive: 0 },
      { selector: '.framer-1ov2omu', property: 'transform', kind: 'transformScale', active: 1, inactive: .8 },
    ]));
    root.querySelectorAll('.framer-3IeYm.framer-v-wtw9jn, .framer-3IeYm.framer-v-j5msrk').forEach((card) => {
      const prominent = card.classList.contains('framer-v-j5msrk');
      bind(card, [
        { selector: '.framer-5rx2c1', property: 'opacity', active: .3, inactive: 1, persistent: true },
        ...(!prominent ? [{ selector: '.framer-8lqob', property: 'boxShadow', kind: 'boxShadow', active: sourceServicesShadow, inactive: '0px 0px 0px 0px rgba(0, 0, 0, 0)', persistent: true }] : []),
      ]);
    });
  };
  const bindSourceClassReveal = (root) => {
    const nodes = [...root.querySelectorAll('.reveal:not(.is-visible)')];
    if (!nodes.length) return;
    const reveal = (node) => node.classList.add('is-visible');
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      nodes.forEach(reveal);
      return;
    }
    const io = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      reveal(entry.target);
      io.unobserve(entry.target);
    }), { threshold: 0.12 });
    nodes.forEach((node) => io.observe(node));
  };
  const detachedTextLeaves = (root) => [...root.querySelectorAll('*')]
    .filter((node) => node.children.length === 0 && node.textContent?.trim() && !/^(SCRIPT|STYLE|SVG)$/i.test(node.tagName));
  const replaceDetachedText = (root, replacements) => {
    if (!root) return;
    const map = new Map(replacements);
    detachedTextLeaves(root).forEach((node) => {
      const next = map.get(node.textContent.trim());
      if (next !== undefined) node.textContent = next;
    });
  };
  const setDetachedLeaf = (root, index, value) => {
    const node = detachedTextLeaves(root)[index];
    if (node) node.textContent = value;
  };
  const detachedCopy = [
    ['Pulma', 'Seiya'],
    ['HELPED +200 FOUNDERS RISE THEIR BRANDS', 'BUILDING WITH CODE, DESIGN & CURIOSITY'],
    ['We build design on', 'I build digital things'],
    ['clarity, speed, and care.', 'with clarity and care.'],
    ['We create thoughtful work through a refined process, guided by clear thinking and a deep respect for time.', 'I create personal websites, digital spaces, and interactive experiments shaped by curiosity, clear thinking, and careful craft.'],
    ['Use for Free', 'View Projects'],
    ['See how we work with you', 'See what I’m working on'],
    ['About Us', 'About Me'],
    ['A deliberate approach to', 'A personal approach to'],
    ['meaningful, modern work.', 'meaningful, modern work.'],
    ['Pulma was shaped by a simple belief: meaningful work doesn’t need to be loud, and speed doesn’t need to feel rushed. We operate between precision and pace, where ideas are carefully refined, then carried forward with quiet confidence.', 'This space was shaped by a simple belief: personal work can be clear, thoughtful, and quietly ambitious. I’m interested in building digital spaces that feel intentional — where design, code, and curiosity support each other.'],
    ['Our process is deliberate, never slow. Each project begins with alignment, understanding intent before execution. From structure to interaction, every detail is handled with focus and care.', 'My process is deliberate, but never static. Most projects begin with observation: understanding the structure, refining the idea, and then turning it into something usable, readable, and visually convincing.'],
    ['We work within systems not to limit creativity, but to give it direction. With the right structure in place, creativity becomes more intentional, more scalable, and ultimately more meaningful.', 'I use systems not to limit creativity, but to give it direction. Whether it’s a website, a project page, or an interactive experiment, the goal is the same: make it clearer, stronger, and more meaningful over time.'],
    ['Learn More About Us', 'Learn More About Me'],
    ['98%', '28'], ['On-time delivery', 'Web Decks Created'], ['40%', '6'], ['Faster launch', 'Projects Built'], ['90%', '3'], ['Returning clients', 'Core Focus Areas'], ['+200', '∞'], ['Completed projects', 'Ideas in Progress'],
    ['Our Work', 'Explorations'],
    ['Work shaped by clarity,', 'Things shaped by curiosity,'], ['carried through with care.', 'built with care.'],
    ['Best work in 2026', 'Currently Exploring'], ['Nadina', 'Digital Self'],
    ['A modern portfolio template with a calm aesthetic, built for creatives to showcase their work clearly and confidently', 'An evolving digital space for projects, ideas, experiments, and the things I’m learning along the way.'],
    ['View Project', 'Explore More'], ['Increased conversion by 32% in the first month', 'Built through code, design, and constant iteration'],
    ['Halo Form', 'Making'], ['Verdan Core', 'Language'], ['Arcwell', 'Systems'], ['Lumen Grid', 'Stories'],
    ['How We Work', 'How I Build'], ['A clear process, from first', 'A simple process, from first'], ['conversation to lasting support.', 'idea to something real.'],
    ['Book a call.', 'Start with a Call.'], ['Deliver.', 'Launch.'], ['Support.', 'Improve.'],
    ['Clear answers,', 'A few answers,'], ['before we begin.', 'before you explore.'], ['How do we get started?', 'Where should I start?'],
    ['What types of projects do you take on?', 'What kinds of things do I build?'], ['How does the pricing work?', 'How does a project take shape?'],
    ['How long does a project usually take?', 'How long do my projects usually take?'], ['Can we request revisions?', 'Do I keep revising things?'],
    ['Reach out and we’ll get back to you shortly.', 'Reach out if there’s something you’d like to ask.'],
    ['Let’s move forward', 'Let’s move forward'], ['with clarity.', 'with curiosity.'],
    ['Share your goals, and we’ll help shape the direction', 'Projects, ideas, experiments, and everything still in progress.'],
    ['and guide your project forward with clarity and care.', 'This space will keep changing as I build and learn.'],
    ['Book a Call', 'View Projects'], ['Email Us', 'Get in Touch'], ['Work', 'Projects'], ['About Us', 'About Me'],
    ['Connect', 'Explore'], ['X (Twitter)', 'Visual Archive'], ['Linkedin', 'Explorations'], ['Instagram', 'How I Build'], ['Threads', 'Questions'],
    ['Legal', 'Connect'], ['Privacy Policy', 'GitHub'], ['Terms of Service', 'Email'],
    ['©Irise Studio 2026. All rights reserved.', '© Seiya 2026. All rights reserved.'], ['Created by Rosvid Qoim', 'Created by Seiya'], ['Rosyid Qoim', 'Seiya'], ['Rosvid Qoim', 'Seiya'],
  ];
  const applyMirrorBSourceCopy = (source) => {
    const works = source.document.querySelector('[data-framer-name="Works"]');
    replaceDetachedText(works, [['Featured works', 'Visual Archive'], ['All Works', 'View Archive']]);
    const workCopy = new Map([
      ['Pulma', ['Bloom', ['Visual Study', 'Color Study']]],
      ['LumeX', ['Shadow', ['Light', 'Visual Atmosphere']]],
      ['Planza', ['Moment', ['Human Study']]],
      ['Horizon Atlas', ['Afterimage', ['Motion', 'Observation']]],
    ]);
    works?.querySelectorAll('.framer-9np96r').forEach((card) => {
      const leaves = detachedTextLeaves(card);
      const copy = workCopy.get(leaves[0]?.textContent.trim());
      if (!copy) return;
      setDetachedLeaf(card, 0, copy[0]);
      copy[1].forEach((value, index) => setDetachedLeaf(card, index + 1, value));
    });
    const social = source.document.querySelector('[data-framer-name="Social Proof"]');
    replaceDetachedText(social, [
      ['Trusted by many', 'A Few Signals'], ['W.', 'N.'], ['Awwwards Nominee', 'Personal Archive'],
      ['Recognized for excellence in web design and innovative digital experiences.', 'Collected references, visual impressions, and fragments that continue to shape how I think about design.'],
      ['No matter the event, we bring expertise, creativity, and passion to make your moments unforgettable', 'Sometimes a single image, texture, or atmosphere is enough to suggest a new direction.'],
      ['Carter’s design expertise goes beyond aesthetics—he crafts experiences that truly connect with users. A great collaborator and a problem-solver at heart', 'I’m drawn to work that feels clear, atmospheric, and quietly memorable — images, interfaces, and fragments that stay in the mind longer than expected.'],
      ['Samantha', 'Seiya'], ['Founder at NexaTech', 'Learning through code & design'],
    ]);
    social?.querySelectorAll('.framer-1w3pwdg p, .framer-7trp33 p, .framer-110g1to p').forEach((node) => {
      const card = node.closest('.framer-1w3pwdg, .framer-7trp33, .framer-110g1to');
      const target = card?.classList.contains('framer-1w3pwdg') ? '3 core focus areas'
        : card?.classList.contains('framer-7trp33') ? '6 projects built' : '28 web decks created';
      if (target) node.textContent = target;
    });
    const services = source.document.querySelector('[data-framer-name="Services"]');
    replaceDetachedText(services, [['Design solutions that elevate brands and create seamless user experiences. I help bring ideas to life with strategy and creativity', 'I build digital things around technology, ideas, and interaction — turning curiosity into websites, tools, and experiences.'], ['A strong brand is more than just a logo—it’s the foundation of how your audience perceives you. I create cohesive and impactful brand identities that ensure consistency across all touchpoints', 'I explore AI tools, computer systems, automation, and the workflows behind them. The goal is usually simple: understand how things work, then make them more useful.'], ['Transforming designs into fully responsive, interactive websites with Framer. Whether it’s a landing page or a full-scale web experience, I build fast, modern sites optimized for seamless performance', 'I turn ideas into websites and interactive experiences, from personal spaces and visual experiments to small tools and narrative projects built to be explored.'], ['Designing user-centered experiences that are both functional and visually engaging. From concept to final prototype, I focus on intuitive interfaces that enhance experiences and usability', 'I care about how information looks, reads, and feels — from typography and page rhythm to visual storytelling, presentations, and the small details that shape an experience.']]);
    const serviceLead = services?.querySelector('h1,h2,h3');
    if (serviceLead) serviceLead.textContent = 'I build digital things around technology, ideas, and interaction — turning curiosity into websites, tools, and experiences.';
    const serviceLabel = services && [...services.querySelectorAll('p')].find((node) => node.textContent.trim() === 'Services');
    if (serviceLabel) serviceLabel.textContent = 'Focus Areas';
    const serviceCopy = new Map([
      ['Branding Design', ['Systems & AI', ['AI Tools', 'Systems', 'Automation', '+ Experiments']]],
      ['Framer Development', ['Web & Interactive', ['Websites', 'Interactive UI', 'Prototypes', '+ Experiments']]],
      ['UI/UX Design', ['Visual Design', ['Typography', 'Visual Design', 'Presentations', '+ Storytelling']]],
    ]);
    services?.querySelectorAll('.framer-3IeYm').forEach((card) => {
      const leaves = detachedTextLeaves(card);
      const copy = serviceCopy.get(leaves[0]?.textContent.trim());
      if (!copy) return;
      setDetachedLeaf(card, 0, copy[0]);
      copy[1].forEach((value, index) => setDetachedLeaf(card, index + 3, value));
    });
  };
  const applyCSourceCopy = (source) => replaceDetachedText(source.document, detachedCopy);
  document.addEventListener('submit', (event) => {
    if (location.pathname.replace(/\/+$/, '') !== '/contact' || !(event.target instanceof HTMLFormElement)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const data = new FormData(event.target);
    const body = ['Name', 'Email', 'Phone Number', 'Message']
      .map((field) => `${field}: ${data.get(field) || ''}`)
      .join('\n');
    window.location.href = `mailto:sunmengsaiyi@gmail.com?subject=${encodeURIComponent('Website inquiry')}&body=${encodeURIComponent(body)}`;
  }, true);
  const applyClientRouteChanges = () => {
    const path = location.pathname.replace(/\/+$/, '') || '/';
    if (path === '/about' && !document.getElementById('route-about-customizations')) {
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
    }
    if (path !== '/work') return;
    const header = [...document.querySelectorAll('[data-framer-name]')]
      .find((node) => node.getAttribute('data-framer-name') === 'Header');
    const filters = header?.querySelector('.framer-pxadms');
    if (!filters || filters.dataset.routeFilterHidden) return;
    if (['All', 'Framer Dev', 'Product Design', 'Branding Design', 'Web Dev']
      .every((label) => filters.textContent.includes(label))) {
      filters.dataset.routeFilterHidden = 'true';
      filters.style.display = 'none';
    }
  };
  applyClientRouteChanges();
  new MutationObserver(applyClientRouteChanges).observe(document.documentElement, { childList: true, subtree: true });
  const integrationsCopy = [
    ['Connect the tools that hold your context', 'The tools that connect the way I build.'],
    ['Connect the tools that', 'The tools that connect'],
    ['hold your context', 'the way I build.'],
    ['Aura can start from the places where your product work already lives: design files, docs, repos, project notes, and launch assets.', 'A small collection of tools I use to think, build, experiment, organize ideas, and turn them into something real.'],
    ['A.', 'S.'],
  ];
  const applyIntegrationsSourceCopy = (source) => {
    const section = [...source.document.querySelectorAll('section')].find((node) => /Connect the tools that|The tools that connect/.test(node.textContent || ''));
    replaceDetachedText(section, integrationsCopy);
    if (!section) return;
    const heading = section.querySelector('h1,h2,h3');
    const headingText = heading ? [...heading.childNodes].filter((node) => node.nodeType === Node.TEXT_NODE) : [];
    if (headingText[0]) headingText[0].nodeValue = 'The tools that connect';
    if (headingText[1]) headingText[1].nodeValue = 'the way I build.';
    const description = section.querySelector('h1 + p,h2 + p,h3 + p');
    if (description) description.textContent = 'A small collection of tools I use to think, build, experiment, organize ideas, and turn them into something real.';
    const center = [...section.querySelectorAll('*')].find((node) => node.children.length === 0 && node.textContent.trim() === 'A.');
    if (center) center.textContent = 'S.';
  };
  const appendCBlock = async (key, node, source, anchor, css, labelText = '') => {
    if (!node) return;
    const mount = sourceRoot(key);
    if (key === 'c-ticker') mount.host.classList.add('c-source-host-ticker');
    if (key === 'c-selected-work') mount.host.classList.add('c-source-host-c-selected-work');
    appendStyle(mount.root, `${css}\n${cMotionCss}`);
    const imported = document.adoptNode(node);
    const sectionMount = labelText ? createSectionMount(labelText, imported) : imported;
    mount.root.append(sectionMount);
    if (labelText) observeSectionLabel(sectionMount);
    rewriteMedia(mount.root, source.basePath);
    bindSourceClassReveal(mount.root);
    insertBefore(mount.host, anchor);
  };
  const appendMirrorB = async (source, anchor) => {
    const mount = sourceRoot('mirror-b-sections');
    mount.host.classList.add('c-source-runtime-host');
    mount.host.dataset.cSourceSections = 'works,social-proof,services';
    appendStyle(mount.root, scopedShadowCss(await sourceStyles(source)));
    appendStyle(mount.root, cMotionCss);
    const svgTemplates = source.document.querySelector('#svg-templates');
    if (svgTemplates) mount.root.append(document.adoptNode(svgTemplates));
    const sourceShell = document.createElement('div');
    sourceShell.className = 'framer-pP5Z0 framer-W5fSV framer-WbCZd framer-zbKUM framer-zm2fr framer-72rtr7';
    sourceShell.setAttribute('style', 'min-height:100vh;width:auto;display:contents');
    mount.root.append(sourceShell);
    for (const name of ['Works', 'Social Proof', 'Services']) {
      const node = source.document.querySelector(`[data-framer-name="${name}"]`);
      if (node) {
        const sectionMount = createSectionMount({ Works: 'Visual Archive', 'Social Proof': 'A Few Signals', Services: 'What I Build' }[name], document.adoptNode(node));
        sourceShell.append(sectionMount);
        observeSectionLabel(sectionMount);
      }
    }
    rewriteMedia(mount.root, source.basePath);
    hydrateMirrorBIcons(mount.root);
    bindAppearMotion(mount.root, source);
    await bindMirrorBHover(mount.root);
    insertBefore(mount.host, anchor);
  };
  const iconPaths = {
    'solar:figma-file-linear': '<path d="M8 2h4a3 3 0 0 1 0 6H8v4a3 3 0 1 1-3 3 3 3 0 0 1 3-3V8a3 3 0 1 1 0-6Zm0 0v6h4a3 3 0 1 0 0-6H8Zm0 6h4a3 3 0 1 1 0 6H8V8Z"/>',
    'solar:notebook-linear': '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h7M8 11h7M8 15h4M3 7h2M3 12h2M3 17h2"/>',
    'solar:code-square-linear': '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="m9 8-4 4 4 4M15 8l4 4-4 4M13 6l-2 12"/>',
    'solar:folder-cloud-linear': '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V7Z"/><path d="M9 16h6a2 2 0 1 0-.4-3.96A3 3 0 0 0 9 13a2 2 0 0 0 0 3Z"/>',
    'solar:chat-round-line-linear': '<path d="M20 11a8 8 0 0 1-8 8H7l-4 2 1.5-4A8 8 0 1 1 20 11Z"/><path d="M8 11h8M8 14h5"/>',
    'solar:checklist-minimalistic-linear': '<rect x="4" y="3" width="16" height="18" rx="3"/><path d="m8 9 1.5 1.5L12 8M14 9h3M8 15l1.5 1.5L12 14M14 15h3"/>',
    'solar:global-linear': '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    'solar:layers-linear': '<path d="m12 3 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
  };
  const localizeIntegrations = (section) => {
    section.className = 'c-integrations';
    const title = section.querySelector('h2');
    const description = section.querySelector('h2 + p');
    const orbit = section.querySelector('[style*="aspect-ratio:16/8"]');
    title?.classList.add('c-int-title');
    description?.classList.add('c-int-description');
    orbit?.classList.add('c-int-orbit');
    const center = orbit?.querySelector('div[style*="box-shadow"]');
    center?.classList.add('c-int-center');
    orbit?.querySelectorAll(':scope > div[style*="left:"]').forEach((node) => {
      node.classList.add('c-int-node');
      node.firstElementChild?.classList.add('c-int-icon');
      node.querySelector('p')?.classList.add('c-int-label');
    });
    section.querySelectorAll('iconify-icon').forEach((icon) => {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('aria-hidden', 'true');
      svg.innerHTML = iconPaths[icon.getAttribute('icon')] || '<circle cx="12" cy="12" r="8"/>';
      svg.setAttribute('class', 'c-int-svg');
      icon.replaceWith(svg);
    });
    return `
      :host{display:block;width:100%;box-sizing:border-box;--serif:'Cormorant Garamond',Georgia,serif;background:#fffcf5;color:#171512}
      .c-integrations{background:#fffcf5;padding:80px 0;font-family:Inter,Arial,sans-serif;overflow:hidden}
      .c-integrations>div{box-sizing:border-box;width:min(1200px,100%);margin:0 auto;padding:0 20px;text-align:center}
      .c-int-title{margin:0;font-family:var(--serif);font-size:48px;line-height:1.05;font-weight:500;letter-spacing:-.025em}
      .c-int-description{max-width:576px;margin:20px auto 0;color:#6F6B62;font-size:16px;line-height:1.625}
      .c-int-orbit{position:relative;width:min(760px,100%);margin:56px auto 0;aspect-ratio:16/8}
      .c-int-center{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:80px;height:80px;border-radius:50%;background:#3B4B34;color:#fff;display:flex;align-items:center;justify-content:center;font-family:var(--serif);font-size:24px;letter-spacing:-.025em;box-shadow:0 20px 40px -15px rgba(59,75,52,.5)}
      .c-int-node{position:absolute;transform:translateY(0);animation:floatY 5s ease-in-out infinite;will-change:transform}
      .c-int-icon{width:56px;height:56px;border-radius:50%;background:#F7F4ED;border:1px solid rgba(23,21,18,.08);display:flex;align-items:center;justify-content:center;box-shadow:0 1px 2px rgba(23,21,18,.08)}
      .c-int-svg{width:22px;height:22px;fill:none;stroke:#3B4B34;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
      .c-int-label{margin:6px 0 0;color:#9A948A;font-size:16px;line-height:1.2;text-align:center}
      .c-int-orbit>svg{position:absolute;inset:0;width:100%;height:100%}
      .c-integrations .reveal{opacity:0;transform:translateY(24px);filter:blur(10px);transition:opacity .8s cubic-bezier(.22,1,.36,1),transform .8s cubic-bezier(.22,1,.36,1),filter .9s cubic-bezier(.22,1,.36,1)}
      .c-integrations .reveal.c-visible{opacity:1;transform:none;filter:blur(0)}
      @keyframes floatY{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
      @media (min-width:810px){.c-integrations{padding:112px 0}.c-integrations>div{padding:0 32px}.c-int-title{font-size:56px}}
      @media (max-width:809.98px){.c-int-title{font-size:38px}.c-int-description{font-size:15px}.c-int-orbit{margin-top:40px;aspect-ratio:1/1}.c-int-center{width:72px;height:72px}.c-int-icon{width:48px;height:48px}.c-int-label{font-size:13px}}
      @media (prefers-reduced-motion:reduce){.c-int-node{animation:none}.c-integrations .reveal{opacity:1;transform:none;filter:none}}
    `;
  };
  const appendIntegrations = async (source, anchor) => {
    const section = [...source.document.querySelectorAll('section')].find((node) => /Connect the tools that|The tools that connect/.test(node.textContent || ''));
    if (!section) return;
    const mount = sourceRoot('personal-integrations');
    mount.host.classList.add('c-source-host-personal-integrations');
    const sectionMount = createSectionMount('My Toolkit', document.adoptNode(section));
    mount.root.append(sectionMount);
    observeSectionLabel(sectionMount);
    rewriteMedia(mount.root, source.basePath);
    const css = localizeIntegrations(mount.root.querySelector('section'));
    appendStyle(mount.root, `${cMotionCss}\n${css}`);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const reveals = [...mount.root.querySelectorAll('.reveal')];
    if (!reduced) {
      const io = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('c-visible');
        io.unobserve(entry.target);
      }), { threshold: 0.12 });
      reveals.forEach((node) => io.observe(node));
    } else reveals.forEach((node) => node.classList.add('c-visible'));
    insertBefore(mount.host, anchor);
  };

  try {
    await waitForMirrorARuntime();
    removeCBlocks();
    const removeEditorbar = () => document.querySelectorAll('#__framer-editorbar, iframe.status_hidden').forEach((node) => node.remove());
    removeEditorbar();
    [250, 500, 1000, 2000, 4000].forEach((delay) => setTimeout(removeEditorbar, delay));
    const [cSource, mirrorB, personal] = await Promise.all([
      fetchSource('./source/c.html'),
      fetchSource('./source/b.html'),
      fetchSource('./source/integrations.html'),
    ]);
    applyCSourceCopy(cSource);
    applyMirrorBSourceCopy(mirrorB);
    applyIntegrationsSourceCopy(personal);
    const root = document.querySelector('[data-framer-root]') || document.body;
    const main = root.querySelector('main[data-framer-name="Main"]');
    const howItWorks = root.querySelector('section[data-framer-name="How it Works"]');
    const processDescriptionStyle = document.createElement('style');
    processDescriptionStyle.textContent = '#how-we-work .framer-1kwm7vy { max-width: 400px; }';
    document.head.append(processDescriptionStyle);
    const cCss = scopedShadowCss(await sourceStyles(cSource));
    await appendCBlock('c-ticker', cSource.document.querySelector('.ticker'), cSource, main, cCss);
    await appendCBlock('c-selected-work', cSource.document.querySelector('#work'), cSource, howItWorks, cCss, 'Selected Work');
    await appendMirrorB(mirrorB, howItWorks);
    await appendIntegrations(personal, howItWorks);
    normalizeRepositoryPaths();
    normalizeSiteLinks();
    new MutationObserver(() => normalizeRepositoryPaths()).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['src', 'srcset', 'poster'],
      childList: true,
      subtree: true,
    });
    new MutationObserver(() => normalizeSiteLinks()).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['href'],
      childList: true,
      subtree: true,
    });
    placeStableBlocks();
    const stableRoot = document.querySelector('#main');
    if (stableRoot) new MutationObserver(placeStableBlocks).observe(stableRoot, { childList: true, subtree: true });
    document.querySelectorAll('#__framer-editorbar, iframe.status_hidden').forEach((node) => node.remove());
    applyFooterTargets();
    document.documentElement.dataset.cArchitecture = 'mirror-a-work-single-document-source-state';
    document.body.dataset.cAddedBlocks = 'c-ticker,c-selected-work,mirror-b-works-social-proof-services,personal-integrations';
    finishHomeTransition();
  } catch (error) {
    console.error('[C source integration]', error);
    finishHomeTransition();
  }
})();

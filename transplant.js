(() => {
  const params = new URLSearchParams(location.search);
  const config = {
    hero: ['[data-framer-name="Hero"]', 0],
    about: ['[data-framer-name="About"]', 0],
    clients: ['[data-framer-name="Clients"]', 0],
    work: ['[data-framer-name="Main"]', 0],
    services: ['[data-framer-name="Services"]', 0],
    process: ['[data-framer-name="How it Works"]', 0],
  }[params.get('block')];
  if (!config) return;
  const [targetSelector, ancestorDepth] = config;
  const composerMode = params.get('mode') === 'composer';
  const apply = () => {
    let current = document.querySelector(targetSelector);
    for (let i = 0; current && i < ancestorDepth; i += 1) current = current.parentElement;
    if (!current?.parentElement) return;
    if (composerMode) {
      const rect = current.getBoundingClientRect();
      parent.postMessage({
        type: 'composer-meta',
        block: params.get('block'),
        sourceTop: Math.round(rect.top + window.scrollY),
        sourceHeight: Math.ceil(rect.height),
        documentHeight: document.documentElement.scrollHeight,
      }, '*');
      return;
    }
    const hideNav = params.get('nav') === 'hide';
    const keep = [...current.parentElement.children].filter((child) => (
      child === current || child.contains(current) || (!hideNav && child.querySelector('nav'))
    ));
    [...current.parentElement.children]
      .filter((child) => !keep.includes(child))
      .forEach((child) => child.style.setProperty('display', 'none', 'important'));
    document.querySelectorAll('footer').forEach((footer) => {
      footer.style.setProperty('display', 'none', 'important');
      footer.parentElement?.style.setProperty('display', 'none', 'important');
    });
    window.scrollTo(0, 0);
    parent.postMessage({ type: 'transplant-height', height: Math.ceil(current.getBoundingClientRect().bottom) }, '*');
  };
  apply();
  if (composerMode) {
    window.addEventListener('message', (event) => {
      if (event.data?.type !== 'composer-scroll') return;
      window.scrollTo(0, Number(event.data.y) || 0);
      parent.postMessage({ type: 'composer-scroll-state', block: params.get('block'), scrollY: window.scrollY }, '*');
    });
  }
  let attempts = 0;
  const timer = setInterval(() => {
    apply();
    attempts += 1;
    if (attempts >= 10) clearInterval(timer);
  }, 500);
})();

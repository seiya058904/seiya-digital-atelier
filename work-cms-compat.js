(() => {
  // Compatibility shim for Framer's Work-page CMS requests on static hosting.
  //
  // Why this exists: the Framer runtime requests CMS payloads from
  // framerusercontent.com/cms/… with `?range=` parameters (byte slices of the
  // published payload). A static export cannot serve HTTP range requests for
  // those files, so the Work page content fails to hydrate. This shim serves
  // the same byte ranges from the checked-in copy under
  // /assets/main/framerusercontent.com/cms/ by downloading the file once and
  // slicing it in memory. It only touches GET requests to that CMS path;
  // every other request is passed to the native fetch untouched.
  const nativeFetch = globalThis.fetch.bind(globalThis);
  const cache = new Map();

  const parseRanges = (range, length) => {
    if (!/^[0-9]+(?:-[0-9]+)?(?:,[0-9]+(?:-[0-9]+)?)*$/.test(range)) return null;
    const chunks = [];
    for (const part of range.split(',')) {
      const [fromRaw, toRaw] = part.split('-');
      const from = Number(fromRaw);
      const to = toRaw === undefined ? from : Number(toRaw);
      if (!Number.isInteger(from) || !Number.isInteger(to)) return null;
      if (from < 0 || to < from || from >= length) return null;
      chunks.push([from, Math.min(to, length - 1)]);
    }
    return chunks;
  };

  globalThis.fetch = async (input, init) => {
    const requestUrl = new URL(
      typeof input === 'string' ? input : input instanceof URL ? input.href : input.url,
      window.location.href,
    );

    if (
      (init?.method && init.method !== 'GET')
      || !requestUrl.pathname.includes('/framerusercontent.com/cms/')
    ) {
      return nativeFetch(input, init);
    }

    const range = requestUrl.searchParams.get('range');
    requestUrl.searchParams.delete('range');
    requestUrl.searchParams.set('_cms', 'narrow-1');

    const respond = (source, status, statusText, headers) => {
      const chunks = range && parseRanges(range, source.length);
      if (!chunks) {
        // No range requested, or a malformed/unsatisfiable one: fall back to
        // the full payload rather than emit corrupt sliced content.
        return new Response(source, { status, statusText, headers });
      }
      const body = new Uint8Array(chunks.reduce((size, [from, to]) => size + to - from + 1, 0));
      let offset = 0;
      for (const [from, to] of chunks) {
        body.set(source.subarray(from, to + 1), offset);
        offset += to - from + 1;
      }
      return new Response(body, { status, statusText, headers });
    };

    const cached = cache.get(requestUrl.pathname);
    if (cached) return respond(cached, 200, 'OK', new Headers({ 'content-type': 'application/octet-stream' }));

    const response = await nativeFetch(requestUrl, init);
    if (!response.ok || !range) return response;

    const source = new Uint8Array(await response.arrayBuffer());
    cache.set(requestUrl.pathname, source);
    return respond(source, response.status, response.statusText, response.headers);
  };
})();

(() => {
  const nativeFetch = window.fetch.bind(window);

  window.fetch = async (input, init) => {
    const requestUrl = new URL(typeof input === "string" ? input : input.url, window.location.href);
    const range = requestUrl.searchParams.get("range");

    if (!range || !requestUrl.pathname.includes("/framerusercontent.com/cms/")) {
      return nativeFetch(input, init);
    }

    requestUrl.searchParams.delete("range");
    const response = await nativeFetch(requestUrl, init);
    if (!response.ok) return response;

    const source = new Uint8Array(await response.arrayBuffer());
    const chunks = range.split(",").map((part) => {
      const [from, to] = part.split("-").map(Number);
      return source.slice(from, to + 1);
    });
    const body = new Uint8Array(chunks.reduce((size, chunk) => size + chunk.length, 0));
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.length;
    }

    return new Response(body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  };
})();

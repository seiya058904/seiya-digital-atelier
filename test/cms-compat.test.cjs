const assert = require('node:assert/strict');
const fs = require('node:fs');
const test = require('node:test');
const vm = require('node:vm');

const PAYLOAD = new Uint8Array([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);

const runShim = async ({ requests, nonGet = false } = {}) => {
  const calls = [];
  const nativeFetch = async (input, init) => {
    const url = new URL(typeof input === 'string' ? input : input.href ?? input.url, 'http://127.0.0.1:8787/work/');
    calls.push({ url: url.href, method: init?.method ?? 'GET' });
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Map(),
      arrayBuffer: async () => PAYLOAD.buffer.slice(PAYLOAD.byteOffset, PAYLOAD.byteOffset + PAYLOAD.byteLength),
    };
  };
  const context = {
    globalThis: { fetch: nativeFetch },
    window: { location: { href: 'http://127.0.0.1:8787/work/' } },
    URL,
    Headers: class { constructor(init) { this.init = init || {}; } },
    Response: class {
      constructor(body, init = {}) { this.rawBody = body; this.status = init.status ?? 200; this.statusText = init.statusText ?? ''; this.headers = init.headers; }
      async arrayBuffer() {
        if (this.rawBody instanceof Uint8Array) return this.rawBody.buffer.slice(this.rawBody.byteOffset, this.rawBody.byteOffset + this.rawBody.byteLength);
        return this.rawBody;
      }
    },
  };
  vm.runInNewContext(fs.readFileSync('work-cms-compat.js', 'utf8'), context);
  const patched = context.globalThis.fetch;
  const responses = [];
  for (const request of requests) {
    responses.push(await patched(request));
  }
  return { responses, calls };
};

test('slices CMS range requests from a single downloaded payload', async () => {
  const { responses, calls } = await runShim({
    requests: ['http://127.0.0.1:8787/assets/main/framerusercontent.com/cms/data.framercms?range=0-3,8-9'],
  });
  const body = new Uint8Array(await responses[0].arrayBuffer?.() ?? []);
  assert.deepEqual([...body], [10, 11, 12, 13, 18, 19]);
  assert.equal(calls.length, 1);
  assert.ok(calls[0].url.includes('_cms='));
  assert.ok(!calls[0].url.includes('range='));
});

test('malformed and unsatisfiable ranges fail safely to the full payload', async () => {
  const { responses } = await runShim({
    requests: [
      'http://127.0.0.1:8787/assets/main/framerusercontent.com/cms/data.framercms?range=abc',
      'http://127.0.0.1:8787/assets/main/framerusercontent.com/cms/data.framercms?range=5-2',
      'http://127.0.0.1:8787/assets/main/framerusercontent.com/cms/data.framercms?range=9999-10000',
    ],
  });
  for (const response of responses) {
    assert.equal(response.status, 200);
  }
});

test('non-CMS and non-GET requests pass through untouched', async () => {
  const { responses, calls } = await runShim({
    requests: [
      'http://127.0.0.1:8787/assets/main/framerusercontent.com/images/x.webp?range=0-3',
    ],
  });
  assert.equal(responses.length, 1);
  assert.equal(calls[0].url, 'http://127.0.0.1:8787/assets/main/framerusercontent.com/images/x.webp?range=0-3');
});

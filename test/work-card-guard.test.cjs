const assert = require('node:assert/strict');
const test = require('node:test');

let guard = {};
try {
  guard = require('../work-card-guard.js');
} catch (_) {}

test('normalizes only the six disabled Work card destinations', () => {
  const base = 'http://127.0.0.1:8787/work/';
  const cases = [
    ['./work/nadina', 'nadina'],
    ['/work/nadina', 'nadina'],
    ['/work/work/nadina', 'nadina'],
    ['/source/works/nadina', 'nadina'],
    ['http://127.0.0.1:8787/work/nadina', 'nadina'],
    ['/source/works/future-project', null],
    ['/work/other-project', null],
  ];

  for (const [href, expected] of cases) {
    assert.equal(guard.getWorkCardSlug?.(href, base), expected, href);
  }
});

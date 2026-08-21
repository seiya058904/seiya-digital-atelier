const assert = require('node:assert/strict');
const test = require('node:test');

let guard = {};
try {
  guard = require('../work-card-guard.js');
} catch (_) {}

test('normalizes only the ten disabled Work card destinations', () => {
  const base = 'http://127.0.0.1:8787/work/';
  const cases = [
    ['./work/nadina', 'nadina'],
    ['/work/nadina', 'nadina'],
    ['/work/work/nadina', 'nadina'],
    ['/source/works/nadina', 'nadina'],
    ['http://127.0.0.1:8787/work/nadina', 'nadina'],
    ['/source/works/pulma', 'pulma'],
    ['./works/pulma', 'pulma', 'http://127.0.0.1:8787/source/b'],
    ['/source/works/lumex', 'lumex'],
    ['/source/works/planza', 'planza'],
    ['/source/works/horizon-atlas', 'horizon-atlas'],
    ['/source/works/future-project', null],
    ['/work/other-project', null],
  ];

  for (const [href, expected, hrefBase = base] of cases) {
    assert.equal(guard.getWorkCardSlug?.(href, hrefBase), expected, href);
  }
});

test('disables only the Visual Archive index link', () => {
  const base = 'http://127.0.0.1:8787/';
  assert.equal(guard.isDisabledWorkDestination?.('/source/works', base), true);
  assert.equal(guard.isDisabledWorkDestination?.('/source/works/', base), true);
  assert.equal(guard.isDisabledWorkDestination?.('/source/works/future-project', base), false);
  assert.equal(guard.isDisabledWorkDestination?.('/work', base), false);
});

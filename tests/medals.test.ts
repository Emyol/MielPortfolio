import { test, expect } from '@playwright/test';
import { splitAwards, AWARD_MEDALS } from '../lib/dive/extras.js';
import seed from '../lib/content/seed.json';

const active = seed.awards.items.filter((a) => !a.archived);

test('the four 2026 results become medals, the rest stay in Also, in order', () => {
  const { medals, also } = splitAwards(active);
  expect(medals.map((m) => m.id)).toEqual(['entry-5', 'entry-6', 'entry-7', 'entry-8']);
  expect(medals.map((m) => m.place)).toEqual([1, 1, 2, 2]);
  expect(also.map((a) => a.id)).toEqual(['entry-1', 'entry-2', 'entry-3', 'entry-4']);
});

test('an archived medal award leaves no empty coin', () => {
  const { medals, also } = splitAwards(active.filter((a) => a.id !== 'entry-6'));
  expect(medals.map((m) => m.id)).toEqual(['entry-5', 'entry-7', 'entry-8']);
  expect(also.some((a) => a.id === 'entry-6')).toBe(false);
});

test('medal ids without a matching award are ignored', () => {
  expect(Object.keys(AWARD_MEDALS)).toContain('entry-5');
  expect(splitAwards([])).toEqual({ medals: [], also: [] });
});

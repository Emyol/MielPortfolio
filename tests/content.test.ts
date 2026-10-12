import { test, expect } from '@playwright/test';
import { seedContent, validateContent, getMetrics, isSafeUrl } from '../lib/content/model';

test('the migration seed validates without losing existing content', () => {
  expect(validateContent(structuredClone(seedContent))).toEqual(seedContent);
});

test('untrusted content cannot introduce executable or ambiguous links', () => {
  for (const url of ['javascript:alert(1)', 'data:text/html,<script>alert(1)</script>', '//evil.example', '/%2fexample.com', 'https://user:password@example.com', ' https://example.com', '/\\example.com']) {
    expect(isSafeUrl(url), url).toBe(false);
    const content = structuredClone(seedContent);
    content.hero.primaryHref = url;
    expect(() => validateContent(content), url).toThrow(/safe URL/);
  }
  for (const url of ['https://example.com/credential', '/Amiel_Acuna_CV.pdf', '#projects']) {
    expect(isSafeUrl(url), url).toBe(true);
  }
});

test('experience preserves unknown dates but rejects invalid months and reversed ranges', () => {
  const content = structuredClone(seedContent);
  content.experience.items[0].startDate = '';
  content.experience.items[0].endDate = '';
  expect(validateContent(content).experience.items[0].startDate).toBe('');
  content.experience.items[0].startDate = '2026-13';
  expect(() => validateContent(content)).toThrow(/YYYY-MM/);
  content.experience.items[0].startDate = '2026-10';
  content.experience.items[0].endDate = '2026-09';
  expect(() => validateContent(content)).toThrow(/end date/);
});

test('duplicate list identities are rejected before saving', () => {
  const content = structuredClone(seedContent);
  content.credentials.items.push(structuredClone(content.credentials.items[0]));
  expect(() => validateContent(content)).toThrow(/unique stable IDs/);
});

test('public totals follow active records and preserve manually entered metrics', () => {
  const content = structuredClone(seedContent);
  content.credentials.items[0].archived = true;
  content.work.items[0].archived = true;
  const metrics = getMetrics(content);
  expect(metrics.find(metric => metric.source === 'credentials')?.value).toBe(content.credentials.items.length - 1);
  expect(metrics.find(metric => metric.source === 'work')?.value).toBe(content.work.items.length - 1);
  for (const original of content.about.metrics.filter(metric => metric.source === 'manual')) {
    expect(metrics.find(metric => metric.id === original.id)?.value).toBe(original.value);
  }
});

test('invalid navigation references and duplicate sections cannot publish', () => {
  const content = structuredClone(seedContent);
  content.navigation.items[1].section = content.navigation.items[0].section;
  expect(() => validateContent(content)).toThrow(/navigation section/);
});

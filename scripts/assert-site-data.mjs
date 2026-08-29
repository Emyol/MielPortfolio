import assert from 'node:assert/strict';
import { kit } from '../data/kit.js';
import { site } from '../data/site.js';

assert.equal(typeof site.name, 'string');
assert.ok(site.name.length > 0);
assert.equal(site.url, 'https://miel.dev');
assert.equal(site.brand, 'MIEL.');
assert.ok(site.title);
assert.ok(site.description);
assert.ok(site.portrait.src);
assert.ok(site.about.statementBefore && site.about.statementEm1 && site.about.statementEm2);
assert.ok(site.about.statementAfter);
assert.equal(site.navLinks.length, 4);

assert.equal(site.projects.length, 4);
for (const key of ['id', 'name', 'meta', 'tags', 'desc', 'href', 'index', 'layout']) {
  for (const project of site.projects) {
    assert.ok(project[key], `project ${project.id || '?'} missing ${key}`);
  }
}
assert.deepEqual(
  site.projects.map((p) => p.name),
  ['KitaKo', 'iCARE Reservation', 'BekiLang', 'CitySense']
);

assert.equal(site.orgs.length, 4);
for (const org of site.orgs) {
  assert.ok(org.id && org.org && org.period && org.summary);
  assert.ok(Array.isArray(org.roles) && org.roles.length >= 1);
}

assert.ok(site.distinctions.length >= 4);
assert.ok(site.certifications.length >= 6);
for (const row of [...site.distinctions, ...site.certifications]) {
  assert.ok(row.year && row.text);
}

assert.equal(site.kit, kit);
assert.ok(Array.isArray(kit) && kit.length >= 15);
assert.equal(kit.length, new Set(kit.map((row) => row.id)).size);
for (const row of kit) {
  assert.ok(row.id && row.name && row.mark);
  assert.ok(row.kind === 'tool' || row.kind === 'cert');
}
for (const name of [
  'Git',
  'Flutter',
  'Next.js',
  'ONNX Runtime',
  'SAP Activate',
  'Claude Code',
  'Cursor',
  'Figma',
  'Google Workspace',
]) {
  assert.ok(
    kit.some((row) => row.kind === 'tool' && row.name === name),
    `missing tool ${name}`
  );
}
for (const issuer of [...new Set(site.certifications.map((row) => row.year))]) {
  assert.ok(
    kit.some((row) => row.kind === 'cert' && row.name === issuer),
    `missing cert kit row for ${issuer}`
  );
}

assert.equal(site.contact.email, 'acunaamieljosiah@gmail.com');
assert.ok(site.contact.phone);
assert.ok(site.contact.github);
assert.ok(site.contact.linkedin);
assert.ok(site.contact.cvHref);
assert.ok(!site.description.includes('Rank 2'));
assert.ok(site.certifications.some((row) => row.text.includes('SAP Activate')));

console.log('site data ok');

import assert from 'node:assert/strict';
import { site } from '../data/site.js';
import { nodeById, nodes, railIds, ROOT_ID } from '../data/tree.js';

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

assert.equal(site.contact.email, 'acunaamieljosiah@gmail.com');
assert.ok(site.contact.phone);
assert.ok(site.contact.github);
assert.ok(site.contact.linkedin);
assert.ok(site.contact.cvHref);

assert.equal(ROOT_ID, 'amiel');
assert.equal(nodeById.amiel.label, 'AMIEL');
assert.ok(nodeById.amiel.body.includes('Manila') || nodeById.amiel.location.includes('MANILA'));
assert.ok(nodes.length >= 15);

for (const project of site.projects) {
  assert.ok(nodeById[project.id], `missing project node ${project.id}`);
  assert.equal(nodeById[project.id].href, project.href);
}
for (const org of site.orgs) {
  assert.ok(nodeById[org.id], `missing org node ${org.id}`);
}

assert.ok(nodeById.distinctions.items.some((row) => row.text.includes('Rank 2')));
assert.ok(nodeById.certifications.items.some((row) => row.text.includes('SAP Activate')));
assert.equal(nodeById.contact.contact.email, site.contact.email);
assert.ok(railIds.includes('citysense'));
assert.ok(railIds.includes('icare'));

console.log('site data ok');

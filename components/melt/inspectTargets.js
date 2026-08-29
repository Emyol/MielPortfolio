import { site } from '../../data/site';

const kitako = site.projects.find((row) => row.id === 'kitako');
const sap = site.certifications.find((row) => row.year === 'SAP');
const scc = site.orgs.find((row) => row.id === 'scc');

export const inspectTargets = {
  kitako: {
    id: 'kitako',
    form: 'lens',
    title: kitako.name,
    meta: kitako.meta,
    tags: kitako.tags,
    body: kitako.desc,
    href: kitako.href,
    hrefLabel: 'View Repository',
  },
  sap: {
    id: 'sap',
    form: 'stamp',
    title: sap.text,
    meta: sap.year,
    body: sap.text,
  },
  scc: {
    id: 'scc',
    form: 'bar',
    title: scc.org,
    meta: scc.period,
    body: scc.summary,
    roles: scc.roles,
  },
  contact: {
    id: 'contact',
    form: 'ingot',
    title: site.contact.heading,
    body: site.location.label,
    contact: site.contact,
  },
};

export function pickInspect(nx, ny) {
  if (nx < -0.1 && ny > -0.05) return 'kitako';
  if (nx >= 0.12 && ny > -0.08) return 'sap';
  if (ny < -0.18 && nx < 0.05) return 'scc';
  return 'contact';
}

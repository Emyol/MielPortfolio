import { site } from './site.js';

export const ROOT_ID = 'amiel';

const WORK = [-1.68, 1.22, 0.12];
const PROOF = [1.68, 1.22, -0.08];
const LEAD = [-1.68, -1.12, 0.1];
const CONTACT = [1.68, -1.12, -0.1];

function offset(origin, dx, dy, dz = 0) {
  return [origin[0] + dx, origin[1] + dy, origin[2] + dz];
}

function projectNodes() {
  const spread = [
    [-0.58, 0.52, 0.22],
    [0.58, 0.52, -0.12],
    [-0.58, -0.06, -0.18],
    [0.58, -0.06, 0.14],
  ];
  return site.projects.map((project, i) => ({
    id: project.id,
    label: project.name,
    kind: 'project',
    parentId: 'work',
    position: offset(WORK, ...spread[i]),
    radius: 0.16,
    meta: project.meta,
    title: project.name,
    tags: project.tags,
    body: project.desc,
    href: project.href,
    hrefLabel: 'View Repository',
  }));
}

function orgNodes() {
  const spread = [
    [-0.55, -0.52, 0.18],
    [0.55, -0.52, -0.12],
    [-0.55, 0.08, -0.16],
    [0.55, 0.08, 0.12],
  ];
  return site.orgs.map((org, i) => ({
    id: org.id,
    label: org.id.toUpperCase(),
    kind: 'org',
    parentId: 'leadership',
    position: offset(LEAD, ...spread[i]),
    radius: 0.14,
    meta: org.period,
    title: org.org,
    roles: org.roles,
    body: org.summary,
  }));
}

export const nodes = [
  {
    id: ROOT_ID,
    label: 'AMIEL',
    kind: 'root',
    parentId: null,
    position: [0, 0, 0],
    radius: 0.72,
    meta: 'RANK 2  /  BATCH 27  /  TRUNK',
    title: site.name,
    hero: site.hero.titleLines.join(' '),
    location: site.location.label,
    body: `${site.description} ${site.about.statementBefore}${site.about.statementEm1}${site.about.statementMid}${site.about.statementEm2}${site.about.statementAfter}`,
    stacks: site.about.stacks,
    portrait: site.portrait,
  },
  {
    id: 'work',
    label: 'WORK',
    kind: 'branch',
    parentId: ROOT_ID,
    position: WORK,
    radius: 0.22,
    meta: 'BRANCH',
    title: 'Selected works',
    body: 'Four systems. On-device retrieval, campus tooling, a language, a map.',
  },
  {
    id: 'proof',
    label: 'PROOF',
    kind: 'branch',
    parentId: ROOT_ID,
    position: PROOF,
    radius: 0.22,
    meta: 'BRANCH',
    title: 'Proof',
    body: 'Rank, leadership marks, and certifications.',
  },
  {
    id: 'distinctions',
    label: 'MARKS',
    kind: 'list',
    parentId: 'proof',
    position: offset(PROOF, -0.5, 0.58, 0.12),
    radius: 0.14,
    meta: 'DISTINCTIONS',
    title: 'Distinctions',
    items: site.distinctions,
  },
  {
    id: 'certifications',
    label: 'CERTS',
    kind: 'list',
    parentId: 'proof',
    position: offset(PROOF, 0.52, 0.56, -0.1),
    radius: 0.14,
    meta: 'CERTIFICATIONS',
    title: 'Certifications',
    items: site.certifications,
  },
  {
    id: 'leadership',
    label: 'LEADERSHIP',
    kind: 'branch',
    parentId: ROOT_ID,
    position: LEAD,
    radius: 0.22,
    meta: 'BRANCH',
    title: 'Leadership',
    body: 'Campus logistics across iCARE, SCC, ACM, and JPCS.',
  },
  {
    id: 'contact',
    label: 'CONTACT',
    kind: 'contact',
    parentId: ROOT_ID,
    position: CONTACT,
    radius: 0.22,
    meta: `${site.location.city}  /  ${site.status}`,
    title: site.contact.heading,
    body: site.location.available,
    contact: site.contact,
  },
  ...projectNodes(),
  ...orgNodes(),
];

export const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n]));

export const edges = nodes
  .filter((n) => n.parentId)
  .map((n) => ({
    id: `${n.parentId}->${n.id}`,
    from: n.parentId,
    to: n.id,
  }));

export const railIds = [
  ROOT_ID,
  'work',
  'kitako',
  'icare-reservation',
  'bekilang',
  'citysense',
  'proof',
  'distinctions',
  'certifications',
  'leadership',
  'icare',
  'scc',
  'acm',
  'jpcs',
  'contact',
];

export default nodes;

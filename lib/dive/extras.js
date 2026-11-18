// Details the Dive design shows that the editable content model does not hold yet.
// Keyed by work item id and practice title. Kept in code on purpose: adding fields to
// seed.json makes stored Supabase content fail validation until it is upgraded
// (current-state.md §5, item 2). Move these into lib/content/model.ts with an upgrade step later.

export const WORK_EXTRAS = {
  kitako: {
    window: 'KitaKo · project site',
    facts: [
      'Searches the photo gallery on a phone by meaning, in Taglish, with no server and no internet connection.',
      'SigLIP-2 embeddings with an IVF-PQ approximate nearest-neighbour index, for retrieval in milliseconds.',
      'Runs on ONNX Runtime inside a Flutter app, and can also find photos similar to one from the camera or gallery.',
    ],
    stack: ['Flutter', 'Dart', 'ONNX Runtime', 'SigLIP-2', 'IVF-PQ'],
    pieceLabel: 'Try a Taglish search',
  },
  icare: {
    window: 'iCARE · Availability',
    facts: [
      'Books iCARE’s shared rooms and stops clashing requests before they are sent.',
      'Its booking rules have unit tests: same-room overlaps are blocked, back-to-back bookings pass, room capacity is enforced, and past or overnight times are rejected.',
      'Times are checked against Philippine wall-clock time.',
    ],
    stack: ['Next.js', 'JavaScript', 'Node test runner'],
    pieceLabel: 'Try to cause a clash',
  },
  bekilang: {
    window: 'BekiLang Studio',
    facts: [
      'Keywords come from Swardspeak: borta for whole numbers, chika for text, parinig to print, kunwari for if, gorabel to loop.',
      'Five data types, arithmetic, comparisons, logic, if / else, and while loops.',
      'The compiler and interpreter are written in Python, with a web playground.',
    ],
    stack: ['Python', 'Compilers', 'Interpreters'],
    pieceLabel: 'Run a BekiLang program',
  },
  citysense: {
    window: 'CitySense',
    facts: [
      'A geospatial cockpit for urban planners shaping climate-resilient policy.',
      'Streams NASA GIBS, SEDAC, GHSL and WorldPop layers onto one Leaflet map, switched by theme: heat, greenspace, water, air, built-up area, population.',
      'A DeepSeek R1 assistant blends live Open-Meteo weather with planning advice.',
    ],
    stack: ['TypeScript', 'Vite', 'Leaflet', 'NASA GIBS', 'DeepSeek R1'],
    pieceLabel: 'Switch the layers',
  },
};

// Each discipline points at the project that proves it, with its stack as one line.
// A discipline without a project points at the experience section instead.
export const DISCIPLINE_PROOF = {
  'Edge intelligence': { work: 'kitako', stack: 'Flutter · Dart · ONNX Runtime' },
  'Language systems': { work: 'bekilang', stack: 'Python' },
  'Geospatial products': { work: 'citysense', stack: 'TypeScript · Leaflet · NASA GIBS' },
  'Operational leadership': { work: null, stack: 'Logistics for SCC, ACM and JPCS, 2023 to 2026' },
};

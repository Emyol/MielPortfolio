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
      'Won 3rd Best Overall Thesis, 1st Most Innovative Project and Best Thesis in Algorithms at CS Expo 2026.',
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
  homestead: {
    window: 'Homestead · mission setup',
    facts: [
      'Four astronauts get three minutes to scavenge rocket parts, then fly what they built, each at their own station, and land to finish Mission Control’s list.',
      'I built the solar panel cleaning game in the shipped game. In the first TypeScript build I made the Engineer and Science stations: a power bus with a breaker, a hull weld, an energy core with a coolant valve, and an oxygen converter, each set by the mounted parts.',
      'Part stats, hazards and the mission report come from NASA sources. Up to four players join online over WebRTC with a six-character code.',
    ],
    stack: ['JavaScript', 'TypeScript', 'Canvas 2D', 'WebRTC', 'PeerJS'],
    pieceLabel: 'Design the mission',
  },
  eventflow: {
    window: 'EventFlow · certificate',
    facts: [
      'One n8n workflow takes a registration, a check-in scan and a project submission, and moves each attendee from Registered to Attended to Completed.',
      'I made the check-in token the only proof: a missing, unknown or borrowed token is rejected, and a certificate goes only to someone who checked in and submitted.',
      'Each certificate is a PDF with a verification ID, sent with a badge. A public verify page confirms the ID, and an email is marked sent only once Gmail delivers it.',
    ],
    stack: ['n8n', 'JavaScript', 'Google Sheets', 'Gmail', 'Notion'],
    pieceLabel: 'Run the organizer’s batch',
  },
  kislap: {
    window: 'Kislap · reading game',
    facts: [
      'Children in Grades 1 to 3 read Filipino and Taglish stories aloud. A Whisper model in the browser checks each word, so no audio leaves the device and it works offline.',
      'I wrote the three stories and the scorer that lines up the words it heard with the story. The scorer is lenient with children’s voices and Taglish.',
      'I also wrote the Filipino and English screen text and the recovery for damaged saved progress, so a child keeps their stars and stickers.',
    ],
    stack: ['TypeScript', 'React', 'Transformers.js', 'Whisper', 'PWA'],
    pieceLabel: 'Score a reading',
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

// Recognition: which awards are drawn as medals, keyed by award id. Organiser and year come
// from the award itself. Kept here, like WORK_EXTRAS, so stored content still validates.
export const AWARD_MEDALS = {
  'entry-5': { place: 1, label: 'Track D Champion', short: 'n8n Buildathon Finals' },
  'entry-6': { place: 1, label: 'Champion', short: 'CyberXploit CTF' },
  'entry-7': { place: 2, label: '2nd Place', short: 'OpenAI Campus Hackathon' },
  'entry-8': { place: 2, label: '1st Runner-Up', short: 'SEEN Cyber Rumble CTF' },
};

// Splits active awards into medals and the rest, keeping content order in both.
export function splitAwards(awards) {
  const medals = [], also = [];
  for (const a of awards) {
    const m = AWARD_MEDALS[a.id];
    if (m) medals.push({ ...a, ...m }); else also.push(a);
  }
  return { medals, also };
}

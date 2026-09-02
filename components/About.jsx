"use client";

import PinTitle from './PinTitle';
import { TextRevealByWord } from '@/components/ui/text-reveal';

const DISCIPLINE_LEDE =
  'I work where constrained computing meets human coordination: private AI on-device, expressive developer tools, map-based decision systems, and delivery operations.';

const STACK = [
  { label: 'Languages', items: ['Python', 'TypeScript', 'Dart', 'Kotlin', 'C / C++'] },
  { label: 'Runtime', items: ['Flutter', 'Next.js', 'ONNX Runtime', 'REST APIs'] },
  { label: 'Domains', items: ['On-device ML', 'Vector retrieval', 'Geospatial', 'Compilers'] },
  { label: 'Delivery', items: ['Git', 'SAP Activate', 'Agile / Scrum', 'Claude Code'] },
];

const AREAS = [
  ['Edge intelligence', 'Local inference and retrieval without server dependency.'],
  ['Language systems', 'Lexers, parsers, ASTs, interpreters, and usable tooling.'],
  ['Geospatial products', 'Complex environmental data made legible for decisions.'],
  ['Operational leadership', 'Plans, resources, and teams aligned around delivery.'],
];

export default function About() {
  return (
    <section id="about" className="field-section" aria-labelledby="about-title" data-pin-section>
      <div className="field-shell field-split">
        <PinTitle id="about-title">Discipline</PinTitle>
        <div>
          <TextRevealByWord text={DISCIPLINE_LEDE} />
          <div className="discipline-grid">
            <div className="capability-statement">
              <blockquote>Build the system clearly. Make the handoff reliable.</blockquote>
            </div>
            <div className="discipline-areas">
              {AREAS.map(([title, description]) => (
                <article key={title}>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              ))}
            </div>
            <div className="stack-matrix">
              {STACK.map((group) => (
                <article key={group.label} className="stack-cluster">
                  <h3>{group.label}</h3>
                  <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import PinTitle from './PinTitle';
import DisciplineMarquee from './DisciplineMarquee';
import { TextRevealByWord } from '@/components/ui/text-reveal';

const DISCIPLINE_LEDE =
  'I work where constrained computing meets human coordination: private AI on-device, expressive developer tools, map-based decision systems, and delivery operations.';

const METRICS = [
  { value: 2, pad: 2, suffix: '', label: "Batch '27 rank" },
  { value: 700, pad: 0, suffix: '+', label: 'Students supported' },
  { value: 4, pad: 2, suffix: '', label: 'Selected systems' },
  { value: 6, pad: 2, suffix: '', label: 'Credentials' },
];

const STACK = [
  { label: 'Languages', items: ['Python', 'TypeScript', 'Dart', 'Kotlin', 'C / C++'] },
  { label: 'Runtime', items: ['Flutter', 'Next.js', 'ONNX Runtime', 'REST APIs'] },
  { label: 'Domains', items: ['On-device ML', 'Vector retrieval', 'Geospatial', 'Compilers'] },
  { label: 'Delivery', items: ['Git', 'SAP Activate', 'Agile / Scrum', 'Claude Code'] },
];

function formatMetric(value, pad, suffix) {
  return `${String(value).padStart(pad, '0')}${suffix}`;
}

export default function About() {
  return (
    <section id="about" className="field-section" aria-labelledby="about-title" data-pin-section>
      <div className="field-shell field-split">
        <PinTitle id="about-title">Discipline</PinTitle>
        <div className="discipline-intro">
          <TextRevealByWord text={DISCIPLINE_LEDE} />
          <div className="discipline-grid">
            <div className="capability-statement">
              <blockquote>Build the system clearly. Make the handoff reliable.</blockquote>
            </div>
            <dl className="field-measures">
              {METRICS.map((metric) => (
                <div key={metric.label}>
                  <dt>{metric.label}</dt>
                  <dd>
                    <span
                      data-count={metric.value}
                      data-pad={metric.pad}
                      data-suffix={metric.suffix}
                    >
                      {formatMetric(metric.value, metric.pad, metric.suffix)}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
      <DisciplineMarquee />
      <div className="field-shell discipline-stack-shell">
        <div className="stack-matrix">
          {STACK.map((group) => (
            <article key={group.label} className="stack-cluster">
              <h3>{group.label}</h3>
              <ul>{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

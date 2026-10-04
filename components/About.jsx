"use client";

import PinTitle from './PinTitle';
import DisciplineMarquee from './DisciplineMarquee';
import StackMarquee from './StackMarquee';

const DISCIPLINE_LEDE =
  'I work where constrained computing meets human coordination: private AI on-device, expressive developer tools, map-based decision systems, and delivery operations.';

const METRICS = [
  { value: 2, pad: 2, suffix: '', label: "Batch '27 rank" },
  { value: 700, pad: 0, suffix: '+', label: 'Students supported' },
  { value: 4, pad: 2, suffix: '', label: 'Selected systems' },
  { value: 6, pad: 2, suffix: '', label: 'Credentials' },
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
          <p className="field-lede">{DISCIPLINE_LEDE}</p>
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
      <div className="field-shell">
        <StackMarquee />
      </div>
    </section>
  );
}

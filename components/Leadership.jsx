"use client";

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import PinTitle from './PinTitle';

const ORGS = [
  {
    org: 'iCARE, FEU Institute of Technology',
    period: 'Sep 2023 — Present',
    summary: 'Facilitates peer tutoring and faculty-led review sessions for more than 700 STEM students.',
    roles: [{ year: 'Sep 2023 — Present', title: 'Student Assistant' }],
  },
  {
    org: 'FEU Tech Student Coordinating Council',
    period: 'Aug 2023 — Aug 2025',
    summary: 'Directed logistics planning, resource allocation, and campus-wide event execution for thousands of students.',
    roles: [
      { year: 'Aug 2024 — Aug 2025', title: 'Director for Logistics' },
      { year: 'Aug 2023 — Aug 2024', title: 'Junior Officer for Logistics' },
    ],
  },
  {
    org: 'FEU Tech ACM Student Chapter',
    period: 'Aug 2023 — Aug 2026',
    summary: 'Built logistics capability, then aligned chapter initiatives with university policy as institutional liaison.',
    roles: [
      { year: 'Aug 2025 — Aug 2026', title: 'SCC Representative' },
      { year: 'Aug 2024 — Aug 2025', title: 'Associate Director for Logistics' },
      { year: 'Aug 2023 — Aug 2024', title: 'Junior Officer for Logistics' },
    ],
  },
  {
    org: 'FEU Tech Junior Philippine Computer Society',
    period: 'Aug 2023 — Aug 2024',
    summary: 'Supported departmental technology events through check-in, supply distribution, and venue preparation.',
    roles: [{ year: 'Aug 2023 — Aug 2024', title: 'Junior Officer for Logistics' }],
  },
];

export default function Leadership() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="leadership" className="field-section" aria-labelledby="leadership-title" data-pin-section>
      <div className="field-shell field-split">
        <PinTitle id="leadership-title">Leadership</PinTitle>
        <div>
          <p className="field-lede">Organizations, scope, and the roles that compound.</p>
          <div className="leadership-list">
            {ORGS.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <article key={item.org}>
                  <button
                    type="button"
                    className="leadership-summary"
                    aria-expanded={isOpen}
                    aria-controls={`leadership-panel-${index}`}
                    onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  >
                    <span>
                      <strong>{item.org}</strong>
                      <small>{item.period}</small>
                    </span>
                    <span className="leadership-count">
                      <small>{item.roles.length} {item.roles.length === 1 ? 'role' : 'roles'}</small>
                      <ChevronDown aria-hidden="true" className={isOpen ? 'is-open' : ''} />
                    </span>
                  </button>
                  <div id={`leadership-panel-${index}`} className="leadership-panel" hidden={!isOpen}>
                    <p>{item.summary}</p>
                    <ol>
                      {item.roles.map((role) => (
                        <li key={`${role.year}-${role.title}`}>
                          <time>{role.year}</time>
                          <span>{role.title}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CERTS = [
  { issuer: 'PMI', title: 'Project Management Ready™' },
  { issuer: 'SAP', title: 'Certified Project Manager — SAP Activate' },
  { issuer: 'Certiport', title: 'IT Specialist — Python' },
  { issuer: 'Anthropic', title: 'Claude Code in Action' },
  { issuer: 'Google', title: 'Gemini Certified University Student' },
  { issuer: 'MathWorks', title: 'MATLAB Onramp' },
];

const wrap = (index) => (index + CERTS.length) % CERTS.length;

export default function CertCarousel() {
  const [active, setActive] = useState(0);
  const cert = CERTS[active];

  return (
    <div
      className="credential-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Professional credentials"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') setActive(wrap(active - 1));
        if (event.key === 'ArrowRight') setActive(wrap(active + 1));
      }}
    >
      <div className="credential-stage" aria-live="polite">
        <p>{cert.issuer}</p>
        <h4>{cert.title}</h4>
        <output>{active + 1} / {CERTS.length}</output>
      </div>
      <div className="credential-controls">
        <Button type="button" size="sm" variant="outline" onClick={() => setActive(wrap(active - 1))} aria-label="Previous credential">
          <ChevronLeft /> Previous
        </Button>
        <div className="credential-jump" aria-label="Choose credential">
          {CERTS.map((item, index) => (
            <Button
              key={item.issuer}
              type="button"
              size="sm"
              variant={index === active ? 'default' : 'ghost'}
              aria-label={`Show ${item.issuer} credential`}
              aria-current={index === active ? 'true' : undefined}
              onClick={() => setActive(index)}
            >
              {index + 1}
            </Button>
          ))}
        </div>
        <Button type="button" size="sm" variant="outline" onClick={() => setActive(wrap(active + 1))} aria-label="Next credential">
          Next <ChevronRight />
        </Button>
      </div>
    </div>
  );
}

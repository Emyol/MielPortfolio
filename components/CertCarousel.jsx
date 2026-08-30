"use client";

import { useCallback, useEffect, useState } from "react";

const CERTS = [
  {
    issuer: "PMI",
    title: "Project Management Ready™",
    glyph: "  ████  \n ██  ██ \n ██████ \n ██  ██ \n  ████  ",
  },
  {
    issuer: "SAP",
    title: "Certified Project Manager — SAP Activate",
    glyph: " ██████ \n██    ██\n ██████ \n      ██\n ██████ ",
  },
  {
    issuer: "Certiport",
    title: "IT Specialist — Python",
    glyph: "██████  \n██  ██  \n██████  \n██      \n██      ",
  },
  {
    issuer: "Anthropic",
    title: "Claude Code in Action",
    glyph: "  ███   \n █   █  \n █████  \n █   █  \n █   █  ",
  },
  {
    issuer: "Google",
    title: "Gemini Certified University Student",
    glyph: " ██████ \n██      \n██  ███ \n██   ██ \n ██████ ",
  },
  {
    issuer: "MathWorks",
    title: "MATLAB Onramp",
    glyph: "██   ██ \n███  ██ \n██ █ ██ \n██  ███ \n██   ██ ",
  },
];

function wrapIndex(index, length) {
  return ((index % length) + length) % length;
}

export default function CertCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((delta) => {
    setActive((prev) => wrapIndex(prev + delta, CERTS.length));
  }, []);

  useEffect(() => {
    if (paused) return undefined;

    const timer = setInterval(() => {
      setActive((prev) => wrapIndex(prev + 1, CERTS.length));
    }, 4500);

    return () => clearInterval(timer);
  }, [paused]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  return (
    <div
      className="cert-carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      role="region"
      aria-label="Certifications carousel"
      aria-roledescription="carousel"
    >
      <div className="cert-carousel-stage">
        {CERTS.map((cert, index) => {
          let offset = index - active;
          if (offset > CERTS.length / 2) offset -= CERTS.length;
          if (offset < -CERTS.length / 2) offset += CERTS.length;

          const isActive = offset === 0;
          const absOffset = Math.abs(offset);

          return (
            <article
              key={cert.issuer + cert.title}
              className={`cert-card ${isActive ? "is-active" : ""}`}
              style={{
                "--offset": offset,
                "--abs-offset": absOffset,
                zIndex: 10 - absOffset,
              }}
              aria-hidden={!isActive}
              aria-label={isActive ? `${cert.issuer}: ${cert.title}` : undefined}
            >
              <pre className="cert-card-border" aria-hidden="true">
{`┌─ CERTIFICATE ─────────────────────┐
│                                   │
│                                   │
│                                   │
└───────────────────────────────────┘`}
              </pre>
              <div className="cert-card-body">
                <span className="cert-card-issuer">[ {cert.issuer} ]</span>
                <h4 className="cert-card-title">{cert.title}</h4>
                <pre className="cert-card-glyph" aria-hidden="true">{cert.glyph}</pre>
                <span className="cert-card-status">● VERIFIED</span>
              </div>
            </article>
          );
        })}
      </div>

      <div className="cert-carousel-controls">
        <button
          type="button"
          className="cert-carousel-btn"
          onClick={() => go(-1)}
          aria-label="Previous certificate"
        >
          &lt; PREV
        </button>
        <div className="cert-carousel-dots" role="tablist" aria-label="Certificate slides">
          {CERTS.map((cert, index) => (
            <button
              key={cert.issuer}
              type="button"
              role="tab"
              className={`cert-carousel-dot ${index === active ? "is-active" : ""}`}
              aria-selected={index === active}
              aria-label={`Show ${cert.issuer} certificate`}
              onClick={() => setActive(index)}
            >
              {index === active ? "[●]" : "[ ]"}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="cert-carousel-btn"
          onClick={() => go(1)}
          aria-label="Next certificate"
        >
          NEXT &gt;
        </button>
      </div>
    </div>
  );
}

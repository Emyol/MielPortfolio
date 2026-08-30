"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { CERTIFICATES, certificateImagePath } from "../data/certificates";

function wrapIndex(index, length) {
  return ((index % length) + length) % length;
}

function CertCardContent({ cert, showImage }) {
  if (showImage) {
    return (
      <div className="cert-card-image-wrap">
        <Image
          src={certificateImagePath(cert.slug)}
          alt={`${cert.issuer} — ${cert.title}`}
          fill
          sizes="280px"
          className="cert-card-image"
        />
        <div className="cert-card-image-meta">
          <span className="cert-card-issuer">[ {cert.issuer} ]</span>
          <span className="cert-card-status">● VERIFIED</span>
        </div>
      </div>
    );
  }

  return (
    <>
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
    </>
  );
}

function CertCard({ cert, offset, absOffset, isActive }) {
  const [imageReady, setImageReady] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const img = new window.Image();
    img.src = certificateImagePath(cert.slug);
    img.onload = () => { if (!cancelled) setImageReady(true); };
    img.onerror = () => { if (!cancelled) setImageReady(false); };
    return () => { cancelled = true; };
  }, [cert.slug]);

  return (
    <article
      className={`cert-card ${isActive ? "is-active" : ""} ${imageReady ? "has-image" : ""}`}
      style={{
        "--offset": offset,
        "--abs-offset": absOffset,
        zIndex: 10 - absOffset,
      }}
      aria-hidden={!isActive}
      aria-label={isActive ? `${cert.issuer}: ${cert.title}` : undefined}
    >
      {imageReady === null ? (
        <div className="cert-card-loading" aria-hidden="true">...</div>
      ) : (
        <CertCardContent cert={cert} showImage={imageReady} />
      )}
    </article>
  );
}

export default function CertCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((delta) => {
    setActive((prev) => wrapIndex(prev + delta, CERTIFICATES.length));
  }, []);

  useEffect(() => {
    if (paused) return undefined;

    const timer = setInterval(() => {
      setActive((prev) => wrapIndex(prev + 1, CERTIFICATES.length));
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
        {CERTIFICATES.map((cert, index) => {
          let offset = index - active;
          if (offset > CERTIFICATES.length / 2) offset -= CERTIFICATES.length;
          if (offset < -CERTIFICATES.length / 2) offset += CERTIFICATES.length;

          const isActive = offset === 0;
          const absOffset = Math.abs(offset);

          return (
            <CertCard
              key={cert.slug}
              cert={cert}
              offset={offset}
              absOffset={absOffset}
              isActive={isActive}
            />
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
          {CERTIFICATES.map((cert, index) => (
            <button
              key={cert.slug}
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

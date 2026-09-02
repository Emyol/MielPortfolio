"use client";

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

function formatMetric(value, pad, suffix) {
  return `${String(Math.round(value)).padStart(pad, '0')}${suffix}`;
}

export default function PageMotion() {
  useGSAP(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduced) {
      gsap.set('.field-title-word, [data-hero-item], [data-hero-visual], .field-pin-inner', {
        opacity: 1,
        yPercent: 0,
        clearProps: 'transform,clipPath,filter',
      });
      return;
    }

    gsap.set('.field-title-word', { yPercent: 112 });
    gsap.set('.field-pin-inner', { yPercent: 108 });
    gsap.set('[data-hero-visual]', { opacity: 0.4 });

    const heroTimeline = gsap.timeline({ defaults: { ease: 'power4.out' } });
    heroTimeline
      .to('.field-title-word', {
        yPercent: 0,
        duration: 1.15,
        stagger: 0.14,
      })
      .fromTo(
        '[data-hero-item]',
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 },
        0.35,
      )
      .to('[data-hero-visual]', {
        opacity: 1,
        duration: 1.05,
      }, 0.18);

    document.querySelectorAll('[data-count]').forEach((node) => {
      const target = Number(node.getAttribute('data-count') || 0);
      const pad = Number(node.getAttribute('data-pad') || 0);
      const suffix = node.getAttribute('data-suffix') || '';
      const state = { value: 0 };
      gsap.to(state, {
        value: target,
        duration: 1.2,
        delay: 0.55,
        ease: 'power2.out',
        onUpdate: () => {
          node.textContent = formatMetric(state.value, pad, suffix);
        },
      });
    });

    gsap.utils.toArray('[data-pin-section]').forEach((section) => {
      const inner = section.querySelectorAll('.field-pin-inner');
      if (!inner.length) return;
      gsap.to(inner, {
        yPercent: 0,
        ease: 'none',
        stagger: 0.08,
        scrollTrigger: {
          trigger: section,
          start: 'top 78%',
          end: 'top 32%',
          scrub: 0.65,
        },
      });
    });
  });

  return null;
}

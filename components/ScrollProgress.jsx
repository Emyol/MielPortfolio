"use client";

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function ScrollProgress() {
  const barRef = useRef(null);

  useGSAP(() => {
    if (!barRef.current) return;
    gsap.fromTo(barRef.current, { scaleX: 0 }, {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { start: 'top top', end: 'max', scrub: 0.2 },
    });
  }, { scope: barRef });

  return <div className="scroll-progress" aria-hidden="true"><div ref={barRef} className="scroll-progress-bar" /></div>;
}

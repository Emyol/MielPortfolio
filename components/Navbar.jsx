"use client";

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import CommandPalette from './CommandPalette';

gsap.registerPlugin(ScrollTrigger, useGSAP);

const LINKS = [
  { id: 'about', label: 'Discipline' },
  { id: 'credentials', label: 'Credentials' },
  { id: 'projects', label: 'Work' },
  { id: 'leadership', label: 'Leadership' },
  { id: 'contact', label: 'Contact' },
];

export default function Navbar() {
  const [active, setActive] = useState('');
  const navRef = useRef(null);

  useGSAP(() => {
    const trigger = ScrollTrigger.create({
      start: 40,
      end: 'max',
      onUpdate: (self) => navRef.current?.classList.toggle('is-scrolled', self.scroll() > 40),
    });
    return () => trigger.kill();
  }, { scope: navRef });

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    LINKS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav ref={navRef} className="field-nav" aria-label="Primary navigation">
      <a href="#hero" className="field-brand" aria-label="Go to introduction">Miel</a>
      <div className="field-nav-links">
        {LINKS.map(({ id, label }) => (
          <a
            key={id}
            href={`#${id}`}
            className={active === id ? 'is-active' : ''}
            aria-current={active === id ? 'page' : undefined}
          >
            {label}
          </a>
        ))}
      </div>
      <CommandPalette />
    </nav>
  );
}

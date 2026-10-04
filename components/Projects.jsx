"use client";

import { Braces, CalendarDays, MapPinned, ScanSearch } from 'lucide-react';
import PinTitle from './PinTitle';
import { ExpandingCards } from '@/components/ui/expanding-cards';

const projects = [
  {
    id: 'kitako', title: 'KitaKo', meta: 'Undergraduate thesis · 2026',
    description: 'Private semantic image search that understands Taglish queries and runs entirely on-device.',
    imgSrc: '/projects/kitako.jpg?v=7', icon: <ScanSearch aria-hidden="true" />,
    linkHref: 'https://github.com/Emyol/KitaKo_Codebase',
  },
  {
    id: 'icare', title: 'iCARE Reservation', meta: 'Internal tooling · 2026',
    description: 'A shared-facility portal that reduces booking friction and catches room conflicts before submission.',
    imgSrc: '/projects/icare.jpg?v=6', icon: <CalendarDays aria-hidden="true" />,
    linkHref: 'https://github.com/Emyol/iCARE-Reservation',
  },
  {
    id: 'bekilang', title: 'BekiLang', meta: 'Domain-specific language · 2026',
    description: 'A working programming language and web playground built around Philippine Swardspeak.',
    imgSrc: '/projects/bekilang.jpg?v=6', icon: <Braces aria-hidden="true" />,
    linkHref: 'https://github.com/Emyol/BekiLang',
  },
  {
    id: 'citysense', title: 'CitySense', meta: 'NASA Space Apps Challenge · 2025',
    description: 'A planning cockpit that combines live environmental layers with an AI-assisted policy workflow.',
    imgSrc: '/projects/citysense.jpg?v=6', icon: <MapPinned aria-hidden="true" />,
    linkHref: 'https://github.com/Emyol/city-sense',
  },
];

export default function Projects() {
  return (
    <section id="projects" className="field-section" aria-labelledby="projects-title" data-pin-section>
      <div className="field-shell field-split">
        <PinTitle id="projects-title">Selected systems</PinTitle>
        <div>
          <p className="field-lede">Four systems. Explore each one, then open its repository.</p>
          <ExpandingCards items={projects} aria-label="Selected projects" data-work-gallery />
        </div>
      </div>
    </section>
  );
}

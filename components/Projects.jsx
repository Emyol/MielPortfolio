"use client";

import { Braces, CalendarDays, MapPinned, ScanSearch } from 'lucide-react';
import PinTitle from './PinTitle';
import { ExpandingCards } from '@/components/ui/expanding-cards';

export default function Projects({ content }) {
 const icons={Braces, CalendarDays, MapPinned, ScanSearch};
 const projects=content.work.items.filter(item=>!item.archived).map(item=>{const Icon=icons[item.icon] || Braces;return {...item,icon:<Icon aria-hidden="true" />};});
  return (
    <section id="projects" className="field-section" aria-labelledby="projects-title" data-pin-section>
      <div className="field-shell field-split">
        <PinTitle id="projects-title">{content.work.title}</PinTitle>
        <div>
          <p className="field-lede">{content.work.lede}</p>
          <ExpandingCards items={projects} aria-label="Selected projects" data-work-gallery />
          {projects.some(item=>item.demoUrl) && <ul>{projects.filter(item=>item.demoUrl).map(item=><li key={item.id}><a href={item.demoUrl} target="_blank" rel="noopener noreferrer">{item.title}: open demo</a></li>)}</ul>}
        </div>
      </div>
    </section>
  );
}

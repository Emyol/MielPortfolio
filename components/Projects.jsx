"use client";

import { useMemo, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import PinTitle from './PinTitle';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const PROJECTS = [
  {
    id: 'kitako', year: '2026', type: 'Undergraduate thesis', name: 'KitaKo',
    categories: ['AI', 'Mobile'], stack: ['Flutter', 'ONNX Runtime', 'SigLIP-2', 'IVF-PQ'],
    summary: 'Private semantic image search that understands Taglish queries and runs entirely on-device.',
    evidence: ['Zero server dependency', 'Sub-second local retrieval', 'Vision-language embeddings'],
    href: 'https://github.com/Emyol/KitaKo_Codebase',
    live: 'https://kitako-stochastic4.vercel.app/',
    preview: '/projects/kitako.jpg?v=7',
  },
  {
    id: 'icare', year: '2026', type: 'Internal tooling', name: 'iCARE Reservation',
    categories: ['Web', 'Operations'], stack: ['JavaScript', 'Web App', 'Scheduling'],
    summary: 'A shared-facility portal that reduces booking friction and catches room conflicts before submission.',
    evidence: ['Multi-room conflict checks', 'Schedule visibility', 'Administrative workflow'],
    href: 'https://github.com/Emyol/iCARE-Reservation',
    live: 'https://icare-reservation.vercel.app/dashboard',
    preview: '/projects/icare.jpg?v=6',
  },
  {
    id: 'bekilang', year: '2026', type: 'Domain-specific language', name: 'BekiLang',
    categories: ['Languages', 'Web'], stack: ['Python', 'Compiler', 'Interpreter', 'AST'],
    summary: 'A working programming language and web playground built around Philippine Swardspeak.',
    evidence: ['Lexer and parser', 'Typed AST interpreter', 'Interactive playground'],
    href: 'https://github.com/Emyol/BekiLang',
    live: 'https://beki-lang.vercel.app/',
    preview: '/projects/bekilang.jpg?v=6',
  },
  {
    id: 'citysense', year: '2025', type: 'NASA Space Apps Challenge', name: 'CitySense',
    categories: ['Geospatial', 'AI', 'Web'], stack: ['TypeScript', 'Leaflet', 'NASA GIBS', 'DeepSeek'],
    summary: 'A planning cockpit that combines live environmental layers with an AI-assisted policy workflow.',
    evidence: ['Live NASA layers', 'Equity indicators', 'Planning assistant'],
    href: 'https://github.com/Emyol/city-sense',
    live: 'https://stochastics-city-sense.netlify.app/',
    preview: '/projects/citysense.jpg?v=6',
  },
];

const FILTERS = ['All', 'AI', 'Web', 'Languages', 'Geospatial', 'Operations', 'Mobile'];

export default function Projects() {
  const [filter, setFilter] = useState('All');
  const [activeId, setActiveId] = useState(PROJECTS[0].id);
  const visibleProjects = useMemo(
    () => (filter === 'All' ? PROJECTS : PROJECTS.filter((project) => project.categories.includes(filter))),
    [filter],
  );
  const activeProject = visibleProjects.find((project) => project.id === activeId) ?? visibleProjects[0];

  const chooseFilter = (nextFilter) => {
    const nextVisible = nextFilter === 'All'
      ? PROJECTS
      : PROJECTS.filter((project) => project.categories.includes(nextFilter));
    setFilter(nextFilter);
    if (!nextVisible.some((project) => project.id === activeId)) setActiveId(nextVisible[0].id);
  };

  return (
    <section id="projects" className="field-section" aria-labelledby="projects-title" data-pin-section>
      <div className="field-shell field-split">
        <PinTitle id="projects-title">Selected systems</PinTitle>
        <div>
          <p className="field-lede">Four systems. Filter, then read one at a time.</p>
          <div className="work-filters" aria-label="Work filters">
            {FILTERS.map((item) => (
              <Button
                key={item}
                type="button"
                size="sm"
                variant={filter === item ? 'default' : 'outline'}
                aria-pressed={filter === item}
                onClick={() => chooseFilter(item)}
              >
                {item}
              </Button>
            ))}
          </div>
          <div className="work-layout">
            <div className="work-index" role="list" aria-label="Work">
              {visibleProjects.map((project) => (
                <div key={project.id} role="listitem">
                  <button
                    type="button"
                    className={activeProject.id === project.id ? 'is-active' : ''}
                    aria-pressed={activeProject.id === project.id}
                    onClick={() => setActiveId(project.id)}
                  >
                    <strong>{project.name}</strong>
                    <small>{project.year}</small>
                  </button>
                </div>
              ))}
            </div>
            <Card className="py-0 overflow-hidden work-card" aria-live="polite">
              <div className="work-media">
                <img
                  key={activeProject.id}
                  src={activeProject.preview}
                  alt=""
                  width={1600}
                  height={900}
                />
                <span className="work-media-glare" />
              </div>
              <CardHeader>
                <CardDescription>{activeProject.type} · {activeProject.year}</CardDescription>
                <CardTitle className="font-serif text-3xl tracking-tight">{activeProject.name}</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <p className="text-muted-foreground">{activeProject.summary}</p>
                <ul className="project-evidence" aria-label="Evidence">
                  {activeProject.evidence.map((item) => <li key={item}>{item}</li>)}
                </ul>
                <div className="flex flex-wrap gap-2" aria-label="Technology stack">
                  {activeProject.stack.map((item) => (
                    <span key={item} className="text-sm text-muted-foreground">{item}</span>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pb-6 gap-2 flex-wrap">
                <Button asChild variant="outline">
                  <a href={activeProject.live} target="_blank" rel="noopener noreferrer">
                    Open live <ArrowUpRight />
                  </a>
                </Button>
                <Button asChild>
                  <a href={activeProject.href} target="_blank" rel="noopener noreferrer">
                    View repository <ArrowUpRight />
                  </a>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

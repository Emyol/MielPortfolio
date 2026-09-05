"use client";

import {
  Boxes,
  Code2,
  Cpu,
  GraduationCap,
  Map,
  Music,
  Smartphone,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useReducedMotion } from "framer-motion";

import { Card, CardContent } from "@/components/ui/card";
import { Marquee } from "@/components/ui/3d-testimonails";

type Practice = {
  kind: "Discipline" | "Interest";
  title: string;
  body: string;
  Icon: LucideIcon;
};

const COLUMNS: Practice[][] = [
  [
    {
      kind: "Discipline",
      title: "Edge intelligence",
      body: "Local inference and retrieval without server dependency.",
      Icon: Cpu,
    },
    {
      kind: "Interest",
      title: "Peer teaching",
      body: "The moment a hard concept finally holds in a room, not only on a slide.",
      Icon: GraduationCap,
    },
  ],
  [
    {
      kind: "Discipline",
      title: "Language systems",
      body: "Lexers, parsers, ASTs, interpreters, and tooling people can actually use.",
      Icon: Code2,
    },
    {
      kind: "Interest",
      title: "Music",
      body: "Tempo, arrangement, and the cut. Another way to think about parts that have to arrive on time.",
      Icon: Music,
    },
  ],
  [
    {
      kind: "Discipline",
      title: "Geospatial products",
      body: "Complex environmental data made legible for decisions.",
      Icon: Map,
    },
    {
      kind: "Interest",
      title: "On-device AI",
      body: "Private models that stay useful when the network does not.",
      Icon: Smartphone,
    },
  ],
  [
    {
      kind: "Discipline",
      title: "Operational leadership",
      body: "Plans, resources, and teams aligned around delivery.",
      Icon: Users,
    },
    {
      kind: "Interest",
      title: "Campus logistics",
      body: "Getting people, rooms, and supplies in place before anything starts.",
      Icon: Boxes,
    },
  ],
];

const PRACTICES = COLUMNS.flat();

function PracticeCard({ kind, title, body, Icon }: Practice) {
  return (
    <Card className="discipline-practice-card gap-0 py-6">
      <CardContent className="px-6">
        <div className="flex items-start gap-3.5">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-[2px] border border-border text-foreground">
            <Icon aria-hidden="true" className="size-5" strokeWidth={1.5} />
          </span>
          <div className="min-w-0">
            <p className="text-[0.74rem] tracking-[0.04em] text-muted-foreground">{kind}</p>
            <p className="mt-1 font-serif text-[1.42rem] font-medium leading-[1.22] tracking-[-0.02em]">
              {title}
            </p>
          </div>
        </div>
        <p className="mt-4 text-[1rem] leading-relaxed text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  );
}

export default function DisciplineMarquee() {
  const reduced = useReducedMotion();

  return (
    <div className="discipline-marquee-block">
      {reduced ? (
        <div className="discipline-practice-grid">
          {PRACTICES.map((practice) => (
            <PracticeCard key={practice.title} {...practice} />
          ))}
        </div>
      ) : (
        <>
          <ul className="visually-hidden">
            {PRACTICES.map((practice) => (
              <li key={practice.title}>
                {practice.kind}: {practice.title}. {practice.body}
              </li>
            ))}
          </ul>
          <div className="discipline-marquee" aria-hidden="true">
          <div className="discipline-marquee-stage">
            {COLUMNS.map((column, index) => (
              <Marquee
                key={column[0].title}
                className={
                  index === 3
                    ? "discipline-marquee-col discipline-marquee-col--wide overflow-visible p-0"
                    : index === 2
                      ? "discipline-marquee-col discipline-marquee-col--md overflow-visible p-0"
                      : index === 1
                        ? "discipline-marquee-col discipline-marquee-col--sm overflow-visible p-0"
                        : "discipline-marquee-col overflow-visible p-0"
                }
                vertical
                pauseOnHover
                reverse={index % 2 === 1}
                repeat={4}
                ariaRole="presentation"
              >
                {column.map((practice) => (
                  <PracticeCard key={practice.title} {...practice} />
                ))}
              </Marquee>
            ))}
          </div>
          <div className="discipline-marquee-fade discipline-marquee-fade--top" />
          <div className="discipline-marquee-fade discipline-marquee-fade--bottom" />
          <div className="discipline-marquee-fade discipline-marquee-fade--left" />
          <div className="discipline-marquee-fade discipline-marquee-fade--right" />
        </div>
        </>
      )}
    </div>
  );
}

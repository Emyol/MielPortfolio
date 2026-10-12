"use client";
import { useMotionPreference } from "@/lib/motion";

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

import { useSyncExternalStore } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Marquee } from "@/components/ui/3d-testimonails";

type Practice = {
  kind: "Discipline" | "Interest";
  title: string;
  body: string;
  Icon: LucideIcon;
};

const subscribeToHydration = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

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

export default function DisciplineMarquee({ items }: { items: {id:string; archived:boolean;kind:string;title:string;body:string;icon:string}[] }) {
 const icons: Record<string,LucideIcon>={Boxes,Code2,Cpu,GraduationCap,Map,Music,Smartphone,Users};
 const PRACTICES=items.filter(item=>!item.archived).map(item=>({...item,kind:item.kind as Practice['kind'],Icon:icons[item.icon] || Code2}));
 const COLUMNS: Practice[][] = Array.from({length: Math.min(4,PRACTICES.length)},(_,index)=>PRACTICES.filter((_,i)=>i%Math.min(4,PRACTICES.length)===index));
  const prefersReducedMotion = useMotionPreference();
  // Match the server tree during hydration, then use the visitor's preference.
  const hydrated = useSyncExternalStore(subscribeToHydration, clientSnapshot, serverSnapshot);
  const reduced = hydrated && prefersReducedMotion;

  return (
    <div className="discipline-marquee-block">
      <div className={`discipline-practice-grid${reduced ? '' : ' discipline-practice-grid--mobile'}`}>
        {PRACTICES.map((practice) => (
          <PracticeCard key={practice.title} {...practice} />
        ))}
      </div>
      {!reduced && (
        <>
          <ul className="visually-hidden discipline-practice-accessible">
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

"use client";

import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CardItem {
  id: string | number;
  title: string;
  description: string;
  imgSrc: string;
  icon: React.ReactNode;
  linkHref: string;
  meta?: string;
}

interface ExpandingCardsProps extends React.HTMLAttributes<HTMLUListElement> {
  items: CardItem[];
  defaultActiveIndex?: number;
}

export const ExpandingCards = React.forwardRef<HTMLUListElement, ExpandingCardsProps>(
  ({ className, items, defaultActiveIndex = 0, ...props }, ref) => {
    const [activeIndex, setActiveIndex] = React.useState(defaultActiveIndex);
    const currentIndex = Math.min(Math.max(activeIndex, 0), Math.max(items.length - 1, 0));
    const tracks = items.map((_, index) => index === currentIndex ? "5fr" : "1fr").join(" ");

    return (
      <ul
        ref={ref}
        className={cn("work-gallery", className)}
        style={{ "--work-tracks": tracks } as React.CSSProperties}
        {...props}
      >
        {items.map((item, index) => (
          <li key={item.id} className="work-gallery-item" data-active={currentIndex === index}>
            <a
              className="work-gallery-link"
              href={item.linkHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${item.title} — open repository in a new tab`}
              onMouseEnter={() => setActiveIndex(index)}
              onFocus={() => setActiveIndex(index)}
            >
              <img className="work-gallery-image" src={item.imgSrc} alt="" width={1600} height={900} />
              <span className="work-gallery-shade" aria-hidden="true" />
              <span className="work-gallery-compact" aria-hidden="true">{item.title}</span>
              <span className="work-gallery-content">
                <span className="work-gallery-meta">{item.icon}<span>{item.meta}</span></span>
                <span className="work-gallery-title">{item.title}</span>
                <span className="work-gallery-description">{item.description}</span>
                <span className="work-gallery-action">View repository <ArrowUpRight size={16} /></span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    );
  },
);
ExpandingCards.displayName = "ExpandingCards";

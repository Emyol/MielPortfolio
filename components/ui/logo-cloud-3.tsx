"use client";

import { useState, type ComponentProps } from "react";
import { Pause, Play, type LucideIcon } from "lucide-react";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { cn } from "@/lib/utils";

export type Logo = {
  src?: string;
  alt: string;
  category?: string;
  width?: number;
  height?: number;
  icon?: LucideIcon;
};

type LogoCloudProps = ComponentProps<"div"> & { logos: Logo[] };

export function LogoCloud({ className, logos, ...props }: LogoCloudProps) {
  const [paused, setPaused] = useState(false);

  return (
    <div {...props} className={cn("stack-logo-cloud", className)}>
      <div className="stack-logo-toolbar">
        <h3>Languages, runtime, domains & delivery</h3>
        <button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused} aria-label="Pause technology marquee">
          {paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}
          <span>{paused ? "Resume" : "Pause"}</span>
        </button>
      </div>
      <div className="stack-logo-mask overflow-hidden py-4">
        <InfiniteSlider gap={42} reverse speed={48} speedOnHover={14} paused={paused}>
          {logos.map(({ src, alt, category, width = 28, height = 28, icon: Icon }) => (
            <div key={alt} className="stack-logo-item">
              {src ? (
                <img src={src} alt="" width={width} height={height} loading="lazy" decoding="async" className="stack-brand-logo pointer-events-none select-none" />
              ) : Icon ? <Icon size={28} strokeWidth={1.5} aria-hidden="true" /> : null}
              <span className="stack-logo-copy">
                {category && <span className="stack-logo-category">{category}</span>}
                <span className="stack-logo-name">{alt}</span>
              </span>
            </div>
          ))}
        </InfiniteSlider>
      </div>
    </div>
  );
}

"use client";

import { useRef, useState, type ReactNode } from "react";
import { motion, useAnimationFrame, useInView, useMotionValue, useReducedMotion } from "framer-motion";
import useMeasure from "react-use-measure";
import { cn } from "@/lib/utils";

type InfiniteSliderProps = {
  children: ReactNode;
  gap?: number;
  /** Pixels per second, independent of the number of items. */
  speed?: number;
  speedOnHover?: number;
  direction?: "horizontal" | "vertical";
  reverse?: boolean;
  paused?: boolean;
  className?: string;
};

export function InfiniteSlider({
  children, gap = 16, speed = 80, speedOnHover = 25,
  direction = "horizontal", reverse = false, paused = false, className,
}: InfiniteSliderProps) {
  const viewport = useRef<HTMLDivElement>(null);
  const visible = useInView(viewport);
  const reduced = useReducedMotion();
  const [measure, { width, height }] = useMeasure();
  const [hovered, setHovered] = useState(false);
  const translation = useMotionValue(0);
  const velocity = useRef(speed);
  const distance = useRef(0);
  const horizontal = direction === "horizontal";
  const cycle = (horizontal ? width : height) + gap;

  useAnimationFrame((_, delta) => {
    if (reduced || paused || !visible || document.hidden || cycle <= gap) return;
    // Keep position on hover/resize; damp only velocity, never restart the loop.
    const seconds = Math.min(delta, 64) / 1000;
    const target = hovered ? speedOnHover : speed;
    velocity.current += (target - velocity.current) * (1 - Math.exp(-8 * seconds));
    distance.current = (distance.current + velocity.current * seconds) % cycle;
    translation.set(reverse ? distance.current - cycle : -distance.current);
  });

  return (
    <div
      ref={viewport}
      className={cn("infinite-slider overflow-hidden", className)}
      onPointerEnter={(event) => { if (event.pointerType !== "touch") setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
    >
      <motion.div
        className="infinite-slider-track flex w-max"
        style={{
          ...(horizontal ? { x: reduced ? 0 : translation } : { y: reduced ? 0 : translation }),
          gap, flexDirection: horizontal ? "row" : "column",
        }}
      >
        <div ref={measure} className="infinite-slider-group flex shrink-0 items-center" style={{ gap, flexDirection: horizontal ? "row" : "column" }}>
          {children}
        </div>
        <div aria-hidden="true" inert className="infinite-slider-copy flex shrink-0 items-center" style={{ gap, flexDirection: horizontal ? "row" : "column" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

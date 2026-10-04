"use client";
import { useMotionPreference } from "@/lib/motion";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useInView } from "framer-motion";
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
  const track = useRef<HTMLDivElement>(null);
  const animation = useRef<Animation | null>(null);
  const progress = useRef(0);
  const visible = useInView(viewport);
  const reduced = useMotionPreference();
  const [measure, { width, height }] = useMeasure();
  const [hovered, setHovered] = useState(false);
  const horizontal = direction === "horizontal";
  const cycle = (horizontal ? width : height) + gap;

  useEffect(() => {
    if (reduced || !track.current || cycle <= gap) return;
    const offset = horizontal ? `translate3d(${-cycle}px, 0, 0)` : `translate3d(0, ${-cycle}px, 0)`;
    const duration = cycle / Math.max(speed, 1) * 1000;
    const player = track.current.animate(
      reverse ? [{ transform: offset }, { transform: "translate3d(0, 0, 0)" }] : [{ transform: "translate3d(0, 0, 0)" }, { transform: offset }],
      { duration, iterations: Infinity, easing: "linear" },
    );
    player.currentTime = progress.current * duration;
    animation.current = player;
    return () => {
      if (typeof player.currentTime === "number") progress.current = (player.currentTime % duration) / duration;
      player.cancel();
      if (animation.current === player) animation.current = null;
    };
  }, [cycle, gap, horizontal, reduced, reverse, speed]);

  useEffect(() => {
    const syncPlayback = () => {
      if (reduced || paused || !visible || document.hidden) animation.current?.pause();
      else animation.current?.play();
    };
    syncPlayback();
    document.addEventListener("visibilitychange", syncPlayback);
    return () => document.removeEventListener("visibilitychange", syncPlayback);
  }, [cycle, paused, reduced, visible]);

  useEffect(() => {
    animation.current?.updatePlaybackRate(Math.max(hovered ? speedOnHover : speed, 1) / Math.max(speed, 1));
  }, [cycle, hovered, speed, speedOnHover]);

  return (
    <div
      ref={viewport}
      className={cn("infinite-slider overflow-hidden", className)}
      onPointerEnter={(event) => { if (event.pointerType !== "touch") setHovered(true); }}
      onPointerLeave={() => setHovered(false)}
    >
      <div
        ref={track}
        className="infinite-slider-track flex w-max"
        style={{
          gap, flexDirection: horizontal ? "row" : "column",
        }}
      >
        <div ref={measure} className="infinite-slider-group flex shrink-0 items-center" style={{ gap, flexDirection: horizontal ? "row" : "column" }}>
          {children}
        </div>
        <div aria-hidden="true" inert className="infinite-slider-copy flex shrink-0 items-center" style={{ gap, flexDirection: horizontal ? "row" : "column" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";

const CHARSET = " .'`^\",:;!iIlL1|/\\()[]{}<>?-_+=~*#%&@$";
const COLS = 80;
const ROWS = 40;

export default function AsciiCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const ctx = canvas.getContext("2d");
    let frameId;
    let tick = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const fontSize = Math.max(10, Math.floor(w / COLS));
      const lineHeight = fontSize * 1.15;

      ctx.fillStyle = "rgba(10, 10, 10, 0.18)";
      ctx.fillRect(0, 0, w, h);

      ctx.font = `${fontSize}px "IBM Plex Mono", monospace`;
      ctx.textBaseline = "top";

      for (let col = 0; col < COLS; col++) {
        const x = (col / COLS) * w;
        const phase = (col * 17 + tick * (prefersReduced ? 0 : 1)) % 997;

        for (let row = 0; row < ROWS; row++) {
          const noise =
            Math.sin(col * 0.31 + row * 0.17 + tick * 0.04) *
            Math.cos(col * 0.11 - row * 0.23 + tick * 0.02);
          const idx = Math.floor(((noise + 1) / 2) * (CHARSET.length - 1));
          const char = CHARSET[idx];
          const brightness = 0.08 + ((noise + 1) / 2) * 0.22;
          const pulse = prefersReduced ? 1 : 0.85 + 0.15 * Math.sin(phase * 0.01 + row * 0.4);

          ctx.fillStyle = `rgba(232, 232, 232, ${brightness * pulse})`;
          ctx.fillText(char, x, row * lineHeight);
        }
      }

      tick += 1;
      frameId = requestAnimationFrame(draw);
    };

    frameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="ascii-canvas"
      aria-hidden="true"
    />
  );
}

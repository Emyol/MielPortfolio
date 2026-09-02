// Originkit preset `custom-style` — props baked into the default export.
"use client";

import { useEffect, useRef, type CSSProperties } from "react";

const DEFAULT_IMAGE =
    "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/e4476503-c1e3-4358-3ff6-539deda1f800/w=800";

type ColorMode = "mono" | "image";
type Fit = "cover" | "contain";

interface RevealOptions {
    size: number;
    softness: number;
}

const DEFAULTS = {
    fit: "cover" as Fit,
    focusY: 19,
    columns: 200,
    ramp: " .:-=+*#%@",
    invert: false,
    contrast: 100,
    colorMode: "mono" as ColorMode,
    inkColor: "#FFFFFF",
    reveal: true,
    revealOptions: { size: 80, softness: 16 } as RevealOptions,
};

const contrastAt = (value: number) => 0.5 + (value / 100) * 2;

const clampFocus = (value: number) =>
    Math.min(100, Math.max(0, typeof value === "number" ? value : 50));

function placeRect(
    imgW: number,
    imgH: number,
    boxW: number,
    boxH: number,
    fit: Fit,
    focusY: number,
    zoom = 1
) {
    const base =
        fit === "contain"
            ? Math.min(boxW / imgW, boxH / imgH)
            : Math.max(boxW / imgW, boxH / imgH);
    const scale = base * Math.max(1, zoom);
    const dw = imgW * scale;
    const dh = imgH * scale;
    const f = fit === "cover" ? clampFocus(focusY) / 100 : 0.5;
    return { dx: (boxW - dw) / 2, dy: (boxH - dh) * f, dw, dh };
}

interface AsciiImageProps {
    image?: { src: string; srcSet?: string; alt?: string } | string;
    fit?: Fit;
    focusY?: number;
    columns?: number;
    ramp?: string;
    invert?: boolean;
    contrast?: number;
    colorMode?: ColorMode;
    inkColor?: string;
    reveal?: boolean;
    revealOptions?: RevealOptions;
    zoom?: number;
    style?: CSSProperties;
}

function resolveImageSrc(image: unknown): string | undefined {
    if (!image) return undefined;
    if (typeof image === "string") return image.trim() || undefined;
    return (image as { src?: string }).src || undefined;
}

function __OriginkitBase_AsciiImage(props: AsciiImageProps) {
    const {
        image,
        fit = DEFAULTS.fit,
        focusY = DEFAULTS.focusY,
        columns = DEFAULTS.columns,
        ramp = DEFAULTS.ramp,
        invert = DEFAULTS.invert,
        contrast = DEFAULTS.contrast,
        colorMode = DEFAULTS.colorMode,
        inkColor = DEFAULTS.inkColor,
    reveal = DEFAULTS.reveal,
    revealOptions = DEFAULTS.revealOptions,
    zoom = 1.42,
    style,
    } = props;

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const offRef = useRef<HTMLCanvasElement | null>(null);
    const samplerRef = useRef<HTMLCanvasElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);
    const revealRef = useRef<HTMLCanvasElement | null>(null);
    const maskRef = useRef<HTMLCanvasElement | null>(null);
    const blobsRef = useRef<Array<{ x: number; y: number }>>([]);
    const seededRef = useRef(false);
    const pointer = useRef({ x: -9999, y: -9999, inside: false });

    const src = resolveImageSrc(image) || DEFAULT_IMAGE;
    const revealSize = revealOptions?.size ?? DEFAULTS.revealOptions.size;
    const revealSoftness =
        revealOptions?.softness ?? DEFAULTS.revealOptions.softness;

    useEffect(() => {
        const canvasEl = canvasRef.current;
        if (!canvasEl) return;
        const context = canvasEl.getContext("2d");
        if (!context) return;
        const canvas: HTMLCanvasElement = canvasEl;
        const ctx: CanvasRenderingContext2D = context;

        const chars = ramp && ramp.length > 0 ? ramp : DEFAULTS.ramp;
        const punch = contrastAt(contrast);

        let raf = 0;
        let alive = true;
        let coverRect = { dx: 0, dy: 0, dw: 0, dh: 0 };

        const BLOB_COUNT = 5;
        blobsRef.current = Array.from({ length: BLOB_COUNT }, () => ({
            x: 0,
            y: 0,
        }));
        seededRef.current = false;

        function getSize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const w = canvas.clientWidth || 600;
            const h = canvas.clientHeight || 600;
            return { w, h, dpr };
        }

        type GlyphGrid = {
            cols: number;
            rows: number;
            cellW: number;
            cellH: number;
            fontPx: number;
            lum: Float32Array;
        };

        let grid: GlyphGrid | null = null;
        let lastGlyphAt = 0;

        function columnCount(cssWidth: number) {
            const ceiling = Math.max(8, Math.round(columns));
            return Math.max(22, Math.min(ceiling, Math.round(cssWidth / 9)));
        }

        function livingLum(base: number, c: number, r: number, t: number) {
            const current =
                Math.sin(t * 1.05 + c * 0.2 + r * 0.16) * 0.55 +
                Math.sin(t * 0.41 - c * 0.11 + r * 0.24) * 0.45;
            const band = Math.sin(r * 0.23 - t * 0.86);
            let lum = base + current * 0.09 + band * 0.05;
            if (lum < 0) return 0;
            if (lum > 1) return 1;
            return lum;
        }

        function drawLivingAscii(now: number) {
            const off = offRef.current;
            const active = grid;
            if (!off || !active) return;
            const octx = off.getContext("2d");
            if (!octx) return;

            const lastRamp = chars.length - 1;
            const t = now * 0.001;
            const { cols, rows, cellW, cellH, fontPx, lum } = active;

            octx.clearRect(0, 0, off.width, off.height);
            octx.font = fontPx.toFixed(2) + "px ui-monospace, monospace";
            octx.textBaseline = "top";
            octx.fillStyle = inkColor;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const ch =
                        chars[Math.round(livingLum(lum[r * cols + c], c, r, t) * lastRamp)];
                    if (ch === " ") continue;
                    octx.fillText(ch, c * cellW, r * cellH);
                }
            }
        }

        function buildAscii(now = 0) {
            const img = imgRef.current;
            if (!img) return;
            const { w, h, dpr } = getSize();
            canvas.width = Math.max(1, Math.round(w * dpr));
            canvas.height = Math.max(1, Math.round(h * dpr));

            const cols = columnCount(w);
            const cellW = (w * dpr) / cols;
            const fontPx = cellW * 1.7;
            const cellH = fontPx;
            const rows = Math.max(1, Math.floor((h * dpr) / cellH));

            let sampler = samplerRef.current;
            if (!sampler) {
                sampler = document.createElement("canvas");
                samplerRef.current = sampler;
            }
            sampler.width = cols;
            sampler.height = rows;
            const sctx = sampler.getContext("2d", { willReadFrequently: true });
            if (!sctx) return;

            const place = placeRect(
                img.width,
                img.height,
                canvas.width,
                canvas.height,
                fit,
                focusY,
                zoom
            );
            sctx.clearRect(0, 0, cols, rows);
            sctx.filter = "grayscale(1) brightness(2.05) contrast(1.22)";
            sctx.drawImage(
                img,
                place.dx / cellW,
                place.dy / cellH,
                place.dw / cellW,
                place.dh / cellH
            );
            sctx.filter = "none";

            let data: Uint8ClampedArray;
            try {
                data = sctx.getImageData(0, 0, cols, rows).data;
            } catch {
                imgRef.current = null;
                return;
            }

            let off = offRef.current;
            if (!off) {
                off = document.createElement("canvas");
                offRef.current = off;
            }
            off.width = canvas.width;
            off.height = canvas.height;

            const cellCount = cols * rows;
            const lum = new Float32Array(cellCount);
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const i = (r * cols + c) * 4;
                    let value =
                        (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) /
                        255;
                    value = (value - 0.5) * punch + 0.5;
                    if (invert) value = 1 - value;
                    lum[r * cols + c] = value < 0 ? 0 : value > 1 ? 1 : value;
                }
            }

            grid = {
                cols,
                rows,
                cellW,
                cellH,
                fontPx,
                lum,
            };

            coverRect = place;
            drawLivingAscii(now);
        }

        function ensureLayer(ref: { current: HTMLCanvasElement | null }) {
            let layer = ref.current;
            if (!layer) {
                layer = document.createElement("canvas");
                ref.current = layer;
            }
            if (
                layer.width !== canvas.width ||
                layer.height !== canvas.height
            ) {
                layer.width = canvas.width;
                layer.height = canvas.height;
            }
            return layer;
        }

        function updateBlobs() {
            const blobs = blobsRef.current;
            if (blobs.length === 0) return;
            const { dpr } = getSize();
            const tx = pointer.current.x * dpr;
            const ty = pointer.current.y * dpr;
            if (!seededRef.current) {
                for (const blob of blobs) {
                    blob.x = tx;
                    blob.y = ty;
                }
                seededRef.current = true;
                return;
            }
            blobs[0].x += (tx - blobs[0].x) * 0.35;
            blobs[0].y += (ty - blobs[0].y) * 0.35;
            for (let i = 1; i < blobs.length; i++) {
                blobs[i].x += (blobs[i - 1].x - blobs[i].x) * 0.35;
                blobs[i].y += (blobs[i - 1].y - blobs[i].y) * 0.35;
            }
        }

        function paint() {
            const off = offRef.current;
            if (!off) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(off, 0, 0);

            const img = imgRef.current;
            if (!reveal || !pointer.current.inside || !img) return;

            const { dpr } = getSize();
            const blobs = blobsRef.current;
            const photo = ensureLayer(revealRef);
            const pctx = photo.getContext("2d");
            const mask = ensureLayer(maskRef);
            const mctx = mask.getContext("2d");
            if (!pctx || !mctx) return;

            pctx.globalCompositeOperation = "source-over";
            pctx.clearRect(0, 0, photo.width, photo.height);
            pctx.drawImage(
                img,
                coverRect.dx,
                coverRect.dy,
                coverRect.dw,
                coverRect.dh
            );

            mctx.clearRect(0, 0, mask.width, mask.height);
            mctx.save();
            mctx.filter = `blur(${(revealSoftness * dpr).toFixed(1)}px)`;
            mctx.fillStyle = "#FFFFFF";
            for (let i = 0; i < blobs.length; i++) {
                const t = blobs.length <= 1 ? 0 : i / (blobs.length - 1);
                const radius = revealSize * dpr * (1 - t * 0.5);
                mctx.beginPath();
                mctx.arc(blobs[i].x, blobs[i].y, radius, 0, Math.PI * 2);
                mctx.fill();
            }
            mctx.restore();

            pctx.globalCompositeOperation = "destination-in";
            pctx.drawImage(mask, 0, 0);
            pctx.globalCompositeOperation = "source-over";
            ctx.drawImage(photo, 0, 0);
        }

        const reduceMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

        let visible = true;

        function stopLoop() {
            if (!raf) return;
            cancelAnimationFrame(raf);
            raf = 0;
        }

        function loop(now: number) {
            if (!alive || !visible) {
                raf = 0;
                return;
            }
            if (!reduceMotion && now - lastGlyphAt >= 50) {
                lastGlyphAt = now;
                drawLivingAscii(now);
            }
            updateBlobs();
            paint();
            raf = requestAnimationFrame(loop);
        }

        function startLoop() {
            if (!alive || reduceMotion || !visible || document.hidden || raf) return;
            raf = requestAnimationFrame(loop);
        }

        function onMove(event: PointerEvent) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            pointer.current.x = x;
            pointer.current.y = y;
            pointer.current.inside =
                x >= 0 && y >= 0 && x <= rect.width && y <= rect.height;
        }
        function onLeave() {
            pointer.current.inside = false;
            seededRef.current = false;
        }

        const img = new Image();
        if (/^https?:\/\//i.test(src) && !src.startsWith(window.location.origin)) {
            img.crossOrigin = "anonymous";
        }
        img.onload = () => {
            if (!alive) return;
            imgRef.current = img;
            buildAscii(performance.now());
            paint();
            startLoop();
        };
        if (src) img.src = src;

        let ro: ResizeObserver | null = null;
        if (typeof ResizeObserver !== "undefined") {
            ro = new ResizeObserver(() => {
                buildAscii(performance.now());
                paint();
            });
            ro.observe(canvas);
        }

        const io =
            typeof IntersectionObserver !== "undefined"
                ? new IntersectionObserver(
                      ([entry]) => {
                          visible = Boolean(entry?.isIntersecting);
                          if (visible) startLoop();
                          else stopLoop();
                      },
                      { threshold: 0.05 }
                  )
                : null;
        io?.observe(canvas);

        const onVisibility = () => {
            if (document.hidden) stopLoop();
            else startLoop();
        };
        document.addEventListener("visibilitychange", onVisibility);

        canvas.addEventListener("pointermove", onMove);
        canvas.addEventListener("pointerleave", onLeave);

        return () => {
            alive = false;
            stopLoop();
            ro?.disconnect();
            io?.disconnect();
            document.removeEventListener("visibilitychange", onVisibility);
            canvas.removeEventListener("pointermove", onMove);
            canvas.removeEventListener("pointerleave", onLeave);
        };
    }, [
        src,
        fit,
        focusY,
        columns,
        ramp,
        invert,
        contrast,
        colorMode,
        inkColor,
        reveal,
        revealSize,
        revealSoftness,
        zoom,
    ]);

    return (
        <canvas
            ref={canvasRef}
            aria-label={
                typeof image === "object"
                    ? (image?.alt ?? "ASCII art")
                    : "ASCII art"
            }
            style={{
                ...style,
                display: "block",
                width: "100%",
                height: "100%",
                cursor: reveal ? "crosshair" : "default",
            }}
        />
    );
}

const __originkitPresetProps = {
  "image": {
    "src": "/hero-profile.png",
    "alt": "Portrait of Amiel Acuña"
  },
  "fit": "cover",
  "focusY": 19,
  "ramp": " .:-=+*#%@",
  "columns": 200,
  "contrast": 35,
  "invert": false,
  "colorMode": "mono",
  "inkColor": "#FFFFFF",
  "reveal": true,
  "revealOptions": {
    "size": 39,
    "softness": 26
  }
};

export default function AsciiImage(props: Record<string, unknown>) {
  return <__OriginkitBase_AsciiImage {...(__originkitPresetProps as Record<string, unknown>)} {...props} />;
}

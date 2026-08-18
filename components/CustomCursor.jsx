"use client";

import { useEffect, useRef } from 'react';

export default function CustomCursor() {
    const ringRef = useRef(null);
    const dotRef = useRef(null);

    useEffect(() => {
        // Only enable on devices with a precise pointer (no touch / hybrid)
        const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
        if (!fine.matches) return;

        const ring = ringRef.current;
        const dot = dotRef.current;
        if (!ring || !dot) return;

        document.body.classList.add('has-custom-cursor');

        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;
        let visible = false;
        let raf;

        const reveal = () => {
            if (visible) return;
            visible = true;
            ring.style.opacity = '1';
            dot.style.opacity = '1';
        };

        const onMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
            reveal();
            const interactive = e.target.closest(
                'a, button, .btn-primary, .view-link, [data-cursor]'
            );
            ring.classList.toggle('is-hover', !!interactive);
        };

        const onLeave = () => {
            visible = false;
            ring.style.opacity = '0';
            dot.style.opacity = '0';
        };
        const onDown = () => ring.classList.add('is-down');
        const onUp = () => ring.classList.remove('is-down');

        const lerp = (a, b, n) => a + (b - a) * n;
        const tick = () => {
            const ease = reduce ? 1 : 0.18;
            ringX = lerp(ringX, mouseX, ease);
            ringY = lerp(ringY, mouseY, ease);
            ring.style.transform = `translate(${ringX}px, ${ringY}px)`;
            raf = requestAnimationFrame(tick);
        };
        tick();

        window.addEventListener('mousemove', onMove, { passive: true });
        document.addEventListener('mouseleave', onLeave);
        window.addEventListener('mousedown', onDown);
        window.addEventListener('mouseup', onUp);

        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseleave', onLeave);
            window.removeEventListener('mousedown', onDown);
            window.removeEventListener('mouseup', onUp);
            document.body.classList.remove('has-custom-cursor');
        };
    }, []);

    return (
        <>
            <div ref={ringRef} className="cursor-ring" aria-hidden="true">
                <span className="cursor-ring-inner" />
            </div>
            <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
        </>
    );
}

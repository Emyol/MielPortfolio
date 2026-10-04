"use client";
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { motionTiming } from '@/lib/motion';
gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function PageMotion() {
  const anchor = useRef(null);
  const entered = useRef(new WeakSet());
  const heroEntered = useRef(false);
  useGSAP(() => {
    const root = anchor.current?.closest('main');
    if (!root) return;
    const media = gsap.matchMedia();
    media.add({ reduced: '(prefers-reduced-motion: reduce)', mobile: '(max-width: 860px)', desktop: '(min-width: 861px)' }, ({ conditions }) => {
      const { reduced, mobile } = conditions;
      const metrics = [...root.querySelectorAll('[data-count]')];
      const finalize = () => metrics.forEach((node) => {
        node.textContent = `${String(node.dataset.count).padStart(Number(node.dataset.pad), '0')}${node.dataset.suffix}`;
      });
      if (reduced) { finalize(); return; }
      if (!heroEntered.current) {
        heroEntered.current = true;
        gsap.timeline({ defaults: { ease: 'power4.out' } })
          .from(root.querySelectorAll('.field-title-word'), { yPercent: 105, duration: mobile ? 0.5 : motionTiming.entrance, stagger: 0.07 })
          .from(root.querySelectorAll('[data-hero-visual]'), { opacity: 0.35, duration: 0.75 }, 0.08)
          .from(root.querySelectorAll('[data-hero-item]'), { opacity: 0.25, y: mobile ? 8 : 16, duration: 0.6, stagger: 0.08 }, 0.2);
      }
      root.querySelectorAll('[data-pin-section]').forEach((section) => {
        if (entered.current.has(section)) return;
        const title = section.querySelectorAll('.field-pin-inner');
        const content = section.id === 'projects'
          ? section.querySelectorAll('.field-lede, [data-work-gallery] > li')
          : section.querySelectorAll('.field-split > :not(.field-pin-col) > *');
        const timeline = gsap.timeline({
          defaults: { ease: 'power3.out', duration: mobile ? 0.4 : motionTiming.entrance },
          scrollTrigger: { trigger: section, start: 'top 82%', once: true, onEnter: () => entered.current.add(section) },
        });
        if (!mobile) timeline.from(title, { yPercent: 105, stagger: 0.06 }, 0);
        timeline.from(content, { opacity: 0.35, y: mobile ? 8 : 18, stagger: { amount: mobile ? 0.08 : 0.16 } }, mobile ? 0 : 0.1);
      });
      metrics.forEach((node) => {
        if (entered.current.has(node)) return;
        const state = { value: 0 };
        gsap.to(state, {
          value: Number(node.dataset.count), duration: mobile ? 0.6 : 0.9, ease: 'power2.out',
          scrollTrigger: { trigger: node.closest('.field-measures'), start: 'top 88%', once: true, onEnter: () => entered.current.add(node) },
          onUpdate: () => { node.textContent = `${String(Math.round(state.value)).padStart(Number(node.dataset.pad), '0')}${node.dataset.suffix}`; },
        });
      });
      return finalize;
    }, root);
    return () => media.revert();
  }, { scope: anchor });
  return <span ref={anchor} hidden aria-hidden="true" />;
}

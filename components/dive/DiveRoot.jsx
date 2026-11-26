'use client';

import { useEffect, useRef } from 'react';
import { startDive } from './engine';

// Hosts the server-rendered page and runs the Dive engine on it after hydration.
// The headline rises on the first frame; the engine (ocean, scenes, glass) starts once the browser is idle,
// so its set-up never holds back the first view of the page.
export default function DiveRoot({ data, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('dive-page', 'dive-js');
    let stop = null, idle = 0;
    const start = () => { idle = 0; stop = startDive(ref.current, data); };
    const frame = requestAnimationFrame(() => {
      const hero = ref.current && ref.current.querySelector('.hero');
      if (hero) hero.classList.add('in');
      idle = window.requestIdleCallback ? window.requestIdleCallback(start, { timeout: 1200 }) : window.setTimeout(start, 50);
    });
    return () => {
      cancelAnimationFrame(frame);
      if (idle) (window.cancelIdleCallback || window.clearTimeout)(idle);
      if (stop) stop();
      html.classList.remove('dive-page', 'dive-js', 'dive-locked');
    };
  }, [data]);
  return <div className="dive" ref={ref}>{children}</div>;
}

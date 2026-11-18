'use client';

import { useEffect, useRef } from 'react';
import { startDive } from './engine';

// Hosts the server-rendered page and runs the Dive engine on it after hydration.
export default function DiveRoot({ data, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add('dive-page', 'dive-js');
    const stop = startDive(ref.current, data);
    return () => {
      stop();
      html.classList.remove('dive-page', 'dive-js', 'dive-locked');
    };
  }, [data]);
  return <div className="dive" ref={ref}>{children}</div>;
}

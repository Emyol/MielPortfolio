'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './MeltLab.module.css';

const MeltCanvas = dynamic(() => import('./MeltCanvas'), { ssr: false });

export default function MeltLab() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  return (
    <>
      <a href="#melt-main" className="skip-link">
        Skip to content
      </a>
      <main id="melt-main" className={styles.lab}>
        <h1 className={styles.sr}>Amiel Acuña</h1>
        <MeltCanvas reduced={reduced} />
      </main>
    </>
  );
}

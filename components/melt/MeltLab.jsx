'use client';

import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import styles from './MeltLab.module.css';

const MeltCanvas = dynamic(() => import('./MeltCanvas'), { ssr: false });
const MeltScroll = dynamic(() => import('./MeltScroll'), { ssr: false });

function MeltLabBody() {
  const params = useSearchParams();
  const mode = params.get('mode') === 'scroll' ? 'scroll' : 'studio';
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
      <main id="melt-main" className={mode === 'scroll' ? styles.scrollLab : styles.lab}>
        <h1 className={styles.sr}>Amiel Acuña</h1>
        {mode === 'scroll' ? <MeltScroll reduced={reduced} /> : <MeltCanvas reduced={reduced} />}
      </main>
    </>
  );
}

export default function MeltLab() {
  return (
    <Suspense fallback={null}>
      <MeltLabBody />
    </Suspense>
  );
}

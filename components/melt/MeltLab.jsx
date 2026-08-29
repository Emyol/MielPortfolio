'use client';

import { Suspense, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import styles from './MeltLab.module.css';

const MeltCanvas = dynamic(() => import('./MeltCanvas'), { ssr: false });
const MeltScroll = dynamic(() => import('./MeltScroll'), { ssr: false });
const MeltInspect = dynamic(() => import('./MeltInspect'), { ssr: false });

function MeltLabBody() {
  const params = useSearchParams();
  const requested = params.get('mode');
  const mode = requested === 'scroll' || requested === 'inspect' ? requested : 'studio';
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
        {mode === 'scroll' ? <MeltScroll reduced={reduced} /> : null}
        {mode === 'inspect' ? <MeltInspect reduced={reduced} /> : null}
        {mode === 'studio' ? <MeltCanvas reduced={reduced} /> : null}
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

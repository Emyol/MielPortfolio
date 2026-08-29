'use client';

import { useState } from 'react';
import MeltCanvas from './MeltCanvas';
import MeltInspectSheet from './MeltInspectSheet';
import { inspectTargets } from './inspectTargets';
import styles from './MeltLab.module.css';

export default function MeltInspect({ reduced = false }) {
  const [frozenId, setFrozenId] = useState(null);

  return (
    <>
      <nav className={styles.inspectKeys} aria-label="Inspect the pool">
        {Object.values(inspectTargets).map((row) => (
          <button key={row.id} type="button" onClick={() => setFrozenId(row.id)}>
            {row.title}
          </button>
        ))}
      </nav>
      <MeltCanvas reduced={reduced} mode="inspect" frozenId={frozenId} onFreeze={setFrozenId} />
      <MeltInspectSheet frozenId={frozenId} onClose={() => setFrozenId(null)} />
    </>
  );
}

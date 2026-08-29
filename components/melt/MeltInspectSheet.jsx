'use client';

import { useEffect, useRef } from 'react';
import { inspectTargets } from './inspectTargets';
import styles from './MeltLab.module.css';

export default function MeltInspectSheet({ frozenId, onClose }) {
  const closeRef = useRef(null);
  const target = frozenId ? inspectTargets[frozenId] : null;

  useEffect(() => {
    if (!target) return undefined;
    closeRef.current?.focus();
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [target, onClose]);

  if (!target) return null;

  return (
    <aside className={styles.sheet} role="dialog" aria-modal="true" aria-labelledby="melt-sheet-title">
      <button ref={closeRef} type="button" className={styles.sheetClose} onClick={onClose}>
        Close
      </button>
      {target.meta ? <p className={styles.sheetMeta}>{target.meta}</p> : null}
      <h2 id="melt-sheet-title">{target.title}</h2>
      {target.tags ? <p className={styles.sheetMeta}>{target.tags}</p> : null}
      {target.body ? <p className={styles.sheetBody}>{target.body}</p> : null}
      {target.roles ? (
        <ul className={styles.sheetList}>
          {target.roles.map((row) => (
            <li key={row.title}>
              <span>{row.year}</span>
              <span>{row.title}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {target.href ? (
        <a className={styles.sheetLink} href={target.href} target="_blank" rel="noopener noreferrer">
          {target.hrefLabel}
        </a>
      ) : null}
      {target.contact ? (
        <div className={styles.sheetContact}>
          <a href={`mailto:${target.contact.email}`}>{target.contact.email}</a>
          <a href={target.contact.cvHref}>{target.contact.cvLabel}</a>
          <a href={target.contact.github} target="_blank" rel="noopener noreferrer">
            {target.contact.githubLabel}
          </a>
        </div>
      ) : null}
    </aside>
  );
}

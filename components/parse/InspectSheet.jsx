'use client';

import { useEffect, useRef } from 'react';
import { nodeById } from '../../data/tree';
import { useParse } from './ParseContext';

export default function InspectSheet() {
  const { selectedId, clear } = useParse();
  const closeRef = useRef(null);
  const node = selectedId ? nodeById[selectedId] : null;

  useEffect(() => {
    if (!node) return undefined;
    closeRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') clear();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [node, clear]);

  if (!node) return null;

  return (
    <aside className="parse-sheet" role="dialog" aria-modal="true" aria-labelledby="parse-sheet-title">
      <button ref={closeRef} type="button" className="parse-sheet-close" onClick={clear}>
        Close
      </button>
      {node.meta ? <p className="parse-sheet-meta">{node.meta}</p> : null}
      <h2 id="parse-sheet-title">{node.title || node.label}</h2>
      {node.hero ? <p className="parse-sheet-hero">{node.hero}</p> : null}
      {node.kind === 'root' && node.portrait ? (
        <img className="parse-sheet-portrait" src={node.portrait.src} alt={node.portrait.alt} width={120} height={120} />
      ) : null}
      {node.location ? <p className="parse-sheet-meta">{node.location}</p> : null}
      {node.tags ? <p className="parse-sheet-tags">{node.tags}</p> : null}
      {node.body ? <p className="parse-sheet-body">{node.body}</p> : null}
      {node.stacks
        ? node.stacks.map((stack) => (
            <p key={stack.label} className="parse-sheet-tags">
              {stack.label}: {stack.items.join(' / ')}
            </p>
          ))
        : null}
      {node.roles ? (
        <ul className="parse-sheet-list">
          {node.roles.map((r) => (
            <li key={r.title}>
              <span>{r.year}</span>
              <span>{r.title}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {node.items ? (
        <ul className="parse-sheet-list">
          {node.items.map((row) => (
            <li key={`${row.year}-${row.text}`}>
              <span>{row.year}</span>
              <span>{row.text}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {node.href ? (
        <a className="parse-sheet-link" href={node.href} target="_blank" rel="noopener noreferrer">
          {node.hrefLabel || 'View Repository'}
        </a>
      ) : null}
      {node.kind === 'contact' && node.contact ? (
        <div className="parse-sheet-contact">
          <a href={`mailto:${node.contact.email}`}>{node.contact.email}</a>
          <a href={`tel:${node.contact.phone}`}>{node.contact.phoneDisplay}</a>
          <a href={node.contact.cvHref} download={node.contact.cvFilename}>
            {node.contact.cvLabel}
          </a>
          <a href={node.contact.github} target="_blank" rel="noopener noreferrer">
            {node.contact.githubLabel}
          </a>
          <a href={node.contact.linkedin} target="_blank" rel="noopener noreferrer">
            {node.contact.linkedinLabel}
          </a>
        </div>
      ) : null}
    </aside>
  );
}

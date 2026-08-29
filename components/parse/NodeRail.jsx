'use client';

import { nodeById, railIds } from '../../data/tree';
import { useParse } from './ParseContext';

const GROUPS = [
  ['amiel'],
  ['work', 'kitako', 'icare-reservation', 'bekilang', 'citysense'],
  ['proof', 'distinctions', 'certifications'],
  ['leadership', 'icare', 'scc', 'acm', 'jpcs'],
  ['contact'],
];

export default function NodeRail() {
  const { selectedId, select, resetCamera } = useParse();

  return (
    <div className="parse-hud">
      <div className="parse-hud-actions">
        <p className="parse-trunk">RANK 2  /  BATCH 27</p>
        <button type="button" onClick={resetCamera}>
          Reset camera
        </button>
      </div>
      <nav className="parse-rail" aria-label="Jump to node">
        {GROUPS.map((group) => (
          <div key={group[0]} className="parse-rail-group">
            {group.map((id) => {
              const n = nodeById[id];
              return (
                <button
                  key={id}
                  type="button"
                  className={selectedId === id ? 'is-on' : undefined}
                  onClick={() => select(id)}
                >
                  {n.label}
                </button>
              );
            })}
          </div>
        ))}
        {railIds
          .filter((id) => !GROUPS.flat().includes(id))
          .map((id) => {
            const n = nodeById[id];
            return (
              <button
                key={id}
                type="button"
                className={selectedId === id ? 'is-on' : undefined}
                onClick={() => select(id)}
              >
                {n.label}
              </button>
            );
          })}
      </nav>
    </div>
  );
}

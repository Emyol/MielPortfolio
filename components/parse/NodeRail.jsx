'use client';

import { nodeById, railIds } from '../../data/tree';
import { useParse } from './ParseContext';

export default function NodeRail() {
  const { selectedId, select, resetCamera } = useParse();

  return (
    <div className="parse-hud">
      <div className="parse-hud-actions">
        <button type="button" onClick={resetCamera}>
          Reset camera
        </button>
      </div>
      <nav className="parse-rail" aria-label="Jump to node">
        {railIds.map((id) => {
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

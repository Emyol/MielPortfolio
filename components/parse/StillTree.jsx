'use client';

import { edges, nodes, ROOT_ID, nodeById } from '../../data/tree';
import { useParse } from './ParseContext';

function toSvg([x, y]) {
  return [720 + x * 95, 430 - y * 95];
}

export default function StillTree() {
  const { selectedId, select } = useParse();

  return (
    <svg className="parse-still" viewBox="0 0 1440 900" role="img" aria-label="Still parse tree">
      <title>Still tree</title>
      <text className="parse-still-note" x="48" y="64">
        STILL TREE  /  PREFERS-REDUCED-MOTION
      </text>
      {edges.map((e) => {
        const a = toSvg(nodeById[e.from].position);
        const b = toSvg(nodeById[e.to].position);
        return <line key={e.id} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} className="parse-still-edge" />;
      })}
      {nodes.map((n) => {
        const [cx, cy] = toSvg(n.position);
        const r = n.id === ROOT_ID ? 78 : n.kind === 'branch' || n.kind === 'contact' ? 11 : 8;
        const on = selectedId === n.id || n.id === ROOT_ID;
        return (
          <g
            key={n.id}
            className="parse-still-node"
            role="button"
            tabIndex={0}
            aria-label={n.label}
            onClick={() => select(n.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                select(n.id);
              }
            }}
          >
            <circle cx={cx} cy={cy} r={r} className={on ? 'is-chrome' : 'is-wire'} />
            <text x={n.id === ROOT_ID ? cx : cx + r + 10} y={n.id === ROOT_ID ? cy + 6 : cy + 4} className={n.id === ROOT_ID ? 'is-root' : undefined}>
              {n.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

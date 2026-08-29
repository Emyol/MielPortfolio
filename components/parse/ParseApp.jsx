'use client';

import dynamic from 'next/dynamic';
import { nodes } from '../../data/tree';
import { ParseProvider, useParse } from './ParseContext';
import InspectSheet from './InspectSheet';
import NodeRail from './NodeRail';
import StillTree from './StillTree';

const ParseScene = dynamic(() => import('./ParseScene'), { ssr: false });

function ParseBody() {
  const { reduced } = useParse();

  return (
    <div className="parse-app">
      {reduced ? <StillTree /> : <ParseScene />}
      <ul className="parse-sr" aria-hidden="true">
        {nodes.map((n) => (
          <li key={n.id} className="parse-label">
            {n.label}
          </li>
        ))}
      </ul>
      <InspectSheet />
      <NodeRail />
    </div>
  );
}

export default function ParseApp() {
  return (
    <ParseProvider>
      <ParseBody />
    </ParseProvider>
  );
}

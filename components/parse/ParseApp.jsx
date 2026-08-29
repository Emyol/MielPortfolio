'use client';

import dynamic from 'next/dynamic';
import { ParseProvider, useParse } from './ParseContext';
import InspectSheet from './InspectSheet';
import NodeRail from './NodeRail';
import StillTree from './StillTree';
import './parse.css';

const ParseScene = dynamic(() => import('./ParseScene'), { ssr: false });

function ParseBody() {
  const { reduced } = useParse();

  return (
    <div className="parse-app">
      {reduced ? <StillTree /> : <ParseScene />}
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

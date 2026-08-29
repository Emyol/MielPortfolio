'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { edges, nodeById, nodes } from '../../data/tree';
import { useParse } from './ParseContext';
import DitherField from './DitherField';
import ParseCamera from './ParseCamera';
import ParseNode, { ParseEdge } from './ParseNode';
import LocalStudio from './LocalStudio';

function CompileDriver() {
  const { reduced, compileRef } = useParse();
  useFrame((_, delta) => {
    if (reduced || compileRef.current >= 1) return;
    compileRef.current = Math.min(1, compileRef.current + delta * 0.85);
  });
  return null;
}

export default function ParseScene() {
  const { clear, skipCompile } = useParse();

  return (
    <Canvas
      className="parse-canvas"
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      camera={{ position: [0, 0.2, 7.4], fov: 42 }}
      onCreated={({ gl }) => {
        gl.setClearColor('#000000', 1);
      }}
      onPointerMissed={() => {
        skipCompile();
        clear();
      }}
    >
      <CompileDriver />
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#ffffff', '#1a1a1a', 0.7]} />
      <directionalLight position={[4, 6, 8]} intensity={1.8} color="#ffffff" />
      <directionalLight position={[-5, 2, -3]} intensity={0.45} color="#c8c8c8" />
      <pointLight position={[-6, -2, 4]} intensity={0.7} color="#c8c8c8" />
      <LocalStudio />
      <DitherField />
      {edges.map((e) => (
        <ParseEdge key={e.id} fromPos={nodeById[e.from].position} toPos={nodeById[e.to].position} />
      ))}
      {nodes.map((n) => (
        <ParseNode key={n.id} node={n} />
      ))}
      <ParseCamera />
    </Canvas>
  );
}

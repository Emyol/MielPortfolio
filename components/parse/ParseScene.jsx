'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
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
    compileRef.current = Math.min(1, compileRef.current + delta * 0.42);
  });
  return null;
}

export default function ParseScene() {
  const { clear, skipCompile } = useParse();

  return (
    <Canvas
      className="parse-canvas"
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true,
      }}
      camera={{ position: [0, 0.06, 5.9], fov: 40 }}
      onCreated={({ gl }) => {
        gl.setClearColor('#000000', 1);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.12;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
      onPointerMissed={() => {
        skipCompile();
        clear();
      }}
    >
      <CompileDriver />
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.12} />
      <hemisphereLight args={['#f2f2f2', '#050505', 0.35]} />
      <directionalLight position={[5.5, 7, 6]} intensity={2.6} color="#ffffff" />
      <directionalLight position={[-6, 1.5, -4]} intensity={0.85} color="#b0b0b0" />
      <pointLight position={[0, -3.2, 5]} intensity={1.1} color="#d8d8d8" />
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

'use client';

import { useMemo, useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useParse } from './ParseContext';
import ChromeMaterial from './ChromeMaterial';

export function ParseEdge({ fromPos, toPos }) {
  const mat = useRef();
  const { compileRef } = useParse();
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(...fromPos),
      new THREE.Vector3(...toPos),
    ]);
    return g;
  }, [fromPos, toPos]);

  useFrame(() => {
    if (mat.current) mat.current.opacity = 0.22 + compileRef.current * 0.55;
  });

  return (
    <line geometry={geometry}>
      <lineBasicMaterial ref={mat} color="#c8c8c8" transparent opacity={0.8} />
    </line>
  );
}

export default function ParseNode({ node }) {
  const group = useRef();
  const { selectedId, select, compileRef } = useParse();
  const selected = selectedId === node.id;
  const chrome = selected || node.kind === 'root';

  useFrame(() => {
    if (!group.current) return;
    const s = node.kind === 'root' ? 1 : 0.28 + compileRef.current * 0.72;
    group.current.scale.setScalar(s);
  });

  return (
    <group ref={group} position={node.position}>
      {selected ? <pointLight intensity={2.4} distance={4.2} color="#ffffff" /> : null}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          select(node.id);
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <sphereGeometry args={[node.radius, chrome ? 48 : 16, chrome ? 48 : 16]} />
        {chrome ? <ChromeMaterial selected={selected} root={node.kind === 'root'} /> : <meshBasicMaterial color="#d8d8d8" wireframe />}
      </mesh>
      <Html
        center
        sprite
        distanceFactor={node.kind === 'root' ? 6 : 10}
        zIndexRange={[20, 0]}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div className={`parse-label${selected ? ' is-on' : ''}${node.kind === 'root' ? ' is-root' : ''}`}>
          {node.label}
        </div>
      </Html>
    </group>
  );
}

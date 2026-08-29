'use client';

import { useMemo, useRef } from 'react';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useParse } from './ParseContext';
import ChromeMaterial, { WireMaterial } from './ChromeMaterial';

function etchMap() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#c8ccd2';
  ctx.fillRect(0, 0, 1024, 512);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 236, 1024, 40);
  ctx.fillStyle = '#ececec';
  ctx.font = '600 22px "IBM Plex Mono", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const band = '  RANK 2   /   BATCH 27   /  ';
  ctx.fillText(band.repeat(6), 512, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}

export function ParseEdge({ fromPos, toPos }) {
  const mesh = useRef();
  const { compileRef } = useParse();
  const geometry = useMemo(() => {
    const start = new THREE.Vector3(...fromPos);
    const end = new THREE.Vector3(...toPos);
    const mid = start.clone().lerp(end, 0.46);
    mid.z += 0.22 + Math.abs(end.x - start.x) * 0.06;
    mid.y += (end.y - start.y) * 0.12;
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    return new THREE.TubeGeometry(curve, 28, 0.018, 5, false);
  }, [fromPos, toPos]);

  useFrame(() => {
    if (!mesh.current) return;
    const count = geometry.index ? geometry.index.count : geometry.attributes.position.count;
    const drawn = Math.max(12, Math.floor(compileRef.current * count));
    geometry.setDrawRange(0, drawn);
    mesh.current.material.opacity = 0.18 + compileRef.current * 0.62;
  });

  return (
    <mesh ref={mesh} geometry={geometry}>
      <meshBasicMaterial color="#cfcfcf" transparent opacity={0.7} depthWrite={false} />
    </mesh>
  );
}

export default function ParseNode({ node }) {
  const group = useRef();
  const { selectedId, select, compileRef } = useParse();
  const selected = selectedId === node.id;
  const chrome = selected || node.kind === 'root';
  const map = useMemo(() => (node.kind === 'root' ? etchMap() : null), [node.kind]);

  useFrame(() => {
    if (!group.current) return;
    const grown = node.kind === 'root' ? 1 : 0.2 + compileRef.current * 0.8;
    const pulse = chrome && selected && node.kind !== 'root' ? 1.03 : 1;
    group.current.scale.setScalar(grown * pulse);
  });

  return (
    <group ref={group} position={node.position}>
      {selected ? <pointLight intensity={3.2} distance={5.4} color="#ffffff" /> : null}
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
        {chrome ? (
          <sphereGeometry args={[node.radius, node.kind === 'root' ? 64 : 40, node.kind === 'root' ? 48 : 40]} />
        ) : (
          <icosahedronGeometry args={[node.radius * 1.12, 0]} />
        )}
        {chrome ? (
          node.kind === 'root' ? (
            <meshPhysicalMaterial
              map={map}
              color="#d8dbe0"
              metalness={1}
              roughness={0.06}
              envMapIntensity={2.5}
              clearcoat={1}
              clearcoatRoughness={0.045}
              reflectivity={1}
              ior={1.7}
            />
          ) : (
            <ChromeMaterial selected={selected} />
          )
        ) : (
          <WireMaterial />
        )}
      </mesh>
      <Html
        center
        sprite
        distanceFactor={node.kind === 'root' ? 5.2 : 7.6}
        zIndexRange={[20, 0]}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        <div className={`parse-label${selected ? ' is-on' : ''}${node.kind === 'root' ? ' is-root' : ''}`}>
          {node.label}
        </div>
        {node.kind === 'root' ? <div className="parse-label is-rank">RANK 2  /  BATCH 27</div> : null}
      </Html>
    </group>
  );
}

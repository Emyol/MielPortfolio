'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef } from 'react';
import * as THREE from 'three';
import ChromeType from './ChromeType';
import ContactIngot from './ContactIngot';
import Hallmark from './Hallmark';
import KitMint from './KitMint';
import { inspectTargets, pickInspect } from './inspectTargets';
import { jobWeights } from './jobs';
import MercuryMaterial, { MercuryDrop, MercuryMass } from './MercuryMaterial';
import MeltStudio from './MeltStudio';
import WorkForm, { Lens } from './WorkForm';

function MeltRig({ reduced, progress, mode }) {
  const group = useRef(null);
  const weights = jobWeights(mode === 'scroll' ? progress : 0);

  useFrame((state) => {
    if (!group.current || reduced) return;
    if (mode === 'scroll') {
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, 0.12, 0.04);
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -0.04, 0.04);
      return;
    }
    const x = state.pointer.x;
    const y = state.pointer.y;
    group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, x * 0.16, 0.04);
    group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -y * 0.08, 0.04);
  });

  const typeScale = 0.98 * Math.max(0.08, weights.identity);
  const poolY = -1.12 + weights.contact * 0.35;

  return (
    <group ref={group}>
      <MercuryMass reduced={reduced} position={[0, poolY, -0.15]} scale={[1.7, 0.36, 1.05]} />
      <MercuryDrop reduced={reduced} position={[-1.85, -0.62, 0.35]} scale={[0.22, 0.32, 0.22]} />
      <MercuryDrop reduced={reduced} position={[1.92, -0.55, 0.28]} scale={[0.18, 0.26, 0.18]} />
      <MercuryDrop reduced={reduced} position={[0.08, -0.48, 0.55]} scale={[0.14, 0.2, 0.14]} />
      <group
        scale={typeScale}
        position={[0, 0.1 + (1 - weights.identity) * -0.8, 0.25]}
        visible={weights.identity > 0.04}
      >
        <ChromeType reduced={reduced} />
      </group>
      <KitMint amount={weights.kit} reduced={reduced} />
      <WorkForm amount={weights.work} reduced={reduced} />
      <Hallmark amount={weights.proof} reduced={reduced} />
      <ContactIngot amount={weights.contact} reduced={reduced} />
    </group>
  );
}

function InspectRig({ reduced, frozenId, onFreeze }) {
  const heat = useRef({ point: new THREE.Vector2(), amount: 0 });
  const frozen = frozenId ? inspectTargets[frozenId] : null;

  return (
    <group>
      <MercuryMass
        reduced={reduced}
        heat={frozenId || reduced ? null : heat.current}
        position={[0, -0.9, 0]}
        scale={[2.05, 0.52, 1.28]}
        onPointerMove={(event) => {
          heat.current.point.set(event.uv.x * 2 - 1, event.uv.y * 2 - 1);
          heat.current.amount = 1;
        }}
        onPointerOut={() => {
          heat.current.amount = 0;
        }}
        onClick={(event) => {
          event.stopPropagation();
          onFreeze(pickInspect(event.point.x / 2.2, event.point.y + 0.4));
        }}
      />
      <group visible={!frozen} scale={0.82} position={[0, 0.22, 0.18]}>
        <ChromeType reduced={reduced} />
      </group>
      {frozen?.form === 'lens' ? (
        <group position={[0, 0.15, 0.45]} scale={1.15}>
          <Lens reduced={reduced} />
        </group>
      ) : null}
      {frozen?.form === 'stamp' ? <Hallmark amount={1} reduced={reduced} /> : null}
      {frozen?.form === 'bar' ? (
        <mesh position={[0, 0.05, 0.35]}>
          <boxGeometry args={[1.6, 0.2, 0.2]} />
          <MercuryMaterial reduced={reduced} />
        </mesh>
      ) : null}
      {frozen?.form === 'ingot' ? <ContactIngot amount={1} reduced={reduced} /> : null}
    </group>
  );
}

export default function MeltCanvas({
  reduced = false,
  mode = 'studio',
  progress = 0,
  frozenId = null,
  onFreeze,
}) {
  return (
    <Canvas
      className="melt-canvas"
      dpr={[1, 1.75]}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: true,
      }}
      camera={{ position: [0, 0.18, 6.4], fov: 40 }}
      onCreated={({ gl }) => {
        gl.setClearColor('#000000', 1);
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.18;
        gl.outputColorSpace = THREE.SRGBColorSpace;
      }}
    >
      <color attach="background" args={['#000000']} />
      <ambientLight intensity={0.1} />
      <hemisphereLight args={['#f2f2f2', '#050505', 0.32]} />
      <directionalLight position={[5.5, 7, 6]} intensity={2.7} color="#ffffff" />
      <directionalLight position={[-6, 1.5, -4]} intensity={0.9} color="#b0b0b0" />
      <pointLight position={[0, -3.2, 5]} intensity={1.15} color="#d8d8d8" />
      <MeltStudio />
      {mode === 'inspect' ? (
        <InspectRig reduced={reduced} frozenId={frozenId} onFreeze={onFreeze} />
      ) : (
        <MeltRig reduced={reduced} progress={progress} mode={mode} />
      )}
      {mode === 'studio' ? (
        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={3.6}
          maxDistance={8}
          enableRotate={!reduced}
          enabled={!reduced}
        />
      ) : null}
    </Canvas>
  );
}

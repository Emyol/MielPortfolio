'use client';

import MercuryMaterial from './MercuryMaterial';

export default function ContactIngot({ amount = 0, reduced = false }) {
  if (amount < 0.02) return null;
  return (
    <mesh
      position={[0, -0.15, 0]}
      rotation={[0.08, 0.35 * (1 - amount), 0]}
      scale={[1.2 + amount * 0.6, 0.28 + amount * 0.1, 0.7]}
    >
      <boxGeometry args={[2.2, 1, 1.1]} />
      <MercuryMaterial reduced={reduced} />
    </mesh>
  );
}

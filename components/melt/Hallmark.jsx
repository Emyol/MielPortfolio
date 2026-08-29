'use client';

import { kit } from '../../data/kit';
import MercuryMaterial from './MercuryMaterial';

const CERTS = kit.filter((row) => row.kind === 'cert');

export default function Hallmark({ amount = 0, reduced = false }) {
  if (amount < 0.02) return null;
  return (
    <group>
      {CERTS.map((row, index) => {
        const x = (index - (CERTS.length - 1) / 2) * 0.72;
        return (
          <group key={row.id} position={[x, -0.05 + amount * 0.2, 0.1]} scale={0.35 + amount * 0.15}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[1, 1, 0.12, 6]} />
              <MercuryMaterial reduced={reduced} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

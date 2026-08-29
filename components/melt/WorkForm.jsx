'use client';

import MercuryMaterial from './MercuryMaterial';

const FORMS = [
  { id: 'kitako', position: [-1.6, 0.15, 0] },
  { id: 'bekilang', position: [-0.5, 0.2, 0.2] },
  { id: 'citysense', position: [0.6, 0.1, 0] },
  { id: 'icare-reservation', position: [1.7, 0.12, 0.15] },
];

function Lens({ reduced }) {
  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.55, 0.08, 16, 48]} />
        <MercuryMaterial reduced={reduced} />
      </mesh>
      <mesh>
        <circleGeometry args={[0.48, 48]} />
        <meshPhysicalMaterial
          color="#c8c8c8"
          metalness={0.2}
          roughness={0.05}
          transmission={0.7}
          thickness={0.4}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
}

function Glyph({ reduced }) {
  return (
    <group>
      <mesh position={[0, 0.15, 0]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.18, 1.1, 0.18]} />
        <MercuryMaterial reduced={reduced} />
      </mesh>
      <mesh position={[0.22, -0.1, 0]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[0.16, 0.7, 0.16]} />
        <MercuryMaterial reduced={reduced} />
      </mesh>
      <mesh position={[-0.2, -0.25, 0]}>
        <torusGeometry args={[0.22, 0.07, 12, 24, Math.PI]} />
        <MercuryMaterial reduced={reduced} />
      </mesh>
    </group>
  );
}

function MapFold({ reduced }) {
  return (
    <group rotation={[-0.5, 0.4, 0.15]}>
      <mesh>
        <boxGeometry args={[1.15, 0.04, 0.8]} />
        <MercuryMaterial reduced={reduced} />
      </mesh>
      <mesh position={[0.28, 0.08, 0]} rotation={[0, 0, 0.55]}>
        <boxGeometry args={[0.55, 0.04, 0.8]} />
        <MercuryMaterial reduced={reduced} />
      </mesh>
    </group>
  );
}

function Key({ reduced }) {
  return (
    <group rotation={[0.2, -0.4, 0.1]}>
      <mesh>
        <cylinderGeometry args={[0.22, 0.22, 0.16, 24]} />
        <MercuryMaterial reduced={reduced} />
      </mesh>
      <mesh position={[0.45, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.7, 12]} />
        <MercuryMaterial reduced={reduced} />
      </mesh>
      <mesh position={[0.68, -0.12, 0]}>
        <boxGeometry args={[0.12, 0.22, 0.08]} />
        <MercuryMaterial reduced={reduced} />
      </mesh>
    </group>
  );
}

const MESH = {
  kitako: Lens,
  bekilang: Glyph,
  citysense: MapFold,
  'icare-reservation': Key,
};

export default function WorkForm({ amount = 0, reduced = false }) {
  if (amount < 0.02) return null;
  return (
    <group scale={0.7 + amount * 0.35}>
      {FORMS.map((form) => {
        const Mesh = MESH[form.id];
        return (
          <group key={form.id} position={form.position} scale={amount}>
            <Mesh reduced={reduced} />
          </group>
        );
      })}
    </group>
  );
}

'use client';

export default function ChromeMaterial({ selected = false, root = false }) {
  const live = selected || root;
  return (
    <meshPhysicalMaterial
      color={live ? '#f2f2f2' : '#9a9a9a'}
      metalness={live ? 1 : 0.55}
      roughness={live ? 0.12 : 0.42}
      envMapIntensity={live ? 1.5 : 0.45}
      clearcoat={live ? 0.7 : 0}
      clearcoatRoughness={0.16}
    />
  );
}

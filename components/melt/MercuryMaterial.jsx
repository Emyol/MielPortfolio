'use client';

import { useLayoutEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const VERTEX_DISPLACE = /* glsl */ `
#include <begin_vertex>
vec3 p = transformed;
float t = uTime;
float n = sin(p.x * 2.35 + t * 0.62) * sin(p.y * 1.9 - t * 0.48) * sin(p.z * 2.7 + t * 0.37);
float n2 = sin(p.x * 5.4 - t * 0.9) * sin(p.y * 4.8 + t * 0.7);
float heat = uHeatAmt * exp(-dot(p.xz - uHeat, p.xz - uHeat) * 3.2);
transformed += normalize(objectNormal) * (n * 0.18 + n2 * 0.045 + heat * 0.42);
`;

export default function MercuryMaterial({ reduced = false, heat = null }) {
  const uTime = useRef({ value: 0 });
  const uHeatAmt = useRef({ value: 0 });
  const uHeat = useRef({ value: new THREE.Vector2() });

  useFrame((_, delta) => {
    if (!reduced) uTime.current.value += delta;
    if (heat) {
      uHeat.current.value.set(heat.point.x, heat.point.y);
      uHeatAmt.current.value = heat.amount;
    } else {
      uHeatAmt.current.value = 0;
    }
  });

  useLayoutEffect(() => {
    uTime.current.value = 0;
  }, [reduced]);

  return (
    <meshPhysicalMaterial
      color="#d5d8de"
      metalness={1}
      roughness={0.038}
      envMapIntensity={2.7}
      clearcoat={1}
      clearcoatRoughness={0.035}
      reflectivity={1}
      ior={1.7}
      specularIntensity={1}
      customProgramCacheKey={() => 'melt-mercury-heat'}
      onBeforeCompile={(shader) => {
        shader.uniforms.uTime = uTime.current;
        shader.uniforms.uHeatAmt = uHeatAmt.current;
        shader.uniforms.uHeat = uHeat.current;
        shader.vertexShader = `uniform float uTime;\nuniform float uHeatAmt;\nuniform vec2 uHeat;\n${shader.vertexShader.replace(
          '#include <begin_vertex>',
          VERTEX_DISPLACE
        )}`;
      }}
    />
  );
}

export function MercuryMass({ reduced = false, heat = null, ...props }) {
  return (
    <mesh {...props}>
      <sphereGeometry args={[1.15, 96, 64]} />
      <MercuryMaterial reduced={reduced} heat={heat} />
    </mesh>
  );
}

export function MercuryDrop({ reduced = false, ...props }) {
  return (
    <mesh {...props}>
      <sphereGeometry args={[1, 64, 64]} />
      <MercuryMaterial reduced={reduced} />
    </mesh>
  );
}

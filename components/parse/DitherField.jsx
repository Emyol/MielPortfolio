'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useParse } from './ParseContext';

const COUNT = 1800;

export default function DitherField() {
  const { reduced, moving, compileRef } = useParse();
  const points = useRef();
  const { camera } = useThree();
  const last = useRef(new THREE.Vector3());
  const geo = useMemo(() => {
    const positions = new Float32Array(COUNT * 3);
    const seeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i += 1) {
      const r = 5.2 + Math.random() * 11;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      seeds[i] = Math.random() * 100;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    return g;
  }, []);

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uAmp: { value: 0 },
          uOpacity: { value: 0.42 },
        },
        vertexShader: `
          uniform float uTime;
          uniform float uAmp;
          attribute float aSeed;
          void main() {
            vec3 p = position;
            p += vec3(
              sin(uTime * 0.55 + aSeed),
              cos(uTime * 0.4 + aSeed * 0.7),
              sin(uTime * 0.28 + aSeed * 1.3)
            ) * uAmp;
            vec4 mv = modelViewMatrix * vec4(p, 1.0);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = 1.7;
          }
        `,
        fragmentShader: `
          uniform float uOpacity;
          void main() {
            vec2 c = gl_PointCoord - 0.5;
            if (dot(c, c) > 0.22) discard;
            gl_FragColor = vec4(0.38, 0.38, 0.38, uOpacity);
          }
        `,
      }),
    []
  );

  useFrame((_, delta) => {
    if (!points.current) return;
    const dist = camera.position.distanceTo(last.current);
    last.current.copy(camera.position);
    const live = !reduced && (moving || dist > 0.002);
    mat.uniforms.uTime.value += delta;
    mat.uniforms.uAmp.value = live ? 0.06 : 0;
    mat.uniforms.uOpacity.value = 0.16 + compileRef.current * 0.38 + (live ? 0.12 : 0);
  });

  return <points ref={points} geometry={geo} material={mat} />;
}

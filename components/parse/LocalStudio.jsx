'use client';

import { useLayoutEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

function face(stopA, stopB, stopC) {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, size, size);
  g.addColorStop(0, stopA);
  g.addColorStop(0.45, stopB);
  g.addColorStop(1, stopC);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

export default function LocalStudio() {
  const { scene, gl } = useThree();

  useLayoutEffect(() => {
    const cube = new THREE.CubeTexture([
      face('#f7f7f7', '#cfcfcf', '#6a6a6a'),
      face('#d0d0d0', '#8a8a8a', '#1a1a1a'),
      face('#ffffff', '#e8e8e8', '#bdbdbd'),
      face('#2a2a2a', '#111111', '#000000'),
      face('#ececec', '#9a9a9a', '#3a3a3a'),
      face('#7a7a7a', '#2f2f2f', '#050505'),
    ]);
    cube.colorSpace = THREE.SRGBColorSpace;
    cube.needsUpdate = true;

    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromCubemap(cube).texture;
    scene.environment = env;
    scene.environmentIntensity = 1.15;

    return () => {
      scene.environment = null;
      env.dispose();
      cube.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  return null;
}

'use client';

import { useLayoutEffect } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';

function paint(draw) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  draw(ctx, size);
  return canvas;
}

function studioFaces() {
  return [
    paint((ctx, s) => {
      ctx.fillStyle = '#1c1c1c';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#f4f4f4';
      ctx.fillRect(18, 28, 70, 200);
      ctx.fillStyle = '#9a9a9a';
      ctx.fillRect(160, 40, 70, 80);
    }),
    paint((ctx, s) => {
      ctx.fillStyle = '#080808';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#6a6a6a';
      ctx.fillRect(s - 90, 90, 50, 90);
    }),
    paint((ctx, s) => {
      ctx.fillStyle = '#ececec';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(40, 20, 176, 90);
    }),
    paint((ctx, s) => {
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(0, s * 0.62, s, 24);
      ctx.fillStyle = '#7a7a7a';
      ctx.fillRect(80, s * 0.7, 96, 8);
    }),
    paint((ctx, s) => {
      ctx.fillStyle = '#111111';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#f7f7f7';
      ctx.fillRect(30, 36, 110, 150);
      ctx.fillStyle = '#bdbdbd';
      ctx.fillRect(160, 160, 60, 40);
    }),
    paint((ctx, s) => {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, s, s);
      ctx.fillStyle = '#4a4a4a';
      ctx.fillRect(40, 70, s - 80, 20);
    }),
  ];
}

export default function LocalStudio() {
  const { scene, gl } = useThree();

  useLayoutEffect(() => {
    const cube = new THREE.CubeTexture(studioFaces());
    cube.colorSpace = THREE.SRGBColorSpace;
    cube.needsUpdate = true;

    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromCubemap(cube).texture;
    scene.environment = env;
    scene.environmentIntensity = 1.85;

    return () => {
      scene.environment = null;
      env.dispose();
      cube.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);

  return null;
}

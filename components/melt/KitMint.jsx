'use client';

import { useLayoutEffect, useMemo } from 'react';
import * as THREE from 'three';
import { kit } from '../../data/kit';
import MercuryMaterial from './MercuryMaterial';

const TOOLS = kit.filter((row) => row.kind === 'tool');

function paintMark(id) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.arc(128, 128, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f2f2f2';
  ctx.fillStyle = '#f2f2f2';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (id === 'git') {
    ctx.beginPath();
    ctx.arc(80, 80, 16, 0, Math.PI * 2);
    ctx.arc(176, 80, 16, 0, Math.PI * 2);
    ctx.arc(128, 176, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(80, 80);
    ctx.lineTo(176, 80);
    ctx.lineTo(128, 176);
    ctx.closePath();
    ctx.stroke();
  } else if (id === 'flutter') {
    ctx.beginPath();
    ctx.moveTo(70, 128);
    ctx.lineTo(128, 70);
    ctx.lineTo(186, 128);
    ctx.lineTo(128, 186);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(128, 128);
    ctx.lineTo(186, 70);
    ctx.stroke();
  } else if (id === 'nextjs') {
    ctx.beginPath();
    ctx.arc(128, 128, 54, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(96, 168);
    ctx.lineTo(160, 88);
    ctx.stroke();
  } else if (id === 'figma') {
    ctx.beginPath();
    ctx.arc(128, 88, 28, 0, Math.PI * 2);
    ctx.arc(100, 128, 28, 0, Math.PI * 2);
    ctx.arc(156, 128, 28, 0, Math.PI * 2);
    ctx.arc(100, 168, 28, 0, Math.PI * 2);
    ctx.arc(128, 168, 28, 0, Math.PI * 2);
    ctx.stroke();
  } else if (id === 'cursor') {
    ctx.beginPath();
    ctx.moveTo(96, 72);
    ctx.lineTo(96, 184);
    ctx.lineTo(128, 152);
    ctx.lineTo(168, 196);
    ctx.lineTo(184, 180);
    ctx.lineTo(140, 140);
    ctx.closePath();
    ctx.stroke();
  } else if (id === 'onnx') {
    ctx.beginPath();
    ctx.arc(128, 128, 48, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(128, 80);
    ctx.lineTo(128, 176);
    ctx.moveTo(80, 128);
    ctx.lineTo(176, 128);
    ctx.stroke();
  } else if (id === 'claude-code') {
    ctx.beginPath();
    ctx.arc(128, 128, 52, 0.2, Math.PI * 1.8);
    ctx.stroke();
  } else if (id === 'google-workspace') {
    ctx.beginPath();
    ctx.moveTo(128, 72);
    ctx.lineTo(184, 104);
    ctx.lineTo(184, 168);
    ctx.lineTo(128, 200);
    ctx.lineTo(72, 168);
    ctx.lineTo(72, 104);
    ctx.closePath();
    ctx.stroke();
  } else {
    ctx.beginPath();
    ctx.moveTo(88, 168);
    ctx.lineTo(88, 88);
    ctx.lineTo(168, 88);
    ctx.lineTo(168, 168);
    ctx.stroke();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function Coin({ row, index, amount, reduced }) {
  const tex = useMemo(() => paintMark(row.id), [row.id]);
  const col = index % 3;
  const rowI = Math.floor(index / 3);

  useLayoutEffect(() => () => tex.dispose(), [tex]);

  const x = (col - 1) * 1.15 * (0.4 + amount);
  const y = 0.55 - rowI * 0.72 * (0.5 + amount * 0.5);
  const z = 0.55;

  return (
    <group position={[x, y, z]} rotation={[-0.9, 0, 0]} scale={0.22 + amount * 0.16}>
      <mesh>
        <cylinderGeometry args={[1, 1, 0.16, 32]} />
        <MercuryMaterial reduced={reduced} />
      </mesh>
      <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.82, 32]} />
        <meshBasicMaterial map={tex} transparent />
      </mesh>
    </group>
  );
}

export default function KitMint({ amount = 0, reduced = false }) {
  if (amount < 0.02) return null;
  return (
    <group>
      {TOOLS.map((row, index) => (
        <Coin key={row.id} row={row} index={index} amount={amount} reduced={reduced} />
      ))}
    </group>
  );
}

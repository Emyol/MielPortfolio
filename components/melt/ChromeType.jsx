'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import MercuryMaterial from './MercuryMaterial';

const EXTRUDE = {
  depth: 0.4,
  bevelEnabled: true,
  bevelThickness: 0.085,
  bevelSize: 0.055,
  bevelOffset: 0,
  bevelSegments: 8,
  curveSegments: 10,
};

function roundRect(x, y, w, h, r) {
  const s = new THREE.Shape();
  const rr = Math.min(r, w / 2, h / 2);
  s.moveTo(x + rr, y);
  s.lineTo(x + w - rr, y);
  s.absarc(x + w - rr, y + rr, rr, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - rr);
  s.absarc(x + w - rr, y + h - rr, rr, 0, Math.PI / 2, false);
  s.lineTo(x + rr, y + h);
  s.absarc(x + rr, y + h - rr, rr, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + rr);
  s.absarc(x + rr, y + rr, rr, Math.PI, Math.PI * 1.5, false);
  return s;
}

function quad(points) {
  const s = new THREE.Shape();
  s.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) s.lineTo(points[i][0], points[i][1]);
  s.closePath();
  return s;
}

const LETTERS = {
  A: () => [
    quad([
      [0.0, 0.0],
      [0.24, 0.0],
      [0.54, 1.08],
      [0.3, 1.08],
    ]),
    quad([
      [0.76, 0.0],
      [1.0, 0.0],
      [0.7, 1.08],
      [0.46, 1.08],
    ]),
    roundRect(0.22, 0.36, 0.56, 0.18, 0.07),
  ],
  M: () => [
    roundRect(0, 0, 0.22, 1.08, 0.08),
    roundRect(0.78, 0, 0.22, 1.08, 0.08),
    quad([
      [0.14, 1.08],
      [0.38, 1.08],
      [0.56, 0.22],
      [0.34, 0.22],
    ]),
    quad([
      [0.62, 1.08],
      [0.86, 1.08],
      [0.66, 0.22],
      [0.44, 0.22],
    ]),
  ],
  I: () => [roundRect(0.16, 0, 0.28, 1.08, 0.1)],
  E: () => [
    roundRect(0, 0, 0.2, 1.08, 0.08),
    roundRect(0.12, 0, 0.7, 0.2, 0.08),
    roundRect(0.12, 0.44, 0.58, 0.2, 0.08),
    roundRect(0.12, 0.88, 0.7, 0.2, 0.08),
  ],
  L: () => [roundRect(0, 0, 0.2, 1.08, 0.08), roundRect(0.08, 0, 0.7, 0.2, 0.08)],
};

const LAYOUT = [
  { ch: 'A', x: -1.72 },
  { ch: 'M', x: -0.82 },
  { ch: 'I', x: -0.08 },
  { ch: 'E', x: 0.38 },
  { ch: 'L', x: 1.18 },
];

function Letter({ ch, reduced }) {
  const geometry = useMemo(() => {
    const shapes = LETTERS[ch]();
    const geom = new THREE.ExtrudeGeometry(shapes, EXTRUDE);
    geom.computeVertexNormals();
    geom.center();
    return geom;
  }, [ch]);

  return (
    <mesh geometry={geometry} scale={[1, 1, 1]}>
      <MercuryMaterial reduced={reduced} />
    </mesh>
  );
}

export default function ChromeType({ reduced = false }) {
  return (
    <group position={[0, 0.08, 0.28]}>
      {LAYOUT.map((row) => (
        <group key={row.ch} position={[row.x, 0, 0]}>
          <Letter ch={row.ch} reduced={reduced} />
        </group>
      ))}
    </group>
  );
}

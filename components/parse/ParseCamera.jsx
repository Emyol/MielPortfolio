'use client';

import { useEffect, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useParse } from './ParseContext';

const HOME = [0, 0.2, 7.4];

export default function ParseCamera() {
  const ref = useRef();
  const { resetToken, reduced, setMoving, skipCompile } = useParse();

  useEffect(() => {
    const controls = ref.current;
    if (!controls) return;
    controls.object.position.set(...HOME);
    controls.target.set(0, 0, 0);
    controls.update();
  }, [resetToken]);

  return (
    <OrbitControls
      ref={ref}
      makeDefault
      enableDamping={!reduced}
      dampingFactor={0.08}
      enablePan={false}
      minDistance={4.2}
      maxDistance={14}
      minPolarAngle={0.35}
      maxPolarAngle={Math.PI - 0.35}
      onStart={() => {
        skipCompile();
        setMoving(true);
      }}
      onEnd={() => setMoving(false)}
    />
  );
}

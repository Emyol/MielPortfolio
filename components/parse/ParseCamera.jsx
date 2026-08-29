'use client';

import { useEffect, useRef } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useParse } from './ParseContext';

const HOME = [0, 0.06, 5.9];

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
      dampingFactor={0.085}
      enablePan={false}
      minDistance={3.6}
      maxDistance={12}
      minPolarAngle={0.42}
      maxPolarAngle={Math.PI - 0.42}
      onStart={() => {
        skipCompile();
        setMoving(true);
      }}
      onEnd={() => setMoving(false)}
    />
  );
}

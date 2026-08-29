'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const ParseContext = createContext(null);

export function ParseProvider({ children }) {
  const [selectedId, setSelectedId] = useState(null);
  const [resetToken, setResetToken] = useState(0);
  const [reduced, setReduced] = useState(false);
  const [moving, setMoving] = useState(false);
  const compileRef = useRef(0);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => {
      setReduced(mq.matches);
      if (mq.matches) compileRef.current = 1;
    };
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  const select = useCallback((id) => {
    compileRef.current = 1;
    setSelectedId(id);
  }, []);

  const clear = useCallback(() => setSelectedId(null), []);

  const resetCamera = useCallback(() => {
    compileRef.current = 1;
    setResetToken((n) => n + 1);
  }, []);

  const skipCompile = useCallback(() => {
    compileRef.current = 1;
  }, []);

  const value = useMemo(
    () => ({
      selectedId,
      select,
      clear,
      resetToken,
      resetCamera,
      reduced,
      compileRef,
      skipCompile,
      moving,
      setMoving,
    }),
    [selectedId, select, clear, resetToken, resetCamera, reduced, skipCompile, moving]
  );

  return <ParseContext.Provider value={value}>{children}</ParseContext.Provider>;
}

export function useParse() {
  const ctx = useContext(ParseContext);
  if (!ctx) throw new Error('useParse requires ParseProvider');
  return ctx;
}

"use client";
import { useSyncExternalStore } from 'react';
export const motionTiming = { feedback: 0.18, state: 0.3, entrance: 0.75 };
export const motionEase = [0.16, 1, 0.3, 1] as const;
const query = '(prefers-reduced-motion: reduce)';
const subscribe = (notify: () => void) => {
  const media = window.matchMedia(query);
  media.addEventListener('change', notify);
  return () => media.removeEventListener('change', notify);
};
export function useMotionPreference() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}

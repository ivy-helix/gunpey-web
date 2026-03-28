import { useEffect, useRef } from 'react';

export function useGameLoop(callback: (delta: number) => void, active: boolean) {
  const callbackRef = useRef(callback);
  const lastTimeRef = useRef<number | null>(null);
  const rafRef      = useRef<number>(0);

  callbackRef.current = callback;

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
      return;
    }

    const loop = (timestamp: number) => {
      if (lastTimeRef.current === null) lastTimeRef.current = timestamp;
      const delta = Math.min(timestamp - lastTimeRef.current, 50); // cap at 50ms
      lastTimeRef.current = timestamp;
      callbackRef.current(delta);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active]);
}

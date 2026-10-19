import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap';

// Shared, mutable scroll state read every frame by the 3D scenes (no React re-renders).
export const scrollState = { velocity: 0, progress: 0 };

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

export function scrollToHash(hash: string, lenis: Lenis | null) {
  const target = hash === '#top' ? 0 : (document.querySelector(hash) as HTMLElement | null);
  if (target === null) return;
  if (lenis) lenis.scrollTo(target, { duration: 1.6 });
  else if (target === 0) window.scrollTo({ top: 0 });
  else target.scrollIntoView();
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) {
      const onScroll = () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        scrollState.progress = max > 0 ? scrollY / max : 0;
      };
      addEventListener('scroll', onScroll, { passive: true });
      return () => removeEventListener('scroll', onScroll);
    }

    const instance = new Lenis({ lerp: 0.1, wheelMultiplier: 1 });
    instance.on('scroll', (l: Lenis) => {
      scrollState.velocity = l.velocity;
      scrollState.progress = l.progress;
      ScrollTrigger.update();
    });
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    setLenis(instance);

    return () => {
      gsap.ticker.remove(tick);
      instance.destroy();
      setLenis(null);
    };
  }, []);

  // Route every in-page anchor through Lenis so jumps glide instead of snapping.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const hash = a.getAttribute('href')!;
      if (hash.length < 2) return;
      e.preventDefault();
      scrollToHash(hash, lenis);
      history.replaceState(null, '', hash === '#top' ? location.pathname : hash);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, [lenis]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}

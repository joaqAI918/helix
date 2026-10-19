import { useEffect, type RefObject } from 'react';
import { gsap, finePointer, prefersReducedMotion } from './gsap';

// Pulls an element a little towards the pointer while it is near, and lets it settle back.
export function useMagnetic(ref: RefObject<HTMLElement | null>, strength = 0.35) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !finePointer() || prefersReducedMotion()) return;
    const x = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3.out' });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      x((e.clientX - (r.left + r.width / 2)) * strength);
      y((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      x(0);
      y(0);
    };
    const zone = el.parentElement ?? el;
    zone.addEventListener('pointermove', move);
    zone.addEventListener('pointerleave', leave);
    return () => {
      zone.removeEventListener('pointermove', move);
      zone.removeEventListener('pointerleave', leave);
    };
  }, [ref, strength]);
}

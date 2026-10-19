import { useEffect, useRef, useState } from 'react';
import { gsap, finePointer, prefersReducedMotion } from '../lib/gsap';
import './cursor.css';

// A label that travels beside the native cursor over things that do something unusual
// (a craft part, a print, a round). The system cursor itself is never hidden.
export default function Cursor() {
  const root = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState('');
  const [enabled] = useState(() => finePointer() && !prefersReducedMotion());

  useEffect(() => {
    if (!enabled) return;
    const el = root.current!;
    const x = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' });
    let current: Element | null = null;

    const move = (e: PointerEvent) => {
      x(e.clientX);
      y(e.clientY);
      const target = (e.target as Element).closest('[data-cursor]');
      if (target !== current) {
        current = target;
        if (target) {
          setLabel(target.getAttribute('data-cursor') ?? '');
          gsap.to(el, { scale: 1, autoAlpha: 1, duration: 0.24, ease: 'power3.out' });
        } else {
          gsap.to(el, { scale: 0.6, autoAlpha: 0, duration: 0.18, ease: 'power2.out' });
        }
      }
    };
    addEventListener('pointermove', move, { passive: true });
    return () => removeEventListener('pointermove', move);
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div className="cursor" ref={root} aria-hidden="true">
      <span>{label}</span>
    </div>
  );
}

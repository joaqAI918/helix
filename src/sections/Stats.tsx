import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/gsap';
import { stats } from '../data/content';
import './stats.css';

// One figure owns the screen. It rises once from its mask and then stays still.
export default function Stats() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 55%', once: true } });
      tl.from('.stats__claim > span', { yPercent: 110, duration: 0.9 })
        .from('.stats__figure > span', { yPercent: 105, duration: 1.3, ease: 'expo.out' }, 0.25)
        .from('.stats__caption', { y: 20, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.6)
        .from('.stats__source', { autoAlpha: 0, duration: 0.6 }, 0.8);
    },
    { scope: root },
  );

  return (
    <section className="stats chapter" ref={root} data-ink="light" aria-labelledby="stats-title">
      <h2 className="stats__claim mask" id="stats-title">
        <span>{stats.claim}</span>
      </h2>
      <div className="stats__body">
        <p className="stats__figure display mask" aria-label={`${stats.figure} ${stats.unit}`}>
          <span>
            {stats.figure}
            <sup>{stats.unit}</sup>
          </span>
        </p>
        <p className="stats__caption">{stats.caption}</p>
      </div>
      <p className="stats__source">{stats.source}</p>
    </section>
  );
}

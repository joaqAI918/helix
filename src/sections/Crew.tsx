import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/gsap';
import { crew } from '../data/content';
import './crew.css';

const TINTS = ['var(--field-1)', 'var(--field-2)', 'var(--field-3)', 'var(--field-5)'];

export default function Crew() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('.crew__heading > span', {
        yPercent: 110,
        duration: 0.9,
        scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
      });
      revealTiles(gsap.utils.toArray<HTMLElement>('.member'));
    },
    { scope: root },
  );

  return (
    <section className="crew chapter" id="crew" ref={root} data-ink="light" aria-labelledby="crew-title">
      <h2 className="crew__heading mask" id="crew-title">
        <span>{crew.heading}</span>
      </h2>
      <ul className="crew__grid">
        {crew.people.map((p, i) => (
          <li className="member" key={p.name}>
            <div className="member__frame" style={{ background: TINTS[i % 4] }}>
              <img src={p.photo} width={640} height={800} alt={`Portrait of ${p.name}`} loading="lazy" decoding="async" />
            </div>
            <p className="member__name">{p.name}</p>
            <p className="member__role">{p.role}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Row by row: each tile opens upwards from its baseline, then its name and role follow.
function revealTiles(tiles: HTMLElement[]) {
  tiles.forEach((t, i) => {
    gsap
      .timeline({ scrollTrigger: { trigger: t, start: 'top 88%', once: true }, delay: (i % 4) * 0.08 })
      .fromTo(
        t.querySelector('.member__frame'),
        { clipPath: 'inset(100% 0% 0% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.0, ease: 'expo.inOut' },
      )
      .from(t.querySelector('img'), { scale: 1.18, duration: 1.4, ease: 'power3.out', clearProps: 'transform' }, '<')
      .from(t.querySelectorAll('p'), { y: 14, autoAlpha: 0, duration: 0.6, stagger: 0.06, ease: 'power3.out' }, '-=0.5');
  });
}

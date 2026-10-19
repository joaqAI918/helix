import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/gsap';
import { credits, footer, otherCredits } from '../data/content';
import './footer.css';

const BLOCKS = [
  { color: 'var(--field-4)', h: 100 },
  { color: 'var(--field-2)', h: 74 },
  { color: 'var(--field-3)', h: 88 },
  { color: 'var(--field-1)', h: 62 },
  { color: 'var(--field-5)', h: 94 },
];

// The mark, built large: each letter knocked out of its own block, the blocks rising
// from one baseline as the page arrives at its end.
export default function Footer() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from('.block', {
        clipPath: 'inset(92% 0% 0% 0%)',
        ease: 'none',
        stagger: 0.12,
        scrollTrigger: { trigger: '.mark', start: 'top 95%', end: 'bottom 75%', scrub: 0.6 },
      });
      gsap.from('.block span', {
        yPercent: 60,
        ease: 'none',
        stagger: 0.12,
        scrollTrigger: { trigger: '.mark', start: 'top 95%', end: 'bottom 75%', scrub: 0.6 },
      });
      gsap.from('.foot__cols > *', {
        y: 20,
        autoAlpha: 0,
        duration: 0.7,
        stagger: 0.07,
        ease: 'power3.out',
        scrollTrigger: { trigger: '.foot__cols', start: 'top 92%', once: true },
      });
    },
    { scope: root },
  );

  return (
    <footer className="foot" ref={root} data-ink="light">
      <div className="mark" role="img" aria-label="Helix">
        {footer.word.split('').map((ch, i) => (
          <div className="block" key={i} style={{ background: BLOCKS[i].color, height: `${BLOCKS[i].h}%` }}>
            <span aria-hidden="true">{ch}</span>
          </div>
        ))}
      </div>

      <div className="foot__cols">
        {footer.columns.map((col, i) => (
          <ul key={i}>
            {col.map((l) => (
              <li key={l.label}>
                <a className="link" href={l.href}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        ))}
        <div className="foot__lines">
          {footer.lines.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>
      </div>

      <p className="credits">
        Pictures and footage, all public domain or CC0, via Wikimedia Commons:{' '}
        {credits.map((c, i) => (
          <span key={c.href}>
            <a className="link" href={c.href}>
              “{c.title}”
            </a>{' '}
            by {c.by}
            {i < credits.length - 1 ? '; ' : '.'}
          </span>
        ))}{' '}
        {otherCredits.map((c) => (
          <span key={c.href}>
            {' '}
            <a className="link" href={c.href}>
              {c.text}
            </a>
          </span>
        ))}{' '}
        Helix Orbital, its crew and its season are fictional, and nothing here is endorsed by NASA, ESA or NOAA.
      </p>

      <div className="foot__last">
        <p>© 2089 Helix Orbital</p>
        <a className="button" href="#top">
          Back to the start
        </a>
      </div>
    </footer>
  );
}

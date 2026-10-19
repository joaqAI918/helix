import { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap';
import { nav } from '../data/content';
import './header.css';

// A plain bar: chapter links left, wordmark centred, one action right. It takes the ink of the
// chapter beneath it and steps out of the way while the reader scrolls down.
export default function Header() {
  const root = useRef<HTMLElement>(null);

  useGSAP(() => {
    const el = root.current!;
    const sections = gsap.utils.toArray<HTMLElement>('[data-ink]');
    sections.forEach((section) => {
      ScrollTrigger.create({
        trigger: section,
        start: 'top 40px',
        end: 'bottom 40px',
        refreshPriority: -1,
        onToggle: (self) => {
          if (self.isActive) el.style.setProperty('--header-ink', section.dataset.ink === 'dark' ? '#000' : '#fff');
        },
      });
    });

    const hide = gsap.quickTo(el, 'yPercent', { duration: 0.45, ease: 'power3.out' });
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => hide(self.direction === 1 && self.scroll() > 240 ? -110 : 0),
    });
  });

  return (
    <header className="bar" ref={root}>
      <nav className="bar__nav" aria-label="Chapters">
        {nav.map((l) => (
          <a className="link" href={l.href} key={l.href}>
            {l.label}
          </a>
        ))}
      </nav>
      <a className="bar__mark" href="#top" aria-label="Helix Orbital, back to the start">
        Helix Orbital
      </a>
      <a className="bar__link link" href="#contact">
        Race passes
      </a>
    </header>
  );
}

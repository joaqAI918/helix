import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/gsap';
import { orbits } from '../data/content';
import './orbits.css';

// Prints dropped on the headline: three real photographs of orbit land on the words
// and hide half the letters. Pointing at one lifts it to the front and straightens it.
export default function Orbits() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 60%', once: true } });
      // Each print arrives from its own side of the words (the top one from above, the low ones
      // from below), so none ever passes over the headline on its way in.
      tl.from('.orbits__headline .mask > span', { yPercent: 110, duration: 1.0, stagger: 0.12 }).from(
        '.drop',
        {
          y: (i: number) => (i === 0 ? -1 : 1) * window.innerHeight * 0.6,
          rotation: (i: number) => [-24, 20, -14][i],
          duration: 1.5,
          stagger: 0.16,
          ease: 'expo.out',
        },
        0.25,
      );
      tl.from('.orbits__sentence', { y: 16, autoAlpha: 0, duration: 0.7, ease: 'power3.out' }, 0.9);

      // A little drift while the field crosses the screen, each print at its own rate.
      gsap.utils.toArray<HTMLElement>('.drop').forEach((el, i) => {
        gsap.fromTo(
          el,
          { yPercent: 6 + i * 4 },
          {
            yPercent: -(6 + i * 4),
            ease: 'none',
            immediateRender: false,
            scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <section className="orbits chapter" id="orbits" ref={root} data-ink="dark" aria-labelledby="orbits-title">
      <h2 className="orbits__headline display" id="orbits-title">
        {orbits.headline.map((l) => (
          <span className="mask" key={l}>
            <span>{l}</span>
          </span>
        ))}
      </h2>

      {orbits.prints.map((p, i) => (
        <div className={`drop drop--${i + 1}`} key={p.src}>
          <figure className="print" data-cursor="Lift">
            <img src={p.src} width={p.w} height={p.h} alt={p.alt} loading="lazy" decoding="async" />
          </figure>
        </div>
      ))}

      <p className="orbits__sentence">{orbits.sentence}</p>
    </section>
  );
}

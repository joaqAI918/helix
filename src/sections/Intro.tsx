import { Fragment, useRef } from 'react';
import { gsap, SplitText, useGSAP, prefersReducedMotion } from '../lib/gsap';
import { intro, photos } from '../data/content';
import './intro.css';

export default function Intro() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.board', start: 'top 75%', once: true } });
      tl.from('.tile--a', { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.1, ease: 'expo.inOut' })
        .from('.tile--b', { clipPath: 'inset(0% 0% 0% 100%)', duration: 1.0, ease: 'expo.inOut' }, 0.12)
        .from('.tile--c', { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.0, ease: 'expo.inOut' }, 0.22)
        .from('.tile--c img', { scale: 1.25, duration: 1.6, ease: 'power3.out' }, 0.22)
        .from('.slogan .mask > span', { yPercent: 110, duration: 0.95, stagger: 0.11 }, 0.55)
        .from('.tile--b .figure > span', { yPercent: 110, duration: 0.9 }, 0.65);

      const counter = { v: 0 };
      tl.to(
        counter,
        {
          v: 92,
          duration: 1.4,
          ease: 'power3.out',
          onUpdate: () => {
            const el = root.current?.querySelector('.figure__num');
            if (el) el.textContent = String(Math.round(counter.v));
          },
        },
        0.65,
      );

      // The city lights drift slowly while the board crosses the screen.
      gsap.fromTo(
        '.tile--c img',
        { yPercent: -4 },
        {
          yPercent: 4,
          ease: 'none',
          immediateRender: false,
          scrollTrigger: { trigger: '.board', start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );

      // The launch photograph opens upwards like a shutter and keeps rising slowly with the scroll.
      gsap
        .timeline({ scrollTrigger: { trigger: '.board__photo', start: 'top 80%', once: true } })
        .fromTo(
          '.board__shutter',
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.3, ease: 'expo.inOut' },
        )
        .from('.board__photo figcaption', { y: 12, autoAlpha: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4');
      gsap.fromTo(
        '.board__shutter img',
        { yPercent: -6, scale: 1.12 },
        {
          yPercent: 6,
          scale: 1.12,
          ease: 'none',
          scrollTrigger: { trigger: '.board__photo', start: 'top bottom', end: 'bottom top', scrub: true },
        },
      );

      // Words brighten as they are read, from a floor that still passes 4.5:1 on black for anyone
      // who stops scrolling halfway.
      const split = SplitText.create('.board__text > p', { type: 'words' });
      gsap.fromTo(
        split.words,
        { opacity: 0.5 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.04,
          scrollTrigger: { trigger: '.board__text', start: 'top 80%', end: 'bottom 55%', scrub: true },
        },
      );
    },
    { scope: root },
  );

  const p = photos.cityNight;
  return (
    <section className="intro" ref={root} data-ink="light" aria-labelledby="intro-title">
      <div className="board">
        <div className="tile tile--a">
          <h2 className="slogan display" id="intro-title">
            {intro.slogan.map((l, i) => (
              <Fragment key={l}>
                {/* The lines stack visually; the space keeps them separate words for crawlers and readers. */}
                {i > 0 && ' '}
                <span className="mask">
                  <span>{l}</span>
                </span>
              </Fragment>
            ))}
          </h2>
        </div>
        <div className="tile tile--b">
          <p className="figure display mask" aria-label="92 minutes per race">
            <span>
              <span className="figure__num">92</span> min
            </span>
          </p>
        </div>
        <div className="tile tile--c">
          <img src={p.src} width={p.w} height={p.h} alt={p.alt} loading="lazy" decoding="async" />
        </div>
        <div className="board__text">
          <figure className="board__photo">
            <div className="board__shutter">
              <img
                src={intro.photo.src}
                width={intro.photo.w}
                height={intro.photo.h}
                alt={intro.photo.alt}
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption>{intro.caption}</figcaption>
          </figure>
          <p>{intro.text}</p>
        </div>
      </div>
    </section>
  );
}

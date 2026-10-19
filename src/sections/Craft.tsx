import { lazy, Suspense, useEffect, useRef, useState, type CSSProperties } from 'react';
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from '../lib/gsap';
import { useLenis } from '../lib/SmoothScroll';
import { useInView } from '../lib/useInView';
import { craft } from '../data/content';
import SceneBoundary from '../components/SceneBoundary';
import type { CraftMotion } from '../three/Craft';
import './craft.css';

const CraftCanvas = lazy(() => import('../three/Craft'));

// Object on a disc. The craft flies in as the section arrives, turns through its five parts while the
// section is pinned, then climbs away. Scroll position is written straight into `motion` and the 3D
// scene glides towards it every frame; the list marker slides with the same number.
export default function Craft() {
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const marker = useRef<HTMLSpanElement>(null);
  const disc = useRef<HTMLDivElement>(null);
  const pin = useRef<ScrollTrigger | null>(null);
  const motion = useRef<CraftMotion>({ enter: 0, progress: 0, exit: 0 });
  const [active, setActive] = useState(0);
  const lenis = useLenis();
  const inView = useInView(root, '20% 0px');
  // three.js and the model load only once the reader is within about two screens of the craft.
  const near = useInView(root, '200% 0px');
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (near) setMounted(true);
  }, [near]);
  // Fetch the 3D code and model while the reader is still up in the hero, once the page is idle, so the
  // craft is ready however fast they scroll down to it.
  useEffect(() => {
    const warm = () => {
      import('../three/Craft').catch(() => {});
      fetch('/models/hx07.glb').catch(() => {});
    };
    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 2500));
    const id = idle(warm);
    return () => (window.cancelIdleCallback ?? window.clearTimeout)(id);
  }, []);
  const parts = craft.parts;
  const current = parts[active];

  useGSAP(
    () => {
      const n = parts.length;
      if (prefersReducedMotion()) {
        motion.current.enter = 1;
        return;
      }

      // Centre of each name, measured on screen relative to the list, for the marker to travel between.
      let stops: number[] = [];
      const measure = () => {
        if (!list.current) return;
        const top = list.current.getBoundingClientRect().top;
        stops = Array.from(list.current.querySelectorAll<HTMLElement>('.craft__item')).map((el) => {
          const r = el.getBoundingClientRect();
          return r.top - top + r.height / 2;
        });
      };
      const place = (p: number) => {
        measure();
        if (stops.length < 2) return;
        const t = p * (n - 1);
        const i = Math.min(Math.floor(t), n - 2);
        const y = stops[i] + (stops[i + 1] - stops[i]) * (t - i);
        if (marker.current) marker.current.style.transform = `translateY(${y}px)`;
        if (disc.current) disc.current.style.transform = `scale(${0.94 + 0.1 * p})`;
      };

      ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'top top',
        onUpdate: (self) => (motion.current.enter = self.progress),
      });

      pin.current = ScrollTrigger.create({
        trigger: root.current,
        start: 'top top',
        end: () => '+=' + window.innerHeight * 2.6,
        pin: true,
        onRefresh: () => place(motion.current.progress),
        onUpdate: (self) => {
          motion.current.progress = self.progress;
          setActive(Math.min(n - 1, Math.round(self.progress * (n - 1))));
          place(self.progress);
        },
      });

      ScrollTrigger.create({
        trigger: root.current,
        start: () => pin.current!.end,
        end: () => pin.current!.end + window.innerHeight,
        onUpdate: (self) => (motion.current.exit = self.progress),
      });

      place(0);
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 70%', once: true } });
      tl.from('.craft__disc', { autoAlpha: 0, duration: 1.2, ease: 'expo.out' })
        .from('.craft__heading, .craft__list li', {
          y: 28,
          autoAlpha: 0,
          duration: 0.8,
          stagger: 0.07,
          ease: 'power3.out',
          clearProps: 'transform',
          onComplete: () => place(motion.current.progress),
        }, 0.2)
        .from('.craft__marker', { autoAlpha: 0, duration: 0.6 }, 0.6)
        .from('.craft__fact', { y: 20, autoAlpha: 0, duration: 0.8, ease: 'power3.out' }, 0.5);
    },
    { scope: root },
  );

  const choose = (i: number) => {
    const st = pin.current;
    if (st && lenis) {
      lenis.scrollTo(st.start + ((st.end - st.start) * i) / (parts.length - 1), { duration: 1.4 });
    } else {
      motion.current.progress = i / (parts.length - 1);
      setActive(i);
    }
  };

  return (
    <section
      className="craft chapter"
      id="craft"
      ref={root}
      data-ink="dark"
      aria-labelledby="craft-title"
      style={{ '--disc': current.disc } as CSSProperties}
    >
      <div className="craft__disc" ref={disc} aria-hidden="true" />
      <div className="craft__stage">
        {mounted && (
          <SceneBoundary>
            <Suspense fallback={null}>
              <CraftCanvas motion={motion} visible={inView} />
            </Suspense>
          </SceneBoundary>
        )}
      </div>

      <div className="craft__nav" ref={list}>
        <h2 id="craft-title" className="craft__heading">
          {craft.heading}
        </h2>
        <ul className="craft__list">
          {parts.map((p, i) => (
            <li key={p.id}>
              <button
                type="button"
                className={'craft__item' + (i === active ? ' is-active' : '')}
                aria-pressed={i === active}
                onClick={() => choose(i)}
              >
                {p.name}
              </button>
            </li>
          ))}
        </ul>
        <span className="craft__marker" ref={marker} aria-hidden="true" />
      </div>

      <p className="craft__fact" key={current.id} aria-live="polite">
        {current.fact}
      </p>
    </section>
  );
}

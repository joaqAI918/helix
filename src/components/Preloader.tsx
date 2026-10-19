import { useEffect, useRef, useState } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/gsap';
import { useLenis } from '../lib/SmoothScroll';
import './preloader.css';

const SEEN_KEY = 'helix-lap-timed';
const seenThisSession = () => {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1';
  } catch {
    return false;
  }
};
const markSeen = () => {
  try {
    sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    // storage blocked: the full count simply plays again next time
  }
};

// Counts one lap, 00 to 92 minutes, then lifts away like a curtain. The full count plays once per
// session; later visits (and reduced motion) get a short fade.
export default function Preloader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const count = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);
  const lenis = useLenis();

  useEffect(() => {
    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!lenis) return;
    if (gone) lenis.start();
    else lenis.stop();
  }, [lenis, gone]);

  // Nothing behind the curtain can take focus until it has lifted.
  useEffect(() => {
    document.querySelectorAll<HTMLElement>('header.bar, main, footer').forEach((el) => (el.inert = !gone));
  }, [gone]);

  useGSAP(
    () => {
      const finish = () => {
        markSeen();
        setGone(true);
        onDone();
      };
      if (prefersReducedMotion() || seenThisSession()) {
        gsap.to(root.current, { autoAlpha: 0, duration: 0.3, delay: 0.15, onComplete: finish });
        return;
      }
      const counter = { v: 0 };
      const fontsReady = document.fonts?.ready ?? Promise.resolve();
      const tl = gsap.timeline({ paused: true });
      tl.from('.pre__line > span', { yPercent: 110, duration: 0.6, stagger: 0.06 })
        .to(
          counter,
          {
            v: 92,
            duration: 0.95,
            ease: 'power2.inOut',
            onUpdate: () => {
              if (count.current) count.current.textContent = String(Math.round(counter.v)).padStart(2, '0');
            },
          },
          0.1,
        )
        .to('.pre__line > span', { yPercent: -110, duration: 0.45, ease: 'power3.inOut', stagger: 0.03 }, '+=0.05')
        .to(root.current, { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.75, ease: 'expo.inOut' }, '-=0.25')
        .add(onDone, '-=0.6')
        .add(() => {
          markSeen();
          setGone(true);
        });
      let live = true;
      fontsReady.then(() => {
        if (live) tl.play();
      });
      return () => {
        live = false;
      };
    },
    { scope: root },
  );

  if (gone) return null;

  return (
    <div className="pre" ref={root} aria-hidden="true">
      <p className="pre__brand pre__line">
        <span>Helix Orbital</span>
      </p>
      <p className="pre__count display pre__line">
        <span>
          <span ref={count}>00</span>
          <sup>min</sup>
        </span>
      </p>
      <p className="pre__note pre__line">
        <span>Timing one lap of Earth</span>
      </p>
    </div>
  );
}

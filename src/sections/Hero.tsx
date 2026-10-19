import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { gsap, SplitText, useGSAP, prefersReducedMotion, finePointer } from '../lib/gsap';
import { useInView } from '../lib/useInView';
import { hero, lap } from '../data/content';
import LapClock from '../components/LapClock';
import SceneBoundary from '../components/SceneBoundary';
import Starfield from '../components/Starfield';
import './hero.css';

// Where each phase sits on the lap timeline: phase i's horizon starts rising at PHASE_AT[i] and takes
// WIPE to cover the frame. Phase 0 is there from the start.
const WIPE = 0.7;
const PHASE_AT = [0, ...lap.slice(1).map((_, k) => 1.5 + k * 0.95)];

// Fly one lap. Under the title sits a window onto Earth. Scrolling pins the hero, opens the window
// to the full screen and flies the 92 minutes: night side, aurora, sunrise, day side, each with its own
// footage from the space station. Each phase rises in behind a curved horizon while the band below
// counts the minutes and takes the phase's colour.
export default function Hero({ ready }: { ready: boolean }) {
  const root = useRef<HTMLElement>(null);
  const slot = useRef<HTMLDivElement>(null);
  const media = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const clips = useRef<(HTMLVideoElement | null)[]>([]);
  const intro = useRef<gsap.core.Timeline | null>(null);
  const lapTime = useRef(0);
  const starsHidden = useRef(false);
  const inView = useInView(root);
  // The footage loops, so it must be stoppable (WCAG 2.2.2). Reduced motion starts it paused.
  const [paused, setPaused] = useState(() => prefersReducedMotion());
  const state = useRef({ paused, ready, inView });
  state.current = { paused, ready, inView };

  // The window's resting frame is wherever the empty slot under the title ends up in the layout,
  // so it never runs into the text however short the screen is.
  const frame = () => {
    const h = root.current!.getBoundingClientRect();
    const s = slot.current!.getBoundingClientRect();
    return `inset(${Math.round(s.top - h.top)}px ${Math.round(h.right - s.right)}px ${Math.round(h.bottom - s.bottom)}px ${Math.round(s.left - h.left)}px)`;
  };

  useLayoutEffect(() => {
    const set = () => root.current?.style.setProperty('--frame', frame());
    set();
    const ro = new ResizeObserver(set);
    ro.observe(root.current!);
    return () => ro.disconnect();
  }, []);

  // Plays exactly the clips that can be seen: the phase on screen, plus the one whose horizon is rising
  // over it. The next phase starts downloading as soon as its predecessor appears, so it is ready by the
  // time it is revealed. The sunrise plays once from the top each time it comes round.
  const syncClips = () => {
    const t = lapTime.current;
    const { paused: stopped, ready: live, inView: seen } = state.current;
    clips.current.forEach((v, i) => {
      if (!v) return;
      const end = i + 1 < PHASE_AT.length ? PHASE_AT[i + 1] + WIPE : Infinity;
      const visible = t >= PHASE_AT[i] && t < end;
      const next = clips.current[i + 1];
      if (visible && next && next.preload !== 'auto') next.preload = 'auto';
      if (visible && live && seen && !stopped) {
        if (v.paused) {
          if (!v.loop && v.dataset.away === '1') v.currentTime = 0;
          v.dataset.away = '0';
          v.play().catch(() => {});
        }
      } else {
        if (!visible) v.dataset.away = '1';
        if (!v.paused) v.pause();
      }
    });
  };

  useEffect(syncClips, [paused, ready, inView]);

  // A little depth under the pointer: the picture drifts against the frame.
  useEffect(() => {
    if (!finePointer() || prefersReducedMotion()) return;
    const el = media.current!;
    const x = gsap.quickTo(el, 'x', { duration: 1.2, ease: 'power3.out' });
    const y = gsap.quickTo(el, 'y', { duration: 1.2, ease: 'power3.out' });
    const move = (e: PointerEvent) => {
      x((e.clientX / innerWidth - 0.5) * -28);
      y((e.clientY / innerHeight - 0.5) * -18);
    };
    addEventListener('pointermove', move, { passive: true });
    return () => removeEventListener('pointermove', move);
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const H = () => root.current!.offsetHeight;
      const slotTop = () => slot.current!.offsetTop;

      // Load: the name rises letter by letter, the window opens upwards from its floor.
      const split = SplitText.create('.hero__title', { type: 'chars', mask: 'chars' });
      const tl = gsap.timeline({ paused: true });
      tl.from(split.chars, { yPercent: 115, duration: 1.1, stagger: 0.035, ease: 'expo.out' })
        .from('.hero__sentence, .hero__actions', { y: 24, autoAlpha: 0, duration: 0.9, stagger: 0.1, ease: 'power3.out' }, 0.35)
        .fromTo(
          '.window__inner',
          { clipPath: 'inset(100% 0% 0% 0%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' },
          0.25,
        )
        .from('.window__media', { scale: 1.25, duration: 2, ease: 'power3.out' }, 0.25)
        .from('.window__pause', { autoAlpha: 0, scale: 0.96, duration: 0.5, ease: 'power3.out' }, 1.35)
        .from('.hero__stars', { autoAlpha: 0, duration: 1.6, ease: 'power2.out' }, 0);
      intro.current = tl;

      // Scroll: one lap. Only on screens tall enough to hold the pinned hero; landscape phones keep the
      // resting layout and scroll straight past. Phones fly a shorter lap.
      const mm = gsap.matchMedia();
      mm.add('(min-height: 560px)', () => buildLap());
      return () => mm.revert();

      function buildLap() {
        // A wide ellipse whose top edge is the horizon: it starts just under the layer and rises past its top.
        const horizon = (rise: number) => (_: number, t: HTMLElement) =>
          `ellipse(${t.offsetWidth * 1.3}px ${t.offsetHeight * 0.9}px at 50% ${t.offsetHeight * (1.9 - rise) + 2}px)`;
        const horizonFrom = horizon(0);
        const horizonTo = horizon(1.1);
        const rootStyle = getComputedStyle(document.documentElement);
        const token = (name: string) => rootStyle.getPropertyValue(name).trim();
        const minute = { v: 0 };
        const showMinute = () => {
          if (num.current) num.current.textContent = String(Math.round(minute.v));
        };

        const run = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => '+=' + H() * (window.innerWidth < 761 ? 2.4 : 3.4),
            pin: true,
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
          onUpdate: () => {
            lapTime.current = run.time();
            // Once the window fills the screen the stars behind it are hidden; stop drawing them.
            starsHidden.current = lapTime.current > 1.02;
            syncClips();
          },
        });

        run
          .fromTo('.window', { clipPath: frame }, { clipPath: 'inset(0px 0px 0px 0px)', duration: 1, ease: 'power2.inOut' }, 0)
          .to('.hero__head', { y: () => -slotTop() * 0.6, duration: 0.6, ease: 'power1.in' }, 0)
          .to('.hero__head', { autoAlpha: 0, duration: 0.3, ease: 'power1.out' }, 0)
          // The pause control rides up with the opening window to the top corner, and stays for the lap.
          .to('.window__pause', { y: () => 72 - slotTop(), duration: 1, ease: 'power2.inOut' }, 0)
          .fromTo('.band', { yPercent: 101, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 0.35, ease: 'power3.out' }, 0.7)
          .fromTo('.band__fill', { scaleX: 0 }, { scaleX: 1, duration: 3.3 }, 0.9)
          .to(minute, { v: lap[0].to, duration: 0.6, onUpdate: showMinute }, 0.9);

        const layers = gsap.utils.toArray<HTMLElement>('.phase-media');
        const copies = gsap.utils.toArray<HTMLElement>('.phase-copy');
        gsap.set(copies.slice(1), { autoAlpha: 0, yPercent: 60 });

        lap.slice(1).forEach((p, k) => {
          const i = k + 1;
          const at = PHASE_AT[i];
          run
            .fromTo(layers[i], { clipPath: horizonFrom }, { clipPath: horizonTo, duration: WIPE, ease: 'power2.inOut' }, at)
            .fromTo(layers[i].firstElementChild, { scale: 1.18 }, { scale: 1, duration: 1.1, ease: 'power2.out' }, at)
            .to(layers[i - 1].firstElementChild, { scale: 1.08, duration: WIPE }, at)
            // The colour cuts (never blends) the moment the rising horizon reaches the band.
            .to('.band', { backgroundColor: token(p.band), color: token(p.ink), duration: 0.02 }, at + 0.12)
            .to(copies[i - 1], { autoAlpha: 0, yPercent: -60, duration: 0.1 }, at + 0.02)
            .to(copies[i], { autoAlpha: 1, yPercent: 0, duration: 0.22, ease: 'power2.out' }, at + 0.12)
            .to(minute, { v: p.to, duration: 0.95, onUpdate: showMinute }, at - 0.05);
        });
      }
    },
    { scope: root },
  );

  useEffect(() => {
    if (ready) intro.current?.play();
  }, [ready]);

  return (
    <section className="hero" id="top" ref={root} data-ink="light" aria-labelledby="hero-title">
      <div className="hero__stars">
        <SceneBoundary>
          <Starfield active={inView} hiddenRef={starsHidden} />
        </SceneBoundary>
      </div>

      <div className="hero__head">
        <h1 className="hero__title display" id="hero-title">
          {hero.title}
        </h1>
        <p className="hero__sentence">{hero.sentence}</p>
        <div className="hero__actions">
          <a className="button" href="#contact">
            {hero.action}
            <span aria-hidden="true">→</span>
          </a>
          <LapClock />
        </div>
      </div>
      <div className="hero__slot" ref={slot}>
        <button
          type="button"
          className="window__pause"
          onClick={() => setPaused((p) => !p)}
          aria-label={paused ? 'Play the footage' : 'Pause the footage'}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            {paused ? <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /> : <path d="M7 5h3.6v14H7zM13.4 5H17v14h-3.6z" fill="currentColor" />}
          </svg>
        </button>
      </div>

      <div className="window" role="group" aria-label="One lap of Earth in four phases, filmed from the space station">
        <div className="window__inner">
          <div className="window__media" ref={media}>
            {lap.map((p, i) => (
              <div className="phase-media" key={p.name}>
                <video
                  ref={(el) => {
                    clips.current[i] = el;
                  }}
                  muted
                  playsInline
                  loop={p.clip.loop}
                  preload="none"
                  poster={p.clip.poster}
                  width={1920}
                  height={1080}
                  aria-hidden="true"
                >
                  <source src={p.clip.src} type="video/mp4" />
                </video>
              </div>
            ))}
          </div>

          <div className="band">
            <p className="band__minute display" aria-hidden="true">
              <span ref={num}>0</span>
              <sup>min</sup>
            </p>
            <div className="band__copy">
              {lap.map((p) => (
                <div className="phase-copy" key={p.name}>
                  <p className="phase-copy__name">{p.name}</p>
                  <p className="phase-copy__text">{p.text}</p>
                </div>
              ))}
            </div>
            <div className="band__lap" aria-hidden="true">
              <span className="band__fill" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useRef, useState } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/gsap';
import { season } from '../data/content';
import './season.css';

// Index with preview, the signature move: the rounds are rows of type; pointing at one shows
// its orbit in the fixed frame and turns the other rows to the soft ink. On touch, each row
// carries its own small picture instead.
export default function Season() {
  const root = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(0);
  const [hovering, setHovering] = useState(false);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: '.season__list', start: 'top 78%', once: true } });
      tl.from('.season__head .mask > span', { yPercent: 110, duration: 0.9, stagger: 0.08 })
        .from('.round', { y: 32, autoAlpha: 0, duration: 0.8, stagger: 0.07, ease: 'power3.out' }, 0.15)
        .from('.season__frame', { clipPath: 'inset(0% 0% 100% 0%)', duration: 1.2, ease: 'expo.inOut' }, 0.2);
    },
    { scope: root },
  );

  return (
    <section className="season chapter" id="season" ref={root} data-ink="dark" aria-labelledby="season-title">
      <div className="season__head">
        <h2 className="season__title mask" id="season-title">
          <span>{season.heading}</span>
        </h2>
        <p className="season__count mask">
          <span>{season.count}</span>
        </p>
      </div>

      <div className="season__index">
        <ol
          className={'season__list' + (hovering ? ' is-hovering' : '')}
          onMouseLeave={() => setHovering(false)}
        >
          {season.rounds.map((r, i) => (
            <li
              key={r.name}
              className={'round' + (i === shown ? ' is-shown' : '')}
              onMouseEnter={() => {
                setShown(i);
                setHovering(true);
              }}
              data-cursor={r.date}
            >
              <img className="round__bullet" src={r.thumb} alt="" width={64} height={64} loading="lazy" decoding="async" />
              <strong className="round__name">{r.name}</strong>
              <p className="round__orbit">{r.orbit}</p>
              <p className="round__date">
                <time dateTime={`2089-${toMonth(r.date)}`}>{r.date}</time>
              </p>
            </li>
          ))}
        </ol>

        <div className="season__frame" aria-hidden="true">
          {season.rounds.map((r, i) => (
            <img
              key={r.name}
              className={i === shown ? 'is-on' : ''}
              src={r.photo.src}
              width={r.photo.w}
              height={r.photo.h}
              alt=""
              loading="lazy"
              decoding="async"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function toMonth(date: string) {
  const [d, m] = date.split(' ');
  return `${String(MONTHS.indexOf(m) + 1).padStart(2, '0')}-${d.padStart(2, '0')}`;
}

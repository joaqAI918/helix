import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/gsap';
import { useMagnetic } from '../lib/useMagnetic';
import { contact } from '../data/content';
import './contact.css';

// The address in display rows, one band each, closing on a greeting and a round mail button.
export default function Contact() {
  const root = useRef<HTMLElement>(null);
  const button = useRef<HTMLAnchorElement>(null);
  useMagnetic(button, 0.4);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const rows = gsap.utils.toArray<HTMLElement>('.crow');
      const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: 'top 70%', once: true } });
      tl.from(rows, { clipPath: 'inset(0% 100% 0% 0%)', duration: 1.1, stagger: 0.07, ease: 'expo.inOut' }).from(
        '.crow .mask > span',
        { yPercent: 110, duration: 0.9, stagger: 0.07 },
        0.3,
      );
      tl.from('.contact__send', { scale: 0, rotation: -90, duration: 0.9, ease: 'expo.out' }, 0.8);
    },
    { scope: root },
  );

  return (
    <section className="contact chapter" id="contact" ref={root} data-ink="dark" aria-labelledby="contact-title">
      <h2 className="sr-only" id="contact-title">
        Contact
      </h2>
      <address className="contact__rows">
        {contact.rows.map((r) => (
          <p className="crow" key={r.text}>
            <span className="mask">
              <span>{r.href ? <a className="link" href={r.href}>{r.text}</a> : r.text}</span>
            </span>
          </p>
        ))}
        <p className="crow crow--greet">
          <span className="mask">
            <span>{contact.greeting}</span>
          </span>
          <span className="contact__zone">
            <a className="contact__send" href={contact.mail} ref={button} aria-label="Email the team for race passes">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" />
              </svg>
            </a>
          </span>
        </p>
      </address>
    </section>
  );
}

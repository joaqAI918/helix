import { useEffect, useRef } from 'react';
import { scrollState } from '../lib/SmoothScroll';
import { pointer } from '../lib/pointer';
import { prefersReducedMotion } from '../lib/gsap';

// Warp streaks behind the hero title, drawn on a plain 2D canvas (no WebGL, no three.js at first paint).
// Stars fly towards the viewer; scroll velocity stretches them towards warp; the pointer tilts the view.

const DEPTH = 70;
const SPREAD_X = 44;
const SPREAD_Y = 26;
const FOCAL = 0.7; // projection scale, as a share of the canvas height
const BUCKETS = 8;

export default function Starfield({ active, hiddenRef }: { active: boolean; hiddenRef?: { current: boolean } }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const running = useRef(active);
  running.current = active;

  useEffect(() => {
    const el = canvas.current!;
    const ctx = el.getContext('2d')!;
    const still = prefersReducedMotion();
    const count = window.innerWidth < 700 ? 700 : 1600;
    const stars = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      stars[i * 3] = (Math.random() - 0.5) * SPREAD_X;
      stars[i * 3 + 1] = (Math.random() - 0.5) * SPREAD_Y;
      stars[i * 3 + 2] = Math.random() * DEPTH + 1;
    }
    const pts = new Float32Array(count * 4);
    const bucket = new Uint8Array(count);

    let w = 0;
    let h = 0;
    let dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = el.clientWidth;
      h = el.clientHeight;
      el.width = Math.round(w * dpr);
      el.height = Math.round(h * dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    let speed = 2.4;
    let tiltX = 0;
    let tiltY = 0;
    let last = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if ((!running.current || hiddenRef?.current) && !still) {
        last = now;
        return;
      }
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      const target = still ? 0 : 2.4 + Math.min(Math.abs(scrollState.velocity) * 1.4, 80);
      speed += (target - speed) * 0.07;
      tiltX += (pointer.x * 0.07 - tiltX) * 0.04;
      tiltY += (pointer.y * 0.045 - tiltY) * 0.04;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = 'round';
      const f = h * FOCAL;
      const cx = w / 2 - tiltX * w;
      const cy = h / 2 + tiltY * h;
      const len = 0.04 + speed * 0.055;

      // Project every star, then draw them in eight brightness buckets: eight strokes a frame, not 1600.
      bucket.fill(255);
      for (let i = 0; i < count; i++) {
        const o = i * 3;
        let z = stars[o + 2] - speed * dt;
        if (z < 0.6) {
          z = DEPTH;
          stars[o] = (Math.random() - 0.5) * SPREAD_X;
          stars[o + 1] = (Math.random() - 0.5) * SPREAD_Y;
        }
        stars[o + 2] = z;
        const x = stars[o];
        const y = stars[o + 1];
        const hx = cx + (x / z) * f;
        const hy = cy - (y / z) * f;
        const tz = z + len;
        const tx = cx + (x / tz) * f;
        const ty = cy - (y / tz) * f;
        if (hx < -20 || hx > w + 20 || hy < -20 || hy > h + 20) continue;
        const b = Math.max(0, Math.min(1, 1 - z / DEPTH)) ** 1.6;
        bucket[i] = Math.min(BUCKETS - 1, Math.floor(b * BUCKETS));
        pts[i * 4] = tx;
        pts[i * 4 + 1] = ty;
        pts[i * 4 + 2] = hx + 0.01;
        pts[i * 4 + 3] = hy;
      }
      for (let k = 0; k < BUCKETS; k++) {
        const b = (k + 0.5) / BUCKETS;
        ctx.strokeStyle = `rgba(255,255,255,${b.toFixed(3)})`;
        ctx.lineWidth = 0.6 + b * 0.9;
        ctx.beginPath();
        for (let i = 0; i < count; i++) {
          if (bucket[i] !== k) continue;
          ctx.moveTo(pts[i * 4], pts[i * 4 + 1]);
          ctx.lineTo(pts[i * 4 + 2], pts[i * 4 + 3]);
        }
        ctx.stroke();
      }
      if (still) cancelAnimationFrame(raf); // one frame is enough for a still sky
    };
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvas} aria-hidden="true" style={{ width: '100%', height: '100%' }} />;
}

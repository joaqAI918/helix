import { useEffect, useState, type RefObject } from 'react';

// True while the element is on screen; used to stop a canvas rendering when nobody can see it.
export function useInView(ref: RefObject<Element | null>, rootMargin = '10% 0px') {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}

import { useEffect, useState } from 'react';
import { ScrollTrigger } from './lib/gsap';
import { SmoothScroll } from './lib/SmoothScroll';
import Preloader from './components/Preloader';
import Header from './components/Header';
import Cursor from './components/Cursor';
import Hero from './sections/Hero';
import Intro from './sections/Intro';
import Craft from './sections/Craft';
import Stats from './sections/Stats';
import Orbits from './sections/Orbits';
import Crew from './sections/Crew';
import Season from './sections/Season';
import Contact from './sections/Contact';
import Footer from './sections/Footer';

export default function App() {
  const [ready, setReady] = useState(false);

  // Fonts and images change the page's height; measure the scroll story again once they land.
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    addEventListener('load', refresh);
    return () => removeEventListener('load', refresh);
  }, []);

  return (
    <SmoothScroll>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Preloader onDone={() => setReady(true)} />
      <Header />
      <Cursor />
      <main id="main">
        <Hero ready={ready} />
        <Intro />
        <Craft />
        <Stats />
        <Orbits />
        <Crew />
        <Season />
        <Contact />
      </main>
      <Footer />
    </SmoothScroll>
  );
}

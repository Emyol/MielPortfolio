"use client";

import { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Projects from '../components/Projects';
import Leadership from '../components/Leadership';
import Footer from '../components/Footer';
import BackgroundLayer from '../components/BackgroundLayer';
import ScrollProgress from '../components/ScrollProgress';
import useScrollReveal from '../hooks/useScrollReveal';
import SpinningPreloader from '../components/SpinningPreloader';

export default function Home() {
  const [loading, setLoading] = useState(true);
  useScrollReveal(true);

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <BackgroundLayer />
      <ScrollProgress />
      {loading && <SpinningPreloader onComplete={() => setLoading(false)} />}
      <main id="main">
        <Navbar />
        <Hero />
        <About />
        <Projects />
        <Leadership />
        <Footer />
      </main>
    </>
  );
}

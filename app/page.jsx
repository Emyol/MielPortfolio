import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Projects from '../components/Projects';
import Leadership from '../components/Leadership';
import Footer from '../components/Footer';
import ScrollProgress from '../components/ScrollProgress';
import PageMotion from '../components/PageMotion';

export default function Home() {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>
      <ScrollProgress />
      <PageMotion />
      <Navbar />
      <main id="main" className="field-page">
        <Hero />
        <About />
        <Projects />
        <Leadership />
        <Footer />
      </main>
    </>
  );
}

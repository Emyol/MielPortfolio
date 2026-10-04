import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import AsciiImage from '@/components/originkit/ui/ascii-reveal-custom-style';

export default function Hero() {
  return (
    <section id="hero" className="field-hero" aria-labelledby="hero-title">
      <div className="field-shell field-hero-inner">
        <div className="field-hero-copy">
          <h1 id="hero-title" className="field-hero-title">
            <span className="field-title-line"><span className="field-title-word">Hi, I’m Miel.</span></span>
            <span className="field-title-line field-title-introduction"><span className="field-title-word">I build software and enjoy working with people.</span></span>
          </h1>
          <p className="field-hero-summary" data-hero-item>
            I like learning new tools, figuring out unfamiliar problems, and sharing what I learn.
            Alongside coding, I’ve spent time tutoring students and helping organize campus events.
          </p>
          <div className="field-hero-actions" data-hero-item>
            <Button asChild>
              <a href="#projects">Explore work</a>
            </Button>
            <Button asChild variant="outline">
              <a href="/Amiel_Acuna_CV.pdf" target="_blank" rel="noopener noreferrer">
                Open CV <ArrowUpRight />
              </a>
            </Button>
          </div>
        </div>

        <div className="field-hero-visual" data-hero-visual>
          <div className="field-portrait">
            <AsciiImage
              image={{ src: '/hero-profile.png', alt: 'Portrait of Amiel Acuña' }}
              inkColor="#ececec"
              focusY={32}
              zoom={1.68}
              revealOptions={{ size: 72, softness: 30 }}
            />
          </div>
          <div className="field-status">
            <span>Available for collaboration</span>
            <span>Manila / Remote</span>
          </div>
        </div>
      </div>
    </section>
  );
}

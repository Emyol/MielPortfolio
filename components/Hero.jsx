import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import AsciiImage from '@/components/originkit/ui/ascii-reveal-custom-style';

export default function Hero({ content }) {
  return (
    <section id="hero" className="field-hero" aria-labelledby="hero-title">
      <div className="field-shell field-hero-inner">
        <div className="field-hero-copy">
          <h1 id="hero-title" className="field-hero-title">
            <span className="field-title-line"><span className="field-title-word">{content.hero.title}</span></span>
            <span className="field-title-line field-title-introduction"><span className="field-title-word">{content.hero.subtitle}</span></span>
          </h1>
          <p className="field-hero-summary" data-hero-item>
            {content.hero.summary}
          </p>
          <div className="field-hero-actions" data-hero-item>
            <Button asChild>
              <a href={content.hero.primaryHref}>{content.hero.primaryLabel}</a>
            </Button>
            <Button asChild variant="outline">
              <a href={content.profile.cv} target="_blank" rel="noopener noreferrer">
                {content.hero.cvLabel} <ArrowUpRight />
              </a>
            </Button>
          </div>
        </div>

        <div className="field-hero-visual" data-hero-visual>
          <div className="field-portrait">
            <AsciiImage
              image={{ src: content.profile.portrait, alt: content.profile.portraitAlt }}
              inkColor="#ececec"
              focusY={32}
              zoom={1.68}
              revealOptions={{ size: 72, softness: 30 }}
            />
          </div>
          <div className="field-status">
            <span>{content.hero.availability}</span>
            <span>{content.hero.location}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

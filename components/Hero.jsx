import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import AsciiImage from '@/components/originkit/ui/ascii-reveal-custom-style';

const TITLE = [
  { text: 'Architecting', italic: false },
  { text: 'intelligent', italic: false },
  { text: 'systems.', italic: false },
  { text: 'Leading teams.', italic: true },
];

const METRICS = [
  { value: 2, pad: 2, suffix: '', label: "Batch '27 rank" },
  { value: 700, pad: 0, suffix: '+', label: 'Students supported' },
  { value: 4, pad: 2, suffix: '', label: 'Selected systems' },
  { value: 6, pad: 2, suffix: '', label: 'Credentials' },
];

function formatMetric(value, pad, suffix) {
  return `${String(value).padStart(pad, '0')}${suffix}`;
}

export default function Hero() {
  return (
    <section id="hero" className="field-hero" aria-labelledby="hero-title">
      <div className="field-shell field-hero-inner">
        <div className="field-hero-copy">
          <h1 id="hero-title" className="field-hero-title">
            {TITLE.map((line) => (
              <span
                key={line.text}
                className={line.italic ? 'field-title-line field-title-line--accent' : 'field-title-line'}
              >
                <span className="field-title-word">{line.text}</span>
              </span>
            ))}
          </h1>
          <p className="field-hero-summary" data-hero-item>
            I build private, practical software across edge AI, language tooling,
            and geospatial intelligence, then organize the people and systems that ship it.
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
          <dl className="field-measures" data-hero-item>
            {METRICS.map((metric) => (
              <div key={metric.label}>
                <dt>{metric.label}</dt>
                <dd>
                  <span
                    data-count={metric.value}
                    data-pad={metric.pad}
                    data-suffix={metric.suffix}
                  >
                    {formatMetric(metric.value, metric.pad, metric.suffix)}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
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

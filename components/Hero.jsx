import MagneticElement from './MagneticElement';
import Image from 'next/image';
import { site } from '../data/site';

export default function Hero() {
    return (
        <section id="hero" className="hero">
            <div className="hero-bg-numeral fade-in dl-1" aria-hidden="true">{site.hero.numeral}</div>

            <div className="hero-layout">
                <div className="hero-content">
                    <div className="hero-label fade-in dl-2">
                        <span className="hero-label-dot" aria-hidden="true" />
                        <span>{site.hero.indexLabel}</span>
                        <span className="hero-label-spacer" aria-hidden="true" />
                        <span>{site.location.label}</span>
                        <span className="hero-label-status">
                            <span className="status-pulse" aria-hidden="true" />
                            {site.status}
                        </span>
                    </div>

                    <h1 className="hero-title reveal-text">
                        {site.hero.titleLines.map((line) => (
                            <span key={line} className={line === site.hero.accentLine ? 'line accent' : 'line'}>
                                <span className="inner">{line}</span>
                            </span>
                        ))}
                    </h1>

                    <div className="hero-footer fade-in dl-3">
                        <p className="hero-desc">{site.description}</p>
                        <MagneticElement as="a" href="#contact" className="btn-primary">{site.hero.contactCta}</MagneticElement>
                    </div>
                </div>

                <div className="hero-visual fade-in dl-3">
                    <div className="hero-visual-frame">
                        <div className="hero-image-wrapper">
                            <div className="hero-image-bg"></div>
                            <Image
                                src={site.portrait.src}
                                alt={site.portrait.alt}
                                fill
                                priority
                                sizes="(max-width: 1024px) 320px, 500px"
                                className="hero-img"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

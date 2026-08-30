import MagneticElement from './MagneticElement';
import Image from 'next/image';

export default function Hero() {
    return (
        <section id="hero" className="hero">
            <pre className="hero-ascii-art fade-in dl-1" aria-hidden="true">{`    ██╗ ██████╗ ██╗
    ╚═╝██╔═══██╗██║
       ██║   ██║██║
       ██║   ██║██║
       ╚██████╔╝██║
        ╚═════╝ ╚═╝`}</pre>

            <div className="hero-layout">
                <div className="hero-content">
                    <div className="hero-label fade-in dl-2">
                        <span className="hero-label-dot" aria-hidden="true" />
                        <span>&gt; (001) / INDEX</span>
                        <span className="hero-label-spacer" aria-hidden="true" />
                        <span>BASED IN MANILA, PH</span>
                        <span className="hero-label-status">
                            <span className="status-pulse" aria-hidden="true" />
                            AVAILABLE
                        </span>
                    </div>

                    <h1 className="hero-title reveal-text">
                        <span className="line"><span className="inner">Architecting</span></span>
                        <span className="line"><span className="inner">Intelligent</span></span>
                        <span className="line"><span className="inner">Systems &amp;</span></span>
                        <span className="line accent"><span className="inner">Leading Teams.</span></span>
                    </h1>

                    <div className="hero-footer fade-in dl-3">
                        <p className="hero-desc">Software Engineering student and certified project manager at FEU Tech — Rank 2 in Batch &rsquo;27. Specializing in on-device edge AI, vector retrieval, and geospatial intelligence.</p>
                        <MagneticElement as="a" href="#contact" className="btn-primary">Initiate Contact &rarr;</MagneticElement>
                    </div>
                </div>

                <div className="hero-visual fade-in dl-3">
                    <div className="hero-visual-frame">
                        <pre className="hero-frame-ascii" aria-hidden="true">{`┌─────────────────────┐
│  ████  PROFILE  ████ │
│                     │
│                     │
└─────────────────────┘`}</pre>
                        <div className="hero-image-wrapper">
                            <div className="hero-image-bg"></div>
                            <Image
                                src="/hero-profile.png"
                                alt="Amiel Acuña — portrait"
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

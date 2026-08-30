import TechStack from './TechStack';
import CertCarousel from './CertCarousel';

export default function About() {
    return (
        <section id="about" className="about">
            <div className="section-header scroll-reveal">
                <span className="section-num" aria-hidden="true">(002)</span>
                <h2 className="section-title">Discipline</h2>
                <span className="section-rule" aria-hidden="true" />
            </div>

            <div className="about-grid">
                <div className="about-statement scroll-reveal">
                    <p>
                        I build software at the intersection of <em>intelligence</em> and <em>infrastructure</em> &mdash;
                        on-device edge AI, custom language interpreters, and geospatial systems that hold up
                        under real constraints. Ranked in FEU Tech&rsquo;s top academic tier, I also
                        direct campus logistics and facilitate review sessions for 700+ STEM students.
                    </p>
                    <div className="about-signature" aria-hidden="true">
                        <span>— A. ACUÑA</span>
                        <span>BSCSSE · FEU TECH · 2026</span>
                    </div>
                </div>

                <TechStack />
            </div>

            <div className="about-marks scroll-reveal">
                <div className="stack-group">
                    <span className="stack-label">
                        <span className="stack-label-dot" aria-hidden="true" />
                        Distinctions
                    </span>
                    <ul className="marks-list">
                        <li>
                            <span className="role-year">2026</span>
                            <span>Top Performing Student — Rank 2, Batch &rsquo;27 · Rank 5, BSCSSE</span>
                        </li>
                        <li>
                            <span className="role-year">2025</span>
                            <span>Active Student Leader — FEU Institute of Technology</span>
                        </li>
                        <li>
                            <span className="role-year">2024</span>
                            <span>4th Place Finalist — Code Green For Campuses, First Gen Corporation</span>
                        </li>
                        <li>
                            <span className="role-year">2024</span>
                            <span>Top Performing Student — Rank 2, Batch &rsquo;27 · Rank 7, BSCSSE</span>
                        </li>
                    </ul>
                </div>
                <div className="stack-group cert-carousel-group">
                    <span className="stack-label">
                        <span className="stack-label-dot" aria-hidden="true" />
                        Certifications
                    </span>
                    <CertCarousel />
                </div>
            </div>
        </section>
    );
}

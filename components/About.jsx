export default function About() {
    return (
        <section id="about" className="about">
            <div className="section-header scroll-reveal">
                <h2 className="section-num">(002)</h2>
                <h2 className="section-title">Discipline</h2>
                <span className="section-rule" aria-hidden="true" />
            </div>

            <div className="about-grid">
                <div className="about-statement scroll-reveal">
                    <p>
                        I build software at the intersection of <em>intelligence</em> and <em>infrastructure</em> &mdash;
                        on-device machine learning, vector retrieval, and mobile systems that hold up
                        under real constraints. Outside of code, I lead logistics for student
                        organizations at FEU Tech, where execution beats intention.
                    </p>
                    <div className="about-signature" aria-hidden="true">
                        <span>— A. ACUÑA</span>
                        <span>MNL · 2026</span>
                    </div>
                </div>

                <div className="about-stack scroll-reveal">
                    <div className="stack-group">
                        <span className="stack-label">
                            <span className="stack-label-dot" aria-hidden="true" />
                            Languages
                        </span>
                        <ul className="stack-list">
                            <li>Python</li>
                            <li>TypeScript</li>
                            <li>Dart</li>
                            <li>Java</li>
                            <li>C#</li>
                        </ul>
                    </div>
                    <div className="stack-group">
                        <span className="stack-label">
                            <span className="stack-label-dot" aria-hidden="true" />
                            Frameworks
                        </span>
                        <ul className="stack-list">
                            <li>Flutter</li>
                            <li>Next.js</li>
                            <li>React</li>
                            <li>Node.js</li>
                        </ul>
                    </div>
                    <div className="stack-group">
                        <span className="stack-label">
                            <span className="stack-label-dot" aria-hidden="true" />
                            Domains
                        </span>
                        <ul className="stack-list">
                            <li>On-device ML</li>
                            <li>Vector retrieval</li>
                            <li>Computer vision</li>
                            <li>Geospatial</li>
                        </ul>
                    </div>
                    <div className="stack-group">
                        <span className="stack-label">
                            <span className="stack-label-dot" aria-hidden="true" />
                            Tooling
                        </span>
                        <ul className="stack-list">
                            <li>Git</li>
                            <li>Docker</li>
                            <li>Leaflet</li>
                            <li>Figma</li>
                        </ul>
                    </div>
                </div>
            </div>
        </section>
    );
}

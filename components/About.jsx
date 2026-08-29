import { site } from '../data/site';

export default function About() {
    return (
        <section id="about" className="about">
            <div className="section-header scroll-reveal">
                <span className="section-num" aria-hidden="true">{site.about.sectionNum}</span>
                <h2 className="section-title">{site.about.sectionTitle}</h2>
                <span className="section-rule" aria-hidden="true" />
            </div>

            <div className="about-grid">
                <div className="about-statement scroll-reveal">
                    <p>
                        {site.about.statementBefore}<em>{site.about.statementEm1}</em>{site.about.statementMid}<em>{site.about.statementEm2}</em>
                        {site.about.statementAfter}
                    </p>
                    <div className="about-signature" aria-hidden="true">
                        <span>— {site.shortName}</span>
                        <span>{site.about.signatureLine}</span>
                    </div>
                </div>

                <div className="about-stack scroll-reveal">
                    {site.about.stacks.map((stack) => (
                        <div className="stack-group" key={stack.label}>
                            <span className="stack-label">
                                <span className="stack-label-dot" aria-hidden="true" />
                                {stack.label}
                            </span>
                            <ul className="stack-list">
                                {stack.items.map((item) => (
                                    <li key={item}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            <div className="about-marks scroll-reveal">
                <div className="stack-group">
                    <span className="stack-label">
                        <span className="stack-label-dot" aria-hidden="true" />
                        Distinctions
                    </span>
                    <ul className="marks-list">
                        {site.distinctions.map((row) => (
                            <li key={`${row.year}-${row.text}`}>
                                <span className="role-year">{row.year}</span>
                                <span>{row.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="stack-group">
                    <span className="stack-label">
                        <span className="stack-label-dot" aria-hidden="true" />
                        Certifications
                    </span>
                    <ul className="marks-list">
                        {site.certifications.map((row) => (
                            <li key={`${row.year}-${row.text}`}>
                                <span className="role-year">{row.year}</span>
                                <span>{row.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}

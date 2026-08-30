const PROJECTS = [
    {
        layout: 'pt-1',
        meta: 'Undergraduate Thesis — 2026',
        name: 'KitaKo',
        tags: 'Flutter / ONNX Runtime / SigLIP-2 / IVF-PQ',
        desc: 'An on-device semantic image search app built with SigLIP-2 vision-language embeddings and IVF-PQ nearest-neighbor search via ONNX Runtime. KitaKo processes Taglish queries locally with zero server dependency and sub-second retrieval latency.',
        href: 'https://github.com/Emyol/KitaKo_Codebase',
        index: '01',
    },
    {
        layout: 'pt-2',
        meta: 'Internal Tooling — 2026',
        name: 'iCARE Reservation',
        tags: 'JavaScript / Web App',
        desc: 'An internal room reservation portal for university administrative staff. Automates booking workflows, schedule visibility, and multi-room conflict checking for shared facilities.',
        href: 'https://github.com/Emyol/iCARE-Reservation',
        index: '02',
    },
    {
        layout: 'pt-1',
        meta: 'Domain-Specific Language — 2026',
        name: 'BekiLang',
        tags: 'Python / Compiler / Interpreter / AST',
        desc: 'A custom programming language built around Philippine Gay Lingo (Swardspeak). Ships with a full lexer, parser, AST, interpreter, and web playground — turning keywords like kunwari, periodt, and ganern into a working language with control flow, typing, and I/O.',
        href: 'https://github.com/Emyol/BekiLang',
        index: '03',
    },
    {
        layout: 'pt-2',
        meta: 'NASA Space Apps Challenge — 2025',
        name: 'CitySense',
        tags: 'TypeScript / Leaflet / NASA GIBS / DeepSeek',
        desc: 'A geospatial intelligence cockpit for urban planners shaping climate-resilient policy. CitySense streams live NASA, WorldPop, GHSL, and SEDAC layers into a unified map, surfacing heat, greenspace, water, and equity indicators alongside a DeepSeek-powered planning assistant.',
        href: 'https://github.com/Emyol/city-sense',
        index: '04',
    },
];

function ProjectCover({ project }) {
    return (
        <div className="project-cover" role="img" aria-label={`${project.name} cover`}>
            <pre className="project-cover-ascii" aria-hidden="true">{`┌──────────────────────────┐
│  ${project.index.padStart(2, '0')} / 04  SELECTED WORK    │
│                          │
└──────────────────────────┘`}</pre>
            <div className="project-cover-grid" aria-hidden="true" />
            <span className="project-cover-bgnum" aria-hidden="true">{project.index}</span>
            <span className="frame-corner tl" aria-hidden="true" />
            <span className="frame-corner tr" aria-hidden="true" />
            <span className="frame-corner bl" aria-hidden="true" />
            <span className="frame-corner br" aria-hidden="true" />

            <div className="project-cover-meta">
                <span className="project-cover-dot" aria-hidden="true" />
                <span>{project.index}</span>
                <span className="project-cover-divider">/</span>
                <span>04</span>
            </div>
            <div className="project-cover-name">{project.name}</div>
            <div className="project-cover-tags">{project.tags}</div>
        </div>
    );
}

export default function Projects() {
    return (
        <section id="projects" className="projects">
            <div className="section-header scroll-reveal">
                <span className="section-num" aria-hidden="true">(003)</span>
                <h2 className="section-title">Selected Works</h2>
            </div>

            {PROJECTS.map((p) => (
                <article key={p.name} className={`project-wrapper ${p.layout} scroll-reveal`}>
                    {p.layout === 'pt-2' ? (
                        <>
                            <div className="project-img-container"><ProjectCover project={p} /></div>
                            <div className="project-info">
                                <div className="project-meta">{p.meta}</div>
                                <h3 className="project-name">{p.name}</h3>
                                <div className="project-tags">{p.tags}</div>
                                <p className="project-desc">{p.desc}</p>
                                <a href={p.href} target="_blank" rel="noopener noreferrer" className="view-link" aria-label={`View ${p.name} repository on GitHub`}>View Repository</a>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="project-info">
                                <div className="project-meta">{p.meta}</div>
                                <h3 className="project-name">{p.name}</h3>
                                <div className="project-tags">{p.tags}</div>
                                <p className="project-desc">{p.desc}</p>
                                <a href={p.href} target="_blank" rel="noopener noreferrer" className="view-link" aria-label={`View ${p.name} repository on GitHub`}>View Repository</a>
                            </div>
                            <div className="project-img-container"><ProjectCover project={p} /></div>
                        </>
                    )}
                </article>
            ))}
        </section>
    );
}

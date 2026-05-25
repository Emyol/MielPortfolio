const PROJECTS = [
    {
        layout: 'pt-1',
        meta: 'Undergraduate Thesis — 2024',
        name: 'KitaKo',
        tags: 'Flutter / Dart / Computer Vision / On-device ML',
        desc: "A mobile image retrieval application built around on-device machine learning. KitaKo classifies and indexes a user's private gallery in real time, enabling semantic search across personal photos without offloading data to the cloud.",
        href: 'https://github.com/Emyol/KitaKo_Codebase',
        index: '01',
    },
    {
        layout: 'pt-2',
        meta: 'Internal Tooling — 2025',
        name: 'iCARE Reservation',
        tags: 'JavaScript / Web App',
        desc: 'A room reservation system built for a school office during my role as a Student Assistant. Streamlines booking workflows, conflict-checking, and schedule visibility for staff managing shared meeting spaces.',
        href: 'https://github.com/Emyol/iCARE-Reservation',
        index: '02',
    },
    {
        layout: 'pt-1',
        meta: 'Programming Languages Course — 2024',
        name: 'BekiLang',
        tags: 'Python / Compiler / Interpreter',
        desc: 'A custom programming language built around Philippine Gay Lingo (Swardspeak). Ships with its own interpreter, compiler, and web playground — turning keywords like kunwari, periodt, and ganern into a working language with full control flow, typing, and I/O.',
        href: 'https://github.com/Emyol/BekiLang',
        index: '03',
    },
    {
        layout: 'pt-2',
        meta: 'NASA Space Apps Challenge — 2025',
        name: 'CitySense',
        tags: 'TypeScript / Leaflet / NASA GIBS / SEDAC',
        desc: 'A geospatial intelligence cockpit for urban planners shaping climate-resilient policy. CitySense streams live NASA, WorldPop, GHSL, and SEDAC layers into a unified map, surfacing heat, greenspace, water, and equity indicators alongside a DeepSeek-powered planning assistant.',
        href: 'https://github.com/Emyol/city-sense',
        index: '04',
    },
];

function ProjectCover({ project }) {
    return (
        <div className="project-cover" role="img" aria-label={`${project.name} cover`}>
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
                <span className="project-cover-status">ACTIVE</span>
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
                <h2 className="section-num">(003)</h2>
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

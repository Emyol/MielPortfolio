import { site } from '../data/site';

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
                <span className="section-num" aria-hidden="true">{site.projectsSection.sectionNum}</span>
                <h2 className="section-title">{site.projectsSection.sectionTitle}</h2>
            </div>

            {site.projects.map((p) => (
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

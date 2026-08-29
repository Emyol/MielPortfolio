import { site } from '../data/site';

export default function Leadership() {
  return (
    <section id="leadership" className="leadership">
      <div className="section-header scroll-reveal">
        <span className="section-num" aria-hidden="true">{site.leadershipSection.sectionNum}</span>
        <h2 className="section-title">{site.leadershipSection.sectionTitle}</h2>
      </div>

      <div className="timeline">
        {site.orgs.map((o) => (
          <div key={o.org} className="timeline-item scroll-reveal">
            <div className="timeline-year">{o.period}</div>
            <div className="timeline-core">
              <h3 className="timeline-role">{o.org}</h3>
              <ul className="timeline-roles">
                {o.roles.map((r) => (
                  <li key={r.title}>
                    <span className="role-year">{r.year}</span>
                    <span className="role-title">{r.title}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="timeline-desc">
              <p>{o.summary}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

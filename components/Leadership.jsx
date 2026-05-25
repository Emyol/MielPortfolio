const ORGS = [
  {
    org: 'FEU Tech Student Coordinating Council',
    period: 'Aug 2023 — Present',
    summary:
      'Three-year progression through the council\'s logistics pipeline — from on-ground execution to directing events for the wider student body, with operational ownership at every step.',
    roles: [
      { year: 'Aug 2024 — Aug 2025', title: 'Director for Logistics' },
      { year: 'Aug 2023 — Aug 2024', title: 'Junior Officer for Logistics' },
    ],
  },
  {
    org: 'FEU Tech ACM Student Chapter',
    period: 'Aug 2023 — Present',
    summary:
      'Built logistics capability inside the chapter, then took on representation: now liaising with the SCC to align chapter initiatives with institutional programs.',
    roles: [
      { year: 'Sep 2025 — Present', title: 'SCC Representative' },
      { year: 'Aug 2024 — Aug 2025', title: 'Associate Director for Logistics' },
      { year: 'Aug 2023 — Aug 2024', title: 'Junior Officer for Logistics' },
    ],
  },
];

export default function Leadership() {
  return (
    <section id="leadership" className="leadership">
      <div className="section-header scroll-reveal">
        <h2 className="section-num">(004)</h2>
        <h2 className="section-title">Leadership Journey</h2>
      </div>

      <div className="timeline">
        {ORGS.map((o) => (
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

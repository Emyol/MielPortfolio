const ORGS = [
  {
    org: 'iCARE — FEU Institute of Technology',
    period: 'Sep 2023 — Present',
    summary:
      'Student Assistant facilitating peer tutoring and faculty-led review sessions for 700+ STEM students, while centralizing tutorial intake and supporting institutional academic events across venues.',
    roles: [
      { year: 'Sep 2023 — Present', title: 'Student Assistant' },
    ],
  },
  {
    org: 'FEU Tech Student Coordinating Council',
    period: 'Aug 2023 — Aug 2025',
    summary:
      'Directed end-to-end planning, resource allocation, and operational execution for campus-wide events serving thousands of students — from on-ground staging to Director for Logistics.',
    roles: [
      { year: 'Aug 2024 — Aug 2025', title: 'Director for Logistics' },
      { year: 'Aug 2023 — Aug 2024', title: 'Junior Officer for Logistics' },
    ],
  },
  {
    org: 'FEU Tech ACM Student Chapter',
    period: 'Aug 2023 — Aug 2026',
    summary:
      'Built logistics capability inside the chapter, then served as institutional liaison with the Student Coordinating Council, aligning chapter initiatives with university-wide policy.',
    roles: [
      { year: 'Aug 2025 — Aug 2026', title: 'SCC Representative' },
      { year: 'Aug 2024 — Aug 2025', title: 'Associate Director for Logistics' },
      { year: 'Aug 2023 — Aug 2024', title: 'Junior Officer for Logistics' },
    ],
  },
  {
    org: 'FEU Tech Junior Philippine Computer Society',
    period: 'Aug 2023 — Aug 2024',
    summary:
      'Supported departmental tech activities through event check-in workflows, supply distribution, and venue preparation.',
    roles: [
      { year: 'Aug 2023 — Aug 2024', title: 'Junior Officer for Logistics' },
    ],
  },
];

export default function Leadership() {
  return (
    <section id="leadership" className="leadership">
      <div className="section-header scroll-reveal">
        <span className="section-num" aria-hidden="true">(004)</span>
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

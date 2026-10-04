import PinTitle from './PinTitle';

const YEARS = [
  {
    year: '2023',
    roles: [
      { title: 'Junior Officer for Logistics', org: 'FEU Tech Student Coordinating Council', period: 'Aug 2023 \u2014 Aug 2024' },
      { title: 'Junior Officer for Logistics', org: 'FEU Tech ACM Student Chapter', period: 'Aug 2023 \u2014 Aug 2024' },
      { title: 'Junior Officer for Logistics', org: 'FEU Tech Junior Philippine Computer Society', period: 'Aug 2023 \u2014 Aug 2024', contribution: 'Helped with check-in, supply distribution, and venue preparation for departmental technology events.' },
      { title: 'Student Assistant', org: 'iCARE, FEU Institute of Technology', period: 'Sep 2023 \u2014 Present', contribution: 'Help facilitate peer tutoring and faculty-led review sessions supporting more than 700 STEM students.' },
    ],
  },
  {
    year: '2024',
    roles: [
      { title: 'Director for Logistics', org: 'FEU Tech Student Coordinating Council', period: 'Aug 2024 \u2014 Aug 2025', contribution: 'Across my SCC roles, I planned logistics, allocated resources, and helped run campus-wide events for thousands of students.' },
      { title: 'Associate Director for Logistics', org: 'FEU Tech ACM Student Chapter', period: 'Aug 2024 \u2014 Aug 2025' },
    ],
  },
  {
    year: '2025',
    roles: [
      { title: 'SCC Representative', org: 'FEU Tech ACM Student Chapter', period: 'Aug 2025 \u2014 Aug 2026', contribution: 'Across my ACM roles, I helped build logistics capability, then worked as the institutional liaison to align chapter activities with university policy.' },
    ],
  },
];

export default function Leadership() {
  return (
    <section id="leadership" className="field-section" aria-labelledby="leadership-title" data-pin-section>
      <div className="field-shell field-split">
        <PinTitle id="leadership-title">Leadership</PinTitle>
        <div>
          <p className="field-lede">Where I’ve helped out, taken responsibility, and learned to work with others.</p>
          <ol className="leadership-timeline" aria-label="Experience by start year">
            {YEARS.map(({ year, roles }) => (
              <li className="leadership-year" key={year}>
                <div data-leadership-year>
                  <h3 id={`leadership-year-${year}`}><time dateTime={year}>{year}</time></h3>
                  <ol className="leadership-roles" aria-labelledby={`leadership-year-${year}`}>
                    {roles.map((role) => (
                      <li className="leadership-role" key={`${role.org}-${role.title}`}>
                        <h4>{role.title}</h4>
                        <p className="leadership-org">{role.org}</p>
                        <p className="leadership-dates">{role.period}</p>
                        {role.contribution && <p className="leadership-contribution">{role.contribution}</p>}
                      </li>
                    ))}
                  </ol>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

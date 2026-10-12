import PinTitle from './PinTitle';

export default function Leadership({ content }) {
 const format = value => value ? new Date(value+'-01T12:00:00Z').toLocaleDateString('en-US',{month:'short',year:'numeric',timeZone:'UTC'}) : '';
 const grouped = new Map();
 for(const role of content.experience.items.filter(item=>!item.archived)){const year=role.startDate.slice(0,4)||'Undated';if(!grouped.has(year))grouped.set(year,[]);grouped.get(year).push({...role,period:[format(role.startDate),role.current?'Present':format(role.endDate)].filter(Boolean).join(' \u2014 ')});}
 const YEARS=Array.from(grouped,([year,roles])=>({year,roles})).sort((a,b)=>a.year.localeCompare(b.year));
  return (
    <section id="leadership" className="field-section" aria-labelledby="leadership-title" data-pin-section>
      <div className="field-shell field-split">
        <PinTitle id="leadership-title">{content.experience.title}</PinTitle>
        <div>
          <p className="field-lede">{content.experience.lede}</p>
          <ol className="leadership-timeline" aria-label="Experience by start year">
            {YEARS.map(({ year, roles }) => (
              <li className="leadership-year" key={year}>
                <div data-leadership-year>
                  <h3 id={`leadership-year-${year}`}><time dateTime={year}>{year}</time></h3>
                  <ol className="leadership-roles" aria-labelledby={`leadership-year-${year}`}>
                    {roles.map((role) => (
                      <li className="leadership-role" key={role.id}>
                        <h4>{role.title}</h4>
                        <p className="leadership-org">{role.org} / {role.category}</p>
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

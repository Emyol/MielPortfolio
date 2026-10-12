import { getMetrics } from "@/lib/content/model";

import PinTitle from './PinTitle';
import DisciplineMarquee from './DisciplineMarquee';
import StackMarquee from './StackMarquee';

export default function About({ content }) {
 const METRICS=getMetrics(content);
  return (
    <section id="about" className="field-section" aria-labelledby="about-title" data-pin-section>
      <div className="field-shell field-split">
        <PinTitle id="about-title">{content.about.title}</PinTitle>
        <div className="discipline-intro">
          <p className="field-lede">{content.about.lede}</p>
          <div className="discipline-grid">
            <div className="capability-statement">
              <blockquote>{content.about.quote}</blockquote>
            </div>
            <dl className="field-measures">
              {METRICS.map((metric) => (
                <div key={metric.label}>
                  <dt>{metric.label}</dt>
                  <dd>
                    <span
                      data-count={metric.value}
                      data-pad={metric.pad}
                      data-suffix={metric.suffix}
                    >
                      {String(metric.value).padStart(metric.pad,'0')+metric.suffix}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
      <DisciplineMarquee items={content.practices.items} />
      <div className="field-shell">
        <StackMarquee items={content.stack.items} title={content.stack.title} />
      </div>
    </section>
  );
}

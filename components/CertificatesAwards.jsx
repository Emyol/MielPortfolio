import PinTitle from './PinTitle';
import CarouselCustomNavigation from '@/components/shadcn-space/carousel/carousel-02';

const CREDENTIALS = [
  {
    issuer: 'Project Management Institute',
    name: 'PMI Project Management Ready®',
    detail: 'Formally evaluated in project-management fundamentals, plan-based methods, agile practice, and business analysis.',
    year: '2026',
    image: '/certificates/pmi.jpg',
  },
  {
    issuer: 'SAP',
    name: 'Certified Project Manager — SAP Activate',
    detail: 'Verifies delivery skills in SAP Activate, including stakeholders, change, testing, and project transitions.',
    year: '2026',
    image: '/certificates/sap-activate.jpg',
  },
  {
    issuer: 'Certiport',
    name: 'IT Specialist — Python',
    detail: 'Information Technology Specialist credential covering Python fundamentals, program flow, and problem solving.',
    year: '2025',
    image: '/certificates/python.jpg',
  },
  {
    issuer: 'Anthropic',
    name: 'Claude Code in Action',
    detail: 'Certificate of Completion for using Claude Code across software development and codebase work.',
    year: '',
    image: '/certificates/claude-code.png',
  },
  {
    issuer: 'Google for Education',
    name: 'Gemini Certified Student',
    detail: 'Demonstrated the knowledge and basic competencies needed to use Google AI in university work.',
    year: '2025',
    image: '/certificates/gemini.jpg',
  },
  {
    issuer: 'MathWorks',
    name: 'MATLAB Onramp',
    detail: 'Completed 100% of the self-paced MATLAB Onramp course in data analysis, visualization, and scripting.',
    year: '2025',
    image: '/certificates/matlab-onramp.png',
  },
];

const AWARDS = [
  { year: '2026', title: "Rank 2, Batch ’27 and Rank 5, BSCSSE" },
  { year: '2025', title: 'Active Student Leader, FEU Institute of Technology' },
  { year: '2024', title: '4th Place, Code Green for Campuses' },
  { year: '2024', title: "Rank 2, Batch ’27 and Rank 7, BSCSSE" },
];

export default function CertificatesAwards() {
  return (
    <section
      id="credentials"
      className="field-section field-credentials-section"
      aria-labelledby="credentials-title"
      data-pin-section
    >
      <div className="field-shell field-split">
        <PinTitle id="credentials-title">Certificates &amp; Awards</PinTitle>
        <div className="credentials-section-layout">
          <p className="field-lede">
            Formal credentials and distinctions that support the engineering and delivery work shown across the Field.
          </p>

          <div className="distinction-list credentials-awards-list">
            <h3>Awards &amp; distinctions</h3>
            <ul>
              {AWARDS.map((item, index) => (
                <li key={`${item.year}-${index}`}>
                  <time>{item.year}</time>
                  <span>{item.title}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="credentials-gallery">
            <h3>Certificates</h3>
            <p>Hover or focus a credential to read its name and details.</p>
            <CarouselCustomNavigation items={CREDENTIALS} />
          </div>
        </div>
      </div>
    </section>
  );
}

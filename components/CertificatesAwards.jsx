import PinTitle from './PinTitle';
import CarouselCustomNavigation from '@/components/shadcn-space/carousel/carousel-02';

export default function CertificatesAwards({ content }) {
 const CREDENTIALS=content.credentials.items.filter(r=>!r.archived);const AWARDS=content.awards.items.filter(r=>!r.archived);
  return (
    <section
      id="credentials"
      className="field-section field-credentials-section"
      aria-labelledby="credentials-title"
      data-pin-section
    >
      <div className="field-shell field-split">
        <PinTitle id="credentials-title">{content.credentials.title}</PinTitle>
        <div className="credentials-section-layout">
          <p className="field-lede">
            {content.credentials.lede}
          </p>

          <div className="distinction-list credentials-awards-list">
            <h3>{content.awards.title}</h3>
            <ul>
              {AWARDS.map((item, index) => (
                <li key={`${item.year}-${index}`}>
                  <time>{item.year}</time>
                  <span>{item.title}{item.organization && ` / ${item.organization}`}{item.description && <small>{item.description}</small>}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="credentials-gallery">
            <h3>{content.credentials.galleryTitle}</h3>
            <p>{content.credentials.galleryDescription}</p>
            <CarouselCustomNavigation items={CREDENTIALS} />
          </div>
        </div>
      </div>
    </section>
  );
}

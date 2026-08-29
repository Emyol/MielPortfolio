import MagneticElement from "./MagneticElement";
import { site } from "../data/site";

export default function Footer() {
  return (
    <footer id="contact" className="footer scroll-reveal">
      <h2 className="footer-huge">{site.contact.heading}</h2>
      <div className="footer-grid">
        <div className="footer-col">
          <span className="footer-label">Location</span>
          <p>
            {site.location.city}, {site.location.countryName}
            <br />
            {site.location.available}
          </p>
        </div>
        <div className="footer-col">
          <span className="footer-label">Digital</span>
          <MagneticElement
            as="a"
            href={`mailto:${site.contact.email}`}
            className="footer-link"
          >
            {site.contact.email}
          </MagneticElement>
          <a href={`tel:${site.contact.phone}`} className="footer-link">
            {site.contact.phoneDisplay}
          </a>
          <a
            href={site.contact.cvHref}
            download={site.contact.cvFilename}
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            {site.contact.cvLabel}
          </a>
        </div>
        <div className="footer-col">
          <span className="footer-label">Socials</span>
          <a href={site.contact.github} target="_blank" rel="noopener noreferrer" className="footer-link">
            {site.contact.githubLabel}
          </a>
          <a href={site.contact.linkedin} target="_blank" rel="noopener noreferrer" className="footer-link">
            {site.contact.linkedinLabel}
          </a>
        </div>
      </div>
      <div className="footer-totop">
        <a href="#hero" className="back-to-top" aria-label="Back to top">
          <span className="back-to-top-tick" aria-hidden="true" />
          Back to top
        </a>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} {site.name}. All rights reserved.</p>
        <p>
          Designed with{" "}
          <span style={{ color: "var(--accent)" }}>{site.footer.designedWith}</span>.
        </p>
      </div>
    </footer>
  );
}

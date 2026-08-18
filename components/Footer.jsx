import MagneticElement from "./MagneticElement";

export default function Footer() {
  return (
    <footer id="contact" className="footer scroll-reveal">
      <h2 className="footer-huge">LET&rsquo;S CONNECT</h2>
      <div className="footer-grid">
        <div className="footer-col">
          <span className="footer-label">Location</span>
          <p>
            Manila, Philippines
            <br />
            Available globally.
          </p>
        </div>
        <div className="footer-col">
          <span className="footer-label">Digital</span>
          <MagneticElement
            as="a"
            href="mailto:acunaamieljosiah@gmail.com"
            className="footer-link"
          >
            acunaamieljosiah@gmail.com
          </MagneticElement>
          <a href="tel:+639610459227" className="footer-link">
            +63 961 045 9227
          </a>
          <a
            href="/Amiel_Acuna_CV.pdf"
            download="Amiel_Acuna_CV.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            Download CV
          </a>
        </div>
        <div className="footer-col">
          <span className="footer-label">Socials</span>
          <a href="https://github.com/Emyol" target="_blank" rel="noopener noreferrer" className="footer-link">
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/amiel-josiah-acu%C3%B1a-4786a515a" target="_blank" rel="noopener noreferrer" className="footer-link">
            LinkedIn
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
        <p>&copy; {new Date().getFullYear()} Amiel Acu&ntilde;a. All rights reserved.</p>
        <p>
          Designed with{" "}
          <span style={{ color: "var(--accent)" }}>precision</span>.
        </p>
      </div>
    </footer>
  );
}

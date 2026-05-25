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
        </div>
        <div className="footer-col">
          <span className="footer-label">Socials</span>
          <a href="https://github.com/Emyol" target="_blank" rel="noopener noreferrer" className="footer-link">
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/amiel-acu%C3%B1a/" target="_blank" rel="noopener noreferrer" className="footer-link">
            LinkedIn
          </a>
        </div>
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

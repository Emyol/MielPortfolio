import ParseApp from '../../components/parse/ParseApp';
import './parse-lab.css';

export default function ParseLab() {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <main id="main">
        <ParseApp />
      </main>
    </>
  );
}

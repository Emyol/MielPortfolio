import ParseApp from '../components/parse/ParseApp';

export default function Home() {
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

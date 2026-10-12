import Navbar from "./Navbar";
import Hero from "./Hero";
import About from "./About";
import CertificatesAwards from "./CertificatesAwards";
import Projects from "./Projects";
import Leadership from "./Leadership";
import Footer from "./Footer";
import ScrollProgress from "./ScrollProgress";
import PageMotion from "./PageMotion";
const sections = {
  about: About,
  credentials: CertificatesAwards,
  projects: Projects,
  leadership: Leadership,
  contact: Footer,
};
const SITE_URL = "https://project-miel.vercel.app";
export default function Portfolio({ content, preview = false }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: content.profile.fullName,
    alternateName: content.profile.alternateName,
    image: new URL(content.profile.portrait || "/hero-profile.png", SITE_URL)
      .href,
    description: content.seo.description,
    jobTitle: content.profile.jobTitle,
    url: SITE_URL,
    email: content.contact.email,
    telephone: content.contact.phone,
    alumniOf: { "@type": "CollegeOrUniversity", name: content.profile.school },
    sameAs: content.contact.socials
      .filter((item) => !item.archived && item.href.startsWith("https://"))
      .map((item) => item.href),
  };
  return (
    <>
      {!preview && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
      )}
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <ScrollProgress />
      <Navbar content={content} />
      <main id="main" className="field-page">
        <PageMotion />
        <Hero content={content} />
        {content.navigation.items
          .filter((item) => !item.archived)
          .map((item) => {
            const Section = sections[item.section];
            return Section ? <Section key={item.id} content={content} /> : null;
          })}
      </main>
    </>
  );
}

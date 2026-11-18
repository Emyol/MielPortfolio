import Dive from './dive/Dive';

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
      <Dive content={content} />
    </>
  );
}

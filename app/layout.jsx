import { Fraunces, Public_Sans } from 'next/font/google';
import './globals.css';
import './liquid-field.css';

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display-loaded',
  display: 'swap',
  axes: ['SOFT', 'WONK', 'opsz'],
});

const body = Public_Sans({
  subsets: ['latin'],
  variable: '--font-body-loaded',
  display: 'swap',
});

const SITE_URL = 'https://project-miel.vercel.app';
const FULL_NAME = 'Amiel Josiah Acuña';
const TITLE = `${FULL_NAME} | Software Engineer Portfolio`;
const DESCRIPTION = 'Explore the software projects, experience, and leadership of Amiel Josiah Acuña (Amiel Josiah Acuna), a software engineering student at FEU Tech in Manila.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  keywords: [FULL_NAME, 'Amiel Josiah Acuna', 'Amiel Acuña', 'Miel Acuña', 'Software Engineer', 'FEU Tech', 'Manila', 'Portfolio'],
  authors: [{ name: FULL_NAME }],
  creator: FULL_NAME,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: FULL_NAME,
    images: [{ url: '/hero-profile.png', width: 1200, height: 1200, alt: FULL_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: ['/hero-profile.png'],
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico' },
};

export const viewport = {
  themeColor: '#070707',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: FULL_NAME,
  alternateName: ['Amiel Josiah Acuna', 'Amiel Acuña', 'Miel'],
  image: `${SITE_URL}/hero-profile.png`,
  description: DESCRIPTION,
  jobTitle: 'Software Engineer',
  url: SITE_URL,
  email: 'acunaamieljosiah@gmail.com',
  address: { '@type': 'PostalAddress', addressLocality: 'Manila', addressCountry: 'PH' },
  telephone: '+639610459227',
  alumniOf: { '@type': 'CollegeOrUniversity', name: 'FEU Institute of Technology' },
  sameAs: ['https://github.com/Emyol', 'https://www.linkedin.com/in/amiel-josiah-acu%C3%B1a-4786a515a'],
  knowsAbout: ['On-device ML', 'Vector Retrieval', 'Geospatial Intelligence', 'Flutter', 'ONNX Runtime', 'TypeScript', 'Project Management'],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {/*
          THESIS: The Surface is a volume of silver fluid a Visitor remembers; it refuses Operator Console costume and the generic metric-hero résumé.
          OWN-WORLD: Near-black field, white/silver ink, Fraunces display + Public Sans body, 2px metal corners, Canvas UI Liquid only in the first viewport.
          STORY: Meet Amiel through the Field, then inspect Work, leadership, and a way to write.
          FIRST VIEWPORT: Full-viewport Liquid Field; Fraunces headline bottom-left; portrait right; actions and quiet measures under the copy.
          FORM: Liquid Field, brief-pinned (grill + ADR-0001), seed key grill-liquid-field.
          FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
        */}
        {children}
      </body>
    </html>
  );
}

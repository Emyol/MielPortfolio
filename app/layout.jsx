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

const SITE_URL = 'https://miel.dev';
const TITLE = 'Amiel Acuña — Software Engineer & Student Leader';
const DESCRIPTION = 'Software Engineering student and certified project manager at FEU Tech. Rank 2 in Batch ’27, specializing in on-device edge AI, vector retrieval, and geospatial intelligence.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: ['Amiel Acuña', 'Software Engineer', 'Edge AI', 'Flutter', 'ONNX', 'Next.js', 'FEU Tech', 'Project Manager', 'Manila', 'Portfolio'],
  authors: [{ name: 'Amiel Acuña' }],
  creator: 'Amiel Acuña',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: 'Amiel Acuña',
    images: [{ url: '/hero-profile.png', width: 1200, height: 1200, alt: 'Amiel Acuña' }],
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
  name: 'Amiel Acuña',
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

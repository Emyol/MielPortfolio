import './globals.css';

const SITE_URL = 'https://miel.dev';
const TITLE = 'Amiel Acuña — Software Engineer & Student Leader';
const DESCRIPTION = 'Software Engineering student and certified project manager at FEU Tech — Rank 2 in Batch ’27. Specializing in on-device edge AI, vector retrieval, and geospatial intelligence.';

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;1,400&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

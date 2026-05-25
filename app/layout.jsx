import './globals.css';

const SITE_URL = 'https://miel.dev';
const TITLE = 'Amiel Acuña — Software Engineer & Student Leader';
const DESCRIPTION = 'Software Engineering student & leader at FEU Institute of Technology. Specializing in AI/ML, vector retrieval, and advanced mobile architectures.';

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: ['Amiel Acuña', 'Software Engineer', 'AI/ML', 'Flutter', 'Next.js', 'FEU Tech', 'Manila', 'Portfolio'],
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
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: 'Amiel Acuña',
  jobTitle: 'Software Engineer',
  url: SITE_URL,
  email: 'acunaamieljosiah@gmail.com',
  address: { '@type': 'PostalAddress', addressLocality: 'Manila', addressCountry: 'PH' },
  sameAs: ['https://github.com/Emyol', 'https://www.linkedin.com/in/amiel-acu%C3%B1a/'],
  knowsAbout: ['AI/ML', 'Vector Retrieval', 'Mobile Architecture', 'Flutter', 'Next.js', 'TypeScript'],
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

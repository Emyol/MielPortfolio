import './globals.css';
import { site } from '../data/site';

const SITE_URL = site.url;
const TITLE = site.title;
const DESCRIPTION = site.description;

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  keywords: site.keywords,
  authors: [{ name: site.name }],
  creator: site.name,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: site.name,
    images: [{ url: site.portrait.src, width: 1200, height: 1200, alt: site.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [site.portrait.src],
  },
  robots: { index: true, follow: true },
  icons: { icon: '/favicon.ico' },
};

export const viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: site.name,
  jobTitle: site.jobTitle,
  url: SITE_URL,
  email: site.contact.email,
  address: { '@type': 'PostalAddress', addressLocality: site.location.city, addressCountry: site.location.country },
  telephone: site.contact.phone,
  alumniOf: { '@type': 'CollegeOrUniversity', name: site.contact.alumniOf },
  sameAs: [site.contact.github, site.contact.linkedin],
  knowsAbout: site.contact.knowsAbout,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;1,400&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

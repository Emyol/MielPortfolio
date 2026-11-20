import { Fraunces, Geist, Geist_Mono, Public_Sans } from 'next/font/google';
import './globals.css';
import './dive.css';

const display = Fraunces({
  subsets: ['latin'],
  variable: '--font-display-loaded',
  display: 'swap',
  axes: ['SOFT', 'WONK', 'opsz'],
});

// Public Sans stays for the admin editor (app/admin/admin.css). It is not preloaded, so the public page does not
// download it; the browser fetches it only where it is used.
const body = Public_Sans({
  subsets: ['latin'],
  variable: '--font-body-loaded',
  display: 'swap',
  preload: false,
});

const sans = Geist({ subsets: ['latin'], variable: '--font-geist', display: 'swap' });
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono', display: 'swap' });

export const viewport = {
  themeColor: '#070707',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${sans.variable} ${mono.variable}`} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}

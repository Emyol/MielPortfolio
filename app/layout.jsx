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

export const viewport = {
  themeColor: '#070707',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
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

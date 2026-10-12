export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://project-miel.vercel.app/sitemap.xml',
  };
}

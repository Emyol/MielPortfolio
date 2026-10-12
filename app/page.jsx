import Portfolio from "@/components/Portfolio";
import { getPublishedContent } from "@/lib/content/repository";
const SITE_URL = "https://project-miel.vercel.app";
export async function generateMetadata() {
  const content = await getPublishedContent();
  const { title, description, image } = content.seo;
  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: { canonical: "/" },
    authors: [{ name: content.profile.fullName }],
    creator: content.profile.fullName,
    keywords: [
      content.profile.fullName,
      content.profile.alternateName,
      content.profile.jobTitle,
      "Portfolio",
    ],
    openGraph: {
      type: "website",
      locale: "en_US",
      url: SITE_URL,
      title,
      description,
      siteName: content.profile.fullName,
      images: image ? [{ url: image, alt: content.profile.fullName }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
    robots: { index: true, follow: true },
    icons: { icon: "/favicon.ico" },
  };
}
export default async function Home() {
  return <Portfolio content={await getPublishedContent()} />;
}

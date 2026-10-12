import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: "Portfolio editor",
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

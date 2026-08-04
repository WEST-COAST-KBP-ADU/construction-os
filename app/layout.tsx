import type { Metadata } from "next";

import "./globals.css";
import Footer from "@/src/components/Footer";
import Header from "@/src/components/Header";
import { siteConfig } from "@/src/lib/siteConfig";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: [siteConfig.name, siteConfig.tagline].join(" — "),
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="site-shell">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";
import Footer from "@/src/components/Footer";
import Header from "@/src/components/Header";
import { siteConfig } from "@/src/lib/siteConfig";

const dmSans = localFont({
  src: [
    { path: "./fonts/dm-sans-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/dm-sans-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "./fonts/dm-sans-latin-600-normal.woff2", weight: "600", style: "normal" },
    { path: "./fonts/dm-sans-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-dm-sans",
  display: "swap",
  fallback: ["Arial", "sans-serif"],
  adjustFontFallback: "Arial",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: [siteConfig.name, siteConfig.tagline].join(" — "),
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
    <html lang="en" className={dmSans.variable}>
      <body className="site-shell">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

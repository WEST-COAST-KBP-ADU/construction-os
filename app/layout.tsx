import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";

import "./globals.css";
import DevelopmentNotice from "@/src/components/DevelopmentNotice";
import Footer from "@/src/components/Footer";
import Header from "@/src/components/Header";
import { siteConfig } from "@/src/lib/siteConfig";

const inter = Inter({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-inter",
  weight: "variable",
});

const sourceSerif = Source_Serif_4({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-source-serif",
  weight: "variable",
});

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
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body className="site-shell">
        <DevelopmentNotice />
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}

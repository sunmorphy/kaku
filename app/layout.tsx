import React from "react";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from './components/Header';
import StructuredData, { websiteSchema } from './components/StructuredData';

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Kaku - Portfolio & Journey",
    template: "%s | Kaku"
  },
  description: "Explore Kaku's portfolio showcasing creative projects, artworks, and professional journey. Discover innovative designs and creative solutions.",
  keywords: ["kaku", "rahma dwin", "rahma dwi nanda", "portfolio", "creative", "projects", "artworks", "artist", "2D", "animations"],
  authors: [{ name: "Kaku" }],
  creator: "Kaku",
  openGraph: {
    title: "Kaku - Portfolio & Journey",
    description: "Explore Kaku's portfolio showcasing creative projects and artworks.",
    type: "website",
    siteName: "Kaku Portfolio"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  verification: {
    google: "google-site-verification-token"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <StructuredData data={websiteSchema} />
      </head>
      <body className={`${plusJakartaSans.className}`}>
        <Header />
        {children}
      </body>
    </html>
  );
}

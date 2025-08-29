import React from "react";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from './components/Header';
import StructuredData, { websiteSchema, personSchema } from './components/StructuredData';

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Rahma Dwin - Portfolio & Journey",
    template: "%s | Rahma Dwin"
  },
  description: "Explore Rahma Dwin's portfolio showcasing creative projects, artworks, and professional journey.",
  keywords: ["kaku", "rahma dwin", "rahma dwi nanda", "portfolio", "creative", "projects", "artworks", "artist", "2D", "animations"],
  authors: [{ name: "Rahma Dwin" }],
  creator: "Rahma Dwin",
  openGraph: {
    title: "Rahma Dwin - Portfolio & Journey",
    description: "Explore Rahma Dwin's portfolio showcasing creative projects and artworks.",
    url: process.env.NEXT_PUBLIC_SITE_URL!,
    siteName: "Rahma Dwin Portfolio",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_SITE_URL!}/api/og`,
        width: 1200,
        height: 630,
        alt: "Rahma Dwin - 2D Artist Portfolio",
        type: "image/png"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "Rahma Dwin - Portfolio & Journey",
    description: "Explore Rahma Dwin's portfolio showcasing creative projects and artworks.",
    images: [`${process.env.NEXT_PUBLIC_SITE_URL!}/api/og`],
    creator: "@kaku"
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
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL!
  },
  other: {
    'theme-color': '#667eea',
    'color-scheme': 'light',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default'
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
        <StructuredData data={personSchema} />
        {/* Resource hints for better performance */}
        <link rel="preconnect" href="https://ik.imagekit.io" />
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_BASE_URL} />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preload" href="/loading.json" as="fetch" crossOrigin="anonymous" />
      </head>
      <body className={`${plusJakartaSans.className}`}>
        <Header />
        {children}
      </body>
    </html>
  );
}

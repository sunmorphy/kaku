import React from "react";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Header from './components/Header';
import StructuredData, { websiteSchema, personSchema } from './components/StructuredData';

const plusJakartaSans = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Rahma Dwin",
    template: "%s | Rahma Dwin"
  },
  description: "Rahma Dwin's portfolio.",
  keywords: ["kaku", "rahma dwin", "rahma dwi nanda", "portfolio", "projects", "artworks", "artist", "2D", "animations", "sketches", "illustrations", "digital art", "traditional art", "painting"],
  authors: [{ name: "Rahma Dwin" }],
  creator: "Rahma Dwin",
  openGraph: {
    title: "Rahma Dwin",
    description: "Rahma Dwin's portfolio.",
    type: "website",
    siteName: "Rahma Dwin Portfolio",
    images: "https://ik.imagekit.io/4o6binhtw/kaku/banner_1756263185853_Rahma_Dwin_ESMlnH8Mz.jpg"
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
  icons: {
    icon: "/favicon.ico",
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
      </head>
      <body className={`${plusJakartaSans.className}`}>
        <Header />
        {children}
      </body>
    </html>
  );
}

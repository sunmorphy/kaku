interface StructuredDataProps {
  data: object;
}

export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Kaku",
  "jobTitle": "2D Artist",
  "url": process.env.NEXT_PUBLIC_SITE_URL || "https://rahmadwin.art",
  "sameAs": [
    // These will be populated dynamically from profile data
  ],
  "description": "Creative professional showcasing portfolio of projects and artwork"
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "Website",
  "name": "Kaku Portfolio",
  "url": process.env.NEXT_PUBLIC_SITE_URL || "https://rahmadwin.art",
  "description": "Explore Kaku's portfolio showcasing creative projects, artwork, and journey",
  "author": {
    "@type": "Person",
    "name": "Kaku"
  }
};

export const portfolioSchema = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": "Kaku's Portfolio",
  "description": "A collection of Kaku's projects and artworks",
  "creator": {
    "@type": "Person",
    "name": "Kaku"
  }
};
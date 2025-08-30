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
  "name": "Rahma Dwin",
  "alternateName": ["Rahma Dwin", "Rahma Dwi Nanda", "Kaku"],
  "jobTitle": "2D Artist",
  "url": process.env.NEXT_PUBLIC_SITE_URL || "https://rahmadwin.art",
  "mainEntityOfPage": process.env.NEXT_PUBLIC_SITE_URL || "https://rahmadwin.art",
  "sameAs": [
    // These will be populated dynamically from profile data
  ],
  "description": "A 2D artist",
  "knowsAbout": ["2D Art", "Digital Art", "Traditional Art", "Artwork", "Animation", "Anime", "Sketch", "Illustration", "Painting"],
  "hasOccupation": {
    "@type": "Occupation",
    "name": "2D Artist"
  }
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "Website",
  "name": "Rahma Dwin Portfolio",
  "url": process.env.NEXT_PUBLIC_SITE_URL || "https://rahmadwin.art",
  "description": "Rahma Dwin's portfolio.",
  "author": {
    "@type": "Person",
    "name": "Rahma Dwin"
  }
};

export const portfolioSchema = {
  "@context": "https://schema.org",
  "@type": "CreativeWork",
  "name": "Rahma Dwin's Portfolio",
  "description": "A collection of Rahma's projects and artworks",
  "creator": {
    "@type": "Person",
    "name": "Rahma Dwin"
  }
};
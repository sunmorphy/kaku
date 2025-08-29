import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Browse Kaku's creative portfolio featuring projects and artworks.",
  openGraph: {
    title: "Kaku's Portfolio",
    description: "Browse Kaku's creative portfolio featuring projects and artworks."
  }
};

'use client';

import { useState, useMemo, useEffect } from 'react';
import PortfolioItem from '../components/PortfolioItem';
import { getProjects, getArtworks, type Project, type Artwork } from '../lib/api';
import LoadingAnimation from '../components/LoadingAnimation';
import { devLog } from '../utils/utils';
import StructuredData, { portfolioSchema } from '../components/StructuredData';

interface PortfolioItemData {
  id: number;
  title: string;
  categories: string[];
  type: 'project' | 'artwork';
  image: string;
  images?: string[];
}

export default function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [portfolioData, setPortfolioData] = useState<PortfolioItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const [projects, artworks] = await Promise.all([
          getProjects(),
          getArtworks()
        ]);

        const portfolioArtworks = artworks.data.filter((artwork: Artwork) =>
          artwork.type === 'portfolio'
        );

        const combinedData: PortfolioItemData[] = [
          ...projects.data.map((project: Project) => ({
            id: project.id,
            title: project.title,
            categories: project.project_categories?.map(cat => cat.category.name) || ['Uncategorized'],
            type: 'project' as const,
            image: project.batch_image_path?.[0] || '',
            images: project.batch_image_path || []
          })),
          ...portfolioArtworks.map((artwork: Artwork) => ({
            id: artwork.id,
            title: artwork.title,
            categories: artwork.artwork_categories?.map(cat => cat.category.name) || ['Uncategorized'],
            type: 'artwork' as const,
            image: artwork.image_path
          }))
        ];

        setPortfolioData(combinedData);
      } catch (err) {
        setError('Failed to load portfolio data. Please try again later.');
        devLog('Error fetching portfolio data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const categories = useMemo(() => {
    const allCategories = portfolioData.flatMap(item => item.categories);
    return ['All', ...Array.from(new Set(allCategories))];
  }, [portfolioData]);

  const filteredItems = useMemo(() => {
    return portfolioData.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.categories.includes(selectedCategory);
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [portfolioData, selectedCategory, searchTerm]);

  if (loading) {
    return (
      <LoadingAnimation size={256} />
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <StructuredData data={portfolioSchema} />
      <div className="min-h-screen p-8 animate-fade-in">
        <div className="mx-auto lg:w-3/5 w-full">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Portfolio</h1>

            {/* Search */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search by project or artwork name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-3 mb-8">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm transition-colors ${selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            {filteredItems.map((item) => (
              <PortfolioItem
                key={`${item.type}-${item.id}`}
                id={item.id.toString()}
                title={item.title}
                categories={item.categories}
                type={item.type}
                image={item.image}
                images={item.images}
              />
            ))}
          </div>

          {filteredItems.length === 0 && !loading && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No items found matching your criteria.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
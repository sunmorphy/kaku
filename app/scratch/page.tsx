'use client';

import { useState, useMemo, useEffect } from 'react';
import { Image } from '@imagekit/next';
import ScratchItem from '../components/ScratchItem';
import { getArtworks, type Artwork } from '../lib/api';
import LoadingAnimation from '../components/LoadingAnimation';
import { devLog } from '../utils/utils';

interface ScratchItemData {
  id: number;
  title: string;
  categories: string[];
  image: string;
  description: string;
}

export default function Scratch() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [scratchData, setScratchData] = useState<ScratchItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const artworks = await getArtworks();
        const scratchArtworks = artworks.data.filter((artwork: Artwork) =>
          artwork.type === 'scratch'
        );

        const scratchItems: ScratchItemData[] = scratchArtworks.map((artwork: Artwork) => ({
          id: artwork.id,
          title: artwork.title,
          categories: artwork.artwork_categories?.map(cat => cat.category.name) || ['Uncategorized'],
          image: artwork.image_path,
          description: artwork.description || ''
        }));

        setScratchData(scratchItems);
      } catch (err) {
        setError('Failed to load scratch items. Please try again later.');
        devLog('Error fetching scratch data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const categories = useMemo(() => {
    const allCategories = scratchData.flatMap(item => item.categories);
    return ['All', ...Array.from(new Set(allCategories))];
  }, [scratchData]);

  const filteredItems = useMemo(() => {
    return scratchData.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.categories.includes(selectedCategory);
      return matchesCategory;
    });
  }, [scratchData, selectedCategory]);

  const openDialog = (index: number) => {
    setSelectedImageIndex(index);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedImageIndex(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImageIndex === null) return;

    const newIndex = direction === 'prev'
      ? (selectedImageIndex - 1 + filteredItems.length) % filteredItems.length
      : (selectedImageIndex + 1) % filteredItems.length;

    setSelectedImageIndex(newIndex);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isDialogOpen) return;

      switch (e.key) {
        case 'Escape':
          closeDialog();
          break;
        case 'ArrowLeft':
          navigateImage('prev');
          break;
        case 'ArrowRight':
          navigateImage('next');
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDialogOpen, selectedImageIndex, filteredItems.length]);

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
    <div className="min-h-screen p-8 animate-fade-in">
      <div className="mx-auto lg:w-3/5 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Scratch</h1>

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

        {/* Scratch Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item, index) => (
            <ScratchItem
              key={item.id}
              id={item.id.toString()}
              title={item.title}
              categories={item.categories}
              image={item.image}
              description={item.description}
              onClick={() => openDialog(index)}
            />
          ))}
        </div>

        {filteredItems.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No items found in this category.</p>
          </div>
        )}
      </div>

      {/* Image Preview Dialog */}
      {isDialogOpen && selectedImageIndex !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeDialog}>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full h-[95vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={closeDialog}
              className="absolute top-4 right-4 z-50 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full p-2 transition-colors shadow-lg"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image */}
            <div className="w-full flex-1 bg-gray-50 flex items-center justify-center">
              <Image
                urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
                src={filteredItems[selectedImageIndex].image}
                alt={filteredItems[selectedImageIndex].title}
                width={600}
                height={400}
                className="object-contain w-full h-full"
              />
            </div>

            {/* Content */}
            <div className="p-6 flex-shrink-0">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1 space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{filteredItems[selectedImageIndex].title}</h3>
                  {filteredItems[selectedImageIndex].description && (
                    <p className="text-gray-600 leading-relaxed">{filteredItems[selectedImageIndex].description}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {filteredItems[selectedImageIndex].categories.map((category, index) => (
                      <div key={index} className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                        {category}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              {filteredItems.length > 1 && (
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <button
                    onClick={() => navigateImage('prev')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Previous
                  </button>

                  <span className="text-sm text-gray-500">
                    {selectedImageIndex + 1} of {filteredItems.length}
                  </span>

                  <button
                    onClick={() => navigateImage('next')}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    Next
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
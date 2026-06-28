'use client';

import { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import ArtworkItem from '../components/ArtworkItem';
import { getArtworks, getProjects, type Artwork, type Project } from '../lib/api';
import LoadingAnimation from '../components/LoadingAnimation';
import { devLog } from '../utils/utils';

interface ArtworkItemData {
  id: number;
  title: string;
  categories: string[];
  image: string;
  images?: string[]; // For projects with multiple images
  description: string;
  type: 'artwork' | 'project';
}

export default function Artwork() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [selectedItemImageIndex, setSelectedItemImageIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [artworkData, setartworkData] = useState<ArtworkItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch artworks using API
        const artworks = await getArtworks(1, 1, 100);

        // Combine both into unified data structure
        const artworkItems: ArtworkItemData[] = [
          ...artworks.data.map((artwork: Artwork) => ({
            id: artwork.id,
            title: artwork.title || 'Untitled',
            categories: artwork.artwork_categories?.map(cat => cat.category.name) || [],
            image: artwork.image_path,
            description: artwork.description || '',
            type: 'artwork' as const
          }))
        ];

        setartworkData(artworkItems);
      } catch (err) {
        setError('Failed to load artwork items. Please try again later.');
        devLog('Error fetching artwork data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const categories = useMemo(() => {
    const allCategories = artworkData.flatMap(item => item.categories);
    return ['All', ...Array.from(new Set(allCategories))];
  }, [artworkData]);

  const filteredItems = useMemo(() => {
    return artworkData.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.categories.includes(selectedCategory);
      return matchesCategory;
    });
  }, [artworkData, selectedCategory]);

  const openDialog = (index: number) => {
    setSelectedImageIndex(index);
    setSelectedItemImageIndex(0);
    setIsDialogOpen(true);
  };

  const closeDialog = () => {
    setIsDialogOpen(false);
    setSelectedImageIndex(null);
    setSelectedItemImageIndex(0);
    setIsGridExpanded(false);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImageIndex === null) return;

    const newIndex = direction === 'prev'
      ? (selectedImageIndex - 1 + filteredItems.length) % filteredItems.length
      : (selectedImageIndex + 1) % filteredItems.length;

    setSelectedImageIndex(newIndex);
    setSelectedItemImageIndex(0);
  };

  const [isGridExpanded, setIsGridExpanded] = useState(false);

  const toggleGridView = () => {
    setIsGridExpanded(!isGridExpanded);
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
      <div className="mx-auto max-w-7xl w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Artwork</h1>

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

        {/* Artworks */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item, index) => (
            <ArtworkItem
              key={`${item.type}-${item.id}`}
              id={item.id.toString()}
              title={item.title}
              categories={item.categories}
              image={item.image}
              images={item.images}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={closeDialog}>
          {/* Dark Backdrop */}
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" />

          {/* Dialog Container */}
          <div
            className="relative z-10 w-full h-full flex flex-col md:flex-row overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left Column: Image Viewer / Stack Grid */}
            <div className="flex-1 h-[60vh] md:h-full flex flex-col items-center justify-center relative p-4 md:p-8">
              {/* Navigation Buttons (Only overlays the left image section) */}
              {filteredItems.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}
                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full p-3 transition-all shadow-md border border-white/10"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}
                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full p-3 transition-all shadow-md border border-white/10"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Main Left Content */}
              {filteredItems[selectedImageIndex].type === 'artwork' ? (
                <div className="w-full h-full flex items-center justify-center max-h-[85vh]">
                  {filteredItems[selectedImageIndex].image && (
                    <Image
                      src={filteredItems[selectedImageIndex].image}
                      alt={filteredItems[selectedImageIndex].title}
                      width={1200}
                      height={800}
                      className="object-contain max-h-full w-auto rounded-lg shadow-2xl border border-white/10"
                    />
                  )}
                </div>
              ) : (
                !isGridExpanded ? (
                  <div className="flex flex-col items-center justify-center space-y-6">
                    <div
                      className="relative cursor-pointer group"
                      onClick={toggleGridView}
                    >
                      <div className="relative w-[260px] h-[260px] md:w-[380px] md:h-[380px]">
                        {filteredItems[selectedImageIndex].images?.slice(0, 3).map((img, index) => (
                          <div
                            key={index}
                            className="absolute inset-0 rounded-xl shadow-2xl overflow-hidden border-4 border-white transition-all duration-300"
                            style={{
                              transform: `translate(${index * 12}px, ${index * 12}px) rotate(${index * 2}deg)`,
                              zIndex: 3 - index,
                            }}
                          >
                            <img
                              src={img}
                              alt={`${filteredItems[selectedImageIndex].title} - ${index + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ))}

                        {filteredItems[selectedImageIndex].images && filteredItems[selectedImageIndex].images!.length > 3 && (
                          <div className="absolute -bottom-4 -right-4 bg-primary text-white rounded-full w-14 h-14 flex items-center justify-center text-lg font-bold shadow-lg border-4 border-white z-10">
                            +{filteredItems[selectedImageIndex].images!.length - 3}
                          </div>
                        )}
                      </div>

                      <div className="mt-8 bg-white/10 hover:bg-white/20 transition-all backdrop-blur-sm rounded-full px-6 py-3 border border-white/10 text-center">
                        <p className="text-white text-sm font-semibold flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                          Click to view all {filteredItems[selectedImageIndex].images?.length} images
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col p-4">
                    <div className="flex justify-between items-center mb-4 flex-shrink-0">
                      <h3 className="text-white font-semibold text-lg">Project Stack Gallery</h3>
                      <button
                        onClick={toggleGridView}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg px-4 py-2 transition-all border border-white/10 flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>Close Grid</span>
                      </button>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                      <div className="columns-1 sm:columns-2 gap-4 space-y-4">
                        {filteredItems[selectedImageIndex].images?.map((img, index) => (
                          <div
                            key={index}
                            className="relative break-inside-avoid rounded-xl overflow-hidden shadow-lg border border-white/10 hover:border-white/30 transition-all group mb-4"
                          >
                            <img
                              src={img}
                              alt={`${filteredItems[selectedImageIndex].title} - ${index + 1}`}
                              className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-white font-semibold text-sm">
                                Image {index + 1} of {filteredItems[selectedImageIndex].images?.length}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Right Column: Branded Sidebar Panel */}
            <div className="w-full md:w-[350px] lg:w-[400px] h-[40vh] md:h-full bg-primary text-white p-6 md:p-8 flex flex-col justify-between overflow-y-auto relative border-t md:border-t-0 md:border-l border-white/10">
              {/* Close Button inside Sidebar */}
              <button
                onClick={closeDialog}
                className="absolute top-4 right-4 z-30 bg-white/10 hover:bg-white/20 text-white rounded-full p-2.5 transition-all border border-white/20 shadow-md"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="pt-8">
                {/* Title */}
                <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight pr-8">
                  {filteredItems[selectedImageIndex].title}
                </h2>

                {/* Description */}
                {filteredItems[selectedImageIndex].description && (
                  <div className="mb-6 overflow-y-auto max-h-[25vh] md:max-h-[45vh] pr-2 custom-scrollbar">
                    <p className="text-white/90 text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                      {filteredItems[selectedImageIndex].description}
                    </p>
                  </div>
                )}

                {/* Categories */}
                <div className="mb-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-2">
                    Categories
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {filteredItems[selectedImageIndex].categories.map((category, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-white/15 text-white rounded-full text-xs font-medium border border-white/10"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar Footer */}
              <div className="border-t border-white/15 pt-4 flex justify-between items-center text-xs text-white/60 mt-auto">
                {filteredItems.length > 1 && (
                  <span>
                    {selectedImageIndex + 1} / {filteredItems.length}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
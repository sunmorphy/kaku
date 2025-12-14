'use client';

import { useState, useMemo, useEffect } from 'react';
import { Image } from '@imagekit/next';
import ScratchItem from '../components/ScratchItem';
import { getArtworks, getProjects, type Artwork, type Project } from '../lib/api';
import LoadingAnimation from '../components/LoadingAnimation';
import { devLog } from '../utils/utils';

interface ScratchItemData {
  id: number;
  title: string;
  categories: string[];
  image: string;
  images?: string[]; // For projects with multiple images
  description: string;
  type: 'artwork' | 'project';
}

export default function Scratch() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [selectedItemImageIndex, setSelectedItemImageIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [scratchData, setScratchData] = useState<ScratchItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch scratch artworks and projects using API filters
        const [artworks, projects] = await Promise.all([
          getArtworks(1, 1, 100, 'scratch'),
          getProjects(1, 1, 100, 'scratch')
        ]);

        // Combine both into unified data structure
        const scratchItems: ScratchItemData[] = [
          ...artworks.data.map((artwork: Artwork) => ({
            id: artwork.id,
            title: artwork.title,
            categories: artwork.artwork_categories?.map(cat => cat.category.name) || ['Uncategorized'],
            image: artwork.image_path,
            description: artwork.description || '',
            type: 'artwork' as const
          })),
          ...projects.data.map((project: Project) => ({
            id: project.id,
            title: project.title,
            categories: project.project_categories?.map(cat => cat.category.name) || ['Uncategorized'],
            image: project.batch_image_path?.[0] || '',
            images: project.batch_image_path || [],
            description: project.description || '',
            type: 'project' as const
          }))
        ];

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
    setSelectedItemImageIndex(0); // Reset to first image when opening
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
    setSelectedItemImageIndex(0); // Reset to first image when changing items
  };

  // Navigate within project images
  const navigateItemImage = (direction: 'prev' | 'next') => {
    if (selectedImageIndex === null) return;

    const currentItem = filteredItems[selectedImageIndex];
    const totalImages = currentItem.images?.length || 1;

    const newIndex = direction === 'prev'
      ? (selectedItemImageIndex - 1 + totalImages) % totalImages
      : (selectedItemImageIndex + 1) % totalImages;

    setSelectedItemImageIndex(newIndex);
  };

  // State for expanded grid view
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



      {/* Image Preview Dialog - Fullscreen with Glass Effect */}
      {isDialogOpen && selectedImageIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={closeDialog}>
          {/* Glass Effect Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-white-500/10 to-white-500/20" />
          <div className="absolute inset-0 backdrop-blur-3xl bg-black/30" />

          {/* Content Container */}
          <div className="relative z-10 w-full h-full flex items-center justify-center p-4 md:p-8" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={closeDialog}
              className="absolute top-4 right-4 md:top-8 md:right-8 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full p-3 transition-all shadow-lg border border-white/20"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Navigation Buttons */}
            {filteredItems.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); navigateImage('prev'); }}
                  className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full p-3 transition-all shadow-lg border border-white/20"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); navigateImage('next'); }}
                  className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full p-3 transition-all shadow-lg border border-white/20"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Main Content */}
            <div className="w-full max-w-6xl h-full flex flex-col items-center justify-center">
              {filteredItems[selectedImageIndex].type === 'artwork' ? (
                /* ARTWORK: Single Image View */
                <div className="flex flex-col items-center w-full h-full justify-center space-y-6">
                  <div className="flex-1 flex items-center justify-center w-full max-h-[70vh]">
                    <Image
                      urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
                      src={filteredItems[selectedImageIndex].image}
                      alt={filteredItems[selectedImageIndex].title}
                      width={1200}
                      height={800}
                      className="object-contain max-h-full w-auto rounded-lg shadow-2xl"
                    />
                  </div>

                  {/* Title and Description */}
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-2xl border border-white/20">
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                      {filteredItems[selectedImageIndex].title}
                    </h2>
                    {filteredItems[selectedImageIndex].description && (
                      <p className="text-white/90 text-base md:text-lg leading-relaxed">
                        {filteredItems[selectedImageIndex].description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {filteredItems[selectedImageIndex].categories.map((category, index) => (
                        <span key={index} className="px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium border border-white/30">
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* PROJECT: Layered Stack or Grid View */
                !isGridExpanded ? (
                  /* Layered Stack Preview */
                  <div className="flex flex-col items-center w-full h-full justify-center space-y-6">
                    <div
                      className="relative cursor-pointer group"
                      onClick={toggleGridView}
                    >
                      {/* Stack of Images */}
                      <div className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px]">
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

                        {/* Count Badge */}
                        {filteredItems[selectedImageIndex].images && filteredItems[selectedImageIndex].images!.length > 3 && (
                          <div className="absolute -bottom-4 -right-4 bg-primary text-white rounded-full w-16 h-16 flex items-center justify-center text-xl font-bold shadow-lg border-4 border-white z-10">
                            +{filteredItems[selectedImageIndex].images!.length - 3}
                          </div>
                        )}
                      </div>

                      {/* Click to Expand Hint */}
                      <div className="mt-8 bg-white/10 backdrop-blur-md rounded-full px-6 py-3 border border-white/20 group-hover:bg-white/20 transition-all">
                        <p className="text-white font-semibold flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          </svg>
                          Click to view all {filteredItems[selectedImageIndex].images?.length} images
                        </p>
                      </div>
                    </div>

                    {/* Title and Description */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-2xl border border-white/20">
                      <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                        {filteredItems[selectedImageIndex].title}
                      </h2>
                      {filteredItems[selectedImageIndex].description && (
                        <p className="text-white/90 text-base md:text-lg leading-relaxed">
                          {filteredItems[selectedImageIndex].description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {filteredItems[selectedImageIndex].categories.map((category, index) => (
                          <span key={index} className="px-3 py-1 bg-white/20 text-white rounded-full text-sm font-medium border border-white/30">
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Expanded Grid View - Scrollable */
                  <div className="w-full h-full flex flex-col">
                    {/* Header with Title and Back Button */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 mb-4 border border-white/20 flex-shrink-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                            {filteredItems[selectedImageIndex].title}
                          </h2>
                          {filteredItems[selectedImageIndex].description && (
                            <p className="text-white/90 text-sm md:text-base leading-relaxed">
                              {filteredItems[selectedImageIndex].description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {filteredItems[selectedImageIndex].categories.map((category, index) => (
                              <span key={index} className="px-3 py-1 bg-white/20 text-white rounded-full text-xs md:text-sm font-medium border border-white/30">
                                {category}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={toggleGridView}
                          className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-lg px-4 py-2 transition-all border border-white/20 flex items-center gap-2 flex-shrink-0"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          <span className="hidden md:inline">Close Grid</span>
                        </button>
                      </div>
                    </div>

                    {/* Scrollable Grid */}
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                      <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
                        {filteredItems[selectedImageIndex].images?.map((img, index) => (
                          <div
                            key={index}
                            className="relative break-inside-avoid rounded-xl overflow-hidden shadow-lg border-2 border-white/20 hover:border-white/40 transition-all group mb-4"
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

            {/* Item Counter */}
            {filteredItems.length > 1 && (
              <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full text-sm font-semibold border border-white/20">
                {selectedImageIndex + 1} / {filteredItems.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useMemo, useEffect } from 'react';
import { Image } from '@imagekit/next';
import ScratchItem from '../components/ScratchItem';

interface ScratchItemData {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
}

const scratchData: ScratchItemData[] = [
  {
    id: 'sketch-1',
    title: 'Morning Sketch',
    category: 'Sketches',
    image: '/kaku/sketch-1.png',
    description: 'Quick morning character sketch'
  },
  {
    id: 'study-1',
    title: 'Light Study',
    category: 'Studies',
    image: '/kaku/study-1.png',
    description: 'Practicing light and shadow'
  },
  {
    id: 'doodle-1',
    title: 'Coffee Doodle',
    category: 'Doodles',
    image: '/kaku/doodle-1.png',
    description: 'Doodle while drinking coffee'
  },
  {
    id: 'experiment-1',
    title: 'Color Experiment',
    category: 'Experiments',
    image: '/kaku/experiment-1.png',
    description: 'Experimenting with new color palettes'
  },
  {
    id: 'sketch-2',
    title: 'Character Expression',
    category: 'Sketches',
    image: '/kaku/sketch-2.png',
    description: 'Exploring different facial expressions'
  },
  {
    id: 'study-2',
    title: 'Anatomy Study',
    category: 'Studies',
    image: '/kaku/study-2.png',
    description: 'Hand anatomy practice'
  },
  {
    id: 'doodle-2',
    title: 'Random Creatures',
    category: 'Doodles',
    image: '/kaku/doodle-2.png',
    description: 'Random creature doodles'
  },
  {
    id: 'experiment-2',
    title: 'Style Test',
    category: 'Experiments',
    image: '/kaku/experiment-2.png',
    description: 'Testing different art styles'
  },
  {
    id: 'sketch-3',
    title: 'Environment Sketch',
    category: 'Sketches',
    image: '/kaku/sketch-3.png',
    description: 'Quick environment concept'
  },
  {
    id: 'study-3',
    title: 'Color Theory',
    category: 'Studies',
    image: '/kaku/study-3.png',
    description: 'Color harmony studies'
  },
  {
    id: 'doodle-3',
    title: 'Pattern Play',
    category: 'Doodles',
    image: '/kaku/doodle-3.png',
    description: 'Playing with patterns and shapes'
  },
  {
    id: 'experiment-3',
    title: 'Digital Texture',
    category: 'Experiments',
    image: '/kaku/experiment-3.png',
    description: 'Experimenting with digital textures'
  }
];

const categories = ['All', ...Array.from(new Set(scratchData.map(item => item.category)))];

export default function Scratch() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredItems = useMemo(() => {
    return scratchData.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesCategory;
    });
  }, [selectedCategory]);

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

  return (
    <div className="min-h-screen p-8">
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
                className={`px-4 py-2 rounded-full text-sm transition-colors ${
                  selectedCategory === category
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
              id={item.id}
              title={item.title}
              category={item.category}
              image={item.image}
              description={item.description}
              onClick={() => openDialog(index)}
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No items found in this category.</p>
          </div>
        )}
      </div>

      {/* Image Preview Dialog */}
      {isDialogOpen && selectedImageIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-full w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={closeDialog}
              className="absolute top-4 right-4 z-10 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Navigation Buttons */}
            {filteredItems.length > 1 && (
              <>
                <button
                  onClick={() => navigateImage('prev')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-3 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => navigateImage('next')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-full p-3 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  </button>
              </>
            )}

            {/* Main Image */}
            <div className="relative w-full h-full flex items-center justify-center">
              <div className="relative max-w-full max-h-full">
                <Image
                  urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
                  src={filteredItems[selectedImageIndex].image}
                  alt={filteredItems[selectedImageIndex].title}
                  width={800}
                  height={800}
                  className="object-contain max-w-full max-h-full"
                />
              </div>
            </div>

            {/* Image Info */}
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold mb-1">{filteredItems[selectedImageIndex].title}</h3>
                  <p className="text-gray-300 text-sm mb-1">{filteredItems[selectedImageIndex].category}</p>
                  <p className="text-gray-200 text-sm">{filteredItems[selectedImageIndex].description}</p>
                </div>
                <div className="text-right text-sm text-gray-300">
                  {selectedImageIndex + 1} / {filteredItems.length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
'use client';

import { useState, useMemo } from 'react';
import PortfolioItem from '../components/PortfolioItem';

interface PortfolioItemData {
  id: string;
  title: string;
  category: string;
  type: 'project' | 'artwork';
  image: string;
  description: string;
}

const portfolioData: PortfolioItemData[] = [
  {
    id: 'character-design-1',
    title: 'Fantasy Character Design',
    category: 'Character Design',
    type: 'artwork',
    image: '/kaku/character-1.png',
    description: 'Original fantasy character design with detailed armor and weapon concepts.'
  },
  {
    id: 'illustration-project-1',
    title: 'Book Cover Illustration',
    category: 'Illustration',
    type: 'project',
    image: '/kaku/book-cover-1.png',
    description: 'Commercial book cover illustration for fantasy novel.'
  },
  {
    id: 'concept-art-1',
    title: 'Environment Concept',
    category: 'Concept Art',
    type: 'artwork',
    image: '/kaku/environment-1.png',
    description: 'Fantasy landscape concept art with mystical elements.'
  },
  {
    id: 'character-design-2',
    title: 'Modern Character Study',
    category: 'Character Design',
    type: 'artwork',
    image: '/kaku/character-2.png',
    description: 'Contemporary character design with fashion elements.'
  },
  {
    id: 'game-assets-1',
    title: 'Mobile Game Assets',
    category: 'Game Art',
    type: 'project',
    image: '/kaku/game-assets-1.png',
    description: 'UI and character assets for mobile puzzle game.'
  },
  {
    id: 'illustration-2',
    title: 'Portrait Study',
    category: 'Illustration',
    type: 'artwork',
    image: '/kaku/portrait-1.png',
    description: 'Digital portrait with focus on lighting and texture.'
  }
];

const categories = ['All', ...Array.from(new Set(portfolioData.map(item => item.category)))];

export default function Portfolio() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    return portfolioData.filter(item => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm]);

  return (
    <div className="min-h-screen p-8">
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
        {filteredItems.map((item) => (
          <PortfolioItem
            key={item.id}
            id={item.id}
            title={item.title}
            category={item.category}
            type={item.type}
            image={item.image}
            description={item.description}
          />
        ))}

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No items found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
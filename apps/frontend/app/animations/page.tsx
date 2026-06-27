'use client';

import { useState, useMemo, useEffect } from 'react';
import Head from 'next/head';
import AnimationItem from '../components/AnimationItem';
import { getAnimations, type Animation } from '../lib/api';
import LoadingAnimation from '../components/LoadingAnimation';
import { devLog } from '../utils/utils';

interface AnimationItemData {
    id: number;
    title: string;
    description?: string | null;
    categories: string[];
    videos: string[];
}

export default function Animations() {
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [animationsData, setAnimationsData] = useState<AnimationItemData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchData() {
            try {
                setLoading(true);
                setError(null);

                // Fetch animations from API
                const animations = await getAnimations(1, 1, 100);

                const animationItems: AnimationItemData[] = animations.data.map((animation: Animation) => ({
                    id: animation.id,
                    title: animation.title,
                    description: animation.description,
                    categories: animation.animation_categories?.map(cat => cat.category.name) || ['Uncategorized'],
                    videos: animation.batch_video_path || []
                }));

                setAnimationsData(animationItems);
            } catch (err) {
                setError('Failed to load animations. Please try again later.');
                devLog('Error fetching animations:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, []);

    const categories = useMemo(() => {
        const allCategories = animationsData.flatMap(item => item.categories);
        return ['All', ...Array.from(new Set(allCategories))];
    }, [animationsData]);

    const filteredItems = useMemo(() => {
        return animationsData.filter(item => {
            const matchesCategory = selectedCategory === 'All' || item.categories.includes(selectedCategory);
            const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [animationsData, selectedCategory, searchTerm]);

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
            <Head>
                <title>Animations | Kaku</title>
                <meta name="description" content="Browse Kaku's animation portfolio featuring video projects." />
                <meta property="og:title" content="Kaku's Animations" />
                <meta property="og:description" content="Browse Kaku's animation portfolio featuring video projects." />
            </Head>
            <div className="min-h-screen p-8 animate-fade-in">
                <div className="mx-auto lg:w-3/5 w-full">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold mb-4">Animations</h1>

                        {/* Search */}
                        <div className="mb-6">
                            <input
                                type="text"
                                placeholder="Search animations..."
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

                    {/* Animations Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                        {filteredItems.map((item) => (
                            <AnimationItem
                                key={item.id}
                                id={item.id.toString()}
                                title={item.title}
                                description={item.description}
                                categories={item.categories}
                                videos={item.videos}
                            />
                        ))}
                    </div>

                    {filteredItems.length === 0 && !loading && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No animations found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

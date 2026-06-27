'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAnimation, type Animation } from '../../lib/api';
import LoadingAnimation from '../../components/LoadingAnimation';
import { devLog } from '@/app/utils/utils';

interface Props {
    params: Promise<{ id: string }>;
}

export default function AnimationDetail({ params }: Props) {
    const [animation, setAnimation] = useState<Animation | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);

    useEffect(() => {
        async function resolveParams() {
            const resolved = await params;
            setResolvedParams(resolved);
        }
        resolveParams();
    }, [params]);

    useEffect(() => {
        if (!resolvedParams) return;

        async function fetchData() {
            try {
                setLoading(true);
                setError(null);

                const animationData = await getAnimation(resolvedParams!!.id);

                if (animationData) {
                    setAnimation(animationData);
                } else {
                    setError('Animation not found');
                }
            } catch (err) {
                setError('Failed to load animation details');
                devLog('Error fetching animation details:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [resolvedParams]);

    if (loading) {
        return (
            <LoadingAnimation size={256} />
        );
    }

    if (error || !animation) {
        notFound();
    }

    return (
        <div className="min-h-screen p-8 animate-fade-in">
            <div className="mx-auto lg:w-3/5 w-full">
                {/* Back Button */}
                <Link href="/animations" className="inline-flex items-center text-primary hover:underline mb-8">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Animations
                </Link>

                {/* Content */}
                <div className="space-y-8 mb-8">
                    {/* Title and Meta */}
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className='flex flex-col space-y-4'>
                                <h1 className="text-4xl font-bold">{animation.title}</h1>
                                {/* Description */}
                                {animation.description && (
                                    <div>
                                        <p className="text-gray-700 leading-relaxed">{animation.description}</p>
                                    </div>
                                )}

                                {/* Categories */}
                                <div className="flex flex-wrap gap-2">
                                    {animation.animation_categories?.map((cat, index) => (
                                        <span
                                            key={`animation-cat-${cat.category.id || index}`}
                                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                                        >
                                            {cat.category.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className='flex flex-col items-end'>
                                <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
                                    <span>{new Date(animation.updated_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}</span>
                                </div>
                                <span className="text-sm px-3 py-1 bg-primary text-white rounded-full flex items-center gap-1">
                                    animation
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* All Videos */}
                <div className="space-y-8 mt-24">
                    {animation.batch_video_path.map((videoPath, index) => (
                        <div key={index} className="w-full rounded-lg overflow-hidden bg-gray-100 shadow-lg">
                            <video
                                src={videoPath}
                                controls
                                className="w-full h-auto"
                                preload="metadata"
                            >
                                Your browser does not support the video tag.
                            </video>
                            {animation.batch_video_path.length > 1 && (
                                <div className="p-4 bg-white border-t border-gray-200">
                                    <p className="text-sm text-gray-600">
                                        Video {index + 1} of {animation.batch_video_path.length}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

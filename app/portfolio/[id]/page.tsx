'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjects, getArtworks, type Project, type Artwork } from '../../lib/api';
import LoadingAnimation from '../../components/LoadingAnimation';
import { devLog } from '@/app/utils/utils';

interface Props {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ type?: string }>;
}

export default function PortfolioDetail({ params, searchParams }: Props) {
  const [item, setItem] = useState<(Project & { type: 'project' }) | (Artwork & { type: 'artwork' }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null);
  const [resolvedSearchParams, setResolvedSearchParams] = useState<{ type?: string } | null>(null);

  useEffect(() => {
    async function resolveParams() {
      const resolved = await params;
      const resolvedSearch = await searchParams;
      setResolvedParams(resolved);
      setResolvedSearchParams(resolvedSearch || {});
    }
    resolveParams();
  }, [params, searchParams]);

  useEffect(() => {
    if (!resolvedParams || !resolvedSearchParams) return;

    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        if (resolvedParams == null || resolvedSearchParams == null) {
          return;
        }

        const id = parseInt(resolvedParams.id);
        const type = resolvedSearchParams.type;

        if (type === 'project') {
          // Fetch only projects
          const projects = await getProjects();
          const project = projects.data.find(p => p.id === id);
          if (project) {
            setItem({ ...project, type: 'project' });
            return;
          }
        } else if (type === 'artwork') {
          // Fetch only artworks
          const artworks = await getArtworks();
          const artwork = artworks.data.find(a => a.id === id && a.type === 'portfolio');
          if (artwork) {
            setItem({ ...artwork, type: 'artwork' });
            return;
          }
        } else {
          // Fallback: search both if type not specified
          const [projects, artworks] = await Promise.all([
            getProjects(),
            getArtworks()
          ]);

          const project = projects.data.find(p => p.id === id);
          if (project) {
            setItem({ ...project, type: 'project' });
            return;
          }

          const artwork = artworks.data.find(a => a.id === id && a.type === 'portfolio');
          if (artwork) {
            setItem({ ...artwork, type: 'artwork' });
            return;
          }
        }

        // Not found
        setError('Item not found');
      } catch (err) {
        setError('Failed to load item details');
        devLog('Error fetching item details:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [resolvedParams, resolvedSearchParams]);

  if (loading) {
    return (
      <LoadingAnimation size={256} />
    );
  }

  if (error || !item) {
    notFound();
  }

  return (
    <div className="min-h-screen p-8 animate-fade-in">
      <div className="mx-auto lg:w-3/5 w-full">
        {/* Back Button */}
        <Link href="/portfolio" className="inline-flex items-center text-primary hover:underline mb-8">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Portfolio
        </Link>

        {/* Content */}
        <div className="space-y-8 mb-8">
          {/* Title and Meta */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className='flex flex-col space-y-4'>
                <h1 className="text-4xl font-bold">{item.title}</h1>
                {/* Description */}
                {item.description && (
                  <div>
                    <p className="text-gray-700 leading-relaxed">{item.description}</p>
                  </div>
                )}

                {/* Categories */}
                <div className="flex flex-wrap gap-2">
                  {item.type === 'project'
                    ? (item as Project & { type: 'project' }).project_categories?.map((cat, index) => (
                      <span
                        key={`project-cat-${cat.category.id || index}`}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {cat.category.name}
                      </span>
                    ))
                    : (item as Artwork & { type: 'artwork' }).artwork_categories?.map((cat, index) => (
                      <span
                        key={`artwork-cat-${cat.category.id || index}`}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        {cat.category.name}
                      </span>
                    ))
                  }
                </div>
              </div>
              <div className='flex flex-col items-end'>
                <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
                  <span>{new Date(item.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <span className="text-sm px-3 py-1 bg-primary text-white rounded-full">
                  {item.type}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* All Images */}
        <div className="space-y-8 mt-24">
          {item.type === 'project' ? (
            // Show all project images
            (item as Project & { type: 'project' }).batch_image_path?.map((imagePath, index) => (
              <div key={index} className="w-full rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={imagePath}
                  alt={`${item.title} - Image ${index + 1}`}
                  className="w-full h-auto object-contain"
                />
              </div>
            ))
          ) : (
            // Show single artwork image
            <div className="w-full rounded-lg overflow-hidden bg-gray-100">
              <img
                src={(item as Artwork & { type: 'artwork' }).image_path}
                alt={item.title}
                className="w-full h-auto object-contain"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { Image } from '@imagekit/next';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getProfile, type Profile } from './lib/api';
import { devLog } from './utils/utils';

// Lazy load the loading animation to reduce initial bundle
const LoadingAnimation = dynamic(() => import('./components/LoadingAnimation'), {
  ssr: false,
  loading: () => <div className="w-16 h-16 bg-gray-200 rounded animate-pulse" />
});

export default function Home() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const profileData = await getProfile();
        setProfile(profileData);
        
        // Preload banner image for better LCP
        if (profileData?.banner_image_path) {
          const img = new window.Image();
          img.src = profileData.banner_image_path;
        }
      } catch (error) {
        devLog('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    }

    // Start loading immediately
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <LoadingAnimation size={120} />
          <p className="mt-4 text-gray-600 text-sm">Loading portfolio...</p>
        </div>
      </div>
    );
  }
  return (
    <div className='min-h-screen relative animate-fade-in'>
      {/* Hero Section */}
      <div className='h-screen w-full relative overflow-hidden'>
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
            src={profile?.banner_image_path || "/kaku/rahma-dwin-my.jpg"}
            alt={`${profile?.pseudonym} - ${profile?.role}`}
            fill
            className='object-cover'
            priority
          />
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>

        {/* Content */}
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-8">
            <div className="max-w-2xl">
              <div className="mb-6">
                {loading ? (
                  <div className="flex items-center justify-center py-16">
                    <LoadingAnimation size={100} />
                  </div>
                ) : (
                  <>
                    <h1 className='text-5xl md:text-7xl font-bold text-white mb-4 leading-tight'>{profile?.pseudonym}</h1>
                    <p className='text-xl md:text-2xl text-gray-200 mb-2 tracking-wide'>{profile?.role}</p>
                    <p className='text-base md:text-lg text-gray-300 max-w-lg leading-relaxed'>{profile?.short_summary}</p>
                  </>
                )}
              </div>

              {/* Call to Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link
                  href="/portfolio"
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 text-center hover:scale-105"
                >
                  View Portfolio
                </Link>
                <Link
                  href="/about"
                  className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-3 rounded-lg font-semibold transition-all duration-300 text-center hover:scale-105"
                >
                  About Me
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

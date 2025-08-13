import { Image } from '@imagekit/next';
import Link from 'next/link';

export default function Home() {
  return (
    <div className='min-h-screen relative'>
      {/* Hero Section */}
      <div className='h-screen w-full relative overflow-hidden'>
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
            src="/kaku/rahma-dwin-my.jpg"
            alt="Rahma Dwin - 2D Artist"
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
                <h1 className='text-5xl md:text-7xl font-bold text-white mb-4 leading-tight'>
                  Rahma Dwin
                </h1>
                <p className='text-xl md:text-2xl text-gray-200 mb-2 tracking-wide'>
                  2D Artist
                </p>
                <p className='text-base md:text-lg text-gray-300 max-w-lg leading-relaxed'>
                  Bringing imaginative worlds to life through digital art, character design, and visual storytelling.
                </p>
              </div>

              {/* Call to Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link
                  href="/portfolio"
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-center"
                >
                  View Portfolio
                </Link>
                <Link
                  href="/about"
                  className="border-2 border-white text-white hover:bg-white hover:text-black px-8 py-3 rounded-lg font-semibold transition-colors text-center"
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

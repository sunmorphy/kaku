'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Image } from '@imagekit/next';
import Navigation from './Navigation';

export default function Header() {
  const pathname = usePathname();
  
  // Hide header on root page
  if (pathname === '/') {
    return null;
  }

  return (
    <div className="flex flex-col gap-8 w-full items-center p-8">
      <Link href="/" className="w-xs">
        <Image
          urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
          src="/kaku/kakushigoto3.png"
          alt="Logo"
          loading="lazy"
          width={3508}
          height={729}
          className="w-full h-full object-cover"
        />
      </Link>
      <Navigation />
    </div>
  );
}
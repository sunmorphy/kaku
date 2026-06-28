'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Navigation from './Navigation';

export default function Header() {
  const pathname = usePathname();

  if (pathname === '/') {
    return null;
  }

  return (
    <div className="flex flex-col gap-8 w-full items-center p-8">
      <Link href="/" className="w-full max-w-xl sm:max-w-2xl md:max-w-3xl lg:max-w-4xl">
        <Image
          src="https://kaku.andpuji27.workers.dev/kaku/kakushigoto.png"
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
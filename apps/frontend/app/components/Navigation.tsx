'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/portfolio', label: 'portfolio' },
    { href: '/animations', label: 'animations' },
    { href: '/artwork', label: 'artwork' },
    { href: '/about', label: 'about' }
  ];

  return (
    <nav className="flex gap-4 sm:gap-8 md:gap-12 justify-center w-full px-4 sm:px-0">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.href}
            className={`text-xs sm:text-sm tracking-wider sm:tracking-widest transition-colors relative ${isActive
              ? 'text-primary font-medium'
              : 'hover:text-primary'
              }`}
            href={item.href}
          >
            {item.label}
            {isActive && (
              <div className="absolute -bottom-2 left-0 right-0 h-0.5 bg-primary"></div>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
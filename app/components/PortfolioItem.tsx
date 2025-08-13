import { Image } from '@imagekit/next';
import Link from 'next/link';

interface PortfolioItemProps {
  id: string;
  title: string;
  category: string;
  type: 'project' | 'artwork';
  image: string;
  description: string;
}

export default function PortfolioItem({ id, title, category, type, image, description }: PortfolioItemProps) {
  return (
    <Link key={id} href={`/portfolio/${id}`}>
      <div className="group cursor-pointer">
        <div className="relative w-full h-96 overflow-hidden rounded-lg bg-gray-100">
          <Image
            urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
            src={image}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300" />
        </div>
        <div className="mt-4 mb-12">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xl font-semibold group-hover:text-primary transition-colors">
              {title}
            </h3>
            <span className="text-sm px-2 py-1 bg-gray-100 rounded-full text-gray-600">
              {type}
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-2">{category}</p>
          <p className="text-gray-700">{description}</p>
        </div>
      </div>
    </Link>
  );
}
import { Image } from '@imagekit/next';

interface PersonalItemProps {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  onClick: () => void;
}

export default function PersonalItem({ id, title, category, image, description, onClick }: PersonalItemProps) {
  return (
    <div key={id} className="group cursor-pointer" onClick={onClick}>
      <div className="relative w-full aspect-square overflow-hidden rounded-lg bg-gray-100">
        <Image
          urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
          src={image}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300" />
        
        {/* Hover Overlay with Title and Category */}
        <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h3 className="text-white text-lg font-semibold mb-1">
            {title}
          </h3>
          <p className="text-gray-200 text-sm">
            {category}
          </p>
        </div>
      </div>
    </div>
  );
}
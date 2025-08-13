import { Image } from '@imagekit/next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  type: 'project' | 'artwork';
  image: string;
  description: string;
  detailedDescription: string;
  techniques: string[];
  year: string;
  client?: string;
  duration?: string;
}

const portfolioData: PortfolioItem[] = [
  {
    id: 'character-design-1',
    title: 'Fantasy Character Design',
    category: 'Character Design',
    type: 'artwork',
    image: '/kaku/character-1.png',
    description: 'Original fantasy character design with detailed armor and weapon concepts.',
    detailedDescription: 'This fantasy character design explores the intersection of traditional armor design with magical elements. The character features intricate plate armor with mystical engravings and a weapon that channels elemental powers. The design process involved extensive research into medieval armor construction while incorporating fantastical elements to create a believable yet magical warrior.',
    techniques: ['Digital Painting', 'Concept Sketching', 'Color Theory', 'Anatomy Study'],
    year: '2024',
    duration: '2 weeks'
  },
  {
    id: 'illustration-project-1',
    title: 'Book Cover Illustration',
    category: 'Illustration',
    type: 'project',
    image: '/kaku/book-cover-1.png',
    description: 'Commercial book cover illustration for fantasy novel.',
    detailedDescription: 'Created for an upcoming fantasy novel, this book cover illustration captures the essence of the story while appealing to the target audience. The composition focuses on dramatic lighting and atmospheric elements to convey the mysterious and adventurous tone of the book. Close collaboration with the publisher ensured the design met commercial requirements while maintaining artistic integrity.',
    techniques: ['Digital Illustration', 'Composition Design', 'Typography Integration', 'Market Research'],
    year: '2024',
    client: 'Mystical Tales Publishing',
    duration: '3 weeks'
  },
  {
    id: 'concept-art-1',
    title: 'Environment Concept',
    category: 'Concept Art',
    type: 'artwork',
    image: '/kaku/environment-1.png',
    description: 'Fantasy landscape concept art with mystical elements.',
    detailedDescription: 'An expansive fantasy landscape that serves as a foundation for world-building. This concept art explores different lighting conditions, atmospheric perspective, and the relationship between natural and magical elements in the environment. The piece demonstrates various techniques for creating depth and mood in digital landscapes.',
    techniques: ['Environment Design', 'Atmospheric Perspective', 'Digital Matte Painting', 'World Building'],
    year: '2024',
    duration: '1 week'
  },
  {
    id: 'character-design-2',
    title: 'Modern Character Study',
    category: 'Character Design',
    type: 'artwork',
    image: '/kaku/character-2.png',
    description: 'Contemporary character design with fashion elements.',
    detailedDescription: 'A modern character study that blends contemporary fashion with character design principles. This piece explores how clothing choices, posture, and styling can communicate personality and background. The design incorporates current fashion trends while maintaining timeless character design fundamentals.',
    techniques: ['Fashion Illustration', 'Character Development', 'Style Studies', 'Color Harmony'],
    year: '2024',
    duration: '1 week'
  },
  {
    id: 'game-assets-1',
    title: 'Mobile Game Assets',
    category: 'Game Art',
    type: 'project',
    image: '/kaku/game-assets-1.png',
    description: 'UI and character assets for mobile puzzle game.',
    detailedDescription: 'Complete asset package for a mobile puzzle game, including UI elements, character designs, and environmental assets. The art style was developed to be colorful and appealing while maintaining clarity at small screen sizes. All assets were optimized for mobile performance while preserving visual quality.',
    techniques: ['UI Design', 'Mobile Optimization', 'Asset Creation', 'Style Guide Development'],
    year: '2023',
    client: 'Puzzle Games Studio',
    duration: '6 weeks'
  },
  {
    id: 'illustration-2',
    title: 'Portrait Study',
    category: 'Illustration',
    type: 'artwork',
    image: '/kaku/portrait-1.png',
    description: 'Digital portrait with focus on lighting and texture.',
    detailedDescription: 'A detailed digital portrait study focusing on realistic lighting and skin texture. This piece explores advanced digital painting techniques including subsurface scattering, realistic hair rendering, and complex lighting setups. The study serves as both a technical exercise and an artistic expression.',
    techniques: ['Digital Portraiture', 'Lighting Studies', 'Texture Painting', 'Anatomy'],
    year: '2024',
    duration: '4 days'
  }
];

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PortfolioDetail({ params }: Props) {
  const { id } = await params;
  const item = portfolioData.find(item => item.id === id);

  if (!item) {
    notFound();
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto lg:w-3/5 w-full">
        {/* Back Button */}
        <Link href="/portfolio" className="inline-flex items-center text-primary hover:underline mb-8">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Portfolio
        </Link>

        {/* Main Image */}
        <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden bg-gray-100">
          <Image
            urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
            src={item.image}
            alt={item.title}
            fill
            className="object-cover"
          />
        </div>

        {/* Content */}
        <div className="space-y-8">
          {/* Title and Meta */}
          <div>
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-4xl font-bold">{item.title}</h1>
              <span className="text-sm px-3 py-1 bg-primary text-white rounded-full">
                {item.type}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
              <span><strong>Category:</strong> {item.category}</span>
              <span><strong>Year:</strong> {item.year}</span>
              {item.duration && <span><strong>Duration:</strong> {item.duration}</span>}
              {item.client && <span><strong>Client:</strong> {item.client}</span>}
            </div>
          </div>

          {/* Description */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">About This {item.type === 'project' ? 'Project' : 'Artwork'}</h2>
            <p className="text-gray-700 leading-relaxed">{item.detailedDescription}</p>
          </div>

          {/* Techniques */}
          <div>
            <h2 className="text-2xl font-semibold mb-4">Techniques & Skills</h2>
            <div className="flex flex-wrap gap-2">
              {item.techniques.map((technique) => (
                <span
                  key={technique}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {technique}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
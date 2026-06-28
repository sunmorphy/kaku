import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProject } from '../../lib/api';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const project = await getProject(slug);
  if (project) {
    return {
      title: `${project.title} | Rahma Dwin`,
      description: project.description || `View ${project.title} on Rahma Dwin's portfolio.`,
      openGraph: {
        title: `${project.title} | Rahma Dwin`,
        description: project.description || `View ${project.title} on Rahma Dwin's portfolio.`,
        images: project.cover_image_path || (project.batch_image_path?.[0]) || '',
      }
    };
  }

  return {
    title: 'Project Details | Rahma Dwin',
    description: "Rahma Dwin's portfolio."
  };
}

export default async function PortfolioDetail({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const project = await getProject(slug);

  if (!project) {
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
                <h1 className="text-4xl font-bold">{project.title}</h1>
                {project.description && (
                  <div>
                    <p className="text-gray-700 leading-relaxed">{project.description}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {project.project_categories?.map((cat, index) => (
                    <span
                      key={`project-cat-${cat.category.id || index}`}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {cat.category.name}
                    </span>
                  ))}
                </div>
              </div>
              <div className='flex flex-col items-end'>
                <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
                  <span>{new Date(project.updated_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <span className="text-sm px-3 py-1 bg-primary text-white rounded-full">
                  project
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="space-y-8 mt-24">
          {/* Cover Image */}
          {project.cover_image_path && (
            <div className="w-full rounded-lg overflow-hidden bg-gray-100">
              <img
                src={project.cover_image_path}
                alt={`${project.title} - Cover`}
                className="w-full h-auto object-contain"
              />
            </div>
          )}
          {/* Project Images */}
          {project.batch_image_path?.map((imagePath, index) => (
            <div key={index} className="w-full rounded-lg overflow-hidden bg-gray-100">
              <img
                src={imagePath}
                alt={`${project.title} - Image ${index + 1}`}
                className="w-full h-auto object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
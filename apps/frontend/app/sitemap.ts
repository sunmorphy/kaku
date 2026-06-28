import { MetadataRoute } from 'next'
import { getProjects, getAnimations } from './lib/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rahmadwin.art'

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/artwork`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  try {
    // Fetch all projects (up to 100)
    const projectsResponse = await getProjects(1, 1, 100)
    const projects = projectsResponse.data || []

    // Fetch all animations (up to 100)
    const animationsResponse = await getAnimations(1, 1, 100)
    const animations = animationsResponse.data || []

    const projectEntries: MetadataRoute.Sitemap = projects.map((project) => ({
      url: `${baseUrl}/portfolio/${project.slug}`,
      lastModified: new Date(project.updated_at || project.created_at || new Date()),
      changeFrequency: 'monthly',
      priority: 0.8,
    }))

    const animationEntries: MetadataRoute.Sitemap = animations.map((animation) => ({
      url: `${baseUrl}/animations/${animation.slug}`,
      lastModified: new Date(animation.updated_at || animation.created_at || new Date()),
      changeFrequency: 'monthly',
      priority: 0.8,
    }))

    return [...staticEntries, ...projectEntries, ...animationEntries]
  } catch (error) {
    console.error('Failed to generate dynamic sitemap entries:', error)
    return staticEntries
  }
}
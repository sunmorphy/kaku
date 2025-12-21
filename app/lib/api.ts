import { devLog } from "../utils/utils";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://mengbe.vercel.app/api';

export interface Project {
  id: number;
  title: string;
  description: string | null;
  batch_image_path: string[];
  type: string;
  published: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
  project_categories: ProjectCategory[];
}

export interface ProjectCategory {
  id: number;
  project_id: number;
  category_id: number;
  category: {
    id: number;
    name: string;
    user_id: number;
    created_at: string;
    updated_at: string;
  };
}

export interface Artwork {
  id: number;
  title: string;
  description: string | null;
  image_path: string;
  type: string;
  published: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
  artwork_categories: ArtworkCategory[];
}

export interface ArtworkCategory {
  id: number;
  artwork_id: number;
  category_id: number;
  category: {
    id: number;
    name: string;
    user_id: number;
    created_at: string;
    updated_at: string;
  };
}

export interface Animation {
  id: number;
  title: string;
  description: string | null;
  batch_video_path: string[];
  published: boolean;
  user_id: number;
  created_at: string;
  updated_at: string;
  animation_categories: AnimationCategory[];
}

export interface AnimationCategory {
  id: number;
  animation_id: number;
  category_id: number;
  category: {
    id: number;
    name: string;
    user_id: number;
    created_at: string;
    updated_at: string;
  };
}

export interface Profile {
  id: number;
  username: string;
  email?: string;
  name: string;
  pseudonym: string;
  role: string;
  summary: string;
  short_summary: string;
  socials: string[];
  profile_image_path: string;
  banner_image_path: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi(endpoint: string, options?: RequestInit): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      // If JSON parsing fails, throw a generic error
      throw new ApiError(`API response parsing failed: ${response.statusText}`, response.status);
    }

    if (!response.ok) {
      // Parse error message from API response
      const errorMessage = data?.error || `API request failed: ${response.statusText}`;
      throw new ApiError(errorMessage, response.status);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getProjects(userId = 1, page = 1, limit = 25, type?: string): Promise<PaginatedResponse<Project>> {
  try {
    let url = `/projects/user/${userId}?page=${page}&limit=${limit}`;
    if (type) {
      url += `&type=${type}`;
    }
    const data = await fetchApi(url);
    return data;
  } catch (error) {
    devLog('Failed to fetch projects:', error);
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 25,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }
}

export async function getProject(id: string): Promise<Project | null> {
  try {
    const data = await fetchApi(`/projects/${id}`);
    return data;
  } catch (error) {
    devLog(`Failed to fetch project ${id}:`, error);
    return null;
  }
}

export async function getArtworks(userId = 1, page = 1, limit = 25, type?: string): Promise<PaginatedResponse<Artwork>> {
  try {
    let url = `/artworks/user/${userId}?page=${page}&limit=${limit}`;
    if (type) {
      url += `&type=${type}`;
    }
    const data = await fetchApi(url);
    return data;
  } catch (error) {
    devLog('Failed to fetch artworks:', error);
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 25,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }
}

export async function getArtwork(id: string): Promise<Artwork | null> {
  try {
    const data = await fetchApi(`/artworks/${id}`);
    return data;
  } catch (error) {
    devLog(`Failed to fetch artwork ${id}:`, error);
    return null;
  }
}

export async function getAnimations(userId = 1, page = 1, limit = 25): Promise<PaginatedResponse<Animation>> {
  try {
    const url = `/animations/user/${userId}?page=${page}&limit=${limit}`;
    const data = await fetchApi(url);
    return data;
  } catch (error) {
    devLog('Failed to fetch animations:', error);
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 25,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }
}

export async function getAnimation(id: string): Promise<Animation | null> {
  try {
    const data = await fetchApi(`/animations/${id}`);
    return data;
  } catch (error) {
    devLog(`Failed to fetch animation ${id}:`, error);
    return null;
  }
}

export async function getProfile(userId = 1): Promise<Profile | null> {
  try {
    const data = await fetchApi(`/auth/profile/${userId}`);
    return data;
  } catch (error) {
    devLog('Failed to fetch profile:', error);
    return null;
  }
}

export async function getCategories(userId = 1): Promise<Category[]> {
  try {
    const data = await fetchApi(`/categories/user/${userId}`);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    devLog('Failed to fetch categories:', error);
    return [];
  }
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  honeypot: string;
}

export interface ContactResponse {
  message: string;
  success: boolean;
}

export async function submitContactForm(formData: ContactFormData): Promise<ContactResponse> {
  try {
    const data = await fetchApi('/auth/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });
    return data;
  } catch (error) {
    devLog('Failed to submit contact form:', error);
    throw error;
  }
}
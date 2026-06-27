export interface User {
  id: number;
  username: string;
  email: string;
  name?: string;
  pseudonym?: string;
  role?: string;
  short_summary?: string;
  summary?: string;
  socials?: string[];
  profile_image_path?: string;
  banner_image_path?: string;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  name?: string;
  pseudonym?: string;
  role?: string;
  summary?: string;
  short_summary?: string;
  socials?: string[];
  profile_image_path?: string;
  banner_image_path?: string;
  created_at: string;
  updated_at: string;
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
  user_id?: number;
  created_at: string;
  updated_at: string;
}

export interface Artwork {
  id: number;
  image_path: string;
  title?: string;
  description?: string | null;
  type: string;
  published: boolean;
  user_id?: number;
  created_at: string;
  updated_at: string;
  slug?: string | null;
  artwork_categories?: { category: Category }[];
}

export interface ArtworkCategory {
  id: number;
  artwork_id: number;
  category_id: number;
  category: Category;
}

export interface Project {
  id: number;
  batch_image_path: string[];
  title: string;
  description?: string | null;
  type: string;
  published: boolean;
  user_id?: number;
  created_at: string;
  updated_at: string;
  slug?: string | null;
  cover_image_path?: string | null;
  project_categories?: { category: Category }[];
}

export interface ProjectCategory {
  id: number;
  project_id: number;
  category_id: number;
  category: Category;
}

export interface Animation {
  id: number;
  batch_video_path: string[];
  title: string;
  description?: string | null;
  published: boolean;
  user_id?: number;
  created_at: string;
  updated_at: string;
  slug?: string | null;
  cover_image_path?: string | null;
  animation_categories?: { category: Category }[];
}

export interface AnimationCategory {
  id: number;
  animation_id: number;
  category_id: number;
  category: Category;
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

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  created_at: string;
}

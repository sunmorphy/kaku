import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import axios, { AxiosRequestConfig, AxiosError } from "axios"
import Compressor from "compressorjs";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_BASE_URL,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('cms_active_section')
      throw new Error('Authentication expired')
    }
    throw error
  }
)

export async function apiRequest<T>(
  endpoint: string,
  options?: {
    method?: string
    body?: unknown
    headers?: Record<string, string>
  }
): Promise<T> {
  try {
    const config: AxiosRequestConfig = {
      method: (options?.method?.toLowerCase() as 'get' | 'post' | 'put' | 'delete' | 'patch') || 'get',
      url: endpoint,
      headers: options?.headers,
    }

    if (options?.body) {
      if (options.body instanceof FormData) {
        config.data = options.body
      } else if (typeof options.body === 'string') {
        config.data = JSON.parse(options.body)
        config.headers = { ...config.headers, 'Content-Type': 'application/json' }
      } else {
        config.data = options.body
        config.headers = { ...config.headers, 'Content-Type': 'application/json' }
      }
    }

    const response = await api(config)
    return response.data
  } catch (error) {
    if (error instanceof Error && error.message === 'Authentication expired') {
      throw error
    }

    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error || error.response?.data?.message || error.message
      throw new Error(message)
    }

    throw new Error('Request failed')
  }
}

export const compressImage = (image: File): Promise<File | Blob> => {
  return new Promise((resolve, reject) => {
    new Compressor(image, {
      quality: 0.5,
      success(result) {
        resolve(result);
      },
      error(err) {
        console.log(err.message);
        resolve(image);
      },
    });
  });
};

export const compressVideo = (video: File): Promise<File | Blob> => {
  return Promise.resolve(video);
};
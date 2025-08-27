// Environment Variables Helper
// This file centralizes environment variable access and provides type safety

export const env = {
  // ImageKit Configuration
  imageKit: {
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
  },
  
  // App Configuration
  nodeEnv: process.env.NODE_ENV || 'development'
} as const;

// Type-safe environment variable getter with validation
export function getEnvVar(name: string, defaultValue?: string): string {
  const value = process.env[name];
  
  if (!value && !defaultValue) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  
  return value || defaultValue || '';
}

// Validate required environment variables
export function validateEnv() {
  const required = [
    'NODE_ENV',
    'NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT'
  ];
  
  const missing = required.filter(name => !process.env[name]);
  
  if (missing.length > 0) {
    console.warn('Missing environment variables:', missing.join(', '));
    console.warn('Please check your .env.local file');
  }
}

export default env;
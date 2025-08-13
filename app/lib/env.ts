// Environment Variables Helper
// This file centralizes environment variable access and provides type safety

export const env = {
  // Next.js Configuration
  nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  
  // ImageKit Configuration
  imageKit: {
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/4o6binhtw',
  },
  
  // Email Configuration
  email: {
    from: process.env.EMAIL_FROM || 'noreply@aakushigoto.art',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
    },
  },
  
  // App Configuration
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Helper functions
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
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
# Environment Variables Setup

This document explains how to set up environment variables for the Kaku portfolio project.

## Quick Start

1. **Copy the example file:**
   ```bash
   cp .env.example .env.local
   ```

2. **Fill in your actual values** in `.env.local`

3. **Restart your development server** after making changes

## Environment Files

| File | Purpose | Committed to Git |
|------|---------|------------------|
| `.env.example` | Template with dummy values | ✅ Yes |
| `.env.local` | Local development secrets | ❌ No |
| `.env.development.local` | Development-specific overrides | ❌ No |
| `.env.production.local` | Production-specific overrides | ❌ No |

## Required Variables

### ImageKit Configuration
```bash
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your-id
IMAGEKIT_PRIVATE_KEY=private_your-private-key
IMAGEKIT_PUBLIC_KEY=public_your-public-key
```

### Authentication
```bash
NEXTAUTH_SECRET=your-random-secret-key
# Generate with: openssl rand -base64 32
```

## Optional Variables

### Database
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/kaku_portfolio
```

### Email (for contact forms)
```bash
EMAIL_FROM=noreply@yourdomain.com
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Social Media
```bash
INSTAGRAM_URL=https://instagram.com/yourusername
BEHANCE_URL=https://behance.net/yourusername
EMAIL_CONTACT=your-contact@email.com
```

## Usage in Code

### Import the env helper:
```typescript
import { env } from '@/lib/env';

// Use environment variables
const endpoint = env.imageKit.urlEndpoint;
const isDev = env.isDevelopment;
```

### For client-side variables:
```typescript
// Only NEXT_PUBLIC_ variables are available in the browser
const publicEndpoint = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;
```

### Validate environment variables:
```typescript
import { validateEnv } from '@/lib/env';

// Call this in your app startup
validateEnv();
```

## Security Best Practices

1. **Never commit `.env.local`** - it contains secrets
2. **Use strong secrets** - generate random keys for production
3. **Rotate secrets regularly** - especially in production
4. **Limit access** - only give env variables to those who need them
5. **Use NEXT_PUBLIC_** prefix only for non-sensitive client-side variables

## Deployment

### Vercel
Add environment variables in your Vercel dashboard:
- Go to Project Settings → Environment Variables
- Add each variable from your `.env.local`

### Other Platforms
Check your platform's documentation for setting environment variables.

## Troubleshooting

### Variables not loading?
1. Restart your development server
2. Check variable names (case-sensitive)
3. Ensure no spaces around `=`
4. Check `.env.local` is in the project root

### Client-side variables undefined?
- Make sure they start with `NEXT_PUBLIC_`
- Restart the dev server after adding new public variables

## Example Values for Development

```bash
# Safe development values (not for production!)
NEXTAUTH_SECRET=development-secret-key-123
IMAGEKIT_PRIVATE_KEY=private_dev_key_example
IMAGEKIT_PUBLIC_KEY=public_dev_key_example
DATABASE_URL=postgresql://localhost:5432/kaku_dev
```

Remember to replace these with real values for production! 🔐
import { devLog } from '@/app/utils/utils';
import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory rate limiter
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 3; // Max 3 attempts per 15 minutes

// Contact form data interface
interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  honeypot: string; // Honeypot field - should always be empty for legitimate users
}

// Validate form data
function validateFormData(data: unknown): data is ContactFormData {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  const formData = data as Record<string, unknown>;
  
  return (
    typeof formData.name === 'string' &&
    typeof formData.email === 'string' &&
    typeof formData.subject === 'string' &&
    typeof formData.message === 'string' &&
    typeof formData.honeypot === 'string' &&
    formData.name.trim().length > 0 &&
    formData.email.trim().length > 0 &&
    formData.subject.trim().length > 0 &&
    formData.message.trim().length > 0 &&
    formData.email.includes('@')
  );
}

// Rate limiting function
function checkRateLimit(clientIP: string): { allowed: boolean; resetTime?: number } {
  const now = Date.now();
  const clientData = rateLimit.get(clientIP);

  // Clean up expired entries
  if (clientData && now > clientData.resetTime) {
    rateLimit.delete(clientIP);
  }

  const current = rateLimit.get(clientIP);

  if (!current) {
    // First request from this IP
    rateLimit.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true };
  }

  if (current.count >= MAX_ATTEMPTS) {
    // Rate limit exceeded
    return { allowed: false, resetTime: current.resetTime };
  }

  // Increment count
  current.count += 1;
  rateLimit.set(clientIP, current);
  return { allowed: true };
}

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return 'unknown';
}

// Validate honeypot - if filled, it's likely a bot
function validateHoneypot(honeypot: string): { valid: boolean; error?: string } {
  if (honeypot.trim()) {
    return { valid: false, error: 'Bot detected. Access denied.' };
  }
  return { valid: true };
}


// POST handler for contact form
export async function POST(request: NextRequest) {
  try {
    // Check rate limiting
    const clientIP = getClientIP(request);
    const rateLimitResult = checkRateLimit(clientIP);
    
    if (!rateLimitResult.allowed) {
      const resetTime = rateLimitResult.resetTime;
      const waitTime = resetTime ? Math.ceil((resetTime - Date.now()) / 1000 / 60) : 15;
      
      return NextResponse.json(
        { 
          error: `Too many attempts. Please try again in ${waitTime} minutes.`,
          rateLimited: true
        },
        { status: 429 }
      );
    }

    // Parse form data
    const body = await request.json();
    
    // Validate form data
    if (!validateFormData(body)) {
      return NextResponse.json(
        { error: 'Invalid form data. Please fill in all fields with valid information.' },
        { status: 400 }
      );
    }

    const { name, email, subject, message, honeypot } = body;

    // Validate honeypot - if filled, it's likely a bot
    const honeypotResult = validateHoneypot(honeypot);
    if (!honeypotResult.valid) {
      // Log bot attempt for monitoring
      console.warn(`Bot detected from IP ${clientIP}: honeypot filled with "${honeypot}"`);
      return NextResponse.json(
        { error: honeypotResult.error || 'Invalid request detected.' },
        { status: 400 }
      );
    }

    // Additional server-side validation for suspicious patterns
    const suspiciousPatterns = [
      /https?:\/\/[^\s]+/gi, // URLs in message
      /<[^>]*>/g, // HTML tags
      /\b(viagra|casino|lottery|winner|congratulations|click here|free money)\b/gi
    ];

    const messageContent = `${subject} ${message}`.toLowerCase();
    if (suspiciousPatterns.some(pattern => pattern.test(messageContent))) {
      return NextResponse.json(
        { error: 'Message contains suspicious content. Please review and try again.' },
        { status: 400 }
      );
    }

    // Log contact form submission (backend handles actual email sending)
    devLog('Contact form submission received:', {
      name,
      email,
      subject,
      message: message.substring(0, 100) + '...', // Log truncated message for privacy
      timestamp: new Date().toISOString(),
      ip: clientIP
    })

    return NextResponse.json(
      { 
        message: 'Message sent successfully! Thank you for reaching out.',
        success: true 
      },
      { status: 200 }
    );

  } catch (error) {
    devLog('Contact form error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process message. Please try again later or contact directly via email.',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    );
  }
}

// GET handler (optional - for testing)
export async function GET() {
  return NextResponse.json(
    { 
      message: 'Contact API endpoint is working',
      timestamp: new Date().toISOString(),
      rateLimiting: 'Active',
      honeypotProtection: 'Active',
      spamFiltering: 'Active'
    },
    { status: 200 }
  );
}
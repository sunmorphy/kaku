import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { env } from '@/lib/env';

// Contact form data interface
interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

// Validate form data
function validateFormData(data: any): data is ContactFormData {
  return (
    data &&
    typeof data.name === 'string' &&
    typeof data.email === 'string' &&
    typeof data.subject === 'string' &&
    typeof data.message === 'string' &&
    data.name.trim().length > 0 &&
    data.email.trim().length > 0 &&
    data.subject.trim().length > 0 &&
    data.message.trim().length > 0 &&
    data.email.includes('@')
  );
}

// Create email transporter
function createTransporter() {
  if (!env.email.smtp.user || !env.email.smtp.password) {
    throw new Error('Email configuration missing. Please check your environment variables.');
  }

  return nodemailer.createTransporter({
    host: env.email.smtp.host,
    port: env.email.smtp.port,
    secure: env.email.smtp.port === 465, // true for 465, false for other ports
    auth: {
      user: env.email.smtp.user,
      pass: env.email.smtp.password,
    },
  });
}

// POST handler for contact form
export async function POST(request: NextRequest) {
  try {
    // Parse form data
    const body = await request.json();
    
    // Validate form data
    if (!validateFormData(body)) {
      return NextResponse.json(
        { error: 'Invalid form data. Please fill in all fields with valid information.' },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = body;

    // Create email transporter
    const transporter = createTransporter();

    // Email content
    const emailContent = {
      from: env.email.from,
      to: env.social.email, // Send to your contact email
      replyTo: email, // Allow replying to the sender
      subject: `Portfolio Contact: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3D71BD; border-bottom: 2px solid #3D71BD; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 5px;">Contact Information:</h3>
            <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #333; margin-bottom: 10px;">Message:</h3>
            <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #3D71BD; border-radius: 4px;">
              ${message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
            <p>This message was sent from the contact form on your portfolio website.</p>
            <p>Sent on: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
      text: `
        New Contact Form Submission
        
        Name: ${name}
        Email: ${email}
        Subject: ${subject}
        
        Message:
        ${message}
        
        Sent on: ${new Date().toLocaleString()}
      `,
    };

    // Send email
    await transporter.sendMail(emailContent);

    return NextResponse.json(
      { 
        message: 'Message sent successfully! Thank you for reaching out.',
        success: true 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to send message. Please try again later or contact directly via email.',
        details: env.isDevelopment ? (error as Error).message : undefined
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
      emailConfigured: !!(env.email.smtp.user && env.email.smtp.password)
    },
    { status: 200 }
  );
}
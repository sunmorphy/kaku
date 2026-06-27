import nodemailer from 'nodemailer';

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
}

export interface ContactEmailData {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export async function createEmailTransporter(): Promise<nodemailer.Transporter> {
  const config: EmailConfig = {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || ''
  };

  if (!config.host || !config.user || !config.password) {
    throw new Error('SMTP configuration is incomplete. Please check environment variables.');
  }

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.password
    }
  });

  return transporter;
}

export async function sendContactEmail(contactData: ContactEmailData): Promise<void> {
  const transporter = await createEmailTransporter();
  
  const recipientEmail = process.env.CONTACT_RECIPIENT_EMAIL || process.env.SMTP_USER;
  if (!recipientEmail) {
    throw new Error('No recipient email configured for contact form');
  }

  const mailOptions = {
    from: `"${contactData.name}" <${process.env.SMTP_USER}>`, // sender address
    to: recipientEmail, // list of receivers
    replyTo: contactData.email, // reply to the sender
    subject: contactData.subject || `New Contact Form Message from ${contactData.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
          New Contact Form Submission
        </h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Name:</strong> ${contactData.name}</p>
          <p><strong>Email:</strong> ${contactData.email}</p>
          ${contactData.subject ? `<p><strong>Subject:</strong> ${contactData.subject}</p>` : ''}
          <p><strong>Submitted:</strong> ${new Date().toLocaleString('id-ID')}</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px;">
          <h3 style="color: #495057; margin-top: 0;">Message:</h3>
          <p style="white-space: pre-wrap; line-height: 1.6;">${contactData.message}</p>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #d1ecf1; border-radius: 5px;">
          <p style="margin: 0; font-size: 14px; color: #0c5460;">
            <strong>Reply Instructions:</strong> Click reply to respond directly to ${contactData.email}
          </p>
        </div>
      </div>
    `,
    text: `
New Contact Form Submission

Name: ${contactData.name}
Email: ${contactData.email}
${contactData.subject ? `Subject: ${contactData.subject}` : ''}
Submitted: ${new Date().toLocaleString()}

Message:
${contactData.message}

Reply to this email to respond directly to ${contactData.email}
    `
  };

  await transporter.sendMail(mailOptions);
}
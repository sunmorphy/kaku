'use client';

import { useState, FormEvent } from 'react';
import { submitContactForm, ApiError, type ContactFormData } from '../lib/api';

interface FormStatus {
  type: 'idle' | 'loading' | 'success' | 'error';
  message: string;
}

export default function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    honeypot: ''
  });

  const [status, setStatus] = useState<FormStatus>({
    type: 'idle',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setStatus({ type: 'error', message: 'Please enter your name.' });
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setStatus({ type: 'error', message: 'Please enter a valid email address.' });
      return false;
    }
    if (!formData.subject.trim()) {
      setStatus({ type: 'error', message: 'Please enter a subject.' });
      return false;
    }
    if (!formData.message.trim()) {
      setStatus({ type: 'error', message: 'Please enter your message.' });
      return false;
    }
    // Honeypot validation - if filled, it's likely a bot
    if (formData.honeypot.trim()) {
      setStatus({ type: 'error', message: 'Spam detected. Please try again.' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setStatus({ type: 'loading', message: 'Sending message...' });

    try {
      const result = await submitContactForm(formData);

      setStatus({
        type: 'success',
        message: result.message || 'Message sent successfully!'
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        honeypot: ''
      });
    } catch (error) {
      if (error instanceof ApiError) {
        setStatus({
          type: 'error',
          message: error.message || 'Failed to send message. Please try again.'
        });
      } else {
        setStatus({
          type: 'error',
          message: 'Network error. Please check your connection and try again.'
        });
      }
    }
  };

  const resetStatus = () => {
    setStatus({ type: 'idle', message: '' });
  };

  return (
    <div className="bg-white rounded-lg">
      <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <i className="ph ph-paper-plane-tilt text-2xl text-primary"></i>
        Send a Message
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name and Email Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              onFocus={resetStatus}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              onFocus={resetStatus}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="your.email@example.com"
            />
          </div>
        </div>

        {/* Subject */}
        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject *
          </label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
            onFocus={resetStatus}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="What would you like to discuss?"
          />
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message *
          </label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleInputChange}
            onFocus={resetStatus}
            required
            rows={5}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-vertical"
            placeholder="Tell me about your project, ideas, or just say hello!"
          />
        </div>

        {/* Honeypot field - hidden from users, bots will fill it */}
        <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
          <label htmlFor="website">Please leave this field empty:</label>
          <input
            type="text"
            id="website"
            name="honeypot"
            value={formData.honeypot}
            onChange={handleInputChange}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
        </div>

        {/* Status Messages */}
        {status.message && (
          <div className={`p-4 rounded-lg flex items-center gap-2 ${status.type === 'success' ? 'bg-green-50 text-green-700' :
            status.type === 'error' ? 'bg-red-50 text-red-700' :
              status.type === 'loading' ? 'bg-blue-50 text-blue-700' :
                ''
            }`}>
            {status.type === 'success' && <i className="ph ph-check-circle text-xl"></i>}
            {status.type === 'error' && <i className="ph ph-x-circle text-xl"></i>}
            {status.type === 'loading' && <i className="ph ph-spinner-gap text-xl animate-spin"></i>}
            <span className="text-sm">{status.message}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status.type === 'loading'}
          className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {status.type === 'loading' ? (
            <>
              <i className="ph ph-spinner-gap text-xl animate-spin"></i>
              Sending...
            </>
          ) : (
            <>
              <i className="ph ph-paper-plane-tilt text-xl"></i>
              Send Message
            </>
          )}
        </button>
      </form>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Your message will be sent directly to my email. I&apos;ll get back to you as soon as possible!
      </p>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Image } from '@imagekit/next';
import ContactForm from '../components/ContactForm';
import { getProfile, type Profile } from '../lib/api';
import RichTextContent from '../components/RichTextContent';
import LoadingAnimation from '../components/LoadingAnimation';
import { devLog } from '../utils/utils';

interface ContactItem {
  id: string;
  label: string;
  url: string;
  iconName: string;
}

export default function About() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [contactData, setContactData] = useState<ContactItem[]>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        const profileData = await getProfile();

        if (profileData) {
          setProfile(profileData);

          const updatedContactData: ContactItem[] = [];

          if (profileData.email) {
            updatedContactData.push({
              id: 'email',
              label: profileData.email,
              url: `mailto:${profileData.email}`,
              iconName: 'envelope'
            });
          }

          profileData.socials?.forEach((social) => {
            // Parse the social format: "iconName|https://url" or just "https://url"
            const parts = social.split('|');
            const iconName = parts.length > 1 ? parts[0] : 'link';
            const url = parts.length > 1 ? parts[1] : social;

            // Extract label from URL
            const urlObject = new URL(url.startsWith('http') ? url : `https://${url}`);
            const domain = urlObject.hostname.replace('www.', '');
            const username = urlObject.pathname.split('/').filter(p => p)[0] || domain;

            updatedContactData.push({
              id: `${domain}-${username}`,
              label: username,
              url: url.startsWith('http') ? url : `https://${url}`,
              iconName: iconName
            });
          });

          setContactData(updatedContactData);
        }
      } catch (err) {
        setError('Failed to load profile data. Using default information.');
        devLog('Error fetching profile data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);
  if (loading) {
    return (
      <LoadingAnimation size={256} />
    );
  }

  return (
    <>
      <Head>
        <title>About | Kaku</title>
        <meta name="description" content="Learn more about Kaku's background, experience, and journey. Connect with a professional artist." />
        <meta property="og:title" content="About Kaku" />
        <meta property="og:description" content="Learn more about Kaku's background, experience, and journey." />
      </Head>
      <div className="min-h-screen p-8 animate-fade-in">
      <div className="mx-auto xl:w-3/5 w-full">
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">{error}</p>
          </div>
        )}

        <div className="flex flex-col xl:flex-row gap-12 xl:gap-16">
          {/* Profile Image */}
          <div className="xl:w-1/3 flex justify-center xl:justify-end">
            <div className="relative w-64 h-64 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
              <Image
                urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
                src={profile?.profile_image_path || "/kaku/kaku.png"}
                alt={`Professional headshot of ${profile?.name || 'Rahma Dwin'}, ${profile?.role || 'creative professional'} - About page profile image`}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className="xl:w-2/3 space-y-8">
            {/* Introduction */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Hi, I&apos;m {profile?.name || 'Rahma Dwin'}</h2>
              <RichTextContent
                content={profile?.summary ? profile?.summary : ''}
                className="space-y-4 text-gray-700 leading-relaxed"
              />
            </div>

            {/* Call to Action */}
            <div className="pt-4">
              <p className="text-gray-600 italic">
                I&apos;m always open to new opportunities and collaborations. Feel free to reach out!
              </p>
            </div>

            {/* Contact Section */}
            <div className="flex flex-col xl:grid xl:grid-cols-2 gap-8">
              {/* Contact Form - First on desktop (left), Last on mobile (bottom) */}
              <div className="order-2 xl:order-1">
                <ContactForm />
              </div>

              {/* Contact Information - Second on desktop (right), First on mobile (top) */}
              <div className="order-1 xl:order-2">
                <h3 className="text-xl font-semibold mb-4">Let&apos;s Connect</h3>
                <div className="space-y-3">
                  {contactData && contactData.map((contact) => (
                    <div key={contact.id} className="flex items-center gap-3">
                      <div className="w-5 h-5 text-primary">
                        <i className={`ph ph-${contact.iconName} text-xl`}></i>
                      </div>
                      <a
                        href={contact.url}
                        target={contact.id === 'email' ? '_self' : '_blank'}
                        rel={contact.id === 'email' ? undefined : 'noopener noreferrer nofollow'}
                        className="text-primary hover:underline"
                        onClick={(e) => {
                          if (contact.id !== 'email') {
                            e.preventDefault();
                            window.open(contact.url, '_blank', 'noopener,noreferrer');
                          }
                        }}
                      >
                        {contact.label}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
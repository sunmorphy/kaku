import { Image } from '@imagekit/next';
import ContactForm from '../components/ContactForm';

// Contact item interface for dynamic data
interface ContactItem {
  id: string;
  type: 'email' | 'instagram' | 'behance' | 'website';
  label: string;
  url: string;
  iconName: string; // This will be used as ph-{iconName}
}

// Dynamic contact data (can be moved to database/API)
const contactData: ContactItem[] = [
  {
    id: 'email',
    type: 'email',
    label: 'rahma.dwin@email.com',
    url: 'mailto:rahma.dwin@email.com',
    iconName: 'envelope' // Will render as ph-envelope
  },
  {
    id: 'instagram',
    type: 'instagram',
    label: '@kaakushigoto',
    url: 'https://instagram.com/kaakushigoto',
    iconName: 'instagram-logo' // Will render as ph-instagram-logo
  },
  {
    id: 'behance',
    type: 'behance',
    label: 'kakushigoto',
    url: 'https://behance.net/kakushigoto',
    iconName: 'behance-logo' // Will render as ph-globe
  }
];

export default function About() {
  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto lg:w-3/5 w-full">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          {/* Profile Image */}
          <div className="lg:w-1/3 flex justify-center lg:justify-end">
            <div className="relative w-64 h-64 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
              <Image
                urlEndpoint={process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT}
                src="/kaku/kaku.png"
                alt="Rahma Dwin Profile"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className="lg:w-2/3 space-y-8">
            {/* Introduction */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Hi, I'm Rahma Dwin</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  I'm a passionate 2D artist specializing in character design, digital illustration, and concept art.
                  My work focuses on bringing imaginative worlds and characters to life through thoughtful design and
                  vibrant storytelling.
                </p>
                <p>
                  Currently pursuing my studies in Visual Arts and Digital Media, where I continue to expand my
                  artistic horizons and explore new techniques in digital art creation. I'm particularly interested
                  in character development and environmental concept design.
                </p>
                <p>
                  When I'm not working on commissioned pieces, you can find me sketching in cafes, experimenting
                  with new art styles, or studying the works of master artists for inspiration.
                </p>
              </div>
            </div>

            {/* Current Studies */}
            <div>
              <h3 className="text-xl font-semibold mb-3">Current Studies</h3>
              <div className="text-gray-700">
                <p className="mb-2">
                  <span className="font-medium">Bachelor of Visual Arts</span> - Digital Media Concentration
                </p>
                <p className="text-sm text-gray-600">
                  Focusing on digital illustration, concept art, and character design
                </p>
              </div>
            </div>

            {/* Call to Action */}
            <div className="pt-4">
              <p className="text-gray-600 italic">
                I'm always open to new opportunities and collaborations. Feel free to reach out!
              </p>
            </div>

            {/* Contact Section */}
            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-8">
              {/* Contact Form - First on desktop (left), Last on mobile (bottom) */}
              <div className="order-2 lg:order-1">
                <ContactForm />
              </div>

              {/* Contact Information - Second on desktop (right), First on mobile (top) */}
              <div className="order-1 lg:order-2">
                <h3 className="text-xl font-semibold mb-4">Let's Connect</h3>
                <div className="space-y-3">
                  {contactData.map((contact) => (
                    <div key={contact.id} className="flex items-center gap-3">
                      <div className="w-5 h-5 text-primary">
                        <i className={`ph ph-${contact.iconName} text-xl`}></i>
                      </div>
                      <a
                        href={contact.url}
                        target={contact.type === 'email' ? '_self' : '_blank'}
                        rel={contact.type === 'email' ? undefined : 'noopener noreferrer'}
                        className="text-primary hover:underline"
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
  );
}
import { ImageResponse } from 'next/og'

export const runtime = 'edge'

async function getProfile() {
  try {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;
    const response = await fetch(`${API_BASE_URL}/auth/profile/1`);
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

export async function GET() {
  try {
    const profile = await getProfile();

    // Fallback values if profile fetch fails
    const name = profile?.pseudonym || 'Kaku';
    const role = profile?.role || '2D Artist';
    const description = profile?.short_summary || 'Portfolio & Creative Journey';
    const bannerImage = profile?.banner_image_path;

    // If we have a banner image, use it as background
    if (bannerImage) {
      return new ImageResponse(
        (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              position: 'relative',
              backgroundImage: `url(${bannerImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Dark overlay for text readability */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.1) 100%)',
              }}
            />

            {/* Content */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                padding: '60px',
                zIndex: 1,
                maxWidth: '600px',
              }}
            >
              <h1
                style={{
                  fontSize: '72px',
                  fontWeight: 'bold',
                  color: 'white',
                  margin: '0 0 20px 0',
                  textShadow: '0 4px 12px rgba(0, 0, 0, 0.8)',
                  lineHeight: 1.1,
                }}
              >
                {name}
              </h1>
              <p
                style={{
                  fontSize: '36px',
                  color: 'rgba(255, 255, 255, 0.95)',
                  margin: '0 0 16px 0',
                  fontWeight: '400',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
                }}
              >
                {role}
              </p>
              <p
                style={{
                  fontSize: '24px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  margin: '0',
                  fontWeight: '300',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
                  maxWidth: '500px',
                }}
              >
                {description}
              </p>
            </div>

            {/* Website URL */}
            <div
              style={{
                position: 'absolute',
                bottom: '40px',
                right: '40px',
                fontSize: '20px',
                color: 'rgba(255, 255, 255, 0.8)',
                background: 'rgba(0, 0, 0, 0.3)',
                padding: '8px 16px',
                borderRadius: '8px',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
              }}
            >
              rahmadwin.art
            </div>
          </div>
        ),
        {
          width: 1200,
          height: 630,
        }
      );
    }

    // Fallback gradient design if no banner image
    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui',
          }}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: '20px',
              padding: '60px',
              textAlign: 'center',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <h1
              style={{
                fontSize: '72px',
                fontWeight: 'bold',
                color: 'white',
                margin: '0 0 20px 0',
                textShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
              }}
            >
              {name}
            </h1>
            <p
              style={{
                fontSize: '32px',
                color: 'rgba(255, 255, 255, 0.9)',
                margin: '0 0 20px 0',
                fontWeight: '300',
              }}
            >
              {role}
            </p>
            <p
              style={{
                fontSize: '24px',
                color: 'rgba(255, 255, 255, 0.8)',
                margin: '0',
                fontWeight: '300',
              }}
            >
              {description}
            </p>
          </div>
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '40px',
              fontSize: '20px',
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            rahmadwin.art
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );

  } catch (error) {
    console.error('Error generating OG image:', error);

    // Return a simple fallback image
    return new ImageResponse(
      (
        <div
          style={{
            background: '#667eea',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '48px',
            fontWeight: 'bold',
          }}
        >
          Rahma Dwin - Portfolio & Journey
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}
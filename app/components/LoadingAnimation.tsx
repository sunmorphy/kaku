import dynamic from 'next/dynamic';
import loadingData from '../../public/loading.json';

interface LoadingAnimationProps {
  size?: number;
  className?: string;
}

// Fallback loading spinner
const FallbackSpinner = ({ size }: { size: number }) => (
  <div 
    className="animate-spin rounded-full border-4 border-gray-300 border-t-blue-500"
    style={{ width: size * 0.6, height: size * 0.6 }}
  />
);

// Dynamic import for Lottie to avoid SSR issues
const LottiePlayer = dynamic(
  () => import('react-lottie-player').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => <FallbackSpinner size={120} />
  }
);

export default function LoadingAnimation({ size = 120, className = '' }: LoadingAnimationProps) {
  return (
    <div className={`mx-auto flex items-center justify-center ${className}`}>
      <LottiePlayer
        loop
        animationData={loadingData}
        play
        style={{ width: size, height: size }}
      />
    </div>
  );
}
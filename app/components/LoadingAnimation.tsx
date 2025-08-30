import Lottie from 'react-lottie-player';
import loading from '../../public/loading.json';

interface LoadingAnimationProps {
  size?: number;
  className?: string;
}

export default function LoadingAnimation({ size = 120, className = '' }: LoadingAnimationProps) {
  return (
    <div className={`mx-auto flex items-center justify-center ${className}`}>
      <Lottie
        loop
        animationData={loading}
        play
        style={{ width: size, height: size }}
      />
    </div>
  );
}
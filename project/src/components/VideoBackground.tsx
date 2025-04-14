import { useEffect, useRef } from 'react';

interface VideoBackgroundProps {
  videoUrl: string;
}

export function VideoBackground({ videoUrl }: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Load and play the new video
    video.src = videoUrl;
    video.load();
    
    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        console.error('Error playing video:', error);
      }
    };

    playVideo();

    // Cleanup function
    return () => {
      video.pause();
      video.src = '';
    };
  }, [videoUrl]);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden -z-10">
      <video
        ref={videoRef}
        className="absolute min-w-full min-h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
      />
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
} 
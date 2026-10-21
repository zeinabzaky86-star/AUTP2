import { useSignedImage } from '@/hooks/useSignedImage';
import { Skeleton } from '@/components/ui/skeleton';

interface NewsImageProps {
  imagePath: string | null;
  alt: string;
  className?: string;
}

export const NewsImage = ({ imagePath, alt, className }: NewsImageProps) => {
  const { signedUrl, loading, error } = useSignedImage('news-images', imagePath);

  if (loading) {
    return <Skeleton className={className} />;
  }

  if (error || !signedUrl) {
    return (
      <div className={`${className} bg-muted flex items-center justify-center text-muted-foreground text-sm`}>
        Image unavailable
      </div>
    );
  }

  return (
    <img
      src={signedUrl}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
};
import type { ContextPhoto as ContextPhotoType } from '@/app/types/intelligence';
import { ImageWithFallback } from '@/app/components/ui/ImageWithFallback';

interface ContextPhotoProps {
  data: ContextPhotoType;
}

export function ContextPhoto({ data }: ContextPhotoProps) {
  // Use specific fallback images based on the query
  const getImageUrl = (query: string) => {
    if (query.includes('federal reserve')) {
      return 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80';
    }
    if (query.includes('semiconductor')) {
      return 'https://images.unsplash.com/photo-1693932038683-7c35401f5307?w=800&q=80';
    }
    // Default fallback
    return 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80';
  };

  const imageUrl = getImageUrl(data.imageQuery);

  return (
    <div className="space-y-4">
      <div className="intel-card overflow-hidden">
        <ImageWithFallback
          src={imageUrl}
          alt={data.caption}
          className="w-full h-[320px] object-cover opacity-85"
        />
      </div>
      <div className="space-y-2">
        <p className="intel-text-muted text-[13px] italic">
          {data.caption}
        </p>
        <p className="intel-text-body text-[14px] leading-[1.7]">
          {data.interpretation}
        </p>
      </div>
    </div>
  );
}
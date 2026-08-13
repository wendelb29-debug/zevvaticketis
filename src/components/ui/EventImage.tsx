import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageOff } from "lucide-react";

interface EventImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  alt: string;
  className?: string;
  containerClassName?: string;
  fallbackSrc?: string;
  showSkeleton?: boolean;
}

export function EventImage({
  src,
  alt,
  className,
  containerClassName,
  fallbackSrc = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop",
  showSkeleton = true,
  ...props
}: EventImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  // If no src is provided, use fallback immediately
  const effectiveSrc = !src || error ? fallbackSrc : src;

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {isLoading && showSkeleton && (
        <Skeleton className="absolute inset-0 w-full h-full z-10" />
      )}
      
      {error && !fallbackSrc ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted text-muted-foreground gap-2">
          <ImageOff className="w-8 h-8 opacity-20" />
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-40">Imagem indisponível</span>
        </div>
      ) : (
        <img
          src={effectiveSrc}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-500",
            isLoading ? "opacity-0" : "opacity-100",
            className
          )}
          {...props}
        />
      )}
    </div>
  );
}

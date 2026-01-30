'use client';

import { cn } from '@/lib/utils';

interface ImagePlaceholderProps {
  className?: string;
  aspectRatio?: 'square' | '4/3' | '16/9' | '3/2';
  label?: string;
}

export function ImagePlaceholder({
  className,
  aspectRatio = '4/3',
  label,
}: ImagePlaceholderProps) {
  const aspectClass = {
    square: 'aspect-square',
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-video',
    '3/2': 'aspect-[3/2]',
  }[aspectRatio];

  return (
    <div
      className={cn(
        'relative bg-gradient-to-br from-woodshop-100 to-woodshop-200 rounded-2xl overflow-hidden',
        aspectClass,
        className
      )}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="w-12 h-12 mx-auto text-woodshop-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          {label && (
            <p className="mt-2 text-sm text-woodshop-400">{label}</p>
          )}
        </div>
      </div>
    </div>
  );
}

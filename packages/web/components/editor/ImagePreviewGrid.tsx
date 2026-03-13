'use client'

import { useState, useCallback } from 'react'
import { X } from 'lucide-react'

interface Props {
  images: string[]
  title?: string
}

export function ImagePreviewGrid({ images, title }: Props) {
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)

  const closeLightbox = useCallback(() => setLightboxSrc(null), [])

  if (images.length === 0) return null

  return (
    <div className="mt-2">
      {title && (
        <p className="mb-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))]">{title}</p>
      )}

      <div className="grid grid-cols-2 gap-1.5">
        {images.map((src, i) => (
          <button
            key={`${src}-${i}`}
            type="button"
            className="relative aspect-square overflow-hidden rounded-md border border-[hsl(var(--border))] transition-opacity hover:opacity-80"
            onClick={() => setLightboxSrc(src)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`결과 이미지 ${i + 1}`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>

      {lightboxSrc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="이미지 미리보기"
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
            onClick={closeLightbox}
          >
            <X className="h-5 w-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxSrc}
            alt="원본 이미지"
            className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}

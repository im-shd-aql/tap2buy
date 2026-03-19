"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { X, ZoomIn } from "lucide-react";

export default function ImageGallery({
  images,
  name,
  themeColor,
}: {
  images: string[];
  name: string;
  themeColor: string;
}) {
  const [active, setActive] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const lastTouchDistRef = useRef(0);
  const lastTouchCenterRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const lastPanRef = useRef({ x: 0, y: 0 });

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActive(index);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [lightboxOpen]);

  function openLightbox() {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
    setLightboxOpen(true);
  }

  function closeLightbox() {
    setLightboxOpen(false);
  }

  // Desktop: double click to toggle zoom
  function handleDoubleClick() {
    if (scale > 1) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    } else {
      setScale(2.5);
    }
  }

  // Touch: pinch to zoom
  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDistRef.current = Math.sqrt(dx * dx + dy * dy);
      lastTouchCenterRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    } else if (e.touches.length === 1 && scale > 1) {
      isDraggingRef.current = true;
      lastPanRef.current = {
        x: e.touches[0].clientX - translate.x,
        y: e.touches[0].clientY - translate.y,
      };
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (lastTouchDistRef.current) {
        const newScale = Math.min(5, Math.max(1, scale * (dist / lastTouchDistRef.current)));
        setScale(newScale);
        if (newScale <= 1) setTranslate({ x: 0, y: 0 });
      }
      lastTouchDistRef.current = dist;
    } else if (e.touches.length === 1 && isDraggingRef.current && scale > 1) {
      setTranslate({
        x: e.touches[0].clientX - lastPanRef.current.x,
        y: e.touches[0].clientY - lastPanRef.current.y,
      });
    }
  }

  function handleTouchEnd() {
    lastTouchDistRef.current = 0;
    isDraggingRef.current = false;
    if (scale <= 1) {
      setScale(1);
      setTranslate({ x: 0, y: 0 });
    }
  }

  if (images.length === 0) {
    return (
      <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-300">
        No image
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        className="overflow-x-auto flex snap-x snap-mandatory scrollbar-hide"
      >
        {images.map((img, i) => (
          <div
            key={i}
            className="min-w-full snap-center relative aspect-square bg-gray-100 cursor-zoom-in"
            onClick={openLightbox}
          >
            <Image
              src={img}
              alt={`${name} ${i + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              priority={i === 0}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Zoom hint */}
      <button
        onClick={openLightbox}
        className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1.5 rounded-full font-medium flex items-center gap-1.5 hover:bg-black/60 transition-colors"
      >
        <ZoomIn className="w-3.5 h-3.5" />
        Tap to zoom
      </button>

      {/* Image counter overlay */}
      {images.length > 1 && (
        <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full font-medium">
          {active + 1}/{images.length}
        </div>
      )}

      {/* Dot indicators */}
      {images.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3 pb-1">
          {images.map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full transition-all duration-300"
              style={{
                backgroundColor: i === active ? themeColor : "#d1d5db",
                transform: i === active ? "scale(1.3)" : "scale(1)",
              }}
            />
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onDoubleClick={handleDoubleClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute top-4 left-4 z-10 text-white/70 text-sm font-medium">
              {active + 1} / {images.length}
            </div>
          )}

          {/* Zoom hint */}
          <div className="absolute bottom-6 left-0 right-0 z-10 text-center text-white/50 text-xs">
            {scale > 1 ? "Double-tap to reset" : "Pinch or double-tap to zoom"}
          </div>

          {/* Image */}
          <div
            className="w-full h-full flex items-center justify-center"
            style={{
              transform: `scale(${scale}) translate(${translate.x / scale}px, ${translate.y / scale}px)`,
              transition: isDraggingRef.current ? "none" : "transform 0.2s ease-out",
            }}
          >
            <div className="relative w-full aspect-square max-h-screen">
              <Image
                src={images[active]}
                alt={`${name} ${active + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

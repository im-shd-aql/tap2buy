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
  const scaleRef = useRef(1);
  const translateRef = useRef({ x: 0, y: 0 });
  const [, forceRender] = useState(0);
  const lastTouchDistRef = useRef(0);
  const lastTouchCenterRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const lastPanRef = useRef({ x: 0, y: 0 });
  const lightboxImgRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const lastTapRef = useRef(0);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActive(index);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [handleScroll]);

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [lightboxOpen]);

  function applyTransform() {
    const el = lightboxImgRef.current;
    if (!el) return;
    const s = scaleRef.current;
    const t = translateRef.current;
    el.style.transform = `scale(${s}) translate(${t.x / s}px, ${t.y / s}px)`;
  }

  function openLightbox() {
    scaleRef.current = 1;
    translateRef.current = { x: 0, y: 0 };
    setLightboxOpen(true);
  }

  function closeLightbox() {
    setLightboxOpen(false);
  }

  // Double-tap to toggle zoom (works on both touch and click)
  function handleDoubleTap() {
    if (scaleRef.current > 1) {
      scaleRef.current = 1;
      translateRef.current = { x: 0, y: 0 };
    } else {
      scaleRef.current = 2.5;
    }
    if (lightboxImgRef.current) {
      lightboxImgRef.current.style.transition = "transform 0.2s ease-out";
    }
    applyTransform();
    forceRender((n) => n + 1);
    setTimeout(() => {
      if (lightboxImgRef.current) {
        lightboxImgRef.current.style.transition = "none";
      }
    }, 200);
  }

  function handleTouchStart(e: React.TouchEvent) {
    // Detect double-tap
    const now = Date.now();
    if (e.touches.length === 1 && now - lastTapRef.current < 300) {
      e.preventDefault();
      handleDoubleTap();
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;

    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      lastTouchDistRef.current = Math.sqrt(dx * dx + dy * dy);
      lastTouchCenterRef.current = {
        x: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        y: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      };
    } else if (e.touches.length === 1 && scaleRef.current > 1) {
      isDraggingRef.current = true;
      lastPanRef.current = {
        x: e.touches[0].clientX - translateRef.current.x,
        y: e.touches[0].clientY - translateRef.current.y,
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
        const newScale = Math.min(5, Math.max(1, scaleRef.current * (dist / lastTouchDistRef.current)));
        scaleRef.current = newScale;
        if (newScale <= 1) translateRef.current = { x: 0, y: 0 };
      }
      lastTouchDistRef.current = dist;
    } else if (e.touches.length === 1 && isDraggingRef.current && scaleRef.current > 1) {
      translateRef.current = {
        x: e.touches[0].clientX - lastPanRef.current.x,
        y: e.touches[0].clientY - lastPanRef.current.y,
      };
    }

    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(applyTransform);
  }

  function handleTouchEnd() {
    lastTouchDistRef.current = 0;
    isDraggingRef.current = false;
    if (scaleRef.current <= 1) {
      scaleRef.current = 1;
      translateRef.current = { x: 0, y: 0 };
      if (lightboxImgRef.current) {
        lightboxImgRef.current.style.transition = "transform 0.2s ease-out";
        applyTransform();
        setTimeout(() => {
          if (lightboxImgRef.current) {
            lightboxImgRef.current.style.transition = "none";
          }
        }, 200);
      }
    }
    forceRender((n) => n + 1);
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
              loading={i === 0 ? "eager" : "lazy"}
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
          className="fixed inset-0 z-50 bg-black flex items-center justify-center touch-none"
          onDoubleClick={handleDoubleTap}
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
            {scaleRef.current > 1 ? "Double-tap to reset" : "Pinch or double-tap to zoom"}
          </div>

          {/* Image */}
          <div
            ref={lightboxImgRef}
            className="w-full h-full flex items-center justify-center will-change-transform"
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

"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Slide = {
  id: number;
  title: string | null;
  imageUrl: string;
  linkUrl: string | null;
  isActive: boolean;
  order: number;
}

export default function HomeCarousel({ slides }: { slides: Slide[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto slide
  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  if (slides.length === 0) return null;

  const next = () => setCurrentIndex((prev) => (prev + 1) % slides.length)
  const prev = () => setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);
  };

  return (
    <div className="relative w-full max-w-6xl mx-auto h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] bg-slate-50 rounded-3xl overflow-hidden shadow-2xl mb-12">
      {slides.map((slide, index) => {
        const SlideContent = () => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 flex ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
          >
            {slide.imageUrl && (
              <img src={slide.imageUrl} alt={slide.title || 'Promo'} className="absolute inset-0 w-full h-full object-cover sm:object-contain" />
            )}
          </div>
        );

        return slide.linkUrl ? (
          <a href={slide.linkUrl} key={slide.id} className="block w-full h-full">
            <SlideContent />
          </a>
        ) : (
          <SlideContent key={slide.id} />
        );
      })}

      {slides.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition">
            <ChevronLeft size={24} />
          </button>
          <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 bg-black/30 hover:bg-black/50 text-white rounded-full backdrop-blur-sm transition">
            <ChevronRight size={24} />
          </button>
        </>
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
        {slides.map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-white w-6' : 'bg-white/50'}`} />
        ))}
      </div>
    </div>
  )
}

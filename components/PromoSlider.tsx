
import React, { useEffect, useRef, useState } from 'react';
import { PromoItem } from '../types';
import { ExternalLink } from 'lucide-react';

interface PromoSliderProps {
  items: PromoItem[];
}

const PromoSlider: React.FC<PromoSliderProps> = ({ items }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeItems = items.filter(i => i.isActive);

  // Auto-scroll effect
  useEffect(() => {
    if (activeItems.length <= 1) return;

    const interval = setInterval(() => {
      if (!isPaused && scrollRef.current) {
        const container = scrollRef.current;
        // Scroll amount is roughly one item width + gap
        const firstItem = container.firstElementChild as HTMLElement;
        if (!firstItem) return;
        
        const itemWidth = firstItem.offsetWidth;
        const gap = 16; 
        const scrollAmount = itemWidth + gap;
        const maxScroll = container.scrollWidth - container.clientWidth;
        
        // Check if we need to wrap around
        if (container.scrollLeft >= maxScroll - 10) {
           container.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
           container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }, 4000); 

    return () => clearInterval(interval);
  }, [activeItems.length, isPaused]);

  // Sync active index based on scroll position
  const handleScroll = () => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      const firstItem = container.firstElementChild as HTMLElement;
      if (firstItem) {
        const itemWidth = firstItem.offsetWidth + 16; // width + gap
        const newIndex = Math.round(container.scrollLeft / itemWidth);
        // Clamp index
        const clampedIndex = Math.min(Math.max(newIndex, 0), activeItems.length - 1);
        setActiveIndex(clampedIndex);
      }
    }
  };

  const scrollToItem = (index: number) => {
    if (scrollRef.current) {
       const container = scrollRef.current;
       const firstItem = container.firstElementChild as HTMLElement;
       if (firstItem) {
          const itemWidth = firstItem.offsetWidth + 16;
          container.scrollTo({ left: itemWidth * index, behavior: 'smooth' });
       }
    }
  };

  if (activeItems.length === 0) return null;

  return (
    <div 
      className="relative group mb-8 animate-fade-in"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div 
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex overflow-x-auto gap-4 snap-x snap-mandatory pb-4 no-scrollbar"
        style={{ scrollBehavior: 'smooth' }}
      >
        {activeItems.map((item) => (
          <a
            key={item.id}
            href={item.link || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-[90%] md:w-[45%] lg:w-[32%] relative rounded-xl overflow-hidden border border-gray-800 shadow-lg snap-center transition-transform hover:scale-[1.01]"
            style={{ aspectRatio: '2.5/1' }}
          >
            <img 
              src={item.imageUrl} 
              alt={item.title} 
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-bold text-sm md:text-lg drop-shadow-md truncate pr-2">
                  {item.title}
                </h3>
                {item.link && (
                  <div className="bg-[#00d1ff] p-1.5 rounded-full text-[#0f1113]">
                    <ExternalLink size={14} />
                  </div>
                )}
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* Dots Indicator */}
      {activeItems.length > 1 && (
        <div className="flex justify-center gap-2 mt-2">
           {activeItems.map((_, idx) => (
              <button 
                 key={idx}
                 onClick={() => scrollToItem(idx)}
                 className={`h-2 rounded-full transition-all duration-300 ${activeIndex === idx ? 'w-6 bg-[#00d1ff]' : 'w-2 bg-gray-700 hover:bg-gray-500'}`}
                 aria-label={`Go to slide ${idx + 1}`}
              />
           ))}
        </div>
      )}
    </div>
  );
};

export default PromoSlider;
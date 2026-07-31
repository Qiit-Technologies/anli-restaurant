'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BookingGalleryProps {
    images?: string[];
}

export default function BookingGallery({ images = [] }: BookingGalleryProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const { scrollLeft, clientWidth } = scrollContainerRef.current;
            const scrollAmount = clientWidth * 0.45;
            const newScrollLeft =
                direction === 'left'
                    ? scrollLeft - scrollAmount
                    : scrollLeft + scrollAmount;

            scrollContainerRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth',
            });
        }
    };

    if (!images.length) {
        return null;
    }

    return (
        <section className="relative w-full max-w-7xl mx-auto group">
            <div
                ref={scrollContainerRef}
                className="flex gap-3 md:gap-4 overflow-x-auto scroll-smooth no-scrollbar snap-x snap-mandatory pb-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {images.map((src, index) => (
                    <div
                        key={`${src}-${index}`}
                        className="relative flex-shrink-0 w-[280px] md:w-[360px] aspect-[4/3] rounded-xl overflow-hidden shadow-md ring-1 ring-slate-900/5 snap-start"
                    >
                        <Image
                            src={src}
                            alt={`Hotel gallery ${index + 1}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 280px, 360px"
                            priority={index === 0}
                            unoptimized
                        />
                    </div>
                ))}
            </div>

            {images.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={() => scroll('left')}
                        className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 rounded-full bg-white shadow-lg border border-gray-150 flex items-center justify-center text-gray-700 hover:text-blue-500 transition-all active:scale-90 z-20"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                    </button>

                    <button
                        type="button"
                        onClick={() => scroll('right')}
                        className="absolute right-6 md:right-8 top-1/2 -translate-y-1/2 w-10 h-10 md:w-11 md:h-11 rounded-full bg-white shadow-lg border border-gray-150 flex items-center justify-center text-gray-700 hover:text-blue-500 transition-all active:scale-90 z-20"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </>
            )}
        </section>
    );
}

'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Heart } from 'lucide-react';
import { Restaurant } from '@/services/restaurant.service';

interface RestaurantsCarouselProps {
    restaurants: Restaurant[];
    title?: string;
    favorites?: number[];
    onToggleFavorite?: (id: number) => void;
}

export default function RestaurantsCarousel({
    restaurants,
    title = 'Restaurant you may like',
    favorites = [],
    onToggleFavorite,
}: RestaurantsCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [localFavs, setLocalFavs] = useState<Record<number, boolean>>({});

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -320, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 320, behavior: 'smooth' });
        }
    };

    // Fallback items if restaurants array is empty or short
    const displayItems: Array<Partial<Restaurant> & { tag?: string; image?: string }> =
        restaurants.length > 0
            ? restaurants.map((r, i) => ({
                  ...r,
                  tag: r.tags ? r.tags.split(',')[0].trim() : i % 3 === 0 ? 'Bar' : i % 3 === 1 ? 'Fine Dining' : 'Roof Top',
                  image: r.coverImage || r.images?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
              }))
            : [
                  {
                      id: 101,
                      name: 'Cactus Restaurant & Bar',
                      tag: 'Bar',
                      displayHours: 'Open now 10:00 am close 11 : pm',
                      image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
                  },
                  {
                      id: 102,
                      name: 'Cactus Restaurant & Bar',
                      tag: 'Fine Dining',
                      displayHours: 'Open now 10:00 am close 11 : pm',
                      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
                  },
                  {
                      id: 103,
                      name: 'Cactus Restaurant & Bar',
                      tag: 'Roof Top',
                      displayHours: 'Open now 10:00 am close 11 : pm',
                      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
                  },
                  {
                      id: 104,
                      name: 'Ocean Basket & Lounge',
                      tag: 'Seafood',
                      displayHours: 'Open now 12:00 pm close 10 : pm',
                      image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80',
                  },
              ];

    const toggleFav = (id?: number) => {
        if (!id) return;
        setLocalFavs((prev) => ({ ...prev, [id]: !prev[id] }));
        if (onToggleFavorite) onToggleFavorite(id);
    };

    return (
        <section className="my-10 relative">
            <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A] mb-6">
                {title}
            </h2>

            <div className="relative group">
                {/* Navigation Arrow Left */}
                <button
                    onClick={scrollLeft}
                    className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all"
                    aria-label="Scroll left"
                >
                    <ChevronLeft size={20} />
                </button>

                {/* Carousel Container */}
                <div
                    ref={scrollContainerRef}
                    className="flex gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-4 pt-1 px-1"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {displayItems.map((item, idx) => {
                        const itemId = item.id || idx;
                        const isFav = localFavs[itemId] ?? favorites.includes(itemId);
                        const href = item.id ? `/${item.id}` : '#';

                        return (
                            <div
                                key={itemId}
                                className="flex-shrink-0 w-[280px] sm:w-[340px] md:w-[380px] h-[240px] sm:h-[270px] relative rounded-[20px] overflow-hidden group/card shadow-sm hover:shadow-xl transition-all duration-300"
                            >
                                <Link href={href} className="block w-full h-full relative">
                                    <Image
                                        src={item.image || item.coverImage || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80'}
                                        alt={item.name || 'Restaurant'}
                                        fill
                                        className="object-cover group-hover/card:scale-105 transition-transform duration-700"
                                    />
                                    {/* Bottom gradient overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                </Link>

                                {/* Favorite Heart Button */}
                                <button
                                    type="button"
                                    onClick={() => toggleFav(item.id)}
                                    className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center bg-black/20 backdrop-blur-sm hover:bg-white/30 transition-colors"
                                    aria-label="Favorite"
                                >
                                    <Heart
                                        size={16}
                                        className={
                                            isFav
                                                ? 'fill-orange-500 text-orange-500'
                                                : 'text-white stroke-[2]'
                                        }
                                    />
                                </button>

                                {/* Bottom Info Text */}
                                <div className="absolute bottom-4 left-4 right-4 z-10 text-white pointer-events-none">
                                    <span className="text-[11px] font-semibold text-gray-200 block mb-1">
                                        {item.tag || 'Restaurant'}
                                    </span>
                                    <h3 className="text-base sm:text-lg font-bold truncate text-white">
                                        {item.name || 'Cactus Restaurant & Bar'}
                                    </h3>
                                    <p className="text-xs text-gray-300 mt-1">
                                        {item.displayHours || 'Open now 10:00 am close 11 : pm'}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Navigation Arrow Right */}
                <button
                    onClick={scrollRight}
                    className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white shadow-lg flex items-center justify-center text-gray-700 hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all"
                    aria-label="Scroll right"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </section>
    );
}

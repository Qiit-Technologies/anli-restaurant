'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    Search,
    MapPin,
    Building2,
    Home,
    Utensils,
    Star,
    ChevronDown,
    X,
} from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Restaurant } from '@/services/restaurant.service';
import { analytics } from '@/lib/mixpanel';

interface RestaurantSearchBarProps {
    searchQuery: string;
    onSearchQueryChange: (query: string) => void;
    locationName: string;
    onLocationChange: (location: string) => void;
    restaurants?: Restaurant[];
    className?: string;
}

const POPULAR_LOCATIONS = [
    { name: 'Lagos, Nigeria', sub: 'All Lagos', type: 'city', icon: MapPin },
    { name: 'Lekki Phase 1, Lagos', sub: 'Neighborhood', type: 'area', icon: Building2 },
    { name: 'Ikeja, Lagos', sub: 'City & GRA', type: 'area', icon: Building2 },
    { name: 'Victoria Island, Lagos', sub: 'Neighborhood', type: 'area', icon: Home },
    { name: 'Ikoyi, Lagos', sub: 'Neighborhood', type: 'area', icon: Home },
    { name: 'Abuja, Nigeria', sub: 'Federal Capital Territory', type: 'city', icon: MapPin },
];

const QUICK_CUISINES = [
    'Nigerian',
    'Fast Food',
    'Fine Dining',
    'Breakfast & Cafe',
    'Lounge & Drinks',
];

export default function RestaurantSearchBar({
    searchQuery,
    onSearchQueryChange,
    locationName,
    onLocationChange,
    restaurants = [],
    className = '',
}: RestaurantSearchBarProps) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'where' | 'what' | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Handle click outside to close popovers
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setActiveTab(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchSubmit = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setActiveTab(null);

        analytics.track('search_submitted', {
            search_query: searchQuery.trim(),
            location: locationName,
        });

        const params = new URLSearchParams();
        if (searchQuery.trim()) params.set('q', searchQuery.trim());
        if (locationName) params.set('location', locationName);

        router.push(`/search?${params.toString()}`);
    };

    // Filter matching restaurants for autocomplete
    const matchingRestaurants = searchQuery.trim()
        ? restaurants.filter(
              (r) =>
                  r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  r.tags?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  r.address?.toLowerCase().includes(searchQuery.toLowerCase()),
          )
        : [];

    return (
        <div ref={containerRef} className={`relative w-full max-w-4xl mx-auto ${className}`}>
            {/* ── Main Hero Search Bar Container ── */}
            <div
                className={`relative flex items-center bg-white rounded-2xl border transition-all duration-200 ${
                    activeTab !== null
                        ? 'bg-white border-gray-300 shadow-2xl ring-4 ring-orange-500/10'
                        : 'border-gray-200/90 shadow-xl hover:shadow-2xl hover:border-gray-300'
                } p-1.5 md:p-2`}
            >
                {/* Segment 1: Where */}
                <div
                    onClick={() => setActiveTab('where')}
                    className={`flex-1 flex items-center gap-3 px-4 md:px-5 py-1.5 rounded-xl cursor-pointer transition-all duration-200 ${
                        activeTab === 'where'
                            ? 'bg-gray-100/80 shadow-inner'
                            : 'hover:bg-gray-50'
                    }`}
                >
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-500">
                        <MapPin size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-extrabold tracking-tight text-gray-400 uppercase">
                            Where
                        </p>
                        <div className="flex items-center gap-1">
                            <span className="text-xs md:text-sm font-bold text-gray-900 truncate">
                                {locationName || 'Lagos, Nigeria'}
                            </span>
                            <ChevronDown size={13} className="text-gray-400 flex-shrink-0" />
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div
                    className={`hidden md:block h-8 w-[1px] bg-gray-200 mx-1 transition-opacity ${
                        activeTab === 'where' || activeTab === 'what' ? 'opacity-0' : 'opacity-100'
                    }`}
                />

                {/* Segment 2: What */}
                <div
                    onClick={() => {
                        setActiveTab('what');
                        setTimeout(() => inputRef.current?.focus(), 50);
                    }}
                    className={`flex-[1.5] flex items-center gap-3 px-4 md:px-5 py-1.5 rounded-xl cursor-pointer transition-all duration-200 ${
                        activeTab === 'what'
                            ? 'bg-gray-100/80 shadow-inner'
                            : 'hover:bg-gray-50'
                    }`}
                >
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-500">
                        <Search size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-extrabold tracking-tight text-gray-400 uppercase">
                            What
                        </p>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search restaurants, cuisines..."
                            value={searchQuery}
                            onChange={(e) => {
                                onSearchQueryChange(e.target.value);
                                if (activeTab !== 'what') setActiveTab('what');
                            }}
                            onFocus={() => setActiveTab('what')}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearchSubmit(e);
                                }
                            }}
                            className="w-full bg-transparent text-xs md:text-sm font-semibold text-gray-900 placeholder-gray-400 focus:outline-none truncate"
                        />
                    </div>
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSearchQueryChange('');
                            }}
                            className="p-1 rounded-md hover:bg-gray-200 text-gray-400"
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>

                {/* Search Button */}
                <button
                    type="button"
                    onClick={() => handleSearchSubmit()}
                    className="flex items-center justify-center gap-2 px-5 md:px-7 py-2.5 bg-[#FF8A00] hover:bg-orange-600 text-white rounded-xl font-bold shadow-md shadow-orange-500/25 transition-all duration-200 active:scale-95 flex-shrink-0 cursor-pointer ml-1"
                    aria-label="Search"
                >
                    <Search size={16} className="stroke-[2.5]" />
                    <span className="font-bold text-sm">Search</span>
                </button>
            </div>

            {/* ── Dropdown Popovers ── */}

            {/* 1. WHERE Popover */}
            {activeTab === 'where' && (
                <div className="absolute top-full left-0 mt-3 w-full sm:w-[380px] bg-white rounded-[32px] p-5 shadow-2xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
                        Popular Locations
                    </p>
                    <div className="space-y-1 max-h-72 overflow-y-auto">
                        {POPULAR_LOCATIONS.map((loc) => {
                            const Icon = loc.icon;
                            const isSelected = locationName === loc.name;
                            return (
                                <button
                                    key={loc.name}
                                    type="button"
                                    onClick={() => {
                                        onLocationChange(loc.name);
                                        setActiveTab('what');
                                        setTimeout(() => inputRef.current?.focus(), 50);
                                    }}
                                    className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-colors text-left ${
                                        isSelected ? 'bg-orange-50/80 text-orange-600' : 'hover:bg-gray-50'
                                    }`}
                                >
                                    <div
                                        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                            isSelected ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
                                        }`}
                                    >
                                        <Icon size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-800 truncate">
                                            {loc.name}
                                        </p>
                                        <p className="text-xs text-gray-400 truncate">{loc.sub}</p>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 2. WHAT / RESTAURANT Popover */}
            {activeTab === 'what' && (
                <div className="absolute top-full left-0 sm:left-1/3 mt-3 w-full sm:w-[440px] bg-white rounded-[32px] p-5 shadow-2xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-150">
                    {/* Quick Cuisines */}
                    <div className="mb-4">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                            Popular Cuisines
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {QUICK_CUISINES.map((cuisine) => (
                                <button
                                    key={cuisine}
                                    type="button"
                                    onClick={() => {
                                        onSearchQueryChange(cuisine);
                                        handleSearchSubmit();
                                    }}
                                    className="px-3.5 py-1.5 bg-gray-100 hover:bg-orange-50 hover:text-orange-600 text-xs font-semibold text-gray-700 rounded-full transition-colors"
                                >
                                    {cuisine}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Autocomplete Results */}
                    {searchQuery.trim() && (
                        <div className="border-t border-gray-100 pt-3">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">
                                Matching Restaurants ({matchingRestaurants.length})
                            </p>
                            {matchingRestaurants.length > 0 ? (
                                <div className="max-h-60 overflow-y-auto space-y-1">
                                    {matchingRestaurants.slice(0, 5).map((res) => {
                                        const isBookable = res.isBookable !== false;
                                        const slug = (res.name || 'restaurant')
                                            .toLowerCase()
                                            .trim()
                                            .replace(/\s+/g, '-')
                                            .replace(/[^\w-]+/g, '')
                                            .replace(/--+/g, '-') || 'restaurant';
                                        return (
                                            <button
                                                key={res.id}
                                                type="button"
                                                onClick={() => {
                                                    setActiveTab(null);
                                                    analytics.track('restaurant_clicked', {
                                                        restaurant_id: res.id,
                                                        restaurant_name: res.name,
                                                        source: 'restaurant_search_bar',
                                                    });
                                                    router.push(isBookable ? `/restaurants/${slug}` : `/restaurant/${res.id}`);
                                                }}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-orange-50 transition-colors text-left group"
                                            >
                                                {res.coverImage ? (
                                                    <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 relative">
                                                        <Image
                                                            src={res.coverImage}
                                                            alt={res.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-9 h-9 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 text-orange-500">
                                                        <Utensils size={15} />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-bold text-gray-800 group-hover:text-orange-600 truncate">
                                                        {res.name}
                                                    </p>
                                                    <p className="text-[11px] text-gray-400 truncate">
                                                        {res.tags || res.address || 'Restaurant'}
                                                    </p>
                                                </div>
                                                {res.rating && (
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                                                        <Star size={11} className="fill-yellow-400 text-yellow-400" />
                                                        {res.rating}
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                    <button
                                        type="button"
                                        onClick={() => handleSearchSubmit()}
                                        className="w-full mt-2 py-2 text-center text-xs font-bold text-orange-500 hover:bg-orange-50 rounded-xl transition-colors"
                                    >
                                        See all results for &quot;{searchQuery}&quot; &rarr;
                                    </button>
                                </div>
                            ) : (
                                <p className="text-xs text-gray-400 py-2 text-center">
                                    No restaurants found matching &quot;{searchQuery}&quot;
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    SlidersHorizontal,
    Utensils,
    Tag,
    Star,
    Leaf,
    Flame,
    Gift,
    Clock,
    RotateCcw,
    ChevronDown,
    Check,
} from 'lucide-react';

interface FilterBarProps {
    cuisineFilter: string;
    onCuisineChange: (cuisine: string) => void;
    priceFilter: string;
    onPriceChange: (price: string) => void;
    ratingFilter: number;
    onRatingChange: (rating: number) => void;
    dietaryFilter: string;
    onDietaryChange: (dietary: string) => void;
    ambienceFilter: string;
    onAmbienceChange: (ambience: string) => void;
    occasionFilter: string;
    onOccasionChange: (occasion: string) => void;
    openNowFilter: boolean;
    onOpenNowToggle: () => void;
    onClearAll: () => void;
    className?: string;
}

const CUISINES = [
    'All',
    'Nigerian',
    'Fast Food',
    'Fine Dining',
    'Continental',
    'African',
    'Italian',
    'Chinese',
    'Seafood',
    'Grill & BBQ',
];

const PRICES = ['All', '₦ (Budget)', '₦₦ (Moderate)', '₦₦₦ (Luxury)'];

const RATINGS = [
    { label: 'All Ratings', value: 0 },
    { label: '4.5 & above ⭐', value: 4.5 },
    { label: '4.0 & above ⭐', value: 4.0 },
    { label: '3.5 & above ⭐', value: 3.5 },
];

const DIETARY = ['All', 'Halal', 'Vegetarian', 'Vegan', 'Gluten-Free'];

const AMBIENCE = ['All', 'Rooftop', 'Cozy', 'Outdoor Dining', 'Romantic', 'Waterfront'];

const OCCASIONS = ['All', 'Date Night', 'Birthday', 'Family Gathering', 'Business Lunch'];

export default function FilterBar({
    cuisineFilter,
    onCuisineChange,
    priceFilter,
    onPriceChange,
    ratingFilter,
    onRatingChange,
    dietaryFilter,
    onDietaryChange,
    ambienceFilter,
    onAmbienceChange,
    occasionFilter,
    onOccasionChange,
    openNowFilter,
    onOpenNowToggle,
    onClearAll,
    className = '',
}: FilterBarProps) {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Count active filters
    const activeFilterCount =
        (cuisineFilter !== 'All' ? 1 : 0) +
        (priceFilter !== 'All' ? 1 : 0) +
        (ratingFilter > 0 ? 1 : 0) +
        (dietaryFilter !== 'All' ? 1 : 0) +
        (ambienceFilter !== 'All' ? 1 : 0) +
        (occasionFilter !== 'All' ? 1 : 0) +
        (openNowFilter ? 1 : 0);

    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleDropdown = (name: string) => {
        setOpenDropdown((prev) => (prev === name ? null : name));
    };

    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
            <div className="flex items-center justify-start w-full py-1 gap-2 flex-wrap">
                {/* 1. All Filters Toggle Button */}
                <button
                    type="button"
                    onClick={() => toggleDropdown('all')}
                    className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold border transition-all flex-shrink-0 cursor-pointer relative z-50 ${activeFilterCount > 0
                            ? 'bg-orange-500 text-white border-orange-500 shadow-md'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 shadow-sm hover:shadow'
                        }`}
                >
                    <SlidersHorizontal size={16} />
                    <span>Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-white text-orange-600 text-xs font-extrabold flex items-center justify-center">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                {/* 2. Cuisine Filter Dropdown */}
                <div className="relative flex-shrink-0 z-50">
                    <button
                        type="button"
                        onClick={() => toggleDropdown('cuisine')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold border transition-all cursor-pointer relative z-50 ${cuisineFilter !== 'All'
                                ? 'bg-orange-50 text-orange-600 border-orange-300 font-bold'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 shadow-sm'
                            }`}
                    >
                        <Utensils size={16} className={cuisineFilter !== 'All' ? 'text-orange-500' : 'text-gray-500'} />
                        <span>{cuisineFilter !== 'All' ? cuisineFilter : 'Cuisine'}</span>
                        <ChevronDown size={15} className="text-gray-400" />
                    </button>
                    {openDropdown === 'cuisine' && (
                        <div className="absolute top-full left-0 mt-3 w-52 bg-white rounded-2xl p-2 shadow-2xl border border-gray-100 z-[60] animate-in fade-in zoom-in-95 duration-150">
                            {CUISINES.map((c) => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => {
                                        onCuisineChange(c);
                                        setOpenDropdown(null);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm text-left transition-colors cursor-pointer ${cuisineFilter === c ? 'bg-orange-50 text-orange-600 font-bold' : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    <span>{c}</span>
                                    {cuisineFilter === c && <Check size={16} className="text-orange-500" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 3. Price Filter Dropdown */}
                <div className="relative flex-shrink-0 z-50">
                    <button
                        type="button"
                        onClick={() => toggleDropdown('price')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold border transition-all cursor-pointer relative z-50 ${priceFilter !== 'All'
                                ? 'bg-orange-50 text-orange-600 border-orange-300 font-bold'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 shadow-sm'
                            }`}
                    >
                        <Tag size={16} className={priceFilter !== 'All' ? 'text-orange-500' : 'text-gray-500'} />
                        <span>{priceFilter !== 'All' ? priceFilter : 'Price'}</span>
                        <ChevronDown size={15} className="text-gray-400" />
                    </button>
                    {openDropdown === 'price' && (
                        <div className="absolute top-full left-0 mt-3 w-52 bg-white rounded-2xl p-2 shadow-2xl border border-gray-100 z-[60] animate-in fade-in zoom-in-95 duration-150">
                            {PRICES.map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => {
                                        onPriceChange(p);
                                        setOpenDropdown(null);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm text-left transition-colors cursor-pointer ${priceFilter === p ? 'bg-orange-50 text-orange-600 font-bold' : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    <span>{p}</span>
                                    {priceFilter === p && <Check size={16} className="text-orange-500" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 4. Rating Filter Dropdown */}
                <div className="relative flex-shrink-0 z-50">
                    <button
                        type="button"
                        onClick={() => toggleDropdown('rating')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold border transition-all cursor-pointer relative z-50 ${ratingFilter > 0
                                ? 'bg-orange-50 text-orange-600 border-orange-300 font-bold'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 shadow-sm'
                            }`}
                    >
                        <Star size={16} className={ratingFilter > 0 ? 'fill-orange-400 text-orange-400' : 'text-gray-500'} />
                        <span>{ratingFilter > 0 ? `${ratingFilter}+ ⭐` : 'Rating'}</span>
                        <ChevronDown size={15} className="text-gray-400" />
                    </button>
                    {openDropdown === 'rating' && (
                        <div className="absolute top-full left-0 mt-3 w-52 bg-white rounded-2xl p-2 shadow-2xl border border-gray-100 z-[60] animate-in fade-in zoom-in-95 duration-150">
                            {RATINGS.map((r) => (
                                <button
                                    key={r.label}
                                    type="button"
                                    onClick={() => {
                                        onRatingChange(r.value);
                                        setOpenDropdown(null);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm text-left transition-colors cursor-pointer ${ratingFilter === r.value ? 'bg-orange-50 text-orange-600 font-bold' : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    <span>{r.label}</span>
                                    {ratingFilter === r.value && <Check size={16} className="text-orange-500" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 5. Dietary Filter Dropdown */}
                <div className="relative flex-shrink-0 z-50">
                    <button
                        type="button"
                        onClick={() => toggleDropdown('dietary')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold border transition-all cursor-pointer relative z-50 ${dietaryFilter !== 'All'
                                ? 'bg-orange-50 text-orange-600 border-orange-300 font-bold'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 shadow-sm'
                            }`}
                    >
                        <Leaf size={16} className={dietaryFilter !== 'All' ? 'text-orange-500' : 'text-gray-500'} />
                        <span>{dietaryFilter !== 'All' ? dietaryFilter : 'Dietary'}</span>
                    </button>
                    {openDropdown === 'dietary' && (
                        <div className="absolute top-full left-0 mt-3 w-48 bg-white rounded-2xl p-2 shadow-2xl border border-gray-100 z-[60] animate-in fade-in zoom-in-95 duration-150">
                            {DIETARY.map((d) => (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => {
                                        onDietaryChange(d);
                                        setOpenDropdown(null);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm text-left transition-colors cursor-pointer ${dietaryFilter === d ? 'bg-orange-50 text-orange-600 font-bold' : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    <span>{d}</span>
                                    {dietaryFilter === d && <Check size={16} className="text-orange-500" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 6. Ambience Filter Dropdown */}
                <div className="relative flex-shrink-0 z-50">
                    <button
                        type="button"
                        onClick={() => toggleDropdown('ambience')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold border transition-all cursor-pointer relative z-50 ${ambienceFilter !== 'All'
                                ? 'bg-orange-50 text-orange-600 border-orange-300 font-bold'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 shadow-sm'
                            }`}
                    >
                        <Flame size={16} className={ambienceFilter !== 'All' ? 'text-orange-500' : 'text-gray-500'} />
                        <span>{ambienceFilter !== 'All' ? ambienceFilter : 'Ambience'}</span>
                    </button>
                    {openDropdown === 'ambience' && (
                        <div className="absolute top-full left-0 mt-3 w-52 bg-white rounded-2xl p-2 shadow-2xl border border-gray-100 z-[60] animate-in fade-in zoom-in-95 duration-150">
                            {AMBIENCE.map((a) => (
                                <button
                                    key={a}
                                    type="button"
                                    onClick={() => {
                                        onAmbienceChange(a);
                                        setOpenDropdown(null);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm text-left transition-colors cursor-pointer ${ambienceFilter === a ? 'bg-orange-50 text-orange-600 font-bold' : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    <span>{a}</span>
                                    {ambienceFilter === a && <Check size={16} className="text-orange-500" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 7. Occasion Filter Dropdown */}
                <div className="relative flex-shrink-0 z-50">
                    <button
                        type="button"
                        onClick={() => toggleDropdown('occasion')}
                        className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold border transition-all cursor-pointer relative z-50 ${occasionFilter !== 'All'
                                ? 'bg-orange-50 text-orange-600 border-orange-300 font-bold'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 shadow-sm'
                            }`}
                    >
                        <Gift size={16} className={occasionFilter !== 'All' ? 'text-orange-500' : 'text-gray-500'} />
                        <span>{occasionFilter !== 'All' ? occasionFilter : 'Occasion'}</span>
                    </button>
                    {openDropdown === 'occasion' && (
                        <div className="absolute top-full left-0 mt-3 w-52 bg-white rounded-2xl p-2 shadow-2xl border border-gray-100 z-[60] animate-in fade-in zoom-in-95 duration-150">
                            {OCCASIONS.map((o) => (
                                <button
                                    key={o}
                                    type="button"
                                    onClick={() => {
                                        onOccasionChange(o);
                                        setOpenDropdown(null);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm text-left transition-colors cursor-pointer ${occasionFilter === o ? 'bg-orange-50 text-orange-600 font-bold' : 'hover:bg-gray-50 text-gray-700'
                                        }`}
                                >
                                    <span>{o}</span>
                                    {occasionFilter === o && <Check size={16} className="text-orange-500" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* 8. Open Now Toggle */}
                <button
                    type="button"
                    onClick={onOpenNowToggle}
                    className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold border transition-all flex-shrink-0 cursor-pointer relative z-50 ${openNowFilter
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 shadow-sm'
                        }`}
                >
                    <Clock size={16} className={openNowFilter ? 'text-emerald-600' : 'text-gray-500'} />
                    <span>Open now</span>
                </button>

                {/* 9. Clear All Button */}
                <button
                    type="button"
                    onClick={onClearAll}
                    className="flex items-center gap-1.5 px-5 py-3 text-sm font-bold text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors flex-shrink-0 cursor-pointer border border-transparent hover:border-orange-200 relative z-50"
                >
                    <span>Clear all</span>
                    <RotateCcw size={14} />
                </button>
            </div>
        </div>
    );
}

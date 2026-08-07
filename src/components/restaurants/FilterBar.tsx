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
    X,
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
        <div ref={containerRef} className={`relative w-full ${openDropdown !== null ? 'z-[300]' : 'z-30'} ${className}`}>
            <div className="flex items-center justify-start w-full py-1 gap-2 overflow-x-auto md:overflow-visible no-scrollbar scroll-smooth whitespace-nowrap md:whitespace-normal pb-2 md:pb-1 md:flex-wrap">
                {/* 1. All Filters Toggle Button */}
                <button
                    type="button"
                    onClick={() => toggleDropdown('all')}
                    className={`flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-semibold border transition-all flex-shrink-0 cursor-pointer relative z-50 ${activeFilterCount > 0
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

                {/* 2. Cuisine Filter Button */}
                <button
                    type="button"
                    onClick={() => toggleDropdown('cuisine')}
                    className={`flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-semibold border transition-all cursor-pointer flex-shrink-0 relative z-50 ${cuisineFilter !== 'All'
                        ? 'bg-orange-50 text-orange-600 border-orange-300 font-bold'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 shadow-sm'
                        }`}
                >
                    <Utensils size={16} className={cuisineFilter !== 'All' ? 'text-orange-500' : 'text-gray-500'} />
                    <span>{cuisineFilter !== 'All' ? cuisineFilter : 'Cuisine'}</span>
                    <ChevronDown size={15} className="text-gray-400" />
                </button>

                {/* 3. Price Filter Button */}
                <button
                    type="button"
                    onClick={() => toggleDropdown('price')}
                    className={`flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-semibold border transition-all cursor-pointer flex-shrink-0 relative z-50 ${priceFilter !== 'All'
                        ? 'bg-orange-50 text-orange-600 border-orange-300 font-bold'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 shadow-sm'
                        }`}
                >
                    <Tag size={16} className={priceFilter !== 'All' ? 'text-orange-500' : 'text-gray-500'} />
                    <span>{priceFilter !== 'All' ? priceFilter : 'Price'}</span>
                    <ChevronDown size={15} className="text-gray-400" />
                </button>

                {/* 4. Rating Filter Button */}
                <button
                    type="button"
                    onClick={() => toggleDropdown('rating')}
                    className={`flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-semibold border transition-all cursor-pointer flex-shrink-0 relative z-50 ${ratingFilter > 0
                        ? 'bg-orange-50 text-orange-600 border-orange-300 font-bold'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 shadow-sm'
                        }`}
                >
                    <Star size={16} className={ratingFilter > 0 ? 'fill-orange-400 text-orange-400' : 'text-gray-500'} />
                    <span>{ratingFilter > 0 ? `${ratingFilter}+ ⭐` : 'Rating'}</span>
                    <ChevronDown size={15} className="text-gray-400" />
                </button>

                {/* 5. Dietary Filter Button */}
                <button
                    type="button"
                    onClick={() => toggleDropdown('dietary')}
                    className={`flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-semibold border transition-all cursor-pointer flex-shrink-0 relative z-50 ${dietaryFilter !== 'All'
                        ? 'bg-orange-50 text-orange-600 border-orange-300 font-bold'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 shadow-sm'
                        }`}
                >
                    <Leaf size={16} className={dietaryFilter !== 'All' ? 'text-orange-500' : 'text-gray-500'} />
                    <span>{dietaryFilter !== 'All' ? dietaryFilter : 'Dietary'}</span>
                    <ChevronDown size={15} className="text-gray-400" />
                </button>

                {/* 6. Ambience Filter Button */}
                <button
                    type="button"
                    onClick={() => toggleDropdown('ambience')}
                    className={`flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-semibold border transition-all cursor-pointer flex-shrink-0 relative z-50 ${ambienceFilter !== 'All'
                        ? 'bg-orange-50 text-orange-600 border-orange-300 font-bold'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 shadow-sm'
                        }`}
                >
                    <Flame size={16} className={ambienceFilter !== 'All' ? 'text-orange-500' : 'text-gray-500'} />
                    <span>{ambienceFilter !== 'All' ? ambienceFilter : 'Ambience'}</span>
                    <ChevronDown size={15} className="text-gray-400" />
                </button>

                {/* 7. Occasion Filter Button */}
                <button
                    type="button"
                    onClick={() => toggleDropdown('occasion')}
                    className={`flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-semibold border transition-all cursor-pointer flex-shrink-0 relative z-50 ${occasionFilter !== 'All'
                        ? 'bg-orange-50 text-orange-600 border-orange-300 font-bold'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 shadow-sm'
                        }`}
                >
                    <Gift size={16} className={occasionFilter !== 'All' ? 'text-orange-500' : 'text-gray-500'} />
                    <span>{occasionFilter !== 'All' ? occasionFilter : 'Occasion'}</span>
                    <ChevronDown size={15} className="text-gray-400" />
                </button>

                {/* 8. Open Now Toggle */}
                <button
                    type="button"
                    onClick={onOpenNowToggle}
                    className={`flex items-center gap-2 px-4 md:px-5 py-2.5 md:py-3 rounded-full text-xs md:text-sm font-semibold border transition-all flex-shrink-0 cursor-pointer relative z-50 ${openNowFilter
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-bold'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 shadow-sm'
                        }`}
                >
                    <Clock size={16} className={openNowFilter ? 'text-emerald-600' : 'text-gray-500'} />
                    <span>Open now</span>
                </button>

                {/* 9. Clear All Button */}
                {activeFilterCount > 0 && (
                    <button
                        type="button"
                        onClick={onClearAll}
                        className="flex items-center gap-1.5 px-4 md:px-5 py-2.5 md:py-3 text-xs md:text-sm font-bold text-orange-500 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-colors flex-shrink-0 cursor-pointer border border-transparent hover:border-orange-200 relative z-50"
                    >
                        <span>Clear all</span>
                        <RotateCcw size={14} />
                    </button>
                )}
            </div>

            {/* ── Dropdown Popover Menus (Rendered OUTSIDE overflow container so they never clip on mobile) ── */}

            {/* 1. Cuisine Dropdown */}
            {openDropdown === 'cuisine' && (
                <div className="absolute top-full left-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white rounded-2xl p-2 shadow-2xl border border-gray-100 z-[95] animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100 mb-1">
                        <span className="text-xs font-bold text-gray-400 uppercase">Select Cuisine</span>
                        <button type="button" onClick={() => setOpenDropdown(null)} className="text-gray-400 hover:text-gray-600">
                            <X size={14} />
                        </button>
                    </div>
                    {CUISINES.map((c) => (
                        <button
                            key={c}
                            type="button"
                            onClick={() => {
                                onCuisineChange(c);
                                setOpenDropdown(null);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-left transition-colors cursor-pointer ${cuisineFilter === c ? 'bg-orange-50 text-orange-600 font-bold' : 'hover:bg-gray-50 text-gray-700'
                                }`}
                        >
                            <span>{c}</span>
                            {cuisineFilter === c && <Check size={16} className="text-orange-500" />}
                        </button>
                    ))}
                </div>
            )}

            {/* 2. Price Dropdown */}
            {openDropdown === 'price' && (
                <div className="absolute top-full left-0 sm:left-24 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white rounded-2xl p-2 shadow-2xl border border-gray-100 z-[95] animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100 mb-1">
                        <span className="text-xs font-bold text-gray-400 uppercase">Price Range</span>
                        <button type="button" onClick={() => setOpenDropdown(null)} className="text-gray-400 hover:text-gray-600">
                            <X size={14} />
                        </button>
                    </div>
                    {PRICES.map((p) => (
                        <button
                            key={p}
                            type="button"
                            onClick={() => {
                                onPriceChange(p);
                                setOpenDropdown(null);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-left transition-colors cursor-pointer ${priceFilter === p ? 'bg-orange-50 text-orange-600 font-bold' : 'hover:bg-gray-50 text-gray-700'
                                }`}
                        >
                            <span>{p}</span>
                            {priceFilter === p && <Check size={16} className="text-orange-500" />}
                        </button>
                    ))}
                </div>
            )}

            {/* 3. Rating Dropdown */}
            {openDropdown === 'rating' && (
                <div className="absolute top-full left-0 sm:left-48 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white rounded-2xl p-2 shadow-2xl border border-gray-100 z-[95] animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100 mb-1">
                        <span className="text-xs font-bold text-gray-400 uppercase">Minimum Rating</span>
                        <button type="button" onClick={() => setOpenDropdown(null)} className="text-gray-400 hover:text-gray-600">
                            <X size={14} />
                        </button>
                    </div>
                    {RATINGS.map((r) => (
                        <button
                            key={r.label}
                            type="button"
                            onClick={() => {
                                onRatingChange(r.value);
                                setOpenDropdown(null);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-left transition-colors cursor-pointer ${ratingFilter === r.value ? 'bg-orange-50 text-orange-600 font-bold' : 'hover:bg-gray-50 text-gray-700'
                                }`}
                        >
                            <span>{r.label}</span>
                            {ratingFilter === r.value && <Check size={16} className="text-orange-500" />}
                        </button>
                    ))}
                </div>
            )}

            {/* 4. Dietary Dropdown */}
            {openDropdown === 'dietary' && (
                <div className="absolute top-full left-0 sm:left-72 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white rounded-2xl p-2 shadow-2xl border border-gray-100 z-[95] animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100 mb-1">
                        <span className="text-xs font-bold text-gray-400 uppercase">Dietary</span>
                        <button type="button" onClick={() => setOpenDropdown(null)} className="text-gray-400 hover:text-gray-600">
                            <X size={14} />
                        </button>
                    </div>
                    {DIETARY.map((d) => (
                        <button
                            key={d}
                            type="button"
                            onClick={() => {
                                onDietaryChange(d);
                                setOpenDropdown(null);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-left transition-colors cursor-pointer ${dietaryFilter === d ? 'bg-orange-50 text-orange-600 font-bold' : 'hover:bg-gray-50 text-gray-700'
                                }`}
                        >
                            <span>{d}</span>
                            {dietaryFilter === d && <Check size={16} className="text-orange-500" />}
                        </button>
                    ))}
                </div>
            )}

            {/* 5. Ambience Dropdown */}
            {openDropdown === 'ambience' && (
                <div className="absolute top-full left-0 sm:left-96 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white rounded-2xl p-2 shadow-2xl border border-gray-100 z-[95] animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100 mb-1">
                        <span className="text-xs font-bold text-gray-400 uppercase">Ambience</span>
                        <button type="button" onClick={() => setOpenDropdown(null)} className="text-gray-400 hover:text-gray-600">
                            <X size={14} />
                        </button>
                    </div>
                    {AMBIENCE.map((a) => (
                        <button
                            key={a}
                            type="button"
                            onClick={() => {
                                onAmbienceChange(a);
                                setOpenDropdown(null);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-left transition-colors cursor-pointer ${ambienceFilter === a ? 'bg-orange-50 text-orange-600 font-bold' : 'hover:bg-gray-50 text-gray-700'
                                }`}
                        >
                            <span>{a}</span>
                            {ambienceFilter === a && <Check size={16} className="text-orange-500" />}
                        </button>
                    ))}
                </div>
            )}

            {/* 6. Occasion Dropdown */}
            {openDropdown === 'occasion' && (
                <div className="absolute top-full right-0 sm:right-auto sm:left-[450px] mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white rounded-2xl p-2 shadow-2xl border border-gray-100 z-[95] animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between px-3 py-1.5 border-b border-gray-100 mb-1">
                        <span className="text-xs font-bold text-gray-400 uppercase">Occasion</span>
                        <button type="button" onClick={() => setOpenDropdown(null)} className="text-gray-400 hover:text-gray-600">
                            <X size={14} />
                        </button>
                    </div>
                    {OCCASIONS.map((o) => (
                        <button
                            key={o}
                            type="button"
                            onClick={() => {
                                onOccasionChange(o);
                                setOpenDropdown(null);
                            }}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-left transition-colors cursor-pointer ${occasionFilter === o ? 'bg-orange-50 text-orange-600 font-bold' : 'hover:bg-gray-50 text-gray-700'
                                }`}
                        >
                            <span>{o}</span>
                            {occasionFilter === o && <Check size={16} className="text-orange-500" />}
                        </button>
                    ))}
                </div>
            )}

            {/* 10. Comprehensive All-Filters Drawer / Modal */}
            {openDropdown === 'all' && (
                <div className="fixed inset-0 z-[300] flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4 animate-in fade-in duration-200">
                    {/* Backdrop */}
                    <div className="absolute inset-0" onClick={() => setOpenDropdown(null)} />

                    {/* Modal Card */}
                    <div className="relative w-full max-w-lg bg-white rounded-t-3xl md:rounded-3xl p-5 md:p-6 shadow-2xl z-[310] max-h-[85vh] flex flex-col animate-in slide-in-from-bottom-5 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal size={18} className="text-orange-500" />
                                <h3 className="text-lg font-bold text-gray-900">All Filters</h3>
                                {activeFilterCount > 0 && (
                                    <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">
                                        {activeFilterCount}
                                    </span>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => setOpenDropdown(null)}
                                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto py-4 space-y-6 pr-1 no-scrollbar">
                            {/* Cuisine */}
                            <div>
                                <label className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block mb-2.5">
                                    Cuisine
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {CUISINES.map((c) => (
                                        <button
                                            key={c}
                                            type="button"
                                            onClick={() => onCuisineChange(c)}
                                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${cuisineFilter === c
                                                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                                }`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price */}
                            <div>
                                <label className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block mb-2.5">
                                    Price Range
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {PRICES.map((p) => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => onPriceChange(p)}
                                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${priceFilter === p
                                                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Rating */}
                            <div>
                                <label className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block mb-2.5">
                                    Minimum Rating
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {RATINGS.map((r) => (
                                        <button
                                            key={r.label}
                                            type="button"
                                            onClick={() => onRatingChange(r.value)}
                                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${ratingFilter === r.value
                                                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                                }`}
                                        >
                                            {r.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Dietary */}
                            <div>
                                <label className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block mb-2.5">
                                    Dietary Requirements
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {DIETARY.map((d) => (
                                        <button
                                            key={d}
                                            type="button"
                                            onClick={() => onDietaryChange(d)}
                                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${dietaryFilter === d
                                                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                                }`}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Ambience */}
                            <div>
                                <label className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block mb-2.5">
                                    Ambience & Vibe
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {AMBIENCE.map((a) => (
                                        <button
                                            key={a}
                                            type="button"
                                            onClick={() => onAmbienceChange(a)}
                                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${ambienceFilter === a
                                                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                                }`}
                                        >
                                            {a}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Occasion */}
                            <div>
                                <label className="text-xs font-extrabold text-gray-400 uppercase tracking-wider block mb-2.5">
                                    Occasion
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {OCCASIONS.map((o) => (
                                        <button
                                            key={o}
                                            type="button"
                                            onClick={() => onOccasionChange(o)}
                                            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${occasionFilter === o
                                                ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                                : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                                                }`}
                                        >
                                            {o}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Open Now Toggle */}
                            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                <div>
                                    <p className="text-sm font-bold text-gray-800">Open Now Only</p>
                                    <p className="text-xs text-gray-400">Show restaurants currently open</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={onOpenNowToggle}
                                    className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out ${openNowFilter ? 'bg-emerald-500' : 'bg-gray-200'
                                        }`}
                                >
                                    <div
                                        className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${openNowFilter ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="pt-4 border-t border-gray-100 flex items-center gap-3">
                            <button
                                type="button"
                                onClick={() => {
                                    onClearAll();
                                }}
                                className="flex-1 py-3 text-center text-sm font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                            >
                                Clear All
                            </button>
                            <button
                                type="button"
                                onClick={() => setOpenDropdown(null)}
                                className="flex-[2] py-3 text-center text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-md transition-colors"
                            >
                                Show Results
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

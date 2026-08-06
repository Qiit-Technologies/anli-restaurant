'use client';

import React, { useState, useMemo } from 'react';
import {
    Search,
    X,
    ChevronDown,
    Star,
    Utensils,
    Clock,
    Heart,
    MapPin,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Restaurant } from '@/services/restaurant.service';
import SearchEmptyIllustration from './SearchEmptyIllustration';
import Footer from './Footer';
import { analytics } from '@/lib/mixpanel';

interface RestaurantSearchViewProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    onCloseSearch: () => void;
    restaurants: Restaurant[];
    allRestaurants?: Restaurant[];
    nearbyRestaurants?: Restaurant[];
    locationName?: string;
    loading?: boolean;
    favorites?: number[];
    onToggleFavorite?: (id: number) => void;
}

const DEFAULT_RECENTS = ['Sushi', 'Best restaurant close to me'];

const SORT_BY_OPTIONS = [
    'Location',
    'Delivery/Takeaway',
    'Restaurant amenities',
    'Open now',
    'Dietary preferences',
    'Rating',
];

export default function RestaurantSearchView({
    searchQuery,
    onSearchChange,
    onCloseSearch,
    restaurants,
    allRestaurants = [],
    nearbyRestaurants = [],
    locationName = 'Lekki Phase 1',
    loading = false,
    favorites = [],
    onToggleFavorite,
}: RestaurantSearchViewProps) {
    const [priceFilter, setPriceFilter] = useState<string>('all');
    const [cuisineFilter, setCuisineFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('Location');
    const [recentSearches, setRecentSearches] = useState<string[]>(DEFAULT_RECENTS);
    const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);
    const [isCuisineDropdownOpen, setIsCuisineDropdownOpen] = useState(false);
    const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
    const [isCustomPriceOpen, setIsCustomPriceOpen] = useState(false);

    const [minPrice, setMinPrice] = useState('50,000');
    const [maxPrice, setMaxPrice] = useState('50,000');

    const filteredResults = useMemo(() => {
        let list = [...restaurants];

        if (priceFilter !== 'all') {
            list = list.filter((r) => r.tags?.includes(priceFilter));
        }

        if (cuisineFilter !== 'all') {
            list = list.filter((r) =>
                r.tags?.toLowerCase().includes(cuisineFilter.toLowerCase())
            );
        }

        if (sortBy === 'Rating') {
            list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        } else if (sortBy === 'Location') {
            list.sort((a, b) => (a.address || '').localeCompare(b.address || ''));
        }

        return list;
    }, [restaurants, priceFilter, cuisineFilter, sortBy]);

    const hasQuery = searchQuery.trim().length > 0;

    const handleRecentClick = (term: string) => {
        analytics.track('recent_search_clicked', {
            search_term: term,
        });
        onSearchChange(term);
    };

    const closestItems = nearbyRestaurants.length > 0 ? nearbyRestaurants : [];
    const fineDiningItems = allRestaurants.length > 0 ? allRestaurants : [];
    const topResults = filteredResults.length > 0 ? filteredResults : allRestaurants;

    return (
        <div className="w-full min-h-[80vh]  my-4 transition-all">
            {/* 1. Search Bar */}
            <div className="relative mb-6">
                <div className="relative flex items-center bg-gray-50 rounded-full px-5 py-3 focus-within:ring-2 focus-within:ring-orange-100 transition-all">
                    <Search className="text-gray-400 mr-3 flex-shrink-0" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search restaurant name etc"
                        className="flex-1 bg-transparent text-sm md:text-base text-gray-800 placeholder-gray-400 focus:outline-none"
                        autoFocus
                    />
                    <button
                        type="button"
                        onClick={() => {
                            if (searchQuery) {
                                onSearchChange('');
                            } else {
                                onCloseSearch();
                            }
                        }}
                        className="p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-200 transition-colors ml-2"
                        aria-label="Clear or close search"
                    >
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* 2. Filters Bar & Recent Searches & Sort By */}
            <div className="flex flex-col gap-4 mb-8">
                {/* Price & Cuisine & Sort Filters */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        {/* Price Range Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsPriceDropdownOpen(!isPriceDropdownOpen);
                                    setIsCuisineDropdownOpen(false);
                                    setIsSortDropdownOpen(false);
                                    setIsCustomPriceOpen(false);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100/70 hover:bg-gray-100 rounded-full text-xs md:text-sm font-medium text-gray-700 transition-colors"
                            >
                                <span>Price {priceFilter !== 'all' ? `: ${priceFilter}` : ''}</span>
                                <ChevronDown size={14} className="text-gray-400" />
                            </button>

                            {/* Preset Price Ranges Dropdown */}
                            {isPriceDropdownOpen && (
                                <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl py-2 z-40 animate-in fade-in zoom-in-95 duration-150 divide-y divide-gray-50">
                                    <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                        Price range
                                    </div>
                                    {['₦30,000–90,000 per person', '₦15,000–30,000 per person', '₦20,000–100,000 per person', '₦50,000–800,000 per person'].map((range) => (
                                        <button
                                            key={range}
                                            type="button"
                                            onClick={() => {
                                                setPriceFilter(range);
                                                setIsPriceDropdownOpen(false);
                                                analytics.track('filter_applied', {
                                                    filter_type: 'price',
                                                    filter_value: range,
                                                });
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-xs md:text-sm hover:bg-orange-50 transition-colors ${priceFilter === range ? 'font-bold text-orange-600' : 'text-gray-800'
                                                }`}
                                        >
                                            {range}
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsPriceDropdownOpen(false);
                                            setIsCustomPriceOpen(true);
                                        }}
                                        className="w-full text-center py-2.5 text-xs font-bold text-orange-600 bg-orange-50/50 hover:bg-orange-100/50 transition-colors"
                                    >
                                        Custom range slider &rarr;
                                    </button>
                                </div>
                            )}

                            {/* Custom Price Range Picker Popup */}
                            {isCustomPriceOpen && (
                                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl p-4 z-40 animate-in fade-in zoom-in-95 duration-150">
                                    <div className="text-xs font-medium text-gray-400 mb-3">price</div>
                                    <div className="w-full h-1.5 bg-gray-200 rounded-full relative mb-4">
                                        <div className="absolute left-0 right-1/4 top-0 bottom-0 bg-[#FF8A00] rounded-full" />
                                    </div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5">
                                            <span className="text-xs text-gray-400 font-bold mr-1">₦</span>
                                            <input
                                                type="text"
                                                value={minPrice}
                                                onChange={(e) => setMinPrice(e.target.value)}
                                                className="w-full bg-transparent text-xs text-gray-800 focus:outline-none"
                                            />
                                        </div>
                                        <span className="text-xs text-gray-500 font-medium">To</span>
                                        <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5">
                                            <span className="text-xs text-gray-400 font-bold mr-1">₦</span>
                                            <input
                                                type="text"
                                                value={maxPrice}
                                                onChange={(e) => setMaxPrice(e.target.value)}
                                                className="w-full bg-transparent text-xs text-gray-800 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPriceFilter(`₦${minPrice} - ₦${maxPrice}`);
                                            setIsCustomPriceOpen(false);
                                            analytics.track('filter_applied', {
                                                filter_type: 'price_custom',
                                                filter_value: `₦${minPrice} - ₦${maxPrice}`,
                                            });
                                        }}
                                        className="w-full py-2 bg-[#0085FF] hover:bg-[#0073E6] text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
                                    >
                                        Save
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Cuisine Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsCuisineDropdownOpen(!isCuisineDropdownOpen);
                                    setIsPriceDropdownOpen(false);
                                    setIsSortDropdownOpen(false);
                                    setIsCustomPriceOpen(false);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-100/70 hover:bg-gray-100 rounded-full text-xs md:text-sm font-medium text-gray-700 transition-colors"
                            >
                                <span>Cuisine {cuisineFilter !== 'all' ? `: ${cuisineFilter}` : ''}</span>
                                <ChevronDown size={14} className="text-gray-400" />
                            </button>
                            {isCuisineDropdownOpen && (
                                <div className="absolute top-full left-0 mt-2 w-44 bg-white rounded-2xl shadow-xl py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                                    {['all', 'Sushi', 'Suya', 'Fine Dining', 'Bar', 'Roof Top', 'Italian', 'Japanese'].map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => {
                                                setCuisineFilter(c);
                                                setIsCuisineDropdownOpen(false);
                                                analytics.track('filter_applied', {
                                                    filter_type: 'cuisine',
                                                    filter_value: c,
                                                });
                                            }}
                                            className={`w-full text-left px-4 py-2 text-xs md:text-sm hover:bg-orange-50 ${cuisineFilter === c ? 'font-bold text-orange-600' : 'text-gray-700'
                                                }`}
                                        >
                                            {c === 'all' ? 'All Cuisines' : c}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sort By Dropdown */}
                    <div className="flex items-center gap-2 relative">
                        <span className="text-xs md:text-sm text-gray-500 font-medium">Sort by</span>
                        <button
                            type="button"
                            onClick={() => {
                                setIsSortDropdownOpen(!isSortDropdownOpen);
                                setIsPriceDropdownOpen(false);
                                setIsCuisineDropdownOpen(false);
                                setIsCustomPriceOpen(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100/70 hover:bg-gray-100 rounded-full text-xs md:text-sm font-medium text-gray-700 transition-colors"
                        >
                            <span>{sortBy}</span>
                            <ChevronDown size={14} className="text-gray-400" />
                        </button>
                        {isSortDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl py-2 z-40 animate-in fade-in zoom-in-95 duration-150">
                                <div className="px-4 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    Sort by
                                </div>
                                {SORT_BY_OPTIONS.map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => {
                                            setSortBy(opt);
                                            setIsSortDropdownOpen(false);
                                            analytics.track('sort_applied', {
                                                sort_by: opt,
                                            });
                                        }}
                                        className={`w-full text-left px-4 py-2.5 text-xs md:text-sm hover:bg-orange-50 transition-colors ${sortBy === opt ? 'font-bold text-orange-600' : 'text-gray-800'
                                            }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Searches row */}
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs md:text-sm font-medium text-gray-400 mr-2">
                        Recent Searches
                    </span>
                    {recentSearches.map((term) => (
                        <button
                            key={term}
                            type="button"
                            onClick={() => handleRecentClick(term)}
                            className="px-3.5 py-1.5 bg-gray-100/70 hover:bg-orange-50 hover:text-orange-600 rounded-lg text-xs font-medium text-gray-600 transition-colors"
                        >
                            {term}
                        </button>
                    ))}
                </div>
            </div>

            {/* 3. Main Results or Empty State */}
            {hasQuery && filteredResults.length === 0 ? (
                <div className="py-8 flex flex-col items-center justify-center text-center">
                    <div className="mb-4">
                        <Image src="/search.png" alt="No search results" width={200} height={200} />                    </div>

                    <p className="text-sm md:text-base font-medium text-gray-700 max-w-md mb-6">
                        Sorry, we could not find any matching results for your search
                    </p>

                    <div className="w-full max-w-md relative mb-8">
                        <div className="flex items-center bg-gray-50 rounded-full px-4 py-2">
                            <Search size={16} className="text-gray-400 mr-2" />
                            <input
                                type="text"
                                placeholder="try another search"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="w-full text-xs md:text-sm text-gray-700 placeholder-gray-400 bg-transparent focus:outline-none"
                            />
                        </div>
                    </div>

                    <div className="text-left bg-gray-50 rounded-2xl p-5 w-full max-w-md mb-8">
                        <h4 className="text-sm font-bold text-[#1A1A1A] mb-2">Search Tip:</h4>
                        <ul className="text-xs md:text-sm text-gray-600 space-y-1.5 list-disc list-inside">
                            <li>Try searching by food name</li>
                            <li>Check the spelling</li>
                            <li>Try alternate words</li>
                        </ul>
                    </div>
                </div>
            ) : (
                <div className="mb-10">
                    <h3 className="text-lg md:text-xl font-bold text-[#1A1A1A] mb-4">
                        {hasQuery ? `Results for "${searchQuery}"` : 'Recommendations'}
                    </h3>

                    {/* Top Row: Wide Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-6">
                        {topResults.slice(0, 3).map((item: any) => {
                            const id = item.id;
                            const title = item.name || 'Restaurant';
                            const slug = (item.name || 'restaurant')
                                .toLowerCase()
                                .trim()
                                .replace(/\s+/g, '-')
                                .replace(/[^\w-]+/g, '')
                                .replace(/--+/g, '-') || 'restaurant';
                            const isBookable = item.isBookable !== false;
                            const isScraped = item.isScraped === true;
                            const priceText = '₦30,000-90,000 per person';
                            const imgSrc =
                                item.coverImage ||
                                item.image ||
                                'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80';

                            return (
                                <Link
                                    key={id}
                                    href={isBookable ? `/restaurants/${slug}` : `/restaurant/${id}`}
                                    className="group relative h-48 md:h-52 rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                                >
                                    <Image
                                        src={imgSrc}
                                        alt={title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4 text-white">
                                        <p className="text-sm md:text-base font-bold truncate">
                                            {title}
                                        </p>
                                        <p className="text-xs text-gray-200 mt-0.5 font-medium">
                                            {priceText}
                                        </p>
                                        {isScraped && (
                                            <p className="text-xs text-orange-400 mt-0.5 font-medium">
                                                Requested Reservation
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Bottom Row: Food Thumbnails Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                        {topResults.slice(3, 8).map((res: any) => {
                            const id = res.id;
                            const slug = (res.name || 'restaurant')
                                .toLowerCase()
                                .trim()
                                .replace(/\s+/g, '-')
                                .replace(/[^\w-]+/g, '')
                                .replace(/--+/g, '-') || 'restaurant';
                            const isBookable = res.isBookable !== false;
                            const isScraped = res.isScraped === true;
                            const imgSrc =
                                res.coverImage ||
                                res.image ||
                                'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80';

                            return (
                                <Link
                                    key={id}
                                    href={isBookable ? `/restaurants/${slug}` : `/restaurant/${id}`}
                                    className="group relative h-32 md:h-36 rounded-[16px] overflow-hidden shadow-sm hover:shadow-md transition-all"
                                >
                                    <Image
                                        src={imgSrc}
                                        alt={res.name || 'Food item'}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    {isScraped && (
                                        <div className="absolute top-2 left-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                            Reservation
                                        </div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 4. SECTION 1: "Restaurant closest to you" */}
            {closestItems.length > 0 && (
                <div className="bg-[#0A0A0A] text-white rounded-[28px] p-6 md:p-8 my-10 shadow-2xl overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                                Restaurant closest to you
                            </h2>
                            <div className="flex items-center gap-1.5 mt-1 text-xs text-orange-400 font-medium">
                                <MapPin size={13} className="text-orange-500" />
                                <span>Near {locationName}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {closestItems.slice(0, 3).map((res: any) => {
                            const id = res.id;
                            const name = res.name || 'Restaurant';
                            const slug = (res.name || 'restaurant')
                                .toLowerCase()
                                .trim()
                                .replace(/\s+/g, '-')
                                .replace(/[^\w-]+/g, '')
                                .replace(/--+/g, '-') || 'restaurant';
                            const isBookable = res.isBookable !== false;
                            const isScraped = res.isScraped === true;
                            const rating = res.rating || 4.8;
                            const hours = res.openingHours || res.hours || 'Open now 10:00 am close 11 : pm';
                            const tags = res.tags || 'Restaurant';
                            const imgSrc = res.coverImage || res.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';
                            const isFav = favorites.includes(id);

                            return (
                                <div key={id} className="flex flex-col bg-[#141414] rounded-[24px] overflow-hidden border border-white/5 hover:border-white/20 transition-all group">
                                    <div className="relative w-full h-44 md:h-48 overflow-hidden">
                                        <Image
                                            src={imgSrc}
                                            alt={name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => onToggleFavorite && onToggleFavorite(id)}
                                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-orange-500 hover:scale-110 transition-transform"
                                        >
                                            <Heart size={16} className={isFav ? 'fill-orange-500 text-orange-500' : 'text-orange-500'} />
                                        </button>
                                    </div>

                                    <div className="p-4 flex flex-col flex-1 justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-sm md:text-base font-bold text-white truncate">
                                                    {name}
                                                </h3>
                                                <div className="flex items-center gap-1 text-xs text-orange-400 font-bold">
                                                    <Star size={12} className="fill-orange-400 text-orange-400" />
                                                    {rating}/5
                                                </div>
                                            </div>

                                            <p className="text-[11px] text-gray-400 mb-1 flex items-center gap-1">
                                                <Clock size={11} className="text-gray-400" />
                                                {hours}
                                            </p>

                                            <p className="text-[11px] text-gray-400 mb-4 flex items-center gap-1">
                                                <Utensils size={11} className="text-gray-400" />
                                                {tags}
                                            </p>
                                        </div>

                                        <Link
                                            href={isBookable ? `/restaurants/${slug}/reservation` : `/restaurant/${id}/reservation`}
                                            className="w-full py-2.5 bg-white hover:bg-orange-500 hover:text-white text-orange-600 text-xs font-bold text-center rounded-full transition-colors shadow-sm"
                                        >
                                            Book Reservation
                                        </Link>
                                        {isScraped && (
                                            <p className="text-[10px] text-orange-400 font-bold text-center mt-1">
                                                Reservation Request
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 5. SECTION 2: "Other Fine dining Restaurant" */}
            {fineDiningItems.length > 0 && (
                <div className="bg-[#F8F9FA] rounded-[28px] p-6 md:p-8 my-8 shadow-sm">
                    <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A] mb-6">
                        Other Fine dining Restaurant
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {fineDiningItems.slice(0, 3).map((res: any) => {
                            const id = res.id;
                            const name = res.name || 'Restaurant';
                            const slug = (res.name || 'restaurant')
                                .toLowerCase()
                                .trim()
                                .replace(/\s+/g, '-')
                                .replace(/[^\w-]+/g, '')
                                .replace(/--+/g, '-') || 'restaurant';
                            const isBookable = res.isBookable !== false;
                            const isScraped = res.isScraped === true;
                            const rating = res.rating || 4.8;
                            const hours = res.openingHours || res.hours || 'Open now 10:00 am close 11 : pm';
                            const tags = res.tags || 'Restaurant';
                            const imgSrc = res.coverImage || res.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80';
                            const isFav = favorites.includes(id);

                            return (
                                <div key={id} className="flex flex-col bg-white rounded-[24px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all group">
                                    <div className="relative w-full h-44 md:h-48 overflow-hidden">
                                        <Image
                                            src={imgSrc}
                                            alt={name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => onToggleFavorite && onToggleFavorite(id)}
                                            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-orange-500 hover:scale-110 transition-transform"
                                        >
                                            <Heart size={16} className={isFav ? 'fill-orange-500 text-orange-500' : 'text-orange-500'} />
                                        </button>
                                    </div>

                                    <div className="p-4 flex flex-col flex-1 justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="text-sm md:text-base font-bold text-[#1A1A1A] truncate">
                                                    {name}
                                                </h3>
                                                <div className="flex items-center gap-1 text-xs text-orange-500 font-bold">
                                                    <Star size={12} className="fill-orange-500 text-orange-500" />
                                                    {rating}/5
                                                </div>
                                            </div>

                                            <p className="text-[11px] text-gray-500 mb-1 flex items-center gap-1">
                                                <Clock size={11} className="text-gray-400" />
                                                {hours}
                                            </p>

                                            <p className="text-[11px] text-gray-500 mb-4 flex items-center gap-1">
                                                <Utensils size={11} className="text-gray-400" />
                                                {tags}
                                            </p>
                                        </div>

                                        <Link
                                            href={isBookable ? `/restaurants/${slug}/reservation` : `/restaurant/${id}/reservation`}
                                            className="w-full py-2.5 bg-gray-50 hover:bg-orange-500 hover:text-white text-orange-600 text-xs font-bold text-center rounded-full transition-colors border border-gray-100"
                                        >
                                            Book Reservation
                                        </Link>
                                        {isScraped && (
                                            <p className="text-[10px] text-orange-400 font-bold text-center mt-1">
                                                Reservation Request
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 6. Footer */}
            <Footer />
        </div>
    );
}

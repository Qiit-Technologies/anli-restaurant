'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Search,
    MapPin,
    ChevronDown,
    Bell,
    Star,
    Utensils,
    Clock,
    Heart,
    ChevronLeft,
    ChevronRight,
    Navigation,
    Loader2,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { restaurantService, Restaurant } from '@/services/restaurant.service';
import { customerAuthService } from '@/services/customerAuth.service';
import { analytics } from '@/lib/mixpanel';
import CustomerHeader from './CustomerHeader';
import LocationModal from './LocationModal';
import RestaurantSearchView from './RestaurantSearchView';
import Footer from './Footer';
import toast from 'react-hot-toast';

export default function RestaurantLanding() {
    const router = useRouter();
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [nearbyRestaurants, setNearbyRestaurants] = useState<Restaurant[]>(
        [],
    );
    const [loading, setLoading] = useState(true);
    const [nearbyLoading, setNearbyLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [autocompleteResults, setAutocompleteResults] = useState<
        { name: string; address: string; rating: number; coverImage: string }[]
    >([]);
    const [autocompleteLoading, setAutocompleteLoading] = useState(false);
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [locationName, setLocationName] = useState('Lekki Phase 1');
    const [scrolled, setScrolled] = useState(false);
    const [favorites, setFavorites] = useState<number[]>([]);
    const [currentUser, setCurrentUser] = useState<{
        firstName: string;
    } | null>(null);
    const [isMobileLocationOpen, setIsMobileLocationOpen] = useState(false);
    const [searchResults, setSearchResults] = useState<Restaurant[]>([]);
    const [searchTotal, setSearchTotal] = useState(0);
    const [searchLoading, setSearchLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [visibleCount, setVisibleCount] = useState(6);
    const autocompleteTimerRef = React.useRef<ReturnType<
        typeof setTimeout
    > | null>(null);
    const searchTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(
        null,
    );

    // Time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Debounce search query for server-side search
    useEffect(() => {
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        setVisibleCount(6);
        searchTimerRef.current = setTimeout(() => {
            setDebouncedQuery(searchQuery);
        }, 300);
        return () => {
            if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        };
    }, [searchQuery]);

    // Server-side search when debounced query changes
    useEffect(() => {
        if (!debouncedQuery.trim()) {
            setIsSearching(false);
            setSearchResults([]);
            setSearchTotal(0);
            return;
        }
        let cancelled = false;
        const performSearch = async () => {
            setIsSearching(true);
            setSearchLoading(true);
            try {
                const data = await restaurantService.search(
                    debouncedQuery.trim(),
                    undefined,
                    1,
                    20,
                );
                if (!cancelled) {
                    setSearchResults(data.restaurants);
                    setSearchTotal(data.total);
                    setIsSearching(false);
                }
            } catch {
                if (!cancelled) {
                    setIsSearching(false);
                    setSearchResults([]);
                    setSearchTotal(0);
                }
            } finally {
                if (!cancelled) setSearchLoading(false);
            }
        };
        performSearch();
        return () => {
            cancelled = true;
        };
    }, [debouncedQuery]);

    const filteredRestaurants = restaurants;
    const filteredNearbyRestaurants = nearbyRestaurants;

    useEffect(() => {
        const fetchFavorites = async () => {
            const user = customerAuthService.getUser();
            if (user) {
                setCurrentUser(user);
                try {
                    const favs = await customerAuthService.getFavorites();
                    setFavorites(favs.map((f: any) => f.id));
                } catch (err) {
                    console.error('Error fetching favorites:', err);
                }
            }
        };
        fetchFavorites();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch featured/general restaurants
                const data = await restaurantService.getFeatured();
                setRestaurants(data);
                setNearbyRestaurants(data.slice(0, 3)); // Default fallback

                // Request location
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        async (position) => {
                            const { latitude, longitude } = position.coords;

                            // Fetch restaurants near this location
                            try {
                                const nearby =
                                    await restaurantService.getNearby(
                                        latitude,
                                        longitude,
                                    );
                                if (nearby && nearby.length > 0) {
                                    setNearbyRestaurants(nearby);
                                }

                                // Reverse geocode to get location name using Google API via backend
                                const name =
                                    await restaurantService.reverseGeocode(
                                        latitude,
                                        longitude,
                                    );
                                setLocationName(name);
                            } catch (err) {
                                console.error(
                                    'Error fetching nearby data:',
                                    err,
                                );
                            }
                        },
                        async (error) => {
                            console.warn(
                                'Geolocation denied or failed:',
                                error,
                            );
                            // Fallback to Lekki Phase 1 coordinates
                            try {
                                const nearby =
                                    await restaurantService.getNearby(
                                        6.4474,
                                        3.4722,
                                    );
                                if (nearby && nearby.length > 0) {
                                    setNearbyRestaurants(nearby);
                                }
                            } catch (err) {
                                console.error(
                                    'Error fetching fallback nearby data:',
                                    err,
                                );
                            }
                        },
                    );
                }
            } catch (error) {
                console.error('Error fetching restaurants:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!loading && restaurants.length > 0) {
            analytics.track('page_view', {
                page_name: 'restaurant_landing',
                restaurant_count: restaurants.length,
                nearby_count: nearbyRestaurants.length,
                location: locationName,
            });
        }
    }, [loading, restaurants, nearbyRestaurants, locationName]);

    return (
        <div className="min-h-screen bg-[#F6F6F8]">
            <CustomerHeader
                locationName={locationName}
                onSearchClick={() => setIsSearchMode(true)}
                onLocationChange={async (newLoc, lat, lng) => {
                    setLocationName(newLoc);
                    analytics.track('location_changed', {
                        location: newLoc,
                        latitude: lat,
                        longitude: lng,
                    });
                    console.log(
                        'Location changed in header:',
                        newLoc,
                        lat,
                        lng,
                    );
                    setNearbyLoading(true);
                    try {
                        let coords = lat && lng ? { lat, lng } : null;
                        if (!coords) {
                            coords = await restaurantService.geocode(newLoc);
                            console.log('Geocode result:', coords);
                        }

                        if (coords) {
                            const nearby = await restaurantService.getNearby(
                                coords.lat,
                                coords.lng,
                            );
                            console.log('Nearby restaurants:', nearby);
                            if (nearby && nearby.length > 0) {
                                setNearbyRestaurants(nearby);
                            } else {
                                alert(
                                    'No restaurants found for this location.',
                                );
                            }
                        } else {
                            alert(
                                'Could not find coordinates for this location.',
                            );
                        }
                    } catch (err) {
                        console.error(
                            'Error in location change from header:',
                            err,
                        );
                        alert('Error searching for location.');
                    } finally {
                        setNearbyLoading(false);
                    }
                }}
            />

            <main className="pt-20">
                {/* Hero & Featured Container */}
                <div className="max-w-7xl mx-auto px-4 md:px-8 pt-3 md:pt-10">
                        {/* ── DESKTOP Hero Banner (hidden on mobile) ── */}
                        <section className="relative w-full mb-10 hidden md:block">
                            {/* Banner Image Container with overflow-hidden for rounded corners */}
                            <div className="relative w-full h-[300px] rounded-[24px] overflow-hidden">
                                <Image
                                    src="/landing/home-banner.png"
                                    alt="Explore the best Restaurant closest to you"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                {/* Dark gradient overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent rounded-[24px]" />
                            </div>

                            {/* Search bar overlay - outside overflow-hidden so dropdown pops out freely */}
                            <div className="absolute bottom-6 left-6 w-[50%] max-w-md z-40">
                                <div className="relative">
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            if (searchQuery.trim()) {
                                                setShowAutocomplete(false);
                                                analytics.track('search_submitted', {
                                                    search_query: searchQuery.trim(),
                                                });
                                                router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                                            }
                                        }}
                                        className="relative flex items-center bg-white/95 backdrop-blur-sm rounded-lg border border-gray-200 px-2 py-1.5 shadow-lg"
                                    >
                                        <Search
                                            className="text-gray-400 flex-shrink-0 ml-1"
                                            size={16}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Search restaurants by name, cuisine..."
                                            value={searchQuery}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                setSearchQuery(val);
                                                setShowAutocomplete(val.trim().length > 0);
                                            }}
                                            onFocus={() => {
                                                if (searchQuery.trim().length > 0) {
                                                    setShowAutocomplete(true);
                                                }
                                            }}
                                            className="flex-1 bg-transparent px-3 py-1.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
                                        />
                                        {searchQuery && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSearchQuery('');
                                                    setShowAutocomplete(false);
                                                }}
                                                className="flex-shrink-0 mr-1 w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="13"
                                                    height="13"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2.5"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <line x1="18" y1="6" x2="6" y2="18" />
                                                    <line x1="6" y1="6" x2="18" y2="18" />
                                                </svg>
                                            </button>
                                        )}
                                    </form>

                                    {/* Autocomplete Options Dropdown */}
                                    {showAutocomplete && searchQuery.trim() && (
                                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150">
                                            {restaurants.filter((r) =>
                                                r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                r.tags?.toLowerCase().includes(searchQuery.toLowerCase())
                                            ).length > 0 ? (
                                                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                                                    {restaurants
                                                        .filter((r) =>
                                                            r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                            r.tags?.toLowerCase().includes(searchQuery.toLowerCase())
                                                        )
                                                        .slice(0, 5)
                                                        .map((res) => (
                                                            <button
                                                                key={res.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    setShowAutocomplete(false);
                                                                    analytics.track('restaurant_clicked', {
                                                                        restaurant_id: res.id,
                                                                        restaurant_name: res.name,
                                                                        source: 'autocomplete',
                                                                    });
                                                                    router.push(`/restaurants/${res.id}`);
                                                                }}
                                                                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left group"
                                                            >
                                                                {res.coverImage ? (
                                                                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 relative">
                                                                        <Image
                                                                            src={res.coverImage}
                                                                            alt={res.name}
                                                                            fill
                                                                            className="object-cover"
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                                                                        <Utensils size={16} className="text-orange-500" />
                                                                    </div>
                                                                )}
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-semibold text-gray-800 group-hover:text-orange-600 truncate">
                                                                        {res.name}
                                                                    </p>
                                                                    <p className="text-xs text-gray-400 truncate">
                                                                        {res.tags || res.address || 'Restaurant'}
                                                                    </p>
                                                                </div>
                                                                {res.rating && (
                                                                    <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                                                                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                                                                        {res.rating}
                                                                    </div>
                                                                )}
                                                            </button>
                                                        ))}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowAutocomplete(false);
                                                            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                                                        }}
                                                        className="w-full py-2.5 px-4 bg-orange-50/60 hover:bg-orange-100/60 text-xs font-bold text-orange-600 text-center transition-colors"
                                                    >
                                                        See all results for &quot;{searchQuery}&quot; &rarr;
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="p-4 text-center">
                                                    <p className="text-xs text-gray-500 mb-2">No matching restaurant found</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setShowAutocomplete(false);
                                                            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                                                        }}
                                                        className="text-xs font-bold text-orange-500 hover:underline"
                                                    >
                                                        Search all for &quot;{searchQuery}&quot; &rarr;
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                    {/* ── MOBILE Banner + Search (hidden on desktop) ── */}
                    <section className="md:hidden w-full mb-3 -mt-3">
                        {/* Greeting + Location */}
                        <div className="flex items-start justify-between -mb-2">
                            <div>
                                <p className="text-base font-bold text-[#1A1A1A]">
                                    Hello {getGreeting()}
                                    {currentUser
                                        ? `, ${currentUser.firstName}`
                                        : ''}
                                    !
                                </p>
                                <button
                                    onClick={() =>
                                        setIsMobileLocationOpen(true)
                                    }
                                    className="mt-1 inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1 hover:border-orange-400 hover:bg-orange-50 transition-all group"
                                >
                                    <MapPin
                                        size={12}
                                        className="text-gray-400 group-hover:text-orange-500"
                                    />
                                    <span className="text-xs text-gray-500 group-hover:text-[#3D2117]">
                                        {locationName}
                                    </span>
                                    <ChevronDown
                                        size={12}
                                        className="text-gray-400 group-hover:text-orange-500"
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Mobile banner image */}
                        <div className="relative w-full h-[160px] rounded-[16px] overflow-hidden mb-1.5">
                            <Image
                                src="/landing/home-banner-mobile.png"
                                alt="Book the best restaurant closest to you"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>

                        {/* Mobile search bar — below the banner */}
                        <div className="relative">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (searchQuery.trim()) {
                                        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                                    }
                                }}
                                className="relative flex items-center bg-white rounded-full border border-gray-200 shadow-sm px-4 py-3"
                            >
                                <Search
                                    className="text-gray-400 flex-shrink-0"
                                    size={18}
                                />
                                <input
                                    type="text"
                                    placeholder="Search restaurant name, cuisine, location..."
                                    value={searchQuery}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setSearchQuery(val);
                                        setShowAutocomplete(val.trim().length > 0);
                                    }}
                                    onFocus={() => {
                                        if (searchQuery.trim().length > 0) setShowAutocomplete(true);
                                    }}
                                    className="flex-1 bg-transparent px-3 text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSearchQuery('');
                                            setShowAutocomplete(false);
                                        }}
                                        className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 transition-colors"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="11"
                                            height="11"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2.5"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <line
                                                x1="18"
                                                y1="6"
                                                x2="6"
                                                y2="18"
                                            />
                                            <line
                                                x1="6"
                                                y1="6"
                                                x2="18"
                                                y2="18"
                                            />
                                        </svg>
                                    </button>
                                )}
                            </form>
                            {showAutocomplete && searchQuery.trim() && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                                    {restaurants.filter((r) =>
                                        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        r.tags?.toLowerCase().includes(searchQuery.toLowerCase())
                                    ).length > 0 ? (
                                        <div className="max-h-64 overflow-y-auto divide-y divide-gray-50">
                                            {restaurants
                                                .filter((r) =>
                                                    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                    r.tags?.toLowerCase().includes(searchQuery.toLowerCase())
                                                )
                                                .slice(0, 5)
                                                .map((res) => (
                                                    <button
                                                        key={res.id}
                                                        type="button"
                                                                onClick={() => {
                                                                    setShowAutocomplete(false);
                                                                    analytics.track('restaurant_clicked', {
                                                                        restaurant_id: res.id,
                                                                        restaurant_name: res.name,
                                                                        source: 'search_results',
                                                                    });
                                                                    router.push(`/restaurants/${res.id}`);
                                                                }}
                                                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors text-left"
                                                    >
                                                        {res.coverImage ? (
                                                            <div className="w-9 h-9 rounded-md overflow-hidden flex-shrink-0 relative">
                                                                <Image
                                                                    src={res.coverImage}
                                                                    alt={res.name}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-9 h-9 rounded-md bg-orange-100 flex items-center justify-center flex-shrink-0">
                                                                <Utensils size={14} className="text-orange-400" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-xs font-semibold text-gray-800 truncate">
                                                                {res.name}
                                                            </p>
                                                            <p className="text-[10px] text-gray-400 truncate">
                                                                {res.tags || res.address}
                                                            </p>
                                                        </div>
                                                    </button>
                                                ))}
                                        </div>
                                    ) : (
                                        <div className="p-3 text-center text-xs text-gray-500">
                                            No matching restaurant found
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Featured Section */}
                    <section className="mb-12">
                        <h2 className="text-xl md:text-2xl font-bold text-[#3D2117] mb-6">
                            Featured Restaurant
                        </h2>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                {[1, 2, 3].map((i) => (
                                    <div
                                        key={i}
                                        className="bg-gray-200 h-64 rounded-[24px] animate-pulse"
                                    ></div>
                                ))}
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredRestaurants
                                        .slice(0, visibleCount)
                                        .map((res) => (
                                            <RestaurantCard
                                                key={res.id}
                                                restaurant={res}
                                                isFavorite={favorites.includes(
                                                    res.id,
                                                )}
                                            />
                                        ))}
                                </div>
                                {filteredRestaurants.length > visibleCount && (
                                    <div className="flex justify-center mt-8">
                                        <button
                                            onClick={async () => {
                                                if (isSearching) {
                                                    const nextPage =
                                                        Math.ceil(
                                                            visibleCount / 20,
                                                        ) + 1;
                                                    try {
                                                        const data =
                                                            await restaurantService.search(
                                                                debouncedQuery.trim(),
                                                                undefined,
                                                                nextPage,
                                                                20,
                                                            );
                                                        setSearchResults(
                                                            (prev) => [
                                                                ...prev,
                                                                ...data.restaurants,
                                                            ],
                                                        );
                                                    } catch {
                                                        toast.error(
                                                            'Failed to load more results',
                                                        );
                                                    }
                                                }
                                                setVisibleCount(
                                                    (prev) => prev + 6,
                                                );
                                            }}
                                            className="px-6 py-2.5 rounded-full border border-orange-500 text-orange-500 font-medium text-sm hover:bg-orange-50 transition-colors"
                                        >
                                            Show More (
                                            {filteredRestaurants.length -
                                                visibleCount}{' '}
                                            remaining)
                                        </button>
                                    </div>
                                )}
                                {filteredRestaurants.length === 0 &&
                                    searchQuery && (
                                        <div className="text-center py-12 text-gray-400">
                                            <p className="text-lg font-medium">
                                                No restaurants found
                                            </p>
                                            <p className="text-sm mt-1">
                                                Try adjusting your search or
                                                explore nearby options.
                                            </p>
                                        </div>
                                    )}
                            </>
                        )}
                    </section>
                </div>

                {/* Full Width Nearby Section */}
                <section className="bg-[#1A1A1A] py-12 mb-10">
                    <div className="max-w-7xl mx-auto px-4 md:px-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                            <h2 className="text-xl md:text-2xl font-bold text-white">
                                Restaurant closest to you
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {nearbyLoading
                                ? [1, 2, 3].map((i) => (
                                      <div
                                          key={i}
                                          className="bg-white/10 h-64 rounded-[24px] animate-pulse"
                                      ></div>
                                  ))
                                : filteredNearbyRestaurants
                                      .slice(0, visibleCount)
                                      .map((res) => (
                                          <RestaurantCard
                                              key={res.id}
                                              restaurant={res}
                                              isFavorite={favorites.includes(
                                                  res.id,
                                              )}
                                              dark
                                          />
                                      ))}
                        </div>
                        {filteredNearbyRestaurants.length > visibleCount && (
                            <div className="flex justify-center mt-8">
                                <button
                                    onClick={async () => {
                                        if (isSearching) {
                                            const nextPage =
                                                Math.ceil(visibleCount / 20) +
                                                1;
                                            try {
                                                const data =
                                                    await restaurantService.search(
                                                        debouncedQuery.trim(),
                                                        undefined,
                                                        nextPage,
                                                        20,
                                                    );
                                                setSearchResults((prev) => [
                                                    ...prev,
                                                    ...data.restaurants,
                                                ]);
                                            } catch {
                                                toast.error(
                                                    'Failed to load more results',
                                                );
                                            }
                                        }
                                        setVisibleCount((prev) => prev + 6);
                                    }}
                                    className="px-6 py-2.5 rounded-full border border-orange-500 text-orange-500 font-medium text-sm hover:bg-orange-50 transition-colors"
                                >
                                    Show More (
                                    {filteredNearbyRestaurants.length -
                                        visibleCount}{' '}
                                    remaining)
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                <div className="max-w-7xl mx-auto px-4 md:px-8">
                    {/* Other Section */}
                    <section className="mb-12">
                        <h2 className="text-xl md:text-2xl font-bold text-[#3D2117] mb-6">
                            Other Fine dining Restaurant
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredRestaurants
                                .slice(0, visibleCount)
                                .map((res) => (
                                    <RestaurantCard
                                        key={res.id}
                                        restaurant={res}
                                        isFavorite={favorites.includes(res.id)}
                                    />
                                ))}
                        </div>
                    </section>
                </div>
            </main>

            <Footer />

            {/* Mobile Location Modal */}
            <LocationModal
                isOpen={isMobileLocationOpen}
                onClose={() => setIsMobileLocationOpen(false)}
                currentLocation={locationName}
                onSelect={(newLoc, lat, lon) => {
                    setLocationName(newLoc);
                    setIsMobileLocationOpen(false);
                }}
            />
        </div>
    );
}

function RestaurantCard({
    restaurant,
    dark = false,
    isFavorite: initialIsFavorite = false,
}: {
    restaurant: Restaurant;
    dark?: boolean;
    isFavorite?: boolean;
}) {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [isToggling, setIsToggling] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // List of images to display, fall back to coverImage, then fall back to default image
    const imagesList =
        restaurant.images && restaurant.images.length > 0
            ? restaurant.images
            : [
                  restaurant.coverImage ||
                      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80',
              ];

    useEffect(() => {
        setIsFavorite(initialIsFavorite);
    }, [initialIsFavorite]);

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const user = customerAuthService.getUser();
        if (!user) {
            toast.error('Please login to favorite restaurants');
            analytics.track('favorite_click', {
                restaurant_id: restaurant.id,
                restaurant_name: restaurant.name,
                action: 'login_required',
            });
            return;
        }

        setIsToggling(true);
        const previousFavorite = isFavorite;
        setIsFavorite(!isFavorite);

        try {
            await customerAuthService.toggleFavorite(restaurant.id);
            toast.success(
                previousFavorite ? 'Removed from favorites' : 'Added to favorites',
            );
            analytics.track('favorite_toggled', {
                restaurant_id: restaurant.id,
                restaurant_name: restaurant.name,
                action: previousFavorite ? 'removed' : 'added',
            });
        } catch (err) {
            setIsFavorite(previousFavorite);
            toast.error('Failed to update favorites');
            analytics.track('favorite_error', {
                restaurant_id: restaurant.id,
                restaurant_name: restaurant.name,
                error: err instanceof Error ? err.message : 'unknown',
            });
        } finally {
            setIsToggling(false);
        }
    };

    const handleNextImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % imagesList.length);
    };

    const handlePrevImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex(
            (prev) => (prev - 1 + imagesList.length) % imagesList.length,
        );
    };

    const hotelNameSlug =
        restaurant?.name
            .toString()
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-') || 'restaurant';

    return (
        <div
            className={`group rounded-[24px] overflow-hidden border transition-all duration-300 hover:shadow-xl ${dark ? 'bg-[#2A2A2A] border-white/10' : 'bg-white border-[#FFF5E9]'}`}
        >
            <div className="relative h-48 overflow-hidden group/slider">
                <Link
                    href={`/restaurants/${restaurant.id}`}
                    className="block h-full w-full relative"
                >
                    <Image
                        src={imagesList[currentImageIndex]}
                        alt={restaurant.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                </Link>

                {/* Navigation Arrows & Dots */}
                {imagesList.length > 1 && (
                    <>
                        <button
                            onClick={handlePrevImage}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm flex items-center justify-center text-gray-800 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 z-10 shadow-md active:scale-95 animate-in fade-in"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={handleNextImage}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm flex items-center justify-center text-gray-800 opacity-0 group-hover/slider:opacity-100 transition-opacity duration-300 z-10 shadow-md active:scale-95 animate-in fade-in"
                        >
                            <ChevronRight size={16} />
                        </button>

                        {/* Dot Indicators */}
                        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
                            {imagesList.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setCurrentImageIndex(index);
                                    }}
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${
                                        index === currentImageIndex
                                            ? 'bg-white w-3'
                                            : 'bg-white/50 hover:bg-white/80'
                                    }`}
                                />
                            ))}
                        </div>
                    </>
                )}

                <button
                    onClick={handleToggleFavorite}
                    disabled={isToggling}
                    className={`absolute top-3 right-3 w-9 h-9 backdrop-blur-md rounded-full flex items-center justify-center z-20 transition-all ${isFavorite ? 'bg-red-500 text-white' : 'bg-black/20 text-white hover:bg-white/20'}`}
                >
                    {isToggling ? (
                        <Loader2 size={18} className="animate-spin" />
                    ) : (
                        <Heart
                            size={18}
                            className={isFavorite ? 'fill-white' : ''}
                        />
                    )}
                </button>
            </div>

            <Link href={`/restaurants/${restaurant.id}`}>
                <div
                    className={`p-4 ${dark ? 'bg-[#2A2A2A]' : 'bg-[#FFFBFA]'}`}
                >
                    <div className="flex justify-between items-center mb-2">
                        <h3
                            className={`text-lg font-bold ${dark ? 'text-white' : 'text-[#3D2117]'}`}
                        >
                            {restaurant.name}
                        </h3>
                        <div className="flex items-center bg-orange-50 px-2 py-1 rounded-[24px]">
                            <Star
                                size={14}
                                className="text-orange-500 fill-orange-500"
                            />
                            <span className="text-[10px] font-bold ml-1 text-[#6B4226]">
                                {restaurant.rating || '4.8'}/5
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-2 text-gray-400">
                            <Utensils size={12} />
                            <span className="text-[9px] font-medium">
                                {restaurant.tags || 'Japanese, Sushi . $$$'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                            <Clock size={12} />
                            <span className="text-[9px] font-medium">
                                {restaurant.displayHours ||
                                    '10:00 am - 11:00 pm'}
                            </span>
                        </div>
                    </div>
                </div>
            </Link>

            <div
                className={`px-4 py-4 border-t ${dark ? 'border-white/10 bg-[#2A2A2A]' : 'border-gray-100 bg-white'}`}
            >
                {restaurant.isBookable !== false ? (
                    <Link
                        href={`/restaurants/${hotelNameSlug}/${restaurant.id}/reservation`}
                        className="text-[#FF8A00] font-bold text-sm hover:text-orange-600 transition-colors inline-block"
                    >
                        Book Reservation
                    </Link>
                ) : (
                    <Link
                        href={`/restaurants/${hotelNameSlug}/${restaurant.id}`}
                        className="text-gray-500 font-bold text-sm hover:text-gray-700 transition-colors inline-block"
                    >
                        View Details
                    </Link>
                )}
            </div>
        </div>
    );
}

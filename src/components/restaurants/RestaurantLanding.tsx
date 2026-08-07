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
import RestaurantSearchBar from './RestaurantSearchBar';
import FilterBar from './FilterBar';
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

    const [cuisineFilter, setCuisineFilter] = useState('All');
    const [priceFilter, setPriceFilter] = useState('All');
    const [ratingFilter, setRatingFilter] = useState(0);
    const [dietaryFilter, setDietaryFilter] = useState('All');
    const [ambienceFilter, setAmbienceFilter] = useState('All');
    const [occasionFilter, setOccasionFilter] = useState('All');
    const [openNowFilter, setOpenNowFilter] = useState(false);

    const filteredRestaurants = React.useMemo(() => {
        return restaurants.filter((res) => {
            if (cuisineFilter !== 'All' && !res.tags?.toLowerCase().includes(cuisineFilter.toLowerCase())) return false;
            if (priceFilter !== 'All' && res.priceLevel && !res.priceLevel.toLowerCase().includes(priceFilter.toLowerCase().replace(/[^a-z]/g, ''))) return false;
            if (ratingFilter > 0 && (res.rating || 0) < ratingFilter) return false;
            if (dietaryFilter !== 'All' && !(res.dietaryPreferences || []).some((d: string) => d.toLowerCase().includes(dietaryFilter.toLowerCase()))) return false;
            if (ambienceFilter !== 'All' && !(res.serviceTypes || []).some((s: string) => s.toLowerCase().includes(ambienceFilter.toLowerCase())) && !res.neighborhood?.toLowerCase().includes(ambienceFilter.toLowerCase())) return false;
            if (occasionFilter !== 'All' && !(res.serviceTypes || []).some((s: string) => s.toLowerCase().includes(occasionFilter.toLowerCase()))) return false;
            if (openNowFilter && !res.displayHours) return false;
            return true;
        });
    }, [restaurants, cuisineFilter, priceFilter, ratingFilter, dietaryFilter, ambienceFilter, occasionFilter, openNowFilter]);

    const filteredNearbyRestaurants = React.useMemo(() => {
        return nearbyRestaurants.filter((res) => {
            if (cuisineFilter !== 'All' && !res.tags?.toLowerCase().includes(cuisineFilter.toLowerCase())) return false;
            if (priceFilter !== 'All' && res.priceLevel && !res.priceLevel.toLowerCase().includes(priceFilter.toLowerCase().replace(/[^a-z]/g, ''))) return false;
            if (ratingFilter > 0 && (res.rating || 0) < ratingFilter) return false;
            if (dietaryFilter !== 'All' && !(res.dietaryPreferences || []).some((d: string) => d.toLowerCase().includes(dietaryFilter.toLowerCase()))) return false;
            if (ambienceFilter !== 'All' && !(res.serviceTypes || []).some((s: string) => s.toLowerCase().includes(ambienceFilter.toLowerCase())) && !res.neighborhood?.toLowerCase().includes(ambienceFilter.toLowerCase())) return false;
            if (occasionFilter !== 'All' && !(res.serviceTypes || []).some((s: string) => s.toLowerCase().includes(occasionFilter.toLowerCase()))) return false;
            if (openNowFilter && !res.displayHours) return false;
            return true;
        });
    }, [nearbyRestaurants, cuisineFilter, priceFilter, ratingFilter, dietaryFilter, ambienceFilter, occasionFilter, openNowFilter]);

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

            <main className="pt-14">
                {/* Hero & Featured Container */}
                <div className="max-w-7xl mx-auto px-4 md:px-8 pt-3 md:pt-10">
                    {/* ── DESKTOP Hero Banner (hidden on mobile) ── */}
                    <section className="relative w-full mb-8 hidden md:block rounded-[24px]">
                        {/* Banner Image Container with rounded corners */}
                        <div className="relative w-full h-[260px] md:h-[300px] rounded-[24px] overflow-hidden shadow-md bg-[#0A0A0A]">
                            <Image
                                src="/landing/home-banner.png"
                                alt="Explore the best Restaurant closest to you"
                                fill
                                className="object-cover object-center"
                                priority
                            />
                            {/* Dark gradient overlay */}
                            <div className="absolute inset-0 " />
                        </div>

                        {/* Search bar INSIDE hero image (bottom-left as in screenshot) */}
                        <div className="absolute bottom-6 left-6 right-6 z-[70] max-w-3xl">
                            <RestaurantSearchBar
                                searchQuery={searchQuery}
                                onSearchQueryChange={setSearchQuery}
                                locationName={locationName}
                                onLocationChange={setLocationName}
                                restaurants={restaurants}
                            />
                        </div>
                    </section>

                    {/* ── MOBILE Banner + Search (hidden on desktop) ── */}
                    <section className="md:hidden w-full mb-6 -mt-3 relative z-[70]">
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
                        <div className="relative w-full h-[160px] rounded-[16px] overflow-hidden mb-3">
                            <Image
                                src="/landing/home-banner-mobile.png"
                                alt="Book the best restaurant closest to you"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>

                        {/* Mobile Airbnb Search Bar */}
                        <RestaurantSearchBar
                            searchQuery={searchQuery}
                            onSearchQueryChange={setSearchQuery}
                            locationName={locationName}
                            onLocationChange={setLocationName}
                            restaurants={restaurants}
                        />
                    </section>

                </div>

                {/* ── Full Width Filters Bar (from design screenshot) ── */}
                <div className="max-w-7xl mx-auto px-4 md:px-8 my-2 md:my-4 relative z-[200]">
                    <FilterBar
                        cuisineFilter={cuisineFilter}
                        onCuisineChange={setCuisineFilter}
                        priceFilter={priceFilter}
                        onPriceChange={setPriceFilter}
                        ratingFilter={ratingFilter}
                        onRatingChange={setRatingFilter}
                        dietaryFilter={dietaryFilter}
                        onDietaryChange={setDietaryFilter}
                        ambienceFilter={ambienceFilter}
                        onAmbienceChange={setAmbienceFilter}
                        occasionFilter={occasionFilter}
                        onOccasionChange={setOccasionFilter}
                        openNowFilter={openNowFilter}
                        onOpenNowToggle={() => setOpenNowFilter((prev) => !prev)}
                        onClearAll={() => {
                            setCuisineFilter('All');
                            setPriceFilter('All');
                            setRatingFilter(0);
                            setDietaryFilter('All');
                            setAmbienceFilter('All');
                            setOccasionFilter('All');
                            setOpenNowFilter(false);
                        }}
                    />
                </div>

                {/* Featured Section */}
                <div className="max-w-7xl mx-auto px-4 md:px-8">
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
                    href={restaurant.isBookable !== false ? `/restaurants/${hotelNameSlug}` : `/restaurant/${restaurant.id}`}
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
                                    className={`w-1.5 h-1.5 rounded-full transition-all ${index === currentImageIndex
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

            <Link href={restaurant.isBookable !== false ? `/restaurants/${hotelNameSlug}` : `/restaurant/${restaurant.id}`}>
                <div
                    className={`p-4 ${dark ? 'bg-[#2A2A2A]' : 'bg-[#FFFBFA]'}`}
                >
                    <div className="flex justify-between items-center mb-2">
                        <h3
                            className={`text-lg font-bold ${dark ? 'text-white' : 'text-[#3D2117]'}`}
                        >
                            {restaurant.restaurantName ?? restaurant.name}
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
                        href={`/restaurants/${hotelNameSlug}/reservation`}
                        className="text-[#FF8A00] font-bold text-sm hover:text-orange-600 transition-colors inline-block"
                    >
                        Book Reservation
                    </Link>
                ) : (
                    <Link
                        href={`/restaurant/${restaurant.id}`}
                        className="text-[#FF8A00] font-bold text-sm hover:text-orange-600 transition-colors inline-block"
                    >
                        Request a Reservation
                    </Link>
                )}
            </div>
        </div>
    );
}

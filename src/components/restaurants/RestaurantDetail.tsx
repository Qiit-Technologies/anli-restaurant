'use client';

import React, { useState, useEffect } from 'react';
import {
    Utensils,
    Clock,
    MapPin,
    Phone,
    Mail,
    Heart,
    Loader2,
    ChevronLeft,
    ChevronRight,
    Star,
    Globe,
    Award,
    ThumbsUp,
    Twitter,
    Linkedin,
    Instagram,
    Facebook,
    Search,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    restaurantService,
    Restaurant,
    Menu,
} from '@/services/restaurant.service';
import { customerAuthService } from '@/services/customerAuth.service';
import { analytics } from '@/lib/mixpanel';
import CustomerHeader from './CustomerHeader';
import toast from 'react-hot-toast';

interface RestaurantDetailProps {
    id: string;
    hotelName?: string;
}

export default function RestaurantDetail({
    id,
    hotelName,
}: RestaurantDetailProps) {
    const router = useRouter();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [menu, setMenu] = useState<Menu[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

    const slideImages = React.useMemo(() => {
        if (restaurant?.images && restaurant.images.length > 0) {
            return restaurant.images;
        }
        if (restaurant?.coverImage) {
            return [restaurant.coverImage];
        }
        return ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80'];
    }, [restaurant]);

    useEffect(() => {
        if (slideImages.length <= 1) return;
        const interval = setInterval(() => {
            setCurrentSlideIndex((prev) => (prev + 1) % slideImages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [slideImages]);
    const hotelNameSlug =
        hotelName ||
        (restaurant?.name?.toString() || 'restaurant')
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w-]+/g, '')
            .replace(/--+/g, '-') ||
        'restaurant';

    useEffect(() => {
        const fetchStatus = async () => {
            const user = customerAuthService.getUser();
            if (user && id) {
                try {
                    const favs = await customerAuthService.getFavorites();
                    setIsFavorite(favs.some((f: any) => f.id === Number(id)));
                } catch (err) {
                    console.error('Error fetching favorite status:', err);
                }
            }
        };
        fetchStatus();
    }, [id]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const restaurantId = Number(id);
                const restaurantData = await restaurantService.getDetails(restaurantId);
                setRestaurant(restaurantData);
                try {
                    const menuData = await restaurantService.getMenu(restaurantId);
                    setMenu(menuData);
                } catch {
                    setMenu([]);
                }
            } catch (error) {
                console.error('Error fetching restaurant details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    useEffect(() => {
        if (!loading && restaurant) {
            analytics.track('restaurant_detail_viewed', {
                restaurant_id: restaurant.id,
                restaurant_name: restaurant.name,
                restaurant_address: restaurant.address,
            });
        }
    }, [loading, restaurant]);

    const handleBookingClick = (path: string) => {
        analytics.track('booking_started', {
            restaurant_id: id,
            restaurant_name: restaurant?.name,
            booking_path: path,
        });
        router.push(path);
    };

    const handleToggleFavorite = async () => {
        const user = customerAuthService.getUser();
        if (!user) {
            toast.error('Please log in to favorite restaurants');
            analytics.track('favorite_click', {
                restaurant_id: id,
                restaurant_name: restaurant?.name,
                action: 'login_required',
            });
            return;
        }

        setIsToggling(true);
        const previousFavorite = isFavorite;
        setIsFavorite(!isFavorite);

        try {
            await customerAuthService.toggleFavorite(Number(id));
            toast.success(
                previousFavorite ? 'Removed from favorites' : 'Added to favorites',
            );
            analytics.track('favorite_toggled', {
                restaurant_id: id,
                restaurant_name: restaurant?.name,
                action: previousFavorite ? 'removed' : 'added',
            });
        } catch (err) {
            setIsFavorite(previousFavorite);
            toast.error('Failed to update favorites');
            analytics.track('favorite_error', {
                restaurant_id: id,
                restaurant_name: restaurant?.name,
                error: err instanceof Error ? err.message : 'unknown',
            });
        } finally {
            setIsToggling(false);
        }
    };

    const getAllMenuItems = () => {
        const items: any[] = [];
        menu.forEach((m) => {
            m.categories?.forEach((cat) => {
                if (cat.items) items.push(...cat.items);
            });
        });
        return items;
    };

    const menuItems = getAllMenuItems();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FFFDF9]">
                <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFFDF9] p-6">
                <p className="text-lg font-bold text-gray-700 mb-6">
                    Restaurant not found
                </p>
                <button
                    onClick={() => router.push('/restaurants')}
                    className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-full shadow-md transition-all"
                >
                    Back to Restaurants
                </button>
            </div>
        );
    }

    // Dynamic contact info extraction checking backend property variants
    const phone =
        (restaurant as any).contactPhone ||
        (restaurant as any).owner?.phoneNumber ||
        '+234 6098 890 768';

    const email =
        (restaurant as any).contactEmail ||
        (restaurant as any).owner?.email ||
        `ujua1@gmail.com`;

    const openHours =
        restaurant.displayHours ||
        (restaurant as any).openingHours ||
        '10 : 00 AM – 11 : 00 PM';

    const website =
        (restaurant as any).website ||
        `www.${restaurant.name.toLowerCase().replace(/[^\w]/g, '')}.com`;

    const initials = restaurant.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .substring(0, 2)
        .toUpperCase() || 'SK';

    // Dynamic Location & Headline Crafting
    const locationCity = restaurant.address
        ? restaurant.address.split(',').slice(-2).join(', ').trim()
        : 'Lagos, Nigeria';

    const headline =
        (restaurant as any).headline ||
        (restaurant as any).tagline ||
        `Serving The Best Flavours In ${locationCity}.`;

    const description =
        (restaurant as any).description ||
        (restaurant as any).about ||
        `Home of bold flavors, crafted cocktails, and effortless vibes at ${restaurant.name}. Reserve your table now and taste why ${restaurant.name} comes alive. Open everyday through ${openHours}.`;

    return (
        <div className="min-h-screen bg-[#FFFDF9] text-[#1A1A1A]">
            {loading || !restaurant ? (
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-hexbrand" />
                </div>
            ) : (
                <>
                    {/* 1. Header Navigation Bar */}
                    <CustomerHeader showBackButton={false} />

                    <main className="pt-16">
                {/* 2. Split Hero Banner Section */}
                <section className="relative w-full bg-[#1E140E] overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[380px] md:min-h-[440px]">
                            {/* Left Dark Content Column aligned with main content left column */}
                            <div className="lg:col-span-7 py-8 md:py-10 flex flex-col justify-between text-white">
                                <div>
                                    {/* Back to search link */}
                                    <button
                                        type="button"
                                        onClick={() => router.back()}
                                        className="inline-flex items-center gap-1.5 text-xs text-gray-300 hover:text-white mb-6 transition-colors font-medium"
                                    >
                                        <ChevronLeft size={14} />
                                        <span>Back</span>
                                    </button>

                                    {/* Avatar Logo & Status Row */}
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-14 h-14 rounded-full bg-[#FF6A00] text-white flex items-center justify-center font-extrabold text-xl shadow-lg border-2 border-white/10">
                                            {initials}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="px-3 py-1 bg-[#00D64F] text-white text-xs font-bold rounded-full">
                                                Open Now
                                            </span>
                                            <span className="text-xs text-gray-300 font-medium">
                                                {openHours}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Restaurant Title */}
                                    <h1 className="text-2xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                                        {restaurant.name}
                                    </h1>

                                    {/* Tags & Location */}
                                    <div className="flex flex-wrap items-center gap-1 text-xs md:text-sm text-gray-300 mb-2 font-medium">
                                        <Utensils size={14} className="text-gray-400 mr-1" />
                                        <span>{restaurant.tags || 'Fine Dining, International'} . {restaurant.address || 'Lagos, Nigeria'}</span>
                                    </div>

                                    {/* Rating row */}
                                    <div className="flex items-center gap-1.5 text-xs text-gray-300 mb-6">
                                        <span>Google Rating</span>
                                        <Star size={13} className="fill-[#FF8A00] text-[#FF8A00]" />
                                        <span className="font-bold text-[#FF8A00]">
                                            {restaurant.rating || 4.8}/5
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons Row */}
                                <div className="flex flex-wrap items-center gap-3 mt-4">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleBookingClick(`/restaurants/${hotelNameSlug}/${id}/reservation`)
                                        }
                                        className="px-6 py-2.5 bg-[#0085FF] hover:bg-blue-600 text-white font-bold text-xs md:text-sm rounded-lg shadow-md transition-all active:scale-95"
                                    >
                                        Book a Table
                                    </button>
                                    <a
                                        href={`tel:${phone}`}
                                        className="px-6 py-2.5 bg-[#E8E8E8] hover:bg-gray-300 text-gray-900 font-bold text-xs md:text-sm rounded-lg transition-all active:scale-95"
                                    >
                                        Call Restaurant
                                    </a>
                                </div>
                            </div>

                            {/* Right Column Spacer */}
                            <div className="hidden lg:block lg:col-span-5 relative" />
                        </div>
                    </div>

                    {/* Right Image Column with Curved Mask & Auto-Sliding Image Carousel */}
                    <div className="relative lg:absolute lg:right-0 lg:top-0 lg:bottom-0 w-full lg:w-[46%] min-h-[260px] md:min-h-[440px] rounded-l-none lg:rounded-l-[80px] overflow-hidden">
                        {slideImages.map((imgSrc, idx) => (
                            <div
                                key={idx}
                                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlideIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
                                    }`}
                            >
                                <Image
                                    src={imgSrc}
                                    alt={`${restaurant.name} photo ${idx + 1}`}
                                    fill
                                    className="object-cover"
                                    priority={idx === 0}
                                />
                            </div>
                        ))}

                        {/* Slide Indicators if multiple images present */}
                        {slideImages.length > 1 && (
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 lg:left-12 lg:translate-x-0 z-20 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                                {slideImages.map((_, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setCurrentSlideIndex(idx)}
                                        className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlideIndex ? 'w-6 bg-[#FF6A00]' : 'w-2 bg-white/60 hover:bg-white'
                                            }`}
                                        aria-label={`Go to image ${idx + 1}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* 3. Main Body Container (2 Columns) */}
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* LEFT COLUMN */}
                        <div className="lg:col-span-7 space-y-8">
                            {/* Headline & Description */}
                            <div>
                                <h2 className="text-xl md:text-2xl font-bold text-[#1A1A1A] mb-3 leading-snug">
                                    {headline}
                                </h2>
                                <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-4">
                                    {description}
                                </p>

                                {/* Feature Badges Row */}
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="px-3 py-1 bg-[#FFF0F5] text-[#D02670] text-xs font-medium rounded-md">
                                        Perfect for date Night
                                    </span>
                                    <span className="px-3 py-1 bg-[#E6F9F0] text-[#00A859] text-xs font-medium rounded-md">
                                        Outdoor/ Indoor Seating
                                    </span>
                                    <span className="px-3 py-1 bg-[#F9F0FF] text-[#8A2BE2] text-xs font-medium rounded-md">
                                        Romantic Ambience
                                    </span>
                                </div>
                            </div>

                            {/* Why diners love us? */}
                            <div>
                                <h3 className="text-lg md:text-xl font-bold text-[#1A1A1A] mb-4">
                                    Why diners love us?
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {/* Card 1 */}
                                    <div className="bg-[#FFF8F0] p-4 rounded-2xl flex items-start gap-3 border border-orange-100/50">
                                        <div className="w-9 h-9 rounded-xl bg-[#853D1C] text-white flex items-center justify-center flex-shrink-0">
                                            <Award size={18} />
                                        </div>
                                        <div>
                                            <h4 className="text-xs md:text-sm font-bold text-[#1A1A1A]">
                                                Top Rated
                                            </h4>
                                            <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                                                we are the most rated and searched for
                                            </p>
                                        </div>
                                    </div>

                                    {/* Card 2 */}
                                    <div className="bg-[#F0FFF4] p-4 rounded-2xl flex items-start gap-3 border border-emerald-100/50">
                                        <div className="w-9 h-9 rounded-xl bg-[#006838] text-white flex items-center justify-center flex-shrink-0">
                                            <MapPin size={18} />
                                        </div>
                                        <div>
                                            <h4 className="text-xs md:text-sm font-bold text-[#1A1A1A]">
                                                Great Location
                                            </h4>
                                            <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                                                we are the most rated and searched for
                                            </p>
                                        </div>
                                    </div>

                                    {/* Card 3 */}
                                    <div className="bg-[#FFFEE0] p-4 rounded-2xl flex items-start gap-3 border border-yellow-100/50">
                                        <div className="w-9 h-9 rounded-xl bg-[#736400] text-white flex items-center justify-center flex-shrink-0">
                                            <Utensils size={18} />
                                        </div>
                                        <div>
                                            <h4 className="text-xs md:text-sm font-bold text-[#1A1A1A]">
                                                Good Food
                                            </h4>
                                            <p className="text-[11px] text-gray-500 leading-tight mt-0.5">
                                                we are the most rated and searched for
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Menu Section */}
                            <div className="pt-2">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl md:text-2xl font-bold text-[#1A1A1A]">
                                        {restaurant.name} Menu
                                    </h3>
                                    <Link
                                        href={`/restaurants/${id}/menu`}
                                        className="text-orange-600 hover:text-orange-700 text-xs md:text-sm font-bold flex items-center gap-1 hover:underline"
                                    >
                                        Full Menu <ChevronRight size={16} />
                                    </Link>
                                </div>

                                {menuItems.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {menuItems.slice(0, 3).map((item, idx) => (
                                            <div
                                                key={item.id || idx}
                                                className="rounded-[20px] overflow-hidden bg-white shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col justify-between"
                                            >
                                                <div className="relative h-40 w-full bg-gray-100">
                                                    <Image
                                                        src={
                                                            item.image ||
                                                            'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
                                                        }
                                                        alt={item.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="p-3.5 flex flex-col flex-1 justify-between">
                                                    <div>
                                                        <h4 className="font-bold text-[#1A202C] text-xs md:text-sm mb-1 truncate">
                                                            {item.name}
                                                        </h4>
                                                        <p className="text-gray-500 text-[11px] line-clamp-2 mb-2">
                                                            {item.description || 'Delicately prepared with fresh ingredients.'}
                                                        </p>
                                                    </div>
                                                    <span className="text-orange-600 font-bold text-xs">
                                                        ₦{item.price ? item.price.toLocaleString() : '15,000'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        {[
                                            {
                                                name: 'Chalkboard Specials',
                                                image: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=600&q=80',
                                            },
                                            {
                                                name: 'Main Menu Booklet',
                                                image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=600&q=80',
                                            },
                                            {
                                                name: 'Drinks & Cocktails',
                                                image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=600&q=80',
                                            },
                                        ].map((img, idx) => (
                                            <div
                                                key={idx}
                                                className="group relative h-40 rounded-[20px] overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100"
                                            >
                                                <Image
                                                    src={img.image}
                                                    alt={img.name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RIGHT COLUMN */}
                        <div className="lg:col-span-5 space-y-6">
                            {/* Light Peach Address & Info Card */}
                            <div className="bg-[#FFF6F0] rounded-[28px] p-6 md:p-8 space-y-5 border border-orange-100/60 shadow-sm">
                                {/* Address */}
                                <div>
                                    <h4 className="text-sm md:text-base font-bold text-[#1A1A1A] mb-1">
                                        Address
                                    </h4>
                                    <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-normal">
                                        {restaurant.address || 'Etiebets place, 21 shomolu Avenue, ikoyi, Lagos Nigeria'}
                                    </p>
                                </div>

                                {/* Contact Info */}
                                <div>
                                    <h4 className="text-sm md:text-base font-bold text-[#1A1A1A] mb-1">
                                        Contact Info
                                    </h4>
                                    <p className="text-xs md:text-sm text-gray-600 font-normal">
                                        Phone Number: {phone}
                                    </p>
                                    <p className="text-xs md:text-sm text-gray-600 font-normal mt-0.5">
                                        Email Address: {email}
                                    </p>
                                </div>

                                {/* Open Time */}
                                <div>
                                    <h4 className="text-sm md:text-base font-bold text-[#1A1A1A] mb-1">
                                        Open Time
                                    </h4>
                                    <p className="text-xs md:text-sm text-gray-600 font-normal">
                                        {restaurant.weekdayHours || 'Monday – Friday : 10 : 00 AM – 11 : 00 PM'}
                                    </p>
                                    <p className="text-xs md:text-sm text-gray-600 font-normal mt-0.5">
                                        {restaurant.weekendHours || 'Saturday – Sunday: 08 : 00 AM – 12 : 00 PM'}
                                    </p>
                                </div>

                                {/* Stay Connected */}
                                <div>
                                    <h4 className="text-sm md:text-base font-bold text-[#1A1A1A] mb-2.5">
                                        Stay Connected
                                    </h4>
                                    <div className="flex items-center gap-3.5 text-[#FF6A00]">
                                        <a
                                            href={restaurant.twitterUrl || '#twitter'}
                                            aria-label="Twitter"
                                            className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-[#FF6A00] hover:text-white transition-all shadow-sm"
                                        >
                                            <Twitter size={15} />
                                        </a>
                                        <a
                                            href={restaurant.linkedinUrl || '#linkedin'}
                                            aria-label="LinkedIn"
                                            className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-[#FF6A00] hover:text-white transition-all shadow-sm"
                                        >
                                            <Linkedin size={15} />
                                        </a>
                                        <a
                                            href={restaurant.instagramUrl || '#instagram'}
                                            aria-label="Instagram"
                                            className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-[#FF6A00] hover:text-white transition-all shadow-sm"
                                        >
                                            <Instagram size={15} />
                                        </a>
                                        <a
                                            href={restaurant.facebookUrl || '#facebook'}
                                            aria-label="Facebook"
                                            className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:bg-[#FF6A00] hover:text-white transition-all shadow-sm"
                                        >
                                            <Facebook size={15} />
                                        </a>
                                    </div>
                                </div>

                                {/* Official website */}
                                <div className="pt-1">
                                    <h4 className="text-sm md:text-base font-bold text-[#1A1A1A] mb-1.5">
                                        Official website
                                    </h4>
                                    <a
                                        href={`https://${website.replace(/^https?:\/\//, '')}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-xs md:text-sm text-gray-700 hover:text-orange-600 font-medium transition-colors"
                                    >
                                        <Globe size={15} className="text-gray-500" />
                                        <span>{website}</span>
                                    </a>
                                </div>
                            </div>

                            {/* Bottom Dark Promo Card */}
                            <div className="bg-[#1C140E] text-white rounded-[28px] p-6 md:p-8 space-y-3 shadow-xl">
                                <h3 className="text-xl md:text-2xl font-bold leading-tight text-white whitespace-pre-line">
                                    {restaurant.promoTitle || 'Discover more .\nDine Better.'}
                                </h3>
                                <p className="text-xs md:text-sm text-gray-300 font-normal leading-relaxed">
                                    {restaurant.promoDescription || 'Find out more beautiful restaurants in Lagos for different occasions.'}
                                </p>
                                <div className="pt-2">
                                    <button
                                        type="button"
                                        onClick={() => router.push('/search')}
                                        className="px-5 py-2.5 bg-[#0085FF] hover:bg-blue-600 text-white font-bold text-xs rounded-lg transition-all shadow-md active:scale-95"
                                    >
                                        Explore more
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </>
        )}
    </div>
    );
}

'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Search,
    MapPin,
    ChevronDown,
    Users,
    ArrowLeft,
    Heart,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
    customerAuthService,
    CustomerUser,
} from '@/services/customerAuth.service';
import { analytics } from '@/lib/mixpanel';
import CustomerLoginModal from './CustomerLoginModal';
import CustomerSignupModal from './CustomerSignupModal';
import LocationModal from './LocationModal';
import { toast } from 'react-hot-toast';

interface CustomerHeaderProps {
    scrolled?: boolean;
    showBackButton?: boolean;
    onLocationChange?: (location: string, lat?: number, lng?: number) => void;
    locationName?: string;
    onSearchClick?: () => void;
}

export default function CustomerHeader({
    scrolled: initialScrolled = false,
    showBackButton = false,
    onLocationChange,
    locationName: propLocationName,
    onSearchClick,
}: CustomerHeaderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<CustomerUser | null>(null);
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const [isSignupOpen, setIsSignupOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    const [internalLocationName, setInternalLocationName] =
        useState('Lekki Phase 1');
    const displayLocationName = propLocationName || internalLocationName;
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(initialScrolled);
    const [hidden, setHidden] = useState(false);
    const lastScrollY = useRef(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY < 20) {
                setScrolled(false);
                setHidden(false);
            } else if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
                setHidden(true);
            } else if (currentScrollY < lastScrollY.current) {
                setHidden(false);
                setScrolled(true);
            }

            lastScrollY.current = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const loadedUser = customerAuthService.getUser();
    useEffect(() => {
        setUser(loadedUser);
        if (loadedUser?.id) {
            analytics.identify(loadedUser.id);
            analytics.people.set({
                email: loadedUser.email,
                first_name: loadedUser.firstName,
                last_name: loadedUser.lastName,
            });
        }
    }, []);

    const handleLogout = () => {
        customerAuthService.logout();
        setUser(null);
        analytics.reset();
        toast.success('Logged out successfully');
        analytics.track('logout', {
            user_id: user?.id,
        });

        // If on a protected page, redirect to landing
        const protectedPaths = ['/bookings'];
        const isProtected = protectedPaths.some((p) => pathname.startsWith(p));

        if (isProtected) {
            router.push('/');
        }
    };

    const handleAuthSuccess = () => {
        setUser(customerAuthService.getUser());
        setIsLoginOpen(false);
        setIsSignupOpen(false);
    };

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm' : 'bg-white border-b border-gray-50'} ${hidden ? '-translate-y-full' : 'translate-y-0'}`}
            >
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-6 md:gap-12 lg:gap-24">
                        <div className="flex items-center gap-4">
                            {showBackButton && (
                                <button
                                    onClick={() => router.back()}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <ArrowLeft
                                        size={20}
                                        className="text-gray-600"
                                    />
                                </button>
                            )}
                            <Link href="/" className="flex-shrink-0">
                                <Image
                                    src="/landing/anli-logo1.png"
                                    alt="Anli Logo"
                                    width={60}
                                    height={28}
                                    className="h-7 w-auto"
                                    priority
                                />
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 md:gap-5">
                        <button
                            onClick={() => {
                                analytics.track('search_clicked', {
                                    source: 'header',
                                });
                                if (onSearchClick) {
                                    onSearchClick();
                                } else {
                                    router.push('/search');
                                }
                            }}
                            className="flex items-center justify-center p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors"
                            aria-label="Search"
                            title="Search"
                        >
                            <Search size={20} />
                        </button>

                        <button
                            onClick={() => {
                                analytics.track('location_modal_opened', {
                                    source: 'header',
                                });
                                setIsLocationModalOpen(true);
                            }}
                            className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-[24px] border border-gray-100 transition-all hover:border-orange-500 hover:bg-orange-50 group"
                        >
                            <MapPin
                                size={18}
                                className="text-gray-400 group-hover:text-orange-500"
                            />
                            <span className="text-sm font-medium text-gray-700 group-hover:text-[#3D2117]">
                                {displayLocationName}
                            </span>
                            <ChevronDown
                                size={16}
                                className="text-gray-400 group-hover:text-orange-500"
                            />
                        </button>

                        <div className="flex items-center gap-3">
                            {user ? (
                                <div className="relative">
                                    <button
                                        onClick={() =>
                                            setIsMenuOpen(!isMenuOpen)
                                        }
                                        className="w-10 h-10 rounded-full bg-[#FFF5E9] flex items-center justify-center text-[#FF8A00] font-bold shadow-sm hover:ring-2 hover:ring-orange-500/20 transition-all active:scale-95"
                                    >
                                        {user.firstName[0]}
                                        {user.lastName[0]}
                                    </button>

                                    {isMenuOpen && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() =>
                                                    setIsMenuOpen(false)
                                                }
                                            />
                                            <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-1.5 z-20 animate-in fade-in zoom-in-95 duration-200">
                                                <Link
                                                    href="/bookings"
                                                    onClick={() =>
                                                        setIsMenuOpen(false)
                                                    }
                                                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                                >
                                                    <Users size={16} />
                                                    <span>My Bookings</span>
                                                </Link>

                                                <Link
                                                    href="/bookings?tab=favorites"
                                                    onClick={() =>
                                                        setIsMenuOpen(false)
                                                    }
                                                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                                >
                                                    <Heart size={16} />
                                                    <span>My Favorites</span>
                                                </Link>

                                                <div className="h-px bg-gray-50 mx-2" />

                                                <button
                                                    onClick={() => {
                                                        setIsMenuOpen(false);
                                                        handleLogout();
                                                    }}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors text-left"
                                                >
                                                    <ArrowLeft
                                                        size={16}
                                                        className="rotate-180"
                                                    />
                                                    <span>Logout</span>
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setIsLoginOpen(true)}
                                        className="text-sm font-semibold text-gray-700 hover:text-orange-500 transition-colors"
                                    >
                                        Login
                                    </button>
                                    <button
                                        onClick={() => setIsSignupOpen(true)}
                                        className="px-5 py-2 bg-[#FF8A00] text-white text-sm font-bold rounded-full hover:bg-orange-600 transition-colors shadow-md"
                                    >
                                        Sign Up
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <CustomerLoginModal
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
                onSuccess={handleAuthSuccess}
                onSwitchToSignup={() => {
                    setIsLoginOpen(false);
                    setIsSignupOpen(true);
                }}
            />

            <CustomerSignupModal
                isOpen={isSignupOpen}
                onClose={() => setIsSignupOpen(false)}
                onSuccess={handleAuthSuccess}
                onSwitchToLogin={() => {
                    setIsSignupOpen(false);
                    setIsLoginOpen(true);
                }}
            />

            <LocationModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                currentLocation={displayLocationName}
                onSelect={(newLoc, lat, lon) => {
                    setInternalLocationName(newLoc);
                    onLocationChange?.(newLoc, lat, lon);
                }}
            />
        </>
    );
}

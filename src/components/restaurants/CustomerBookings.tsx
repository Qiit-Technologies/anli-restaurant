'use client';

import React, { useState, useEffect } from 'react';
import { 
    Calendar, 
    Clock, 
    Users, 
    MapPin, 
    ChevronRight,
    Loader2,
    X,
    Info,
    CheckCircle2,
    Clock3,
    AlertCircle,
    Heart,
    Star,
    Utensils
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { restaurantService } from '@/services/restaurant.service';
import { customerAuthService, CustomerUser } from '@/services/customerAuth.service';
import { analytics } from '@/lib/mixpanel';
import CustomerHeader from './CustomerHeader';

type BookingTab = 'upcoming' | 'past' | 'favorites';

export default function CustomerBookings() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();
    const initialTab = (searchParams.get('tab') as BookingTab) || 'upcoming';
    
    const [bookings, setBookings] = useState<any[]>([]);
    const [favorites, setFavorites] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<BookingTab>(initialTab);
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

    const tabs = ['Upcoming', 'Past', 'Favorites'];

    const getBookingsCount = (tab: string) => {
        if (tab === 'Favorites') return favorites.length;
        
        return bookings.filter(booking => {
            const isPast = new Date(booking.date) < new Date() || 
                           ['cancelled', 'completed'].includes(booking.status?.toLowerCase());
            return tab === 'Past' ? isPast : !isPast;
        }).length;
    };

    useEffect(() => {
        const fetchData = async () => {
            const currentUser = customerAuthService.getUser();
            if (currentUser?.id) {
                setLoading(true);
                try {
                    const [bookingsData, favoritesData] = await Promise.all([
                        restaurantService.getBookingsByCustomerId(currentUser.id.toString()),
                        customerAuthService.getFavorites()
                    ]);
                    setBookings(bookingsData);
                    setFavorites(favoritesData);
                } catch (error) {
                    console.error('Error fetching data:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (!loading) {
            analytics.track('bookings_page_viewed', {
                bookings_count: bookings.length,
                favorites_count: favorites.length,
                active_tab: activeTab,
            });
        }
    }, [loading, bookings.length, favorites.length, activeTab]);

    const filteredBookings = bookings.filter(booking => {
        const isPast = new Date(booking.date) < new Date() || booking.status?.toLowerCase() === 'cancelled' || booking.status?.toLowerCase() === 'completed';
        return activeTab === 'past' ? isPast : !isPast;
    });

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case 'pending': return 'bg-yellow-100 text-yellow-700';
            case 'confirmed': return 'bg-green-100 text-green-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-white">
            <CustomerHeader />

            <main className="pt-24 max-w-7xl mx-auto px-4 md:px-8 pb-20">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {activeTab === 'favorites' ? 'My Favorites' : 'My Bookings'}
                    </h1>
                    <div className="flex bg-gray-100 p-1 rounded-full">
                        {tabs.map((tab) => (
                            <button
                                key={tab}
                                onClick={() => {
                                    setActiveTab(tab.toLowerCase() as BookingTab);
                                    router.push(`${pathname}?tab=${tab.toLowerCase()}`);
                                }}
                                className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.toLowerCase() ? 'bg-gray-900 text-white shadow-lg' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <span>{tab}</span>
                                <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black ${activeTab === tab.toLowerCase() ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                    {getBookingsCount(tab)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    </div>
                ) : activeTab === 'favorites' ? (
                    favorites.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {favorites.map((res) => (
                                <FavoriteCard key={res.id} restaurant={res} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                            <Heart size={40} className="mx-auto text-gray-300 mb-4" />
                            <h3 className="text-lg font-bold text-gray-900 mb-1">No favorites yet</h3>
                            <p className="text-sm text-gray-500 mb-6">Save your favorite restaurants to find them easily later.</p>
                            <Link href="/" className="text-sm font-bold text-orange-500 hover:underline">
                                Explore Restaurants
                            </Link>
                        </div>
                    )
                ) : filteredBookings.length > 0 ? (
                    <div className="space-y-4">
                        {filteredBookings.map((booking) => (
                            <div 
                                key={booking.id}
                                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 md:p-4 hover:border-orange-200 transition-all group"
                            >
                                <div className="flex flex-col md:flex-row gap-3 md:gap-5">
                                    <div className="relative w-full md:w-28 h-32 md:h-28 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                                        <Image 
                                            src={booking.hotel?.coverImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80"} 
                                            alt={booking.hotel?.name}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-2 md:mb-3">
                                            <div>
                                                <h3 className="text-base md:text-lg font-black text-gray-900 group-hover:text-orange-600 transition-colors leading-tight">{booking.hotel?.name}</h3>
                                                <div className="flex items-center gap-1.5 text-gray-400 text-[10px] mt-0.5">
                                                    <MapPin size={10} />
                                                    <span className="line-clamp-1">{booking.hotel?.address || "Lagos, Nigeria"}</span>
                                                </div>
                                            </div>
                                            <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${getStatusColor(booking.status)}`}>
                                                {booking.status || 'Pending'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2 md:gap-x-6 md:gap-y-1 mb-3 md:mb-4">
                                            <div className="flex items-center gap-2 text-[11px] bg-gray-50 md:bg-transparent p-1.5 md:p-0 rounded-lg">
                                                <Calendar size={12} className="text-orange-500 md:text-gray-400" />
                                                <span className="font-bold md:font-medium text-gray-700 md:text-gray-600">{new Date(booking.date).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] bg-gray-50 md:bg-transparent p-1.5 md:p-0 rounded-lg">
                                                <Clock size={12} className="text-orange-500 md:text-gray-400" />
                                                <span className="font-bold md:font-medium text-gray-700 md:text-gray-600">{booking.time}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px] bg-gray-50 md:bg-transparent p-1.5 md:p-0 rounded-lg col-span-2 md:col-span-1">
                                                <Users size={12} className="text-orange-500 md:text-gray-400" />
                                                <span className="font-bold md:font-medium text-gray-700 md:text-gray-600">{booking.guestNumber} Guest(s)</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                                            <button 
                                                onClick={() => setSelectedBooking(booking)}
                                                className="text-[10px] font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest"
                                            >
                                                Details
                                            </button>
                                            <Link 
                                                href={`/restaurants/${booking.hotel?.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-') || 'restaurant'}/reservation`}
                                                className="px-4 py-1.5 bg-[#FFF5E9] text-[#FF8A00] rounded-full text-[10px] font-black hover:bg-orange-500 hover:text-white transition-all active:scale-95 shadow-sm"
                                            >
                                                BOOK AGAIN
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100">
                        <Calendar size={40} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No {activeTab} bookings</h3>
                        <p className="text-sm text-gray-500 mb-6">Explore our restaurants and make your first reservation.</p>
                        <Link href="/" className="text-sm font-bold text-orange-500 hover:underline">
                            Browse Restaurants
                        </Link>
                    </div>
                )}
            </main>

            {/* Simple Modal */}
            {selectedBooking && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-xl rounded-2xl overflow-hidden shadow-xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 flex justify-between items-center border-b border-gray-50">
                            <h2 className="font-bold text-gray-900">Booking Details</h2>
                            <button onClick={() => setSelectedBooking(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto no-scrollbar">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="w-full md:w-24 h-48 md:h-24 rounded-2xl bg-gray-100 flex-shrink-0 relative overflow-hidden shadow-sm">
                                    <Image 
                                        src={selectedBooking.hotel?.coverImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80"} 
                                        alt="" 
                                        fill 
                                        className="object-cover" 
                                    />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-gray-900 mb-1">{selectedBooking.hotel?.name}</h3>
                                    <div className="flex items-center gap-1.5 text-gray-400 text-sm">
                                        <MapPin size={14} />
                                        <span>{selectedBooking.hotel?.address || "Lagos, Nigeria"}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-50 rounded-[20px] border border-gray-100">
                                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Date & Time</p>
                                    <p className="font-bold text-gray-800 text-sm">{new Date(selectedBooking.date).toLocaleDateString()} at {selectedBooking.time}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-[20px] border border-gray-100">
                                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Party Size</p>
                                    <p className="font-bold text-gray-800 text-sm">{selectedBooking.guestNumber} Guest(s)</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-[20px] border border-gray-100">
                                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Reservation</p>
                                    <p className="font-bold text-gray-800 text-sm">{selectedBooking.reservationType || 'Standard Dining'}</p>
                                </div>
                                <div className="p-4 bg-gray-50 rounded-[20px] border border-gray-100">
                                    <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Status</p>
                                    <div className="flex mt-1">
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getStatusColor(selectedBooking.status)}`}>
                                            {selectedBooking.status || 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {selectedBooking.specialRequest && (
                                <div className="p-5 bg-orange-50/50 rounded-[24px] border border-orange-100/50">
                                    <p className="text-orange-600/60 text-[10px] font-black uppercase tracking-widest mb-2">Special Request</p>
                                    <p className="text-sm text-gray-700 leading-relaxed italic">
                                        &ldquo;{selectedBooking.specialRequest}
                                        &rdquo;
                                    </p>
                                </div>
                            )}

                            <button 
                                onClick={() => setSelectedBooking(null)}
                                className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl text-sm shadow-xl active:scale-95 transition-all"
                            >
                                CLOSE
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function FavoriteCard({ restaurant }: { restaurant: any }) {
    const hotelNameSlug = restaurant.name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '').replace(/--+/g, '-') || 'restaurant';

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all group h-full flex flex-col">
            <Link href={`/restaurants/${hotelNameSlug}/${restaurant.id}`} className="block relative h-48 overflow-hidden">
                <Image 
                    src={restaurant.coverImage || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&q=80"} 
                    alt={restaurant.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-red-500 shadow-lg">
                    <Heart size={18} className="fill-red-500" />
                </div>
            </Link>
            
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-black text-gray-900 line-clamp-1 group-hover:text-orange-500 transition-colors">
                        {restaurant.name}
                    </h3>
                    <div className="flex items-center gap-1 bg-orange-50 px-2.5 py-1 rounded-full">
                        <Star size={12} className="text-orange-500 fill-orange-500" />
                        <span className="text-xs font-black text-orange-700">{restaurant.rating || '4.8'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-gray-400 text-xs mb-6">
                    <Utensils size={14} className="text-orange-200" />
                    <span className="line-clamp-1 font-medium">{restaurant.tags || 'Japanese, Sushi . $$$'}</span>
                </div>

                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Saved</span>
                    <Link 
                        href={`/restaurants/${hotelNameSlug}/reservation`}
                        className="px-6 py-2 bg-gray-900 text-white rounded-full text-[10px] font-black uppercase tracking-wider hover:bg-[#FF8A00] transition-all active:scale-95 shadow-lg"
                    >
                        Book Now
                    </Link>
                </div>
            </div>
        </div>
    );
}

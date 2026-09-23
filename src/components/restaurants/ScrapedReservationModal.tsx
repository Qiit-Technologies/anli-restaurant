'use client';

import React, { useState, useEffect } from 'react';
import {
    X,
    Calendar,
    Clock,
    Users,
    Mail,
    Phone,
    User,
    FileText,
    ExternalLink,
    CheckCircle2,
    Send,
    Loader2,
    Utensils,
    Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { restaurantService, Restaurant } from '@/services/restaurant.service';
import { customerAuthService } from '@/services/customerAuth.service';
import { analytics } from '@/lib/mixpanel';

interface ScrapedReservationModalProps {
    restaurant: Restaurant | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ScrapedReservationModal({
    restaurant,
    isOpen,
    onClose,
}: ScrapedReservationModalProps) {
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('19:00');
    const [guestCount, setGuestCount] = useState('2');
    const [specialRequests, setSpecialRequests] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const user = customerAuthService.getUser();
            if (user) {
                const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
                setCustomerName(fullName || user.username || '');
                setCustomerEmail(user.email || '');
                setCustomerPhone(user.phoneNumber || '');
            }
            setIsSubmitted(false);
        }
    }, [isOpen]);

    if (!isOpen || !restaurant) return null;

    // Determine if restaurant has external booking platform
    const rawBookingLink = restaurant.bookingUrl || restaurant.website;
    const hasBookingPlatform = Boolean(
        rawBookingLink &&
        rawBookingLink.trim().length > 0 &&
        !rawBookingLink.includes('example.com')
    );

    const formattedBookingUrl = rawBookingLink
        ? rawBookingLink.startsWith('http://') || rawBookingLink.startsWith('https://')
            ? rawBookingLink
            : `https://${rawBookingLink}`
        : '#';

    // Handle external redirect click
    const handleRedirectClick = async () => {
        setIsSubmitting(true);
        try {
            analytics.track('scraped_restaurant_redirect', {
                restaurant_id: restaurant.id,
                restaurant_name: restaurant.name,
            });

            // Send notification to restaurant via API
            await restaurantService.notifyScrapedRedirect(restaurant.id, {
                customerName,
                customerEmail,
                customerPhone,
            });

            toast.success(
                `Redirecting to ${restaurant.name}... We've alerted the restaurant by SMS & Email!`,
                { duration: 4000 }
            );

            window.open(formattedBookingUrl, '_blank', 'noopener,noreferrer');
            onClose();
        } catch (err) {
            console.error('Error sending redirect notification:', err);
            window.open(formattedBookingUrl, '_blank', 'noopener,noreferrer');
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle collecting reservation details and sending SMS/Email alert
    const handleSubmitReservation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerName || !customerPhone || !date || !time) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            analytics.track('scraped_restaurant_reservation_submitted', {
                restaurant_id: restaurant.id,
                restaurant_name: restaurant.name,
                guest_count: guestCount,
            });

            const res = await restaurantService.submitScrapedReservation(
                restaurant.id,
                {
                    customerName,
                    customerEmail,
                    customerPhone,
                    date,
                    time,
                    guestCount: Number(guestCount),
                    specialRequests,
                }
            );

            if (res.success) {
                setIsSubmitted(true);
                toast.success('Reservation alert sent to restaurant!');
            } else {
                toast.error(res.message || 'Failed to submit reservation request');
            }
        } catch (err: any) {
            toast.error(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 transition-all transform scale-100">
                {/* Modal Header Banner */}
                <div className="relative bg-gradient-to-r from-[#1C140E] to-[#2D1B10] p-6 text-white">
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-[#FF6A00] flex items-center justify-center font-bold text-white shadow-md">
                            <Utensils size={20} />
                        </div>
                        <div>
                            <span className="text-[11px] uppercase tracking-wider text-orange-400 font-semibold flex items-center gap-1">
                                <Sparkles size={12} /> Scraped Partner Restaurant
                            </span>
                            <h3 className="text-xl font-bold text-white truncate max-w-[280px]">
                                {restaurant.name}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                    {/* CASE 1: HAS BOOKING PLATFORM */}
                    {hasBookingPlatform ? (
                        <div className="space-y-5">
                            <div className="bg-[#FFF8F0] rounded-2xl p-4 border border-orange-100 flex items-start gap-3">
                                <div className="p-2.5 bg-[#FF6A00] text-white rounded-xl flex-shrink-0">
                                    <ExternalLink size={20} />
                                </div>
                                <div className="text-xs text-gray-700 leading-relaxed">
                                    <p className="font-bold text-gray-900 mb-1 text-sm">
                                        External Booking Platform Available
                                    </p>
                                    <p>
                                        <strong>{restaurant.name}</strong> accepts table bookings directly on their official platform.
                                    </p>
                                    <p className="mt-1.5 text-gray-600">
                                        When you continue, we will instantly dispatch an <strong>SMS and Email alert</strong> to notify the restaurant of your referral.
                                    </p>
                                </div>
                            </div>

                            {/* Optional contact info input for alert */}
                            <div className="space-y-3 pt-1">
                                <label className="block text-xs font-semibold text-gray-700">
                                    Your Contact Info (Optional - sent in alert to restaurant):
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <div className="relative">
                                            <User size={15} className="absolute left-3 top-3.5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Your Name"
                                                value={customerName}
                                                onChange={(e) => setCustomerName(e.target.value)}
                                                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-gray-200 focus:border-[#FF6A00] outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <div className="relative">
                                            <Phone size={15} className="absolute left-3 top-3.5 text-gray-400" />
                                            <input
                                                type="tel"
                                                placeholder="Phone Number"
                                                value={customerPhone}
                                                onChange={(e) => setCustomerPhone(e.target.value)}
                                                className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-gray-200 focus:border-[#FF6A00] outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-3">
                                <button
                                    type="button"
                                    onClick={handleRedirectClick}
                                    disabled={isSubmitting}
                                    className="w-full py-3.5 bg-[#FF6A00] hover:bg-orange-600 text-white font-bold text-sm rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" />
                                            <span>Notifying Restaurant...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Proceed to Booking Platform</span>
                                            <ExternalLink size={16} />
                                        </>
                                    )}
                                </button>
                                <p className="text-center text-[11px] text-gray-400 mt-2">
                                    Opens external platform link in new tab. Restaurant notified via SMS & Email.
                                </p>
                            </div>
                        </div>
                    ) : (
                        /* CASE 2: NO BOOKING PLATFORM -> COLLECT INFORMATION & ALERT RESTAURANT */
                        <div>
                            {isSubmitted ? (
                                <div className="text-center py-6 space-y-4">
                                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                                        <CheckCircle2 size={36} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-1">
                                            Reservation Alert Sent!
                                        </h4>
                                        <p className="text-xs text-gray-600 max-w-sm mx-auto leading-relaxed">
                                            We have collected your table preferences and sent an immediate <strong>SMS & Email alert</strong> directly to <strong>{restaurant.name}</strong>.
                                        </p>
                                    </div>

                                    <div className="bg-[#F0FFF4] p-4 rounded-2xl border border-emerald-100 text-left text-xs space-y-1.5 text-gray-700 max-w-sm mx-auto">
                                        <p><strong>Diner:</strong> {customerName}</p>
                                        <p><strong>Contact Phone:</strong> {customerPhone}</p>
                                        <p><strong>Date & Time:</strong> {date} at {time}</p>
                                        <p><strong>Guests:</strong> {guestCount} person(s)</p>
                                    </div>

                                    <p className="text-[11px] text-gray-500">
                                        The restaurant team will reach out to you directly at {customerPhone} or {customerEmail} to confirm your reservation.
                                    </p>

                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="w-full py-3 bg-[#1C140E] hover:bg-black text-white font-bold text-xs rounded-xl shadow-md transition-all mt-4"
                                    >
                                        Close
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmitReservation} className="space-y-4">
                                    <div className="bg-amber-50 rounded-2xl p-3.5 border border-amber-200/60 text-xs text-amber-900 leading-snug flex items-start gap-2.5">
                                        <Send size={18} className="text-[#FF6A00] flex-shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-bold">Request a Reservation Table</p>
                                            <p className="text-[11px] text-amber-800 mt-0.5">
                                                Complete your reservation request below. We will send an instant <strong>SMS and Email alert</strong> directly to {restaurant.name}'s management.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Personal Details */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                                Full Name *
                                            </label>
                                            <div className="relative">
                                                <User size={14} className="absolute left-3 top-3 text-gray-400" />
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="John Doe"
                                                    value={customerName}
                                                    onChange={(e) => setCustomerName(e.target.value)}
                                                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#FF6A00] outline-none"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                                Phone Number *
                                            </label>
                                            <div className="relative">
                                                <Phone size={14} className="absolute left-3 top-3 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    required
                                                    placeholder="+234..."
                                                    value={customerPhone}
                                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#FF6A00] outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                            Email Address *
                                        </label>
                                        <div className="relative">
                                            <Mail size={14} className="absolute left-3 top-3 text-gray-400" />
                                            <input
                                                type="email"
                                                required
                                                placeholder="email@example.com"
                                                value={customerEmail}
                                                onChange={(e) => setCustomerEmail(e.target.value)}
                                                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#FF6A00] outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Date & Time & Guests */}
                                    <div className="grid grid-cols-3 gap-2.5">
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                                Date *
                                            </label>
                                            <input
                                                type="date"
                                                required
                                                value={date}
                                                onChange={(e) => setDate(e.target.value)}
                                                className="w-full px-2.5 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#FF6A00] outline-none bg-white"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                                Time *
                                            </label>
                                            <input
                                                type="time"
                                                required
                                                value={time}
                                                onChange={(e) => setTime(e.target.value)}
                                                className="w-full px-2.5 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#FF6A00] outline-none bg-white"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                                Guests *
                                            </label>
                                            <select
                                                value={guestCount}
                                                onChange={(e) => setGuestCount(e.target.value)}
                                                className="w-full px-2 py-2 text-xs rounded-xl border border-gray-200 focus:border-[#FF6A00] outline-none bg-white"
                                            >
                                                {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map((n) => (
                                                    <option key={n} value={n}>
                                                        {n} {n === 1 ? 'Guest' : 'Guests'}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Special Requests */}
                                    <div>
                                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                                            Special Requests / Seating Notes
                                        </label>
                                        <textarea
                                            rows={2}
                                            placeholder="Outdoor seating, anniversary celebration, allergy notes..."
                                            value={specialRequests}
                                            onChange={(e) => setSpecialRequests(e.target.value)}
                                            className="w-full p-2.5 text-xs rounded-xl border border-gray-200 focus:border-[#FF6A00] outline-none resize-none"
                                        />
                                    </div>

                                    <div className="pt-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full py-3 bg-[#FF6A00] hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 size={16} className="animate-spin" />
                                                    <span>Sending Alert to Restaurant...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Send size={15} />
                                                    <span>Send Reservation & Alert Restaurant</span>
                                                </>
                                            )}
                                        </button>
                                        <p className="text-center text-[10px] text-gray-400 mt-2">
                                            Instant SMS & Email alert will be sent directly to {restaurant.name}
                                        </p>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

import React from 'react';
import Image from 'next/image';
import { MapPin } from 'lucide-react';

interface BookingHeaderProps {
    hotelName: string;
    hotelAddress?: string;
    hotelLogo?: string;
}

export default function BookingHeader({
    hotelName,
    hotelAddress,
    hotelLogo,
}: BookingHeaderProps) {
    const displayAddress = hotelAddress?.trim() ?? '';

    return (
        <header className="w-full bg-white border-b border-slate-200/80 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-5 md:py-6">
                <div className="flex items-start gap-4">
                    {hotelLogo ? (
                        <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden shrink-0 border border-slate-100 shadow-sm bg-slate-50">
                            <Image
                                src={hotelLogo}
                                alt=""
                                fill
                                className="object-cover"
                                sizes="64px"
                                unoptimized
                            />
                        </div>
                    ) : null}
                    <div className="min-w-0 flex-1">
                        <h1 className="text-gray-900 text-xl md:text-2xl font-bold tracking-tight leading-tight">
                            {hotelName}
                        </h1>
                        {displayAddress && (
                            <div className="flex items-start gap-1.5 mt-2 text-xs md:text-sm text-slate-500 max-w-3xl">
                                <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                                <span className="leading-relaxed">
                                    {displayAddress}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}

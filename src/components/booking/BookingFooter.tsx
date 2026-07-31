import React from 'react';
import Image from 'next/image';

export default function BookingFooter() {
    const now = new Date();

    return (
        <footer className="w-full bg-white py-10 md:py-12 flex flex-col items-center gap-5 border-t border-slate-200/80 mt-8">
            <div className="flex items-center gap-4">
                <Image
                    src="/logos/anli-logo.png"
                    alt="Anli Logo"
                    width={100}
                    height={50}
                    className="object-contain"
                />
            </div>
            <div className="text-center text-[#667085] text-sm">
                <p className="text-orange-500 font-bold text-base mt-2">
                    Created By Anli
                </p>
            </div>
        </footer>
    );
}

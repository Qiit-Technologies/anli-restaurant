'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { customerAuthService } from '@/services/customerAuth.service';
import CustomerLoginModal from './CustomerLoginModal';

export default function Footer({ onOpenLogin }: { onOpenLogin?: () => void }) {
    const [isLoginOpen, setIsLoginOpen] = useState(false);
    const user = customerAuthService.getUser();

    const handleBookingsClick = (e: React.MouseEvent) => {
        if (!user) {
            e.preventDefault();
            setIsLoginOpen(true);
            onOpenLogin?.();
        }
    };

    return (
        <>
            <footer className="bg-[#39322E] border-t border-gray-100 py-12 px-4 md:px-8 mt-12">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <Image
                        src="/landing/anli-logo1.png"
                        alt="Anli Logo"
                        width={80}
                        height={30}
                        className=""
                    />
                    <p className="text-gray-400 text-sm">
                        © {new Date().getFullYear()} Anli Technologies. All
                        rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link
                            href="/bookings"
                            onClick={handleBookingsClick}
                            className="text-gray-400 hover:text-orange-500 text-sm"
                        >
                            Bookings
                        </Link>
                        <Link
                            href="/about-us"
                            className="text-gray-400 hover:text-orange-500 text-sm"
                        >
                            About
                        </Link>
                        <Link
                            href="/terms"
                            className="text-gray-400 hover:text-orange-500 text-sm"
                        >
                            Terms
                        </Link>
                        <Link
                            href="/privacy"
                            className="text-gray-400 hover:text-orange-500 text-sm"
                        >
                            Privacy
                        </Link>
                    </div>
                </div>
            </footer>

            <CustomerLoginModal
                isOpen={isLoginOpen}
                onClose={() => setIsLoginOpen(false)}
                onSuccess={() => setIsLoginOpen(false)}
                onSwitchToSignup={() => {
                    setIsLoginOpen(false);
                    onOpenLogin?.();
                }}
            />
        </>
    );
}

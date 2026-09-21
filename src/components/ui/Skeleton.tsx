'use client';

import React from 'react';

// ─────────────────────────────────────────────
// Base Skeleton atom — every variant builds on this
// ─────────────────────────────────────────────
interface SkeletonProps {
    className?: string;
    /** Shimmer colour: 'light' = gray-200, 'dark' = white/10 */
    shade?: 'light' | 'dark';
    rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full' | '2xl' | string;
}

export function Skeleton({
    className = '',
    shade = 'light',
    rounded = 'md',
}: SkeletonProps) {
    const base =
        shade === 'dark'
            ? 'bg-white/10'
            : 'bg-gray-200';

    const roundedMap: Record<string, string> = {
        none: '',
        sm: 'rounded-sm',
        md: 'rounded-md',
        lg: 'rounded-lg',
        '2xl': 'rounded-2xl',
        full: 'rounded-full',
    };
    const roundedClass = roundedMap[rounded] ?? rounded;

    return (
        <div
            className={[
                'relative overflow-hidden',
                base,
                roundedClass,
                'animate-pulse',
                className,
            ]
                .filter(Boolean)
                .join(' ')}
        />
    );
}

// ─────────────────────────────────────────────
// Restaurant Card Skeleton
// Mirrors the real RestaurantCard layout exactly
// ─────────────────────────────────────────────
interface RestaurantCardSkeletonProps {
    dark?: boolean;
    count?: number;
    className?: string;
}

export function RestaurantCardSkeleton({
    dark = false,
    count = 3,
    className = '',
}: RestaurantCardSkeletonProps) {
    const shade = dark ? 'dark' : 'light';
    const cardBg = dark
        ? 'bg-[#2A2A2A] border-white/10'
        : 'bg-white border-[#FFF5E9]';
    const textBg = dark ? 'bg-[#2A2A2A]' : 'bg-[#FFFBFA]';
    const bottomBg = dark
        ? 'bg-[#2A2A2A] border-white/10'
        : 'bg-white border-gray-100';

    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className={`rounded-[24px] overflow-hidden border ${cardBg} ${className}`}
                >
                    {/* Image area */}
                    <Skeleton shade={shade} rounded="none" className="h-48 w-full" />

                    {/* Body */}
                    <div className={`p-4 ${textBg} space-y-3`}>
                        {/* Name + rating row */}
                        <div className="flex justify-between items-center">
                            <Skeleton shade={shade} rounded="md" className="h-5 w-2/5" />
                            <Skeleton shade={shade} rounded="full" className="h-6 w-14" />
                        </div>
                        {/* Tags + hours row */}
                        <div className="flex justify-between items-center">
                            <Skeleton shade={shade} rounded="full" className="h-3.5 w-1/3" />
                            <Skeleton shade={shade} rounded="full" className="h-3.5 w-1/4" />
                        </div>
                        {/* Extra line */}
                        <Skeleton shade={shade} rounded="full" className="h-3 w-1/2 opacity-60" />
                    </div>

                    {/* Footer CTA */}
                    <div className={`px-4 py-4 border-t ${bottomBg}`}>
                        <Skeleton shade={shade} rounded="full" className="h-4 w-36" />
                    </div>
                </div>
            ))}
        </>
    );
}

// ─────────────────────────────────────────────
// Filter Bar Skeleton
// ─────────────────────────────────────────────
export function FilterBarSkeleton({ className = '' }: { className?: string }) {
    const widths = ['w-20', 'w-24', 'w-28', 'w-20', 'w-24', 'w-16'];
    return (
        <div className={`flex items-center gap-3 overflow-hidden py-1 ${className}`}>
            {widths.map((w, i) => (
                <Skeleton key={i} rounded="full" className={`h-9 flex-shrink-0 ${w}`} />
            ))}
        </div>
    );
}

// ─────────────────────────────────────────────
// Section Heading Skeleton
// ─────────────────────────────────────────────
export function SectionHeadingSkeleton({
    dark = false,
    className = '',
}: {
    dark?: boolean;
    className?: string;
}) {
    return (
        <div className={`flex justify-between items-center mb-6 ${className}`}>
            <Skeleton
                shade={dark ? 'dark' : 'light'}
                rounded="lg"
                className="h-7 w-56"
            />
        </div>
    );
}

// ─────────────────────────────────────────────
// Hero / Banner Skeleton (desktop)
// ─────────────────────────────────────────────
export function HeroBannerSkeleton({ className = '' }: { className?: string }) {
    return (
        <div
            className={`relative w-full h-[260px] md:h-[300px] rounded-[24px] overflow-hidden ${className}`}
        >
            <Skeleton className="h-full w-full" rounded="none" />
            {/* Simulated search-bar strip at bottom */}
            <div className="absolute bottom-6 left-6 right-6">
                <Skeleton rounded="2xl" className="h-14 w-full max-w-3xl" />
            </div>
        </div>
    );
}

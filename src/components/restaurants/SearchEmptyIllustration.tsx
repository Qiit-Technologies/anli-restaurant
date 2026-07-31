'use client';

import React from 'react';

export default function SearchEmptyIllustration({ className = 'w-48 h-48' }: { className?: string }) {
    return (
        <svg
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Flame/Lightning sparks from laptop */}
            <path
                d="M95 20C92 28 98 33 93 42C90 47 85 45 87 50C89 55 96 52 94 60"
                stroke="#1A1A1A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M103 15C108 24 102 30 109 38C113 42 117 40 114 47C112 52 105 50 107 58"
                stroke="#1A1A1A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M99 10C101 16 97 22 101 28"
                stroke="#1A1A1A"
                strokeWidth="1.5"
                strokeLinecap="round"
            />

            {/* Laptop held overhead */}
            <rect
                x="80"
                y="58"
                width="40"
                height="26"
                rx="3"
                transform="rotate(-5 100 71)"
                stroke="#1A1A1A"
                strokeWidth="2.5"
                fill="white"
            />
            {/* Screen inner lines */}
            <path
                d="M86 64L112 62"
                stroke="#1A1A1A"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M88 70L108 68"
                stroke="#1A1A1A"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            {/* Laptop Base */}
            <path
                d="M74 84L124 80"
                stroke="#1A1A1A"
                strokeWidth="3"
                strokeLinecap="round"
            />

            {/* Head & Glasses */}
            <circle cx="102" cy="108" r="12" stroke="#1A1A1A" strokeWidth="2.5" fill="white" />
            {/* Hair */}
            <path
                d="M94 100C94 95 99 92 104 93C108 94 112 91 113 97"
                stroke="#1A1A1A"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
            {/* Glasses */}
            <rect x="94" y="104" width="7" height="5" rx="1" stroke="#1A1A1A" strokeWidth="2" />
            <rect x="104" y="104" width="7" height="5" rx="1" stroke="#1A1A1A" strokeWidth="2" />
            <line x1="101" y1="106.5" x2="104" y2="106.5" stroke="#1A1A1A" strokeWidth="1.5" />

            {/* Raised Arms holding laptop */}
            <path
                d="M92 120L84 92L78 84"
                stroke="#1A1A1A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            <path
                d="M112 120L120 92L124 82"
                stroke="#1A1A1A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Body/Torso */}
            <path
                d="M92 120L112 120L108 152L94 152Z"
                stroke="#1A1A1A"
                strokeWidth="2.5"
                strokeLinejoin="round"
                fill="white"
            />

            {/* Legs */}
            {/* Standing Leg */}
            <path
                d="M97 152L93 182L87 185"
                stroke="#1A1A1A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* Bent/Kicking Leg */}
            <path
                d="M105 152L122 165L140 156"
                stroke="#1A1A1A"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

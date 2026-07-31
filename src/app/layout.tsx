import AppToaster from '@/components/common/AppToaster';
import Site24x7Tracker from '@/components/common/Site24x7Tracker';
import MixpanelInit from '@/components/common/MixpanelInit';
import { SWRProvider } from '@/providers/SWRProvider';
import { UserProvider } from '@/context/useUser';
import { IdleLogoutProvider } from '@/context/IdleLogoutContext';
import type { Metadata, Viewport } from 'next';
import { DM_Sans } from 'next/font/google';
import Script from 'next/script';
import React from 'react';
import './globals.css';

const dmSans = DM_Sans({
    subsets: ['latin'],
    weight: ['300', '400', '500', '600', '700'],
    variable: '--font-dm-sans',
    display: 'swap',
});

export const viewport: Viewport = {
    themeColor: '#0f172a',
};

export const metadata: Metadata = {
    manifest: '/manifest.json',
    metadataBase: new URL('https://www.weareanli.com/'),
    title: {
        default: 'ANLI Restaurant | Restaurant Booking & Reservations',
        template: '%s | ANLI Restaurant',
    },
    description:
        'Discover and book the best restaurants near you with ANLI Restaurant. Browse menus, make reservations, and manage your bookings.',
    keywords:
        'restaurant booking, restaurant reservations, find restaurants, restaurant near me, table booking',
    robots: {
        index: true,
        follow: true,
    },
    icons: {
        icon: '/favicon.ico',
        apple: '/apple-icon.png',
    },
    openGraph: {
        title: 'ANLI Restaurant | Restaurant Booking & Reservations',
        description:
            'Discover and book the best restaurants near you with ANLI Restaurant. Browse menus, make reservations, and manage your bookings.',
        url: 'https://www.weareanli.com/',
        siteName: 'ANLI Restaurant',
        images: [
            {
                url: 'https://www.weareanli.com/anli-logo.jpg',
                width: 1200,
                height: 630,
                alt: 'ANLI Restaurant Booking',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'ANLI Restaurant | Restaurant Booking & Reservations',
        description:
            'Discover and book the best restaurants near you with ANLI Restaurant.',
        images: ['https://www.weareanli.com/anli-logo.jpg'],
    },
    alternates: {
        canonical: 'https://www.weareanli.com/',
    },
};

function ItemsProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

function HotelServicesProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

function StateDebugger() {
    return null;
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <Script id="schema-org" type="application/ld+json">
                {JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'SoftwareApplication',
                    name: 'ANLI Restaurant',
                    applicationCategory: 'BusinessApplication',
                    operatingSystem: 'Cloud-based',
                    url: 'https://www.weareanli.com/',
                    description:
                        'ANLI Restaurant is a restaurant booking platform that helps users discover restaurants, browse menus, and make reservations.',
                    featureList: [
                        'Restaurant Discovery',
                        'Table Reservations',
                        'Menu Browsing',
                    ],
                    aggregateRating: {
                        '@type': 'AggregateRating',
                        ratingValue: '4.8',
                        ratingCount: '250',
                        reviewCount: '250',
                    },
                    image: 'https://www.weareanli.com/logos/anli-logo.png',
                })}
            </Script>

            <Script
                src="https://www.googletagmanager.com/gtag/js?id=G-0WYT3HR40K"
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', 'G-0WYT3HR40K');
                `}
            </Script>

            <body className={`${dmSans.variable} antialiased`}>
                <Site24x7Tracker />
                <MixpanelInit />
                <SWRProvider>
                    <UserProvider>
                        <IdleLogoutProvider>
                            <ItemsProvider>
                                <HotelServicesProvider>
                                    <StateDebugger />
                                    <AppToaster />
                                    {children}
                                </HotelServicesProvider>
                            </ItemsProvider>
                        </IdleLogoutProvider>
                    </UserProvider>
                </SWRProvider>
            </body>
        </html>
    );
}

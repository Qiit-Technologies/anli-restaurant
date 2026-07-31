'use client';

import { useEffect } from 'react';

/**
 * Site24x7 Real User Monitoring (RUM) tracker component
 * This component initializes Site24x7 tracking for performance monitoring and error tracking
 */
export default function Site24x7Tracker() {
    useEffect(() => {
        if (
            typeof window !== 'undefined' &&
            window.performance &&
            window.performance.timing &&
            window.performance.navigation &&
            !(window as any).s247r
        ) {
            const w = window as any;
            const d = document;
            const s =
                '//static.site24x7rum.com/beacon/site24x7rum-min.js?appKey=';
            const r = 's247r';
            const k = '4b9c4d1977ee030730406cc0c8f4dfc1';

            // Initialize the Site24x7 function
            w[r] =
                w[r] ||
                function (...args: any[]) {
                    (w[r].q = w[r].q || []).push(args);
                };

            // Create and append the script
            const h = d.createElement('script');
            h.async = true;
            h.setAttribute('src', s + k);
            d.getElementsByTagName('head')[0].appendChild(h);

            // Set up error tracking
            const m = window.onerror;
            window.onerror = function (
                message: string | Event,
                source?: string,
                lineno?: number,
                colno?: number,
                error?: Error,
            ) {
                // Call original error handler if it exists
                if (m) {
                    m(message, source, lineno, colno, error);
                }

                // Capture exception for Site24x7
                if (!error && typeof message === 'string') {
                    error = new Error(message);
                }
                if (error) {
                    (w[r].q = w[r].q || []).push(['captureException', error]);
                }

                return false;
            };
        }
    }, []);

    return null;
}

'use client';

import { useEffect } from 'react';

export default function MixpanelProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        import('mixpanel-browser').then((mixpanel) => {
            const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;
            if (token) {
                mixpanel.default.init(token, {
                    debug: process.env.NODE_ENV === 'development',
                    track_pageview: true,
                    persistence: 'localStorage',
                });
            }
        });
    }, []);

    return <>{children}</>;
}

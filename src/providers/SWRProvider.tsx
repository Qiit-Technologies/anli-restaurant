'use client';

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

interface SWRProviderProps {
    children: ReactNode;
}

//  Global SWR Configuration Provider
export function SWRProvider({ children }: SWRProviderProps) {
    return (
        <SWRConfig
            value={{
                dedupingInterval: 2000,

                revalidateOnFocus: false,

                refreshWhenHidden: false,

                revalidateOnReconnect: true,

                revalidateIfStale: true,

                keepPreviousData: true,

                errorRetryCount: 3,
                errorRetryInterval: 5000,

                onErrorRetry: (
                    error,
                    key,
                    config,
                    revalidate,
                    { retryCount },
                ) => {
                    const status = error?.status || error?.response?.status;

                    if (status === 404 || status === 403) return;

                    if (retryCount >= 3) return;

                    setTimeout(() => revalidate({ retryCount }), 5000);
                },
            }}
        >
            {children}
        </SWRConfig>
    );
}

export default SWRProvider;

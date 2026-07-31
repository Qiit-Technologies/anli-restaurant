'use client';

import { Toaster } from 'react-hot-toast';

export default function AppToaster() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    fontFamily: 'DM Sans, sans-serif',
                    borderRadius: '8px',
                    padding: '16px',
                    color: '#000',
                    fontWeight: '500',
                    background: '#fff',
                },
                className: 'animate-fadeIn',
            }}
        />
    );
}

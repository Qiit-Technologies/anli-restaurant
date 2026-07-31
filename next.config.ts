import type { NextConfig } from 'next';
// import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
    output: 'standalone',

    async redirects() {
        return [];
    },

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**',
            },
            {
                protocol: 'https',
                hostname: 'weareanli.com',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
        unoptimized: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },

    // Stabilize client/RSC boundaries for libraries that use React context
    transpilePackages: [
        '@heroui/react',
        '@heroui/system',
        '@heroui/theme',
        '@heroui/spinner',
        'nextjs-toploader',
    ],
    experimental: {
        serverActions: {
            bodySizeLimit: '10mb',
        },
        // Lower concurrency reduces flaky `createContext is not a function`
        // failures during "Collecting page data" on constrained CI hosts.
        staticGenerationMaxConcurrency: 2,
        staticGenerationMinPagesPerWorker: 25,
    },
};


export default nextConfig;

// export default withPWA({
//     dest: 'public',
//     register: true,
//     skipWaiting: true,
//     disable: process.env.NODE_ENV === 'development',

//     runtimeCaching: [
//         {
//             urlPattern: /^https:\/\/api\./,
//             handler: 'NetworkFirst',
//             options: {
//                 cacheName: 'api-cache',
//                 expiration: {
//                     maxEntries: 50,
//                     maxAgeSeconds: 60 * 60 * 24,
//                 },
//             },
//         },
//     ],
// })(nextConfig);


const nextConfig = {

    experimental: {
        optimizePackageImports: ['@heroicons/react', 'framer-motion', 'lucide-react'],
    },

    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },

    images: {
        domains: ['images.unsplash.com'],
        remotePatterns: [
            {
                protocol: "https",
                hostname: "img.clerk.com",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "res.cloudinary.com",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "api.qrserver.com",
                port: "",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "images.unsplash.com",
                port: "",
                pathname: "/**",
            },
        ],
        formats: ['image/webp', 'image/avif'],
        minimumCacheTTL: 60,
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },

    webpack: (config, { dev, isServer }) => {

        /*
        if (!dev && !isServer) {
            config.optimization.splitChunks = {
                chunks: 'all',
                cacheGroups: {
                    default: false,
                    vendors: false,

                    vendor: {
                        name: 'vendor',
                        chunks: 'all',
                        test: /node_modules/,
                        priority: 20,
                    },

                    common: {
                        name: 'common',
                        minChunks: 2,
                        chunks: 'all',
                        priority: 10,
                        reuseExistingChunk: true,
                        enforce: true,
                    },

                    ui: {
                        name: 'ui',
                        test: /[\\/]src[\\/]components[\\/]ui[\\/]/,
                        chunks: 'all',
                        priority: 30,
                    },

                    'layout-group': {
                        name: 'layout-group',
                        test: /[\\/]src[\\/]components[\\/]layout[\\/]/,
                        chunks: 'all',
                        priority: 25,
                    },
                },
            };
        }
        */

        return config;
    },

    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-XSS-Protection',
                        value: '1; mode=block',
                    },
                ],
            },
            {
                source: '/images/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            {
                source: '/videos/(.*)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },

    serverExternalPackages: ["@neondatabase/serverless"],
};

export default nextConfig;
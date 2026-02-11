/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        // Enable WebAssembly support
        config.experiments = {
            ...config.experiments,
            asyncWebAssembly: true,
            syncWebAssembly: true,
            layers: true,
        };

        // Ignore problematic WASM modules from @icr/polyseg-wasm
        config.module.rules.push({
            test: /\.wasm$/,
            include: /node_modules\/@icr\/polyseg-wasm/,
            use: 'ignore-loader',
        });

        // Handle other WebAssembly files normally
        config.module.rules.push({
            test: /\.wasm$/,
            exclude: /node_modules\/@icr\/polyseg-wasm/,
            type: 'webassembly/async',
        });

        // Handle DICOM files
        config.module.rules.push({
            test: /\.dcm$/i,
            type: 'asset/resource',
        });

        // Ignore the entire problematic package
        config.resolve.alias = {
            ...config.resolve.alias,
            '@icr/polyseg-wasm': false,
        };

        // Don't resolve these modules on server side
        if (!isServer) {
            config.resolve.fallback = {
                ...config.resolve.fallback,
                fs: false,
                path: false,
                crypto: false,
                stream: false,
                buffer: false,
            };
        }

        return config;
    },

    // Suppress WebAssembly warnings and enable experimental features
    experimental: {
        esmExternals: 'loose',
    },

    // Handle static files
    async headers() {
        return [
            {
                source: '/dicom/:path*',
                headers: [
                    {
                        key: 'Content-Type',
                        value: 'application/dicom',
                    },
                ],
            },
        ];
    },
};

export default nextConfig;

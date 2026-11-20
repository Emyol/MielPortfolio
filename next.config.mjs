import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
    turbopack: {
        root: projectRoot,
    },
    images: {
        // Only the static images Dive.jsx optimizes (see OPTIMIZE there): no query string, or a ?v=1..22 cache key.
        // Exact matches keep the optimizer from being asked for arbitrary paths or endless query variants
        // (Next allows at most 25 patterns).
        localPatterns: [
            ...['', ...Array.from({ length: 22 }, (_, i) => '?v=' + (i + 1))].map((search) => ({
                pathname: '/{projects,certificates}/*.{jpg,jpeg,png,webp}',
                search,
            })),
            { pathname: '/hero-profile.png', search: '' },
        ],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
    },
};

export default nextConfig;

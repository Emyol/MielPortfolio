import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
    turbopack: {
        root,
        resolveAlias: {
            three: path.join(root, 'node_modules/three'),
            '@react-three/fiber': path.join(root, 'node_modules/@react-three/fiber'),
            '@react-three/drei': path.join(root, 'node_modules/@react-three/drei'),
        },
    },
    transpilePackages: ['three', '@react-three/fiber', '@react-three/drei'],
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
        ],
    },
};

export default nextConfig;

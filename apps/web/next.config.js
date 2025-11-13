/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import './src/env.js'

/** @type {import('next').NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'do5q0y4otbt6jaho.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      const originalConsoleError = console.error;
      console.error = (...args) => {
        if (
          typeof args[0] === 'string' &&
          args[0].includes('did not match') &&
          args[0].includes('hydrated')
        ) {
          return; // skip hydration mismatch warnings
        }
        originalConsoleError(...args);
      };
    }

    return config;
  },
};

export default config;

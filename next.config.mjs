/** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: false,
//   basePath: process.env.BASEPATH && process.env.BASEPATH !== '/' ? process.env.BASEPATH : ''
// };

// export default nextConfig


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,

  // ✅ Base path (kept same as your setup)
  basePath:
    process.env.BASEPATH && process.env.BASEPATH !== '/'
      ? process.env.BASEPATH
      : '',

  // ✅ Speed up rebuilds by ignoring unnecessary folders
  webpack(config, { dev }) {
    if (dev) {
      config.watchOptions = {
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
          '**/public/**',
          '**/scripts/**',
          '**/coverage/**'
        ],
      }
    }
    return config
  },

  // ✅ Enable SWC minify + caching
  swcMinify: true,

  // ✅ Future experimental speedups (safe & stable)
  experimental: {
    turbo: true, // uses the new Turbopack dev compiler (blazing fast)
    swcFileReading: true, // improves incremental builds
  },
}

export default nextConfig


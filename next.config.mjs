/** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: false,
//   basePath: process.env.BASEPATH && process.env.BASEPATH !== '/' ? process.env.BASEPATH : ''
// };

// export default nextConfig


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  swcMinify: true,
  basePath:
    process.env.BASEPATH && process.env.BASEPATH !== '/'
      ? process.env.BASEPATH
      : '',
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
        ]
      }
    }
    return config
  }
}

export default nextConfig


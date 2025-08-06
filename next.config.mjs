/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  basePath: process.env.BASEPATH && process.env.BASEPATH !== '/' ? process.env.BASEPATH : ''
};

export default nextConfig

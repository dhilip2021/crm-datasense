/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: process.env.BASEPATH && process.env.BASEPATH !== '/' ? process.env.BASEPATH : ''
};

export default nextConfig

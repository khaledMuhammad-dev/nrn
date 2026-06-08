/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@nrn/shared'],
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
};

module.exports = nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Required for the Docker multi-stage build (standalone output)
  output: 'standalone',
};

export default nextConfig;

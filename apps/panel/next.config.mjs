/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@saran/tokens", "@saran/shared", "@saran/supabase"],
};

export default nextConfig;

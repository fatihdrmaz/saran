/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @saran/* paketleri TS kaynağı olarak dağıtılıyor → Next derlesin.
  transpilePackages: ["@saran/tokens", "@saran/shared", "@saran/supabase"],
};

export default nextConfig;

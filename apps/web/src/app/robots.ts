import type { MetadataRoute } from "next";

/**
 * NOT: Base URL şimdilik Vercel önizleme alan adına sabitlenmiştir;
 * özel domain alınınca burası (ve sitemap.ts) güncellenecek.
 */
const BASE_URL = "https://saran-web-peach.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

import type { MetadataRoute } from "next";
import { fetchArticleSlugs } from "../lib/articles";
import { SERVICES } from "../lib/services";

/**
 * NOT: Base URL şimdilik Vercel önizleme alan adına sabitlenmiştir;
 * özel domain alınınca burası (ve robots.ts) güncellenecek.
 */
const BASE_URL = "https://www.yaratakibi.com";

/** Statik pazarlama + yasal sayfalar. */
const STATIC_PATHS = [
  "/",
  "/blog",
  "/degerlendirme",
  "/hizmetler",
  ...SERVICES.map((s) => `/hizmetler/${s.slug}`),
  "/iletisim",
  "/yorumlar",
  "/kvkk",
  "/kosullar",
  "/mesafeli-satis",
  "/iptal-iade",
  "/cerez-politikasi",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_PATHS.map((path) => ({
    url: `${BASE_URL}${path === "/" ? "" : path}`,
    changeFrequency: path === "/" || path === "/blog" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : path.startsWith("/hizmetler") ? 0.8 : 0.6,
  }));

  // DB'den blog slug'ları — hata durumunda sitemap statik sayfalarla yayınlanır.
  try {
    const slugs = await fetchArticleSlugs();
    for (const slug of slugs) {
      entries.push({
        url: `${BASE_URL}/blog/${slug}`,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  } catch {
    // fetchArticleSlugs zaten içeride hata yutar; bu blok ekstra güvence.
  }

  return entries;
}

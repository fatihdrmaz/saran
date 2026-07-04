/**
 * Blog makaleleri — README §6B-3.
 * İçerik artık Supabase `articles` tablosundan (anon, server-side) gelir.
 * Bu dosya tipleri, sunum yardımcılarını (kategori rengi/çip, görsel gradyanı,
 * yazar) ve DB satırını UI modeline dönüştüren fonksiyonları içerir.
 *
 * DB kolonları (snake_case): id, category, title, slug, intro, body,
 * reading_minutes, locale, published_at, created_at, author_nurse_id, image_url.
 * `body` markdown benzeri düz metindir; harici lib olmadan basit bloklara ayrılır.
 */

import { getSupabase } from "./supabase";

export type ArticleBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "note"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

export interface Article {
  slug: string;
  category: string;
  /** kategori çipi rengi */
  categoryColor: { bg: string; fg: string };
  /** liste/öne çıkan kart için kısa kategori etiketi */
  chip: string;
  title: string;
  excerpt: string;
  intro: string;
  readingLabel: string;
  /** öne çıkan / liste sırası */
  featured?: boolean;
  /** görsel placeholder gradyanı (imageUrl yoksa fallback) */
  imageGradient: string;
  /** Supabase storage kapak görseli; yoksa null → gradyan fallback */
  imageUrl: string | null;
  author: {
    name: string;
    title: string;
    initial: string;
  };
  body: ArticleBlock[];
}

const AUTHOR = {
  name: "Hem. Ayşe Yıldız",
  title: "Sertifikalı Yara Bakım Hemşiresi",
  initial: "A",
};

/** Kategori adına göre çip rengi / gradyan eşlemesi (sunum amaçlı). */
const CATEGORY_PRESENTATION: Record<
  string,
  { color: { bg: string; fg: string }; gradient: string }
> = {
  "Diyabetik ayak": {
    color: { bg: "var(--surface-green)", fg: "var(--primary)" },
    gradient: "#c9a593, #a87a66",
  },
  "Bası yarası": {
    color: { bg: "var(--surface-green)", fg: "var(--primary)" },
    gradient: "#be8e78, #a06a52",
  },
  Pansuman: {
    color: { bg: "var(--star-bg)", fg: "var(--star-text)" },
    gradient: "#d2b894, #b89a76",
  },
  Beslenme: {
    color: { bg: "#ede7f6", fg: "#6b4fa8" },
    gradient: "#c9a78a, #a8855f",
  },
};

const DEFAULT_PRESENTATION = {
  color: { bg: "var(--surface-green)", fg: "var(--primary)" },
  gradient: "#c9a593, #a87a66",
};

export const blogCategories = [
  "Tümü",
  "Diyabetik ayak",
  "Bası yarası",
  "Pansuman",
  "Beslenme",
] as const;

/** DB `articles` satırının seçtiğimiz alt kümesi. */
type ArticleRow = {
  slug: string;
  category: string;
  title: string;
  intro: string;
  body: string;
  reading_minutes: number;
  published_at: string | null;
  image_url: string | null;
};

const ARTICLE_COLUMNS =
  "slug, category, title, intro, body, reading_minutes, published_at, created_at, image_url";

/**
 * DB `body` (markdown benzeri düz metin) → ArticleBlock[].
 * Desteklenen:
 *   `## Başlık`  → h2
 *   `> not`      → note (ardışık `>` satırları tek kutu)
 *   `- madde`    → ul (ardışık `- ` satırları tek liste)
 *   `1. adım`    → ol (ardışık `N. ` satırları tek liste)
 *   diğer satır blokları → paragraf (boş satırla ayrılır)
 * Harici markdown lib YOK; sadeleştirilmiş dönüşüm.
 */
function parseBody(raw: string): ArticleBlock[] {
  if (!raw) return [];
  const blocks: ArticleBlock[] = [];
  // Boş satırlarla ayrılmış parçalara böl.
  const chunks = raw
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((c) => c.trim())
    .filter(Boolean);

  const UL_RE = /^[-*]\s+/;
  const OL_RE = /^\d+[.)]\s+/;

  for (const chunk of chunks) {
    const lines = chunk
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    // Parça içinde satır satır ilerle; ardışık liste/alıntı satırlarını grupla.
    let i = 0;
    const paragraph: string[] = [];
    const flushParagraph = () => {
      if (paragraph.length > 0) {
        blocks.push({
          type: "p",
          text: paragraph.join(" ").replace(/^#{1,6}\s+/, ""),
        });
        paragraph.length = 0;
      }
    };

    while (i < lines.length) {
      const line = lines[i];

      // `> not` → note (ardışık satırlar birleşir)
      if (line.startsWith(">")) {
        flushParagraph();
        const noteLines: string[] = [];
        while (i < lines.length && lines[i].startsWith(">")) {
          noteLines.push(lines[i].replace(/^>\s?/, ""));
          i += 1;
        }
        blocks.push({ type: "note", text: noteLines.join(" ").trim() });
        continue;
      }

      // `- madde` → ul
      if (UL_RE.test(line)) {
        flushParagraph();
        const items: string[] = [];
        while (i < lines.length && UL_RE.test(lines[i])) {
          items.push(lines[i].replace(UL_RE, "").trim());
          i += 1;
        }
        blocks.push({ type: "ul", items });
        continue;
      }

      // `1. adım` → ol
      if (OL_RE.test(line)) {
        flushParagraph();
        const items: string[] = [];
        while (i < lines.length && OL_RE.test(lines[i])) {
          items.push(lines[i].replace(OL_RE, "").trim());
          i += 1;
        }
        blocks.push({ type: "ol", items });
        continue;
      }

      // `## Başlık` → h2
      const headingMatch = line.match(/^#{1,6}\s+(.*)$/);
      if (headingMatch) {
        flushParagraph();
        blocks.push({ type: "h2", text: headingMatch[1].trim() });
        i += 1;
        continue;
      }

      // Aksi halde paragraf satırı (aynı parçadaki ardışık satırlar birleşir)
      paragraph.push(line);
      i += 1;
    }

    flushParagraph();
  }

  return blocks;
}

/** DB satırını UI Article modeline dönüştür. */
function toArticle(row: ArticleRow, featured = false): Article {
  const presentation =
    CATEGORY_PRESENTATION[row.category] ?? DEFAULT_PRESENTATION;
  const minutes = row.reading_minutes || 5;
  return {
    slug: row.slug,
    category: row.category,
    categoryColor: presentation.color,
    chip: row.category.toLocaleUpperCase("tr-TR"),
    title: row.title,
    excerpt: row.intro,
    intro: row.intro,
    readingLabel: `${minutes} dk okuma`,
    featured,
    imageGradient: presentation.gradient,
    imageUrl: row.image_url ?? null,
    author: AUTHOR,
    body: parseBody(row.body),
  };
}

/**
 * Yayınlanmış makaleleri getir (anon, server-side).
 * Sıra: published_at (varsa) ardından created_at, en yeni önce.
 * DB hatası/erişim sorununda boş liste döner ki `next build` kırılmasın.
 */
export async function fetchArticles(): Promise<Article[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("articles")
      .select(ARTICLE_COLUMNS)
      .not("published_at", "is", null)
      .order("published_at", { ascending: false })
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return (data as ArticleRow[]).map((row, i) => toArticle(row, i === 0));
  } catch {
    return [];
  }
}

/** Tek makale (slug). Yayınlanmamışsa/yoksa null. */
export async function fetchArticle(slug: string): Promise<Article | null> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("articles")
      .select(ARTICLE_COLUMNS)
      .eq("slug", slug)
      .not("published_at", "is", null)
      .maybeSingle();

    if (error || !data) return null;
    return toArticle(data as ArticleRow);
  } catch {
    return null;
  }
}

/** Liste sayfası için öne çıkan + diğerleri. */
export async function fetchBlogList(): Promise<{
  featured: Article | null;
  others: Article[];
}> {
  const all = await fetchArticles();
  if (all.length === 0) return { featured: null, others: [] };
  const [featured, ...others] = all;
  return { featured, others };
}

/** generateStaticParams için yayınlanmış slug listesi. */
export async function fetchArticleSlugs(): Promise<string[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("articles")
      .select("slug")
      .not("published_at", "is", null);

    if (error || !data) return [];
    return (data as { slug: string }[]).map((r) => r.slug);
  } catch {
    return [];
  }
}

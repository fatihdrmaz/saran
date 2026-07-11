/**
 * İyileşme hikâyeleri — ana sayfa yorum kartları.
 * İçerik Supabase `reviews` tablosundan (anon, server-side) gelir.
 * `articles.ts` kalıbı: DB hatasında boş liste döner ki `next build` kırılmasın.
 *
 * DB kolonları: display_name, rating, text, wound_type, duration_label, created_at.
 */

import { getSupabase } from "./supabase";

export interface Review {
  /** Kart anahtarı için DB id */
  id: string;
  /** Alıntı metni (tırnaksız ham metin) */
  quote: string;
  /** Görünen ad (ör. "Meltem K.") */
  name: string;
  /** Avatar için baş harf */
  initial: string;
  /** 1–5 yıldız */
  rating: number;
  /** Yara tipi TR etiketi (ör. "Bası yarası") */
  woundLabel: string;
  /** Süre rozeti (ör. "6 haftada") — yoksa null */
  durationLabel: string | null;
  /** Önce/sonra placeholder gradyanları */
  before: string;
  after: string;
}

/** wound_type enum → TR etiket. */
const WOUND_LABELS: Record<string, string> = {
  pressure: "Bası yarası",
  diabetic_foot: "Diyabetik ayak",
  surgical: "Cerrahi yara",
  venous: "Venöz ülser",
  burn: "Yanık yarası",
};

/** Önce/sonra placeholder gradyanları (sunum amaçlı, sırayla döner). */
const GRADIENTS: { before: string; after: string }[] = [
  { before: "#c9a593, #a87a66", after: "#e0cfb2, #cbb592" },
  { before: "#be8e78, #a06a52", after: "#e2d2b6, #cdb994" },
  { before: "#c49a86, #a2705a", after: "#e4d4b8, #cfbb96" },
];

/** DB `reviews` satırının seçtiğimiz alt kümesi. */
type ReviewRow = {
  id: string;
  display_name: string | null;
  rating: number;
  text: string;
  wound_type: string;
  duration_label: string | null;
};

/**
 * duration_label → süre rozeti.
 * "6 hafta" → "6 haftada"; diğer biçimler olduğu gibi gösterilir.
 */
function toDurationBadge(raw: string | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const week = trimmed.match(/^(\d+)\s*hafta$/i);
  if (week) return `${week[1]} haftada`;
  return trimmed;
}

function toReview(row: ReviewRow, index: number): Review {
  const name = row.display_name?.trim() || "Yara Takibi hastası";
  const gradient = GRADIENTS[index % GRADIENTS.length];
  return {
    id: row.id,
    quote: row.text,
    name,
    initial: name.charAt(0).toLocaleUpperCase("tr-TR"),
    rating: Math.max(1, Math.min(5, Math.round(row.rating))),
    woundLabel: WOUND_LABELS[row.wound_type] ?? "Yara takibi",
    durationLabel: toDurationBadge(row.duration_label),
    before: gradient.before,
    after: gradient.after,
  };
}

/**
 * Yorumları getir (anon, server-side): en yeni `limit` kayıt (varsayılan 6 —
 * ana sayfa; /yorumlar sayfası 50 çeker).
 * DB hatası/erişim sorununda boş liste döner (bölüm gizlenir).
 */
export async function fetchReviews(limit = 6): Promise<Review[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("reviews")
      .select("id, display_name, rating, text, wound_type, duration_label")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return (data as ReviewRow[]).map(toReview);
  } catch {
    return [];
  }
}

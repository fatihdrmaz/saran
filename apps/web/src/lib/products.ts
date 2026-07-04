import { getSupabase } from "./supabase";

/**
 * Bakım planı ürünleri — kaynak: `plan_products` (admin panelden yönetilir).
 * Fiyat/başlık DEĞİŞTİRMEK için kod gerekmez; panel → Yönetim → Ürünler.
 * Hata durumunda boş liste döner (build/SSR asla çökmez; bölüm gizlenir).
 */
export interface Product {
  id: string;
  code: string;
  title: string;
  description: string | null;
  durationDays: number;
  priceKurus: number;
}

export async function fetchProducts(): Promise<Product[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("plan_products")
      .select("id, code, title, description, duration_days, price_kurus, sort_order")
      .eq("active", true)
      .order("sort_order", { ascending: true });

    if (error || !data) return [];
    return data.map((r) => ({
      id: r.id as string,
      code: r.code as string,
      title: r.title as string,
      description: (r.description as string | null) ?? null,
      durationDays: r.duration_days as number,
      priceKurus: r.price_kurus as number,
    }));
  } catch {
    return [];
  }
}

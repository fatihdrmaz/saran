import { createSaranClient } from "@saran/supabase";

/**
 * Pazarlama sitesi için tarayıcı Supabase client'ı (anon).
 * SSR/sunucu bileşenlerinde cookie tabanlı client ayrıca kurulmalı
 * (@supabase/ssr) — pazarlama sayfaları çoğunlukla anon okuma yapar.
 */
export const supabase = createSaranClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
);

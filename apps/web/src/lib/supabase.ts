import { createSaranClient, type SaranClient } from "@saran/supabase";

/**
 * Pazarlama sitesi için Supabase client'ı (anon).
 * TEMBEL (lazy) oluşturulur: env eksikse import anında değil, ilk kullanımda
 * hata verir ve çağıran (articles.ts) try/catch ile yakalar → `next build` çökmez.
 */
let _client: SaranClient | null = null;

export function getSupabase(): SaranClient {
  if (_client) return _client;
  _client = createSaranClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  );
  return _client;
}

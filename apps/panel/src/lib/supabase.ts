import { createSaranClient, type SaranClient } from "@saran/supabase";

/**
 * Hemşire & admin paneli için tarayıcı (client-side) Supabase client'ı.
 * Panel login arkasında ve interaktif olduğundan client component'lerde kullanılır;
 * oturum localStorage'da kalıcıdır (supabase-js varsayılanı).
 *
 * ÖNEMLİ: createSaranClient env eksikse throw eder. Build/SSR sırasında
 * module top-level'da patlamamak için client TEMBEL (lazy) oluşturulur ve
 * yalnızca tarayıcıda çağrılır.
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

import {
  createClient,
  type SupabaseClient,
  type SupabaseClientOptions,
} from "@supabase/supabase-js";
import type { Database } from "./database.types";

export type SaranClient = SupabaseClient<Database>;

/**
 * Ortak Supabase client factory. Her app kendi url+anonKey ve (mobilde) auth
 * storage'ını geçirir — böylece web/panel (Next) ve mobil (Expo) aynı paketi kullanır.
 *
 *  - Web/Panel:  createSaranClient(NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)
 *  - Mobil:      createSaranClient(EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY,
 *                  { auth: { storage: AsyncStorage, ... } })
 */
export function createSaranClient(
  url: string,
  anonKey: string,
  options?: SupabaseClientOptions<"public">,
): SaranClient {
  if (!url || !anonKey) {
    throw new Error(
      "[@saran/supabase] SUPABASE url/anon key eksik. .env dosyanı kontrol et.",
    );
  }
  return createClient<Database>(url, anonKey, options);
}

/** Yara fotoğrafları için kullanılan private storage bucket adı. */
export const WOUND_PHOTOS_BUCKET = "wound-photos";

/** Bir yaranın fotoğrafı için storage yol kuralı: wound-photos/{woundId}/{dosya} */
export function woundPhotoPath(woundId: string, fileName: string): string {
  return `${woundId}/${fileName}`;
}

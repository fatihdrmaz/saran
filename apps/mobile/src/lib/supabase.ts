import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSaranClient } from "@saran/supabase";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Mobil (Expo) Supabase client. Oturum AsyncStorage'da kalıcı tutulur.
 * EXPO_PUBLIC_* değişkenleri .env dosyasından gelir (bkz. .env.example).
 */
export const supabase = createSaranClient(url, anonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

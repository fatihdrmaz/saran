import { Platform } from "react-native";
import { colors, fontSizes } from "@saran/tokens";

/**
 * Tipografi yardımcıları. README §5: başlıklarda Newsreader serif hissi.
 * Cihaza font dosyası yüklenmediği için sistem serif fallback kullanılır.
 */
export const serifFont = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "serif",
});

/** Plus Jakarta Sans yerine sistem sans (font dosyası bundle edilmedi). */
export const sansFont = Platform.select({
  ios: "System",
  android: "sans-serif",
  default: "System",
});

export const type = fontSizes.mobile;

/** Beyaz (koyu zemin üstü metin için yardımcı sabit). */
export const white = "#FFFFFF";

/** Kuruş integer → "149,90 ₺" string. README: para her yerde kuruş integer. */
export function formatKurus(kurus: number): string {
  return `${(kurus / 100).toFixed(2).replace(".", ",")} ₺`;
}

export { colors };

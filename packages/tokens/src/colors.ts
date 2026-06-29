/**
 * Saran marka renkleri — design_handoff_saran/README.md §5 "Renkler" tablosundan.
 * Tek kaynak: mobil, web ve panel bu paletten beslenir.
 */
export const colors = {
  // Yeşil omurga
  primary: "#0E7A63", // ana yeşil (butonlar, vurgu)
  primaryDark: "#0E3B31", // en koyu yeşil (panel sidebar, koyu zemin)
  primaryMid: "#1FA37A", // orta yeşil (panel vurgu / aktif)
  tealLight: "#7FD8C4", // açık teal (koyu zeminde metin)

  // Yüzeyler
  surfaceGreen: "#E3F0EB", // açık yeşil yüzey (rozet/şerit zemini)
  surfaceGreenAlt: "#E8F6EE",
  bgCream: "#F5F1E9", // krem ana arka plan
  surface: "#F8F6F0", // kart içi ikincil yüzey
  surfaceAlt: "#F2EFE6",
  cardBorder: "#ECE7DB", // kart kenarlığı

  // Metin
  textHeading: "#18302A", // koyu başlık
  textBody: "#33423D", // gövde
  textBodyAlt: "#4A5C56",
  textMuted: "#5E726B", // soluk ikincil
  textMutedAlt: "#9AA8A2",

  // Vurgular / durumlar
  warm: "#D98456", // sıcak turuncu ("popüler")
  warningText: "#C07A2E", // onay bekliyor metni
  warningBg: "#FDEBD8",
  danger: "#C2553B", // acil / hata
  dangerAlt: "#D9534F",
  dangerBg: "#FBE3E2",
  dangerBgAlt: "#FBF1EE",
  star: "#E0A33B", // yıldız / puan sarısı
  starBg: "#FBF1DD",
  starText: "#B07D1E",
  successText: "#1FA37A", // başarı rozeti metni
  successBg: "#E3F4EC",
} as const;

/**
 * Durum rozetleri — README §7 "Durum rozetleri her yerde tutarlı".
 * Aktif takip ✓ (yeşil) / Onay bekliyor (turuncu) / Değerlendirme (sarı) / Acil (kırmızı).
 */
export const statusColors = {
  active: { fg: colors.successText, bg: colors.successBg }, // Aktif takip ✓
  pending: { fg: colors.warningText, bg: colors.warningBg }, // Onay bekliyor
  assessment: { fg: colors.starText, bg: colors.starBg }, // Değerlendirme
  emergency: { fg: colors.danger, bg: colors.dangerBg }, // Acil
} as const;

export type ColorToken = keyof typeof colors;
export type StatusKey = keyof typeof statusColors;

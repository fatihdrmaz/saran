/**
 * Boşluk, köşe yarıçapı, gölge — README §5 "Şekil & Gölge".
 */

/** Boşluk ölçeği (px). README'de yaygın kullanılan adımlar. */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  "2xl": 28,
  "3xl": 44,
} as const;

/** Köşe yarıçapı (px). */
export const radius = {
  sm: 12, // küçük öğeler 10–14
  md: 18, // kartlar 16–22
  lg: 22,
  device: 44, // mobil cihaz çerçevesi 42–46
  pill: 999, // rozet/pill
} as const;

/** Gölgeler — web/panel için CSS string. */
export const shadows = {
  card: "0 1px 3px rgba(0,0,0,.08)",
  elevatedGreen: "0 24px 50px -28px rgba(14,122,99,.4)",
  deviceFrame: "0 30px 80px -24px rgba(0,0,0,.5)",
} as const;

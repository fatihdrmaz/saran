/**
 * Tipografi — README §5.
 * Başlık/serif vurgu: Newsreader (genelde 500, sıklıkla italic).
 * Gövde/arayüz: Plus Jakarta Sans (400–800).
 */
export const fonts = {
  heading: "Newsreader", // serif vurgu — hero, bölüm başlığı, alıntı
  body: "Plus Jakarta Sans", // gövde + arayüz
} as const;

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

/** Platforma göre tip ölçeği (px). README §5. */
export const fontSizes = {
  mobile: { body: 14, bodySm: 13, heading: 22, hero: 30 },
  web: { body: 16, sectionTitle: 36, hero: 54 },
  panel: { body: 14, heading: 20, stat: 28 },
} as const;

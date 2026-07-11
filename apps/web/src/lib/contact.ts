/**
 * İletişim bilgileri — TEK KAYNAK.
 * Sayfalar ve bileşenler (iletişim sayfası, WhatsApp FAB, hizmet CTA'ları)
 * numara/e-postayı yalnızca buradan okur; gerçek bilgiler gelince sadece
 * bu dosya güncellenir.
 */
export const CONTACT = {
  /** PLACEHOLDER — gerçek numara gelince değiştirilecek (uluslararası biçim). */
  whatsapp: "+905000000000",
  /** PLACEHOLDER — gerçek numara gelince değiştirilecek (görünen biçim). */
  whatsappDisplay: "0500 000 00 00",
  /** PLACEHOLDER — gerçek adres gelince değiştirilecek. */
  email: "destek@yaratakibi.com",
  hours: "Her gün 09.00–21.00",
} as const;

/** wa.me linki üretir; mesaj verilirse sohbete ön-doldurulur. */
export function waLink(message?: string): string {
  const digits = CONTACT.whatsapp.replace(/\D/g, "");
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

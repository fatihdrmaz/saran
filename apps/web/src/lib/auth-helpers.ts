/**
 * Auth/form yardımcıları — değerlendirme formu, giriş sayfası ve Hesabım
 * tarafından ortak kullanılır.
 */

/** Supabase auth hata mesajlarını Türkçeye çevirir. */
export function translateAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("already registered") || m.includes("already been registered")) {
    return "Bu e-posta kayıtlı — “Zaten üyeyim” sekmesinden giriş yapın.";
  }
  if (m.includes("invalid login credentials")) {
    return "E-posta veya şifre hatalı. Şifrenizi unuttuysanız “Şifremi unuttum” bağlantısını kullanabilirsiniz.";
  }
  if (m.includes("email not confirmed")) {
    return "E-postanız henüz doğrulanmamış. Gelen kutunuzdaki doğrulama bağlantısına tıklayıp tekrar deneyin.";
  }
  if (m.includes("password should be at least")) {
    return "Şifre en az 8 karakter olmalı.";
  }
  if (m.includes("rate limit") || m.includes("too many requests")) {
    return "Çok fazla deneme yapıldı. Lütfen bir dakika bekleyip tekrar deneyin.";
  }
  if (m.includes("network") || m.includes("fetch")) {
    return "Bağlantı sorunu yaşandı. İnternetinizi kontrol edip tekrar deneyin.";
  }
  return "İşlem tamamlanamadı: " + message;
}

/** Dosya adını storage için güvenli hale getirir (Türkçe karakter, boşluk vb.). */
export function safeFileName(name: string): string {
  const dot = name.lastIndexOf(".");
  const ext = dot > 0 ? name.slice(dot + 1).toLowerCase().replace(/[^a-z0-9]/g, "") : "jpg";
  const base = (dot > 0 ? name.slice(0, dot) : name)
    .toLowerCase()
    .replace(/[çÇ]/g, "c")
    .replace(/[ğĞ]/g, "g")
    .replace(/[ıİi]/g, "i")
    .replace(/[öÖ]/g, "o")
    .replace(/[şŞ]/g, "s")
    .replace(/[üÜ]/g, "u")
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-{2,}/g, "-")
    .slice(0, 60) || "foto";
  return `${base}.${ext || "jpg"}`;
}

import { PlanStatus, PlanType } from "./enums";

/**
 * Saran iş kuralları — README §7. Tek kaynak; ön yüzler ve Edge Function'lar
 * aynı sabitleri kullanır ki kural her yerde tutarlı uygulansın.
 */

/** Platform komisyon oranı (hemşire kazancından kesilir) — README §6C-9: %10. */
export const PLATFORM_COMMISSION_RATE = 0.1;

/** İlk değerlendirme her zaman ücretsiz — README §7. */
export const FIRST_ASSESSMENT_FREE = true;

/** KDV oranı (placeholder — fatura entegrasyonunda netleşir). */
export const VAT_RATE = 0.2;

/**
 * Plan fiyatları (TRY, KURUŞ cinsinden integer). PLACEHOLDER — gerçek fiyatlar
 * iş tarafından belirlenecek. Para her yerde kuruş integer taşınır.
 */
export const PLAN_PRICES: Record<PlanType, number> = {
  [PlanType.ONE_TIME]: 14990, // 149,90 ₺
  [PlanType.WEEK_1]: 29990, // 299,90 ₺
  [PlanType.WEEK_3]: 69990, // 699,90 ₺
  [PlanType.MONTHLY]: 89990, // 899,90 ₺
};

/** Plan süresi (gün). one_time süresizdir (null). */
export const PLAN_DURATION_DAYS: Record<PlanType, number | null> = {
  [PlanType.ONE_TIME]: null,
  [PlanType.WEEK_1]: 7,
  [PlanType.WEEK_3]: 21,
  [PlanType.MONTHLY]: 30,
};

/**
 * EN KRİTİK KURAL — Plan onay kapısı (README §7).
 * Hasta plan onaylayıp ödeme yapmadan mesajlaşma/fotoğraf takip akışı açılmaz.
 * Bir yaranın takibi yalnızca AKTİF planı varsa açıktır.
 */
export function isTrackingUnlocked(planStatus: PlanStatus | null | undefined): boolean {
  return planStatus === PlanStatus.ACTIVE;
}

/** Plan durumundan "takip durumu" rozeti — README §7 tutarlı rozetler. */
export type TrackingBadge = "active" | "pending" | "assessment";

export function trackingBadge(planStatus: PlanStatus | null | undefined): TrackingBadge {
  if (planStatus === PlanStatus.ACTIVE) return "active"; // Aktif takip ✓
  if (planStatus === PlanStatus.PROPOSED) return "pending"; // Onay bekliyor
  return "assessment"; // henüz plan yok → Değerlendirme
}

/** Net hemşire kazancı (kuruş) = brüt − komisyon. README §6C-9. */
export function netNurseEarnings(grossKurus: number): number {
  return Math.round(grossKurus * (1 - PLATFORM_COMMISSION_RATE));
}

/**
 * Acil risk işaretleri — README §7 (artan kızarıklık, ateş, kötü koku, şiddetli ağrı).
 * Bu işaretlerden biri tespit edilirse hastaya Acil Uyarı ekranı gösterilir.
 */
export const EMERGENCY_FLAGS = [
  "increasing_redness", // artan kızarıklık
  "fever", // ateş
  "foul_odor", // kötü koku
  "severe_pain", // şiddetli ağrı
] as const;
export type EmergencyFlag = (typeof EMERGENCY_FLAGS)[number];

/** Yara fotoğrafları varsayılan olarak bulanık + 🔒 (README §5 mahremiyet kuralı). */
export const WOUND_PHOTOS_BLURRED_BY_DEFAULT = true;

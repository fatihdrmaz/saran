/**
 * Saran alan (domain) enum'ları. DB enum tipleriyle birebir hizalı tutulur
 * (bkz. supabase/migrations). `as const` + union tipi: hem runtime hem TS.
 */

export const UserRole = {
  PATIENT: "patient",
  NURSE: "nurse",
  ADMIN: "admin",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/** Yara tipi — README §6 (Bası / Diyabetik ayak / Cerrahi / Venöz / Yanık). */
export const WoundType = {
  PRESSURE: "pressure", // bası yarası
  DIABETIC_FOOT: "diabetic_foot", // diyabetik ayak
  SURGICAL: "surgical", // cerrahi
  VENOUS: "venous", // venöz
  BURN: "burn", // yanık
} as const;
export type WoundType = (typeof WoundType)[keyof typeof WoundType];

/** Klinik durum (hemşirenin gözlemi). "Takip durumu" rozeti plandan türetilir. */
export const WoundClinicalStatus = {
  IMPROVING: "improving", // iyileşiyor
  MONITORING: "monitoring", // izlem
  STALLED: "stalled", // duraklamış
  CLOSED: "closed", // kapandı
} as const;
export type WoundClinicalStatus =
  (typeof WoundClinicalStatus)[keyof typeof WoundClinicalStatus];

/** Ağrı seviyesi — README §6A-11 (Yok/Hafif/Orta/Şiddetli). */
export const PainLevel = {
  NONE: "none",
  MILD: "mild",
  MODERATE: "moderate",
  SEVERE: "severe",
} as const;
export type PainLevel = (typeof PainLevel)[keyof typeof PainLevel];

/** Akıntı seviyesi. */
export const ExudateLevel = {
  NONE: "none",
  LIGHT: "light",
  MODERATE: "moderate",
  HEAVY: "heavy",
} as const;
export type ExudateLevel = (typeof ExudateLevel)[keyof typeof ExudateLevel];

/**
 * Plan türü. KARAR: plan YARA BAŞINA. Aylık = manuel yenileme (otomatik abonelik yok).
 * one_time = tek seferlik bakım talimatı satın alma alternatifi (README §6A-6).
 */
export const PlanType = {
  ONE_TIME: "one_time", // tek seferlik (legacy)
  WEEK_1: "week_1", // haftalık takip
  WEEK_2: "week_2", // 2 haftalık takip
  WEEK_3: "week_3", // 3 haftalık (legacy)
  MONTHLY: "monthly", // aylık takip (manuel yenilenir)
} as const;
export type PlanType = (typeof PlanType)[keyof typeof PlanType];

/**
 * Plan durumu — KARAR: havuz + plan kapısı akışı.
 * proposed → (hasta onaylar + öder) → active → expired (süre bitti, manuel yenilenir)
 * cancelled = hasta onaylamadı / iptal (ücret alınmaz).
 */
export const PlanStatus = {
  PROPOSED: "proposed", // hemşire önerdi, onay bekliyor
  ACTIVE: "active", // onaylandı + ödendi, takip açık
  EXPIRED: "expired", // süre doldu (yenilenebilir)
  CANCELLED: "cancelled", // onaylanmadı / iptal
} as const;
export type PlanStatus = (typeof PlanStatus)[keyof typeof PlanStatus];

/** Ödeme durumu — README §6C-9. */
export const PaymentStatus = {
  PAID: "paid", // ödendi
  PENDING: "pending", // bekliyor (tahsilat sürüyor)
  AWAITING_APPROVAL: "awaiting_approval", // hasta onayı/ödeme bekliyor
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const AppointmentType = {
  VIDEO: "video", // görüntülü
  VOICE: "voice", // sesli
} as const;
export type AppointmentType =
  (typeof AppointmentType)[keyof typeof AppointmentType];

export const AppointmentStatus = {
  REQUESTED: "requested", // talep
  CONFIRMED: "confirmed", // onaylı
  COMPLETED: "completed", // tamamlandı
  CANCELLED: "cancelled",
} as const;
export type AppointmentStatus =
  (typeof AppointmentStatus)[keyof typeof AppointmentStatus];

/** Hemşire doğrulama durumu — README §6C-12 (onaylanmadan hasta atanamaz). */
export const NurseStatus = {
  PENDING: "pending", // doğrulama bekliyor
  VERIFIED: "verified", // onaylı
  REJECTED: "rejected",
} as const;
export type NurseStatus = (typeof NurseStatus)[keyof typeof NurseStatus];

export const NurseDocumentType = {
  DIPLOMA: "diploma",
  CERTIFICATE: "certificate",
  ID: "id",
} as const;
export type NurseDocumentType =
  (typeof NurseDocumentType)[keyof typeof NurseDocumentType];

export const VerificationStatus = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;
export type VerificationStatus =
  (typeof VerificationStatus)[keyof typeof VerificationStatus];

export const MessageType = {
  TEXT: "text",
  IMAGE: "image",
} as const;
export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export const CareTemplateCategory = {
  PRESSURE: "pressure",
  DIABETIC_FOOT: "diabetic_foot",
  SURGICAL: "surgical",
  EMERGENCY_REFERRAL: "emergency_referral",
  BURN: "burn",
} as const;
export type CareTemplateCategory =
  (typeof CareTemplateCategory)[keyof typeof CareTemplateCategory];

/** Çok dillilik — README §10 sonraki sürüm (TR önce). */
export const Locale = {
  TR: "tr",
  EN: "en",
  AR: "ar",
} as const;
export type Locale = (typeof Locale)[keyof typeof Locale];

/**
 * TR etiketler + biçimlendirme yardımcıları (mock'tan bağımsız, canlı ekranlar kullanır).
 * Enum/iş-kuralı sabitleri @saran/shared'den.
 */
import {
  CareTemplateCategory,
  PainLevel,
  PaymentStatus,
  PlanType,
  WoundClinicalStatus,
  WoundType,
} from "@saran/shared";
import type { StatusKey } from "@saran/tokens";

export const clinicalStatusLabel: Record<WoundClinicalStatus, string> = {
  [WoundClinicalStatus.IMPROVING]: "İyileşiyor",
  [WoundClinicalStatus.MONITORING]: "İzlem",
  [WoundClinicalStatus.STALLED]: "Duraklamış",
  [WoundClinicalStatus.CLOSED]: "Kapandı",
};

export const woundTypeLabel: Record<WoundType, string> = {
  [WoundType.PRESSURE]: "Bası yarası",
  [WoundType.DIABETIC_FOOT]: "Diyabetik ayak",
  [WoundType.SURGICAL]: "Cerrahi yara",
  [WoundType.VENOUS]: "Venöz ülser",
  [WoundType.BURN]: "Yanık",
};

export const painLevelLabel: Record<PainLevel, string> = {
  [PainLevel.NONE]: "Yok",
  [PainLevel.MILD]: "Hafif",
  [PainLevel.MODERATE]: "Orta",
  [PainLevel.SEVERE]: "Şiddetli",
};

export const planTypeLabel: Record<PlanType, string> = {
  [PlanType.ONE_TIME]: "Tek seferlik",
  [PlanType.WEEK_1]: "1 haftalık",
  [PlanType.WEEK_2]: "2 Haftalık Takip",
  [PlanType.WEEK_3]: "3 haftalık",
  [PlanType.MONTHLY]: "Aylık takip",
};

export const planDurationLabel: Record<PlanType, string> = {
  [PlanType.ONE_TIME]: "Süresiz",
  [PlanType.WEEK_1]: "7 gün",
  [PlanType.WEEK_2]: "14 gün",
  [PlanType.WEEK_3]: "21 gün",
  [PlanType.MONTHLY]: "30 gün",
};

export const careCategoryLabel: Record<CareTemplateCategory, string> = {
  [CareTemplateCategory.PRESSURE]: "Bası yarası",
  [CareTemplateCategory.DIABETIC_FOOT]: "Diyabetik ayak",
  [CareTemplateCategory.SURGICAL]: "Cerrahi",
  [CareTemplateCategory.EMERGENCY_REFERRAL]: "Acil yönlendirme",
  [CareTemplateCategory.BURN]: "Yanık",
};

/**
 * Ödeme durumu rozeti — etiket + StatusBadge rengi tüm ekranlarda tutarlı
 * (Kazanç tablosu, ActivePatient Ödemeler sekmesi).
 */
export const paymentStatusBadge: Record<
  PaymentStatus,
  { label: string; status: StatusKey }
> = {
  [PaymentStatus.PAID]: { label: "Ödendi", status: "active" },
  [PaymentStatus.PENDING]: { label: "Bekliyor", status: "pending" },
  [PaymentStatus.AWAITING_APPROVAL]: {
    label: "Onay bekliyor",
    status: "assessment",
  },
  [PaymentStatus.REJECTED]: { label: "Reddedildi", status: "emergency" },
};

/** Para biçimlendirme (kuruş integer → ₺). */
export function formatKurus(kurus: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(kurus / 100);
}

/** "Bugün 09:12" / "Dün 18:40" / "12 Haz" gibi göreli zaman. */
export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();
  const time = d.toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (sameDay) return `Bugün ${time}`;
  if (isYesterday) return `Dün ${time}`;
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

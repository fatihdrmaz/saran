import {
  PainLevel,
  PlanType,
  WoundType,
  PLAN_DURATION_DAYS,
  type TrackingBadge,
} from "@saran/shared";
import { statusColors } from "@saran/tokens";

/**
 * Hesabım / yara dosyası ortak parçaları — tipler, etiketler, biçimlendirme
 * yardımcıları ve küçük görsel bileşenler. AccountView + yara detay bileşenleri
 * (PlanPaymentCard, WoundPhotos, WoundMessages) buradan beslenir.
 */

/* ---------- Etiketler ---------- */

export const WOUND_TYPE_LABELS: Record<WoundType, string> = {
  [WoundType.PRESSURE]: "Bası yarası",
  [WoundType.DIABETIC_FOOT]: "Diyabetik ayak",
  [WoundType.SURGICAL]: "Cerrahi yara",
  [WoundType.VENOUS]: "Venöz ülser",
  [WoundType.BURN]: "Yanık yarası",
};

export const PLAN_TYPE_LABELS: Record<PlanType, string> = {
  [PlanType.ONE_TIME]: "Tek Seferlik Bakım",
  [PlanType.WEEK_1]: "Haftalık Takip",
  [PlanType.WEEK_2]: "2 Haftalık Takip",
  [PlanType.WEEK_3]: "3 Haftalık Takip",
  [PlanType.MONTHLY]: "Aylık Takip",
};

export const BADGE_LABELS: Record<TrackingBadge, string> = {
  active: "Aktif takip",
  pending: "Onay bekliyor",
  assessment: "Değerlendirme",
};

export const PAIN_OPTIONS: { value: PainLevel; label: string }[] = [
  { value: PainLevel.NONE, label: "Yok" },
  { value: PainLevel.MILD, label: "Hafif" },
  { value: PainLevel.MODERATE, label: "Orta" },
  { value: PainLevel.SEVERE, label: "Şiddetli" },
];

export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

/* ---------- Veri tipleri (select edilen kolonlar) ---------- */

export type WoundRow = {
  id: string;
  type: WoundType;
  region: string | null;
  created_at: string;
};

export type PlanRow = {
  id: string;
  wound_id: string;
  type: PlanType;
  price_kurus: number;
  status: string;
  prognosis_note: string | null;
  started_at: string | null;
  ends_at: string | null;
  created_at: string;
  product: { title: string; duration_days: number } | null;
};

export type SubmissionRow = {
  id: string;
  wound_id: string;
  image_path: string;
  healing_percent: number | null;
  pain_level: PainLevel;
  patient_note: string | null;
  created_at: string;
};

export type PaymentRow = {
  id: string;
  plan_id: string | null;
  amount_kurus: number;
  vat_kurus: number;
  receipt_no: string | null;
  paid_at: string | null;
  created_at: string;
};

export type MessageRow = {
  id: string;
  sender_id: string;
  type: "text" | "image";
  content: string;
  read_at: string | null;
  created_at: string;
};

/* ---------- Biçimlendirme yardımcıları ---------- */

export function formatTL(kurus: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: kurus % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(kurus / 100);
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Bitişe kalan gün (bugün dahil değil; geçmişse 0). */
export function remainingDays(endsAt: string): number {
  const diff = new Date(endsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

/** Plan kartında gösterilecek başlık: ürün başlığı, yoksa tip etiketi. */
export function planTitle(plan: PlanRow): string {
  return plan.product?.title ?? PLAN_TYPE_LABELS[plan.type as PlanType];
}

/** Plan süresi (gün): ürün join'i, yoksa sabitlerden. */
export function planDurationDays(plan: PlanRow): number | null {
  return plan.product?.duration_days ?? PLAN_DURATION_DAYS[plan.type as PlanType];
}

/* ---------- Ortak stiller ---------- */

export const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid var(--card-border)",
  borderRadius: "var(--radius-md)",
  padding: "22px 24px",
  boxShadow: "var(--shadow-card)",
};

export const sectionTitleStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 500,
  margin: "36px 0 14px",
};

export const chipStyle = (active: boolean): React.CSSProperties => ({
  background: active ? "var(--primary)" : "#fff",
  color: active ? "#fff" : "var(--text-muted)",
  border: active ? "none" : "1px solid var(--card-border)",
  fontSize: 14,
  fontWeight: 700,
  padding: "8px 14px",
  borderRadius: "var(--radius-pill)",
  cursor: "pointer",
});

/* ---------- Küçük görsel parçalar ---------- */

export function StatusBadge({ badge }: { badge: TrackingBadge }) {
  const c = statusColors[badge];
  return (
    <span
      style={{
        display: "inline-block",
        background: c.bg,
        color: c.fg,
        fontSize: 12,
        fontWeight: 800,
        padding: "5px 12px",
        borderRadius: "var(--radius-pill)",
        whiteSpace: "nowrap",
      }}
    >
      {BADGE_LABELS[badge]}
    </span>
  );
}

export function HealingBar({ percent }: { percent: number }) {
  const p = Math.max(0, Math.min(100, percent));
  return (
    <div style={{ marginTop: 12 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 13,
          fontWeight: 700,
          color: "var(--text-muted)",
          marginBottom: 6,
        }}
      >
        <span>İyileşme</span>
        <span style={{ color: "var(--primary)" }}>%{p}</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={p}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="İyileşme yüzdesi"
        style={{
          height: 8,
          borderRadius: 999,
          background: "var(--surface-alt)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${p}%`,
            height: "100%",
            borderRadius: 999,
            background: "var(--primary)",
          }}
        />
      </div>
    </div>
  );
}

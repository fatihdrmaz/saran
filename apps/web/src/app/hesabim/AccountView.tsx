"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PainLevel,
  PlanStatus,
  PlanType,
  WoundType,
  PLAN_DURATION_DAYS,
  isTrackingUnlocked,
  trackingBadge,
  type TrackingBadge,
} from "@saran/shared";
import { statusColors } from "@saran/tokens";
import { WOUND_PHOTOS_BUCKET, woundPhotoPath } from "@saran/supabase";
import { getSupabase } from "../../lib/supabase";
import { safeFileName, translateAuthError } from "../../lib/auth-helpers";
import { addSeenMessageIds } from "../../lib/notifications";
import { BANK_TRANSFER } from "../../lib/payment";
import {
  ErrorBox,
  InfoBox,
  inputStyle,
  labelStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
} from "../../components/fields";

/**
 * Hesabım — hastanın kendi verisi (RLS): yaralar, plan önerileri (onay kapısı),
 * aktif takipte yeni fotoğraf gönderimi ve ödemeler. README §6B/§7.
 */

const WOUND_TYPE_LABELS: Record<WoundType, string> = {
  [WoundType.PRESSURE]: "Bası yarası",
  [WoundType.DIABETIC_FOOT]: "Diyabetik ayak",
  [WoundType.SURGICAL]: "Cerrahi yara",
  [WoundType.VENOUS]: "Venöz ülser",
  [WoundType.BURN]: "Yanık yarası",
};

const PLAN_TYPE_LABELS: Record<PlanType, string> = {
  [PlanType.ONE_TIME]: "Tek Seferlik Bakım",
  [PlanType.WEEK_1]: "Haftalık Takip",
  [PlanType.WEEK_2]: "2 Haftalık Takip",
  [PlanType.WEEK_3]: "3 Haftalık Takip",
  [PlanType.MONTHLY]: "Aylık Takip",
};

const BADGE_LABELS: Record<TrackingBadge, string> = {
  active: "Aktif takip",
  pending: "Onay bekliyor",
  assessment: "Değerlendirme",
};

const PAIN_OPTIONS: { value: PainLevel; label: string }[] = [
  { value: PainLevel.NONE, label: "Yok" },
  { value: PainLevel.MILD, label: "Hafif" },
  { value: PainLevel.MODERATE, label: "Orta" },
  { value: PainLevel.SEVERE, label: "Şiddetli" },
];

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

/* ---------- Veri tipleri (select edilen kolonlar) ---------- */

type WoundRow = {
  id: string;
  type: WoundType;
  region: string | null;
  created_at: string;
};

type PlanRow = {
  id: string;
  wound_id: string;
  type: PlanType;
  price_kurus: number;
  status: PlanStatus;
  prognosis_note: string | null;
  started_at: string | null;
  ends_at: string | null;
  created_at: string;
  product: { title: string; duration_days: number } | null;
};

type SubmissionRow = {
  wound_id: string;
  healing_percent: number | null;
  created_at: string;
};

type PaymentRow = {
  id: string;
  amount_kurus: number;
  vat_kurus: number;
  receipt_no: string | null;
  paid_at: string | null;
  created_at: string;
};

type ConversationRow = {
  id: string;
  nurse_id: string;
};

type MessageRow = {
  id: string;
  sender_id: string;
  type: "text" | "image";
  content: string;
  read_at: string | null;
  created_at: string;
};

type AccountData = {
  wounds: WoundRow[];
  plans: PlanRow[];
  submissions: SubmissionRow[];
  payments: PaymentRow[];
  /** Havale bildirimi yapılmış (awaiting_approval) planların id'leri. */
  awaitingPlanIds: string[];
};

/* ---------- Biçimlendirme yardımcıları ---------- */

function formatTL(kurus: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: kurus % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(kurus / 100);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Bitişe kalan gün (bugün dahil değil; geçmişse 0). */
function remainingDays(endsAt: string): number {
  const diff = new Date(endsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

/** Plan kartında gösterilecek başlık: ürün başlığı, yoksa tip etiketi. */
function planTitle(plan: PlanRow): string {
  return plan.product?.title ?? PLAN_TYPE_LABELS[plan.type];
}

/** Plan süresi (gün): ürün join'i, yoksa sabitlerden. */
function planDurationDays(plan: PlanRow): number | null {
  return plan.product?.duration_days ?? PLAN_DURATION_DAYS[plan.type];
}

/* ---------- Küçük görsel parçalar ---------- */

const cardStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid var(--card-border)",
  borderRadius: "var(--radius-md)",
  padding: "22px 24px",
  boxShadow: "var(--shadow-card)",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 22,
  fontWeight: 500,
  margin: "36px 0 14px",
};

function StatusBadge({ badge }: { badge: TrackingBadge }) {
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

function HealingBar({ percent }: { percent: number }) {
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

const chipStyle = (active: boolean): React.CSSProperties => ({
  background: active ? "var(--primary)" : "#fff",
  color: active ? "#fff" : "var(--text-muted)",
  border: active ? "none" : "1px solid var(--card-border)",
  fontSize: 14,
  fontWeight: 700,
  padding: "8px 14px",
  borderRadius: "var(--radius-pill)",
  cursor: "pointer",
});

/* ---------- Yeni fotoğraf gönderimi (aktif plan) ---------- */

function NewSubmissionForm({
  woundId,
  onSubmitted,
}: {
  woundId: string;
  onSubmitted: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState("");
  const [painLevel, setPainLevel] = useState<PainLevel>(PainLevel.NONE);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Lütfen bir fotoğraf dosyası seçin (JPG, PNG veya HEIC).");
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      setError("Fotoğraf 10MB'den büyük. Lütfen daha küçük bir fotoğraf seçin.");
      return;
    }
    setError(null);
    setSuccess(null);
    setFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!file) {
      setError("Lütfen bir fotoğraf seçin.");
      return;
    }
    setSubmitting(true);
    try {
      const supabase = getSupabase();

      // 1) Storage'a yükle (EvalForm ile aynı yol kuralı).
      const path = woundPhotoPath(woundId, `${Date.now()}-${safeFileName(file.name)}`);
      const { error: uploadErr } = await supabase.storage
        .from(WOUND_PHOTOS_BUCKET)
        .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
      if (uploadErr) {
        throw new Error(
          `Fotoğraf yüklenemedi (${uploadErr.message}). Bağlantınızı kontrol edip tekrar deneyin.`,
        );
      }

      // 2) Gönderim kaydı.
      const { error: subErr } = await supabase.from("submissions").insert({
        wound_id: woundId,
        image_path: path,
        pain_level: painLevel,
        patient_note: note.trim() || null,
      });
      if (subErr) {
        throw new Error(`Gönderim kaydedilemedi (${subErr.message}). Lütfen tekrar deneyin.`);
      }

      setFile(null);
      setNote("");
      setPainLevel(PainLevel.NONE);
      if (fileRef.current) fileRef.current.value = "";
      setSuccess("Fotoğrafınız hemşirenize iletildi.");
      onSubmitted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        marginTop: 16,
        paddingTop: 16,
        borderTop: "1px solid var(--card-border)",
      }}
    >
      <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-heading)", marginBottom: 10 }}>
        Yeni fotoğraf gönder
      </div>

      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        style={{
          ...secondaryButtonStyle,
          width: "100%",
          border: "2px dashed #bfd8ce",
          borderRadius: 14,
          padding: "14px 16px",
          marginBottom: 14,
          fontWeight: 700,
          color: file ? "var(--primary)" : "var(--text-muted)",
        }}
      >
        {file ? `${file.name} — değiştirmek için tıklayın` : "Fotoğraf seçin (en fazla 10MB)"}
      </button>

      <div style={{ ...labelStyle, marginBottom: 8 }}>Ağrı seviyesi</div>
      <div
        role="radiogroup"
        aria-label="Ağrı seviyesi"
        style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}
      >
        {PAIN_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={painLevel === o.value}
            onClick={() => setPainLevel(o.value)}
            style={chipStyle(painLevel === o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>

      <label style={{ display: "block", marginBottom: 14 }}>
        <span style={labelStyle}>Kısa not (isteğe bağlı)</span>
        <textarea
          name="patientNote"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Yaranızdaki değişiklikler, kullandığınız ürünler vb."
          maxLength={1000}
          rows={2}
          style={{
            width: "100%",
            background: "#fff",
            border: "1px solid var(--card-border)",
            borderRadius: "var(--radius-sm)",
            padding: "12px 14px",
            fontSize: 15,
            color: "var(--text-body)",
            fontFamily: "inherit",
            resize: "vertical",
          }}
        />
      </label>

      {error && <ErrorBox>{error}</ErrorBox>}
      {success && <InfoBox>{success}</InfoBox>}

      <button
        type="submit"
        disabled={submitting}
        style={{
          ...primaryButtonStyle,
          fontSize: 15,
          padding: "12px 24px",
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? "Gönderiliyor…" : "Hemşireye gönder"}
      </button>
    </form>
  );
}

/* ---------- Plan önerisi kartı + ödeme yöntemi akışı ---------- */

const methodCardStyle = (selected: boolean, disabled: boolean): React.CSSProperties => ({
  flex: "1 1 150px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  background: selected ? "var(--primary)" : "#fff",
  color: disabled ? "var(--text-muted-alt)" : selected ? "#fff" : "var(--text-heading)",
  border: selected ? "2px solid var(--primary)" : "2px solid var(--card-border)",
  borderRadius: 14,
  padding: "13px 16px",
  fontSize: 15,
  fontWeight: 700,
  cursor: disabled ? "not-allowed" : "pointer",
});

function TransferRow({
  label,
  value,
  action,
}: {
  label: string;
  value: string;
  action?: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
        padding: "8px 0",
        flexWrap: "wrap",
      }}
    >
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)" }}>{label}</div>
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "var(--text-heading)",
            wordBreak: "break-word",
          }}
        >
          {value}
        </div>
      </div>
      {action}
    </div>
  );
}

/** Turuncu bilgi bandı — havale bildirimi alındı, doğrulama bekleniyor. */
function AwaitingTransferBand() {
  return (
    <div
      role="status"
      style={{
        background: "var(--warning-bg)",
        color: "var(--warning-text)",
        fontSize: 14,
        fontWeight: 600,
        padding: "12px 16px",
        borderRadius: 12,
        lineHeight: 1.5,
      }}
    >
      Havale bildiriminiz alındı — hemşireniz ödemeyi doğruladığında takibiniz başlayacak.
    </div>
  );
}

function PlanProposalCard({
  plan,
  wound,
  userId,
  awaiting,
  approvingId,
  onCreditCard,
  onNotified,
}: {
  plan: PlanRow;
  wound: WoundRow | undefined;
  userId: string;
  awaiting: boolean;
  approvingId: string | null;
  onCreditCard: (planId: string) => void;
  onNotified: () => void;
}) {
  const [choosing, setChoosing] = useState(false);
  const [method, setMethod] = useState<"transfer" | null>(null);
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const duration = planDurationDays(plan);
  const showAwaitingBand = awaiting || sent;

  async function handleCopyIban() {
    try {
      await navigator.clipboard.writeText(BANK_TRANSFER.iban);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // pano erişimi yoksa sessizce geç — IBAN zaten görünür.
    }
  }

  async function handleNotifyTransfer() {
    setSending(true);
    setError(null);
    try {
      const { error: insErr } = await getSupabase().from("payments").insert({
        patient_id: userId,
        plan_id: plan.id,
        amount_kurus: plan.price_kurus,
        vat_kurus: 0,
        status: "awaiting_approval",
        method: "transfer",
      });
      if (insErr) {
        // Aynı plan için bildirim zaten yapılmışsa (unique index / 409) başarı say.
        const msg = insErr.message.toLowerCase();
        if (insErr.code === "23505" || msg.includes("duplicate") || msg.includes("409")) {
          setSent(true);
          onNotified();
          return;
        }
        throw new Error(insErr.message);
      }
      setSent(true);
      onNotified();
    } catch (e) {
      setError(
        e instanceof Error
          ? `Havale bildirimi gönderilemedi (${e.message}). Lütfen tekrar deneyin.`
          : "Havale bildirimi gönderilemedi. Lütfen tekrar deneyin.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      style={{
        ...cardStyle,
        border: "2px solid var(--primary)",
        background: "var(--surface-green-alt)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ fontSize: 19, fontWeight: 800, color: "var(--text-heading)" }}>
            {planTitle(plan)}
          </div>
          {wound && (
            <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
              {WOUND_TYPE_LABELS[wound.type]}
              {wound.region ? ` · ${wound.region}` : ""}
            </div>
          )}
        </div>
        <StatusBadge badge="pending" />
      </div>

      <div
        style={{
          display: "flex",
          gap: 24,
          flexWrap: "wrap",
          margin: "14px 0",
          fontSize: 15,
          color: "var(--text-body)",
        }}
      >
        {duration != null && (
          <div>
            <span style={{ fontWeight: 800, color: "var(--text-heading)" }}>{duration} gün</span>{" "}
            takip süresi
          </div>
        )}
        <div>
          <span style={{ fontWeight: 800, color: "var(--text-heading)" }}>
            {formatTL(plan.price_kurus)}
          </span>{" "}
          toplam
        </div>
      </div>

      {plan.prognosis_note && (
        <div
          style={{
            background: "#fff",
            borderRadius: 12,
            padding: "12px 16px",
            fontSize: 14,
            lineHeight: 1.6,
            color: "var(--text-body)",
            marginBottom: 14,
          }}
        >
          <span style={{ fontWeight: 800, color: "var(--text-heading)" }}>
            Hemşirenizin öngörüsü:{" "}
          </span>
          {plan.prognosis_note}
        </div>
      )}

      {showAwaitingBand ? (
        <AwaitingTransferBand />
      ) : !choosing ? (
        <>
          <button
            type="button"
            onClick={() => setChoosing(true)}
            style={{ ...primaryButtonStyle, width: "100%" }}
          >
            Planı onayla ve takibi başlat
          </button>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 10, lineHeight: 1.5 }}>
            Onaylamazsanız ücret alınmaz. Takip, yalnızca planı onayladığınızda başlar.
          </p>
        </>
      ) : (
        <div>
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "var(--text-heading)",
              marginBottom: 10,
            }}
          >
            Ödeme yöntemi seçin
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {/* Kredi kartı — yakında (iyzico). Buton erişilemez; approve-plan akışı
                ileride bu yoldan çağrılacak. */}
            <button
              type="button"
              disabled
              onClick={() => onCreditCard(plan.id)}
              style={methodCardStyle(false, true)}
            >
              {approvingId === plan.id ? "Onaylanıyor…" : "Kredi kartı"}
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 800,
                  color: "var(--warning-text)",
                  background: "var(--warning-bg)",
                  padding: "3px 8px",
                  borderRadius: "var(--radius-pill)",
                }}
              >
                Yakında
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMethod("transfer")}
              aria-pressed={method === "transfer"}
              style={methodCardStyle(method === "transfer", false)}
            >
              Havale / EFT
            </button>
          </div>

          {method === "transfer" && (
            <>
              <div
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  padding: "8px 16px",
                  marginTop: 12,
                }}
              >
                <TransferRow label="Banka" value={BANK_TRANSFER.bank} />
                <TransferRow label="Alıcı" value={BANK_TRANSFER.holder} />
                <TransferRow
                  label="IBAN"
                  value={BANK_TRANSFER.iban}
                  action={
                    <button
                      type="button"
                      onClick={handleCopyIban}
                      style={{
                        ...secondaryButtonStyle,
                        fontSize: 13,
                        padding: "8px 14px",
                        color: copied ? "var(--primary)" : "var(--text-heading)",
                      }}
                    >
                      {copied ? "Kopyalandı" : "Kopyala"}
                    </button>
                  }
                />
                <TransferRow label="Tutar" value={formatTL(plan.price_kurus)} />
                <TransferRow label="Açıklama" value={BANK_TRANSFER.note} />
              </div>

              {error && (
                <div style={{ marginTop: 12 }}>
                  <ErrorBox>{error}</ErrorBox>
                </div>
              )}

              <button
                type="button"
                onClick={handleNotifyTransfer}
                disabled={sending}
                style={{
                  ...primaryButtonStyle,
                  width: "100%",
                  marginTop: 12,
                  opacity: sending ? 0.7 : 1,
                }}
              >
                {sending ? "Gönderiliyor…" : "Havale bildirimini gönder"}
              </button>
              <p
                style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 10, lineHeight: 1.5 }}
              >
                Havalenizi yaptıktan sonra bildirin; hemşireniz ödemeyi doğruladığında takibiniz
                başlar.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- Mesajlar (hemşire ile) ---------- */

function formatMessageTime(iso: string): string {
  const d = new Date(iso);
  const time = d.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === new Date().toDateString()) return time;
  return `${d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" })} ${time}`;
}

function MessageBubble({ message, own }: { message: MessageRow; own: boolean }) {
  return (
    <div
      style={{
        alignSelf: own ? "flex-end" : "flex-start",
        maxWidth: "78%",
        background: own ? "var(--primary)" : "#fff",
        color: own ? "#fff" : "var(--text-body)",
        border: own ? "none" : "1px solid var(--card-border)",
        borderRadius: 16,
        borderBottomRightRadius: own ? 6 : 16,
        borderBottomLeftRadius: own ? 16 : 6,
        padding: "10px 14px",
      }}
    >
      <div style={{ fontSize: 14, lineHeight: 1.55, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
        {message.type === "image" ? (
          <span style={{ fontStyle: "italic", opacity: 0.9 }}>Fotoğraf</span>
        ) : (
          message.content
        )}
      </div>
      <div
        style={{
          fontSize: 11,
          marginTop: 4,
          textAlign: "right",
          color: own ? "rgba(255,255,255,.75)" : "var(--text-muted-alt)",
        }}
      >
        {formatMessageTime(message.created_at)}
      </div>
    </div>
  );
}

function MessagesSection({ userId }: { userId: string }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [conversation, setConversation] = useState<ConversationRow | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [visible, setVisible] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const supabase = getSupabase();
      const { data: conv, error: convErr } = await supabase
        .from("conversations")
        .select("id,nurse_id")
        .eq("patient_id", userId)
        .order("last_message_at", { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle();
      if (convErr || !conv) return;
      setConversation(conv as ConversationRow);
      const { data: msgs } = await supabase
        .from("messages")
        .select("id,sender_id,type,content,read_at,created_at")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: true });
      setMessages((msgs ?? []) as MessageRow[]);
    } finally {
      setLoaded(true);
    }
  }, [userId]);

  useEffect(() => {
    load().catch(() => setLoaded(true));
  }, [load]);

  // /hesabim#mesajlar ile gelindiyse bölüme kaydır.
  useEffect(() => {
    if (loaded && typeof window !== "undefined" && window.location.hash === "#mesajlar") {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loaded]);

  // Bölüm görünür olduğunda işaretle (okundu güncellemesi için).
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setVisible(true);
      },
      { threshold: 0.2 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Görünür olunca hemşireden gelen okunmamışları okundu yap. RLS update
  // politikası yoksa sessizce lokal "görüldü" listesine düş (yt-seen-msg-ids).
  useEffect(() => {
    if (!visible || !conversation) return;
    const unreadIds = messages
      .filter((m) => m.sender_id !== userId && m.read_at === null)
      .map((m) => m.id);
    if (unreadIds.length === 0) return;
    const now = new Date().toISOString();
    (async () => {
      try {
        const { error } = await getSupabase()
          .from("messages")
          .update({ read_at: now })
          .in("id", unreadIds);
        if (error) throw new Error(error.message);
      } catch {
        addSeenMessageIds(unreadIds);
      }
      // Rozetin düşmesi için lokal durumda da okundu işaretle.
      setMessages((prev) =>
        prev.map((m) => (unreadIds.includes(m.id) ? { ...m, read_at: m.read_at ?? now } : m)),
      );
    })();
  }, [visible, conversation, messages, userId]);

  // Yeni mesajda listeyi en alta kaydır.
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !conversation || sending) return;
    setSending(true);
    setSendError(null);
    try {
      const { error } = await getSupabase().from("messages").insert({
        conversation_id: conversation.id,
        sender_id: userId,
        type: "text",
        content: text,
      });
      if (error) throw new Error(error.message);
      setDraft("");
      await load();
    } catch (err) {
      setSendError(
        err instanceof Error
          ? `Mesaj gönderilemedi (${err.message}). Lütfen tekrar deneyin.`
          : "Mesaj gönderilemedi. Lütfen tekrar deneyin.",
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <div ref={sectionRef} id="mesajlar" style={{ scrollMarginTop: "calc(var(--nav-h) + 16px)" }}>
      <h2 style={sectionTitleStyle}>Mesajlar</h2>

      {!loaded ? (
        <div style={cardStyle}>
          <p style={{ fontSize: 15, color: "var(--text-muted)" }}>Mesajlarınız yükleniyor…</p>
        </div>
      ) : !conversation ? (
        <div style={cardStyle}>
          <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Hemşire atandığında mesajlaşma burada açılır.
          </p>
        </div>
      ) : (
        <div style={{ ...cardStyle, padding: "18px 20px" }}>
          <div
            ref={listRef}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              maxHeight: 380,
              overflowY: "auto",
              padding: "4px 2px",
            }}
          >
            {messages.length === 0 ? (
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.6 }}>
                Henüz mesaj yok. İlk mesajınızı aşağıdan gönderebilirsiniz.
              </p>
            ) : (
              messages.map((m) => (
                <MessageBubble key={m.id} message={m} own={m.sender_id === userId} />
              ))
            )}
          </div>

          {sendError && (
            <div style={{ marginTop: 12 }}>
              <ErrorBox>{sendError}</ErrorBox>
            </div>
          )}

          <form
            onSubmit={handleSend}
            style={{
              display: "flex",
              gap: 8,
              marginTop: 14,
              paddingTop: 14,
              borderTop: "1px solid var(--card-border)",
            }}
          >
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Mesajınızı yazın…"
              maxLength={2000}
              aria-label="Yeni mesaj"
              style={{ ...inputStyle, flex: 1, width: "auto" }}
            />
            <button
              type="submit"
              disabled={sending || draft.trim().length === 0}
              style={{
                ...primaryButtonStyle,
                fontSize: 15,
                padding: "12px 22px",
                opacity: sending || draft.trim().length === 0 ? 0.6 : 1,
                whiteSpace: "nowrap",
              }}
            >
              {sending ? "Gönderiliyor…" : "Gönder"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

/* ---------- Ana görünüm ---------- */

export function AccountView() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [data, setData] = useState<AccountData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [approveSuccess, setApproveSuccess] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const loadData = useCallback(async () => {
    const supabase = getSupabase();
    const [woundsRes, plansRes, subsRes, paysRes, awaitingRes] = await Promise.all([
      supabase
        .from("wounds")
        .select("id,type,region,created_at")
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("plans")
        .select(
          "id,wound_id,type,price_kurus,status,prognosis_note,started_at,ends_at,created_at,product:plan_products(title,duration_days)",
        )
        .order("created_at", { ascending: false }),
      supabase
        .from("submissions")
        .select("wound_id,healing_percent,created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("payments")
        .select("id,amount_kurus,vat_kurus,receipt_no,paid_at,created_at")
        .eq("status", "paid")
        .order("paid_at", { ascending: false }),
      supabase.from("payments").select("plan_id").eq("status", "awaiting_approval"),
    ]);
    const firstErr =
      woundsRes.error ?? plansRes.error ?? subsRes.error ?? paysRes.error ?? awaitingRes.error;
    if (firstErr) {
      throw new Error(`Bilgileriniz yüklenemedi (${firstErr.message}). Lütfen sayfayı yenileyin.`);
    }
    setData({
      wounds: (woundsRes.data ?? []) as WoundRow[],
      plans: (plansRes.data ?? []) as unknown as PlanRow[],
      submissions: (subsRes.data ?? []) as SubmissionRow[],
      payments: (paysRes.data ?? []) as PaymentRow[],
      awaitingPlanIds: (awaitingRes.data ?? []).map((r) => r.plan_id),
    });
  }, []);

  // Oturum koruması + ilk yükleme.
  useEffect(() => {
    let mounted = true;
    let subscription: { unsubscribe(): void } | null = null;
    try {
      const supabase = getSupabase();
      supabase.auth
        .getSession()
        .then(({ data: sessionData }) => {
          if (!mounted) return;
          const u = sessionData.session?.user;
          if (!u) {
            router.replace("/giris");
            return;
          }
          const meta = (u.user_metadata ?? {}) as { full_name?: string };
          setDisplayName(meta.full_name || u.email || "Hesabınız");
          setUserId(u.id);
          loadData().catch((e) => {
            if (mounted) {
              setLoadError(e instanceof Error ? e.message : "Bilgileriniz yüklenemedi.");
            }
          });
        })
        .catch(() => {
          if (mounted) router.replace("/giris");
        });

      // NOT: callback SENKRON tutulur (await yok) — deadlock önlemi.
      const { data: authData } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) router.replace("/giris");
      });
      subscription = authData.subscription;
    } catch (e) {
      setLoadError(e instanceof Error ? translateAuthError(e.message) : "Bağlantı kurulamadı.");
    }
    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [router, loadData]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await getSupabase().auth.signOut();
    } catch {
      // yoksay
    }
    router.replace("/");
  }

  async function handleApprove(planId: string) {
    setApproveError(null);
    setApproveSuccess(null);
    setApprovingId(planId);
    try {
      const { data: fnData, error: fnError } = await getSupabase().functions.invoke("approve-plan", {
        body: { planId },
      });
      if (fnError) {
        throw new Error(fnError.message || "Plan onaylanamadı.");
      }
      const body = fnData as { ok?: boolean; error?: string } | null;
      if (body?.error) {
        throw new Error(body.error);
      }
      setApproveSuccess("Planınız onaylandı — takibiniz başladı. Yeni fotoğraflarınızı buradan gönderebilirsiniz.");
      await loadData();
    } catch (e) {
      setApproveError(
        e instanceof Error
          ? `Plan onaylanamadı: ${e.message}`
          : "Plan onaylanamadı. Lütfen tekrar deneyin.",
      );
    } finally {
      setApprovingId(null);
    }
  }

  /* ---- Yükleme / hata durumları ---- */
  if (!userId || (!data && !loadError)) {
    return (
      <section className="container" style={{ padding: "80px 24px", minHeight: 420 }}>
        <p style={{ fontSize: 16, color: "var(--text-muted)" }}>Hesabınız yükleniyor…</p>
      </section>
    );
  }

  if (loadError || !data) {
    return (
      <section className="container" style={{ padding: "64px 24px", minHeight: 420, maxWidth: 640 }}>
        <h1 style={{ fontSize: 30, fontWeight: 500, marginBottom: 16 }}>Hesabım</h1>
        <ErrorBox>{loadError ?? "Bilgileriniz yüklenemedi. Lütfen sayfayı yenileyin."}</ErrorBox>
      </section>
    );
  }

  const { wounds, plans, submissions, payments, awaitingPlanIds } = data;

  // Yara başına en güncel plan (plans zaten created_at DESC sıralı).
  const latestPlanByWound = new Map<string, PlanRow>();
  for (const p of plans) {
    if (!latestPlanByWound.has(p.wound_id)) latestPlanByWound.set(p.wound_id, p);
  }
  // Yara başına en güncel gönderim.
  const latestSubmissionByWound = new Map<string, SubmissionRow>();
  for (const s of submissions) {
    if (!latestSubmissionByWound.has(s.wound_id)) latestSubmissionByWound.set(s.wound_id, s);
  }

  const proposedPlans = plans.filter((p) => p.status === PlanStatus.PROPOSED);

  return (
    <section className="container" style={{ padding: "56px 24px 80px", maxWidth: 760 }}>
      {/* Üst şerit */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <h1 style={{ fontSize: 32, fontWeight: 500 }}>Merhaba, {displayName}</h1>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          style={{
            ...secondaryButtonStyle,
            fontSize: 14,
            padding: "10px 18px",
            opacity: signingOut ? 0.7 : 1,
          }}
        >
          {signingOut ? "Çıkış yapılıyor…" : "Çıkış yap"}
        </button>
      </div>
      <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6 }}>
        Yaralarınızın durumunu, plan önerilerinizi ve ödemelerinizi buradan takip edebilirsiniz.
      </p>

      {approveSuccess && (
        <div style={{ marginTop: 18 }}>
          <InfoBox>{approveSuccess}</InfoBox>
        </div>
      )}
      {approveError && (
        <div style={{ marginTop: 18 }}>
          <ErrorBox>{approveError}</ErrorBox>
        </div>
      )}

      {/* Plan önerileri — onay kapısı */}
      {proposedPlans.length > 0 && (
        <>
          <h2 style={sectionTitleStyle}>Bakım planı öneriniz</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {proposedPlans.map((plan) => (
              <PlanProposalCard
                key={plan.id}
                plan={plan}
                wound={wounds.find((w) => w.id === plan.wound_id)}
                userId={userId}
                awaiting={awaitingPlanIds.includes(plan.id)}
                approvingId={approvingId}
                onCreditCard={handleApprove}
                onNotified={() => {
                  loadData().catch(() => {});
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* Yaralarım */}
      <h2 style={sectionTitleStyle}>Yaralarım</h2>
      {wounds.length === 0 ? (
        <div style={cardStyle}>
          <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Henüz bir yara kaydınız yok. Ücretsiz değerlendirme ile ilk fotoğrafınızı gönderin;
            uzman hemşiremiz incelesin.
          </p>
          <div style={{ marginTop: 14 }}>
            <Link
              href="/degerlendirme"
              style={{
                ...primaryButtonStyle,
                display: "inline-block",
                textDecoration: "none",
                fontSize: 15,
                padding: "12px 24px",
              }}
            >
              Ücretsiz değerlendirme
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {wounds.map((wound) => {
            const plan = latestPlanByWound.get(wound.id) ?? null;
            const badge = trackingBadge(plan?.status);
            const lastSub = latestSubmissionByWound.get(wound.id) ?? null;
            const active = plan && isTrackingUnlocked(plan.status) ? plan : null;
            return (
              <div key={wound.id} style={cardStyle}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-heading)" }}>
                      {WOUND_TYPE_LABELS[wound.type]}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                      {wound.region ? `${wound.region} · ` : ""}
                      Kayıt: {formatDate(wound.created_at)}
                    </div>
                  </div>
                  <StatusBadge badge={badge} />
                </div>

                {lastSub && (
                  <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 12 }}>
                    Son gönderim: {formatDate(lastSub.created_at)}
                  </div>
                )}
                {lastSub?.healing_percent != null && <HealingBar percent={lastSub.healing_percent} />}

                {badge === "assessment" && (
                  <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 12, lineHeight: 1.6 }}>
                    Değerlendirmeniz hemşire kuyruğunda. Plan öneriniz hazır olduğunda burada
                    görünecek ve e-posta ile bilgilendirileceksiniz.
                  </p>
                )}

                {active && (
                  <div
                    style={{
                      display: "flex",
                      gap: 20,
                      flexWrap: "wrap",
                      marginTop: 14,
                      fontSize: 14,
                      color: "var(--text-body)",
                    }}
                  >
                    {active.started_at && (
                      <div>
                        <span style={{ fontWeight: 800, color: "var(--text-heading)" }}>Başlangıç: </span>
                        {formatDate(active.started_at)}
                      </div>
                    )}
                    {active.ends_at && (
                      <>
                        <div>
                          <span style={{ fontWeight: 800, color: "var(--text-heading)" }}>Bitiş: </span>
                          {formatDate(active.ends_at)}
                        </div>
                        <div>
                          <span style={{ fontWeight: 800, color: "var(--primary)" }}>
                            {remainingDays(active.ends_at)} gün
                          </span>{" "}
                          kaldı
                        </div>
                      </>
                    )}
                  </div>
                )}

                {active && (
                  <NewSubmissionForm
                    woundId={wound.id}
                    onSubmitted={() => {
                      loadData().catch(() => {});
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Mesajlar — hemşire ile konuşma */}
      <MessagesSection userId={userId} />

      {/* Ödemelerim — boşsa gizli */}
      {payments.length > 0 && (
        <>
          <h2 style={sectionTitleStyle}>Ödemelerim</h2>
          <div style={{ ...cardStyle, padding: "8px 24px" }}>
            {payments.map((p, i) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                  padding: "14px 0",
                  borderTop: i === 0 ? "none" : "1px solid var(--card-border)",
                }}
              >
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-heading)" }}>
                    {formatDate(p.paid_at ?? p.created_at)}
                  </div>
                  {p.receipt_no && (
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                      Makbuz no: {p.receipt_no}
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "var(--text-heading)" }}>
                  {formatTL(p.amount_kurus)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

"use client";

import { useState } from "react";
import { PlanStatus, isTrackingUnlocked } from "@saran/shared";
import { getSupabase } from "../../lib/supabase";
import { BANK_TRANSFER } from "../../lib/payment";
import { ErrorBox, primaryButtonStyle, secondaryButtonStyle } from "../fields";
import {
  cardStyle,
  formatDate,
  formatTL,
  planDurationDays,
  planTitle,
  remainingDays,
  sectionTitleStyle,
  StatusBadge,
  type PaymentRow,
  type PlanRow,
} from "./shared";

/**
 * Bir yaranın "Plan & Ödeme" bölümü.
 * - En güncel plan `proposed` ise: plan önerisi kartı + ödeme yöntemi
 *   (Kredi kartı "Yakında" / Havale IBAN akışı, awaiting_approval bandı).
 * - Aktif/süresi dolmuş ise: başlangıç / bitiş / kalan gün.
 * - Ödendi ise: makbuz satırları.
 * Mevcut AccountView davranışı korunur — yalnızca yaranın içine taşındı.
 */

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
  userId,
  awaiting,
  approvingId,
  onCreditCard,
  onNotified,
}: {
  plan: PlanRow;
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
        <div style={{ fontSize: 19, fontWeight: 800, color: "var(--text-heading)" }}>
          {planTitle(plan)}
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
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 10, lineHeight: 1.5 }}>
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

export function PlanPaymentCard({
  plan,
  userId,
  awaiting,
  approvingId,
  payments,
  onCreditCard,
  onNotified,
}: {
  plan: PlanRow | null;
  userId: string;
  awaiting: boolean;
  approvingId: string | null;
  /** Bu yaranın ödenmiş ödemeleri (makbuz satırları). */
  payments: PaymentRow[];
  onCreditCard: (planId: string) => void;
  onNotified: () => void;
}) {
  const isProposed = plan?.status === PlanStatus.PROPOSED;
  const active = plan && isTrackingUnlocked(plan.status as PlanStatus) ? plan : null;

  return (
    <div id="plan">
      <h2 style={sectionTitleStyle}>Plan &amp; Ödeme</h2>

      {isProposed && plan ? (
        <PlanProposalCard
          plan={plan}
          userId={userId}
          awaiting={awaiting}
          approvingId={approvingId}
          onCreditCard={onCreditCard}
          onNotified={onNotified}
        />
      ) : active ? (
        <div style={cardStyle}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-heading)" }}>
              {planTitle(active)}
            </div>
            <StatusBadge badge="active" />
          </div>
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
        </div>
      ) : (
        <div style={cardStyle}>
          <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Bu yara için henüz bir plan öneriniz yok. Değerlendirmeniz hemşire kuyruğunda; plan
            öneriniz hazır olduğunda burada görünecek ve e-posta ile bilgilendirileceksiniz.
          </p>
        </div>
      )}

      {payments.length > 0 && (
        <div style={{ ...cardStyle, padding: "8px 24px", marginTop: 16 }}>
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
      )}
    </div>
  );
}

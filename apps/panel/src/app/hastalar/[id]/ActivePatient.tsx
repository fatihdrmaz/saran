"use client";

import { useEffect, useMemo, useState } from "react";
import { PaymentStatus, PlanStatus, PlanType, trackingBadge } from "@saran/shared";
import type { Database } from "@saran/supabase";
import { Button, Card, PageHeader, StatusBadge, WoundPhoto } from "../../../components/ui";
import { LiveWoundPhoto } from "../../../components/LiveWoundPhoto";
import {
  clinicalStatusLabel,
  formatDate,
  formatKurus,
  formatRelative,
  painLevelLabel,
  paymentStatusBadge,
  planTypeLabel,
  woundTypeLabel,
} from "../../../lib/labels";
import {
  confirmPayment,
  fetchMessages,
  fetchSubmissions,
  fetchWoundConversationId,
  fetchWoundPayments,
  markConversationRead,
  planProgress,
  rejectPayment,
  sendMessage,
  type PaymentWithMeta,
  type WoundCard,
} from "../../../lib/queries";

type SubmissionRow = Database["public"]["Tables"]["submissions"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

type Tab = "feed" | "photos" | "messages" | "payments";

const TABS: { key: Tab; label: string }[] = [
  { key: "feed", label: "Akış" },
  { key: "photos", label: "Tüm fotoğraflar" },
  { key: "messages", label: "Mesajlar" },
  { key: "payments", label: "Ödemeler" },
];

/** Akış öğesi: gönderim + mesaj karışık kronolojisi (yeni → eski). */
type FeedItem =
  | { kind: "submission"; at: string; sub: SubmissionRow }
  | { kind: "message"; at: string; msg: MessageRow };

function pickInitialWoundId(
  wounds: WoundCard[],
  initialWoundId: string | null | undefined,
): string {
  if (initialWoundId && wounds.some((w) => w.woundId === initialWoundId)) {
    return initialWoundId;
  }
  const active = wounds.find(
    (w) => (w.latestPlan?.status as PlanStatus) === PlanStatus.ACTIVE,
  );
  return active?.woundId ?? wounds[0].woundId;
}

export function ActivePatient({
  wounds,
  nurseId,
  initialWoundId,
}: {
  wounds: WoundCard[];
  nurseId: string;
  initialWoundId?: string | null;
}) {
  const [selectedWoundId, setSelectedWoundId] = useState<string>(() =>
    pickInitialWoundId(wounds, initialWoundId),
  );
  const wound =
    wounds.find((w) => w.woundId === selectedWoundId) ?? wounds[0];

  const [tab, setTab] = useState<Tab>("feed");
  const [submissions, setSubmissions] = useState<SubmissionRow[]>([]);
  const [payments, setPayments] = useState<PaymentWithMeta[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmingPaymentId, setConfirmingPaymentId] = useState<string | null>(null);
  const [rejectingPaymentId, setRejectingPaymentId] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);

  // Yara değişince tüm sekme verileri o YARA için yeniden yüklenir.
  useEffect(() => {
    let active = true;
    setSubmissions([]);
    setPayments([]);
    setMessages([]);
    setConversationId(null);
    setPaymentError(null);
    setPaymentSuccess(null);

    fetchSubmissions(selectedWoundId)
      .then((s) => active && setSubmissions(s))
      .catch(() => {});
    fetchWoundPayments(selectedWoundId)
      .then((p) => active && setPayments(p))
      .catch(() => {});
    fetchWoundConversationId(selectedWoundId)
      .then(async (convId) => {
        if (!active) return;
        setConversationId(convId);
        const msgs = await fetchMessages(convId);
        if (!active) return;
        setMessages(msgs);
        await markConversationRead(convId, nurseId);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [selectedWoundId, nurseId]);

  const plan = wound.latestPlan;
  const progress = plan ? planProgress(plan) : null;
  const healingSeries = submissions
    .slice()
    .reverse()
    .map((s) => s.healing_percent ?? 0);
  const currentHealing = submissions[0]?.healing_percent ?? null;
  const firstSubmission = submissions[submissions.length - 1] ?? null;
  const lastSubmission = submissions[0] ?? null;

  const feed = useMemo<FeedItem[]>(() => {
    const items: FeedItem[] = [
      ...submissions.map(
        (s): FeedItem => ({ kind: "submission", at: s.created_at, sub: s }),
      ),
      ...messages.map(
        (m): FeedItem => ({ kind: "message", at: m.created_at, msg: m }),
      ),
    ];
    return items.sort((a, b) => b.at.localeCompare(a.at));
  }, [submissions, messages]);

  const approvePayment = async (p: PaymentWithMeta) => {
    if (
      !window.confirm(
        `${formatKurus(p.amount_kurus)} tutarındaki havale ödemesini onaylayıp planı başlatmak istediğinize emin misiniz?`,
      )
    ) {
      return;
    }
    setPaymentError(null);
    setPaymentSuccess(null);
    setConfirmingPaymentId(p.id);
    const res = await confirmPayment(p.id);
    setConfirmingPaymentId(null);
    if (res.ok) {
      setPaymentSuccess("Ödeme onaylandı — plan aktifleştirildi.");
      try {
        setPayments(await fetchWoundPayments(selectedWoundId));
      } catch {
        /* tazeleme başarısızsa mevcut liste kalır */
      }
    } else {
      setPaymentError(res.error);
    }
  };

  const rejectPaymentRow = async (p: PaymentWithMeta) => {
    if (
      !window.confirm(
        `${formatKurus(p.amount_kurus)} tutarındaki havale bildirimini reddediyorsunuz. Ödemenin hesaba geçmediğini onaylıyor musunuz?`,
      )
    ) {
      return;
    }
    setPaymentError(null);
    setPaymentSuccess(null);
    setRejectingPaymentId(p.id);
    const res = await rejectPayment(p.id);
    setRejectingPaymentId(null);
    if (res.ok) {
      setPaymentSuccess(
        "Havale bildirimi reddedildi — hasta ödemeyi yeniden bildirebilir.",
      );
      try {
        setPayments(await fetchWoundPayments(selectedWoundId));
      } catch {
        /* tazeleme başarısızsa mevcut liste kalır */
      }
    } else {
      setPaymentError(res.error);
    }
  };

  const paymentBusy = confirmingPaymentId !== null || rejectingPaymentId !== null;

  const send = async () => {
    if (!draft.trim() || !conversationId) return;
    setSending(true);
    try {
      const msg = await sendMessage(conversationId, nurseId, draft.trim());
      setMessages((m) => [...m, msg]);
      setDraft("");
    } catch {
      /* sessiz geç */
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <PageHeader
        title={wound.patientName}
        subtitle={`${woundTypeLabel[wound.type]} · ${wound.region ?? "—"}${
          wound.age ? ` · ${wound.age} yaş` : ""
        }`}
        action={<StatusBadge status="active" />}
      />

      {/* Yara seçici — hastanın birden çok yarası varsa */}
      {wounds.length > 1 && (
        <div
          style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}
        >
          {wounds.map((w) => {
            const active = w.woundId === selectedWoundId;
            const badge = trackingBadge((w.latestPlan?.status as PlanStatus) ?? null);
            return (
              <button
                key={w.woundId}
                onClick={() => {
                  setSelectedWoundId(w.woundId);
                  setTab("feed");
                }}
                style={{
                  border: `1px solid ${active ? "var(--primary)" : "var(--card-border)"}`,
                  background: active ? "var(--primary)" : "#fff",
                  color: active ? "#fff" : "var(--text-body)",
                  borderRadius: 999,
                  padding: "8px 14px",
                  fontSize: 13,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {woundTypeLabel[w.type]}
                <StatusBadge status={badge} />
              </button>
            );
          })}
        </div>
      )}

      <div
        className="split-2col"
        style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 20, alignItems: "start" }}
      >
        {/* SOL */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Plan kartı */}
          <Card style={{ background: "var(--primary-dark)", color: "#fff", border: "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "var(--teal-light)" }}>Aktif plan</span>
              <span
                style={{
                  background: "rgba(255,255,255,.14)",
                  borderRadius: 999,
                  padding: "3px 10px",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {plan ? formatKurus(plan.price_kurus) : "—"}
              </span>
            </div>
            <div className="serif" style={{ fontSize: 22, fontWeight: 600, marginTop: 4 }}>
              {plan ? planTypeLabel[plan.type as PlanType] : "—"}
            </div>
            {progress?.totalDays && (
              <>
                <div style={{ marginTop: 14, fontSize: 13, color: "var(--teal-light)" }}>
                  {progress.day} / {progress.totalDays} gün
                </div>
                <div
                  style={{
                    height: 8,
                    borderRadius: 999,
                    background: "rgba(255,255,255,.18)",
                    overflow: "hidden",
                    marginTop: 6,
                  }}
                >
                  <div style={{ width: `${progress.percent}%`, height: "100%", background: "var(--primary-mid)" }} />
                </div>
              </>
            )}
          </Card>

          {/* İyileşme grafiği */}
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-heading)", marginBottom: 14 }}>
              İyileşme grafiği
            </h3>
            {healingSeries.length > 0 ? (
              <HealingChart points={healingSeries} />
            ) : (
              <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Henüz veri yok.</div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Güncel iyileşme</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: "var(--primary)" }}>
                  {currentHealing != null ? `%${currentHealing}` : "—"}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Klinik durum</div>
                <div style={{ fontWeight: 700, color: "var(--text-heading)" }}>
                  {clinicalStatusLabel[wound.clinicalStatus]}
                </div>
              </div>
            </div>
          </Card>

          {/* Önce / Sonra */}
          <Card>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: "var(--text-heading)", marginBottom: 12 }}>
              Önce / Sonra
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                {firstSubmission ? (
                  <LiveWoundPhoto imagePath={firstSubmission.image_path} height={130} label="İlk gönderim" />
                ) : (
                  <WoundPhoto height={130} label="İlk gönderim" />
                )}
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, textAlign: "center" }}>
                  İlk · %{firstSubmission?.healing_percent ?? 0}
                </div>
              </div>
              <div>
                {lastSubmission ? (
                  <LiveWoundPhoto imagePath={lastSubmission.image_path} height={130} label="Bugün" />
                ) : (
                  <WoundPhoto height={130} label="Bugün" />
                )}
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, textAlign: "center" }}>
                  Son · {currentHealing != null ? `%${currentHealing}` : "—"}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* SAĞ — sekmeler */}
        <Card style={{ padding: 0 }}>
          <div style={{ display: "flex", borderBottom: "1px solid var(--card-border)" }}>
            {TABS.map((t) => {
              const active = tab === t.key;
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  style={{
                    flex: 1,
                    padding: "14px 8px",
                    background: "transparent",
                    border: "none",
                    borderBottom: `2px solid ${active ? "var(--primary)" : "transparent"}`,
                    color: active ? "var(--primary)" : "var(--text-muted)",
                    fontWeight: 700,
                    fontSize: 13.5,
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div style={{ padding: 20 }}>
            {tab === "feed" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {feed.length === 0 && (
                  <div style={{ color: "var(--text-muted)" }}>Henüz hareket yok.</div>
                )}
                {feed.map((item) =>
                  item.kind === "submission" ? (
                    <div key={`s-${item.sub.id}`} style={{ display: "flex", gap: 12 }}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 999,
                          background: "var(--primary-mid)",
                          marginTop: 5,
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {formatRelative(item.sub.created_at)}
                        </div>
                        <div style={{ fontWeight: 700, color: "var(--text-heading)", margin: "2px 0" }}>
                          Görsel + not · Ağrı: {painLevelLabel[item.sub.pain_level]}
                        </div>
                        <p style={{ fontSize: 13.5, color: "var(--text-body)", lineHeight: 1.5 }}>
                          {item.sub.patient_note ?? "—"}
                        </p>
                        <div style={{ marginTop: 8, maxWidth: 200 }}>
                          <LiveWoundPhoto
                            imagePath={item.sub.image_path}
                            height={120}
                            label={
                              item.sub.healing_percent != null
                                ? `%${item.sub.healing_percent}`
                                : undefined
                            }
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={`m-${item.msg.id}`} style={{ display: "flex", gap: 12 }}>
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 999,
                          background:
                            item.msg.sender_id === nurseId
                              ? "var(--primary)"
                              : "var(--card-border)",
                          marginTop: 5,
                          flexShrink: 0,
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {formatRelative(item.msg.created_at)}
                        </div>
                        <div style={{ fontWeight: 700, color: "var(--text-heading)", margin: "2px 0" }}>
                          Mesaj · {item.msg.sender_id === nurseId ? "Siz" : "Hasta"}
                        </div>
                        <p style={{ fontSize: 13.5, color: "var(--text-body)", lineHeight: 1.5 }}>
                          {item.msg.type === "image" ? "Fotoğraf" : item.msg.content}
                        </p>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}

            {tab === "photos" && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(130px,1fr))", gap: 12 }}>
                {submissions.length === 0 && (
                  <div style={{ color: "var(--text-muted)" }}>Fotoğraf yok.</div>
                )}
                {submissions.map((s) => (
                  <div key={s.id}>
                    <LiveWoundPhoto
                      imagePath={s.image_path}
                      height={120}
                      label={s.healing_percent != null ? `%${s.healing_percent}` : undefined}
                    />
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 6 }}>
                      {formatRelative(s.created_at)}
                      {s.healing_percent != null ? ` · %${s.healing_percent}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {tab === "messages" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {!conversationId && (
                  <div style={{ color: "var(--text-muted)" }}>Sohbet bulunamadı.</div>
                )}
                {messages.map((m) => {
                  const out = m.sender_id === nurseId;
                  return (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: out ? "flex-end" : "flex-start",
                        maxWidth: "78%",
                        background: out ? "var(--primary)" : "var(--surface)",
                        color: out ? "#fff" : "var(--text-body)",
                        borderRadius: 14,
                        padding: "10px 14px",
                      }}
                    >
                      {m.type === "image" && (
                        <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 4 }}>Fotoğraf</div>
                      )}
                      <div style={{ fontSize: 13.5, lineHeight: 1.45 }}>{m.content}</div>
                      <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4, textAlign: "right" }}>
                        {formatRelative(m.created_at)}
                      </div>
                    </div>
                  );
                })}
                {conversationId && (
                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    <input
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && send()}
                      placeholder="Mesaj yazın..."
                      style={{
                        flex: 1,
                        padding: "11px 14px",
                        border: "1px solid var(--card-border)",
                        borderRadius: 12,
                      }}
                    />
                    <Button onClick={send} disabled={sending || !draft.trim()}>
                      Gönder
                    </Button>
                  </div>
                )}
              </div>
            )}

            {tab === "payments" && (
              <div>
                {paymentSuccess && (
                  <div
                    style={{
                      background: "var(--surface-green)",
                      color: "var(--primary)",
                      borderRadius: 12,
                      padding: "10px 14px",
                      marginBottom: 12,
                      fontWeight: 700,
                      fontSize: 13.5,
                    }}
                  >
                    {paymentSuccess}
                  </div>
                )}
                {paymentError && (
                  <div
                    style={{
                      background: "var(--warning-bg)",
                      color: "var(--warning-text)",
                      borderRadius: 12,
                      padding: "10px 14px",
                      marginBottom: 12,
                      fontWeight: 600,
                      fontSize: 13.5,
                    }}
                  >
                    {paymentError}
                  </div>
                )}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    background: "var(--surface)",
                    borderRadius: 12,
                    padding: "14px 16px",
                    marginBottom: 14,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Toplam ödenen</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: "var(--primary)" }}>
                      {formatKurus(
                        payments
                          .filter((p) => p.status === PaymentStatus.PAID)
                          .reduce((s, p) => s + p.amount_kurus, 0),
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Plan bitiş</div>
                    <div style={{ fontWeight: 700, color: "var(--text-heading)" }}>
                      {formatDate(plan?.ends_at)}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {payments.length === 0 && (
                    <div style={{ color: "var(--text-muted)" }}>Ödeme kaydı yok.</div>
                  )}
                  {payments.map((p) => {
                    const b = paymentStatusBadge[p.status];
                    return (
                      <div
                        key={p.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          border: "1px solid var(--card-border)",
                          borderRadius: 10,
                          padding: "10px 14px",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700 }}>
                            {p.planType ? planTypeLabel[p.planType] : "Plan"}
                          </div>
                          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            {formatDate(p.paid_at ?? p.created_at)}
                          </div>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 12,
                            flexWrap: "wrap",
                            justifyContent: "flex-end",
                          }}
                        >
                          <span style={{ fontWeight: 800 }}>{formatKurus(p.amount_kurus)}</span>
                          <StatusBadge status={b.status} label={b.label} />
                          {p.status === PaymentStatus.AWAITING_APPROVAL && (
                            <>
                              <Button
                                onClick={() => approvePayment(p)}
                                disabled={paymentBusy}
                                style={{ padding: "8px 12px", fontSize: 12.5 }}
                              >
                                {confirmingPaymentId === p.id
                                  ? "Onaylanıyor…"
                                  : "Ödemeyi onayla ve planı başlat"}
                              </Button>
                              <Button
                                variant="ghost"
                                onClick={() => rejectPaymentRow(p)}
                                disabled={paymentBusy}
                                style={{
                                  padding: "8px 12px",
                                  fontSize: 12.5,
                                  color: "var(--danger)",
                                }}
                              >
                                {rejectingPaymentId === p.id
                                  ? "Reddediliyor…"
                                  : "Reddet"}
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}

/** CSS/SVG ile basit çizgi grafik (harici lib yok). */
function HealingChart({ points }: { points: number[] }) {
  const w = 280;
  const h = 90;
  const max = 100;
  const step = points.length > 1 ? w / (points.length - 1) : w;
  const coords = points.map((p, i) => [i * step, h - (p / max) * h] as const);
  const line = coords.map(([x, y]) => `${x},${y}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: 90 }}>
      <polygon points={area} fill="var(--surface-green)" />
      <polyline points={line} fill="none" stroke="var(--primary-mid)" strokeWidth={2.5} />
      {coords.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3} fill="var(--primary)" />
      ))}
    </svg>
  );
}

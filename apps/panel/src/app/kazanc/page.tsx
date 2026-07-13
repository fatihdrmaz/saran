"use client";

import { useEffect, useState } from "react";
import {
  PaymentStatus,
  PLATFORM_COMMISSION_RATE,
  netNurseEarnings,
} from "@saran/shared";
import { Card, PageHeader, StatCard, StatusBadge } from "../../components/ui";
import { useAuth } from "../../lib/auth";
import {
  formatDate,
  formatKurus,
  paymentStatusBadge,
  planTypeLabel,
} from "../../lib/labels";
import { fetchNursePayments, type PaymentWithMeta } from "../../lib/queries";

const MONTHS_TR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

export default function EarningsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<PaymentWithMeta[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetchNursePayments(user.id)
      .then((p) => active && setPayments(p))
      .catch((e) => active && setError(e.message ?? "Veri yüklenemedi"));
    return () => {
      active = false;
    };
  }, [user]);

  const rows = payments ?? [];
  const paid = rows.filter((p) => p.status === PaymentStatus.PAID);
  const now = new Date();
  const thisMonthGross = paid
    .filter((p) => {
      const d = new Date(p.paid_at ?? p.created_at);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    })
    .reduce((s, p) => s + p.amount_kurus, 0);
  const pendingGross = rows
    .filter((p) => p.status !== PaymentStatus.PAID)
    .reduce((s, p) => s + p.amount_kurus, 0);
  const yearGross = paid
    .filter((p) => new Date(p.paid_at ?? p.created_at).getFullYear() === now.getFullYear())
    .reduce((s, p) => s + p.amount_kurus, 0);
  const avgPlan = paid.length
    ? Math.round(paid.reduce((s, p) => s + p.amount_kurus, 0) / paid.length)
    : 0;

  // Son 6 ay brüt gelir (bar grafiği) — ödenmiş ödemelerden türetilir.
  const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    const gross = paid
      .filter((p) => {
        const pd = new Date(p.paid_at ?? p.created_at);
        return pd.getFullYear() === d.getFullYear() && pd.getMonth() === d.getMonth();
      })
      .reduce((s, p) => s + p.amount_kurus, 0);
    return { month: MONTHS_TR[d.getMonth()], grossKurus: gross };
  });
  const maxRev = Math.max(1, ...monthlyRevenue.map((m) => m.grossKurus));

  const nextGross = thisMonthGross;
  const nextNet = netNurseEarnings(nextGross);
  const nextCommission = nextGross - nextNet;

  return (
    <>
      <PageHeader title="Kazanç" subtitle="Gelir özeti ve net hesabı (%10 komisyon)" />

      {error && (
        <div
          style={{
            background: "var(--warning-bg)",
            color: "var(--warning-text)",
            borderRadius: 12,
            padding: "12px 16px",
            marginBottom: 16,
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      {payments === null && !error ? (
        <div style={{ color: "var(--text-muted)" }}>Yükleniyor…</div>
      ) : (
        <>
          <div
            className="grid-cols-4"
            style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}
          >
            <StatCard label="Bu ay (brüt)" value={formatKurus(thisMonthGross)} />
            <StatCard label="Bekleyen tahsilat" value={formatKurus(pendingGross)} accent="#c07a2e" />
            <StatCard label="Yıl toplamı" value={formatKurus(yearGross)} />
            <StatCard label="Ort. plan değeri" value={formatKurus(avgPlan)} />
          </div>

          <div
            className="split-2col"
            style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 20, alignItems: "start" }}
          >
            <Card>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-heading)", marginBottom: 18 }}>
                Aylık gelir (son 6 ay)
              </h2>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 180 }}>
                {monthlyRevenue.map((m, i) => (
                  <div key={i} style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ height: 150, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                      <div
                        title={formatKurus(m.grossKurus)}
                        style={{
                          width: "70%",
                          height: `${(m.grossKurus / maxRev) * 100}%`,
                          minHeight: 2,
                          background: "var(--primary-mid)",
                          borderRadius: "8px 8px 0 0",
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>{m.month}</div>
                  </div>
                ))}
              </div>
            </Card>

            <Card style={{ background: "var(--primary-dark)", color: "#fff", border: "none" }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16 }}>Bu ay net kazanç</h2>
              <Row label="Brüt gelir" value={formatKurus(nextGross)} />
              <Row
                label={`Platform komisyonu (%${PLATFORM_COMMISSION_RATE * 100})`}
                value={`− ${formatKurus(nextCommission)}`}
                muted
              />
              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,.18)",
                  marginTop: 10,
                  paddingTop: 12,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <span style={{ color: "var(--teal-light)" }}>Net kazanç</span>
                <span className="serif" style={{ fontSize: 26, fontWeight: 600 }}>
                  {formatKurus(nextNet)}
                </span>
              </div>
            </Card>
          </div>

          <Card style={{ marginTop: 20, padding: 0, overflow: "hidden" }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "var(--text-heading)",
                padding: "18px 20px 0",
              }}
            >
              Son ödemeler
            </h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5, marginTop: 12 }}>
              <thead>
                <tr style={{ background: "var(--surface)", textAlign: "left" }}>
                  {["Hasta", "Plan", "Tutar", "Durum", "Tarih"].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "10px 20px",
                        fontSize: 12,
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ padding: "20px", color: "var(--text-muted)" }}>
                      Henüz ödeme yok.
                    </td>
                  </tr>
                )}
                {rows.map((p) => {
                  const b = paymentStatusBadge[p.status];
                  return (
                    <tr key={p.id} style={{ borderTop: "1px solid var(--card-border)" }}>
                      <td style={{ padding: "12px 20px", fontWeight: 700 }}>{p.patientName}</td>
                      <td style={{ padding: "12px 20px" }}>
                        {p.planType ? planTypeLabel[p.planType] : "—"}
                      </td>
                      <td style={{ padding: "12px 20px", fontWeight: 700 }}>
                        {formatKurus(p.amount_kurus)}
                      </td>
                      <td style={{ padding: "12px 20px" }}>
                        <StatusBadge status={b.status} label={b.label} />
                      </td>
                      <td style={{ padding: "12px 20px", color: "var(--text-muted)" }}>
                        {formatDate(p.paid_at ?? p.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </>
  );
}

function Row({ label, value, muted }: { label: string; value: string; muted?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
      <span style={{ color: muted ? "var(--teal-light)" : "#fff", opacity: muted ? 0.8 : 1 }}>
        {label}
      </span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlanStatus, trackingBadge } from "@saran/shared";
import { Button, Card, PageHeader, Pill, StatCard, StatusBadge } from "../components/ui";
import { useAuth } from "../lib/auth";
import { formatKurus, formatRelative, woundTypeLabel } from "../lib/labels";
import {
  confirmPayment,
  fetchAwaitingTransfers,
  fetchVisibleWounds,
  nameInitials,
  type AwaitingTransfer,
  type WoundCard,
} from "../lib/queries";

export default function TodayPage() {
  const { user } = useAuth();
  const [wounds, setWounds] = useState<WoundCard[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [transfers, setTransfers] = useState<AwaitingTransfer[] | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferSuccess, setTransferSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetchVisibleWounds(user.id)
      .then((w) => active && setWounds(w))
      .catch((e) => active && setError(e.message ?? "Veri yüklenemedi"));
    fetchAwaitingTransfers(user.id, user.role)
      .then((t) => active && setTransfers(t))
      .catch(() => {
        /* havale kartı sessiz geçilir — ana ekranı bloklamasın */
      });
    return () => {
      active = false;
    };
  }, [user]);

  const approveTransfer = async (t: AwaitingTransfer) => {
    if (
      !window.confirm(
        `${t.patientName} için ${formatKurus(t.amountKurus)} tutarındaki havale ödemesini onaylayıp planı başlatmak istediğinize emin misiniz?`,
      )
    ) {
      return;
    }
    setTransferError(null);
    setTransferSuccess(null);
    setConfirmingId(t.paymentId);
    const res = await confirmPayment(t.paymentId);
    setConfirmingId(null);
    if (res.ok) {
      setTransfers((list) =>
        (list ?? []).filter((x) => x.paymentId !== t.paymentId),
      );
      setTransferSuccess(
        `${t.patientName} — ödeme onaylandı, plan aktifleştirildi.`,
      );
    } else {
      setTransferError(res.error);
    }
  };

  const pool = (wounds ?? []).filter((w) => w.assignedNurseId === null);
  const assessmentQueue = (wounds ?? []).filter((w) => {
    const status = (w.latestPlan?.status as PlanStatus) ?? null;
    return status === null || status === PlanStatus.PROPOSED;
  });
  const activeCount = (wounds ?? []).filter(
    (w) => (w.latestPlan?.status as PlanStatus) === PlanStatus.ACTIVE,
  ).length;

  const firstName = (user?.fullName || "").split(" ")[0] || "Hemşire";
  const today = new Date().toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const stats = [
    { label: "Havuzdaki yara", value: pool.length, accent: "#c07a2e" },
    { label: "Bekleyen değerlendirme", value: assessmentQueue.length },
    { label: "Aktif hasta", value: activeCount },
    { label: "Görünür yara", value: wounds?.length ?? 0 },
  ];

  return (
    <>
      <PageHeader
        title={`Günaydın, ${firstName}`}
        subtitle={`${today} · Bugünkü işlerin özeti`}
      />

      {error && (
        <div
          style={{
            background: "var(--warning-bg)",
            color: "var(--warning-text)",
            borderRadius: 12,
            padding: "12px 16px",
            marginBottom: 20,
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}

      <div
        className="grid-cols-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} accent={s.accent} />
        ))}
      </div>

      {((transfers?.length ?? 0) > 0 || transferSuccess || transferError) && (
        <Card style={{ marginBottom: 24 }}>
          <h2
            style={{
              fontSize: 17,
              fontWeight: 800,
              color: "var(--text-heading)",
              marginBottom: 14,
            }}
          >
            Ödeme onayı bekleyen havaleler
          </h2>

          {transferSuccess && (
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
              {transferSuccess}
            </div>
          )}
          {transferError && (
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
              {transferError}
            </div>
          )}

          {(transfers?.length ?? 0) > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {(transfers ?? []).map((t) => (
                <div
                  key={t.paymentId}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                    border: "1px solid var(--card-border)",
                    borderLeft: "4px solid var(--warm)",
                    borderRadius: 12,
                    padding: "12px 14px",
                    background: "var(--surface)",
                  }}
                >
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 999,
                      background: "var(--surface-green)",
                      color: "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  >
                    {nameInitials(t.patientName)}
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "var(--text-heading)" }}>
                      {t.patientName}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                      {formatKurus(t.amountKurus)} · Bildirim:{" "}
                      {formatRelative(t.createdAt)}
                    </div>
                  </div>
                  <Pill bg="#fdebd8" fg="#c07a2e">
                    Havale
                  </Pill>
                  <Button
                    onClick={() => approveTransfer(t)}
                    disabled={confirmingId !== null}
                    style={{ padding: "9px 14px", fontSize: 13 }}
                  >
                    {confirmingId === t.paymentId
                      ? "Onaylanıyor…"
                      : "Ödemeyi onayla ve planı başlat"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <Card>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-heading)" }}>
            Havuz · Bekleyen değerlendirme
          </h2>
          <Link
            href="/hastalar"
            style={{ fontSize: 13, color: "var(--primary)", fontWeight: 700 }}
          >
            Tümü →
          </Link>
        </div>

        {wounds === null && !error ? (
          <div style={{ color: "var(--text-muted)", padding: "20px 0" }}>Yükleniyor…</div>
        ) : assessmentQueue.length === 0 ? (
          <div style={{ color: "var(--text-muted)", padding: "20px 0" }}>
            Şu an bekleyen değerlendirme yok.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {assessmentQueue.map((w) => {
              const badge = trackingBadge(
                (w.latestPlan?.status as PlanStatus) ?? null,
              );
              return (
                <Link
                  key={w.woundId}
                  href={`/hastalar/${w.patientId}/degerlendirme`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    border: "1px solid var(--card-border)",
                    borderLeft: `4px solid ${
                      w.assignedNurseId === null
                        ? "var(--warm)"
                        : "var(--primary-mid)"
                    }`,
                    borderRadius: 12,
                    padding: "12px 14px",
                    background: "var(--surface)",
                  }}
                >
                  <span
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 999,
                      background: "var(--surface-green)",
                      color: "var(--primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: 13,
                      flexShrink: 0,
                    }}
                  >
                    {nameInitials(w.patientName)}
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontWeight: 700, color: "var(--text-heading)" }}>
                      {w.patientName}
                    </div>
                    <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                      {woundTypeLabel[w.type]} ·{" "}
                      {formatRelative(w.lastSubmission?.created_at ?? w.startedAt)}
                    </div>
                  </div>
                  {w.assignedNurseId === null && (
                    <span
                      style={{
                        background: "#fdebd8",
                        color: "#c07a2e",
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "4px 10px",
                        borderRadius: 999,
                      }}
                    >
                      Havuz
                    </span>
                  )}
                  <StatusBadge status={badge} />
                </Link>
              );
            })}
          </div>
        )}
      </Card>
    </>
  );
}

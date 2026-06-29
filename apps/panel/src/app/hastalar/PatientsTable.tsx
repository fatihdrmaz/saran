"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlanStatus, trackingBadge } from "@saran/shared";
import { Card, StatusBadge } from "../../components/ui";
import { formatRelative, woundTypeLabel } from "../../lib/labels";
import { nameInitials, planProgress, type WoundCard } from "../../lib/queries";

type Filter = "all" | "active" | "pending" | "assessment";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "Tümü" },
  { key: "active", label: "Aktif takip" },
  { key: "pending", label: "Onay bekliyor" },
  { key: "assessment", label: "Değerlendirme" },
];

export function PatientsTable({ wounds }: { wounds: WoundCard[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");

  const planStatusOf = (w: WoundCard) =>
    (w.latestPlan?.status as PlanStatus) ?? null;

  const filtered = wounds.filter((w) => {
    if (filter === "all") return true;
    return trackingBadge(planStatusOf(w)) === filter;
  });

  const goTo = (w: WoundCard) => {
    if (planStatusOf(w) === PlanStatus.ACTIVE)
      router.push(`/hastalar/${w.patientId}`);
    else router.push(`/hastalar/${w.patientId}/degerlendirme`);
  };

  return (
    <>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              style={{
                border: `1px solid ${active ? "var(--primary)" : "var(--card-border)"}`,
                background: active ? "var(--primary)" : "#fff",
                color: active ? "#fff" : "var(--text-body)",
                borderRadius: 999,
                padding: "7px 16px",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: "var(--surface)", textAlign: "left" }}>
              {["Hasta", "Yara tipi", "Takip durumu", "İyileşme", "Son güncelleme"].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      padding: "12px 16px",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                    }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{ padding: "20px 16px", color: "var(--text-muted)" }}
                >
                  Kayıt yok.
                </td>
              </tr>
            )}
            {filtered.map((w) => {
              const status = planStatusOf(w);
              const badge = trackingBadge(status);
              const isActive = status === PlanStatus.ACTIVE;
              const healing = w.lastSubmission?.healing_percent ?? null;
              const progress = w.latestPlan ? planProgress(w.latestPlan) : null;
              return (
                <tr
                  key={w.woundId}
                  onClick={() => goTo(w)}
                  style={{
                    borderTop: "1px solid var(--card-border)",
                    cursor: "pointer",
                  }}
                >
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 999,
                          background: "var(--surface-green)",
                          color: "var(--primary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: 12.5,
                        }}
                      >
                        {nameInitials(w.patientName)}
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--text-heading)" }}>
                          {w.patientName}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {w.age ? `${w.age} yaş · ` : ""}
                          {w.region ?? "—"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "13px 16px" }}>{woundTypeLabel[w.type]}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <StatusBadge status={badge} />
                  </td>
                  <td style={{ padding: "13px 16px" }}>
                    {!isActive || healing === null ? (
                      <span style={{ color: "var(--text-muted-alt)" }}>— başlamadı</span>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div
                          style={{
                            width: 70,
                            height: 7,
                            borderRadius: 999,
                            background: "var(--surface-alt)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              width: `${healing}%`,
                              height: "100%",
                              background: "var(--primary-mid)",
                            }}
                          />
                        </div>
                        <span style={{ fontWeight: 700, color: "var(--primary)" }}>
                          %{healing}
                        </span>
                      </div>
                    )}
                    {isActive && progress?.totalDays && (
                      <div style={{ fontSize: 11, color: "var(--text-muted-alt)", marginTop: 2 }}>
                        {progress.day}/{progress.totalDays} gün
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "13px 16px", color: "var(--text-muted)" }}>
                    {formatRelative(
                      w.lastSubmission?.created_at ?? w.startedAt,
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}

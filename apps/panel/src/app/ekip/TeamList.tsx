"use client";

import { useEffect, useState } from "react";
import { NurseStatus } from "@saran/shared";
import { Button, Card, StatusBadge } from "../../components/ui";
import { useAuth } from "../../lib/auth";
import {
  fetchNurses,
  nameInitials,
  type NurseWithMeta,
  verifyNurse,
} from "../../lib/queries";

const HEADERS = ["Hemşire", "Uzmanlık", "Durum", "Aktif hasta", "Puan", ""];

export function TeamList() {
  const { user } = useAuth();
  const [nurses, setNurses] = useState<NurseWithMeta[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetchNurses()
      .then((n) => active && setNurses(n))
      .catch(
        (e) =>
          active &&
          setError(
            e?.message ??
              "Hemşire listesi yüklenemedi. Bu bölüm yalnızca yöneticilere açıktır.",
          ),
      );
    return () => {
      active = false;
    };
  }, [user]);

  const verify = async (id: string) => {
    setBusyId(id);
    try {
      await verifyNurse(id);
      setNurses((prev) =>
        (prev ?? []).map((n) =>
          n.id === id ? { ...n, status: NurseStatus.VERIFIED } : n,
        ),
      );
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Doğrulama başarısız (yetki gerekir).",
      );
    } finally {
      setBusyId(null);
    }
  };

  if (error) return <div style={{ color: "var(--danger)" }}>{error}</div>;
  if (nurses === null)
    return <div style={{ color: "var(--text-muted)" }}>Yükleniyor…</div>;
  if (nurses.length === 0)
    return <div style={{ color: "var(--text-muted)" }}>Henüz hemşire yok.</div>;

  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
        <thead>
          <tr style={{ background: "var(--surface)", textAlign: "left" }}>
            {HEADERS.map((h, i) => (
              <th
                key={h || `col-${i}`}
                style={{
                  padding: "12px 16px",
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
          {nurses.map((n) => {
            const verified = n.status === NurseStatus.VERIFIED;
            const pending = n.status === NurseStatus.PENDING;
            return (
              <tr key={n.id} style={{ borderTop: "1px solid var(--card-border)" }}>
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
                      {nameInitials(n.fullName)}
                    </span>
                    <div>
                      <div style={{ fontWeight: 700, color: "var(--text-heading)" }}>
                        {n.fullName}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                        {n.experience_years} yıl deneyim
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "13px 16px" }}>{n.specialty}</td>
                <td style={{ padding: "13px 16px" }}>
                  <StatusBadge
                    status={verified ? "active" : "assessment"}
                    label={verified ? "Onaylı" : "Doğrulama bekliyor"}
                  />
                </td>
                <td style={{ padding: "13px 16px", fontWeight: 700 }}>
                  {n.active_patient_count}
                </td>
                <td style={{ padding: "13px 16px" }}>
                  {n.rating > 0 ? (
                    <span style={{ fontWeight: 700, color: "var(--star-text)" }}>
                      ★ {n.rating.toFixed(1)}
                    </span>
                  ) : (
                    <span style={{ color: "var(--text-muted-alt)" }}>—</span>
                  )}
                </td>
                <td style={{ padding: "13px 16px" }}>
                  {pending && (
                    <Button
                      style={{ padding: "7px 14px", fontSize: 13 }}
                      disabled={busyId === n.id}
                      onClick={() => verify(n.id)}
                    >
                      {busyId === n.id ? "…" : "Doğrula"}
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

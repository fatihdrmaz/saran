"use client";

import { useEffect, useMemo, useState } from "react";
import { AppointmentStatus, AppointmentType } from "@saran/shared";
import { Button, Card, PageHeader } from "../../components/ui";
import { useAuth } from "../../lib/auth";
import {
  type AppointmentWithMeta,
  fetchAppointments,
  updateAppointmentStatus,
} from "../../lib/queries";

const DAY_LABELS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function sameDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() === startOfDay(b).getTime();
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("tr-TR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentWithMeta[] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Date>(() => startOfDay(new Date()));
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetchAppointments(user.id)
      .then((a) => active && setAppointments(a))
      .catch((e) => active && setError(e.message ?? "Veri yüklenemedi"));
    return () => {
      active = false;
    };
  }, [user]);

  // Seçili günü içeren haftanın (Pazartesi başlangıçlı) 7 günü.
  const weekDays = useMemo(() => {
    const base = startOfDay(selected);
    const dow = (base.getDay() + 6) % 7; // 0 = Pazartesi
    const monday = new Date(base);
    monday.setDate(base.getDate() - dow);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  }, [selected]);

  const dayAgenda = useMemo(
    () =>
      (appointments ?? [])
        .filter(
          (a) =>
            a.status === AppointmentStatus.CONFIRMED &&
            sameDay(new Date(a.scheduled_at), selected),
        )
        .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at)),
    [appointments, selected],
  );

  const requests = useMemo(
    () =>
      (appointments ?? [])
        .filter((a) => a.status === AppointmentStatus.REQUESTED)
        .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at)),
    [appointments],
  );

  const setStatus = async (id: string, status: AppointmentStatus) => {
    setBusyId(id);
    try {
      await updateAppointmentStatus(id, status);
      setAppointments((prev) =>
        (prev ?? []).map((a) => (a.id === id ? { ...a, status } : a)),
      );
    } catch {
      /* sessiz */
    } finally {
      setBusyId(null);
    }
  };

  const subtitle = selected.toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <PageHeader title="Randevular" subtitle={subtitle} />

      {error && (
        <div style={{ color: "var(--danger)", marginBottom: 16 }}>{error}</div>
      )}

      {/* Hafta şeridi */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {weekDays.map((d) => {
          const active = sameDay(d, selected);
          return (
            <button
              key={d.toISOString()}
              onClick={() => setSelected(startOfDay(d))}
              style={{
                width: 64,
                textAlign: "center",
                padding: "12px 0",
                borderRadius: 14,
                background: active ? "var(--primary)" : "#fff",
                color: active ? "#fff" : "var(--text-body)",
                border: `1px solid ${active ? "var(--primary)" : "var(--card-border)"}`,
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                {DAY_LABELS[d.getDay()]}
              </div>
              <div style={{ fontSize: 18, fontWeight: 800 }}>{d.getDate()}</div>
            </button>
          );
        })}
      </div>

      {appointments === null ? (
        <div style={{ color: "var(--text-muted)" }}>Yükleniyor…</div>
      ) : (
        <div
          className="split-2col"
          style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, alignItems: "start" }}
        >
          {/* Günün ajandası */}
          <Card>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-heading)", marginBottom: 16 }}>
              Günün ajandası
            </h2>
            {dayAgenda.length === 0 ? (
              <div style={{ color: "var(--text-muted)" }}>
                Bu gün için onaylı randevu yok.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {dayAgenda.map((a) => (
                  <div key={a.id} style={{ display: "flex", gap: 16 }}>
                    <div style={{ width: 54, fontWeight: 800, color: "var(--primary)", fontSize: 14, paddingTop: 14 }}>
                      {timeLabel(a.scheduled_at)}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        background: "var(--surface-green)",
                        borderLeft: "4px solid var(--primary-mid)",
                        borderRadius: 12,
                        padding: "12px 14px",
                        marginBottom: 8,
                      }}
                    >
                      <span style={{ fontSize: 18 }}>
                        {a.type === AppointmentType.VIDEO ? "📹" : "📞"}
                      </span>
                      <div>
                        <div style={{ fontWeight: 700, color: "var(--text-heading)" }}>
                          {a.patientName}
                        </div>
                        <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                          {a.type === AppointmentType.VIDEO
                            ? "Görüntülü görüşme"
                            : "Sesli görüşme"}{" "}
                          · {a.duration_min} dk
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Talepler */}
          <Card>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-heading)", marginBottom: 16 }}>
              Randevu talepleri
            </h2>
            {requests.length === 0 ? (
              <div style={{ color: "var(--text-muted)" }}>Bekleyen talep yok.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {requests.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      border: "1px solid var(--card-border)",
                      borderRadius: 12,
                      padding: 14,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <span style={{ fontSize: 16 }}>
                        {r.type === AppointmentType.VIDEO ? "📹" : "📞"}
                      </span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, color: "var(--text-heading)" }}>
                          {r.patientName}
                        </div>
                        <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                          {new Date(r.scheduled_at).toLocaleString("tr-TR", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          · {r.duration_min} dk
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button
                        style={{ flex: 1, padding: "8px 12px" }}
                        disabled={busyId === r.id}
                        onClick={() => setStatus(r.id, AppointmentStatus.CONFIRMED)}
                      >
                        Onayla
                      </Button>
                      <Button
                        variant="ghost"
                        style={{ flex: 1, padding: "8px 12px" }}
                        disabled={busyId === r.id}
                        onClick={() => setStatus(r.id, AppointmentStatus.CANCELLED)}
                      >
                        İptal
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
}

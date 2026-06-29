"use client";

import { useEffect, useState } from "react";
import type { WoundType } from "@saran/shared";
import { Button, Card, Pill, WoundPhoto } from "../../components/ui";
import { useAuth } from "../../lib/auth";
import { formatDate, woundTypeLabel } from "../../lib/labels";
import {
  deleteReview,
  fetchAllReviews,
  type ReviewWithMeta,
} from "../../lib/queries";

function Stars({ rating }: { rating: number }) {
  const full = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span style={{ color: "var(--star-text)", fontWeight: 700, fontSize: 14 }}>
      {"★".repeat(full)}
      <span style={{ color: "var(--text-muted-alt)" }}>{"★".repeat(5 - full)}</span>
    </span>
  );
}

export function ReviewsList() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<ReviewWithMeta[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetchAllReviews()
      .then((r) => active && setReviews(r))
      .catch((e) => active && setError(e?.message ?? "Yorumlar yüklenemedi"));
    return () => {
      active = false;
    };
  }, [user]);

  const remove = async (id: string) => {
    if (!window.confirm("Bu yorum silinsin mi? Bu işlem geri alınamaz.")) return;
    setBusyId(id);
    setActionError(null);
    try {
      await deleteReview(id);
      setReviews((prev) => (prev ?? []).filter((r) => r.id !== id));
    } catch (e) {
      setActionError(
        e instanceof Error
          ? e.message
          : "Yorum silinemedi. Bu işlem yalnızca yöneticilere açıktır.",
      );
    } finally {
      setBusyId(null);
    }
  };

  if (error) return <div style={{ color: "var(--danger)" }}>{error}</div>;
  if (reviews === null)
    return <div style={{ color: "var(--text-muted)" }}>Yükleniyor…</div>;
  if (reviews.length === 0)
    return <div style={{ color: "var(--text-muted)" }}>Henüz yorum yok.</div>;

  return (
    <>
      {actionError && (
        <div
          style={{
            color: "var(--danger)",
            fontSize: 13,
            fontWeight: 600,
            marginBottom: 14,
          }}
        >
          {actionError}
        </div>
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: 16,
        }}
      >
        {reviews.map((r) => {
          const hasImages = Boolean(r.before_image_url || r.after_image_url);
          return (
            <Card key={r.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Stars rating={r.rating} />
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {formatDate(r.created_at)}
                </span>
              </div>

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <Pill bg="var(--surface-green)" fg="var(--primary)">
                  {woundTypeLabel[r.wound_type as WoundType] ?? r.wound_type}
                </Pill>
                {r.duration_label && (
                  <Pill bg="var(--surface)" fg="var(--text-body)">
                    {r.duration_label}
                  </Pill>
                )}
              </div>

              <p style={{ fontSize: 13.5, color: "var(--text-body)", lineHeight: 1.5 }}>
                {r.text}
              </p>

              {hasImages && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>
                      Önce
                    </div>
                    <WoundPhoto label="hasta onaylı" height={120} />
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>
                      Sonra
                    </div>
                    <WoundPhoto label="hasta onaylı" height={120} />
                  </div>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "auto",
                  paddingTop: 4,
                }}
              >
                <span style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                  {r.patientName}
                </span>
                <Button
                  variant="ghost"
                  onClick={() => remove(r.id)}
                  disabled={busyId === r.id}
                  style={{ color: "var(--danger)", padding: "7px 14px", fontSize: 13 }}
                >
                  {busyId === r.id ? "…" : "Sil"}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

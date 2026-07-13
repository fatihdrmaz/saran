"use client";

import { useEffect, useState } from "react";
import type { WoundType } from "@saran/shared";
import { Button, Card, Pill } from "../../components/ui";
import { useAuth } from "../../lib/auth";
import { formatDate, woundTypeLabel } from "../../lib/labels";
import {
  deleteReview,
  fetchAllReviews,
  type ReviewWithMeta,
  revokeReviewConsent,
} from "../../lib/queries";
import { CaseForm } from "./CaseForm";

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
  const [showForm, setShowForm] = useState(false);

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

  const revokeConsent = async (id: string) => {
    if (
      !window.confirm(
        "Bu vakanın yayın rızası geri çekilsin mi? Görseller yayından düşer.",
      )
    )
      return;
    setBusyId(id);
    setActionError(null);
    try {
      await revokeReviewConsent(id);
      setReviews((prev) =>
        (prev ?? []).map((r) =>
          r.id === id ? { ...r, consent_confirmed: false } : r,
        ),
      );
    } catch (e) {
      setActionError(
        e instanceof Error ? e.message : "Rıza geri çekilemedi.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const onCreated = (review: ReviewWithMeta) => {
    setReviews((prev) => [review, ...(prev ?? [])]);
    setShowForm(false);
  };

  if (error) return <div style={{ color: "var(--danger)" }}>{error}</div>;
  if (reviews === null)
    return <div style={{ color: "var(--text-muted)" }}>Yükleniyor…</div>;

  return (
    <>
      <div style={{ marginBottom: 20 }}>
        {showForm ? (
          <CaseForm onCreated={onCreated} onCancel={() => setShowForm(false)} />
        ) : (
          <Button onClick={() => setShowForm(true)}>Öne çıkan vaka ekle</Button>
        )}
      </div>

      {reviews.length === 0 && !showForm && (
        <div style={{ color: "var(--text-muted)" }}>Henüz yorum yok.</div>
      )}

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
                {r.consent_confirmed ? (
                  <Pill bg="var(--surface-green)" fg="var(--primary)">
                    Yayında
                  </Pill>
                ) : (
                  <Pill bg="var(--surface)" fg="var(--danger)">
                    Rıza yok
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
                    {r.before_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.before_image_url}
                        alt="Önce"
                        style={{
                          width: "100%",
                          height: 120,
                          objectFit: "cover",
                          borderRadius: 12,
                          border: "1px solid var(--card-border)",
                        }}
                      />
                    ) : (
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>—</div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 4 }}>
                      Sonra
                    </div>
                    {r.after_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={r.after_image_url}
                        alt="Sonra"
                        style={{
                          width: "100%",
                          height: 120,
                          objectFit: "cover",
                          borderRadius: 12,
                          border: "1px solid var(--card-border)",
                        }}
                      />
                    ) : (
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>—</div>
                    )}
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
                <div style={{ display: "flex", gap: 8 }}>
                  {r.consent_confirmed && (
                    <Button
                      variant="ghost"
                      onClick={() => revokeConsent(r.id)}
                      disabled={busyId === r.id}
                      style={{ padding: "7px 14px", fontSize: 13 }}
                    >
                      {busyId === r.id ? "…" : "Rızayı geri çek"}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    onClick={() => remove(r.id)}
                    disabled={busyId === r.id}
                    style={{ color: "var(--danger)", padding: "7px 14px", fontSize: 13 }}
                  >
                    {busyId === r.id ? "…" : "Sil"}
                  </Button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </>
  );
}

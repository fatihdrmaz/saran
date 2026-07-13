"use client";

import { useEffect, useRef, useState } from "react";
import { PainLevel } from "@saran/shared";
import { WOUND_PHOTOS_BUCKET, woundPhotoPath } from "@saran/supabase";
import { getSupabase } from "../../lib/supabase";
import { safeFileName } from "../../lib/auth-helpers";
import {
  ErrorBox,
  InfoBox,
  labelStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
} from "../fields";
import {
  cardStyle,
  chipStyle,
  formatDate,
  MAX_FILE_BYTES,
  PAIN_OPTIONS,
  sectionTitleStyle,
  type SubmissionRow,
} from "./shared";

/**
 * Bir yaranın "Fotoğraflar" bölümü: tüm gönderimler (tarih + iyileşme % +
 * imzalı URL ile önizleme; açılamazsa nazik placeholder). Aktif plan varsa
 * yeni fotoğraf gönderim formu.
 */

/* ---------- İmzalı URL ile önizleme ---------- */

function PhotoThumb({ imagePath }: { imagePath: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const { data, error } = await getSupabase()
          .storage.from(WOUND_PHOTOS_BUCKET)
          .createSignedUrl(imagePath, 300);
        if (!active) return;
        if (error || !data?.signedUrl) {
          setFailed(true);
          return;
        }
        setUrl(data.signedUrl);
      } catch {
        if (active) setFailed(true);
      }
    })();
    return () => {
      active = false;
    };
  }, [imagePath]);

  const boxStyle: React.CSSProperties = {
    width: 84,
    height: 84,
    flexShrink: 0,
    borderRadius: 12,
    overflow: "hidden",
    background: "var(--surface-alt)",
    border: "1px solid var(--card-border)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 11,
    fontWeight: 700,
    color: "var(--text-muted-alt)",
    textAlign: "center",
    padding: 6,
  };

  if (failed) return <div style={boxStyle}>Önizleme yok</div>;
  if (!url) return <div style={boxStyle}>Yükleniyor…</div>;
  return (
    <div style={boxStyle}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Yara fotoğrafı"
        onError={() => setFailed(true)}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    </div>
  );
}

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
      setError(
        err instanceof Error ? err.message : "Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.",
      );
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

/* ---------- Bölüm ---------- */

export function WoundPhotos({
  woundId,
  submissions,
  canUpload,
  onSubmitted,
}: {
  woundId: string;
  /** Bu yaranın gönderimleri (tarihe göre yeniden eskiye). */
  submissions: SubmissionRow[];
  /** Aktif plan varsa yeni fotoğraf gönderimi açılır. */
  canUpload: boolean;
  onSubmitted: () => void;
}) {
  return (
    <div id="fotograflar">
      <h2 style={sectionTitleStyle}>Fotoğraflar</h2>
      <div style={cardStyle}>
        {submissions.length === 0 ? (
          <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Bu yara için henüz fotoğraf gönderimi yok.
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {submissions.map((s) => (
              <div
                key={s.id}
                style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}
              >
                <PhotoThumb imagePath={s.image_path} />
                <div style={{ flex: "1 1 160px", minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-heading)" }}>
                    {formatDate(s.created_at)}
                  </div>
                  {s.healing_percent != null && (
                    <div style={{ fontSize: 13, color: "var(--primary)", fontWeight: 700, marginTop: 2 }}>
                      İyileşme %{Math.max(0, Math.min(100, s.healing_percent))}
                    </div>
                  )}
                  {s.patient_note && (
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4, lineHeight: 1.5 }}>
                      {s.patient_note}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {canUpload && <NewSubmissionForm woundId={woundId} onSubmitted={onSubmitted} />}
      </div>
    </div>
  );
}

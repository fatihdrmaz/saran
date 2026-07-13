"use client";

import { useEffect, useState } from "react";
import { WoundType } from "@saran/shared";
import { Button, Card } from "../../components/ui";
import { woundTypeLabel } from "../../lib/labels";
import {
  createCaseReview,
  type ReviewWithMeta,
  uploadCaseImage,
} from "../../lib/queries";

const MAX_BYTES = 10 * 1024 * 1024; // 10MB

const labelStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: "var(--text-heading)",
  marginBottom: 6,
  display: "block",
} as const;
const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid var(--card-border)",
  borderRadius: 10,
  background: "#fff",
} as const;

/** Tek bir dosya seçimi + önizleme + 10MB/image doğrulaması. */
function ImagePicker({
  title,
  file,
  previewUrl,
  onPick,
}: {
  title: string;
  file: File | null;
  previewUrl: string | null;
  onPick: (file: File | null, error: string | null) => void;
}) {
  const handle = (f: File | null) => {
    if (!f) {
      onPick(null, null);
      return;
    }
    if (!f.type.startsWith("image/")) {
      onPick(null, `${title}: yalnızca görsel dosyası yükleyin.`);
      return;
    }
    if (f.size > MAX_BYTES) {
      onPick(null, `${title}: dosya 10MB sınırını aşıyor.`);
      return;
    }
    onPick(f, null);
  };

  return (
    <div>
      <label style={labelStyle}>{title}</label>
      {previewUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt={`${title} önizleme`}
          style={{
            width: "100%",
            height: 150,
            objectFit: "cover",
            borderRadius: 12,
            border: "1px solid var(--card-border)",
            marginBottom: 8,
          }}
        />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => handle(e.target.files?.[0] ?? null)}
        style={{ fontSize: 13 }}
      />
      {file && (
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
          {file.name}
        </div>
      )}
    </div>
  );
}

export function CaseForm({
  onCreated,
  onCancel,
}: {
  onCreated: (review: ReviewWithMeta) => void;
  onCancel: () => void;
}) {
  const [displayName, setDisplayName] = useState("");
  const [woundType, setWoundType] = useState<WoundType>(WoundType.PRESSURE);
  const [durationLabel, setDurationLabel] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");

  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null);
  const [afterUrl, setAfterUrl] = useState<string | null>(null);

  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Önizleme objectURL'lerini temizle.
  useEffect(() => {
    return () => {
      if (beforeUrl) URL.revokeObjectURL(beforeUrl);
    };
  }, [beforeUrl]);
  useEffect(() => {
    return () => {
      if (afterUrl) URL.revokeObjectURL(afterUrl);
    };
  }, [afterUrl]);

  const pickBefore = (f: File | null, err: string | null) => {
    if (beforeUrl) URL.revokeObjectURL(beforeUrl);
    setBeforeFile(f);
    setBeforeUrl(f ? URL.createObjectURL(f) : null);
    setError(err);
  };
  const pickAfter = (f: File | null, err: string | null) => {
    if (afterUrl) URL.revokeObjectURL(afterUrl);
    setAfterFile(f);
    setAfterUrl(f ? URL.createObjectURL(f) : null);
    setError(err);
  };

  const canSave =
    consent &&
    !busy &&
    displayName.trim().length >= 2 &&
    durationLabel.trim().length >= 2 &&
    text.trim().length >= 3 &&
    Boolean(beforeFile) &&
    Boolean(afterFile);

  const save = async () => {
    if (!consent) {
      setError("Kaydetmek için yayın rızası kutusunu onaylayın.");
      return;
    }
    if (!beforeFile || !afterFile) {
      setError("Önce ve sonra fotoğraflarının ikisi de gereklidir.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const folder = crypto.randomUUID();
      const [beforeImageUrl, afterImageUrl] = await Promise.all([
        uploadCaseImage(beforeFile, `${folder}/before.jpg`),
        uploadCaseImage(afterFile, `${folder}/after.jpg`),
      ]);
      const review = await createCaseReview({
        displayName: displayName.trim(),
        woundType,
        durationLabel: durationLabel.trim(),
        rating,
        text: text.trim(),
        beforeImageUrl,
        afterImageUrl,
      });
      onCreated(review);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Vaka kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card style={{ maxWidth: 720, display: "grid", gap: 14, marginBottom: 24 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-heading)" }}>
        Öne çıkan vaka ekle
      </div>

      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <label style={labelStyle}>Görünen ad</label>
          <input
            style={inputStyle}
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="ör. Meltem K."
          />
        </div>
        <div>
          <label style={labelStyle}>Yara tipi</label>
          <select
            style={inputStyle}
            value={woundType}
            onChange={(e) => setWoundType(e.target.value as WoundType)}
          >
            {Object.values(WoundType).map((wt) => (
              <option key={wt} value={wt}>
                {woundTypeLabel[wt]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <label style={labelStyle}>Süre etiketi</label>
          <input
            style={inputStyle}
            value={durationLabel}
            onChange={(e) => setDurationLabel(e.target.value)}
            placeholder="ör. 6 haftada"
          />
        </div>
        <div>
          <label style={labelStyle}>Puan</label>
          <select
            style={inputStyle}
            value={rating}
            onChange={(e) => setRating(Number(e.target.value))}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {"★".repeat(n)} ({n})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label style={labelStyle}>Alıntı / yorum</label>
        <textarea
          style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Hastanın deneyimini özetleyen kısa alıntı"
        />
      </div>

      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" }}>
        <ImagePicker
          title="Önce fotoğrafı"
          file={beforeFile}
          previewUrl={beforeUrl}
          onPick={pickBefore}
        />
        <ImagePicker
          title="Sonra fotoğrafı"
          file={afterFile}
          previewUrl={afterUrl}
          onPick={pickAfter}
        />
      </div>

      <label
        style={{
          display: "flex",
          gap: 10,
          alignItems: "flex-start",
          fontSize: 13,
          color: "var(--text-body)",
          lineHeight: 1.5,
          background: "var(--surface)",
          border: "1px solid var(--card-border)",
          borderRadius: 12,
          padding: 12,
        }}
      >
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          style={{ marginTop: 2, flexShrink: 0 }}
        />
        <span>
          Bu görsellerin yayınlanması için hastadan yazılı açık rıza alındığını ve
          saklandığını onaylıyorum.
        </span>
      </label>

      {error && (
        <div style={{ color: "var(--danger)", fontSize: 13, fontWeight: 600 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <Button onClick={save} disabled={!canSave}>
          {busy ? "Kaydediliyor…" : "Vakayı kaydet"}
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={busy}>
          Vazgeç
        </Button>
      </div>
    </Card>
  );
}

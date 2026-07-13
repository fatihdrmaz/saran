"use client";

import { useEffect, useState } from "react";
import { WoundType } from "@saran/shared";
import { Button, Card } from "../../components/ui";
import { woundTypeLabel } from "../../lib/labels";
import {
  createCaseReview,
  type ReviewWithMeta,
  updateCaseReview,
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
  initial,
  onSaved,
  onCancel,
}: {
  /** Varsa DÜZENLEME modu: alanlar dolu başlar, mevcut görseller korunur. */
  initial?: ReviewWithMeta;
  onSaved: (review: ReviewWithMeta) => void;
  onCancel: () => void;
}) {
  const isEdit = Boolean(initial);

  const [displayName, setDisplayName] = useState(initial?.display_name ?? "");
  const [woundType, setWoundType] = useState<WoundType>(
    (initial?.wound_type as WoundType) ?? WoundType.PRESSURE,
  );
  const [durationLabel, setDurationLabel] = useState(
    initial?.duration_label ?? "",
  );
  const [rating, setRating] = useState(initial?.rating ?? 5);
  const [text, setText] = useState(initial?.text ?? "");

  // Mevcut (kayıtlı) görsel URL'leri — yeni dosya seçilmeyen taraf bunları korur.
  const existingBefore = initial?.before_image_url ?? null;
  const existingAfter = initial?.after_image_url ?? null;

  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  // Yalnızca yeni seçilen dosyaların objectURL önizlemeleri (blob:).
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null);
  const [afterUrl, setAfterUrl] = useState<string | null>(null);

  const [consent, setConsent] = useState(initial?.consent_confirmed ?? false);
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

  // Kayıt sonrası her tarafta görsel olup olmayacağı (yeni dosya YA DA mevcut URL).
  const hasBefore = Boolean(beforeFile || existingBefore);
  const hasAfter = Boolean(afterFile || existingAfter);
  const hasAnyImage = hasBefore || hasAfter;
  // Önce/sonra ikisi ya birlikte dolu ya birlikte boş olmalı.
  const imagesPaired = hasBefore === hasAfter;
  // Görsel varsa (mevcut ya da yeni) yayın rızası zorunlu; hiç görsel yoksa opsiyonel.
  const consentOk = hasAnyImage ? consent : true;

  const fieldsOk =
    displayName.trim().length >= 2 &&
    durationLabel.trim().length >= 1 &&
    text.trim().length >= 3;

  const canSave = isEdit
    ? !busy && fieldsOk && imagesPaired && consentOk
    : !busy && fieldsOk && Boolean(beforeFile) && Boolean(afterFile) && consent;

  /** Butonun neden pasif olduğunu kullanıcıya söyle (sessiz pasiflik kafa karıştırıyor). */
  const missing: string[] = [];
  if (displayName.trim().length < 2) missing.push("görünen ad");
  if (durationLabel.trim().length < 1) missing.push("süre etiketi");
  if (text.trim().length < 3) missing.push("alıntı");
  if (isEdit) {
    if (hasBefore && !hasAfter) missing.push("sonra fotoğrafı (önce doluyken)");
    if (!hasBefore && hasAfter) missing.push("önce fotoğrafı (sonra doluyken)");
    if (hasAnyImage && !consent) missing.push("rıza onayı");
  } else {
    if (!beforeFile) missing.push("önce fotoğrafı");
    if (!afterFile) missing.push("sonra fotoğrafı");
    if (!consent) missing.push("rıza onayı");
  }

  const save = async () => {
    if (!canSave) return;
    setBusy(true);
    setError(null);
    try {
      let review: ReviewWithMeta;
      if (isEdit && initial) {
        // Yalnızca DEĞİŞEN dosyaları yükle (yeni uuid klasörüne); diğer taraf
        // mevcut URL'ini korur.
        const folder = crypto.randomUUID();
        const [beforeImageUrl, afterImageUrl] = await Promise.all([
          beforeFile
            ? uploadCaseImage(beforeFile, `${folder}/before.jpg`)
            : Promise.resolve(existingBefore),
          afterFile
            ? uploadCaseImage(afterFile, `${folder}/after.jpg`)
            : Promise.resolve(existingAfter),
        ]);
        review = await updateCaseReview(initial.id, {
          displayName: displayName.trim(),
          woundType,
          durationLabel: durationLabel.trim(),
          rating,
          text: text.trim(),
          beforeImageUrl,
          afterImageUrl,
          consentConfirmed: hasAnyImage ? true : consent,
        });
      } else {
        if (!beforeFile || !afterFile) {
          setError("Önce ve sonra fotoğraflarının ikisi de gereklidir.");
          return;
        }
        const folder = crypto.randomUUID();
        const [beforeImageUrl, afterImageUrl] = await Promise.all([
          uploadCaseImage(beforeFile, `${folder}/before.jpg`),
          uploadCaseImage(afterFile, `${folder}/after.jpg`),
        ]);
        review = await createCaseReview({
          displayName: displayName.trim(),
          woundType,
          durationLabel: durationLabel.trim(),
          rating,
          text: text.trim(),
          beforeImageUrl,
          afterImageUrl,
        });
      }
      onSaved(review);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Vaka kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card style={{ maxWidth: 720, display: "grid", gap: 14, marginBottom: 24 }}>
      <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-heading)" }}>
        {isEdit ? "Yorumu düzenle" : "Öne çıkan vaka ekle"}
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
          previewUrl={beforeUrl ?? existingBefore}
          onPick={pickBefore}
        />
        <ImagePicker
          title="Sonra fotoğrafı"
          file={afterFile}
          previewUrl={afterUrl ?? existingAfter}
          onPick={pickAfter}
        />
      </div>

      {isEdit && (existingBefore || existingAfter) && (
        <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
          Mevcut görseller korunur; yalnızca değiştirmek istediğiniz taraf için
          yeni dosya seçin.
        </div>
      )}

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
          {isEdit && !hasAnyImage && (
            <span style={{ color: "var(--text-muted)" }}>
              {" "}
              (görsel bulunmadığı için zorunlu değil)
            </span>
          )}
        </span>
      </label>

      {error && (
        <div style={{ color: "var(--danger)", fontSize: 13, fontWeight: 600 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <Button onClick={save} disabled={!canSave}>
          {busy
            ? "Kaydediliyor…"
            : isEdit
              ? "Değişiklikleri kaydet"
              : "Vakayı kaydet"}
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={busy}>
          Vazgeç
        </Button>
        {!canSave && !busy && missing.length > 0 && (
          <span style={{ fontSize: 12.5, color: "var(--warning-text)", fontWeight: 600 }}>
            Eksik: {missing.join(", ")}
          </span>
        )}
      </div>
    </Card>
  );
}

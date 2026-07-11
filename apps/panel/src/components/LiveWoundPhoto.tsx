"use client";

/**
 * Yara fotoğrafının GERÇEK görüntülenmesi (hemşire paneli).
 *
 * Varsayılan: bulanık desen + kilit (WoundPhoto) — mahremiyet korunur.
 * "Netleştir" → private `wound-photos` bucket'ından 5 dk'lık imzalı URL alınır.
 * Storage RLS gereği yalnızca yaraya ATANMIŞ hemşire (veya hasta sahibi/admin)
 * imzalı URL üretebilir; havuzdaki hemşirede istek başarısız olur ve nazik bir
 * not gösterilir. Başarılı netleştirme KVKK gereği access_logs'a yazılır.
 */
import { useState } from "react";
import {
  getSignedWoundPhotoUrl,
  logSubmissionImageView,
} from "../lib/queries";
import { WoundPhoto } from "./ui";

/**
 * Bir mesaj içeriğinin storage yolu ({woundId}/{dosya}) olup olmadığını sezgisel
 * test eder. URL'ler ("://" içerenler) ve serbest metin path sayılmaz.
 */
export function isWoundImagePath(value: string | null | undefined): boolean {
  if (!value) return false;
  const v = value.trim();
  if (v.includes("://")) return false;
  return /^\S+\/\S+\.(jpe?g|png|webp|gif|heic|heif)$/i.test(v);
}

type RevealState = "hidden" | "loading" | "visible" | "failed";

export function LiveWoundPhoto({
  imagePath,
  height = 200,
  label,
}: {
  imagePath: string;
  height?: number;
  label?: string;
}) {
  const [state, setState] = useState<RevealState>("hidden");
  const [url, setUrl] = useState<string | null>(null);

  const reveal = async () => {
    setState("loading");
    const signed = await getSignedWoundPhotoUrl(imagePath);
    if (signed) {
      setUrl(signed);
      setState("visible");
      // KVKK denetim kaydı — başarı durumunda, arka planda.
      void logSubmissionImageView();
    } else {
      setUrl(null);
      setState("failed");
    }
  };

  const hide = () => {
    setUrl(null);
    setState("hidden");
  };

  if (state === "visible" && url) {
    return (
      <div style={{ width: "100%" }}>
        <div style={{ position: "relative", width: "100%" }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- imzalı, kısa ömürlü URL; next/image optimizasyonu istenmez */}
          <img
            src={url}
            alt={label ?? "Yara fotoğrafı"}
            onError={() => {
              // İmzalı URL üretildi ama obje yok (eski/mock kayıt) → nazik hata.
              setUrl(null);
              setState("failed");
            }}
            style={{
              width: "100%",
              height,
              objectFit: "cover",
              borderRadius: 14,
              display: "block",
              background: "var(--surface)",
            }}
          />
          {label && (
            <span
              style={{
                position: "absolute",
                top: 8,
                left: 8,
                background: "rgba(30,40,36,.6)",
                color: "#fff",
                borderRadius: 999,
                padding: "2px 8px",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {label}
            </span>
          )}
          <button
            onClick={hide}
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              background: "rgba(30,40,36,.72)",
              color: "#fff",
              border: "none",
              borderRadius: 999,
              padding: "4px 12px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Gizle
          </button>
        </div>
        <p
          style={{
            fontSize: 10.5,
            color: "var(--text-muted)",
            marginTop: 4,
            lineHeight: 1.35,
          }}
        >
          Geçici görüntüleme: 5 dk imzalı bağlantı, yalnızca bu oturumda (KVKK).
        </p>
      </div>
    );
  }

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <WoundPhoto height={height} label={label} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "center",
          padding: 10,
        }}
      >
        {state === "failed" ? (
          <span
            style={{
              background: "rgba(30,40,36,.78)",
              color: "#fff",
              borderRadius: 10,
              padding: "6px 10px",
              fontSize: 11,
              lineHeight: 1.35,
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            Görsel görüntülenemiyor — bu yara size atanmamış olabilir
          </span>
        ) : (
          <button
            onClick={reveal}
            disabled={state === "loading"}
            style={{
              background: "#fff",
              color: "var(--primary)",
              border: "none",
              borderRadius: 999,
              padding: "6px 14px",
              fontSize: 12.5,
              fontWeight: 800,
              cursor: state === "loading" ? "default" : "pointer",
              opacity: state === "loading" ? 0.7 : 1,
              boxShadow: "0 2px 8px rgba(0,0,0,.25)",
            }}
          >
            {state === "loading" ? "Açılıyor…" : "Netleştir"}
          </button>
        )}
      </div>
    </div>
  );
}

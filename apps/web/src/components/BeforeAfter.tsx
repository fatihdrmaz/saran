"use client";

import { useState } from "react";

/**
 * Gerçek önce/sonra yara görselleri — mahremiyet için VARSAYILAN olarak bulanık.
 * Kullanıcı "Göster" düğmesine basınca her iki görsel de netleşir.
 *
 * `beforeUrl` ve `afterUrl` public case-images URL'leridir. Görsel yüklenemezse
 * nazik bir yer tutucu gösterilir. Bu bileşen yalnızca hasta onaylı (consent)
 * kayıtlar için render edilmelidir.
 */
export function BeforeAfter({
  beforeUrl,
  afterUrl,
}: {
  beforeUrl: string;
  afterUrl: string;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div style={{ marginBottom: 14 }}>
      <button
        type="button"
        onClick={() => setRevealed((v) => !v)}
        aria-pressed={revealed}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 7,
          width: "100%",
          justifyContent: "center",
          background: revealed ? "var(--surface-alt)" : "var(--surface-green)",
          color: revealed ? "var(--text-muted)" : "var(--primary)",
          border: "1px solid var(--card-border)",
          borderRadius: 10,
          padding: "9px 12px",
          fontSize: 13,
          fontWeight: 800,
          cursor: "pointer",
          marginBottom: 8,
        }}
      >
        {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
        {revealed ? "Görselleri gizle" : "Tıbbi görselleri göster"}
      </button>
      <div style={{ display: "flex", gap: 8 }}>
        <Frame url={beforeUrl} revealed={revealed} label="Önce" accent="rgba(24,48,42,.72)" />
        <Frame url={afterUrl} revealed={revealed} label="Sonra" accent="rgba(31,163,122,.9)" />
      </div>
    </div>
  );
}

function Frame({
  url,
  revealed,
  label,
  accent,
}: {
  url: string;
  revealed: boolean;
  label: string;
  accent: string;
}) {
  const [errored, setErrored] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        flex: 1,
        aspectRatio: "4 / 3",
        overflow: "hidden",
        borderRadius: 12,
        background: "var(--surface-alt)",
      }}
    >
      {errored ? (
        <Placeholder />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={revealed ? `${label} görseli` : ""}
          onError={() => setErrored(true)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
            filter: revealed ? "none" : "blur(14px)",
            transform: revealed ? "none" : "scale(1.08)",
            transition: "filter .25s ease",
          }}
        />
      )}

      {/* koyu overlay + kilitli durum bilgisi — yalnızca gizliyken */}
      {!revealed && !errored && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: 8,
            textAlign: "center",
            background: "rgba(24,40,36,.52)",
            color: "#fff",
          }}
        >
          <Lock size={18} />
          <span style={{ fontSize: 10, fontWeight: 700, lineHeight: 1.3 }}>
            Tıbbi görsel — göstermek için dokun
          </span>
        </div>
      )}

      <span
        style={{
          position: "absolute",
          left: 7,
          top: 7,
          background: accent,
          color: "#fff",
          fontSize: 10,
          fontWeight: 700,
          padding: "3px 8px",
          borderRadius: 6,
        }}
      >
        {label}
      </span>
    </div>
  );
}

function Placeholder() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: 8,
        textAlign: "center",
        background: "var(--surface-alt)",
        color: "var(--text-muted-alt)",
      }}
    >
      <ImageOff size={20} />
      <span style={{ fontSize: 10, fontWeight: 600 }}>Görsel yüklenemedi</span>
    </div>
  );
}

/* Inline SVG ikonlar (bağımlılık yok) */

function Eye({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth={1.8} />
    </svg>
  );
}

function EyeOff({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M3 3l18 18M10.6 5.1A9.9 9.9 0 0 1 12 5c6.5 0 10 7 10 7a17.9 17.9 0 0 1-3.6 4.3M6.6 6.6A17.6 17.6 0 0 0 2 12s3.5 7 10 7a9.8 9.8 0 0 0 4-.85M9.9 9.9a3 3 0 0 0 4.2 4.2"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Lock({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="4.5" y="10.5" width="15" height="10" rx="2" stroke="currentColor" strokeWidth={1.8} />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" />
    </svg>
  );
}

function ImageOff({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth={1.7} />
      <path d="M3 16l5-5 4 4M14 14l2-2 5 5M4 4l16 16" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

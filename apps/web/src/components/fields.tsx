"use client";

import type { CSSProperties, ReactNode } from "react";

/**
 * Form alanı yardımcıları — değerlendirme ve şifre sayfalarının ortak
 * input/etiket/mesaj stilleri. Mevcut tasarım diliyle uyumlu (README §5).
 */

export const inputStyle: CSSProperties = {
  width: "100%",
  background: "#fff",
  border: "1px solid var(--card-border)",
  borderRadius: "var(--radius-sm)",
  padding: "13px 16px",
  fontSize: 15,
  color: "var(--text-body)",
  fontFamily: "inherit",
};

export const labelStyle: CSSProperties = {
  display: "block",
  fontSize: 14,
  fontWeight: 700,
  color: "var(--text-heading)",
  marginBottom: 6,
};

export const primaryButtonStyle: CSSProperties = {
  background: "var(--primary)",
  color: "#fff",
  fontSize: 16,
  fontWeight: 800,
  padding: "15px 28px",
  borderRadius: "var(--radius-pill)",
  border: "none",
  cursor: "pointer",
};

export const secondaryButtonStyle: CSSProperties = {
  background: "#fff",
  border: "1px solid var(--card-border)",
  color: "var(--text-heading)",
  fontSize: 15,
  fontWeight: 700,
  padding: "13px 24px",
  borderRadius: "var(--radius-pill)",
  cursor: "pointer",
};

export function TextField({
  label,
  ...inputProps
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label style={{ display: "block", marginBottom: 14 }}>
      <span style={labelStyle}>{label}</span>
      <input {...inputProps} style={{ ...inputStyle, ...inputProps.style }} />
    </label>
  );
}

/** Kırmızı hata kutusu. */
export function ErrorBox({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      style={{
        background: "var(--danger-bg)",
        color: "var(--danger)",
        fontSize: 14,
        fontWeight: 600,
        padding: "12px 16px",
        borderRadius: 12,
        marginBottom: 16,
        lineHeight: 1.5,
      }}
    >
      {children}
    </div>
  );
}

/** Yeşil bilgi kutusu (ör. "doğrulama e-postası gönderildi"). */
export function InfoBox({ children }: { children: ReactNode }) {
  return (
    <div
      role="status"
      style={{
        background: "var(--success-bg)",
        color: "var(--primary)",
        fontSize: 14,
        fontWeight: 600,
        padding: "12px 16px",
        borderRadius: 12,
        marginBottom: 16,
        lineHeight: 1.5,
      }}
    >
      {children}
    </div>
  );
}

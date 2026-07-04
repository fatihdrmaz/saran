"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const CONSENT_KEY = "saran-cookie-consent";

/**
 * Çerez bandı — README §11 (KVKK).
 * localStorage'da onay kaydı yoksa altta sabit bant gösterir.
 * Sitede analitik çerez yok; bant yalnızca zorunlu/tercih çerezlerini bildirir.
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(CONSENT_KEY)) setVisible(true);
    } catch {
      // localStorage erişilemiyorsa (gizli mod vb.) bandı gösterme.
    }
  }, []);

  function accept() {
    try {
      window.localStorage.setItem(CONSENT_KEY, new Date().toISOString());
    } catch {
      // Kayıt başarısız olsa da bandı kapat.
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Çerez bildirimi"
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        background: "var(--primary-dark)",
        color: "#d7eae3",
        padding: "14px 24px",
        boxShadow: "0 -4px 18px rgba(24,48,42,.18)",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <p style={{ fontSize: 13, lineHeight: 1.55, margin: 0, maxWidth: 640 }}>
          Sitemiz yalnızca temel işlevler için zorunlu çerezler kullanır;
          analitik veya reklam çerezi kullanmıyoruz. Ayrıntılar için{" "}
          <Link
            href="/cerez-politikasi"
            style={{ color: "#9fe6d6", fontWeight: 700, textDecoration: "underline" }}
          >
            Çerez Politikası
          </Link>
          {"'"}na bakabilirsiniz.
        </p>
        <button
          type="button"
          onClick={accept}
          style={{
            background: "var(--primary-mid, #1fa37a)",
            color: "#fff",
            fontSize: 14,
            fontWeight: 800,
            fontFamily: "var(--font-body)",
            padding: "10px 22px",
            border: "none",
            borderRadius: "var(--radius-pill)",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          Kabul et
        </button>
      </div>
    </div>
  );
}

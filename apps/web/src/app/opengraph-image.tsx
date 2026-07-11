import { ImageResponse } from "next/og";

/**
 * Varsayılan OG/paylaşım kartı — WhatsApp/X/LinkedIn'de link paylaşılınca görünür.
 * next/og ile build sırasında üretilir; harici asset gerektirmez.
 */
export const alt = "Yara Takibi — Uzaktan Yara Bakım Takibi";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#F5F1E9",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <svg width="88" height="88" viewBox="0 0 64 64">
            <rect width="64" height="64" rx="14" fill="#0E7A63" />
            <path
              d="M11 36 L20 36 L25 24 L32 44 L38 18 L43 32 L53 32"
              fill="none"
              stroke="#F5F1E9"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div style={{ display: "flex", fontSize: 56, fontWeight: 800, color: "#18302A" }}>
            Yara<span style={{ color: "#0E7A63" }}>Takibi</span>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 44,
            color: "#18302A",
            marginTop: 48,
            lineHeight: 1.25,
            maxWidth: 900,
          }}
        >
          Yaranız iyileşene kadar uzaktan yanınızdayız.
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#5E726B", marginTop: 20 }}>
          Fotoğrafınızı gönderin, uzman hemşire değerlendirsin · İlk değerlendirme ücretsiz
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 56,
            fontSize: 26,
            fontWeight: 700,
            color: "#0E7A63",
          }}
        >
          yaratakibi.com
        </div>
      </div>
    ),
    size,
  );
}

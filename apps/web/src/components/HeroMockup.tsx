/**
 * Hero görsel maketi — gerçek yara fotoğrafı yerine uygulamanın "yara dosyası"
 * ekranını temsil eder. Mahremiyet motifini (bulanık + kilit) ve iyileşme
 * takibini tek görselde anlatır. Harici asset/görsel yok; tümü stil.
 */

function LockIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

const woundBlur: React.CSSProperties = {
  background:
    "repeating-linear-gradient(45deg,#cdb0a0,#cdb0a0 12px,#bd9d8b 12px,#bd9d8b 24px)",
  filter: "blur(2px)",
};

export function HeroMockup() {
  return (
    <div
      aria-label="Yara Takibi uygulaması — yara dosyası ekranı örneği"
      style={{
        background: "var(--bg-cream)",
        borderRadius: 18,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      {/* Hemşire şeridi */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            background: "#cfe6dd",
            color: "var(--primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 800,
            fontSize: 14,
          }}
        >
          H
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-heading)" }}>
            Hemşireniz
          </div>
          <div style={{ fontSize: 11.5, color: "var(--primary-mid)", fontWeight: 600 }}>
            ● çevrimiçi
          </div>
        </div>
        <span
          style={{
            fontSize: 11.5,
            fontWeight: 700,
            color: "var(--success-text)",
            background: "var(--success-bg)",
            padding: "4px 10px",
            borderRadius: 999,
          }}
        >
          Aktif takip
        </span>
      </div>

      {/* Bulanık yara fotoğrafı + kilit (mahremiyet motifi) */}
      <div
        style={{
          position: "relative",
          height: 150,
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, ...woundBlur }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(30,40,36,.32)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            color: "#fff",
          }}
        >
          <LockIcon size={22} />
          <span style={{ fontSize: 12.5, fontWeight: 600 }}>Şifreli — yalnızca hemşireniz görür</span>
        </div>
      </div>

      {/* İyileşme çubuğu */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 12.5,
            fontWeight: 700,
            color: "var(--text-heading)",
            marginBottom: 6,
          }}
        >
          <span>İyileşme</span>
          <span style={{ color: "var(--primary)" }}>%68</span>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: "#e6ded0" }}>
          <div style={{ width: "68%", height: "100%", borderRadius: 999, background: "var(--primary)" }} />
        </div>
      </div>

      {/* Zaman çizelgesi — bulanık küçük kareler */}
      <div style={{ display: "flex", gap: 8 }}>
        {["14. gün", "7. gün", "Bugün"].map((d) => (
          <div key={d} style={{ flex: 1 }}>
            <div style={{ height: 48, borderRadius: 10, ...woundBlur }} />
            <div style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 5 }}>
              {d}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

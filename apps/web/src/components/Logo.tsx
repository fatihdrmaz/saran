/**
 * Yara Takibi logosu — nabız/iyileşme çizgili sembol + kelime markası.
 * `variant="light"` koyu zeminlerde (footer) kullanılır.
 */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <rect width="64" height="64" rx="14" fill="var(--primary)" />
      <path
        d="M11 36 L20 36 L25 24 L32 44 L38 18 L43 32 L53 32"
        fill="none"
        stroke="#F5F1E9"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({
  size = 30,
  variant = "dark",
}: {
  size?: number;
  variant?: "dark" | "light";
}) {
  const base = variant === "light" ? "#fff" : "var(--text-heading)";
  const accent = variant === "light" ? "#7FD8C4" : "var(--primary)";
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <LogoMark size={size} />
      <span
        style={{
          fontFamily: "var(--font-body)",
          fontWeight: 800,
          fontSize: size * 0.62,
          letterSpacing: "-0.02em",
          color: base,
          lineHeight: 1,
        }}
      >
        Yara<span style={{ color: accent }}>Takibi</span>
      </span>
    </span>
  );
}

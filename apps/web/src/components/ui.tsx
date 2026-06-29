import type { CSSProperties, ReactNode } from "react";

/** Rozet/pill — README §5 (radius 999). */
export function Pill({
  children,
  bg = "var(--surface-green)",
  color = "var(--primary)",
  style,
}: {
  children: ReactNode;
  bg?: string;
  color?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      style={{
        display: "inline-block",
        background: bg,
        color,
        fontSize: 12,
        fontWeight: 800,
        padding: "5px 12px",
        borderRadius: "var(--radius-pill)",
        letterSpacing: ".02em",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/**
 * Bulanık gri görsel placeholder — README §5 (gerçek fotoğraf yerine).
 * Mahremiyet ilkesi: tüm yara/portre görselleri bilinçli olarak bulanık blok.
 */
export function BlurSlot({
  height,
  gradient = "#c9a593, #a87a66",
  radius = 0,
  aspectRatio,
  children,
  label,
}: {
  height?: number;
  gradient?: string;
  radius?: number;
  aspectRatio?: string;
  children?: ReactNode;
  label?: string;
}) {
  return (
    <div
      role="img"
      aria-label={label ?? "Hasta onaylı, mahremiyet için bulanıklaştırılmış görsel"}
      style={{
        position: "relative",
        width: "100%",
        height: height ? `${height}px` : undefined,
        aspectRatio,
        overflow: "hidden",
        borderRadius: radius,
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, ${gradient})`,
          filter: "blur(8px)",
        }}
      />
      {children}
    </div>
  );
}

/** Bölüm başlığı (eyebrow + serif başlık) — prototipteki tutarlı kalıp. */
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  onDark = false,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  onDark?: boolean;
  align?: "center" | "left";
}) {
  return (
    <div
      style={{
        textAlign: align,
        marginBottom: 36,
        maxWidth: align === "center" ? 640 : undefined,
        marginLeft: align === "center" ? "auto" : undefined,
        marginRight: align === "center" ? "auto" : undefined,
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: ".1em",
          textTransform: "uppercase",
          color: onDark ? "var(--teal-light)" : "var(--primary)",
          marginBottom: 10,
        }}
      >
        {eyebrow}
      </div>
      <h2
        style={{
          fontSize: 34,
          fontWeight: 500,
          color: onDark ? "#fff" : "var(--text-heading)",
          lineHeight: 1.15,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.6,
            color: onDark ? "#a7c9bf" : "var(--text-muted)",
            marginTop: 14,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

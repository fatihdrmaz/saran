import type { CSSProperties, ReactNode } from "react";
import { statusColors, type StatusKey } from "@saran/tokens";

/** Sayfa başlığı + opsiyonel açıklama/aksiyon. */
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        marginBottom: 24,
        flexWrap: "wrap",
      }}
    >
      <div>
        <h1
          className="serif"
          style={{ fontSize: 26, fontWeight: 600, color: "var(--text-heading)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p style={{ color: "var(--text-muted)", marginTop: 4, fontSize: 14 }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function Card({
  children,
  style,
  className,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: "#fff",
        border: "1px solid var(--card-border)",
        borderRadius: 18,
        padding: 20,
        boxShadow: "var(--shadow-card)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const STATUS_LABELS: Record<StatusKey, string> = {
  active: "Aktif takip ✓",
  pending: "Onay bekliyor",
  assessment: "Değerlendirme",
  emergency: "Acil",
};

/** Durum rozeti — statusColors ile her yerde tutarlı (README §7). */
export function StatusBadge({
  status,
  label,
}: {
  status: StatusKey;
  label?: string;
}) {
  const c = statusColors[status];
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: c.bg,
        color: c.fg,
        fontSize: 12.5,
        fontWeight: 700,
        padding: "5px 11px",
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      {label ?? STATUS_LABELS[status]}
    </span>
  );
}

/** Genel amaçlı pill rozeti (renk parametreli). */
export function Pill({
  children,
  bg,
  fg,
}: {
  children: ReactNode;
  bg: string;
  fg: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: bg,
        color: fg,
        fontSize: 12,
        fontWeight: 700,
        padding: "4px 10px",
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

/** İstatistik kartı (Bugün/Kazanç). */
export function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  accent?: string;
}) {
  return (
    <Card style={{ padding: 18 }}>
      <div
        style={{
          fontSize: 28,
          fontWeight: 800,
          color: accent ?? "var(--primary-dark)",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6 }}>
        {label}
      </div>
      {hint && (
        <div style={{ fontSize: 12, color: "var(--text-muted-alt)", marginTop: 4 }}>
          {hint}
        </div>
      )}
    </Card>
  );
}

/** Birincil / ikincil buton (link veya button). */
export function Button({
  children,
  variant = "primary",
  onClick,
  type = "button",
  style,
  disabled,
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  onClick?: () => void;
  type?: "button" | "submit";
  style?: CSSProperties;
  disabled?: boolean;
}) {
  const base: CSSProperties = {
    border: "1px solid transparent",
    borderRadius: 12,
    padding: "11px 18px",
    fontSize: 14,
    fontWeight: 700,
    opacity: disabled ? 0.55 : 1,
  };
  const variants: Record<string, CSSProperties> = {
    primary: { background: "var(--primary)", color: "#fff" },
    secondary: {
      background: "#fff",
      color: "var(--primary)",
      borderColor: "var(--primary)",
    },
    ghost: {
      background: "var(--surface)",
      color: "var(--text-body)",
      borderColor: "var(--card-border)",
    },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  );
}

/** Bulanık + 🔒 yara fotoğrafı bloğu (README §5 mahremiyet). */
export function WoundPhoto({
  label,
  height = 200,
  cleared = false,
}: {
  label?: string;
  height?: number;
  cleared?: boolean;
}) {
  return (
    <div
      className={cleared ? undefined : "wound-blur"}
      style={{
        position: "relative",
        width: "100%",
        height,
        borderRadius: 14,
        background: cleared
          ? "linear-gradient(135deg,#dcc6a6,#c2a582)"
          : undefined,
      }}
    >
      {!cleared && (
        <div className="wound-lock">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span>{label ?? "Yara fotoğrafı — bulanık"}</span>
          <span style={{ fontSize: 11, opacity: 0.85 }}>
            Yalnızca atanmış hemşire görebilir
          </span>
        </div>
      )}
    </div>
  );
}

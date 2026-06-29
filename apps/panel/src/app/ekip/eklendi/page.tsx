import Link from "next/link";
import { Button, Card, StatusBadge } from "../../../components/ui";

const steps = [
  { label: "Belgeler alındı", done: true },
  { label: "İnceleniyor", done: false, active: true },
  { label: "Onay & aktivasyon", done: false },
];

export default function NurseAddedPage() {
  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Card style={{ maxWidth: 480, width: "100%", textAlign: "center", padding: 36 }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: 999,
            background: "var(--star-bg)",
            color: "var(--star-text)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            margin: "0 auto 18px",
          }}
        >
          📋
        </div>
        <h1 className="serif" style={{ fontSize: 24, fontWeight: 600, color: "var(--text-heading)" }}>
          Hemşire doğrulamaya gönderildi
        </h1>
        <p style={{ color: "var(--text-muted)", marginTop: 8, lineHeight: 1.5 }}>
          Belgeler incelenecek. Onaylanmadan hastalara atanamaz.
        </p>

        <div style={{ margin: "22px 0", display: "flex", justifyContent: "center" }}>
          <StatusBadge status="assessment" label="Doğrulama bekliyor" />
        </div>

        {/* Durum zaman çizelgesi */}
        <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 14, margin: "0 auto 24px", maxWidth: 280 }}>
          {steps.map((s, i) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 999,
                  background: s.done
                    ? "var(--primary)"
                    : s.active
                      ? "var(--warning-bg)"
                      : "var(--surface-alt)",
                  color: s.done ? "#fff" : s.active ? "var(--warning-text)" : "var(--text-muted-alt)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {s.done ? "✓" : i + 1}
              </span>
              <span
                style={{
                  fontWeight: s.active ? 700 : 500,
                  color: s.done || s.active ? "var(--text-heading)" : "var(--text-muted)",
                }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <Link href="/ekip">
          <Button>Ekibe dön</Button>
        </Link>
      </Card>
    </div>
  );
}

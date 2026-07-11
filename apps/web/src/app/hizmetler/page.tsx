import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "../../components/PageShell";
import { SERVICES } from "../../lib/services";

export const metadata: Metadata = {
  title: "Hizmetlerimiz — Uzaktan Yara Bakımı | Yara Takibi",
  description:
    "Bası yarası, diyabetik ayak, ameliyat sonrası yara, venöz ülser ve yanık takibi. Evden fotoğraf gönderin, uzman yara bakım hemşiresi uzaktan değerlendirsin.",
  alternates: { canonical: "/hizmetler" },
};

export default function ServicesIndexPage() {
  return (
    <PageShell>
      <section className="container" style={{ padding: "48px 24px 32px", textAlign: "center" }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: ".1em",
            textTransform: "uppercase",
            color: "var(--primary)",
            marginBottom: 12,
          }}
        >
          Hizmetlerimiz
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 500 }}>Hangi yaralarda yanınızdayız?</h1>
        <p
          style={{
            fontSize: 17,
            lineHeight: 1.6,
            color: "var(--text-muted)",
            maxWidth: 600,
            margin: "14px auto 0",
          }}
        >
          Evde çektiğiniz fotoğraflarla uzaktan yara takibi. Uzman yara bakım
          hemşiresi değerlendirir, bakım planı önerir; ilk değerlendirme ücretsizdir.
        </p>
      </section>

      <section className="container" style={{ padding: "0 24px 56px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {SERVICES.map((s) => (
            <Link
              key={s.slug}
              href={`/hizmetler/${s.slug}`}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                background: "#fff",
                borderRadius: 18,
                padding: 24,
                border: "1px solid var(--card-border)",
                borderTop: "3px solid var(--primary)",
                textDecoration: "none",
              }}
            >
              <h2
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  fontFamily: "var(--font-body)",
                  color: "var(--text-heading)",
                }}
              >
                {s.name}
              </h2>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-muted)", flex: 1 }}>
                {s.card}
              </p>
              <span style={{ fontSize: 14, fontWeight: 800, color: "var(--primary)" }}>
                Ayrıntılı bilgi →
              </span>
            </Link>
          ))}
        </div>
        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            color: "var(--text-muted-alt)",
            marginTop: 26,
            maxWidth: 640,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Yara Takibi bir uzaktan takip ve danışmanlık hizmetidir; yüz yüze tıbbi
          muayenenin veya acil tıbbi yardımın yerini tutmaz.
        </p>
      </section>
    </PageShell>
  );
}

import type { Metadata } from "next";
import { PageShell } from "../../components/PageShell";
import { BlurSlot } from "../../components/ui";
import { EvalForm } from "./EvalForm";

export const metadata: Metadata = {
  title: "Ücretsiz Yara Değerlendirmesi — Yara Takibi",
  description:
    "Yara fotoğrafınızı gönderin, uzman hemşireniz ücretsiz değerlendirsin. Kart bilgisi istenmez; ödeme yalnızca plan onayında alınır.",
  alternates: { canonical: "/degerlendirme" },
  robots: { index: true, follow: true },
};

export default function EvaluationPage() {
  return (
    <PageShell>
      <section className="container" style={{ padding: "48px 24px", maxWidth: 1000 }}>
        <div className="two-col" style={{ gridTemplateColumns: "1.1fr 0.9fr" }}>
          <div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: ".1em",
                textTransform: "uppercase",
                color: "var(--primary)",
                marginBottom: 10,
              }}
            >
              Ücretsiz değerlendirme
            </div>
            <h1 style={{ fontSize: 34, fontWeight: 500, lineHeight: 1.15, marginBottom: 18 }}>
              Yara fotoğrafınızı gönderin
            </h1>
            <EvalForm />
          </div>

          <div className="hide-mobile">
            <div
              style={{
                background: "#fff",
                borderRadius: 20,
                padding: 12,
                border: "1px solid var(--card-border)",
                boxShadow: "0 20px 50px -28px rgba(0,0,0,.3)",
              }}
            >
              <BlurSlot height={360} gradient="#d8c0a0, #bfa07f" radius={12} label="Örnek yara görseli (bulanık placeholder)" />
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "../../../components/PageShell";
import { Check } from "../../../components/Icons";

export const metadata: Metadata = {
  title: "Fotoğrafınız İletildi — Yara Takibi",
  description:
    "Değerlendirmeniz alındı. Uzman hemşiremiz inceliyor; bakım planı öneriniz hazır olduğunda bildirim alacaksınız.",
  alternates: { canonical: "/degerlendirme/gonderildi" },
  robots: { index: false, follow: true },
};

export default function SubmittedPage() {
  return (
    <PageShell>
      <section
        className="container"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "80px 24px",
          minHeight: 460,
        }}
      >
        <div
          style={{
            width: 96,
            height: 96,
            borderRadius: "50%",
            background: "var(--surface-green-alt)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <Check size={46} strokeWidth={2.4} />
        </div>
        <h1 style={{ fontSize: 34, fontWeight: 500 }}>Fotoğrafınız iletildi</h1>
        <p style={{ fontSize: 17, lineHeight: 1.6, color: "var(--text-muted)", maxWidth: 440, margin: "14px 0 28px" }}>
          Uzman hemşiremiz değerlendirmenizi inceliyor. Bakım planı öneriniz hazır
          olduğunda bildirim alacaksınız — onaylarsanız takip başlar. İlk değerlendirme
          için ücret alınmaz.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <Link
            href="/"
            style={{
              background: "var(--primary)",
              color: "#fff",
              fontSize: 15,
              fontWeight: 800,
              padding: "14px 26px",
              borderRadius: "var(--radius-pill)",
              textDecoration: "none",
            }}
          >
            Ana sayfaya dön
          </Link>
          <Link
            href="/blog"
            style={{
              background: "#fff",
              border: "1px solid var(--card-border)",
              color: "var(--text-heading)",
              fontSize: 15,
              fontWeight: 700,
              padding: "14px 24px",
              borderRadius: "var(--radius-pill)",
              textDecoration: "none",
            }}
          >
            Blogu keşfet
          </Link>
        </div>
      </section>
    </PageShell>
  );
}

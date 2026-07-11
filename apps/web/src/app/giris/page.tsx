import type { Metadata } from "next";
import { PageShell } from "../../components/PageShell";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Hasta Girişi — Yara Takibi",
  description:
    "Yara Takibi hesabınıza giriş yapın; yaralarınızın durumunu, plan önerilerinizi ve ödemelerinizi görüntüleyin.",
  alternates: { canonical: "/giris" },
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <PageShell>
      <section className="container" style={{ padding: "64px 24px", maxWidth: 560 }}>
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
          Hasta girişi
        </div>
        <h1 style={{ fontSize: 34, fontWeight: 500, lineHeight: 1.15, marginBottom: 14 }}>
          Hesabınıza giriş yapın
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--text-muted)", marginBottom: 26 }}>
          Yaralarınızın takibini, bakım planı önerilerinizi ve ödemelerinizi
          Hesabım sayfanızdan görüntüleyebilirsiniz.
        </p>
        <LoginForm />
      </section>
    </PageShell>
  );
}

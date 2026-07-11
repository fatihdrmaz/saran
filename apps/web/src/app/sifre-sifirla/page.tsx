import type { Metadata } from "next";
import { PageShell } from "../../components/PageShell";
import { ResetRequestForm } from "./ResetRequestForm";

export const metadata: Metadata = {
  title: "Şifre Sıfırlama — Yara Takibi",
  description:
    "Yara Takibi hesabınızın şifresini sıfırlayın. E-posta adresinize güvenli bir sıfırlama bağlantısı gönderelim.",
  alternates: { canonical: "/sifre-sifirla" },
  robots: { index: false, follow: true },
};

export default function PasswordResetPage() {
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
          Hesabınız
        </div>
        <h1 style={{ fontSize: 34, fontWeight: 500, lineHeight: 1.15, marginBottom: 14 }}>
          Şifrenizi mi unuttunuz?
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--text-muted)", marginBottom: 26 }}>
          Sorun değil. Hesabınıza kayıtlı e-posta adresinizi yazın; size şifrenizi
          yenilemeniz için güvenli bir bağlantı gönderelim.
        </p>
        <ResetRequestForm />
      </section>
    </PageShell>
  );
}

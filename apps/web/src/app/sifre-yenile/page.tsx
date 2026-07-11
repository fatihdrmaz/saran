import type { Metadata } from "next";
import { PageShell } from "../../components/PageShell";
import { RenewPasswordForm } from "./RenewPasswordForm";

export const metadata: Metadata = {
  title: "Yeni Şifre Belirleme — Yara Takibi",
  description:
    "E-postanıza gönderilen bağlantı ile Yara Takibi hesabınız için yeni bir şifre belirleyin.",
  alternates: { canonical: "/sifre-yenile" },
  robots: { index: false, follow: true },
};

export default function PasswordRenewPage() {
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
          Yeni şifrenizi belirleyin
        </h1>
        <RenewPasswordForm />
      </section>
    </PageShell>
  );
}

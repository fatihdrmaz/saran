"use client";

import { useState } from "react";
import Link from "next/link";
import { getSupabase } from "../../lib/supabase";
import { ErrorBox, TextField, primaryButtonStyle } from "../../components/fields";

/** Şifre sıfırlama talebi: e-posta al → resetPasswordForEmail → "gönderildi" durumu. */

const RENEW_URL = "https://www.yaratakibi.com/sifre-yenile";

export function ResetRequestForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Geçerli bir e-posta adresi girin.");
      return;
    }
    setSubmitting(true);
    try {
      const { error: resetErr } = await getSupabase().auth.resetPasswordForEmail(trimmed, {
        redirectTo: RENEW_URL,
      });
      if (resetErr) {
        const m = resetErr.message.toLowerCase();
        setError(
          m.includes("rate limit") || m.includes("too many")
            ? "Çok fazla deneme yapıldı. Lütfen bir dakika bekleyip tekrar deneyin."
            : "Bağlantı gönderilemedi. Lütfen tekrar deneyin. (" + resetErr.message + ")",
        );
        setSubmitting(false);
        return;
      }
      setSent(true);
    } catch {
      setError("Bağlantı sorunu yaşandı. İnternetinizi kontrol edip tekrar deneyin.");
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div
        role="status"
        style={{
          background: "var(--success-bg)",
          borderRadius: 16,
          padding: "22px 24px",
        }}
      >
        <div style={{ fontSize: 17, fontWeight: 800, color: "var(--primary)", marginBottom: 6 }}>
          Bağlantı gönderildi
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-body)" }}>
          {email.trim()} adresi sistemimizde kayıtlıysa birkaç dakika içinde bir
          şifre yenileme bağlantısı alacaksınız. Gelen kutunuzu (ve spam
          klasörünü) kontrol edin; bağlantıya tıkladığınızda yeni şifrenizi
          belirleyebilirsiniz.
        </p>
        <p style={{ fontSize: 14, marginTop: 12 }}>
          <Link href="/degerlendirme" style={{ color: "var(--primary)", fontWeight: 700 }}>
            Değerlendirme sayfasına dön
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="E-posta"
        name="email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="ornek@eposta.com"
      />
      {error && <ErrorBox>{error}</ErrorBox>}
      <button
        type="submit"
        disabled={submitting}
        style={{ ...primaryButtonStyle, width: "100%", opacity: submitting ? 0.7 : 1 }}
      >
        {submitting ? "Gönderiliyor…" : "Sıfırlama bağlantısı gönder"}
      </button>
      <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 14 }}>
        Şifrenizi hatırladınız mı?{" "}
        <Link href="/degerlendirme" style={{ color: "var(--primary)", fontWeight: 700 }}>
          Değerlendirmeye devam edin
        </Link>
      </p>
    </form>
  );
}

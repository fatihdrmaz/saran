"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "../../lib/supabase";
import { translateAuthError } from "../../lib/auth-helpers";
import { ErrorBox, TextField, primaryButtonStyle } from "../../components/fields";

/**
 * Hasta girişi formu — e-posta + şifre ile signInWithPassword.
 * Başarıda /hesabim'e gider; zaten oturum varsa doğrudan yönlendirir.
 */
export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Zaten oturum açıksa /hesabim'e yönlendir.
  useEffect(() => {
    let mounted = true;
    try {
      getSupabase()
        .auth.getSession()
        .then(({ data }) => {
          if (mounted && data.session) router.replace("/hesabim");
        })
        .catch(() => {});
    } catch {
      // env eksikse form yine de render edilir; gönderimde hata gösterilir.
    }
    return () => {
      mounted = false;
    };
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError("E-posta ve şifrenizi girin.");
      return;
    }
    setSubmitting(true);
    try {
      const { data, error: signInErr } = await getSupabase().auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInErr || !data.session) {
        setError(translateAuthError(signInErr?.message ?? "Giriş yapılamadı."));
        setSubmitting(false);
        return;
      }
      router.replace("/hesabim");
    } catch (e) {
      setError(e instanceof Error ? translateAuthError(e.message) : "Beklenmedik bir hata oluştu.");
      setSubmitting(false);
    }
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
      <TextField
        label="Şifre"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <div style={{ marginBottom: 18, marginTop: -4 }}>
        <Link href="/sifre-sifirla" style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>
          Şifremi unuttum
        </Link>
      </div>
      {error && <ErrorBox>{error}</ErrorBox>}
      <button
        type="submit"
        disabled={submitting}
        style={{ ...primaryButtonStyle, width: "100%", opacity: submitting ? 0.7 : 1 }}
      >
        {submitting ? "Giriş yapılıyor…" : "Giriş yap"}
      </button>
      <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 16, lineHeight: 1.6 }}>
        Hesabınız yok mu?{" "}
        <Link href="/degerlendirme" style={{ color: "var(--primary)", fontWeight: 700 }}>
          Ücretsiz değerlendirme ile oluşturun
        </Link>
        {" "}— ilk değerlendirme için ücret alınmaz.
      </p>
    </form>
  );
}

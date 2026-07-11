"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabase } from "../../lib/supabase";
import { ErrorBox, TextField, primaryButtonStyle } from "../../components/fields";

/**
 * Yeni şifre belirleme. Supabase recovery bağlantısıyla gelindiğinde oturum
 * otomatik kurulur (URL'deki token client tarafında işlenir); oturum yoksa
 * "bağlantı geçersiz/süresi dolmuş" gösterilir.
 */

type Phase = "checking" | "ready" | "invalid" | "done";

export function RenewPasswordForm() {
  const [phase, setPhase] = useState<Phase>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let supabase;
    try {
      supabase = getSupabase();
    } catch {
      setPhase("invalid");
      return;
    }

    let found = false;
    // Recovery token URL'den asenkron işlenir; hem mevcut oturumu hem de
    // auth olaylarını dinle.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        found = true;
        setPhase((p) => (p === "checking" || p === "invalid" ? "ready" : p));
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        found = true;
        setPhase((p) => (p === "checking" || p === "invalid" ? "ready" : p));
      }
    });
    const timer = setTimeout(() => {
      if (!found) setPhase((p) => (p === "checking" ? "invalid" : p));
    }, 3000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalı.");
      return;
    }
    if (password !== confirm) {
      setError("Şifreler birbiriyle uyuşmuyor.");
      return;
    }
    setSubmitting(true);
    try {
      const { error: updateErr } = await getSupabase().auth.updateUser({ password });
      if (updateErr) {
        const m = updateErr.message.toLowerCase();
        setError(
          m.includes("should be different")
            ? "Yeni şifreniz eski şifrenizle aynı olamaz."
            : m.includes("session") || m.includes("not logged in")
              ? "Oturumunuz doğrulanamadı — bağlantının süresi dolmuş olabilir. Lütfen yeni bir sıfırlama bağlantısı isteyin."
              : "Şifre güncellenemedi. Lütfen tekrar deneyin. (" + updateErr.message + ")",
        );
        setSubmitting(false);
        return;
      }
      setPhase("done");
    } catch {
      setError("Bağlantı sorunu yaşandı. İnternetinizi kontrol edip tekrar deneyin.");
      setSubmitting(false);
    }
  }

  if (phase === "checking") {
    return (
      <p style={{ fontSize: 16, color: "var(--text-muted)" }} role="status">
        Bağlantınız doğrulanıyor…
      </p>
    );
  }

  if (phase === "invalid") {
    return (
      <div
        role="alert"
        style={{ background: "var(--danger-bg)", borderRadius: 16, padding: "22px 24px" }}
      >
        <div style={{ fontSize: 17, fontWeight: 800, color: "var(--danger)", marginBottom: 6 }}>
          Bağlantı geçersiz veya süresi dolmuş
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-body)" }}>
          Bu sayfaya e-postanıza gönderilen şifre yenileme bağlantısıyla
          ulaşmanız gerekir. Bağlantılar güvenlik nedeniyle kısa süre
          geçerlidir.
        </p>
        <p style={{ fontSize: 14, marginTop: 12 }}>
          <Link href="/sifre-sifirla" style={{ color: "var(--primary)", fontWeight: 700 }}>
            Yeni bir sıfırlama bağlantısı isteyin
          </Link>
        </p>
      </div>
    );
  }

  if (phase === "done") {
    return (
      <div
        role="status"
        style={{ background: "var(--success-bg)", borderRadius: 16, padding: "22px 24px" }}
      >
        <div style={{ fontSize: 17, fontWeight: 800, color: "var(--primary)", marginBottom: 6 }}>
          Şifreniz güncellendi
        </div>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--text-body)" }}>
          Artık yeni şifrenizle giriş yapabilirsiniz. Bekleyen bir yara
          değerlendirmeniz varsa kaldığınız yerden devam edebilirsiniz.
        </p>
        <p style={{ fontSize: 14, marginTop: 12 }}>
          <Link href="/degerlendirme" style={{ color: "var(--primary)", fontWeight: 700 }}>
            Ücretsiz değerlendirmeye git
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <p style={{ fontSize: 15, lineHeight: 1.6, color: "var(--text-muted)", marginBottom: 20 }}>
        Hesabınız için yeni bir şifre belirleyin. En az 8 karakter kullanın.
      </p>
      <TextField
        label="Yeni şifre"
        name="password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="En az 8 karakter"
      />
      <TextField
        label="Yeni şifre (tekrar)"
        name="confirm"
        type="password"
        autoComplete="new-password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
      />
      {error && <ErrorBox>{error}</ErrorBox>}
      <button
        type="submit"
        disabled={submitting}
        style={{ ...primaryButtonStyle, width: "100%", opacity: submitting ? 0.7 : 1 }}
      >
        {submitting ? "Güncelleniyor…" : "Şifreyi güncelle"}
      </button>
    </form>
  );
}

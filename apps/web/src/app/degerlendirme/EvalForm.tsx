"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  PainLevel,
  WoundType,
  registerSchema,
  submissionSchema,
} from "@saran/shared";
import { WOUND_PHOTOS_BUCKET, woundPhotoPath } from "@saran/supabase";
import { getSupabase } from "../../lib/supabase";
import { safeFileName, translateAuthError } from "../../lib/auth-helpers";
import { BlurSlot } from "../../components/ui";
import {
  ErrorBox,
  InfoBox,
  TextField,
  labelStyle,
  primaryButtonStyle,
  secondaryButtonStyle,
} from "../../components/fields";

/**
 * Ücretsiz değerlendirme formu — GERÇEK akış (README §6B-4 + §6A-4).
 * Adım 1: fotoğraf + yara bilgileri. Adım 2: hesap (kayıt / giriş).
 * Oturum alınınca: wounds insert → storage upload → submissions insert.
 */

const WOUND_OPTIONS: { value: WoundType; label: string }[] = [
  { value: WoundType.PRESSURE, label: "Bası yarası" },
  { value: WoundType.DIABETIC_FOOT, label: "Diyabetik ayak" },
  { value: WoundType.SURGICAL, label: "Cerrahi yara" },
  { value: WoundType.VENOUS, label: "Venöz ülser" },
  { value: WoundType.BURN, label: "Yanık yarası" },
];

const PAIN_OPTIONS: { value: PainLevel; label: string }[] = [
  { value: PainLevel.NONE, label: "Yok" },
  { value: PainLevel.MILD, label: "Hafif" },
  { value: PainLevel.MODERATE, label: "Orta" },
  { value: PainLevel.SEVERE, label: "Şiddetli" },
];

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10MB

type SessionUser = { id: string; label: string };

const chipStyle = (active: boolean): React.CSSProperties => ({
  background: active ? "var(--primary)" : "#fff",
  color: active ? "#fff" : "var(--text-muted)",
  border: active ? "none" : "1px solid var(--card-border)",
  fontSize: 14,
  fontWeight: 700,
  padding: "9px 15px",
  borderRadius: "var(--radius-pill)",
  cursor: "pointer",
});

const tabStyle = (active: boolean): React.CSSProperties => ({
  flex: 1,
  background: active ? "#fff" : "transparent",
  color: active ? "var(--primary)" : "var(--text-muted)",
  border: "none",
  fontSize: 15,
  fontWeight: 800,
  padding: "11px 14px",
  borderRadius: 12,
  cursor: "pointer",
  boxShadow: active ? "var(--shadow-card)" : "none",
});

export function EvalForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  // Adım 1 — yara bilgileri
  const [step, setStep] = useState<1 | 2>(1);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [woundType, setWoundType] = useState<WoundType | null>(null);
  const [region, setRegion] = useState("");
  const [painLevel, setPainLevel] = useState<PainLevel>(PainLevel.NONE);
  const [note, setNote] = useState("");

  // Adım 2 — hesap
  const [tab, setTab] = useState<"register" | "login">("register");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+90");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [kvkk, setKvkk] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Durum
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Upload başarısız olursa aynı wound ile tekrar denenir (yetim wound + duplicate önlenir).
  const woundIdRef = useRef<string | null>(null);

  useEffect(() => {
    let mounted = true;
    try {
      getSupabase()
        .auth.getSession()
        .then(({ data }) => {
          if (!mounted) return;
          const u = data.session?.user;
          if (u) {
            const meta = (u.user_metadata ?? {}) as { full_name?: string };
            setSessionUser({ id: u.id, label: meta.full_name || u.email || "Hesabınız" });
          }
        })
        .catch(() => {});
    } catch {
      // env eksikse (lokal build) form yine de render edilir; gönderimde hata gösterilir.
    }
    return () => {
      mounted = false;
    };
  }, []);

  // Önizleme URL'ini temizle
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError("Lütfen bir fotoğraf dosyası seçin (JPG, PNG veya HEIC).");
      return;
    }
    if (f.size > MAX_FILE_BYTES) {
      setError("Fotoğraf 10MB'den büyük. Lütfen daha küçük bir fotoğraf seçin veya telefonunuzun kamera ayarından boyutu düşürün.");
      return;
    }
    setError(null);
    setFile(f);
    setPreviewUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(f);
    });
  }

  /** Adım 1 alanlarını doğrular; hata varsa gösterir. */
  function validateStep1(): boolean {
    const parsed = submissionSchema.safeParse({
      woundType: woundType ?? undefined,
      imageUrl: file ? file.name : "",
      region: region.trim() || undefined,
      painLevel,
      patientNote: note.trim() || undefined,
    });
    if (!file) {
      setError("Lütfen yaranızın bir fotoğrafını seçin.");
      return false;
    }
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Lütfen alanları kontrol edin.");
      return false;
    }
    setError(null);
    return true;
  }

  /**
   * Oturum kurulduktan sonra çalışır: wounds insert → storage upload →
   * submissions insert → /degerlendirme/gonderildi.
   */
  async function submitCase(userId: string) {
    if (!file || !woundType) {
      setError("Fotoğraf veya yara tipi eksik — lütfen ilk adımı kontrol edin.");
      setStep(1);
      return;
    }
    setSubmitting(true);
    setError(null);
    const supabase = getSupabase();
    try {
      // 1) Yara kaydı (retry'da mevcut kayıt yeniden kullanılır)
      let woundId = woundIdRef.current;
      if (!woundId) {
        const { data, error: woundErr } = await supabase
          .from("wounds")
          .insert({
            patient_id: userId,
            type: woundType,
            region: region.trim() || null,
          })
          .select("id")
          .single();
        if (woundErr || !data) {
          throw new Error(
            "Yara kaydı oluşturulamadı. Lütfen tekrar deneyin." +
              (woundErr ? ` (${woundErr.message})` : ""),
          );
        }
        woundId = data.id;
        woundIdRef.current = woundId;
      }

      // 2) Fotoğraf yükleme (bucket: wound-photos, yol: {woundId}/{dosya})
      const path = woundPhotoPath(woundId, `${Date.now()}-${safeFileName(file.name)}`);
      const { error: uploadErr } = await supabase.storage
        .from(WOUND_PHOTOS_BUCKET)
        .upload(path, file, { contentType: file.type || "image/jpeg", upsert: false });
      if (uploadErr) {
        throw new Error(
          `Fotoğraf yüklenemedi (${uploadErr.message}). Bağlantınızı kontrol edip “Tekrar dene” ile devam edebilirsiniz — bilgileriniz kayboldu sanmayın, formda duruyor.`,
        );
      }

      // 3) Gönderim kaydı
      const { error: subErr } = await supabase.from("submissions").insert({
        wound_id: woundId,
        image_path: path,
        pain_level: painLevel,
        patient_note: note.trim() || null,
      });
      if (subErr) {
        throw new Error(
          `Gönderim kaydedilemedi (${subErr.message}). Lütfen “Tekrar dene” ile yeniden gönderin.`,
        );
      }

      router.push("/degerlendirme/gonderildi");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.");
      setSubmitting(false);
    }
  }

  function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateStep1()) return;
    if (sessionUser) {
      void submitCase(sessionUser.id);
    } else {
      setInfo(null);
      setStep(2);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);

    const normalizedPhone = phone.replace(/[\s()-]/g, "");
    const parsed = registerSchema.safeParse({
      fullName: fullName.trim(),
      phone: normalizedPhone,
      email: regEmail.trim(),
      password: regPassword,
      kvkkConsent: kvkk,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Lütfen alanları kontrol edin.");
      return;
    }

    setSubmitting(true);
    try {
      const supabase = getSupabase();
      const { data, error: signUpErr } = await supabase.auth.signUp({
        email: parsed.data.email,
        password: parsed.data.password,
        options: {
          data: {
            full_name: parsed.data.fullName,
            phone: parsed.data.phone,
            role: "patient",
            kvkk_consent: "true",
          },
        },
      });
      if (signUpErr) {
        setError(translateAuthError(signUpErr.message));
        setSubmitting(false);
        return;
      }
      // E-posta onayı açıkken Supabase, kayıtlı e-posta için hata yerine
      // identities'i boş bir kullanıcı döndürür — bunu "zaten kayıtlı" say.
      if (data.user && (data.user.identities?.length ?? 0) === 0) {
        setError("Bu e-posta kayıtlı — “Zaten üyeyim” sekmesinden giriş yapın.");
        setSubmitting(false);
        return;
      }
      if (!data.session) {
        // E-posta doğrulaması gerekli; fotoğraf ve yara bilgileri formda kalır.
        setInfo(
          "Hesabınız oluşturuldu — e-postanıza gelen doğrulama bağlantısına tıklayın, ardından bu sayfadan “Zaten üyeyim” sekmesiyle giriş yaparak gönderiminizi tamamlayın. Fotoğrafınız ve bilgileriniz formda sizi bekliyor.",
        );
        setLoginEmail(parsed.data.email);
        setSubmitting(false);
        return;
      }
      setSessionUser({ id: data.session.user.id, label: parsed.data.fullName });
      await submitCase(data.session.user.id);
    } catch (e) {
      setError(e instanceof Error ? translateAuthError(e.message) : "Beklenmedik bir hata oluştu.");
      setSubmitting(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!loginEmail.trim() || !loginPassword) {
      setError("E-posta ve şifrenizi girin.");
      return;
    }
    setSubmitting(true);
    try {
      const supabase = getSupabase();
      const { data, error: signInErr } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });
      if (signInErr || !data.session) {
        setError(translateAuthError(signInErr?.message ?? "Giriş yapılamadı."));
        setSubmitting(false);
        return;
      }
      const meta = (data.session.user.user_metadata ?? {}) as { full_name?: string };
      setSessionUser({
        id: data.session.user.id,
        label: meta.full_name || data.session.user.email || "Hesabınız",
      });
      await submitCase(data.session.user.id);
    } catch (e) {
      setError(e instanceof Error ? translateAuthError(e.message) : "Beklenmedik bir hata oluştu.");
      setSubmitting(false);
    }
  }

  async function handleSignOut() {
    try {
      await getSupabase().auth.signOut();
    } catch {
      // yoksay
    }
    setSessionUser(null);
    woundIdRef.current = null;
  }

  /* ---------- Adım 2: hesap ---------- */
  if (step === 2) {
    return (
      <div>
        <button
          type="button"
          onClick={() => {
            setStep(1);
            setError(null);
          }}
          style={{
            background: "none",
            border: "none",
            color: "var(--primary)",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            padding: 0,
            marginBottom: 16,
          }}
        >
          &larr; Yara bilgilerine dön
        </button>

        <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 18 }}>
          Değerlendirme sonucunuzu güvenle iletebilmemiz için ücretsiz bir hesap
          gerekiyor. Fotoğrafınız ve yara bilgileriniz formda hazır — hesabınız
          açılır açılmaz gönderim tamamlanır.
        </p>

        {/* Sekmeler */}
        <div
          role="tablist"
          aria-label="Hesap seçimi"
          style={{
            display: "flex",
            gap: 6,
            background: "var(--surface-alt)",
            borderRadius: 14,
            padding: 5,
            marginBottom: 20,
          }}
        >
          <button
            type="button"
            role="tab"
            aria-selected={tab === "register"}
            onClick={() => {
              setTab("register");
              setError(null);
            }}
            style={tabStyle(tab === "register")}
          >
            Yeni hesap
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "login"}
            onClick={() => {
              setTab("login");
              setError(null);
            }}
            style={tabStyle(tab === "login")}
          >
            Zaten üyeyim
          </button>
        </div>

        {info && <InfoBox>{info}</InfoBox>}
        {error && <ErrorBox>{error}</ErrorBox>}

        {tab === "register" ? (
          <form onSubmit={handleRegister}>
            <TextField
              label="Ad Soyad"
              name="fullName"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Adınız Soyadınız"
            />
            <TextField
              label="Telefon"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+905XXXXXXXXX"
            />
            <TextField
              label="E-posta"
              name="email"
              type="email"
              autoComplete="email"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              placeholder="ornek@eposta.com"
            />
            <TextField
              label="Şifre"
              name="password"
              type="password"
              autoComplete="new-password"
              value={regPassword}
              onChange={(e) => setRegPassword(e.target.value)}
              placeholder="En az 8 karakter"
            />
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                fontSize: 13,
                color: "var(--text-muted)",
                lineHeight: 1.5,
                margin: "4px 0 18px",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={kvkk}
                onChange={(e) => setKvkk(e.target.checked)}
                style={{ marginTop: 3, width: 16, height: 16, accentColor: "var(--primary)" }}
              />
              <span>
                <Link href="/kvkk" target="_blank" style={{ color: "var(--primary)", fontWeight: 700 }}>
                  KVKK Aydınlatma Metni
                </Link>
                &rsquo;ni okudum; sağlık verilerimin değerlendirme amacıyla
                işlenmesine açık rıza veriyorum.
              </span>
            </label>
            <button type="submit" disabled={submitting} style={{ ...primaryButtonStyle, width: "100%", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Gönderiliyor…" : error ? "Tekrar dene" : "Hesap oluştur ve gönder"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin}>
            <TextField
              label="E-posta"
              name="email"
              type="email"
              autoComplete="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="ornek@eposta.com"
            />
            <TextField
              label="Şifre"
              name="password"
              type="password"
              autoComplete="current-password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
            />
            <div style={{ marginBottom: 18, marginTop: -4 }}>
              <Link href="/sifre-sifirla" style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)" }}>
                Şifremi unuttum
              </Link>
            </div>
            <button type="submit" disabled={submitting} style={{ ...primaryButtonStyle, width: "100%", opacity: submitting ? 0.7 : 1 }}>
              {submitting ? "Gönderiliyor…" : error ? "Tekrar dene" : "Giriş yap ve gönder"}
            </button>
          </form>
        )}

        <p style={{ fontSize: 12, color: "var(--text-muted-alt)", marginTop: 14, maxWidth: 420 }}>
          Görselleriniz uçtan uca şifrelenir ve yalnızca size atanan hemşireniz
          görebilir. Yara Takibi uzaktan takip hizmetidir; acil tıbbi yardımın
          yerini tutmaz.
        </p>
      </div>
    );
  }

  /* ---------- Adım 1: yara bilgileri ---------- */
  return (
    <form onSubmit={handleStep1Submit} style={{ display: "flex", flexDirection: "column" }}>
      {/* Ücretsiz şeridi */}
      <div
        style={{
          background: "var(--surface-green-alt)",
          borderLeft: "4px solid var(--primary)",
          borderRadius: "0 14px 14px 0",
          padding: "14px 18px",
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 800, color: "var(--primary)" }}>
          İlk değerlendirme ücretsiz
        </div>
        <div style={{ fontSize: 13, color: "#3e7a68" }}>
          Plan önerilene kadar hiçbir ödeme alınmaz, kart bilgisi istenmez.
        </div>
      </div>

      {/* Oturum açık kullanıcı satırı */}
      {sessionUser && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "var(--text-muted)",
            marginBottom: 16,
          }}
        >
          <span>
            <strong style={{ color: "var(--text-heading)" }}>{sessionUser.label}</strong> olarak gönderiliyor
          </span>
          <span aria-hidden>&middot;</span>
          <button
            type="button"
            onClick={handleSignOut}
            style={{
              background: "none",
              border: "none",
              color: "var(--primary)",
              fontSize: 13,
              fontWeight: 700,
              cursor: "pointer",
              padding: 0,
            }}
          >
            Çıkış
          </button>
        </div>
      )}

      {/* Fotoğraf yükleme */}
      <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        style={{
          background: "#fff",
          border: "2px dashed #bfd8ce",
          borderRadius: 18,
          padding: previewUrl ? 14 : 34,
          textAlign: "center",
          marginBottom: 18,
          cursor: "pointer",
          width: "100%",
        }}
      >
        {previewUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Seçilen yara fotoğrafının önizlemesi"
              style={{
                width: "100%",
                maxHeight: 260,
                objectFit: "cover",
                borderRadius: 12,
                margin: "0 auto",
              }}
            />
            <div style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", marginTop: 10 }}>
              {file?.name} — değiştirmek için tıklayın
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: "var(--surface-green)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 12px",
              }}
              aria-hidden
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, color: "var(--text-heading)" }}>
              Fotoğraf seçin veya yükleyin
            </div>
            <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
              Net, iyi ışıklı bir kare en doğru sonucu verir. (En fazla 10MB)
            </div>
          </>
        )}
      </button>

      {/* Yara tipi seçimi */}
      <div style={{ ...labelStyle, marginBottom: 10 }}>Yara tipi</div>
      <div
        role="radiogroup"
        aria-label="Yara tipi"
        style={{ display: "flex", flexWrap: "wrap", gap: 9, marginBottom: 22 }}
      >
        {WOUND_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={woundType === o.value}
            onClick={() => setWoundType(o.value)}
            style={chipStyle(woundType === o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Bölge (opsiyonel) */}
      <TextField
        label="Yara bölgesi (isteğe bağlı)"
        name="region"
        value={region}
        onChange={(e) => setRegion(e.target.value)}
        placeholder="Örn. sol topuk, bel, ayak tabanı"
        maxLength={120}
      />

      {/* Ağrı seviyesi */}
      <div style={{ ...labelStyle, marginBottom: 10 }}>Ağrı seviyesi</div>
      <div
        role="radiogroup"
        aria-label="Ağrı seviyesi"
        style={{ display: "flex", flexWrap: "wrap", gap: 9, marginBottom: 22 }}
      >
        {PAIN_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={painLevel === o.value}
            onClick={() => setPainLevel(o.value)}
            style={chipStyle(painLevel === o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* Kısa not (opsiyonel) */}
      <label style={{ display: "block", marginBottom: 22 }}>
        <span style={labelStyle}>Kısa not (isteğe bağlı)</span>
        <textarea
          name="patientNote"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Yaranın ne zamandır olduğu, kullandığınız ürünler vb."
          maxLength={1000}
          rows={3}
          style={{
            width: "100%",
            background: "#fff",
            border: "1px solid var(--card-border)",
            borderRadius: "var(--radius-sm)",
            padding: "13px 16px",
            fontSize: 15,
            color: "var(--text-body)",
            fontFamily: "inherit",
            resize: "vertical",
          }}
        />
      </label>

      {error && <ErrorBox>{error}</ErrorBox>}

      <button
        type="submit"
        disabled={submitting}
        style={{
          ...primaryButtonStyle,
          alignSelf: "flex-start",
          cursor: submitting ? "default" : "pointer",
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting
          ? "Gönderiliyor…"
          : sessionUser
            ? error
              ? "Tekrar dene"
              : "Hemşireye gönder"
            : "Devam"}
      </button>

      <p style={{ fontSize: 12, color: "var(--text-muted-alt)", marginTop: 14, maxWidth: 420 }}>
        Görselleriniz uçtan uca şifrelenir ve yalnızca size atanan hemşireniz görebilir.
        Yara Takibi uzaktan takip hizmetidir; acil tıbbi yardımın yerini tutmaz.
      </p>

      {/* Mobilde önizleme bloğu (masaüstünde sağ kolonda) */}
      {!previewUrl && (
        <div className="hide-desktop" style={{ marginTop: 24 }}>
          <div
            style={{
              background: "#fff",
              borderRadius: 20,
              padding: 12,
              border: "1px solid var(--card-border)",
            }}
          >
            <BlurSlot height={240} gradient="#d8c0a0, #bfa07f" radius={12} label="Örnek yara görseli (bulanık)" />
          </div>
        </div>
      )}
    </form>
  );
}

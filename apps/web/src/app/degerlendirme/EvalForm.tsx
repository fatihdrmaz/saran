"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { WoundType, submissionSchema } from "@saran/shared";
import { BlurSlot } from "../../components/ui";

/**
 * Ücretsiz değerlendirme formu — README §6B-4.
 * UI + mock davranış (Supabase'e bağlanmaz). @saran/shared submissionSchema/WoundType.
 */

const WOUND_OPTIONS: { value: WoundType; label: string }[] = [
  { value: WoundType.PRESSURE, label: "Bası yarası" },
  { value: WoundType.DIABETIC_FOOT, label: "Diyabetik ayak" },
  { value: WoundType.SURGICAL, label: "Cerrahi yara" },
  { value: WoundType.VENOUS, label: "Venöz ülser" },
  { value: WoundType.BURN, label: "Yanık yarası" },
];

export function EvalForm() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [woundType, setWoundType] = useState<WoundType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Mock görsel yolu — gerçek üründe şifreli storage'a yüklenir.
    const imageUrl = fileName ? `mock://uploads/${fileName}` : "";
    const parsed = submissionSchema.safeParse({
      woundType: woundType ?? undefined,
      imageUrl,
    });

    if (!parsed.success) {
      const first = parsed.error.issues[0]?.message ?? "Lütfen alanları kontrol edin.";
      setError(first);
      return;
    }

    setSubmitting(true);
    // Funnel davranışı: gerçek submission oluşturmak hasta auth'u gerektirir
    // (RLS). Bu form şimdilik bir dönüşüm hunisi; onay ekranı uygulamadan/
    // kayıttan devamı yönlendirir.
    // TODO: İleride anonim/edge bir endpoint (örn. Supabase Edge Function) ile
    // ön kayıt/lead oluşturup buradan bağlanabilir.
    setTimeout(() => router.push("/degerlendirme/gonderildi"), 350);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column" }}>
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

      {/* Fotoğraf yükleme */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
      />
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        style={{
          background: "#fff",
          border: "2px dashed #bfd8ce",
          borderRadius: 18,
          padding: 34,
          textAlign: "center",
          marginBottom: 18,
          cursor: "pointer",
          width: "100%",
        }}
      >
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
          {fileName ? fileName : "Fotoğraf seçin veya yükleyin"}
        </div>
        <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 4 }}>
          Net, iyi ışıklı bir kare en doğru sonucu verir.
        </div>
      </button>

      {/* Yara tipi seçimi */}
      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-heading)", marginBottom: 10 }}>
        Yara tipi
      </div>
      <div
        role="radiogroup"
        aria-label="Yara tipi"
        style={{ display: "flex", flexWrap: "wrap", gap: 9, marginBottom: 22 }}
      >
        {WOUND_OPTIONS.map((o) => {
          const active = woundType === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setWoundType(o.value)}
              style={{
                background: active ? "var(--primary)" : "#fff",
                color: active ? "#fff" : "var(--text-muted)",
                border: active ? "none" : "1px solid var(--card-border)",
                fontSize: 14,
                fontWeight: 700,
                padding: "9px 15px",
                borderRadius: "var(--radius-pill)",
                cursor: "pointer",
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div
          role="alert"
          style={{
            background: "var(--danger-bg)",
            color: "var(--danger)",
            fontSize: 14,
            fontWeight: 600,
            padding: "12px 16px",
            borderRadius: 12,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        style={{
          alignSelf: "flex-start",
          background: "var(--primary)",
          color: "#fff",
          fontSize: 16,
          fontWeight: 800,
          padding: "15px 28px",
          borderRadius: "var(--radius-pill)",
          border: "none",
          cursor: submitting ? "default" : "pointer",
          opacity: submitting ? 0.7 : 1,
        }}
      >
        {submitting ? "Gönderiliyor…" : "Hemşireye gönder"}
      </button>

      <p style={{ fontSize: 12, color: "var(--text-muted-alt)", marginTop: 14, maxWidth: 420 }}>
        Görselleriniz uçtan uca şifrelenir ve yalnızca size atanan hemşireniz görebilir.
        Yara Takibi uzaktan takip hizmetidir; acil tıbbi yardımın yerini tutmaz.
      </p>

      {/* Mobilde önizleme bloğu (masaüstünde sağ kolonda) */}
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
    </form>
  );
}

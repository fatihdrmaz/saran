"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlanStatus, trackingBadge } from "@saran/shared";
import { getSupabase } from "../../lib/supabase";
import { translateAuthError } from "../../lib/auth-helpers";
import { ErrorBox, primaryButtonStyle, secondaryButtonStyle } from "../../components/fields";
import {
  HealingBar,
  StatusBadge,
  WOUND_TYPE_LABELS,
  cardStyle,
  formatDate,
} from "../../components/account/shared";

/**
 * Hesabım — hastanın yaralarının LİSTESİ. Her yara bir kart; tıklayınca o
 * yaranın DOSYASINA (/hesabim/yara/[id]) gidilir; plan/ödeme, fotoğraflar ve
 * mesajlar yaranın içinde bir arada durur. README §6B/§7.
 */

type WoundRow = {
  id: string;
  type: import("@saran/shared").WoundType;
  region: string | null;
  created_at: string;
};

type PlanRow = { id: string; wound_id: string; status: string; created_at: string };

type SubmissionRow = { wound_id: string; healing_percent: number | null; created_at: string };

type AccountData = {
  wounds: WoundRow[];
  plans: PlanRow[];
  submissions: SubmissionRow[];
};

export function AccountView() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [data, setData] = useState<AccountData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const loadData = useCallback(async () => {
    const supabase = getSupabase();
    const [woundsRes, plansRes, subsRes] = await Promise.all([
      supabase
        .from("wounds")
        .select("id,type,region,created_at")
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("plans")
        .select("id,wound_id,status,created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("submissions")
        .select("wound_id,healing_percent,created_at")
        .order("created_at", { ascending: false }),
    ]);
    const firstErr = woundsRes.error ?? plansRes.error ?? subsRes.error;
    if (firstErr) {
      throw new Error(`Bilgileriniz yüklenemedi (${firstErr.message}). Lütfen sayfayı yenileyin.`);
    }
    setData({
      wounds: (woundsRes.data ?? []) as WoundRow[],
      plans: (plansRes.data ?? []) as PlanRow[],
      submissions: (subsRes.data ?? []) as SubmissionRow[],
    });
  }, []);

  // Oturum koruması + ilk yükleme.
  useEffect(() => {
    let mounted = true;
    let subscription: { unsubscribe(): void } | null = null;
    try {
      const supabase = getSupabase();
      supabase.auth
        .getSession()
        .then(({ data: sessionData }) => {
          if (!mounted) return;
          const u = sessionData.session?.user;
          if (!u) {
            router.replace("/giris");
            return;
          }
          const meta = (u.user_metadata ?? {}) as { full_name?: string };
          setDisplayName(meta.full_name || u.email || "Hesabınız");
          setUserId(u.id);
          loadData().catch((e) => {
            if (mounted) {
              setLoadError(e instanceof Error ? e.message : "Bilgileriniz yüklenemedi.");
            }
          });
        })
        .catch(() => {
          if (mounted) router.replace("/giris");
        });

      // NOT: callback SENKRON tutulur (await yok) — deadlock önlemi.
      const { data: authData } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) router.replace("/giris");
      });
      subscription = authData.subscription;
    } catch (e) {
      setLoadError(e instanceof Error ? translateAuthError(e.message) : "Bağlantı kurulamadı.");
    }
    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [router, loadData]);

  async function handleSignOut() {
    setSigningOut(true);
    try {
      await getSupabase().auth.signOut();
    } catch {
      // yoksay
    }
    router.replace("/");
  }

  /* ---- Yükleme / hata durumları ---- */
  if (!userId || (!data && !loadError)) {
    return (
      <section className="container" style={{ padding: "80px 24px", minHeight: 420 }}>
        <p style={{ fontSize: 16, color: "var(--text-muted)" }}>Hesabınız yükleniyor…</p>
      </section>
    );
  }

  if (loadError || !data) {
    return (
      <section className="container" style={{ padding: "64px 24px", minHeight: 420, maxWidth: 640 }}>
        <h1 style={{ fontSize: 30, fontWeight: 500, marginBottom: 16 }}>Hesabım</h1>
        <ErrorBox>{loadError ?? "Bilgileriniz yüklenemedi. Lütfen sayfayı yenileyin."}</ErrorBox>
      </section>
    );
  }

  const { wounds, plans, submissions } = data;

  // Yara başına en güncel plan (plans zaten created_at DESC sıralı).
  const latestPlanByWound = new Map<string, PlanRow>();
  for (const p of plans) {
    if (!latestPlanByWound.has(p.wound_id)) latestPlanByWound.set(p.wound_id, p);
  }
  // Yara başına en güncel gönderim.
  const latestSubmissionByWound = new Map<string, SubmissionRow>();
  for (const s of submissions) {
    if (!latestSubmissionByWound.has(s.wound_id)) latestSubmissionByWound.set(s.wound_id, s);
  }

  return (
    <section className="container" style={{ padding: "56px 24px 80px", maxWidth: 760 }}>
      {/* Üst şerit */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 8,
        }}
      >
        <h1 style={{ fontSize: 32, fontWeight: 500 }}>Merhaba, {displayName}</h1>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={signingOut}
          style={{
            ...secondaryButtonStyle,
            fontSize: 14,
            padding: "10px 18px",
            opacity: signingOut ? 0.7 : 1,
          }}
        >
          {signingOut ? "Çıkış yapılıyor…" : "Çıkış yap"}
        </button>
      </div>
      <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6 }}>
        Bir yaranın dosyasına girmek için karta dokunun; planı, ödemesi, fotoğrafları ve mesajları
        bir arada bulacaksınız.
      </p>

      <h2 style={{ fontSize: 22, fontWeight: 500, margin: "36px 0 14px" }}>Yaralarım</h2>
      {wounds.length === 0 ? (
        <div style={cardStyle}>
          <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6 }}>
            Henüz bir yara kaydınız yok. Ücretsiz değerlendirme ile ilk fotoğrafınızı gönderin;
            uzman hemşiremiz incelesin.
          </p>
          <div style={{ marginTop: 14 }}>
            <Link
              href="/degerlendirme"
              style={{
                ...primaryButtonStyle,
                display: "inline-block",
                textDecoration: "none",
                fontSize: 15,
                padding: "12px 24px",
              }}
            >
              Ücretsiz değerlendirme
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {wounds.map((wound) => {
            const plan = latestPlanByWound.get(wound.id) ?? null;
            const badge = trackingBadge((plan?.status ?? null) as PlanStatus | null);
            const lastSub = latestSubmissionByWound.get(wound.id) ?? null;
            return (
              <Link
                key={wound.id}
                href={`/hesabim/yara/${wound.id}`}
                style={{ ...cardStyle, display: "block", textDecoration: "none", color: "inherit" }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800, color: "var(--text-heading)" }}>
                      {WOUND_TYPE_LABELS[wound.type]}
                    </div>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
                      {wound.region ? `${wound.region} · ` : ""}
                      Kayıt: {formatDate(wound.created_at)}
                    </div>
                  </div>
                  <StatusBadge badge={badge} />
                </div>

                {lastSub && (
                  <div style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 12 }}>
                    Son gönderim: {formatDate(lastSub.created_at)}
                  </div>
                )}
                {lastSub?.healing_percent != null && <HealingBar percent={lastSub.healing_percent} />}

                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: "var(--primary)",
                    marginTop: 14,
                  }}
                >
                  Yara dosyasını aç →
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

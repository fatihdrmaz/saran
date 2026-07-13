"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlanStatus, trackingBadge } from "@saran/shared";
import { getSupabase } from "../../../../lib/supabase";
import { translateAuthError } from "../../../../lib/auth-helpers";
import { ErrorBox, InfoBox } from "../../../../components/fields";
import {
  StatusBadge,
  WOUND_TYPE_LABELS,
  formatDate,
  type PaymentRow,
  type PlanRow,
  type SubmissionRow,
  type WoundRow,
} from "../../../../components/account/shared";
import { PlanPaymentCard } from "../../../../components/account/PlanPaymentCard";
import { WoundPhotos } from "../../../../components/account/WoundPhotos";
import { WoundMessages } from "../../../../components/account/WoundMessages";

/**
 * /hesabim/yara/[id] — tek yaranın DOSYASI: bu yaranın planı & ödemesi,
 * fotoğrafları ve mesajları BİR ARADA. Oturum korumalı (RLS ile hastaya kısıtlı).
 */

type WoundFileData = {
  wound: WoundRow;
  plan: PlanRow | null;
  submissions: SubmissionRow[];
  payments: PaymentRow[];
  awaitingPlanIds: string[];
  /** Son havale bildirimi reddedilmiş planlar (yeniden bildirilebilir). */
  rejectedPlanIds: string[];
};

export function WoundFileView({ woundId }: { woundId: string }) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [data, setData] = useState<WoundFileData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [approveSuccess, setApproveSuccess] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const supabase = getSupabase();
    const [woundRes, plansRes, subsRes] = await Promise.all([
      supabase
        .from("wounds")
        .select("id,type,region,created_at")
        .eq("id", woundId)
        .is("deleted_at", null)
        .maybeSingle(),
      supabase
        .from("plans")
        .select(
          "id,wound_id,type,price_kurus,status,prognosis_note,started_at,ends_at,created_at,product:plan_products(title,duration_days)",
        )
        .eq("wound_id", woundId)
        .order("created_at", { ascending: false }),
      supabase
        .from("submissions")
        .select("id,wound_id,image_path,healing_percent,pain_level,patient_note,created_at")
        .eq("wound_id", woundId)
        .order("created_at", { ascending: false }),
    ]);

    const firstErr = woundRes.error ?? plansRes.error ?? subsRes.error;
    if (firstErr) {
      throw new Error(`Bilgileriniz yüklenemedi (${firstErr.message}). Lütfen sayfayı yenileyin.`);
    }
    if (!woundRes.data) {
      setNotFound(true);
      return;
    }

    const plans = (plansRes.data ?? []) as unknown as PlanRow[];
    const planIds = plans.map((p) => p.id);

    // Bu yaranın planlarına ait ödemeler (ödenmiş) + havale bildirimleri
    // (awaiting: doğrulama bekliyor / rejected: doğrulanamadı, yeniden bildirilebilir).
    let payments: PaymentRow[] = [];
    let awaitingPlanIds: string[] = [];
    let rejectedPlanIds: string[] = [];
    if (planIds.length > 0) {
      const [paysRes, pendingRes] = await Promise.all([
        supabase
          .from("payments")
          .select("id,plan_id,amount_kurus,vat_kurus,receipt_no,paid_at,created_at")
          .eq("status", "paid")
          .in("plan_id", planIds)
          .order("paid_at", { ascending: false }),
        supabase
          .from("payments")
          .select("plan_id,status")
          .in("status", ["awaiting_approval", "rejected"])
          .in("plan_id", planIds),
      ]);
      const payErr = paysRes.error ?? pendingRes.error;
      if (payErr) {
        throw new Error(`Ödemeleriniz yüklenemedi (${payErr.message}). Lütfen sayfayı yenileyin.`);
      }
      payments = (paysRes.data ?? []) as PaymentRow[];
      const pending = (pendingRes.data ?? []) as { plan_id: string | null; status: string }[];
      awaitingPlanIds = pending
        .filter((r) => r.status === "awaiting_approval")
        .map((r) => r.plan_id)
        .filter((v): v is string => v != null);
      rejectedPlanIds = pending
        .filter((r) => r.status === "rejected")
        .map((r) => r.plan_id)
        .filter((v): v is string => v != null);
    }

    setData({
      wound: woundRes.data as WoundRow,
      plan: plans[0] ?? null,
      submissions: (subsRes.data ?? []) as SubmissionRow[],
      payments,
      awaitingPlanIds,
      rejectedPlanIds,
    });
  }, [woundId]);

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

  async function handleApprove(planId: string) {
    setApproveError(null);
    setApproveSuccess(null);
    setApprovingId(planId);
    try {
      const { data: fnData, error: fnError } = await getSupabase().functions.invoke("approve-plan", {
        body: { planId },
      });
      if (fnError) {
        throw new Error(fnError.message || "Plan onaylanamadı.");
      }
      const body = fnData as { ok?: boolean; error?: string } | null;
      if (body?.error) {
        throw new Error(body.error);
      }
      setApproveSuccess(
        "Planınız onaylandı — takibiniz başladı. Yeni fotoğraflarınızı buradan gönderebilirsiniz.",
      );
      await loadData();
    } catch (e) {
      setApproveError(
        e instanceof Error
          ? `Plan onaylanamadı: ${e.message}`
          : "Plan onaylanamadı. Lütfen tekrar deneyin.",
      );
    } finally {
      setApprovingId(null);
    }
  }

  const backLink = (
    <Link
      href="/hesabim"
      style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)", textDecoration: "none" }}
    >
      ← Hesabım
    </Link>
  );

  /* ---- Yükleme / hata durumları ---- */
  if (!userId || (!data && !loadError && !notFound)) {
    return (
      <section className="container" style={{ padding: "80px 24px", minHeight: 420 }}>
        <p style={{ fontSize: 16, color: "var(--text-muted)" }}>Yara dosyanız yükleniyor…</p>
      </section>
    );
  }

  if (notFound) {
    return (
      <section className="container" style={{ padding: "64px 24px", minHeight: 420, maxWidth: 640 }}>
        <div style={{ marginBottom: 16 }}>{backLink}</div>
        <h1 style={{ fontSize: 30, fontWeight: 500, marginBottom: 16 }}>Yara bulunamadı</h1>
        <p style={{ fontSize: 15, color: "var(--text-muted)", lineHeight: 1.6 }}>
          Bu yara kaydına ulaşılamadı. Hesabım sayfasından yaralarınızı görüntüleyebilirsiniz.
        </p>
      </section>
    );
  }

  if (loadError || !data) {
    return (
      <section className="container" style={{ padding: "64px 24px", minHeight: 420, maxWidth: 640 }}>
        <div style={{ marginBottom: 16 }}>{backLink}</div>
        <h1 style={{ fontSize: 30, fontWeight: 500, marginBottom: 16 }}>Yara dosyası</h1>
        <ErrorBox>{loadError ?? "Bilgileriniz yüklenemedi. Lütfen sayfayı yenileyin."}</ErrorBox>
      </section>
    );
  }

  const { wound, plan, submissions, payments, awaitingPlanIds, rejectedPlanIds } = data;
  const badge = trackingBadge((plan?.status ?? null) as PlanStatus | null);
  const canUpload = plan?.status === PlanStatus.ACTIVE;
  const awaiting = plan ? awaitingPlanIds.includes(plan.id) : false;
  // Bekleyen bildirim yokken reddedilmiş kayıt varsa hasta yeniden bildirebilir.
  const rejected = plan ? !awaiting && rejectedPlanIds.includes(plan.id) : false;

  return (
    <section className="container" style={{ padding: "40px 24px 80px", maxWidth: 760 }}>
      <div style={{ marginBottom: 18 }}>{backLink}</div>

      {/* Başlık: yara tipi + bölge + durum rozeti */}
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
          <h1 style={{ fontSize: 30, fontWeight: 500, marginBottom: 4 }}>
            {WOUND_TYPE_LABELS[wound.type]}
          </h1>
          <div style={{ fontSize: 14, color: "var(--text-muted)" }}>
            {wound.region ? `${wound.region} · ` : ""}
            Kayıt: {formatDate(wound.created_at)}
          </div>
        </div>
        <StatusBadge badge={badge} />
      </div>

      {approveSuccess && (
        <div style={{ marginTop: 18 }}>
          <InfoBox>{approveSuccess}</InfoBox>
        </div>
      )}
      {approveError && (
        <div style={{ marginTop: 18 }}>
          <ErrorBox>{approveError}</ErrorBox>
        </div>
      )}

      <PlanPaymentCard
        plan={plan}
        userId={userId}
        awaiting={awaiting}
        rejected={rejected}
        approvingId={approvingId}
        payments={payments}
        onCreditCard={handleApprove}
        onNotified={() => {
          loadData().catch(() => {});
        }}
      />

      <WoundPhotos
        woundId={wound.id}
        submissions={submissions}
        canUpload={canUpload}
        onSubmitted={() => {
          loadData().catch(() => {});
        }}
      />

      <WoundMessages woundId={wound.id} userId={userId} />
    </section>
  );
}

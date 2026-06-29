"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlanStatus } from "@saran/shared";
import { PageHeader } from "../../../components/ui";
import { useAuth } from "../../../lib/auth";
import { fetchWoundByPatientId, type WoundCard } from "../../../lib/queries";
import { ActivePatient } from "./ActivePatient";

export default function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [wound, setWound] = useState<WoundCard | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetchWoundByPatientId(id)
      .then((w) => {
        if (!active) return;
        // Plan kapısı: aktif değilse değerlendirmeye yönlendir.
        if (!w || (w.latestPlan?.status as PlanStatus) !== PlanStatus.ACTIVE) {
          router.replace(`/hastalar/${id}/degerlendirme`);
          return;
        }
        setWound(w);
      })
      .catch((e) => active && setError(e.message ?? "Veri yüklenemedi"));
    return () => {
      active = false;
    };
  }, [user, id, router]);

  if (error)
    return (
      <>
        <PageHeader title="Hasta" />
        <div style={{ color: "var(--danger)", fontWeight: 600 }}>{error}</div>
      </>
    );
  if (!wound)
    return (
      <>
        <PageHeader title="Hasta" />
        <div style={{ color: "var(--text-muted)" }}>Yükleniyor…</div>
      </>
    );

  return <ActivePatient wound={wound} nurseId={user!.id} />;
}

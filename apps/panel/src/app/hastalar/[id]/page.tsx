"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "../../../components/ui";
import { useAuth } from "../../../lib/auth";
import { fetchPatientWounds, type WoundCard } from "../../../lib/queries";
import { ActivePatient } from "./ActivePatient";

export default function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [wounds, setWounds] = useState<WoundCard[] | undefined>(undefined);
  const [initialWoundId, setInitialWoundId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    // ?wound=<id> ile (Gelen kutusu "Hastaya git") ilgili yara seçili gelir.
    if (typeof window !== "undefined") {
      setInitialWoundId(new URLSearchParams(window.location.search).get("wound"));
    }
    fetchPatientWounds(id)
      .then((ws) => {
        if (!active) return;
        // Hastanın hiç yarası yoksa değerlendirmeye yönlendir.
        if (ws.length === 0) {
          router.replace(`/hastalar/${id}/degerlendirme`);
          return;
        }
        setWounds(ws);
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
  if (!wounds)
    return (
      <>
        <PageHeader title="Hasta" />
        <div style={{ color: "var(--text-muted)" }}>Yükleniyor…</div>
      </>
    );

  return (
    <ActivePatient
      wounds={wounds}
      nurseId={user!.id}
      initialWoundId={initialWoundId}
    />
  );
}

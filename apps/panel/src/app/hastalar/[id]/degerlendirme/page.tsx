"use client";

import { use, useEffect, useState } from "react";
import { PageHeader } from "../../../../components/ui";
import { useAuth } from "../../../../lib/auth";
import { fetchWoundByPatientId, type WoundCard } from "../../../../lib/queries";
import { AssessmentForm } from "./AssessmentForm";

export default function AssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const [wound, setWound] = useState<WoundCard | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    fetchWoundByPatientId(id)
      .then(setWound)
      .catch((e) => setError(e.message ?? "Veri yüklenemedi"));
  };

  useEffect(() => {
    if (!user) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, id]);

  if (error)
    return (
      <>
        <PageHeader title="Değerlendirme" />
        <div style={{ color: "var(--danger)", fontWeight: 600 }}>{error}</div>
      </>
    );
  if (wound === undefined)
    return (
      <>
        <PageHeader title="Değerlendirme" />
        <div style={{ color: "var(--text-muted)" }}>Yükleniyor…</div>
      </>
    );
  if (wound === null)
    return (
      <>
        <PageHeader title="Değerlendirme" />
        <div style={{ color: "var(--text-muted)" }}>Yara bulunamadı.</div>
      </>
    );

  return (
    <AssessmentForm
      wound={wound}
      nurseId={user!.id}
      onClaimed={load}
    />
  );
}

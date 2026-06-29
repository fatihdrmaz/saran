"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "../../components/ui";
import { useAuth } from "../../lib/auth";
import { fetchVisibleWounds, type WoundCard } from "../../lib/queries";
import { PatientsTable } from "./PatientsTable";

export default function PatientsPage() {
  const { user } = useAuth();
  const [wounds, setWounds] = useState<WoundCard[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetchVisibleWounds(user.id)
      .then((w) => active && setWounds(w))
      .catch((e) => active && setError(e.message ?? "Veri yüklenemedi"));
    return () => {
      active = false;
    };
  }, [user]);

  return (
    <>
      <PageHeader
        title="Hastalar"
        subtitle={
          wounds
            ? `${wounds.length} yara · Atanan + havuz · Satıra tıklayın: aktifse takip, değilse değerlendirme`
            : "Atanan + havuz yaraları"
        }
      />
      {error && (
        <div
          style={{
            background: "var(--warning-bg)",
            color: "var(--warning-text)",
            borderRadius: 12,
            padding: "12px 16px",
            marginBottom: 16,
            fontWeight: 600,
          }}
        >
          {error}
        </div>
      )}
      {wounds === null && !error ? (
        <div style={{ color: "var(--text-muted)" }}>Yükleniyor…</div>
      ) : (
        <PatientsTable wounds={wounds ?? []} />
      )}
    </>
  );
}

"use client";

import { use, useEffect, useState } from "react";
import type { Database } from "@saran/supabase";
import { PageHeader } from "../../../components/ui";
import { useAuth } from "../../../lib/auth";
import { fetchArticle } from "../../../lib/queries";
import { ArticleForm } from "../ArticleForm";

type ArticleRow = Database["public"]["Tables"]["articles"]["Row"];

export default function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const [article, setArticle] = useState<ArticleRow | null | undefined>(
    undefined,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetchArticle(id)
      .then((a) => active && setArticle(a))
      .catch((e) => active && setError(e?.message ?? "Makale yüklenemedi"));
    return () => {
      active = false;
    };
  }, [user, id]);

  if (error)
    return (
      <>
        <PageHeader title="Makale" />
        <div style={{ color: "var(--danger)", fontWeight: 600 }}>{error}</div>
      </>
    );
  if (article === undefined)
    return (
      <>
        <PageHeader title="Makale" />
        <div style={{ color: "var(--text-muted)" }}>Yükleniyor…</div>
      </>
    );
  if (article === null)
    return (
      <>
        <PageHeader title="Makale" />
        <div style={{ color: "var(--text-muted)" }}>Makale bulunamadı.</div>
      </>
    );

  return (
    <>
      <PageHeader
        title="Makaleyi düzenle"
        subtitle="İçeriği güncelleyin, yayınlayın/yayından kaldırın veya silin"
      />
      <ArticleForm existing={article} />
    </>
  );
}

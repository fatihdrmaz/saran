"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Database } from "@saran/supabase";
import { Card, Pill, StatusBadge } from "../../components/ui";
import { useAuth } from "../../lib/auth";
import { formatDate } from "../../lib/labels";
import { fetchAllArticles } from "../../lib/queries";

type ArticleRow = Database["public"]["Tables"]["articles"]["Row"];

const HEADERS = ["Başlık", "Kategori", "Durum", "Tarih"];

export function BlogList() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<ArticleRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetchAllArticles()
      .then((a) => active && setArticles(a))
      .catch((e) => active && setError(e?.message ?? "Makaleler yüklenemedi"));
    return () => {
      active = false;
    };
  }, [user]);

  if (error) return <div style={{ color: "var(--danger)" }}>{error}</div>;
  if (articles === null)
    return <div style={{ color: "var(--text-muted)" }}>Yükleniyor…</div>;
  if (articles.length === 0)
    return <div style={{ color: "var(--text-muted)" }}>Henüz makale yok.</div>;

  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
        <thead>
          <tr style={{ background: "var(--surface)", textAlign: "left" }}>
            {HEADERS.map((h) => (
              <th
                key={h}
                style={{
                  padding: "12px 16px",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "var(--text-muted)",
                  textTransform: "uppercase",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {articles.map((a) => {
            const published = a.published_at !== null;
            return (
              <tr key={a.id} style={{ borderTop: "1px solid var(--card-border)" }}>
                <td style={{ padding: "13px 16px" }}>
                  <Link
                    href={`/blog/${a.id}`}
                    style={{
                      fontWeight: 700,
                      color: "var(--text-heading)",
                    }}
                  >
                    {a.title}
                  </Link>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    /{a.slug}
                  </div>
                </td>
                <td style={{ padding: "13px 16px" }}>
                  <Pill bg="var(--surface-green)" fg="var(--primary)">
                    {a.category}
                  </Pill>
                </td>
                <td style={{ padding: "13px 16px" }}>
                  <StatusBadge
                    status={published ? "active" : "assessment"}
                    label={published ? "Yayında" : "Taslak"}
                  />
                </td>
                <td style={{ padding: "13px 16px", color: "var(--text-muted)" }}>
                  {formatDate(a.published_at ?? a.created_at)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

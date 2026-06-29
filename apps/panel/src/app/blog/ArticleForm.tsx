"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Database } from "@saran/supabase";
import { Button, Card } from "../../components/ui";
import { useAuth } from "../../lib/auth";
import {
  createArticle,
  deleteArticle,
  togglePublish,
  updateArticle,
} from "../../lib/queries";

type ArticleRow = Database["public"]["Tables"]["articles"]["Row"];

const labelStyle = {
  fontSize: 13,
  fontWeight: 700,
  color: "var(--text-heading)",
  marginBottom: 6,
  display: "block",
} as const;
const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid var(--card-border)",
  borderRadius: 10,
  background: "#fff",
} as const;

/** Başlıktan otomatik slug üret (tr karakterler sadeleştirilir). */
function slugify(s: string): string {
  return s
    .toLocaleLowerCase("tr")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function ArticleForm({ existing }: { existing?: ArticleRow }) {
  const router = useRouter();
  const { user } = useAuth();
  const editing = Boolean(existing);

  const [category, setCategory] = useState(existing?.category ?? "");
  const [title, setTitle] = useState(existing?.title ?? "");
  const [slug, setSlug] = useState(existing?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(editing);
  const [intro, setIntro] = useState(existing?.intro ?? "");
  const [body, setBody] = useState(existing?.body ?? "");
  const [readingMinutes, setReadingMinutes] = useState(
    String(existing?.reading_minutes ?? 4),
  );
  const [publishedAt, setPublishedAt] = useState<string | null>(
    existing?.published_at ?? null,
  );

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const published = publishedAt !== null;

  const onTitleChange = (v: string) => {
    setTitle(v);
    if (!slugTouched) setSlug(slugify(v));
  };

  const validate = (): string | null => {
    if (category.trim().length < 2) return "Kategori girin.";
    if (title.trim().length < 3) return "Başlık girin.";
    if (slug.trim().length < 2) return "Slug girin.";
    if (intro.trim().length < 3) return "Giriş (intro) girin.";
    if (body.trim().length < 3) return "Gövde metni girin.";
    if (!Number.isFinite(Number(readingMinutes)) || Number(readingMinutes) < 1)
      return "Okuma süresi (dk) geçerli olmalı.";
    return null;
  };

  const inputForSave = (overridePublishedAt?: string | null) => ({
    category: category.trim(),
    title: title.trim(),
    slug: slug.trim(),
    intro: intro.trim(),
    body: body.trim(),
    readingMinutes: Number(readingMinutes),
    publishedAt:
      overridePublishedAt !== undefined ? overridePublishedAt : publishedAt,
  });

  /** Yeni: taslak veya yayınla. Düzenleme: güncelle. */
  const save = async (publishNow: boolean) => {
    const v = validate();
    if (v) {
      setError(v);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (editing && existing) {
        await updateArticle(existing.id, inputForSave());
      } else {
        await createArticle({
          ...inputForSave(publishNow ? new Date().toISOString() : null),
          authorNurseId: user?.role === "admin" ? null : (user?.id ?? null),
        });
      }
      router.push("/blog");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Makale kaydedilemedi.");
    } finally {
      setBusy(false);
    }
  };

  /** Düzenleme: yayınla / yayından kaldır. */
  const onTogglePublish = async () => {
    if (!existing) return;
    setBusy(true);
    setError(null);
    try {
      const updated = await togglePublish(existing.id, !published);
      setPublishedAt(updated.published_at);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Durum değiştirilemedi.");
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (!existing) return;
    if (!window.confirm("Bu makale silinsin mi? Bu işlem geri alınamaz.")) return;
    setBusy(true);
    setError(null);
    try {
      await deleteArticle(existing.id);
      router.push("/blog");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Makale silinemedi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card style={{ maxWidth: 720, display: "grid", gap: 14 }}>
      <div style={{ display: "grid", gap: 14, gridTemplateColumns: "1fr 1fr" }}>
        <div>
          <label style={labelStyle}>Kategori</label>
          <input
            style={inputStyle}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="ör. Bası yarası"
          />
        </div>
        <div>
          <label style={labelStyle}>Okuma süresi (dk)</label>
          <input
            style={inputStyle}
            type="number"
            min={1}
            value={readingMinutes}
            onChange={(e) => setReadingMinutes(e.target.value)}
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>Başlık</label>
        <input
          style={inputStyle}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Makale başlığı"
        />
      </div>

      <div>
        <label style={labelStyle}>Slug</label>
        <input
          style={inputStyle}
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          placeholder="basligin-url-hali"
        />
      </div>

      <div>
        <label style={labelStyle}>Giriş (intro)</label>
        <textarea
          style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          placeholder="Kısa özet / giriş paragrafı"
        />
      </div>

      <div>
        <label style={labelStyle}>Gövde (Markdown)</label>
        <textarea
          style={{
            ...inputStyle,
            minHeight: 260,
            resize: "vertical",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
            fontSize: 13,
          }}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={"## Başlık\n\nMetin…\n\n> Alıntı"}
        />
        <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
          {"## "} ile başlık, {"> "} ile alıntı satırı ekleyebilirsiniz.
        </div>
      </div>

      {error && (
        <div style={{ color: "var(--danger)", fontSize: 13, fontWeight: 600 }}>
          {error}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 10,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {editing ? (
          <>
            <Button onClick={() => save(false)} disabled={busy}>
              {busy ? "Kaydediliyor…" : "Değişiklikleri kaydet"}
            </Button>
            <Button variant="secondary" onClick={onTogglePublish} disabled={busy}>
              {published ? "Yayından kaldır" : "Yayınla"}
            </Button>
            <Button
              variant="ghost"
              onClick={onDelete}
              disabled={busy}
              style={{ color: "var(--danger)", marginLeft: "auto" }}
            >
              Sil
            </Button>
          </>
        ) : (
          <>
            <Button onClick={() => save(true)} disabled={busy}>
              {busy ? "Kaydediliyor…" : "Yayınla"}
            </Button>
            <Button variant="secondary" onClick={() => save(false)} disabled={busy}>
              Taslak olarak kaydet
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}

"use client";

import { useEffect, useState } from "react";
import { CareTemplateCategory } from "@saran/shared";
import type { Database } from "@saran/supabase";
import { Button, Card, Pill } from "../../components/ui";
import { useAuth } from "../../lib/auth";
import { careCategoryLabel } from "../../lib/labels";
import {
  createTemplate,
  fetchTemplates,
} from "../../lib/queries";

type CareTemplateRow = Database["public"]["Tables"]["care_templates"]["Row"];

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

const CATEGORIES = Object.values(CareTemplateCategory);

export function Templates() {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<CareTemplateRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState<CareTemplateCategory>(
    CareTemplateCategory.PRESSURE,
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    fetchTemplates(user.id)
      .then((t) => active && setTemplates(t))
      .catch((e) => active && setError(e.message ?? "Veri yüklenemedi"));
    return () => {
      active = false;
    };
  }, [user]);

  const save = async () => {
    if (!user) return;
    if (title.trim().length < 2 || content.trim().length < 2) {
      setFormError("Başlık ve içerik girin.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const created = await createTemplate({
        nurseId: user.id,
        category,
        title: title.trim(),
        content: content.trim(),
      });
      setTemplates((prev) => [created, ...(prev ?? [])]);
      setTitle("");
      setContent("");
      setCategory(CareTemplateCategory.PRESSURE);
      setShowForm(false);
    } catch (e) {
      setFormError(
        e instanceof Error ? e.message : "Şablon kaydedilemedi",
      );
    } finally {
      setSaving(false);
    }
  };

  if (error) return <div style={{ color: "var(--danger)" }}>{error}</div>;
  if (templates === null)
    return <div style={{ color: "var(--text-muted)" }}>Yükleniyor…</div>;

  return (
    <>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <Button onClick={() => setShowForm((s) => !s)}>
          {showForm ? "Vazgeç" : "+ Yeni şablon"}
        </Button>
      </div>

      {showForm && (
        <Card style={{ marginBottom: 20, maxWidth: 620, display: "grid", gap: 14 }}>
          <div>
            <label style={labelStyle}>Kategori</label>
            <select
              style={inputStyle}
              value={category}
              onChange={(e) =>
                setCategory(e.target.value as CareTemplateCategory)
              }
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {careCategoryLabel[c]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Başlık</label>
            <input
              style={inputStyle}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ör. Bası yarası — günlük pansuman"
            />
          </div>
          <div>
            <label style={labelStyle}>İçerik</label>
            <textarea
              style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Bakım talimatı metni…"
            />
          </div>
          {formError && (
            <div style={{ color: "var(--danger)", fontSize: 13, fontWeight: 600 }}>
              {formError}
            </div>
          )}
          <div>
            <Button onClick={save} disabled={saving}>
              {saving ? "Kaydediliyor…" : "Şablonu kaydet"}
            </Button>
          </div>
        </Card>
      )}

      {templates.length === 0 ? (
        <div style={{ color: "var(--text-muted)" }}>Henüz şablon yok.</div>
      ) : (
        <div
          className="grid-cols-2"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 16,
          }}
        >
          {templates.map((t) => (
            <Card key={t.id} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Pill bg="var(--surface-green)" fg="var(--primary)">
                  {careCategoryLabel[t.category]}
                </Pill>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                  {t.nurse_id === null
                    ? "Global"
                    : `${t.usage_count} kez kullanıldı`}
                </span>
              </div>
              <h3 style={{ fontSize: 15.5, fontWeight: 800, color: "var(--text-heading)" }}>
                {t.title}
              </h3>
              <p style={{ fontSize: 13.5, color: "var(--text-body)", lineHeight: 1.5 }}>
                {t.content}
              </p>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

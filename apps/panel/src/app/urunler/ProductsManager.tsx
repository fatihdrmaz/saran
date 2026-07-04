"use client";

/**
 * ÜRÜN YÖNETİMİ (plan_products) — admin ekranı.
 * Fiyat girişi TL (ondalık serbest: 1500,50 / 1500.50), DB'ye kuruş integer yazılır.
 * RLS: herkes okur, yalnızca ADMIN yazar — admin olmayana nazik hata gösterilir.
 */
import { useEffect, useState } from "react";
import { PlanType } from "@saran/shared";
import { Button, Card, Pill } from "../../components/ui";
import { useAuth } from "../../lib/auth";
import { formatKurus, planTypeLabel } from "../../lib/labels";
import {
  createProduct,
  fetchProducts,
  updateProduct,
  type PlanProduct,
} from "../../lib/queries";

const ALL_CODES: PlanType[] = [
  PlanType.ONE_TIME,
  PlanType.WEEK_1,
  PlanType.WEEK_2,
  PlanType.WEEK_3,
  PlanType.MONTHLY,
];

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

/** Kuruş → TL input değeri ("150050" → "1500.50", tam TL ise ondalıksız). */
function kurusToTlInput(kurus: number): string {
  return kurus % 100 === 0 ? String(kurus / 100) : (kurus / 100).toFixed(2);
}

/** TL girişi ("1500,50" / "1500.50") → kuruş integer (150050). Geçersizse null. */
function tlToKurus(input: string): number | null {
  const normalized = input.trim().replace(/\s/g, "").replace(",", ".");
  if (!normalized) return null;
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

/** RLS yazma reddi vb. hataları kullanıcıya nazik biçimde çevir. */
function friendlyError(e: unknown): string {
  const msg = (e as Error)?.message ?? "";
  if (
    msg.includes("row-level security") ||
    msg.includes("violates row-level") ||
    msg.includes("0 rows") ||
    msg.includes("multiple (or no) rows")
  ) {
    return "Bu işlem için yönetici (admin) yetkisi gerekiyor.";
  }
  return msg || "İşlem başarısız oldu.";
}

interface EditState {
  title: string;
  description: string;
  durationDays: string;
  priceTl: string;
  active: boolean;
}

function ProductEditor({
  product,
  onSaved,
  onCancel,
}: {
  product: PlanProduct;
  onSaved: (p: PlanProduct) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<EditState>({
    title: product.title,
    description: product.description ?? "",
    durationDays: String(product.duration_days),
    priceTl: kurusToTlInput(product.price_kurus),
    active: product.active,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    const priceKurus = tlToKurus(form.priceTl);
    const durationDays = Number(form.durationDays);
    if (!form.title.trim()) {
      setError("Başlık zorunludur.");
      return;
    }
    if (priceKurus == null) {
      setError("Geçerli bir fiyat girin (₺, ondalık için virgül/nokta).");
      return;
    }
    if (!Number.isInteger(durationDays) || durationDays <= 0) {
      setError("Süre (gün) pozitif tam sayı olmalıdır.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const updated = await updateProduct(product.id, {
        title: form.title.trim(),
        description: form.description.trim() || null,
        durationDays,
        priceKurus,
        active: form.active,
      });
      onSaved(updated);
    } catch (e) {
      setError(friendlyError(e));
      setSaving(false);
    }
  };

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div className="split-2col" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12 }}>
        <div>
          <label style={labelStyle}>Başlık</label>
          <input
            style={inputStyle}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div>
          <label style={labelStyle}>Süre (gün)</label>
          <input
            type="number"
            min={1}
            style={inputStyle}
            value={form.durationDays}
            onChange={(e) => setForm({ ...form, durationDays: e.target.value })}
          />
        </div>
        <div>
          <label style={labelStyle}>Fiyat (₺)</label>
          <input
            inputMode="decimal"
            style={inputStyle}
            value={form.priceTl}
            onChange={(e) => setForm({ ...form, priceTl: e.target.value })}
            placeholder="ör. 1500.50"
          />
        </div>
      </div>
      <div>
        <label style={labelStyle}>Açıklama</label>
        <textarea
          style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <label
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          fontSize: 13.5,
          fontWeight: 700,
          color: "var(--text-heading)",
          cursor: "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={form.active}
          onChange={(e) => setForm({ ...form, active: e.target.checked })}
        />
        Aktif (hemşireler plan önerirken görür)
      </label>
      {error && (
        <div style={{ color: "var(--danger)", fontSize: 13, fontWeight: 600 }}>
          {error}
        </div>
      )}
      <div style={{ display: "flex", gap: 10 }}>
        <Button onClick={save} disabled={saving}>
          {saving ? "Kaydediliyor…" : "Kaydet"}
        </Button>
        <Button variant="ghost" onClick={onCancel} disabled={saving}>
          Vazgeç
        </Button>
      </div>
    </div>
  );
}

function NewProductForm({
  usedCodes,
  onCreated,
  onCancel,
  defaultSortOrder,
}: {
  usedCodes: PlanType[];
  onCreated: (p: PlanProduct) => void;
  onCancel: () => void;
  defaultSortOrder: number;
}) {
  const availableCodes = ALL_CODES.filter((c) => !usedCodes.includes(c));
  const [code, setCode] = useState<PlanType | "">(availableCodes[0] ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [durationDays, setDurationDays] = useState("");
  const [priceTl, setPriceTl] = useState("");
  const [sortOrder, setSortOrder] = useState(String(defaultSortOrder));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    const priceKurus = tlToKurus(priceTl);
    const duration = Number(durationDays);
    const sort = Number(sortOrder);
    if (!code) {
      setError("Kullanılabilir plan kodu kalmadı.");
      return;
    }
    if (!title.trim()) {
      setError("Başlık zorunludur.");
      return;
    }
    if (!Number.isInteger(duration) || duration <= 0) {
      setError("Süre (gün) pozitif tam sayı olmalıdır.");
      return;
    }
    if (priceKurus == null) {
      setError("Geçerli bir fiyat girin (₺, ondalık için virgül/nokta).");
      return;
    }
    if (!Number.isInteger(sort)) {
      setError("Sıra numarası tam sayı olmalıdır.");
      return;
    }
    setError(null);
    setSaving(true);
    try {
      const created = await createProduct({
        code,
        title: title.trim(),
        description: description.trim() || null,
        durationDays: duration,
        priceKurus,
        sortOrder: sort,
      });
      onCreated(created);
    } catch (e) {
      setError(friendlyError(e));
      setSaving(false);
    }
  };

  return (
    <Card style={{ marginTop: 16 }}>
      <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-heading)", marginBottom: 14 }}>
        Yeni ürün ekle
      </h2>
      {availableCodes.length === 0 ? (
        <p style={{ fontSize: 13.5, color: "var(--text-muted)" }}>
          Tüm plan kodları kullanımda — yeni ürün eklemek için önce bir kod
          boşalmalı.
        </p>
      ) : (
        <div style={{ display: "grid", gap: 12 }}>
          <div className="split-2col" style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Plan kodu</label>
              <select
                style={inputStyle}
                value={code}
                onChange={(e) => setCode(e.target.value as PlanType)}
              >
                {availableCodes.map((c) => (
                  <option key={c} value={c}>
                    {c} — {planTypeLabel[c]}
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
                placeholder="ör. Aylık Takip"
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Açıklama</label>
            <textarea
              style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ürünün kapsamı (opsiyonel)"
            />
          </div>
          <div className="split-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelStyle}>Süre (gün)</label>
              <input
                type="number"
                min={1}
                style={inputStyle}
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                placeholder="ör. 30"
              />
            </div>
            <div>
              <label style={labelStyle}>Fiyat (₺)</label>
              <input
                inputMode="decimal"
                style={inputStyle}
                value={priceTl}
                onChange={(e) => setPriceTl(e.target.value)}
                placeholder="ör. 5000"
              />
            </div>
            <div>
              <label style={labelStyle}>Sıra</label>
              <input
                type="number"
                style={inputStyle}
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              />
            </div>
          </div>
          {error && (
            <div style={{ color: "var(--danger)", fontSize: 13, fontWeight: 600 }}>
              {error}
            </div>
          )}
          <div style={{ display: "flex", gap: 10 }}>
            <Button onClick={save} disabled={saving}>
              {saving ? "Ekleniyor…" : "Ürünü ekle"}
            </Button>
            <Button variant="ghost" onClick={onCancel} disabled={saving}>
              Vazgeç
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export function ProductsManager() {
  const { user } = useAuth();
  const [products, setProducts] = useState<PlanProduct[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    if (!user) return;
    fetchProducts()
      .then(setProducts)
      .catch((e) => setError((e as Error).message ?? "Ürünler yüklenemedi"));
  }, [user]);

  const sortProducts = (list: PlanProduct[]) =>
    list
      .slice()
      .sort(
        (a, b) =>
          a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at),
      );

  if (error)
    return <div style={{ color: "var(--danger)", fontWeight: 600 }}>{error}</div>;
  if (products === null)
    return <div style={{ color: "var(--text-muted)" }}>Yükleniyor…</div>;

  return (
    <>
      {!isAdmin && (
        <div
          style={{
            background: "var(--warning-bg)",
            color: "var(--warning-text)",
            borderRadius: 12,
            padding: "12px 16px",
            marginBottom: 16,
            fontSize: 13.5,
            fontWeight: 600,
            lineHeight: 1.5,
          }}
        >
          Ürünleri yalnızca yöneticiler (admin) düzenleyebilir. Bu ekranda
          listeyi görüntüleyebilirsiniz.
        </div>
      )}

      <div style={{ display: "grid", gap: 12 }}>
        {products.length === 0 && (
          <Card>
            <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
              Henüz ürün tanımlı değil.
            </p>
          </Card>
        )}
        {products.map((p) => (
          <Card key={p.id}>
            {editingId === p.id ? (
              <ProductEditor
                product={p}
                onSaved={(updated) => {
                  setProducts((cur) =>
                    sortProducts(
                      (cur ?? []).map((x) => (x.id === updated.id ? updated : x)),
                    ),
                  );
                  setEditingId(null);
                }}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ minWidth: 220 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <span style={{ fontSize: 15.5, fontWeight: 800, color: "var(--text-heading)" }}>
                      {p.title}
                    </span>
                    <Pill bg="var(--surface)" fg="var(--text-muted)">
                      {p.code}
                    </Pill>
                    {p.active ? (
                      <Pill bg="var(--success-bg)" fg="var(--success-text)">
                        Aktif
                      </Pill>
                    ) : (
                      <Pill bg="var(--warning-bg)" fg="var(--warning-text)">
                        Pasif
                      </Pill>
                    )}
                  </div>
                  {p.description && (
                    <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 6, maxWidth: 520 }}>
                      {p.description}
                    </p>
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 22,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                      Süre
                    </div>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text-heading)" }}>
                      {p.duration_days} gün
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                      Fiyat
                    </div>
                    <div style={{ fontSize: 14.5, fontWeight: 800, color: "var(--primary)" }}>
                      {formatKurus(p.price_kurus)}
                    </div>
                  </div>
                  {isAdmin && (
                    <Button variant="secondary" onClick={() => setEditingId(p.id)}>
                      Düzenle
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {isAdmin &&
        (adding ? (
          <NewProductForm
            usedCodes={products.map((p) => p.code as PlanType)}
            defaultSortOrder={
              products.reduce((m, p) => Math.max(m, p.sort_order), 0) + 1
            }
            onCreated={(created) => {
              setProducts((cur) => sortProducts([...(cur ?? []), created]));
              setAdding(false);
            }}
            onCancel={() => setAdding(false)}
          />
        ) : (
          <div style={{ marginTop: 16 }}>
            <Button onClick={() => setAdding(true)}>+ Yeni ürün ekle</Button>
          </div>
        ))}
    </>
  );
}

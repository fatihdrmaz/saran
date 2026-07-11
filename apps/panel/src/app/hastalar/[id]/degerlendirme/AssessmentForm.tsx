"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { assessmentSchema } from "@saran/shared";
import {
  Button,
  Card,
  PageHeader,
  StatusBadge,
  WoundPhoto,
} from "../../../../components/ui";
import { LiveWoundPhoto } from "../../../../components/LiveWoundPhoto";
import {
  formatKurus,
  painLevelLabel,
  woundTypeLabel,
} from "../../../../lib/labels";
import {
  claimWound,
  createAssessmentAndPlan,
  fetchProducts,
  type PlanProduct,
  type WoundCard,
} from "../../../../lib/queries";

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

export function AssessmentForm({
  wound,
  nurseId,
  onClaimed,
}: {
  wound: WoundCard;
  nurseId: string;
  onClaimed: () => void;
}) {
  const router = useRouter();
  const [tissueType, setTissueType] = useState("");
  const [healingDays, setHealingDays] = useState("");
  const [prognosisNote, setPrognosisNote] = useState("");
  const [careInstruction, setCareInstruction] = useState("");
  const [products, setProducts] = useState<PlanProduct[] | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [claiming, setClaiming] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isMine = wound.assignedNurseId === nurseId;
  const isPool = wound.assignedNurseId === null;
  const submission = wound.lastSubmission;

  // Aktif ürünler (plan_products) — plan seçenekleri DB'den gelir.
  useEffect(() => {
    let mounted = true;
    fetchProducts(true)
      .then((list) => {
        if (!mounted) return;
        setProducts(list);
        // Varsayılan seçim: son ürün (en kapsamlı plan, sort_order sonuncusu).
        if (list.length > 0) {
          setSelectedProductId((cur) => cur ?? list[list.length - 1]!.id);
        }
      })
      .catch((e) => {
        if (mounted) setError((e as Error).message ?? "Ürünler yüklenemedi");
      });
    return () => {
      mounted = false;
    };
  }, []);

  const selectedProduct =
    products?.find((p) => p.id === selectedProductId) ?? null;

  const claim = async () => {
    setError(null);
    setClaiming(true);
    try {
      await claimWound(wound.woundId);
      onClaimed();
    } catch (e) {
      setError((e as Error).message ?? "Üstlenme başarısız");
    } finally {
      setClaiming(false);
    }
  };

  const submit = async () => {
    if (!submission) {
      setError("Bu yara için gönderim bulunamadı.");
      return;
    }
    if (!selectedProduct) {
      setError("Lütfen hastaya önerilecek bir plan seçin.");
      return;
    }
    const result = assessmentSchema.safeParse({
      submissionId: submission.id,
      tissueType: tissueType || undefined,
      estimatedHealingDays: healingDays ? Number(healingDays) : undefined,
      prognosisNote,
      careInstruction: careInstruction || undefined,
      proposedPlanType: selectedProduct.code,
    });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Form geçersiz");
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await createAssessmentAndPlan({
        submissionId: submission.id,
        nurseId,
        patientId: wound.patientId,
        woundId: wound.woundId,
        tissueType: tissueType || undefined,
        estimatedHealingDays: healingDays ? Number(healingDays) : undefined,
        prognosisNote,
        careInstruction: careInstruction || undefined,
        product: selectedProduct,
      });
      router.push(
        `/hastalar/${wound.patientId}/gonderildi?plan=${selectedProduct.code}`,
      );
    } catch (e) {
      setError((e as Error).message ?? "Kaydetme başarısız");
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader
        title={`${wound.patientName} · Değerlendirme`}
        subtitle={`${woundTypeLabel[wound.type]} · ${wound.region ?? "—"}${
          wound.age ? ` · ${wound.age} yaş` : ""
        }`}
        action={<StatusBadge status="assessment" />}
      />

      <div
        className="split-2col"
        style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 20, alignItems: "start" }}
      >
        {/* Gönderilen fotoğraf + hasta notu */}
        <Card>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-heading)", marginBottom: 12 }}>
            Gönderilen fotoğraf
          </h2>
          {/* Havuzdaki hemşire görseli AÇAMAZ — storage RLS yalnızca atanana imzalı URL verir. */}
          {submission ? (
            <LiveWoundPhoto imagePath={submission.image_path} height={240} />
          ) : (
            <WoundPhoto height={240} />
          )}
          {!isMine && (
            <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8, textAlign: "center" }}>
              Görseli yalnızca yarayı üstlenen hemşire netleştirebilir. Önce yarayı üstlenin.
            </p>
          )}

          {submission && (
            <div
              style={{
                marginTop: 16,
                background: "var(--surface)",
                border: "1px solid var(--card-border)",
                borderRadius: 12,
                padding: 14,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6 }}>
                HASTA NOTU
              </div>
              <p style={{ color: "var(--text-body)", lineHeight: 1.5 }}>
                {submission.patient_note ?? "—"}
              </p>
              <div style={{ marginTop: 10, fontSize: 13, color: "var(--text-muted)" }}>
                <strong>Ağrı:</strong> {painLevelLabel[submission.pain_level]}
                {submission.healing_percent != null && (
                  <>
                    {" · "}
                    <strong>İyileşme:</strong> %{submission.healing_percent}
                  </>
                )}
              </div>
            </div>
          )}

          {(wound.diagnoses.length > 0 || wound.allergies.length > 0) && (
            <div style={{ marginTop: 12, fontSize: 13, color: "var(--text-muted)" }}>
              {wound.diagnoses.length > 0 && (
                <>
                  <strong>Tanılar:</strong> {wound.diagnoses.join(", ")}
                </>
              )}
              {wound.allergies.length > 0 && (
                <>
                  <br />
                  <strong>Alerjiler:</strong> {wound.allergies.join(", ")}
                </>
              )}
            </div>
          )}
        </Card>

        {/* Değerlendirme formu / üstlen akışı */}
        <Card>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: "var(--text-heading)", marginBottom: 16 }}>
            Değerlendirme & plan önerisi
          </h2>

          {isPool ? (
            <div>
              <div
                style={{
                  background: "var(--warning-bg)",
                  color: "var(--warning-text)",
                  borderRadius: 12,
                  padding: "14px 16px",
                  marginBottom: 16,
                  fontWeight: 600,
                  lineHeight: 1.5,
                }}
              >
                Bu yara havuzda. Değerlendirme yapabilmek için önce üstlenmelisiniz.
                Üstlendiğinizde sohbet açılır ve yara yalnızca size kilitlenir.
              </div>
              {error && (
                <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12, fontWeight: 600 }}>
                  {error}
                </div>
              )}
              <Button onClick={claim} disabled={claiming} style={{ width: "100%" }}>
                {claiming ? "Üstleniliyor…" : "Bu yarayı üstlen"}
              </Button>
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Yara durumu / doku tipi</label>
                <input
                  style={inputStyle}
                  value={tissueType}
                  onChange={(e) => setTissueType(e.target.value)}
                  placeholder="ör. Granülasyon dokusu, enfeksiyon belirtisi yok"
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Tahmini iyileşme süresi (gün)</label>
                <input
                  type="number"
                  style={inputStyle}
                  value={healingDays}
                  onChange={(e) => setHealingDays(e.target.value)}
                  placeholder="ör. 30"
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>Öngörü notu *</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
                  value={prognosisNote}
                  onChange={(e) => setPrognosisNote(e.target.value)}
                  placeholder="Evre + tahmini süre + genel öngörü..."
                />
              </div>

              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>Bakım talimatı (opsiyonel)</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
                  value={careInstruction}
                  onChange={(e) => setCareInstruction(e.target.value)}
                  placeholder="Pansuman önerisi, sıklık..."
                />
              </div>

              <label style={labelStyle}>Hastaya önerilecek plan</label>
              {products === null ? (
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
                  Planlar yükleniyor…
                </div>
              ) : products.length === 0 ? (
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
                  Aktif plan ürünü bulunamadı. Lütfen yöneticinizle iletişime geçin.
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${Math.min(products.length, 3)}, 1fr)`,
                    gap: 10,
                    marginBottom: 16,
                  }}
                >
                  {products.map((p) => {
                    const active = selectedProductId === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => setSelectedProductId(p.id)}
                        style={{
                          textAlign: "left",
                          border: `2px solid ${active ? "var(--primary)" : "var(--card-border)"}`,
                          background: active ? "var(--surface-green)" : "#fff",
                          borderRadius: 12,
                          padding: "12px 14px",
                        }}
                      >
                        <div style={{ fontWeight: 800, color: "var(--text-heading)", fontSize: 13.5 }}>
                          {p.title}
                        </div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                          {p.duration_days} gün
                        </div>
                        <div style={{ fontWeight: 800, color: "var(--primary)", marginTop: 6 }}>
                          {formatKurus(p.price_kurus)}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {error && (
                <div style={{ color: "var(--danger)", fontSize: 13, marginBottom: 12, fontWeight: 600 }}>
                  {error}
                </div>
              )}

              <Button onClick={submit} disabled={submitting} style={{ width: "100%" }}>
                {submitting ? "Gönderiliyor…" : "Planı hastaya gönder"}
              </Button>
              <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 10, textAlign: "center" }}>
                Hasta onaylamadan takip akışı açılmaz, ücret alınmaz.
              </p>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
